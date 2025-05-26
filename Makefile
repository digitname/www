.PHONY: help build run test clean publish version deps deps-js setup-env check-env publish-npm publish-pypi publish-docker update-portfolio

# Default target
help:
	@echo "Environment Setup:"
	@echo "  setup-env       - Create .env file from example"
	@echo "  check-env       - Verify environment configuration"
	@echo ""
	@echo "Development:"
	@echo "  deps            - Install all project dependencies"
	@echo "  deps-js         - Install JavaScript dependencies"
	@echo "  build           - Build the project"
	@echo "  run             - Run the development server"
	@echo "  test            - Run tests"
	@echo "  clean           - Clean build artifacts"
	@echo ""
	@echo "Versioning:"
	@echo "  version         - Show current version"
	@echo "  release         - Create a new release"
	@echo "  publish         - Publish new version to all registries"
	@echo "  publish-npm     - Publish to NPM"
	@echo "  publish-pypi    - Publish to PyPI"
	@echo "  publish-docker  - Publish to Docker Hub"
	@echo "Available targets:"
	@echo "  install     Install dependencies"
	@echo "  test       Run tests"
	@echo "  lint       Run linters"
	@echo "  format     Format code"
	@echo "  clean      Clean build artifacts"
	@echo "  build      Build package"
	@echo "  publish    Publish to PyPI"
	@echo "  docs       Generate documentation"
	@echo "  portfolio  Generate portfolio"
	@echo "  git-init   Initialize git repository"

# Environment setup
setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo "Please edit .env with your credentials"; \
	else \
		echo ".env file already exists"; \
	fi

check-env:
	@echo "Checking environment configuration..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Run 'make setup-env' first."; \
		exit 1; \
	fi
	@echo "Environment configuration looks good!"

# Install all dependencies
deps: deps-js

# Install JavaScript dependencies
deps-js: check-env
	@echo "Installing Node.js dependencies..."
	cd react-app && npm install

# Build the project
build: check-env
	@echo "Building project..."
	cd react-app && npm run build

# Run the development server on port 8003
run: check-env
	@echo "Starting development server on port 8003..."
	cd react-app && npm run dev -- --port 8003

# Run tests
test: check-env
	@echo "Running tests..."
	cd react-app && npm test

# Clean build artifacts
clean:
	@echo "Cleaning up..."
	cd react-app && rm -rf node_modules dist
	find . -type d -name 'node_modules' -exec rm -rf {} +

# Show current version
version:
	@echo "Current version: $(shell grep -m 1 "## \[" CHANGELOG.md | grep -o "\[.*\]" | tr -d "[]")"

# Publish to all registries
publish: publish-npm publish-pypi publish-docker

# Publish to NPM
publish-npm: check-env
	@echo "Publishing to NPM..."
	cd react-app && \
	npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN} && \
	npm publish --access public

# Publish to PyPI
publish-pypi: check-env
	@echo "Publishing to PyPI..."
	@echo "TODO: Add PyPI publishing logic"

# Publish to Docker Hub
publish-docker: check-env
	@echo "Publishing to Docker Hub..."
	@echo "TODO: Add Docker publishing logic"

# Update portfolio data and generate thumbnails/icons
update-portfolio:
	@echo "Updating portfolio data and generating assets..."
	node scripts/update-portfolio.js
	@echo "Portfolio update complete!"

# Create a new release
release: version
	@echo "Creating release..."
	@read -p "Enter version number (e.g., 1.0.0): " version; \
	echo "## [$$version] - $(shell date +%Y-%m-%d)" > /tmp/CHANGES; \
	echo "" >> /tmp/CHANGES; \
	echo "### Added" >> /tmp/CHANGES; \
	echo "- " >> /tmp/CHANGES; \
	echo "" >> /tmp/CHANGES; \
	echo "### Changed" >> /tmp/CHANGES; \
	echo "- " >> /tmp/CHANGES; \
	echo "" >> /tmp/CHANGES; \
	echo "### Fixed" >> /tmp/CHANGES; \
	echo "- " >> /tmp/CHANGES; \
	echo "" >> /tmp/CHANGES; \
	${EDITOR:-vi} /tmp/CHANGES; \
	tail -n +2 /tmp/CHANGES | cat - CHANGELOG.md > /tmp/CHANGELOG.md.new && mv /tmp/CHANGELOG.md.new CHANGELOG.md; \
	echo "Changelog updated. Run 'make publish' to publish the new version."



.PHONY: install test lint format clean build publish docs portfolio

# Project variables
PACKAGE_NAME = digitname
PYTHON = python
PIP = pip
POETRY = poetry

# Default target
all: install

# Install dependencies
install:
	$(POETRY) install

# Run tests
test:
	$(POETRY) run pytest tests/ -v

# Run linters
lint:
	$(POETRY) run black --check $(PACKAGE_NAME) tests
	$(POETRY) run flake8 $(PACKAGE_NAME) tests
	$(POETRY) run mypy $(PACKAGE_NAME) tests

# Format code
format:
	$(POETRY) run black $(PACKAGE_NAME) tests
	$(POETRY) run isort $(PACKAGE_NAME) tests

# Clean build artifacts
clean:
	rm -rf build/ dist/ .mypy_cache/ .pytest_cache/ .coverage htmlcov/ *.egg-info
	find . -type d -name '__pycache__' -exec rm -rf {} +
	find . -type f -name '*.py[co]' -delete

# Build package
build: clean
	$(POETRY) build

# Publish to PyPI
publish: build
	$(POETRY) publish

# Generate documentation
docs:
	@echo "Generating documentation..."
	@mkdir -p docs
	$(POETRY) run sphinx-apidoc -o docs/source $(PACKAGE_NAME)
	$(POETRY) run sphinx-build -b html docs/source docs/build

# Generate portfolio
portfolio:
	$(POETRY) run python -m $(PACKAGE_NAME).cli generate-portfolio

# Initialize git repository
git-init:
	git init
	git add .
	git commit -m "Initial commit"

