import os
import json
from datetime import datetime
from typing import Dict, Any


def get_log_dir() -> str:
    """Return the directory to write logs to."""
    return os.environ.get('LOG_DIR') or os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 'logs'
    )


essential_fields = {
    'timestamp', 'level', 'message'
}


SENSITIVE_FIELDS = {'password', 'secret', 'token', 'api_key', 'authorization'}


def sanitize_log_entry(entry: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize and normalize a log entry."""
    if not isinstance(entry, dict):
        return {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': 'info',
            'message': 'Invalid log entry',
        }

    sanitized = entry.copy()

    for field in SENSITIVE_FIELDS:
        if field in sanitized:
            sanitized[field] = '***REDACTED***'

    if 'timestamp' not in sanitized:
        sanitized['timestamp'] = datetime.utcnow().isoformat() + 'Z'
    if 'level' not in sanitized:
        sanitized['level'] = 'info'
    if 'message' not in sanitized:
        sanitized['message'] = 'No message provided'

    return sanitized


def write_log_to_file(log_entry: Dict[str, Any]) -> None:
    """Write a single JSON log line to the daily file in LOG_DIR."""
    logs_dir = get_log_dir()
    os.makedirs(logs_dir, exist_ok=True)

    log_date = datetime.utcnow().strftime('%Y-%m-%d')
    log_file = os.path.join(logs_dir, f'app-{log_date}.log')

    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
