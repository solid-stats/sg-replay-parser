module.exports = {
  apps: [
    {
      name: 'sg-replay-parser-schedule',
      script: 'dist/schedule.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      // Recovers from silent hangs (process stays "online" but stops
      // producing new output, with no crash/error for pm2 to react to).
      cron_restart: '0 4 * * *',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
