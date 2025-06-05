import { useState, useEffect } from 'react';
import { MantineProvider, AppShell } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import RegistryViewer from './components/RegistryViewer';
import './App.css';
import './styles/global.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  const theme = {
    colorScheme: 'dark',
    primaryColor: 'blue',
  };

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <Router>
        <AppShell
          padding="md"
          header={<Header />}
          styles={(theme) => ({
            main: { 
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
              padding: 0,
              minHeight: 'calc(100vh - 60px)'
            },
          })}
        >
          <div className="app">
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/registry" element={<RegistryViewer />} />
              </Routes>
            </main>
          </div>
        </AppShell>
      </Router>
    </MantineProvider>
  );
}

export default App;
