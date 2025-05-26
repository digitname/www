""
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

    def generate(self, account_data: Dict[str, Any]) -> None:
        """Generate the portfolio website.
        
        Args:
            account_data: Dictionary containing data from various accounts.
        """
        # Prepare template context
        context = {
            "title": "My Development Portfolio",
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "theme": self.theme,
            "accounts": account_data,
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
