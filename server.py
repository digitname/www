#!/usr/bin/env python3
"""
Robust HTTP server to serve static files for the portfolio.
Automatically finds an available port if the default is in use.
"""

import http.server
import socketserver
import os
import sys
import socket
import webbrowser
from pathlib import Path
from typing import Tuple, Optional

# Configuration
DEFAULT_PORTS = [8000, 8001, 8002, 8003, 8080, 3000, 5000, 3001, 5001]
HOST = '0.0.0.0'

class StaticHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve static files with proper headers."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)
    
    def do_GET(self):
        # Route requests to the appropriate directory
        if self.path.startswith('/static/'):
            self.directory = str(Path(__file__).parent / 'static')
            self.path = self.path[7:]  # Remove '/static' prefix
        elif self.path.startswith('/data/'):
            self.directory = str(Path(__file__).parent / 'data')
            self.path = self.path[5:]  # Remove '/data' prefix
        else:
            # Default to views directory for HTML files
            if not self.path or self.path == '/' or self.path == '/portfolio':
                self.path = '/portfolio.html'
            if not self.path.startswith('/'):
                self.path = '/' + self.path
            self.directory = str(Path(__file__).parent / 'views')
            
            # If the file doesn't exist, try serving from root
            if not os.path.exists(os.path.join(self.directory, self.path.lstrip('/'))):
                self.directory = str(Path(__file__).parent)
        
        print(f"Serving {self.path} from {self.directory}")  # Debug log
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # Set correct content types
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        elif self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
            
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging to reduce noise
        pass

def is_port_available(port: int) -> bool:
    """Check if a port is available."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((HOST, port))
            return True
        except (OSError, socket.error):
            return False

def find_available_port(start_port: Optional[int] = None) -> int:
    """Find an available port starting from start_port or trying DEFAULT_PORTS."""
    if start_port is not None and is_port_available(start_port):
        return start_port
    
    for port in DEFAULT_PORTS:
        if is_port_available(port):
            return port
    
    # If no default port is available, try any port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, 0))
        return s.getsockname()[1]

def run_server(port: int, host: str = HOST) -> Tuple[socketserver.TCPServer, int]:
    """Run the HTTP server on the specified port."""
    handler = StaticHandler
    
    # Try to use the requested port, or find an available one
    available_port = find_available_port(port)
    
    try:
        httpd = socketserver.TCPServer((host, available_port), handler)
        print(f"\n🚀 Serving portfolio at http://{host}:{available_port}")
        print(f"📁 Serving from: {os.getcwd()}")
        print("🛑 Press Ctrl+C to stop\n")
        
        # Try to open the browser automatically
        try:
            webbrowser.open(f"http://{host}:{available_port}")
        except Exception as e:
            print(f"⚠️  Could not open browser: {e}")
        
        return httpd, available_port
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Change to the directory of the script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Get port from command line or use None to auto-find
    try:
        port = int(sys.argv[1]) if len(sys.argv) > 1 else None
    except ValueError:
        print("⚠️  Invalid port number. Using automatic port selection.")
        port = None
    
    # Run the server
    httpd, actual_port = run_server(port if port else 8000)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    finally:
        httpd.shutdown()
        httpd.server_close()
        print("👋 Server has been stopped")
