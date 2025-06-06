// Portfolio Configuration
const portfolioConfig = {
  // Default filter options
  filters: [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'design', label: 'UI/UX Design' },
    { id: 'devops', label: 'DevOps' },
    { id: 'iot', label: 'IoT' },
    { id: 'research', label: 'Research' }
  ],
  
  // Default sort options
  sortOptions: [
    { id: 'date-desc', label: 'Newest First' },
    { id: 'date-asc', label: 'Oldest First' },
    { id: 'title-asc', label: 'Title (A-Z)' },
    { id: 'title-desc', label: 'Title (Z-A)' }
  ],
  
  // Default settings
  defaults: {
    itemsPerPage: 12,
    defaultSort: 'date-desc',
    imagePlaceholder: '/assets/images/placeholder.png',
    animationDuration: 300
  },
  
  // API endpoints
  endpoints: {
    projects: '/api/projects',
    project: (id) => `/api/projects/${id}`,
    search: (query) => `/api/search?q=${encodeURIComponent(query)}`
  },
  
  // LocalStorage keys
  storageKeys: {
    darkMode: 'darkMode',
    sortPreference: 'portfolio_sort_preference',
    viewPreference: 'portfolio_view_preference'
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
};

export default portfolioConfig;
