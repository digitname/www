import { Card, Text, Group, Button, Image, Badge, SimpleGrid, Title, Box } from '@mantine/core';
import { IconBrandHuggingface, IconExternalLink, IconCode, IconRobot } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const HuggingFaceProfile = () => {
  const [profile, setProfile] = useState(null);
  const [models, setModels] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this from your backend
        // const response = await fetch('/api/huggingface/profile');
        // const data = await response.json();
        
        // Mock data for now - replace with actual API calls
        const mockProfile = {
          name: 'Tom Sapletta',
          username: 'tom-sapletta',
          avatarUrl: 'https://huggingface.co/avatars/thumbnails/default.png',
          bio: 'AI/ML Engineer | Open Source Contributor',
          followers: 42,
          following: 24,
          likes: 156,
        };
        
        const mockModels = [
          {
            id: 'model-1',
            name: 'bert-base-multilingual-cased',
            likes: 128,
            downloads: 25000,
            tags: ['pytorch', 'transformers', 'bert']
          },
          {
            id: 'model-2',
            name: 'gpt2-finetuned-sentiment',
            likes: 87,
            downloads: 15000,
            tags: ['pytorch', 'transformers', 'gpt2']
          }
        ];
        
        const mockSpaces = [
          {
            id: 'space-1',
            name: 'text-classification-demo',
            title: 'Text Classification Demo',
            description: 'A simple text classification demo using Transformers',
            likes: 56,
            tags: ['nlp', 'transformers', 'demo']
          },
          {
            id: 'space-2',
            name: 'image-captioning',
            title: 'Image Captioning',
            description: 'Generate captions for your images using BLIP',
            likes: 42,
            tags: ['vision', 'image-captioning', 'demo']
          }
        ];
        
        setProfile(mockProfile);
        setModels(mockModels);
        setSpaces(mockSpaces);
      } catch (err) {
        console.error('Error fetching Hugging Face profile:', err);
        setError('Failed to load Hugging Face profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading Hugging Face profile...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box my="xl">
      <Title order={2} mb="md" display="flex" alignItems="center" gap="sm">
        <IconBrandHuggingface size={32} />
        Hugging Face Profile
      </Title>
      
      <Card withBorder radius="md" p="xl" mb="xl">
        <Group position="apart" mb="md">
          <Group>
            <Image
              src={profile.avatarUrl}
              alt={profile.username}
              width={80}
              height={80}
              radius="md"
            />
            <div>
              <Text size="xl" weight={700}>{profile.name}</Text>
              <Text color="dimmed">@{profile.username}</Text>
              <Text mt="xs">{profile.bio}</Text>
            </div>
          </Group>
          <Button
            component="a"
            href={`https://huggingface.co/${profile.username}`}
            target="_blank"
            leftIcon={<IconExternalLink size={16} />}
          >
            View Profile
          </Button>
        </Group>
        
        <Group mt="md">
          <Badge leftSection="👥 " variant="outline">{profile.followers} Followers</Badge>
          <Badge leftSection="👤 " variant="outline">Following {profile.following}</Badge>
          <Badge leftSection="❤️ " variant="outline">{profile.likes} Likes</Badge>
        </Group>
      </Card>
      
      <Title order={3} mb="md" display="flex" alignItems="center" gap="sm">
        <IconCode size={24} />
        My Models
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="xl">
        {models.map((model) => (
          <Card key={model.id} withBorder p="md" radius="md">
            <Group position="apart" mb="xs">
              <Text weight={700} size="lg">{model.name}</Text>
              <Badge color="blue" variant="light">{model.downloads.toLocaleString()} downloads</Badge>
            </Group>
            <Group spacing="xs" mb="md">
              {model.tags.map(tag => (
                <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
              ))}
            </Group>
            <Group position="apart" mt="auto">
              <Badge leftSection="❤️ " variant="light">{model.likes}</Badge>
              <Button
                component="a"
                href={`https://huggingface.co/${profile.username}/${model.name}`}
                target="_blank"
                size="xs"
                variant="outline"
                rightIcon={<IconExternalLink size={14} />}
              >
                View Model
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
      
      <Title order={3} mb="md" display="flex" alignItems="center" gap="sm">
        <IconRobot size={24} />
        My Spaces
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {spaces.map((space) => (
          <Card key={space.id} withBorder p="md" radius="md">
            <Text weight={700} size="lg" mb="xs">{space.title}</Text>
            <Text size="sm" color="dimmed" mb="md">{space.description}</Text>
            <Group spacing="xs" mb="md">
              {space.tags.map(tag => (
                <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
              ))}
            </Group>
            <Group position="apart" mt="auto">
              <Badge leftSection="❤️ " variant="light">{space.likes}</Badge>
              <Button
                component="a"
                href={`https://huggingface.co/spaces/${profile.username}/${space.name}`}
                target="_blank"
                size="xs"
                variant="outline"
                rightIcon={<IconExternalLink size={14} />}
              >
                Open Space
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default HuggingFaceProfile;
