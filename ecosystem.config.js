// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'genie-bot',
      cwd: '/var/www/discord-bots/genie-bot',
      script: './dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'triviabot',
      cwd: '/var/www/discord-bots/triviabot',
      script: './dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'opie-bot',
      cwd: '/var/www/discord-bots/opie-bot',
      script: './dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
};
