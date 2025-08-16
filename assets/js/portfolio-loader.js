/**
 * Portfolio Loader
 * Loads and displays portfolio items from multiple JSON files
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const PORTFOLIO_FILES = [
        '/data/portfolio/portfolio.json',
        '/data/portfolio/portfolio_github.json',
        '/data/portfolio/portfolio_npm.json',
        '/data/portfolio/portfolio_huggingface.json'
    ];
    
    const USER_PORTALS_PATH = '/data/portfolio/user_portals';
    const PORTFOLIO_GRID_SELECTOR = '#portfolio-grid';
    const LOADING_SELECTOR = '#portfolio-loading';
    const ERROR_SELECTOR = '#portfolio-error';
    const FILTER_COUNT_SELECTOR = '#filter-count';
    const TOTAL_COUNT_SELECTOR = '#total-count';
    
    // State
    let allProjects = [];
    let filteredProjects = [];
    let activeFilter = 'all';
    let searchQuery = '';
    
    // DOM Elements
    const portfolioGrid = document.querySelector(PORTFOLIO_GRID_SELECTOR);
    const loadingElement = document.querySelector(LOADING_SELECTOR);
    const errorElement = document.querySelector(ERROR_SELECTOR);
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Initialize
    async function init() {
        if (!portfolioGrid) return;
        
        try {
            showLoading();
            
            // Load all portfolio data
            const portfolioData = await Promise.all([
                ...PORTFOLIO_FILES.map(loadPortfolioFile),
                loadUserPortals()
            ]);
            
            // Flatten and process all projects
            allProjects = portfolioData.flat().filter(Boolean);
            
            // Initial render
            applyFilters();
            setupEventListeners();
            
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            showError('Failed to load portfolio data. Please try again later.');
        } finally {
            hideLoading();
        }
    }
    
    // Load a single portfolio file
    async function loadPortfolioFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle different response formats
            if (Array.isArray(data)) {
                return data;
            } else if (data.projects) {
                return data.projects;
            } else if (data.repositories) {
                return Object.values(data.repositories);
            }
            
            return [];
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return [];
        }
    }
    
    // Load user portals
    async function loadUserPortals() {
        try {
            const response = await fetch(`${USER_PORTALS_PATH}/index.json`);
            if (!response.ok) return [];
            
            const portals = await response.json();
            const portalPromises = portals.map(portal => 
                fetch(`${USER_PORTALS_PATH}/${portal.file}`).then(res => res.json())
            );
            
            const portalData = await Promise.all(portalPromises);
            return portalData.flat();
        } catch (error) {
            console.error('Error loading user portals:', error);
            return [];
        }
    }
    
    // Apply filters and search
    function applyFilters() {
        filteredProjects = allProjects.filter(project => {
            // Filter by category
            const matchesFilter = activeFilter === 'all' || 
                                (project.categories && project.categories.includes(activeFilter)) ||
                                (project.language && project.language.toLowerCase() === activeFilter);
            
            // Filter by search query
            const matchesSearch = !searchQuery || 
                                (project.name && project.name.toLowerCase().includes(searchQuery)) ||
                                (project.description && project.description.toLowerCase().includes(searchQuery)) ||
                                (project.topics && Array.isArray(project.topics) && 
                                    project.topics.some(topic => topic.toLowerCase().includes(searchQuery)));
            
            return matchesFilter && matchesSearch;
        });
        
        renderPortfolio();
        updateFilterCounts();
    }
    
    // Render portfolio items
    function renderPortfolio() {
        if (!portfolioGrid) return;
        
        if (filteredProjects.length === 0) {
            portfolioGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No projects found matching your criteria.</p>
                </div>`;
            return;
        }
        
        portfolioGrid.innerHTML = filteredProjects.map(project => `
            <div class="portfolio-item" data-categories="${getProjectCategories(project)}">
                <div class="portfolio-item-inner">
                    <div class="portfolio-image">
                        ${getProjectImage(project)}
                        <div class="portfolio-links">
                            <a href="${project.url}" target="_blank" rel="noopener noreferrer" title="View Project">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            ${project.source_url ? `
                                <a href="${project.source_url}" target="_blank" rel="noopener noreferrer" title="View Source">
                                    <i class="fab fa-github"></i>
                                </a>` : ''
                            }
                        </div>
                    </div>
                    <div class="portfolio-content">
                        <h3>${project.name || 'Untitled Project'}</h3>
                        <p>${project.description || 'No description available.'}</p>
                        <div class="portfolio-tags">
                            ${getProjectTags(project).map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Helper functions
    function getProjectCategories(project) {
        if (project.categories && Array.isArray(project.categories)) {
            return project.categories.join(' ');
        }
        return project.language ? project.language.toLowerCase() : 'other';
    }
    
    function getProjectImage(project) {
        if (project.image_url) {
            return `<img src="${project.image_url}" alt="${project.name}">`;
        }
        
        // Generate a placeholder based on project name or language
        const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63'];
        const color = colors[Math.abs(hashCode(project.name || 'project')) % colors.length];
        const initials = (project.name || 'P')
            .split(/[\s-]/)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
            
        return `
            <div class="portfolio-placeholder" style="background-color: ${color}">
                ${initials}
            </div>`;
    }
    
    function getProjectTags(project) {
        const tags = [];
        
        if (project.language) {
            tags.push(project.language);
        }
        
        if (project.topics && Array.isArray(project.topics)) {
            tags.push(...project.topics);
        } else if (project.keywords && Array.isArray(project.keywords)) {
            tags.push(...project.keywords);
        }
        
        // Deduplicate and limit tags
        return [...new Set(tags)].slice(0, 3);
    }
    
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    
    // Update filter counts
    function updateFilterCounts() {
        const filterCount = document.querySelector(FILTER_COUNT_SELECTOR);
        const totalCount = document.querySelector(TOTAL_COUNT_SELECTOR);
        
        if (filterCount) filterCount.textContent = filteredProjects.length;
        if (totalCount) totalCount.textContent = allProjects.length;
    }
    
    // Event handlers
    function setupEventListeners() {
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update filter and re-render
                activeFilter = button.dataset.filter || 'all';
                applyFilters();
            });
        });
        
        // Search input
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchQuery = e.target.value.toLowerCase().trim();
                
                // Debounce search
                searchTimeout = setTimeout(() => {
                    applyFilters();
                }, 300);
            });
        }
    }
    
    // UI Helpers
    function showLoading() {
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    function hideLoading() {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    // Initialize the portfolio
    init();
});
