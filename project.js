document.addEventListener('DOMContentLoaded', function() {
    // Hide loader after page loads
    setTimeout(function() {
        document.getElementById('loader').classList.add('fade-out');
    }, 1000);

    // Set current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update date elements
    document.getElementById('last-updated').textContent = formattedDate;
    document.getElementById('current-date').textContent = formattedDate;

    // Project data
    const projectsData = [
        {
            name: "pifunc",
            releaseDate: "Mar 19, 2025",
            description: "PIfunc - Protocol Interface Functions - One function, every protocol. Everywhere.",
            useCase: "PIfunc revolutionizes how you build networked applications by letting you write your function once and expose it via multiple communication protocols simultaneously. No duplicate code. No inconsistencies. Just clean, maintainable, protocol-agnostic code.",
            link: "https://pypi.org/project/pifunc/",
            tags: ["automation", "python", "modularity"]
        },
        {
            name: "mdirtree",
            releaseDate: "Nov 24, 2024",
            description: "Generate directory structures from ASCII art or Markdown files.",
            useCase: "Ideal for automating the creation of nested folder structures based on visual representations.",
            link: "https://pypi.org/project/mdirtree/",
            tags: ["automation", "python", "modularity"]
        },
        {
            name: "markdown2code",
            releaseDate: "Nov 21, 2024",
            description: "Convert Markdown files into organized project structures with code files.",
            useCase: "Streamlines the process of translating documentation into functional codebases, bridging the gap between planning and implementation.",
            link: "https://pypi.org/project/markdown2code/",
            tags: ["automation", "python", "markdown"]
        },
        {
            name: "dynapsys",
            releaseDate: "Nov 20, 2024",
            description: "Dynamic Python System Deployment Tools.",
            useCase: "Automates the deployment and management of Python-based systems, enabling rapid prototyping and scaling.",
            link: "https://pypi.org/project/dynapsys/",
            tags: ["automation", "python", "deployment"]
        },
        {
            name: "uripoint",
            releaseDate: "Nov 12, 2024",
            description: "A flexible Python library for endpoint management and URI processing.",
            useCase: "Simplifies the handling of API endpoints and URI parsing, making it ideal for microservices and web applications.",
            link: "https://pypi.org/project/uripoint/",
            tags: ["api", "python", "microservices"]
        },
        {
            name: "dialogstream",
            releaseDate: "Nov 2, 2024",
            description: "A flexible stream routing and filtering system with support for scheduled tasks and event reactions.",
            useCase: "Enables real-time data processing and task automation in distributed systems.",
            link: "https://pypi.org/project/dialogstream/",
            tags: ["automation", "python", "streaming"]
        },
        {
            name: "biocomp",
            releaseDate: "Oct 18, 2024",
            description: "BioComp 'Coded Life' is a domain-specific language (DSL) proposal for education and implementing biocomputing.",
            useCase: "Provides tools for simulating biological processes and experimenting with computational biology concepts.",
            link: "https://pypi.org/project/biocomp/",
            tags: ["dsl", "python", "biology"]
        },
        {
            name: "browseek",
            releaseDate: "Oct 17, 2024",
            description: "Advanced multi-browser automation library.",
            useCase: "Facilitates cross-browser testing and automation, ensuring consistent functionality across platforms.",
            link: "https://pypi.org/project/browseek/",
            tags: ["automation", "python", "browsers"]
        },
        {
            name: "vocochat",
            releaseDate: "Oct 15, 2024",
            description: "A tool for voice-based chat interactions.",
            useCase: "Enables natural language processing and voice-controlled systems for conversational interfaces.",
            link: "https://pypi.org/project/vocochat/",
            tags: ["voice", "python", "nlp"]
        },
        {
            name: "salomos",
            releaseDate: "Oct 15, 2024",
            description: "A Python package that provides a domain-specific language (DSL) processor for executing commands based on sentences stored in a SQLite database.",
            useCase: "Automates task execution based on predefined instructions, useful for workflow automation and scripting.",
            link: "https://pypi.org/project/salomos/",
            tags: ["dsl", "python", "automation"]
        },
        {
            name: "dobyemail",
            releaseDate: "Oct 15, 2024",
            description: "A comprehensive Python package for handling various email operations.",
            useCase: "Simplifies email sending, receiving, and processing workflows, ideal for automated communication systems.",
            link: "https://pypi.org/project/dobyemail/",
            tags: ["automation", "python", "email"]
        },
        {
            name: "codialog",
            releaseDate: "Aug 1, 2024",
            description: "Dialogue systems for code interaction and generation.",
            useCase: "Creates conversational interfaces for code-related tasks and code generation workflows.",
            link: "https://pypi.org/project/codialog/",
            tags: ["nlp", "python", "code-generation"]
        },
        {
            name: "pyfunc-config",
            releaseDate: "Jul 15, 2024",
            description: "Libraries for CameraMonit, OCR, Fin-Officer, CFO, and other projects.",
            useCase: "Provides reusable components for financial automation, image processing, and monitoring systems.",
            link: "https://pypi.org/project/pyfunc-config/",
            tags: ["modularity", "python", "configuration"]
        },
        {
            name: "pyfunc2",
            releaseDate: "Jul 14, 2024",
            description: "Libraries for CameraMonit, OCR, Fin-Officer, CFO, and other projects.",
            useCase: "Similar to `pyfunc-config`, this package offers modular utilities for financial and operational workflows.",
            link: "https://pypi.org/project/pyfunc2/",
            tags: ["modularity", "python", "utilities"]
        },
        {
            name: "dialoget",
            releaseDate: "Dec 10, 2023",
            description: "A Python decorator for displaying dynamic log messages.",
            useCase: "Enhances logging capabilities by allowing real-time updates and contextual information in logs.",
            link: "https://pypi.org/project/dialoget/",
            tags: ["logging", "python", "debugging"]
        }
    ];

    // Generate project items
    renderProjectItems(projectsData);

    // Set up search functionality
    const searchProject = document.getElementById('searchProject');
    searchProject.addEventListener('keyup', function() {
        filterProjectItems();
    });

    // Set up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Filter project items
            filterProjectItems();
        });
    });

    // Function to render project items
    function renderProjectItems(projects) {
        const projectContainer = document.getElementById('project-items');
        projectContainer.innerHTML = ''; // Clear existing items

        projects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            projectItem.setAttribute('data-name', project.name.toLowerCase());
            projectItem.setAttribute('data-tags', project.tags.join(',').toLowerCase());

            projectItem.innerHTML = `
                <div class="project-item-header">
                    
                    <h3><a href="${project.link}" class="view-project" target="_blank">${project.name}</a></h3>
                    
                </div>
                <div class="tech-tags">
                        ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    </div>
                <div class="project-item-body">
                    <div class="project-item-description">
                        <p>${project.description}</p>
                        <p><strong>Use Case:</strong> ${project.useCase}</p>
                        <div class="project-item-date">Released: ${project.releaseDate}</div>
                    </div>
                    
                </div>
            `;

            projectContainer.appendChild(projectItem);
        });
    }

    // Function to filter project items
    function filterProjectItems() {
        const searchTerm = searchProject.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            const itemName = item.getAttribute('data-name');
            const itemTags = item.getAttribute('data-tags');

            let matchesSearch = itemName.includes(searchTerm) || itemTags.includes(searchTerm);
            let matchesFilter = activeFilter === 'all' || (activeFilter === 'newest' ? true : itemTags.includes(activeFilter));

            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Special case for "newest" filter
        if (activeFilter === 'newest') {
            // Get all visible items (that match search)
            const visibleItems = Array.from(projectItems).filter(item =>
                item.style.display !== 'none'
            );

            // Sort by newest first
            const sortedItems = visibleItems.sort((a, b) => {
                const aIndex = Array.from(projectItems).indexOf(a);
                const bIndex = Array.from(projectItems).indexOf(b);
                return aIndex - bIndex; // Our data is already sorted by date
            });

            // Show only the 5 newest items
            visibleItems.forEach((item, index) => {
                if (index >= 5) {
                    item.style.display = 'none';
                }
            });
        }
    }

    // Initialize filter with all projects
    document.querySelector('.filter-btn[data-filter="all"]').click();
});