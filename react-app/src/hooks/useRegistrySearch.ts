import { useState, useEffect } from 'react';
import { RegistryPackage, RegistryType } from '../types/registry';

const REGISTRY_BASE_URLS = {
  composer: 'https://packagist.org',
  docker: 'https://hub.docker.com/v2',
  npm: 'https://registry.npmjs.org',
  pypi: 'https://pypi.org/pypi'
};

const useRegistrySearch = (searchTerm: string, registryType: RegistryType | 'all') => {
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        setPackages([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const types: RegistryType[] = 
          registryType === 'all' 
            ? ['composer', 'docker', 'npm', 'pypi'] 
            : [registryType];
        
        const results = await Promise.all(
          types.map(type => fetchPackages(type, searchTerm))
        );
        
        setPackages(results.flat());
      } catch (err) {
        console.error('Error searching packages:', err);
        setError('Failed to fetch packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      search();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, registryType]);

  return { packages, loading, error };
};

const fetchPackages = async (type: RegistryType, searchTerm: string): Promise<RegistryPackage[]> => {
  try {
    switch (type) {
      case 'composer':
        return await fetchComposerPackages(searchTerm);
      case 'docker':
        return await fetchDockerImages(searchTerm);
      case 'npm':
        return await fetchNpmPackages(searchTerm);
      case 'pypi':
        return await fetchPyPIPackages(searchTerm);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching ${type} packages:`, error);
    return [];
  }
};

// Implement the fetch functions for each registry type
const fetchComposerPackages = async (searchTerm: string): Promise<RegistryPackage[]> => {
  const response = await fetch(`${REGISTRY_BASE_URLS.composer}/search.json?q=${encodeURIComponent(searchTerm)}`);
  const data = await response.json();
  
  return (data.results || []).map((pkg: any) => ({
    name: pkg.name,
    description: pkg.description,
    downloads: pkg.downloads,
    type: 'composer',
    url: `https://packagist.org/packages/${pkg.name}`,
  }));
};

const fetchDockerImages = async (searchTerm: string): Promise<RegistryPackage[]> => {
  const response = await fetch(`${REGISTRY_BASE_URLS.docker}/search/repositories/?query=${encodeURIComponent(searchTerm)}`);
  const data = await response.json();
  
  return (data.results || []).map((image: any) => ({
    name: image.name,
    description: image.description,
    stars: image.star_count,
    type: 'docker',
    url: `https://hub.docker.com/r/${image.name}`,
    lastUpdated: image.last_updated,
  }));
};

const fetchNpmPackages = async (searchTerm: string): Promise<RegistryPackage[]> => {
  const response = await fetch(`${REGISTRY_BASE_URLS.npm}/-/v1/search?text=${encodeURIComponent(searchTerm)}`);
  const data = await response.json();
  
  return (data.objects || []).map((pkg: any) => ({
    name: pkg.package.name,
    description: pkg.package.description,
    version: pkg.package.version,
    type: 'npm',
    url: `https://www.npmjs.com/package/${pkg.package.name}`,
  }));
};

const fetchPyPIPackages = async (searchTerm: string): Promise<RegistryPackage[]> => {
  const response = await fetch(`https://pypi.org/search/?q=${encodeURIComponent(searchTerm)}&format=json`);
  const data = await response.json();
  
  return (data.results || []).map((pkg: any) => ({
    name: pkg.name,
    description: pkg.summary,
    version: pkg.version,
    type: 'pypi',
    url: `https://pypi.org/project/${pkg.name}/`,
  }));
};

export default useRegistrySearch;
