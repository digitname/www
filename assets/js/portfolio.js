import { debounce } from './utils/helpers.js';

export class Portfolio {
  constructor() {
    // DOM Elements
    this.portfolioGrid = document.getElementById('portfolio-grid');
    this.loadingElement = document.getElementById('portfolio-loading');
    this.errorElement = document.getElementById('portfolio-error');
    this.searchInput = document.getElementById('searchInput');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.filterCountElement = document.getElementById('filter-count');
    this.totalCountElement = document.getElementById('total-count');
    this.filterInfoElement = document.getElementById('filter-info');
    
    // State
    this.portfolioData = [];
    this.filteredData = [];
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.searchTimeout = null;
  }

  // Initialize the portfolio
  async init() {
    try {
      this.showLoading(true);
      this.showError(false);
      
      // Load data from data.json
      const response = await fetch('/data.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.portfolioData = await response.json();
      
      // Process and display data
      this.portfolioData = this.processPortfolioData(this.portfolioData);
      this.updateTotalCount(this.portfolioData.length);
      this.renderPortfolio(this.portfolioData);
      this.updateDashboardStats(this.portfolioData);
      
      // Initial filter
      this.filterPortfolio();
      
      // Add event listeners
      this.addEventListeners();
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      this.showError('Failed to load portfolio data. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }
  
  // Process portfolio data
  processPortfolioData(data) {
    return data.map(item => ({
      ...item,
      // Ensure all required fields have defaults
      theme: item.theme || 'Uncategorized',
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      // Add a category based on theme or other criteria
      category: this.getCategoryFromTheme(item.theme)
    }));
  }
  
  // Categorize items based on theme or other criteria
  getCategoryFromTheme(theme) {
    const themeLower = (theme || '').toLowerCase();
    
    if (themeLower.includes('devops') || themeLower.includes('cloud')) {
      return 'devops';
    } else if (themeLower.includes('web') || themeLower.includes('site') || themeLower.includes('blog')) {
      return 'web';
    } else if (themeLower.includes('iot') || themeLower.includes('edge') || themeLower.includes('device')) {
      return 'iot';
    } else if (themeLower.includes('research') || themeLower.includes('paper') || themeLower.includes('study')) {
      return 'research';
    }
    
    return 'other';
  }
  
  // Render portfolio items
  renderPortfolio(items) {
    if (!items || items.length === 0) {
      this.portfolioGrid.innerHTML = '<p class="no-results">No projects found matching your criteria.</p>';
      return;
    }
    
    this.portfolioGrid.innerHTML = items.map(item => `
      <div class="portfolio-item" data-category="${item.category}" data-theme="${(item.theme || '').toLowerCase()}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="portfolio-link">
          <div class="portfolio-image">
            ${this.getImageMarkup(item)}
            <div class="portfolio-overlay">
              <span class="view-project">View Project</span>
            </div>
          </div>
          <div class="portfolio-content">
            <h3>${item.domain || 'Untitled Project'}</h3>
            <p>${item.description || 'No description available.'}</p>
            ${this.getTagsMarkup(item)}
          </div>
        </a>
      </div>
    `).join('');
    
    this.addPortfolioItemListeners();
  }
  
  // Get image markup with fallback
  getImageMarkup(item) {
    if (item.image) {
      return `<img src="${item.image}" alt="${item.domain || 'Project'}" loading="lazy">`;
    }
    return '<div class="no-image">No Image</div>';
  }
  
  // Get tags markup
  getTagsMarkup(item) {
    const tags = [];
    
    // Add theme as a tag
    if (item.theme) {
      tags.push(`<span class="tag theme">${item.theme}</span>`);
    }
    
    // Add technologies (limit to 3)
    if (Array.isArray(item.technologies) && item.technologies.length > 0) {
      item.technologies.slice(0, 3).forEach(tech => {
        tags.push(`<span class="tag tech">${tech}</span>`);
      });
    }
    
    return tags.length > 0 ? `<div class="tags">${tags.join('')}</div>` : '';
  }
  
  // Filter portfolio items
  filterPortfolio() {
    if (!this.portfolioData || this.portfolioData.length === 0) return;
    
    this.filteredData = this.portfolioData.filter(item => {
      // Filter by search term
      const matchesSearch = !this.searchTerm || 
        (item.domain && item.domain.toLowerCase().includes(this.searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm)) ||
        (item.technologies && item.technologies.some(tech => 
          tech.toLowerCase().includes(this.searchTerm)
        ));
      
      // Filter by active filter
      const matchesFilter = this.activeFilter === 'all' ||
        item.category === this.activeFilter ||
        (item.technologies && item.technologies.includes(this.activeFilter));
      
      return matchesSearch && matchesFilter;
    });
    
    // Update UI
    this.renderPortfolio(this.filteredData);
    this.updateFilterCount(this.filteredData.length);
    
    // Update URL parameters for sharing
    this.updateUrlParams();
  }
  
  // Update dashboard statistics
  updateDashboardStats(data) {
    if (!data || !Array.isArray(data)) return;
    
    const stats = {
      total: data.length,
      categories: {}
    };
    
    data.forEach(item => {
      if (item.category) {
        stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      }
    });
    
    // Update stats in the UI if elements exist
    if (this.totalCountElement) {
      this.totalCountElement.textContent = stats.total;
    }
  }
  
  // Update filter count display
  updateFilterCount(count) {
    if (this.filterCountElement) {
      this.filterCountElement.textContent = count;
    }
    
    if (this.filterInfoElement) {
      this.filterInfoElement.style.display = 'block';
    }
  }
  
  // Update total count display
  updateTotalCount(count) {
    if (this.totalCountElement) {
      this.totalCountElement.textContent = count;
    }
  }
  
  // Show/hide loading state
  showLoading(show) {
    if (this.loadingElement) {
      this.loadingElement.style.display = show ? 'flex' : 'none';
    }
    
    if (this.portfolioGrid) {
      this.portfolioGrid.style.opacity = show ? '0.5' : '1';
    }
  }
  
  // Show/hide error message
  showError(message) {
    if (!this.errorElement) return;
    
    if (message) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
    } else {
      this.errorElement.style.display = 'none';
    }
  }
  
  // Add event listeners to portfolio items
  addPortfolioItemListeners() {
    const items = this.portfolioGrid.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        // Add any item-specific interactions here
        console.log('Portfolio item clicked:', item);
      });
    });
  }
  
  // Add event listeners for search and filter
  addEventListeners() {
    // Search input with debounce
    if (this.searchInput) {
      this.searchInput.addEventListener('input', debounce((e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.filterPortfolio();
      }, 300));
    }
    
    // Filter buttons
    if (this.filterButtons && this.filterButtons.length > 0) {
      this.filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Update active filter
          const filter = button.getAttribute('data-filter');
          if (filter) {
            this.activeFilter = filter;
            
            // Update active state
            this.filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply filter
            this.filterPortfolio();
          }
        });
      });
    }
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      this.readUrlParams();
    });
  }
  
  // Update URL parameters
  updateUrlParams() {
    const params = new URLSearchParams();
    
    if (this.searchTerm) {
      params.set('search', this.searchTerm);
    }
    
    if (this.activeFilter && this.activeFilter !== 'all') {
      params.set('filter', this.activeFilter);
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    
    // Update URL without reloading the page
    window.history.pushState(
      { search: this.searchTerm, filter: this.activeFilter },
      '',
      newUrl
    );
  }
  
  // Read URL parameters on load
  readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Read search term
    const searchParam = params.get('search');
    if (searchParam && this.searchInput) {
      this.searchTerm = searchParam.toLowerCase();
      this.searchInput.value = searchParam;
    }
    
    // Read filter
    const filterParam = params.get('filter');
    if (filterParam) {
      this.activeFilter = filterParam;
      
      // Update active filter button
      if (this.filterButtons && this.filterButtons.length > 0) {
        this.filterButtons.forEach(button => {
          if (button.getAttribute('data-filter') === filterParam) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
      }
    }
    
    // Apply filters if we have data
    if (this.portfolioData && this.portfolioData.length > 0) {
      this.filterPortfolio();
    }
  }
}
