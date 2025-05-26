"""
Portfolio generation module for DigitName.

Handles the creation of portfolio based on user's development accounts.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from jinja2 import Environment, FileSystemLoader, select_autoescape


class PortfolioGenerator:
    """Generates a portfolio website based on development accounts."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize the portfolio generator with configuration.
        
        Args:
            config: Dictionary containing portfolio configuration.
        """
        self.config = config
        self.template_dir = Path(__file__).parent / "templates"
        self.output_dir = Path(config.get("output_dir", "portfolio")).resolve()
        self.template_name = config.get("template", "default")
        self.theme = config.get("theme", {})
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(self.template_dir / self.template_name),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Add datetime format filter
        def datetimeformat(value, format='%Y-%m-%d'):
            if not value:
                return ''
            from datetime import datetime
            try:
                # Parse ISO 8601 format
                dt = datetime.strptime(value, '%Y-%m-%dT%H:%M:%SZ')
                return dt.strftime(format)
            except (ValueError, TypeError):
                return value
                
        self.env.filters['datetimeformat'] = datetimeformat

    def _fetch_github_orgs(self, username: str) -> List[Dict[str, Any]]:
        """Fetch organizations for a GitHub user."""
        try:
            import requests
            url = f"https://api.github.com/users/{username}/orgs"
            response = requests.get(url, headers={"Accept": "application/vnd.github.v3+json"})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching GitHub organizations: {e}")
            return []

    def _fetch_github_repos(self, url: str, owner: str) -> List[Dict[str, Any]]:
        """Fetch repositories from a GitHub user or organization."""
        try:
            import requests
            response = requests.get(f"{url}?sort=updated&per_page=100", 
                                 headers={"Accept": "application/vnd.github.v3+json"})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching GitHub repositories from {url}: {e}")
            return []

    def _process_github_repo(self, repo: Dict[str, Any], owner_type: str = 'user') -> Dict[str, Any]:
        """Process a single GitHub repository into our format."""
        return {
            'name': repo['name'],
            'owner': repo['owner']['login'],
            'owner_type': owner_type,
            'description': (repo['description'] or 'No description').split('.')[0] + '.',
            'url': repo['html_url'],
            'language': repo['language'] or 'Other',
            'stars': repo['stargazers_count'],
            'forks': repo['forks_count'],
            'updated_at': repo['updated_at'],
            'provider': 'GitHub',
            'is_fork': repo['fork']
        }

    def _fetch_github_projects(self, username: str) -> List[Dict[str, Any]]:
        """Fetch all projects from GitHub including user and organization repos."""
        try:
            import requests
            projects = []
            
            # Fetch user's personal repositories
            user_repos = self._fetch_github_repos(
                f"https://api.github.com/users/{username}/repos",
                'user'
            )
            projects.extend([self._process_github_repo(repo, 'user') for repo in user_repos])
            
            # Fetch organizations and their repositories
            orgs = self._fetch_github_orgs(username)
            for org in orgs:
                org_repos = self._fetch_github_repos(
                    f"https://api.github.com/orgs/{org['login']}/repos",
                    'organization'
                )
                projects.extend([self._process_github_repo(repo, 'organization') for repo in org_repos])
            
            return projects
            
        except Exception as e:
            print(f"Error in GitHub projects fetch: {e}")
            return []

    def _fetch_npm_projects(self, username: str) -> List[Dict[str, Any]]:
        """Fetch packages from NPM."""
        try:
            import requests
            # First, get the list of packages
            url = f"https://registry.npmjs.org/-/user/org.couchdb.user:{username}/package"
            response = requests.get(url)
            response.raise_for_status()
            
            packages = []
            # For each package, get its details
            for pkg_name in response.json().get('packages', []):
                try:
                    pkg_url = f"https://registry.npmjs.org/{pkg_name}"
                    pkg_response = requests.get(pkg_url)
                    pkg_response.raise_for_status()
                    pkg_data = pkg_response.json()
                    
                    latest_version = pkg_data.get('dist-tags', {}).get('latest')
                    version_data = pkg_data.get('versions', {}).get(latest_version, {})
                    
                    packages.append({
                        'name': pkg_name,
                        'description': (version_data.get('description') or 'No description').split('.')[0] + '.',
                        'url': f"https://www.npmjs.com/package/{pkg_name}",
                        'version': latest_version,
                        'provider': 'NPM',
                        'downloads': pkg_data.get('downloads', {}).get('lastDay', 0),
                        'owner': username,
                        'owner_type': 'user',
                        'keywords': version_data.get('keywords', []),
                        'created_at': pkg_data.get('time', {}).get('created', ''),
                        'updated_at': pkg_data.get('time', {}).get('modified', '')
                    })
                except Exception as e:
                    print(f"Error fetching NPM package {pkg_name}: {e}")
                    continue
                    
            return packages
            
        except Exception as e:
            print(f"Error in NPM projects fetch: {e}")
            return []

    def _fetch_pypi_projects(self, username: str) -> List[Dict[str, Any]]:
        """Fetch packages from PyPI."""
        try:
            import requests
            url = f"https://pypi.org/user/{username}/"
            response = requests.get(url)
            response.raise_for_status()
            # PyPI doesn't have a direct API for user packages, so we'll return an empty list for now
            # In a real implementation, you might need to parse the HTML or use a different approach
            return []
        except Exception as e:
            print(f"Error fetching PyPI packages: {e}")
            return []

    def generate(self, account_data: Dict[str, Any]) -> None:
        """Generate the portfolio website.
        
        Args:
            account_data: Dictionary containing data from various accounts.
        """
        # Fetch projects from different providers
        projects = []
        
        if 'github' in account_data and 'username' in account_data['github']:
            projects.extend(self._fetch_github_projects(account_data['github']['username']))
            
        if 'npm' in account_data and 'username' in account_data['npm']:
            projects.extend(self._fetch_npm_projects(account_data['npm']['username']))
            
        if 'pypi' in account_data and 'username' in account_data['pypi']:
            projects.extend(self._fetch_pypi_projects(account_data['pypi']['username']))
        
        # Sort projects by update time (newest first)
        projects.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
        
        # Prepare template context
        context = {
            "title": "My Development Portfolio",
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "theme": self.theme,
            "accounts": account_data,
            "projects": projects,
        }
        
        # Render and save the main page
        self._render_template("index.html", "index.html", context)
        
        # Copy static files (CSS, JS, images)
        self._copy_static_files()
        
        print(f"Portfolio generated successfully at: {self.output_dir}")

    def _render_template(self, template_name: str, output_name: str, context: Dict[str, Any]) -> None:
        """Render a template with the given context and save it to the output directory."""
        template = self.env.get_template(template_name)
        output_path = self.output_dir / output_name
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(template.render(**context))

    def _copy_static_files(self) -> None:
        """Copy static files (CSS, JS, images) to the output directory."""
        static_src = self.template_dir / self.template_name / "static"
        static_dest = self.output_dir / "static"
        
        if static_src.exists():
            import shutil
            if static_dest.exists():
                shutil.rmtree(static_dest)
            shutil.copytree(static_src, static_dest)
