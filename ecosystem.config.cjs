module.exports = {
  apps: [
    {
      name: 'sg-replay-parser-schedule',
      script: 'dist/schedule.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
