module.exports = {
  apps: [
    {
      name: "lolamarket",
      script: "server.js",
      cwd: "/var/www/lolamarket",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
