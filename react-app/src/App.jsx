import { useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
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

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;
