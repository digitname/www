#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

setup(
    name="digitname",
    version="0.1.0",
    packages=find_packages(include=["digitname", "digitname.*"]),
    install_requires=[
        "toml>=0.10.2",
        "typer[all]>=0.9.0",
        "jinja2>=3.1.2",
        "requests>=2.31.0",
        "rich>=13.5.2",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.7.0",
            "isort>=5.12.0",
            "flake8>=6.1.0",
            "mypy>=1.4.1",
        ],
    },
    entry_points={
        "console_scripts": [
            "digitname=digitname.cli:app",
        ],
    },
    include_package_data=True,
    package_data={
        "digitname": ["templates/**/*"],
    },
    python_requires=">=3.8",
)
