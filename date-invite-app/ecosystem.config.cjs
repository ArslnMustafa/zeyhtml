module.exports = {
  apps: [
    {
      name: "date-invite",
      script: "./dist/index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      autorestart: true,
      restart_delay: 1000,
      max_memory_restart: "350M",
    },
  ],
};
