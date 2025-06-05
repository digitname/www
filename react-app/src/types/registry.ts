export type RegistryType = 'composer' | 'docker' | 'npm' | 'pypi';

export interface RegistryPackage {
  name: string;
  description?: string;
  version?: string;
  downloads?: number;
  stars?: number;
  type: RegistryType;
  url: string;
  lastUpdated?: string;
}

export interface RegistrySearchResult {
  type: RegistryType;
  packages: RegistryPackage[];
  loading: boolean;
  error: string | null;
}

export const REGISTRY_TYPES: RegistryType[] = ['composer', 'docker', 'npm', 'pypi'];

export const REGISTRY_LABELS: Record<RegistryType, string> = {
  composer: 'Composer',
  docker: 'Docker',
  npm: 'NPM',
  pypi: 'PyPI'
};

export const REGISTRY_ICONS: Record<RegistryType, string> = {
  composer: '📦',
  docker: '🐳',
  npm: '📦',
  pypi: '🐍'
};
