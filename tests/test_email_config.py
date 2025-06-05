"""Tests for email configuration in accounts module."""

import os
import pytest
from pathlib import Path
from digitname.accounts import AccountManager


def test_email_config_loading(tmp_path, monkeypatch):
    """Test that email configuration is loaded correctly from environment variables."""
    # Set up test environment variables
    env_vars = {
        'MAIL_MAILER': 'smtp',
        'MAIL_HOST': 'smtp.example.com',
        'MAIL_PORT': '587',
        'MAIL_USERNAME': 'user@example.com',
        'MAIL_PASSWORD': 'password123',
        'MAIL_ENCRYPTION': 'tls',
        'MAIL_FROM_ADDRESS': 'noreply@example.com',
        'MAIL_FROM_NAME': 'Test Sender',
        'IMAP_HOST': 'imap.example.com',
        'IMAP_PORT': '993',
        'IMAP_USERNAME': 'imap@example.com',
        'IMAP_PASSWORD': 'imap123',
        'IMAP_CHECK_INTERVAL': '60',
        'IMAP_INBOX': 'INBOX',
        'SMTP_HOST': 'smtp.example.com',
        'SMTP_PORT': '587',
        'SMTP_USERNAME': 'smtp@example.com',
        'SMTP_PASSWORD': 'smtp123',
        'SMTP_ENCRYPTION': 'tls'
    }
    
    # Apply the environment variables
    for key, value in env_vars.items():
        monkeypatch.setenv(key, value)
    
    # Initialize AccountManager
    manager = AccountManager()
    
    # Test top-level email config
    email_config = manager.get_account('email')
    assert email_config['driver'] == 'smtp'
    assert email_config['host'] == 'smtp.example.com'
    assert email_config['port'] == '587'
    assert email_config['username'] == 'user@example.com'
    assert email_config['password'] == 'password123'
    assert email_config['encryption'] == 'tls'
    assert email_config['from_address'] == 'noreply@example.com'
    assert email_config['from_name'] == 'Test Sender'
    
    # Test IMAP config
    imap_config = email_config['imap']
    assert imap_config['host'] == 'imap.example.com'
    assert imap_config['port'] == '993'
    assert imap_config['username'] == 'imap@example.com'
    assert imap_config['password'] == 'imap123'
    assert imap_config['ssl'] is True
    assert imap_config['check_interval'] == 60
    assert imap_config['inbox'] == 'INBOX'
    
    # Test SMTP config
    smtp_config = email_config['smtp']
    assert smtp_config['host'] == 'smtp.example.com'
    assert smtp_config['port'] == '587'
    assert smtp_config['username'] == 'smtp@example.com'
    assert smtp_config['password'] == 'smtp123'
    assert smtp_config['encryption'] == 'tls'
