// Main Application Entry Point
import { debounce } from './utils/helpers.js';
import portfolioConfig from './config/portfolio-config.js';
import { Portfolio } from './portfolio.js';

class App {
  constructor() {
    this.portfolio = null;
    this.initialize();
  }

  async initialize() {
    // Initialize components when DOM is loaded
    document.addEventListener('DOMContentLoaded', async () => {
      // Initialize core components
      this.initMobileMenu();
      this.initSmoothScrolling();
      this.initLazyLoading();
      this.initScrollToTop();
      this.initAnalytics();
      
      // Initialize portfolio if the container exists
      if (document.getElementById('portfolio-grid')) {
        this.portfolio = new Portfolio();
        await this.portfolio.init();
      }
      
      this.addEventListeners();
    });
  }

  initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
    }
  }

  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Close mobile menu if open
          const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
          const mainNav = document.querySelector('.main-nav');
          if (mobileMenuToggle && mainNav && mainNav.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
          }
        }
      });
    });
  }

  initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading is supported
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      const lazyLoad = () => {
        const lazyImages = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
        
        if ('IntersectionObserver' in window) {
          const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
                lazyImageObserver.unobserve(lazyImage);
              }
            });
          });

          lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
          });
        } else {
          // Fallback for browsers that don't support IntersectionObserver
          let active = false;
          
          const lazyLoadImages = () => {
            if (active === false) {
              active = true;
              
              setTimeout(() => {
                lazyImages.forEach(lazyImage => {
                  if (
                    lazyImage.getBoundingClientRect().top <= window.innerHeight &&
                    lazyImage.getBoundingClientRect().bottom >= 0 &&
                    getComputedStyle(lazyImage).display !== 'none'
                  ) {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImages = lazyImages.filter(image => image !== lazyImage);
                    
                    if (lazyImages.length === 0) {
                      document.removeEventListener('scroll', lazyLoadImages);
                      window.removeEventListener('resize', lazyLoadImages);
                      window.removeEventListener('orientationchange', lazyLoadImages);
                    }
                  }
                });
                
                active = false;
              }, 200);
            }
          };
          
          document.addEventListener('scroll', lazyLoadImages);
          window.addEventListener('resize', lazyLoadImages);
          window.addEventListener('orientationchange', lazyLoadImages);
          
          // Initial check
          lazyLoadImages();
        }
      };
      
      lazyLoad();
    }
  }

  initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopBtn);

    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    };

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', debounce(handleScroll, 100));
    handleScroll(); // Initial check
  }

  initAnalytics() {
    // Initialize analytics if needed
    if (typeof gtag !== 'undefined') {
      gtag('config', 'YOUR-GA-TRACKING-ID');
    }
  }

  addEventListeners() {
    // Handle window resize with debounce
    window.addEventListener('resize', debounce(() => {
      // Handle responsive layout changes
    }, 250));

    // Handle print styles
    window.matchMedia('print').addListener(mql => {
      if (mql.matches) {
        document.body.classList.add('printing');
      } else {
        document.body.classList.remove('printing');
      }
    });
  }
}

// Initialize the application
const app = new App();

export default app;
