import { Container, Title, Text, Card, SimpleGrid, Group, Button, Image, Box, Tabs } from '@mantine/core';
import { IconExternalLink, IconCode, IconRobotFace } from '@tabler/icons-react';
import { useState } from 'react';
import HuggingFaceProfile from '../components/HuggingFaceProfile';

const projects = [
  {
    title: "Python Packages",
    description: "Creator of numerous Python libraries including pifunc, mdirtree, markdown2code, dynapsys, and more.",
    link: "https://pypi.org/user/tom-sapletta-com/",
    image: "/thumbnails/python-packages.jpg"
  },
  {
    title: "DomainLeak",
    description: "Domain monitoring and management service.",
    link: "https://www.domainleak.com/",
    image: "/thumbnails/domainleak.jpg"
  },
  {
    title: "AskDomainer",
    description: "Domain consultation service.",
    link: "https://www.askdomainer.com/",
    image: "/thumbnails/askdomainer.jpg"
  },
  // Add more projects as needed
];

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Portfolio</Title>
      
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="projects" icon={<IconCode size={14} />}>Projects</Tabs.Tab>
          <Tabs.Tab value="huggingface" icon={<IconRobotFace size={14} />}>Hugging Face</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="projects" pt="xl">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {projects.map((project) => (
              <Card key={project.title} shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src={project.image}
                    height={160}
                    alt={project.title}
                    withPlaceholder
                  />
                </Card.Section>

                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{project.title}</Text>
                </Group>


                <Text size="sm" color="dimmed" mb="md">
                  {project.description}
                </Text>

                <Button 
                  component="a" 
                  href={project.link} 
                  target="_blank" 
                  rightIcon={<IconExternalLink size={16} />}
                  fullWidth
                  variant="light"
                >
                  View Project
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="huggingface" pt="xl">
          <HuggingFaceProfile />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Portfolio;
