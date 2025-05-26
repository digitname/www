import { githubConfig } from './github/config';
import { npmConfig } from './npm/config';
import { pypiConfig } from './pypi/config';
import { dockerConfig } from './docker/config';
import { gitlabConfig } from './gitlab/config';

const config = {
  domain: process.env.DOMAIN_NAME || 'digitname.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@digitname.com',
  services: {
    github: githubConfig,
    npm: npmConfig,
    pypi: pypiConfig,
    docker: dockerConfig,
    gitlab: gitlabConfig,
  },
  // Add any additional global configuration here
};

export default config;
