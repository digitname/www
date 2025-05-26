// GitHub Configuration
export const githubConfig = {
  username: process.env.GITHUB_USERNAME || '',
  token: process.env.GITHUB_TOKEN || '',
  email: process.env.GITHUB_EMAIL || '',
  apiUrl: 'https://api.github.com',
  repositories: {
    portfolio: 'www',
    // Add other repositories as needed
  }
};

export default githubConfig;
