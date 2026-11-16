#!/usr/bin/env python3
"""
Taipei 101 Photorealistic 3D - High Performance Local Server
"""

import http.server
import socketserver
import os

PORT = 3000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def guess_type(self, path):
        mtype = super().guess_type(path)
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.glsl') or path.endswith('.vs') or path.endswith('.fs'):
            return 'text/plain; charset=utf-8'
        return mtype

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    port = PORT
    for _ in range(10):
        try:
            with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
                print(f"🚀 Taipei 101 3D Server running at http://localhost:{port}/")
                httpd.serve_forever()
                break
        except OSError:
            print(f"Port {port} in use, trying {port+1}...")
            port += 1

if __name__ == '__main__':
    run()
