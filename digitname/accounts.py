""
Account management module for DigitName.
Handles authentication and API interactions with various development platforms.
"""

import os
from typing import Dict, Any, Optional
import toml
from pathlib import Path


class AccountManager:
    """Manages development accounts and their configurations."""

    def __init__(self, config_path: str = "config/accounts.toml"):
        """Initialize the account manager with configuration.
        
        Args:
            config_path: Path to the TOML configuration file.
        """
        self.config_path = Path(config_path)
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load the configuration from the TOML file.
        
        Returns:
            Dict containing the configuration.
        """
        if not self.config_path.exists():
            raise FileNotFoundError(
                f"Configuration file not found at {self.config_path}. "
                "Please create one based on the example."
            )
        return toml.load(self.config_path)

    def get_account(self, service: str) -> Dict[str, str]:
        """Get account information for a specific service.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            
        Returns:
            Dictionary containing the account information.
        """
        return self.config.get(service, {})

    def update_account(self, service: str, **kwargs) -> None:
        """Update account information for a specific service.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            **kwargs: Key-value pairs to update in the service config.
        """
        if service not in self.config:
            self.config[service] = {}
        self.config[service].update(kwargs)
        self._save_config()

    def _save_config(self) -> None:
        """Save the current configuration to the TOML file."""
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, 'w') as f:
            toml.dump(self.config, f)
