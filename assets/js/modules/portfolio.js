export class Portfolio {
  constructor() {
    this.portfolioGrid = document.getElementById('portfolio-grid');
    this.loadingElement = document.getElementById('portfolio-loading');
    this.errorElement = document.getElementById('portfolio-error');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.activeFilter = 'all';
    this.portfolioData = [];
    
    this.init();
  }
  
  async init() {
    try {
      this.showLoading(true);
      await this.loadPortfolioData();
      this.renderPortfolio();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing portfolio:', error);
      this.showError('Failed to load portfolio. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }
  
  async loadPortfolioData() {
    try {
      const response = await fetch('/assets/data/portfolio.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.portfolioData = data.items;
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      throw error;
    }
  }
  
  renderPortfolio(filter = 'all') {
    if (!this.portfolioData.length) {
      this.showNoResults();
      return;
    }
    
    const filteredItems = filter === 'all' 
      ? this.portfolioData 
      : this.portfolioData.filter(item => item.category === filter);
    
    if (filteredItems.length === 0) {
      this.showNoResults();
      return;
    }
    
    this.portfolioGrid.innerHTML = filteredItems.map(item => this.createPortfolioItem(item)).join('');
  }
  
  createPortfolioItem(item) {
    return `
      <div class="portfolio-item" data-category="${item.category}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="portfolio-link">
          <div class="portfolio-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="portfolio-overlay">
              <span class="view-project">View Project</span>
            </div>
          </div>
          <div class="portfolio-content">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="tags">
              ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </a>
      </div>
    `;
  }
  
  showNoResults() {
    this.portfolioGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-content">
          <i class="fas fa-search"></i>
          <h3>No Projects Found</h3>
          <p>We couldn't find any projects matching your criteria.</p>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Filter buttons
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.dataset.filter;
        
        // Update active state
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply filter
        this.activeFilter = filter;
        this.renderPortfolio(filter);
      });
    });
  }
  
  showLoading(show) {
    if (this.loadingElement) {
      this.loadingElement.style.display = show ? 'block' : 'none';
    }
  }
  
  showError(message) {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
      setTimeout(() => {
        this.errorElement.style.display = 'none';
      }, 5000);
    }
  }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('portfolio-grid')) {
    new Portfolio();
  }
});
