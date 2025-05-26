// GitLab Configuration
export const gitlabConfig = {
  username: process.env.GITLAB_USERNAME || '',
  token: process.env.GITLAB_TOKEN || '',
  email: process.env.GITLAB_EMAIL || '',
  apiUrl: 'https://gitlab.com/api/v4',
  repositories: {
    // Add your GitLab repositories here
    // Example:
    // 'portfolio': 'username/portfolio',
    // 'api': 'username/api'
  }
};

export default gitlabConfig;
