module.exports = {
  apps: [
    {
      name: 'genie-bot',
      cwd: '/var/www/discord-bots/DiscordBots/genie-bot',
      script: 'dist/index.js',
      exec_mode: 'fork',           // <- use fork mode
      instances: 1,
      interpreter: 'node',
      interpreter_args: '-r dotenv/config',  // <- preload .env support
      env: {
        NODE_ENV: 'production',
        // any other env vars you want to set/override
      },
    },
    {
      name: 'triviabot',
      cwd: '/var/www/discord-bots/DiscordBots/triviabot',
      script: 'dist/index.js',
      exec_mode: 'fork',
      instances: 1,
      interpreter: 'node',
      interpreter_args: '-r dotenv/config',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'opie-bot',
      cwd: '/var/www/discord-bots/DiscordBots/opie-bot',
      script: 'dist/index.js',
      exec_mode: 'fork',
      instances: 1,
      interpreter: 'node',
      interpreter_args: '-r dotenv/config',
      env: { NODE_ENV: 'production' },
    },
  ],
};
