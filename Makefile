.PHONY: help build run test clean publish version deps deps-js

# Default target
help:
	@echo "Available targets:"
	@echo "  help     - Show this help message"
	@echo "  deps     - Install all project dependencies"
	@echo "  deps-js  - Install JavaScript dependencies"
	@echo "  build    - Build the project"
	@echo "  run      - Run the development server"
	@echo "  test     - Run tests"
	@echo "  clean    - Clean build artifacts"
	@echo "  version  - Show current version"
	@echo "  publish  - Publish new version"

# Install all dependencies
deps: deps-py deps-js

# Install Python dependencies
deps-py:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt

# Install JavaScript dependencies
deps-js:
	@echo "Installing Node.js dependencies..."
	npm install

# Build the project
build:
	@echo "Building project..."
	# Add any build steps here

# Run the development server
run:
	@echo "Starting development server..."
	python -m http.server 8000

# Run tests
test:
	@echo "Running tests..."
	# Add test commands here

# Clean build artifacts
clean:
	@echo "Cleaning up..."
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -exec rm -rf {} +

# Show current version
version:
	@echo "Current version: $(shell grep -m 1 "## \[" CHANGELOG.md | grep -o "\[.*\]" | tr -d "[]")"

# Publish new version
publish:
	@echo "Publishing new version..."
	chmod +x version.sh
	chmod +x git.sh
	./version.sh

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
