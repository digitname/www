import { Group, Card, Text, Badge, TextInput, Select, Loader, SimpleGrid, Title, Box, Anchor, Tooltip } from '@mantine/core';
import { IconSearch, IconExternalLink, IconDownload, IconStar } from '@tabler/icons-react';
import { useState } from 'react';
import useRegistrySearch from '../../hooks/useRegistrySearch';
import { RegistryType } from '../../types/registry';

export const RegistryViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [registryType, setRegistryType] = useState<RegistryType | 'all'>('all');
  const { packages, loading, error } = useRegistrySearch(searchTerm, registryType);

  const formatNumber = (num?: number) => {
    if (num === undefined) return 'N/A';
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  const getRegistryIcon = (type: string) => {
    switch (type) {
      case 'composer': return '📦';
      case 'docker': return '🐳';
      case 'npm': return '📦';
      case 'pypi': return '🐍';
      default: return '📦';
    }
  };

  return (
    <Box p="md">
      <Title order={2} mb="md">Registry Explorer</Title>
      
      <Group mb="md" grow>
        <TextInput
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 2 }}
          icon={<IconSearch size={16} />}
        />
        <Select
          placeholder="Select registry"
          value={registryType}
          onChange={(value: string) => setRegistryType(value as RegistryType | 'all')}
          data={[
            { value: 'all', label: 'All Registries' },
            { value: 'composer', label: 'Composer' },
            { value: 'docker', label: 'Docker' },
            { value: 'npm', label: 'NPM' },
            { value: 'pypi', label: 'PyPI' },
          ]}
          style={{ flex: 1 }}
        />
      </Group>

      {loading && (
        <Group position="center" mt="xl">
          <Loader size="lg" />
          <Text>Searching packages...</Text>
        </Group>
      )}

      {error && (
        <Text color="red" mt="md">
          {error}
        </Text>
      )}

      {!loading && packages.length > 0 && (
        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: 'md', cols: 2, spacing: 'md' },
            { maxWidth: 'sm', cols: 1, spacing: 'sm' },
          ]}
          mt="md"
        >
          {packages.map((pkg, index) => (
            <Card key={`${pkg.type}-${pkg.name}-${index}`} shadow="sm" padding="lg" radius="md" withBorder>
              <Group position="apart" mb="xs">
                <Text weight={500} lineClamp={1}>
                  {getRegistryIcon(pkg.type)} {pkg.name}
                </Text>
                <Badge color="blue" variant="light">
                  {pkg.type.toUpperCase()}
                </Badge>
              </Group>

              <Text size="sm" color="dimmed" lineClamp={3} mb="sm">
                {pkg.description || 'No description available'}
              </Text>

              <Group position="apart">
                <Group spacing="xs">
                  {pkg.version && (
                    <Tooltip label="Version">
                      <Badge variant="outline" size="xs">v{pkg.version}</Badge>
                    </Tooltip>
                  )}
                  {pkg.downloads !== undefined && (
                    <Tooltip label="Downloads">
                      <Badge 
                        leftSection={<IconDownload size={12} />} 
                        variant="outline" 
                        size="xs"
                      >
                        {formatNumber(pkg.downloads)}
                      </Badge>
                    </Tooltip>
                  )}
                  {pkg.stars !== undefined && (
                    <Tooltip label="Stars">
                      <Badge 
                        leftSection={<IconStar size={12} />} 
                        variant="outline" 
                        size="xs"
                      >
                        {formatNumber(pkg.stars)}
                      </Badge>
                    </Tooltip>
                  )}
                </Group>
                <Anchor 
                  href={pkg.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  size="sm"
                >
                  <IconExternalLink size={16} />
                </Anchor>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {!loading && searchTerm && packages.length === 0 && (
        <Text color="dimmed" mt="md" align="center">
          No packages found. Try a different search term.
        </Text>
      )}
    </Box>
  );
};

export default RegistryViewer;
