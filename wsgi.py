"""
WSGI config for the DigitName application.

It exposes the WSGI callable as a module-level variable named ``application``.
"""
from digitname.wsgi import application

# This allows the application to be run directly with: python wsgi.py
if __name__ == "__main__":
    application.run()
