import { AppShell, Group, Title, Anchor, Container, Menu, ActionIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconBox, IconCode, IconBrandDocker, IconBrandNpm } from '@tabler/icons-react';

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
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Anchor component="button" c="dimmed">
                Explorer
              </Anchor>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Portfolio</Menu.Label>
              <Menu.Item 
                component={Link} 
                to="/portfolio" 
                icon={<IconBox size={14} />}
              >
                Projects
              </Menu.Item>

              <Menu.Divider />
              
              <Menu.Label>Registries</Menu.Label>
              <Menu.Item 
                component={Link} 
                to="/registry" 
                icon={<IconCode size={14} />}
              >
                Registry Explorer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
