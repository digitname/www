export class Portfolio {
  constructor() {
    this.portfolioGrid = document.getElementById('portfolio-grid');
    this.loadingElement = document.getElementById('portfolio-loading');
    this.errorElement = document.getElementById('portfolio-error');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.searchInput = document.getElementById('searchInput');
    this.filterCountEl = document.getElementById('filter-count');
    this.totalCountEl = document.getElementById('total-count');
    this.activeFilter = 'all';
    this.portfolioData = [];
    this.searchTerm = '';
    
    this.init();
  }
  
  async init() {
    try {
      this.showLoading(true);
      await this.loadPortfolioData();
      this.updateCounts();
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
      // Prefer path matching Playwright error route pattern: **/portfolio/*.json
      const response = await fetch('/data/portfolio/portfolio.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Transform repositories map to items array
      const repos = Array.isArray(data) ? data : Object.values(data.repositories || {});
      this.portfolioData = repos.map(repo => this.transformRepoToItem(repo));
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      throw error;
    }
  }
  
  renderPortfolio(filter = 'all') {
    if (!this.portfolioData.length) {
      this.showNoResults();
      this.updateCounts(0, 0);
      return;
    }

    // Apply category filter
    let items = filter === 'all'
      ? [...this.portfolioData]
      : this.portfolioData.filter(item => {
          const categories = Array.isArray(item.categories) ? item.categories : [item.category];
          return categories.map(c => (c || '').toLowerCase()).includes(filter.toLowerCase());
        });

    // Apply search filter
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (term) {
      items = items.filter(item => {
        const haystack = `${item.title || ''} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    // Update counts
    this.updateCounts(items.length, this.portfolioData.length);

    if (items.length === 0) {
      this.showNoResults();
      return;
    }

    this.portfolioGrid.innerHTML = items.map(item => this.createPortfolioItem(item)).join('');
  }
  
  createPortfolioItem(item) {
    return `
      <div class="portfolio-item" data-category="${item.category}" data-categories="${(item.categories || [item.category]).join(',')}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="portfolio-link">
          <div class="portfolio-image">
            <img src="${item.image || '/assets/images/icon-192x192.png'}" alt="${item.title}" loading="lazy">
            <div class="portfolio-overlay">
              <span class="view-project">View Project</span>
            </div>
          </div>
          <div class="portfolio-content">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="portfolio-tags">
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

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value || '';
        this.renderPortfolio(this.activeFilter);
      });
    }
  }
  
  showLoading(show) {
    if (this.loadingElement) {
      this.loadingElement.style.display = show ? 'flex' : 'none';
    }
  }
  
  showError(message) {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'block';
    }
  }

  updateCounts(visible = null, total = null) {
    if (this.totalCountEl && total !== null) {
      this.totalCountEl.textContent = String(total);
    } else if (this.totalCountEl && total === null && Array.isArray(this.portfolioData)) {
      this.totalCountEl.textContent = String(this.portfolioData.length);
    }
    if (this.filterCountEl && visible !== null) {
      this.filterCountEl.textContent = String(visible);
    }
  }

  transformRepoToItem(repo) {
    // Normalize data from repositories listing
    const title = repo.title || repo.name || repo.full_name || 'Untitled Project';
    const description = repo.description || 'No description available.';
    const url = repo.url || repo.homepage || '#';
    const language = (repo.language || '').toString();
    const langLower = language.toLowerCase();

    // Map language/keywords to categories used by buttons
    let category = 'web';
    if (langLower.includes('python')) category = 'python';
    else if (langLower.includes('javascript') || langLower === 'js' || langLower === 'typescript') category = 'javascript';
    else if (langLower.includes('shell') || langLower.includes('docker') || langLower.includes('makefile')) category = 'devops';
    else if (description.toLowerCase().includes('iot') || description.toLowerCase().includes('edge')) category = 'iot';

    const categories = [category];

    const tags = [];
    if (language) tags.push(language);
    if (category && !tags.map(t => t.toLowerCase()).includes(category)) tags.push(category);

    return {
      title,
      description,
      url,
      image: repo.image || null,
      tags,
      category,
      categories
    };
  }
}

