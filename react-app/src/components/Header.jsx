import { AppShell, Group, Title, Anchor, Container } from '@mantine/core';
import { Link } from 'react-router-dom';

const HeaderComponent = () => (
  <AppShell.Header p="md" withBorder={false}>
    <Container size="xl">
      <Group justify="space-between">
        <Group>
          <Title order={3}>
            <Anchor component={Link} to="/" underline="never">
              Tom Sapletta
            </Anchor>
          </Title>
          <Anchor component={Link} to="/portfolio" c="dimmed">
            DigitName Portfolio
          </Anchor>
        </Group>
        <nav>
          <Group>
            <Anchor href="https://sapletta.com" target="_blank" rel="noopener noreferrer">
              Blog
            </Anchor>
            <Anchor href="https://softreck.com" target="_blank" rel="noopener noreferrer">
              Softreck
            </Anchor>
          </Group>
        </nav>
      </Group>
    </Container>
  </AppShell.Header>
);

export default HeaderComponent;
