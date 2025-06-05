#!/usr/bin/env python3
"""
Generate portfolio data from multiple sources and create a JSON file.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Configuration
PORTFOLIO_DIR = Path("portfolio")
PORTFOLIO_JSON = PORTFOLIO_DIR / "portfolio.json"
TEMPLATE_HTML = "portfolio_template.html"
OUTPUT_HTML = "index.html"

# Ensure portfolio directory exists
PORTFOLIO_DIR.mkdir(exist_ok=True)

def load_portfolio() -> Dict[str, Any]:
    """Load existing portfolio data or create a new one."""
    if PORTFOLIO_JSON.exists():
        with open(PORTFOLIO_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "last_updated": "",
        "projects": [],
        "metadata": {}
    }

def save_portfolio(data: Dict[str, Any]) -> None:
    """Save portfolio data to JSON file."""
    data["last_updated"] = datetime.utcnow().isoformat()
    with open(PORTFOLIO_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Portfolio data saved to {PORTFOLIO_JSON}")

def generate_html(portfolio_data: Dict[str, Any]) -> None:
    """Generate HTML from portfolio data."""
    with open(TEMPLATE_HTML, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Convert projects to HTML
    projects_html = []
    for project in portfolio_data.get("projects", []):
        project_html = f"""
        <div class="project-card">
            <h3><a href="{url}" target="_blank">{name}</a></h3>
            <p class="source">Source: {source} • {language if language else 'N/A'}</p>
            <p class="description">{description or 'No description available'}</p>
            <div class="meta">
                <span class="stars">⭐ {stars}</span>
                <span class="updated">Updated: {updated_at}</span>
            </div>
        </div>
        """.format(
            name=project.get('name', 'Unnamed Project'),
            url=project.get('url', '#'),
            source=project.get('source', 'unknown').upper(),
            language=project.get('language', ''),
            description=project.get('description', ''),
            stars=project.get('stars', 0),
            updated_at=project.get('updated_at', 'N/A')
        )
        projects_html.append(project_html)
    
    # Insert projects into template
    html = html.replace('{{PROJECTS}}', '\n'.join(projects_html))
    html = html.replace('{{LAST_UPDATED}}', portfolio_data.get('last_updated', 'Unknown'))
    
    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"✅ HTML portfolio generated at {OUTPUT_HTML}")

def main():
    """Main function to generate portfolio."""
    # Load existing data
    portfolio_data = load_portfolio()
    
    # Save updated data
    save_portfolio(portfolio_data)
    
    # Generate HTML
    generate_html(portfolio_data)
    
    print("\n🎉 Portfolio generation complete!")
    print(f"Access your portfolio at: http://localhost:8000/{OUTPUT_HTML}")

if __name__ == "__main__":
    main()
