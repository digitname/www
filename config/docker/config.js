// Docker Hub Configuration
export const dockerConfig = {
  username: process.env.DOCKERHUB_USERNAME || '',
  token: process.env.DOCKERHUB_TOKEN || '',
  registry: 'https://index.docker.io/v2/',
  repositories: {
    // Add your Docker repositories here
    // Example:
    // 'portfolio': 'username/portfolio',
    // 'api': 'username/api'
  }
};

export default dockerConfig;
