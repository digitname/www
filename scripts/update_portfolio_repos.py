#!/usr/bin/env python3
"""
Script to update portfolio repositories from various sources (GitHub, GitLab, npm, PyPI)
based on accounts configured in .env file.
"""

import os
import json
import sys
import time
import re
import subprocess
import requests
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlencode
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional, Tuple, Union

# Load environment variables
load_dotenv()

# Configuration
PORTFOLIO_DIR = Path(__file__).parent.parent / "portfolio"
CACHE_DIR = PORTFOLIO_DIR / "cache"
PORTFOLIO_JSON = PORTFOLIO_DIR / "portfolio.json"

# Create necessary directories
PORTFOLIO_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

# API configurations
APIS = {
    "github": {
        "base_url": "https://api.github.com",
        "username_env": "GITHUB_USERNAME",
        "token_env": "GITHUB_TOKEN",
        "endpoint": "/users/{username}/repos?per_page=100&sort=updated&type=owner",
        "auth_header": "token {token}",
        "enabled": True
    },
    "gitlab": {
        "base_url": "https://gitlab.com/api/v4",
        "username_env": "GITLAB_USERNAME",
        "token_env": "GITLAB_TOKEN",
        "endpoint": "/users?username={username}",
        "projects_endpoint": "/users/{user_id}/projects?per_page=100&order_by=last_activity_at",
        "auth_header": "Bearer {token}",
        "enabled": True
    },
    "npm": {
        "base_url": "https://registry.npmjs.org",
        "username_env": "NPM_USERNAME",
        "endpoint": "/-/user/{username}/packages",
        "enabled": True
    },
    "pypi": {
        "base_url": "https://pypi.org/pypi",
        "username_env": "PYPI_USERNAME",
        "endpoint": "/{package_name}/json",
        "search_endpoint": "https://pypi.org/search/?q=author%3A{username}",
        "enabled": True
    },
    "dockerhub": {
        "base_url": "https://hub.docker.com/v2",
        "username_env": "DOCKERHUB_USERNAME",
        "endpoint": "/repositories/{username}",
        "enabled": True
    },
    "huggingface": {
        "base_url": "https://huggingface.co/api",
        "username_env": "HUGGINGFACE_USERNAME",
        "endpoint": "/models?author={username}",
        "auth_header": "Bearer {token}",
        "enabled": True
    },
    "packagist": {
        "base_url": "https://packagist.org",
        "username_env": "PACKAGIST_USERNAME",
        "endpoint": "/users/{username}/packages.json",
        "enabled": True
    }
}

class PortfolioUpdater:
    def __init__(self):
        self.portfolio_data = self._load_portfolio()
        self.updated = False

    def _load_portfolio(self) -> Dict[str, Any]:
        """Load existing portfolio data or create a new one."""
        if PORTFOLIO_JSON.exists():
            with open(PORTFOLIO_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "last_updated": "",
            "repositories": {},
            "metadata": {}
        }

    def _save_portfolio(self):
        """Save the portfolio data to JSON files, with separate files for each account type."""
        os.makedirs(os.path.dirname(PORTFOLIO_JSON), exist_ok=True)
        
        # Save the main portfolio file
        with open(PORTFOLIO_JSON, 'w', encoding='utf-8') as f:
            json.dump(self.portfolio_data, f, indent=2)
        print(f"✅ Main portfolio updated and saved to {PORTFOLIO_JSON}")
        
        # Save separate files for each account type
        if 'projects' in self.portfolio_data:
            projects_by_source = {}
            
            # Group projects by source
            for project in self.portfolio_data['projects']:
                source = project.get('source')
                if source not in projects_by_source:
                    projects_by_source[source] = []
                projects_by_source[source].append(project)
            
            # Save each source to a separate file
            for source, projects in projects_by_source.items():
                if not source:
                    continue
                    
                # Create a clean data structure for this source
                source_data = {
                    'source': source,
                    'last_updated': self.portfolio_data.get('last_updated'),
                    'projects': projects,
                    'stats': {
                        'total_projects': len(projects)
                    }
                }
                
                # Save to a separate file
                source_filename = f"portfolio_{source.lower().replace(' ', '_')}.json"
                source_path = os.path.join(os.path.dirname(PORTFOLIO_JSON), source_filename)
                
                with open(source_path, 'w', encoding='utf-8') as f:
                    json.dump(source_data, f, indent=2)
                print(f"✅ {source} portfolio saved to {source_path}")

    def _make_api_request(self, url: str, headers: Optional[Dict] = None, method: str = 'GET', 
                         data: Optional[Dict] = None, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make an HTTP request to the specified URL with error handling and rate limiting."""
        try:
            headers = headers or {}
            
            # Add default headers if not present
            if 'User-Agent' not in headers:
                headers['User-Agent'] = 'PortfolioUpdater/1.0 (https://github.com/tom-sapletta-com/portfolio)'
            
            if 'Accept' not in headers:
                headers['Accept'] = 'application/json'
            
            # Make the request
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params,
                timeout=15
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"⚠️  Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after + 1)
                return self._make_api_request(url, headers, method, data, params)
                
            response.raise_for_status()
            
            # Handle different content types
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                return response.json()
            elif 'text/html' in content_type:
                return {'html': response.text}
            else:
                return {'content': response.text}
                
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                print(f"🔍 Resource not found: {url}")
            elif e.response.status_code == 403:
                print(f"🔒 Access forbidden. Check your API token: {url}")
            else:
                print(f"❌ HTTP Error {e.response.status_code} for {url}: {e}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Error making request to {url}: {e}")
        except Exception as e:
            print(f"❌ Unexpected error for {url}: {e}")
            
        return None

    def _get_github_repos(self) -> List[Dict]:
        """Fetch repositories from GitHub."""
        config = APIS["github"]
        username = os.getenv(config["username_env"])
        token = os.getenv(config["token_env"])
        
        if not username:
            print("⚠️  GitHub username not found in .env")
            return []
            
        url = f"{config['base_url']}{config['endpoint'].format(username=username)}"
        headers = {"Authorization": f"token {token}"} if token else {}
        
        print(f"🔍 Fetching GitHub repositories for {username}...")
        repos = self._make_api_request(url, headers) or []
        return [{
            "name": repo["name"],
            "full_name": repo["full_name"],
            "description": repo.get("description", ""),
            "url": repo["html_url"],
            "language": repo.get("language"),
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "updated_at": repo["updated_at"],
            "source": "github"
        } for repo in repos if not repo.get("fork", False)]

    def _get_gitlab_repos(self) -> List[Dict]:
        """Fetch repositories from GitLab."""
        config = APIS["gitlab"]
        username = os.getenv(config["username_env"])
        token = os.getenv(config["token_env"])
        
        if not username:
            print("⚠️  GitLab username not found in .env")
            return []
            
        url = f"{config['base_url']}{config['endpoint'].format(username=username)}"
        headers = {"PRIVATE-TOKEN": token} if token else {}
        
        print(f"🔍 Fetching GitLab repositories for {username}...")
        repos = self._make_api_request(url, headers) or []
        return [{
            "name": repo["name"],
            "full_name": repo["path_with_namespace"],
            "description": repo.get("description", ""),
            "url": repo["web_url"],
            "language": repo.get("language"),
            "stars": repo.get("star_count", 0),
            "forks": repo.get("forks_count", 0),
            "updated_at": repo["last_activity_at"],
            "source": "gitlab"
        } for repo in repos if not repo.get("forked_from_project")]

    def _get_npm_packages(self) -> List[Dict]:
        """Fetch packages from npm registry."""
        config = APIS["npm"]
        username = os.getenv(config["username_env"])
        
        if not username:
            print("⚠️  npm username not found in .env")
            return []
            
        # Note: npm registry doesn't have a direct endpoint to list packages by user
        # This is a workaround using the npm CLI
        try:
            print(f"🔍 Fetching npm packages for {username}...")
            result = subprocess.run(
                ["npm", "search", f"maintainer:{username}", "--json"],
                capture_output=True,
                text=True,
                timeout=30
            )
            packages = json.loads(result.stdout) if result.stdout else []
            
            return [{
                "name": pkg["name"],
                "full_name": pkg["name"],
                "description": pkg.get("description", ""),
                "url": f"https://www.npmjs.com/package/{pkg['name']}",
                "version": pkg.get("version", ""),
                "downloads": pkg.get("downloads", 0),
                "updated_at": datetime.utcnow().isoformat(),
                "source": "npm"
            } for pkg in packages if isinstance(pkg, dict)]
            
        except (subprocess.SubprocessError, json.JSONDecodeError) as e:
            print(f"❌ Error fetching npm packages: {e}")
            return []

    def _get_pypi_packages(self) -> List[Dict]:
        """Fetch packages from PyPI."""
        config = APIS["pypi"]
        username = os.getenv(config["username_env"])
        
        if not username:
            print("⚠️  PyPI username not found in .env")
            return []
            
        # Note: PyPI doesn't have a direct endpoint to list packages by user
        # This is a workaround using the PyPI simple API
        try:
            print(f"🔍 Fetching PyPI packages for {username}...")
            response = requests.get(
                f"https://pypi.org/simple/?q=author%3A{username}",
                headers={"Accept": "application/vnd.pypi.simple.v1+json"},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            packages = []
            for package in data.get("results", []):
                pkg_name = package["name"]
                pkg_url = f"https://pypi.org/pypi/{pkg_name}/json"
                pkg_data = self._make_api_request(pkg_url)
                
                if pkg_data and pkg_data.get("info", {}).get("author") == username:
                    info = pkg_data["info"]
                    releases = pkg_data.get("releases", {})
                    latest_release = max(releases.keys()) if releases else ""
                    
                    packages.append({
                        "name": pkg_name,
                        "full_name": pkg_name,
                        "description": info.get("summary", ""),
                        "url": info.get("package_url", f"https://pypi.org/project/{pkg_name}/"),
                        "version": info.get("version", ""),
                        "downloads": info.get("downloads", {}).get("last_month", 0),
                        "created_at": info.get("release_url", "").split("/")[-2] if info.get("release_url") else "",
                        "updated_at": latest_release,
                        "source": "pypi"
                    })
            
            return packages
            
        except requests.RequestException as e:
            print(f"❌ Error fetching PyPI packages: {e}")
            return []
    
    def _get_dockerhub_repos(self) -> List[Dict]:
        """Fetch repositories from Docker Hub."""
        config = APIS["dockerhub"]
        username = os.getenv(config["username_env"])
        
        if not username:
            print("⚠️  Docker Hub username not found in .env")
            return []
            
        try:
            print(f"🔍 Fetching Docker Hub repositories for {username}...")
            url = f"{config['base_url']}{config['endpoint'].format(username=username)}"
            
            # Docker Hub API is paginated, so we need to handle pagination
            all_repos = []
            next_url = f"{url}?page=1&page_size=100"
            
            while next_url:
                response = requests.get(next_url, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                all_repos.extend(data.get("results", []))
                next_url = data.get("next")
            
            return [{
                "name": repo["name"],
                "full_name": f"{username}/{repo['name']}",
                "description": repo.get("description", ""),
                "url": f"https://hub.docker.com/r/{username}/{repo['name']}",
                "stars": repo.get("star_count", 0),
                "pulls": repo.get("pull_count", 0),
                "created_at": repo.get("last_updated", ""),
                "updated_at": repo.get("last_updated", ""),
                "source": "dockerhub"
            } for repo in all_repos]
            
        except requests.RequestException as e:
            print(f"❌ Error fetching Docker Hub repositories: {e}")
            return []
    
    def _get_huggingface_models(self) -> List[Dict]:
        """Fetch models from Hugging Face."""
        config = APIS["huggingface"]
        username = os.getenv(config["username_env"])
        token = os.getenv("HUGGINGFACE_TOKEN")
        
        if not username:
            print("⚠️  Hugging Face username not found in .env")
            return []
            
        try:
            print(f"🔍 Fetching Hugging Face models for {username}...")
            url = f"{config['base_url']}{config['endpoint'].format(username=username)}"
            headers = {"Authorization": config["auth_header"].format(token=token)} if token else {}
            
            models = self._make_api_request(url, headers) or []
            
            return [{
                "name": model["modelId"].split("/")[-1],
                "full_name": model["modelId"],
                "description": model.get("pipeline_tag", ""),
                "url": f"https://huggingface.co/{model['modelId']}",
                "downloads": model.get("downloads", 0),
                "likes": model.get("likes", 0),
                "created_at": "",
                "updated_at": model.get("lastModified", ""),
                "source": "huggingface"
            } for model in models if isinstance(model, dict)]
            
        except Exception as e:
            print(f"❌ Error fetching Hugging Face models: {e}")
            return []
    
    def _get_packagist_packages(self) -> List[Dict]:
        """Fetch packages from Packagist (PHP)."""
        config = APIS["packagist"]
        username = os.getenv(config["username_env"])
        
        if not username:
            print("⚠️  Packagist username not found in .env")
            return []
        
        try:
            print(f"🔍 Fetching Packagist packages for {username}...")
            url = f"{config['base_url']}/users/{username}/packages.json"
            data = self._make_api_request(url)
            
            if not data or "packageNames" not in data:
                print("ℹ️  No packages found or invalid response from Packagist")
                return []
            
            packages = []
            for package_name in data["packageNames"]:
                try:
                    # Fetch detailed package information
                    pkg_url = f"{config['base_url']}/packages/{package_name}.json"
                    pkg_data = self._make_api_request(pkg_url)
                    
                    if not pkg_data or "package" not in pkg_data:
                        continue
                        
                    pkg_info = pkg_data["package"]
                    versions = pkg_info.get("versions", {})
                    latest_version = next(iter(versions.values()), {}) if versions else {}
                    
                    # Get repository URL from package data
                    repo_url = ""
                    if "repository" in pkg_info:
                        repo_url = pkg_info["repository"]
                    elif "source" in latest_version and isinstance(latest_version["source"], dict):
                        repo_url = latest_version["source"].get("url", "")
                    
                    # Format package data
                    package = {
                        "name": package_name.split('/')[-1],
                        "full_name": package_name,
                        "description": pkg_info.get("description", ""),
                        "url": f"https://packagist.org/packages/{package_name}",
                        "repository_url": repo_url,
                        "version": next(iter(versions.keys()), ""),
                        "downloads": pkg_info.get("downloads", {}).get("total", 0),
                        "favers": pkg_info.get("favers", 0),
                        "created_at": "",
                        "updated_at": latest_version.get("time", ""),
                        "source": "packagist",
                        "language": "PHP",
                        "topics": pkg_info.get("keywords", []) if isinstance(pkg_info.get("keywords"), list) else [],
                        "license": latest_version.get("license", [])
                    }
                    packages.append(package)
                    
                except Exception as pkg_error:
                    print(f"⚠️  Error processing package {package_name}: {pkg_error}")
                    continue
            
            print(f"✅ Found {len(packages)} Packagist packages")
            return packages
            
        except Exception as e:
            print(f"❌ Error fetching Packagist packages: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def update_repositories(self):
        """Update repositories from all sources."""
        self.portfolio_data["last_updated"] = datetime.utcnow().isoformat()
        
        # Get repositories from all enabled sources
        all_projects = []
        stats = {
            "total_projects": 0,
            "sources": {}
        }
        
        # Define the order of sources to process
        sources = [
            ("GitHub", self._get_github_repos),
            ("GitLab", self._get_gitlab_repos),
            ("npm", self._get_npm_packages),
            ("PyPI", self._get_pypi_packages),
            ("Docker Hub", self._get_dockerhub_repos),
            ("Hugging Face", self._get_huggingface_models),
            ("Packagist", self._get_packagist_packages)
        ]
        
        print("\n🚀 Starting portfolio update...")
        print("=" * 50)
        
        for source_name, fetch_func in sources:
            try:
                print(f"\n🔄 Fetching {source_name} projects...")
                projects = fetch_func()
                if projects:
                    all_projects.extend(projects)
                    stats["sources"][source_name.lower().replace(" ", "_")] = len(projects)
                    print(f"✅ Found {len(projects)} {source_name} projects")
                else:
                    print(f"ℹ️  No {source_name} projects found or error occurred")
            except Exception as e:
                print(f"❌ Error fetching {source_name} projects: {e}")
        
        # Update stats
        stats["total_projects"] = len(all_projects)
        
        # Sort projects by update date (newest first)
        all_projects.sort(
            key=lambda x: x.get("updated_at", x.get("created_at", "")),
            reverse=True
        )
        
        # Update the portfolio data
        self.portfolio_data["projects"] = all_projects
        self.portfolio_data["stats"] = stats
        
        # Save the updated portfolio
        self._save_portfolio()
        
        print("\n" + "=" * 50)
        print(f"🎉 Portfolio update complete! Found {len(all_projects)} projects across {len(stats['sources'])} sources")


def generate_user_portal_data(portfolio_data):
    """Generate separate JSON data for each user portal account."""
    accounts = {}
    
    # Group projects by username/account
    for project in portfolio_data.get('projects', []):
        source = project.get('source', '').lower()
        username = ''
        
        # Extract username based on source
        if source == 'github':
            username = os.getenv('GITHUB_USERNAME', '')
        elif source == 'gitlab':
            username = os.getenv('GITLAB_USERNAME', '')
        elif source == 'npm':
            username = os.getenv('NPM_USERNAME', '')
        elif source == 'pypi':
            username = os.getenv('PYPI_USERNAME', '')
        elif source == 'dockerhub':
            username = os.getenv('DOCKERHUB_USERNAME', '')
        elif source == 'huggingface':
            username = os.getenv('HUGGINGFACE_USERNAME', '')
        elif source == 'packagist':
            username = os.getenv('PACKAGIST_USERNAME', '')
        
        if not username:
            continue
            
        if username not in accounts:
            accounts[username] = {
                'username': username,
                'sources': {},
                'projects': []
            }
            
        # Add source if not exists
        if source not in accounts[username]['sources']:
            accounts[username]['sources'][source] = 0
        accounts[username]['sources'][source] += 1
        
        # Add project
        accounts[username]['projects'].append(project)
    
    return accounts

def save_user_portal_data(accounts, output_dir):
    """Save user portal data to separate JSON files."""
    os.makedirs(output_dir, exist_ok=True)
    
    for username, data in accounts.items():
        # Create a clean data structure for this user
        user_data = {
            'username': username,
            'last_updated': datetime.utcnow().isoformat(),
            'sources': data['sources'],
            'projects': data['projects'],
            'stats': {
                'total_projects': len(data['projects']),
                'sources': data['sources']
            }
        }
        
        # Save to file
        filename = f"user_{username.lower().replace('.', '_')}_portfolio.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, indent=2)
        print(f"✅ User portfolio saved for {username} to {filepath}")

def main():
    """Main function to update the portfolio."""
    try:
        start_time = time.time()
        
        print("\n" + "=" * 50)
        print("🚀 DigitName Portfolio Updater")
        print("=" * 50)
        
        # Initialize and run the updater
        updater = PortfolioUpdater()
        updater.update_repositories()
        
        # Generate user portal data
        print("\n🔧 Generating user portal data...")
        accounts = generate_user_portal_data(updater.portfolio_data)
        
        # Save user portal data
        output_dir = os.path.join(os.path.dirname(PORTFOLIO_JSON), 'user_portals')
        save_user_portal_data(accounts, output_dir)
        
        # Calculate and display execution time
        elapsed_time = time.time() - start_time
        print(f"\n⏱️  Completed in {elapsed_time:.2f} seconds")
        print("=" * 50 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n🛑 Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
