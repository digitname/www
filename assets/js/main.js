document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
  
  // Portfolio filtering and search
  const portfolioGrid = document.getElementById('portfolioGrid');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const noResults = document.getElementById('noResults');
  
  if (portfolioGrid && searchInput && filterButtons.length > 0) {
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    let activeFilter = 'all';
    
    // Filter functionality
    function filterPortfolio() {
      const searchTerm = searchInput.value.toLowerCase();
      let hasResults = false;
      
      portfolioItems.forEach(item => {
        const itemTitle = item.querySelector('h3').textContent.toLowerCase();
        const itemDescription = item.querySelector('.portfolio-description').textContent.toLowerCase();
        const itemTags = item.getAttribute('data-tags');
        const itemCategory = item.getAttribute('data-category');
        
        const matchesSearch = itemTitle.includes(searchTerm) || 
                            itemDescription.includes(searchTerm) ||
                            itemTags.includes(searchTerm);
        
        const matchesFilter = activeFilter === 'all' || 
                           itemCategory === activeFilter ||
                           itemTags.includes(activeFilter);
        
        if (matchesSearch && matchesFilter) {
          item.style.display = '';
          hasResults = true;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Show/hide no results message
      if (noResults) {
        noResults.style.display = hasResults ? 'none' : 'flex';
      }
      
      // Animate items
      animateItems();
    }
    
    // Animate items with staggered delay
    function animateItems() {
      const visibleItems = Array.from(portfolioItems).filter(item => 
        item.style.display !== 'none'
      );
      
      visibleItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.animation = '';
          void item.offsetWidth; // Trigger reflow
          item.style.animation = 'fadeInUp 0.5s ease forwards';
          item.style.animationDelay = `${index * 0.1}s`;
        }, 10);
      });
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterPortfolio);
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        // Update active filter
        activeFilter = this.getAttribute('data-filter');
        // Filter portfolio
        filterPortfolio();
      });
    });
    
    // Initialize portfolio
    filterPortfolio();
  }
  
  // Dark mode toggle
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
  document.body.appendChild(darkModeToggle);
  
  // Check for saved user preference or system preference
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');
  
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Toggle dark/light mode
  darkModeToggle.addEventListener('click', function() {
    const isDark = document.body.classList.toggle('dark-mode');
    this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (mainNav && mainNav.classList.contains('active')) {
          mobileMenuToggle.classList.remove('active');
          mainNav.classList.remove('active');
        }
      }
    });
  });
});
