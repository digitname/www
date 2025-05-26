# Contributing to DigitName

Thank you for your interest in contributing to DigitName! This document will guide you through the process of setting up the development environment and making contributions.

## Prerequisites

- Python 3.8 or higher
- [Poetry](https://python-poetry.org/) for dependency management
- Git for version control

## Setting Up the Development Environment

1. **Fork the Repository**
   - Click the "Fork" button on the top right of the GitHub repository page.
   - Clone your forked repository:
     ```bash
     git clone https://github.com/your-username/digitname.git
     cd digitname
     ```

2. **Install Dependencies**
   - Install the project and its development dependencies:
     ```bash
     poetry install --with dev
     ```
   - Activate the virtual environment:
     ```bash
     poetry shell
     ```

3. **Configure Git Hooks (Optional but Recommended)**
   - Install pre-commit hooks to automatically run linters and formatters before each commit:
     ```bash
     pre-commit install
     ```

## Development Workflow

1. **Create a New Branch**
   - Always create a new branch for your changes:
     ```bash
     git checkout -b feature/your-feature-name
     # or
     git checkout -b bugfix/description-of-fix
     ```

2. **Make Your Changes**
   - Follow the project's coding style (enforced by Black and isort).
   - Write tests for new features and bug fixes.
   - Update the documentation if necessary.

3. **Run Tests**
   - Run the test suite:
     ```bash
     make test
     ```
   - Run linters and type checking:
     ```bash
     make lint
     ```
   - Format your code:
     ```bash
     make format
     ```

4. **Commit Your Changes**
   - Stage your changes:
     ```bash
     git add .
     ```
   - Commit with a descriptive message:
     ```bash
     git commit -m "Add feature: brief description of changes"
     ```

5. **Push and Create a Pull Request**
   - Push your changes to your fork:
     ```bash
     git push origin your-branch-name
     ```
   - Go to the GitHub repository and create a pull request from your branch to the main branch.

## Code Style

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide.
- Use type hints for all function and method signatures.
- Keep functions and methods small and focused on a single responsibility.
- Write docstrings for all public modules, functions, and classes.

## Testing

- Write unit tests for all new features and bug fixes.
- Ensure all tests pass before submitting a pull request.
- Use descriptive test function names that explain what is being tested.

## Documentation

- Update the README.md file if you add new features or change existing ones.
- Add docstrings to all public functions, classes, and methods.
- Update any relevant documentation in the `docs` directory.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub with the following information:

- A clear and descriptive title.
- Steps to reproduce the issue (if applicable).
- Expected behavior vs. actual behavior.
- Any relevant error messages or logs.
- Your environment (Python version, operating system, etc.).

## Code Review Process

1. Submit a pull request with your changes.
2. The maintainers will review your code and provide feedback.
3. Address any feedback and update your pull request as needed.
4. Once approved, your changes will be merged into the main branch.

Thank you for contributing to DigitName! 🚀
