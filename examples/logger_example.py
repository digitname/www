"""
Example usage of the structured logger.
"""
import os
import sys
import time
from typing import Dict, Any

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.logger import (
    logger,
    get_logger,
    log_request_response,
    log_exceptions,
    set_request_id
)

def example_basic_logging():
    """Demonstrates basic logging functionality."""
    logger.info("This is an info message")
    logger.warning("This is a warning", extra_data={"key": "value"})
    
    try:
        1 / 0
    except ZeroDivisionError:
        logger.error("Division by zero", exc_info=True)

def example_request_logging():
    """Demonstrates request/response logging."""
    # Simulate a web request
    request_data = {
        'method': 'POST',
        'path': '/api/users',
        'user_id': 123,
        'ip': '192.168.1.1',
        'user_agent': 'Mozilla/5.0',
        'query': {'page': '1'},
        'body': {'email': 'user@example.com', 'password': 'sensitive_data'}
    }
    
    with log_request_response(logger, request_data) as log_ctx:
        # Simulate processing time
        time.sleep(0.1)
        
        # Update context with response data
        log_ctx.update({
            'status_code': 200,
            'response_size': 1024,
            'user_id': 123
        })

@log_exceptions()
def example_error_handling():
    """Demonstrates automatic exception logging."""
    logger.info("About to perform a risky operation")
    result = 1 / 0  # This will raise ZeroDivisionError
    return result

def example_custom_logger():
    """Demonstrates using a custom-named logger."""
    custom_logger = get_logger("custom.module")
    custom_logger.info("This is a message from a custom logger", 
                      custom_field="custom_value")

def main():
    # Set a request ID for this example session
    set_request_id("example_session_123")
    
    print("=== Basic Logging ===")
    example_basic_logging()
    
    print("\n=== Request Logging ===")
    example_request_logging()
    
    print("\n=== Custom Logger ===")
    example_custom_logger()
    
    print("\n=== Error Handling ===")
    try:
        example_error_handling()
    except Exception:
        print("Error was logged and re-raised")

if __name__ == "__main__":
    # Set environment for demonstration
    os.environ["ENV"] = "development"
    os.environ["SERVICE_NAME"] = "example-service"
    
    main()
