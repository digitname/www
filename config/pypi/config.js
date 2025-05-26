// PyPI Configuration
export const pypiConfig = {
  username: process.env.PYPI_USERNAME || '',
  password: process.env.PYPI_PASSWORD || '',
  email: process.env.PYPI_EMAIL || '',
  repository: 'https://upload.pypi.org/legacy/',
  testRepository: 'https://test.pypi.org/legacy/',
  packages: {
    // Add your Python package names here
    // Example:
    // 'pifunc': 'pifunc',
    // 'mdirtree': 'mdirtree'
  }
};

export default pypiConfig;
