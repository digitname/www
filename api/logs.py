"""
Logging endpoint for receiving frontend logs and writing them to files
in a format compatible with Promtail.
"""
import os
import json
import logging
from datetime import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint
logs_bp = Blueprint('logs', __name__)
CORS(logs_bp)  # Enable CORS for this blueprint

# Rate limiting
RATE_LIMIT = 100  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds
request_timestamps = {}

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        global request_timestamps
        
        # Get client IP
        client_ip = request.remote_addr
        current_time = datetime.now().timestamp()
        
        # Clean up old timestamps
        request_timestamps[client_ip] = [
            ts for ts in request_timestamps.get(client_ip, []) 
            if current_time - ts < RATE_LIMIT_WINDOW
        ]
        
        # Check rate limit
        if len(request_timestamps.get(client_ip, [])) >= RATE_LIMIT:
            return jsonify({
                'status': 'error',
                'message': 'Rate limit exceeded. Please try again later.'
            }), 429
        
        # Add current timestamp
        if client_ip not in request_timestamps:
            request_timestamps[client_ip] = []
        request_timestamps[client_ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function

def sanitize_log_entry(entry):
    """Sanitize log entry to prevent log injection and remove sensitive data."""
    if not isinstance(entry, dict):
        return {}
        
    # Create a copy to avoid modifying the original
    sanitized = entry.copy()
    
    # Remove or mask sensitive fields
    sensitive_fields = ['password', 'secret', 'token', 'api_key', 'authorization']
    for field in sensitive_fields:
        if field in sanitized:
            sanitized[field] = '***REDACTED***'
    
    # Ensure required fields
    if 'timestamp' not in sanitized:
        sanitized['timestamp'] = datetime.utcnow().isoformat() + 'Z'
    if 'level' not in sanitized:
        sanitized['level'] = 'info'
    if 'message' not in sanitized:
        sanitized['message'] = 'No message provided'
    
    return sanitized

def write_log_to_file(log_entry):
    """Write log entry to a file in a format compatible with Promtail."""
    # Create logs directory if it doesn't exist
    # Prefer explicit LOG_DIR (e.g., /var/log/app) with fallback to repo-local logs dir
    logs_dir = os.environ.get('LOG_DIR') or os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 'logs'
    )
    os.makedirs(logs_dir, exist_ok=True)
    
    # Create log file path based on date
    log_date = datetime.utcnow().strftime('%Y-%m-%d')
    log_file = os.path.join(logs_dir, f'app-{log_date}.log')
    
    # Write log entry as JSON line
    with open(log_file, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

@logs_bp.route('/api/logs', methods=['POST'])
@rate_limit
def receive_logs():
    """
    Endpoint for receiving logs from the frontend.
    Accepts a single log entry or an array of log entries.
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        # Handle both single log entry and array of log entries
        log_entries = data if isinstance(data, list) else [data]
        
        # Process each log entry
        for entry in log_entries:
            # Sanitize log entry
            sanitized_entry = sanitize_log_entry(entry)
            
            # Write to log file
            write_log_to_file(sanitized_entry)
        
        return jsonify({'status': 'success', 'message': f'Processed {len(log_entries)} log entries'})
    
    except Exception as e:
        logger.error(f'Error processing log entry: {str(e)}', exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Failed to process log entry',
            'error': str(e)
        }), 500

# Error handlers
@logs_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'status': 'error', 'message': 'Bad request'}), 400

@logs_bp.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Not found'}), 404

@logs_bp.errorhandler(500)
def server_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
