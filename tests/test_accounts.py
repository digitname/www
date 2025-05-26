"""Tests for the accounts module."""

import os
import pytest
from pathlib import Path
from digitname.accounts import AccountManager


def test_account_manager_init(tmp_path):
    """Test initializing AccountManager with a config file."""
    config_path = tmp_path / "accounts.toml"
    config_path.write_text("""
    [github]
    username = "testuser"
    token = "testtoken"
    """)
    
    manager = AccountManager(str(config_path))
    assert manager.get_account("github")["username"] == "testuser"


def test_update_account(tmp_path):
    """Test updating an account configuration."""
    config_path = tmp_path / "accounts.toml"
    config_path.write_text("""
    [github]
    username = "testuser"
    """)
    
    manager = AccountManager(str(config_path))
    manager.update_account("github", token="newtoken")
    
    assert manager.get_account("github")["token"] == "newtoken"


def test_missing_config():
    """Test handling of missing config file."""
    with pytest.raises(FileNotFoundError):
        AccountManager("nonexistent.toml")
