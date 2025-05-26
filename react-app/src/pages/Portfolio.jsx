import { Container, Title, Text, Card, SimpleGrid, Group, Button, Image } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

const projects = [
  {
    title: "Python Packages",
    description: "Creator of numerous Python libraries including pifunc, mdirtree, markdown2code, dynapsys, and more.",
    link: "https://pypi.org/user/tom-sapletta-com/"
  },
  {
    title: "DomainLeak",
    description: "Domain monitoring and management service.",
    link: "https://www.domainleak.com/"
  },
  {
    title: "AskDomainer",
    description: "Domain consultation service.",
    link: "https://www.askdomainer.com/"
  },
  // Add more projects as needed
];

const Portfolio = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Portfolio</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {projects.map((project) => (
          <Card key={project.title} shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={`/thumbnails/${project.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
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
    </Container>
  );
};

export default Portfolio;
