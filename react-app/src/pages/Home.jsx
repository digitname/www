import { Container, Title, Text, Card, SimpleGrid, Avatar, Group, Button } from '@mantine/core';
import { IconBrandGithub, IconBrandLinkedin, IconWorld } from '@tabler/icons-react';

const Home = () => {
  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group position="apart" mb="md">
          <Group>
            <Avatar 
              src="https://sapletta.github.io/about/image.png" 
              size={80} 
              radius={40}
            />
            <div>
              <Title order={2}>Tom Sapletta</Title>
              <Text color="dimmed">DevOps Engineer & Software Developer</Text>
            </div>
          </Group>
          <Group>
            <Button 
              component="a" 
              href="https://github.com/tom-sapletta-com" 
              target="_blank"
              leftIcon={<IconBrandGithub size={16} />}
              variant="default"
            >
              GitHub
            </Button>
            <Button 
              component="a" 
              href="https://www.linkedin.com/in/tom-sapletta-com/" 
              target="_blank"
              leftIcon={<IconBrandLinkedin size={16} />}
              variant="default"
            >
              LinkedIn
            </Button>
          </Group>
        </Group>

        <section style={{ marginTop: '2rem' }}>
          <Title order={3} mb="md">Professional Overview</Title>
          <Text mb="lg">
            With over 12 years of experience as a DevOps Engineer, Software Developer, and Systems Architect, 
            I specialize in creating human-technology connections through innovative solutions. My expertise spans
            edge computing, hypermodularization, and automated software development lifecycles, with a focus on
            building bridges between complex technical requirements and human needs.
          </Text>
          
          <Text mb="lg">
            Currently, as the founder and CEO of{' '}
            <a href="https://www.telemonit.com/" target="_blank" rel="noopener noreferrer">Telemonit</a>, I'm
            developing{' '}
            <a href="https://www.portigen.com/" target="_blank" rel="noopener noreferrer">Portigen</a> - an innovative 
            power supply system with integrated edge computing functionality that enables natural human-machine 
            interactions even in environments with limited connectivity.
          </Text>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <Title order={3} mb="md">Expertise Areas</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {[
              'Hypermodularity', 'ModDevOps', 'Edge Computing',
              'DevOps', 'Cloud Architecture', 'Microservices',
              'CI/CD Pipelines', 'Infrastructure as Code', 'Containerization',
              'Kubernetes', 'Docker', 'AWS',
              'GCP', 'Azure', 'Terraform',
              'Python', 'JavaScript', 'TypeScript',
              'React', 'Node.js', 'Go',
              'Rust', 'Blockchain', 'IoT',
              'Machine Learning', 'Data Engineering', 'Security'
            ].map((skill) => (
              <Card key={skill} shadow="xs" padding="sm" radius="md">
                <Text>{skill}</Text>
              </Card>
            ))}
          </SimpleGrid>
        </section>
      </Card>
    </Container>
  );
};

export default Home;
