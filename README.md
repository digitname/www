# [digitName.com](http://www.digitname.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Mantine](https://img.shields.io/badge/Mantine-228BE6?style=flat&logo=react&logoColor=white)](https://mantine.dev/)

Digital naming and domain management tools and resources, now rebuilt with modern web technologies.

## 🚀 Features

- ⚡ Blazing fast performance with Vite
- 🎨 Beautiful UI components with Mantine
- 📱 Fully responsive design
- 🔄 Easy content updates through configuration
- 🔒 Secure environment variable management
- 🏗️ Modern React architecture

## 🛠️ Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher (comes with Node.js)
- Git

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/digitname/www.git
   cd www
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup-env.sh
   ```
   This will:
   - Create a `.env` file from the example
   - Set up required directories
   - Install all dependencies

3. **Start the development server**
   ```bash
   make run
   ```
   The application will be available at `http://localhost:5173`

# DigitName

A Python package to manage your development accounts and generate a portfolio based on your activity across various platforms.

## 🚀 Features

- Centralized management of development accounts (GitHub, NPM, PyPI, Docker Hub, GitLab)
- Beautiful, responsive portfolio generation
- Interactive token setup assistant
- Secure environment variable management
- Extensible architecture for adding more platforms
- Command-line interface for easy management

## 📦 Installation

### Using pip (recommended)

```bash
# Install the package in development mode
pip install -e .

# Install development dependencies
pip install -e ".[dev]"
```

### Using Poetry

```bash
# Install dependencies
poetry install

# Activate the virtual environment
poetry shell
```

## 🛠️ Usage

### Quick Start

1. **Setup Environment**
   ```bash
   # Create .env file from example
   make setup-env
   
   # Run interactive token setup (recommended)
   make setup-tokens
   ```
   This will guide you through setting up all required API tokens.

2. **Generate Your Portfolio**
   ```bash
   # Install in development mode
   pip install -e .
   
   # Generate your portfolio
   python -m digitname generate-portfolio
   ```
   This will generate your portfolio in the `portfolio` directory by default.

3. **View Your Portfolio**
   Open `portfolio/index.html` in your web browser.

### Manual Configuration (Alternative)

If you prefer to set up tokens manually:

1. **Initialize Configuration**
   ```bash
   python -m digitname init
   ```
   This creates a `config/accounts.toml` file with default values.

2. **Edit Configuration**
   Update the `config/accounts.toml` file with your account details:
   ```toml
   [github]
   username = "your_github_username"
   token = "your_github_token"

   [npm]
   username = "your_npm_username"
   email = "your.email@example.com"
   token = "your_npm_token"
   
   # ... other services
   ```

## 🛠 Development

### Project Structure

```
.
├── digitname/            # Main package
│   ├── __init__.py
│   ├── accounts.py       # Account management
│   ├── cli.py            # Command-line interface
│   ├── portfolio.py      # Portfolio generation
│   └── templates/        # HTML/CSS/JS templates
├── scripts/              # Utility scripts
│   ├── setup-tokens.py   # Interactive token setup
│   └── setup-tokens.sh   # Setup script wrapper
├── tests/                # Test files
├── config/               # Configuration files
├── portfolio/            # Generated portfolio (created after first run)
├── pyproject.toml        # Project metadata and dependencies
├── setup.py              # Package installation script
└── README.md            # This file
```

### Available Commands

#### Setup
- `make setup-env` - Create .env file from example
- `make setup-tokens` - Interactive setup for API tokens (recommended)
- `make check-env` - Verify environment configuration

#### Development
- `make install` - Install dependencies
- `make test` - Run tests
- `make lint` - Run linters
- `make format` - Format code
- `make clean` - Clean build artifacts
- `make build` - Build package
- `make publish` - Publish to PyPI
- `make portfolio` - Generate portfolio

### Token Management

Use the interactive token setup for the best experience:

```bash
make setup-tokens
```

This will guide you through:
1. Opening the token generation pages in your browser
2. Generating tokens with the correct permissions
3. Securely storing them in your local `.env` file

Supported services:
- GitHub
- NPM
- PyPI
- Docker Hub
- GitLab

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Python and love
- Uses [Typer](https://typer.tiangolo.com/) for CLI
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Tabler Icons](https://tabler-icons.io/)

## 🏗️ Project Structure

```
www/
├── assets/              # Static assets
│   └── portfolio/      # Portfolio assets
│       ├── icons/      # Project icons (100x100px)
│       ├── thumbnails/ # Project thumbnails (400x300px)
│       └── data.json   # Portfolio data (auto-generated)
├── config/             # Service configurations
│   ├── github/         # GitHub API config
│   ├── npm/            # NPM config
│   ├── pypi/           # PyPI config
│   ├── docker/         # Docker config
│   └── gitlab/        # GitLab config
├── react-app/          # React application (main frontend)
│   ├── public/         # Static files
│   └── src/            # Source files
│       ├── assets/     # Images, fonts, etc.
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── styles/     # Global styles
│       ├── utils/      # Utility functions
│       ├── App.jsx     # Main App component
│       └── main.jsx    # Application entry point
├── scripts/            # Utility scripts
├── .env.example        # Environment variables example
├── .gitignore          # Git ignore file
├── Makefile            # Project commands
├── package.json        # Project configuration
├── README.md           # This file
└── requirements.txt    # Python dependencies
```

## 🛠️ Development

### Available Commands

```bash
# Install dependencies
make deps

# Start development server (port 8003)
make run

# Build for production
make build

# Run tests
make test

# Clean build artifacts
make clean

# Create a new release
make release

# Update portfolio data and generate assets
make update-portfolio
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
NODE_ENV=development
PORT=3000

# GitHub
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_token
GITHUB_EMAIL=your_github_email

# NPM
NPM_USERNAME=your_npm_username
NPM_EMAIL=your_npm_email
NPM_TOKEN=your_npm_token
```

## 🖼️ Portfolio Management

### Adding a New Project

1. Add your project image to `assets/portfolio/` (e.g., `myproject.jpg` or `myproject.png`)
2. Run the portfolio update script:
   ```bash
   make update-portfolio
   ```
3. The script will:
   - Generate a thumbnail (400x300px) in `assets/portfolio/thumbnails/`
   - Generate an icon (100x100px) in `assets/portfolio/icons/`
   - Update `assets/portfolio/data.json` with the new project

### Portfolio Data Structure

```json
{
  "lastUpdated": "2025-05-26T22:48:00.245Z",
  "items": [
    {
      "id": "test-project",
      "title": "Test Project",
      "description": "Description for test-project",
      "image": "test-project.png",
      "url": "https://example.com/projects/test-project",
      "tags": ["web", "design"],
      "date": "2025-05-26",
      "metadata": {
        "width": 1,
        "height": 1,
        "format": "png",
        "size": "0.07 KB"
      },
      "thumbnail": "thumbnails/test-project.png",
      "icon": "icons/test-project.png"
    }
  ],
  "stats": {
    "totalItems": 1,
    "lastUpdated": "2025-05-26T22:48:00.245Z"
  }
}
```

### Supported Image Formats
- `.jpg` / `.jpeg`
- `.png`
- `.webp`

### Thumbnails and Icons
- Thumbnails are generated at 400x300px (JPEG format, 80% quality)
- Icons are generated at 100x100px (PNG format, 90% quality)
- Original aspect ratio is maintained with `cover` fit
- Images are never enlarged beyond their original dimensions

## 🚀 My Projects

Here are some of my recent projects:

### [Test Project](https://example.com/projects/test-project)
- **Description**: Description for test-project
- **Technologies**: Web, Design
- **Last Updated**: May 26, 2025

## 📦 Publishing

### Publish to NPM

```bash
make publish-npm
```

### Publish to PyPI

1. First, make sure you have set up your PyPI token:
   ```bash
   make setup-tokens
   # Select PyPI and follow the instructions
   ```

2. Build and publish the package:
   ```bash
   make build
   make publish-pypi
   ```

   The publish command will use the `PYPI_TOKEN` from your `.env` file for authentication.

3. If you need to use the token directly with twine:
   ```bash
   python -m twine upload -u __token__ -p ${PYPI_TOKEN} dist/*
   ```

### Publish to Docker Hub

```bash
make publish-docker
```

## Reports

+ [Raport rynku domen, 2024.digitname.com - Jak zmieniał się rynek domen w ostatniej dekadzie? Jak zmieni się rynek do roku 2030?](https://2024.digitname.com/)

## Portfolio

+ [domainLeak.com](https://www.domainleak.com/)

## Services

+ [Pomoc askDomainer PL](https://oferta.askdomainer.com/)

## Domain Information

+ [Numery telefonów i domeny internetowe](NUMERY.md)
+ [100 najczęstszych technicznych problemów z domenami internetowymi](http://100.askdomainer.com/PL)

---



![obraz](https://github.com/tom-sapletta-com/rynek-pracy-2030-eu/assets/5669657/24abdad9-5aff-4834-95a0-d7215cc6e0bc)

## Tom Sapletta

Na co dzień DevOps i ewangelista hipermodularyzacji, oferuję wsparcie techniczne dla startupów i specjalistów.
Posiadam globalne doświadczenie w research-u i wdrażaniu i utrzymaniu systemów informatycznych. 
Ułatwiam dopasowanie rozwiązania do potrzeb, zapraszam:

+ [Tom Sapletta, Linkedin](https://www.linkedin.com/in/tom-sapletta-com)
+ [Tom Sapletta, Github](https://github.com/tom-sapletta-com)
+ [Softreck - Leadership Through Software Development](https://softreck.com/)

### Usługi

+ [Pomoc askDomainer](https://oferta.askdomainer.com/)



### Raporty:

+ [Rynek pracy w EU okiem Polaka - Raport 2024 - Jak zmieniał się rynek pracy w ostatniej dekadzie? Jak zmieni się rynek do roku 2030?](https://2024.teleworking.info/)
+ [Detekcja obiektów w systemach wizyjnych - Raport 2024 - Jak zmieniał się rynek systemów wizyjnych w zastosowaniach przemysłowych w ostatniej dekadzie? Jak zmieni się rynek do roku 2030?](https://2024.teleoperator.info/)


---



<script src="https://cdn.jsdelivr.net/npm/mermaid@10.8.0/dist/mermaid.min.js"></script>
<script>
var config = {
    startOnReady:true,
    theme: 'forest',
    flowchart:{
            useMaxWidth:false,
            htmlLabels:true
        }
};
mermaid.initialize(config);
mermaid.init(undefined, '.language-mermaid');
</script>

<script type="module">
    /**
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark'
  });
  */
</script>


---
+ [edit](https://github.com/askdomainer/www/edit/main/README.md)

