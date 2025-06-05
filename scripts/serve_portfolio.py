#!/usr/bin/env python3
"""
Serve the portfolio website on an available port with improved error handling.
"""

import os
import sys
import socket
import signal
import webbrowser
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('portfolio_server.log')
    ]
)
logger = logging.getLogger(__name__)

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom request handler with improved error handling."""
    
    def log_message(self, format, *args):
        """Log HTTP requests."""
        logger.info("%s - - [%s] %s",
                   self.address_string(),
                   self.log_date_time_string(),
                   format % args)
    
    def handle_one_request(self):
        """Handle a single HTTP request with error handling."""
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError) as e:
            logger.warning("Client disconnected early: %s", str(e))
        except Exception as e:
            logger.error("Error handling request: %s", str(e), exc_info=True)
    
    def do_GET(self):
        """Handle GET requests with error handling."""
        try:
            super().do_GET()
        except (ConnectionResetError, BrokenPipeError) as e:
            logger.warning("Client disconnected during GET: %s", str(e))
        except Exception as e:
            logger.error("Error in GET request: %s", str(e), exc_info=True)
            self.send_error(500, "Internal Server Error")

def find_available_port(start_port=8000, max_port=9000):
    """Find an available port starting from start_port up to max_port."""
    for port in range(start_port, max_port + 1):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise OSError(f"No available ports found between {start_port} and {max_port}")

def signal_handler(sig, frame):
    """Handle interrupt signals gracefully."""
    print("\n👋 Shutting down server...")
    sys.exit(0)

def main():
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Change to the project root directory
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        os.chdir(project_root)
        logger.info("Project root: %s", project_root)
        
        # Find an available port
        port = find_available_port(8000)
        
        # Start the server with our custom handler
        server_address = ('', port)
        httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
        
        # Set socket options to allow address reuse
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        print(f"🚀 Serving portfolio at http://localhost:{port}")
        print("📄 Access logs are being written to portfolio_server.log")
        print("🛑 Press Ctrl+C to stop")
        
        # Try to open the browser
        try:
            webbrowser.open(f"http://localhost:{port}")
        except Exception as e:
            logger.warning("Could not open browser: %s", e)
        
        # Start serving
        logger.info("Starting server on port %d", port)
        httpd.serve_forever()
        
    except Exception as e:
        logger.critical("Server error: %s", str(e), exc_info=True)
        sys.exit(1)
    finally:
        if 'httpd' in locals():
            logger.info("Shutting down server")
            httpd.server_close()
        logger.info("Server stopped")

if __name__ == "__main__":
    main()
