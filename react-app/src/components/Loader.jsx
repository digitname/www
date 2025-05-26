import { Loader as MantineLoader } from '@mantine/core';
import '../styles/Loader.css';

const Loader = () => (
  <div className="loader-container">
    <MantineLoader size="xl" variant="bars" />
    <p>Loading...</p>
  </div>
);

export default Loader;
