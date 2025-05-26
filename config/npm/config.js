// NPM Configuration
export const npmConfig = {
  username: process.env.NPM_USERNAME || '',
  email: process.env.NPM_EMAIL || '',
  token: process.env.NPM_TOKEN || '',
  registry: 'https://registry.npmjs.org/',
  scopes: {
    user: '@digitname',
    packages: {
      portfolio: '@digitname/portfolio',
      // Add other packages as needed
    }
  }
};

export default npmConfig;
