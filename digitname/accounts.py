"""
Account management module for DigitName.

Handles authentication and API interactions with various development platforms.
Uses environment variables for configuration.
"""

import os
from typing import Dict, Any, Optional


class AccountManager:
    """Manages development accounts and their configurations.
    
    Can load configuration from either environment variables or a TOML config file.
    Environment variables take precedence over the config file.
    """

    def __init__(self, config_path: Optional[str] = None):
        """Initialize the account manager.
        
        Args:
            config_path: Optional path to a TOML config file. If not provided,
                       only environment variables will be used.
        """
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Dict[str, str]]:
        """Load the configuration from environment variables and/or config file.
        
        Environment variables take precedence over the config file.
        
        Returns:
            Dict containing the configuration for each service.
        """
        # Start with environment variables
        env_config = {
            'github': {
                'username': os.getenv('GITHUB_USERNAME', ''),
                'token': os.getenv('GITHUB_TOKEN', ''),
                'email': os.getenv('GITHUB_EMAIL', '')
            },
            'npm': {
                'username': os.getenv('NPM_USERNAME', ''),
                'email': os.getenv('NPM_EMAIL', ''),
                'token': os.getenv('NPM_TOKEN', '')
            },
            'pypi': {
                'username': os.getenv('PYPI_USERNAME', ''),
                'password': os.getenv('PYPI_PASSWORD', ''),
                'token': os.getenv('PYPI_TOKEN', '')
            },
            'docker': {
                'username': os.getenv('DOCKERHUB_USERNAME', ''),
                'token': os.getenv('DOCKERHUB_TOKEN', '')
            },
            'gitlab': {
                'username': os.getenv('GITLAB_USERNAME', ''),
                'token': os.getenv('GITLAB_TOKEN', ''),
                'email': os.getenv('GITLAB_EMAIL', '')
            },
            'email': {
                'driver': os.getenv('MAIL_MAILER', 'smtp'),
                'host': os.getenv('MAIL_HOST', ''),
                'port': os.getenv('MAIL_PORT', '587'),
                'username': os.getenv('MAIL_USERNAME', ''),
                'password': os.getenv('MAIL_PASSWORD', ''),
                'encryption': os.getenv('MAIL_ENCRYPTION', 'tls'),
                'from_address': os.getenv('MAIL_FROM_ADDRESS', ''),
                'from_name': os.getenv('MAIL_FROM_NAME', ''),
                'imap': {
                    'host': os.getenv('IMAP_HOST', os.getenv('MAIL_HOST', '')),
                    'port': os.getenv('IMAP_PORT', '993'),
                    'username': os.getenv('IMAP_USERNAME', os.getenv('MAIL_USERNAME', '')),
                    'password': os.getenv('IMAP_PASSWORD', os.getenv('MAIL_PASSWORD', '')),
                    'ssl': os.getenv('IMAP_SSL', 'true').lower() == 'true',
                    'check_interval': int(os.getenv('IMAP_CHECK_INTERVAL', '300')),  # 5 minutes default
                    'inbox': os.getenv('IMAP_INBOX', 'INBOX')
                },
                'smtp': {
                    'host': os.getenv('SMTP_HOST', os.getenv('MAIL_HOST', '')),
                    'port': os.getenv('SMTP_PORT', os.getenv('MAIL_PORT', '587')),
                    'username': os.getenv('SMTP_USERNAME', os.getenv('MAIL_USERNAME', '')),
                    'password': os.getenv('SMTP_PASSWORD', os.getenv('MAIL_PASSWORD', '')),
                    'encryption': os.getenv('SMTP_ENCRYPTION', os.getenv('MAIL_ENCRYPTION', 'tls'))
                }
            }
        }
        
        # Load from config file if path is provided
        file_config = {}
        if self.config_path:
            if not os.path.exists(self.config_path):
                raise FileNotFoundError(f"Config file not found: {self.config_path}")
                
            try:
                import toml
                with open(self.config_path, 'r') as f:
                    file_config = toml.load(f)
            except ImportError as e:
                raise ImportError("The 'toml' package is required to load config files. Install it with 'pip install toml'.")
            except toml.TomlDecodeError as e:
                raise ValueError(f"Error parsing config file: {e}")
        
        # Merge configs (environment variables take precedence)
        merged_config = {}
        all_services = set(env_config.keys()) | set(file_config.keys())
        
        for service in all_services:
            merged_service = {}
            # Add file config values
            if service in file_config:
                merged_service.update(file_config[service])
            # Override with environment variables
            if service in env_config:
                merged_service.update({
                    k: v for k, v in env_config[service].items() if v
                })
            if merged_service:
                merged_config[service] = merged_service
        
        return merged_config

    def get_account(self, service: str) -> Dict[str, str]:
        """Get account information for a specific service.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            
        Returns:
            Dictionary containing the account information.
        """
        return self.config.get(service.lower(), {})

    def update_account(self, service: str, **kwargs) -> None:
        """Update account information for a specific service.
        
        If a config file was provided during initialization, updates will be written to it.
        Otherwise, updates will only be made to the in-memory config.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            **kwargs: Key-value pairs of account information to update.
            
        Raises:
            ValueError: If the service doesn't exist or no updates provided.
            IOError: If there's an error writing to the config file.
        """
        if not service or not isinstance(service, str):
            raise ValueError("Service name must be a non-empty string")
            
        if not kwargs:
            raise ValueError("No updates provided")
            
        service = service.lower()
        if service not in self.config and not any(kwargs.values()):
            raise ValueError(f"Service '{service}' not found and no valid updates provided")
            
        # Update in-memory config
        if service not in self.config:
            self.config[service] = {}
            
        self.config[service].update({
            k: v for k, v in kwargs.items() if v is not None
        })
        
        # Update config file if path was provided
        if self.config_path:
            try:
                import toml
                # Load existing config
                config = {}
                if os.path.exists(self.config_path):
                    with open(self.config_path, 'r') as f:
                        config = toml.load(f)
                
                # Update the service config
                if service not in config:
                    config[service] = {}
                config[service].update(self.config[service])
                
                # Write back to file
                with open(self.config_path, 'w') as f:
                    toml.dump(config, f)
                    
            except (ImportError, toml.TomlDecodeError) as e:
                raise ValueError(f"Error updating config file: {e}")
            except IOError as e:
                raise IOError(f"Failed to write to config file: {e}")
