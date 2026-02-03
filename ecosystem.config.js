module.exports = {
  apps: [{
    name: 'docs-viewer',
    script: 'npm',
    args: 'run dev',  // Temporary: using dev mode due to Next.js 16 + React 19 build bug
    env: {
      NODE_ENV: 'development',
      PORT: 3002
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
