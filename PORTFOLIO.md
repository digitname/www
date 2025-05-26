# Portfolio Management System

This document explains the portfolio management system, file structure, and how to work with portfolio data and assets.

## Project Structure

```
www/
├── assets/
│   └── portfolio/           # Portfolio assets
│       ├── icons/          # Project icons (100x100px)
│       ├── thumbnails/     # Project thumbnails (400x300px)
│       └── data.json       # Portfolio data (auto-generated)
├── config/                 # Service configurations
│   ├── github/config.js    # GitHub API config
│   ├── npm/config.js       # NPM config
│   ├── pypi/config.js      # PyPI config
│   ├── docker/config.js    # Docker config
│   └── gitlab/config.js    # GitLab config
├── react-app/              # React application
│   ├── public/             # Static files
│   └── src/
│       ├── assets/        # Application assets
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       │   ├── Home.jsx    # Home page
│       │   └── Portfolio.jsx # Portfolio page
│       ├── styles/         # Global styles
│       ├── utils/          # Utility functions
│       ├── App.jsx         # Main App component
│       └── main.jsx        # Application entry point
├── scripts/
│   ├── update-portfolio.js  # Script to update portfolio data
│   └── setup-env.sh        # Environment setup script
├── .env.example            # Example environment variables
├── .gitignore             # Git ignore file
├── Makefile               # Project commands
├── package.json           # Project configuration
└── README.md              # Main documentation
```

## JavaScript Files Overview

### Root Directory
- `package.json`: Contains project metadata, dependencies, and scripts
- `Makefile`: Defines common tasks for the project

### React Application (`react-app/`)
- `src/main.jsx`: Entry point that renders the React application
- `src/App.jsx`: Main application component with routing
- `src/pages/Home.jsx`: Home page component
- `src/pages/Portfolio.jsx`: Portfolio page component that displays projects
- `src/components/`: Reusable UI components
- `src/utils/`: Utility functions and helpers

### Scripts (`scripts/`)
- `update-portfolio.js`: Processes portfolio images and generates thumbnails/icons
- `setup-env.sh`: Sets up the development environment

## Portfolio Management

### Adding a New Project

1. Add your project image to `assets/portfolio/` (e.g., `myproject.jpg`)
2. Run the portfolio update script:
   ```bash
   make update-portfolio
   ```

### How the Portfolio System Works

1. **Data Flow**:
   - Place your project images in `assets/portfolio/`
   - Run `make update-portfolio` to process the images
   - The script will:
     - Generate thumbnails (400x300px) in `assets/portfolio/thumbnails/`
     - Generate icons (100x100px) in `assets/portfolio/icons/`
     - Update `assets/portfolio/data.json` with project metadata

2. **Data Structure** (`data.json`):
   ```json
   {
     "lastUpdated": "2025-05-27T00:00:00.000Z",
     "items": [
       {
         "id": "project-id",
         "title": "Project Name",
         "description": "Project description",
         "image": "project.jpg",
         "thumbnail": "thumbnails/project.jpg",
         "icon": "icons/project.jpg",
         "url": "https://example.com",
         "tags": ["web", "react"],
         "date": "2025-01-01"
       }
     ]
   }
   ```

## Makefile Commands

```bash
# Start development server (port 8003)
make run

# Build for production
make build

# Update portfolio data and generate assets
make update-portfolio

# Clean build artifacts
make clean

# Install dependencies
make install

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Build package
make build

# Publish to PyPI
make publish
```

## Development Server

The development server runs on port 8003. Start it with:

```bash
make run
```

Then open http://localhost:8003 in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
PORT=8003
NODE_ENV=development

# GitHub
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_token

# NPM
NPM_USERNAME=your_npm_username
NPM_EMAIL=your_npm_email
NPM_TOKEN=your_npm_token
```

## Troubleshooting

- If you get a port conflict, make sure no other service is using port 8003
- Run `make clean` if you encounter build issues
- Check the browser's developer console for any JavaScript errors
