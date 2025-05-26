import { AppShell, Header, Group, Title, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

const HeaderComponent = () => (
  <Header height={60} p="md">
    <Group position="apart">
      <Group>
        <Title order={3}>
          <Anchor component={Link} to="/" underline={false}>
            Tom Sapletta
          </Anchor>
        </Title>
        <Anchor component={Link} to="/portfolio" color="dimmed">
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
  </Header>
);

export default HeaderComponent;
