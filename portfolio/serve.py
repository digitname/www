#!/usr/bin/env python3
"""
Simple HTTP server to serve the portfolio files with CORS support.
"""

import os
import http.server
import socketserver
from http import HTTPStatus

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Serve .json files with the correct MIME type
        if self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run(port=8000):
    """Run the server on the specified port."""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = CORSRequestHandler
    
    # Try to find an available port if the default is in use
    for p in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", p), handler) as httpd:
                print(f"🚀 Serving portfolio at http://localhost:{p}")
                print("🛑 Press Ctrl+C to stop")
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                print(f"Port {p} is in use, trying next port...")
                continue
            raise

if __name__ == "__main__":
    run()
