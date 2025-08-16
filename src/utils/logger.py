"""
Structured logging configuration for the application.
Supports both development and production environments with JSON formatting.
"""
import os
import sys
import logging
import uuid
import time
import functools
from typing import Dict, Any, Optional, Callable, TypeVar, cast
from contextlib import contextmanager
from datetime import datetime

import structlog
from structlog.types import EventDict, Processor, WrappedLogger

# Type variable for generic function wrapping
F = TypeVar('F', bound=Callable[..., Any])

# Environment detection
IS_DEVELOPMENT = os.getenv('ENV', 'development') == 'development'
IS_PRODUCTION = not IS_DEVELOPMENT

# Request ID storage for context
_request_id = {}

def get_request_id() -> str:
    """Get the current request ID or generate a new one."""
    return _request_id.get('id', str(uuid.uuid4()))

def set_request_id(request_id: Optional[str] = None) -> str:
    """Set the current request ID. Generates a new one if none provided."""
    _request_id['id'] = request_id or str(uuid.uuid4())
    return _request_id['id']

class RequestIdFilter(logging.Filter):
    """Add request_id to log records."""
    def filter(self, record):
        record.request_id = get_request_id()
        return True

def add_service_context(_, __, event_dict: EventDict) -> EventDict:
    """Add service context to log entries."""
    event_dict['service'] = os.getenv('SERVICE_NAME', 'unknown')
    event_dict['environment'] = os.getenv('ENV', 'development')
    event_dict['hostname'] = os.getenv('HOSTNAME', 'localhost')
    return event_dict

def add_timestamp(_, __, event_dict: EventDict) -> EventDict:
    """Add ISO 8601 timestamp to log entries."""
    event_dict['timestamp'] = datetime.utcnow().isoformat() + 'Z'
    return event_dict

def filter_sensitive_data(_, __, event_dict: EventDict) -> EventDict:
    """Remove sensitive data from log entries."""
    sensitive_keys = ['password', 'secret', 'token', 'api_key', 'authorization']
    for key in list(event_dict.keys()):
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            event_dict[key] = '***REDACTED***'
    return event_dict

def configure_logging(level: str = 'INFO') -> None:
    """Configure structured logging for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Configure standard logging
    logging.basicConfig(
        format='%(message)s',
        level=getattr(logging, level),
        stream=sys.stdout
    )
    
    # Configure structlog
    processors: list[Processor] = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        filter_sensitive_data,
        add_timestamp,
        add_service_context,
    ]
    
    if IS_DEVELOPMENT:
        # Pretty print for development
        processors.extend([
            structlog.dev.ConsoleRenderer(colors=True)
        ])
    else:
        # JSON for production
        processors.extend([
            structlog.processors.JSONRenderer()
        ])
    
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

def get_logger(name: Optional[str] = None) -> structlog.BoundLogger:
    """Get a configured logger instance.
    
    Args:
        name: Logger name (usually __name__)
    """
    logger = structlog.get_logger(name)
    return logger

@contextmanager
def log_request_response(logger: structlog.BoundLogger, request_data: Dict[str, Any]):
    """Context manager for logging request/response cycles.
    
    Example:
        with log_request_response(logger, {
            'method': 'GET',
            'path': '/api/endpoint',
            'query': {...}
        }) as log_ctx:
            # Your request handling code
            log_ctx.update({
                'status_code': 200,
                'response_time_ms': 150
            })
    """
    request_id = set_request_id()
    start_time = time.monotonic()
    
    log_ctx = {
        'request_id': request_id,
        'event': 'request_started',
        **request_data
    }
    
    try:
        logger.info('Request started', **log_ctx)
        yield log_ctx
    except Exception as e:
        log_ctx.update({
            'event': 'request_failed',
            'error': str(e),
            'error_type': e.__class__.__name__,
            'response_time_ms': int((time.monotonic() - start_time) * 1000)
        })
        logger.error('Request failed', **log_ctx)
        raise
    else:
        log_ctx.update({
            'event': 'request_completed',
            'response_time_ms': int((time.monotonic() - start_time) * 1000)
        })
        logger.info('Request completed', **log_ctx)

def log_exceptions(logger: Optional[structlog.BoundLogger] = None):
    """Decorator to log exceptions with full context.
    
    Example:
        @log_exceptions(logger)
        def risky_function(arg1, arg2):
            # Your code here
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            log = logger or get_logger(func.__module__)
            try:
                return func(*args, **kwargs)
            except Exception as e:
                log.error(
                    'Unhandled exception',
                    exc_info=True,
                    function=func.__name__,
                    module=func.__module__,
                    args=args,
                    kwargs=kwargs
                )
                raise
        return cast(F, wrapper)
    return decorator

# Initialize logging when module is imported
configure_logging(os.getenv('LOG_LEVEL', 'INFO'))

# Create default logger
logger = get_logger(__name__)
