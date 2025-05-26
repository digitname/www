// Common types for the application

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  thumbnail: string;
  icon: string;
  url: string;
  tags: string[];
  date: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: string;
  };
}

export interface PortfolioData {
  lastUpdated: string;
  items: Project[];
  stats?: {
    totalItems: number;
    lastUpdated: string;
  };
}

// Add other types as needed for your application
