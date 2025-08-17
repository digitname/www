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
        # Handle data.json specially
        if self.path == '/data.json' or self.path == '/data.json/':
            self.path = '/data.json'
            self.directory = str(Path(__file__).parent)
            if not os.path.exists(os.path.join(self.directory, 'data.json')):
                self.directory = str(Path(__file__).parent / 'assets/portfolio')
        # Route requests to the appropriate directory
        elif self.path.startswith('/static/'):
            self.directory = str(Path(__file__).parent / 'static')
            self.path = self.path[7:]  # Remove '/static' prefix
        elif self.path.startswith('/data/'):
            self.directory = str(Path(__file__).parent / 'data')
            self.path = self.path[5:]  # Remove '/data' prefix
        else:
            # Route HTML pages
            if not self.path or self.path == '/':
                # Serve homepage from root
                self.path = '/index.html'
                self.directory = str(Path(__file__).parent)
            elif self.path == '/portfolio' or self.path == '/portfolio/':
                # Serve modern portfolio embedded in index.html
                self.path = '/index.html'
                self.directory = str(Path(__file__).parent)
            else:
                if not self.path.startswith('/'):
                    self.path = '/' + self.path
                # Try from root first, then fallback to legacy views
                self.directory = str(Path(__file__).parent)
                if not os.path.exists(os.path.join(self.directory, self.path.lstrip('/'))):
                    self.directory = str(Path(__file__).parent / 'views')
        
        print(f"Serving {self.path} from {self.directory}")  # Debug log
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def guess_type(self, path):
        """Override to ensure correct MIME types for all files."""
        base, ext = os.path.splitext(path)
        ext = ext.lower()
        
        # Custom MIME types
        mime_types = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.webp': 'image/webp',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'font/otf',
            '.wasm': 'application/wasm'
        }
        
        # Check our custom types first
        if ext in mime_types:
            return mime_types[ext]
            
        # Fall back to the parent class's guess_type
        return super().guess_type(path)
        
    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # Always set content type based on file extension
        content_type = self.guess_type(self.path)
        if content_type:
            self.send_header('Content-Type', content_type)
                
        http.server.SimpleHTTPRequestHandler.end_headers(self)
        
    def handle_api(self):
        """Handle API requests"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "success", "message": "API endpoint"}).encode())
        
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
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
