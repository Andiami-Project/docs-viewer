module.exports = {
  apps: [{
    name: 'docs-viewer',
    script: 'node_modules/.bin/next',
    args: 'dev -p 3003',  // Dev mode with explicit port (bypasses static gen bug)
    cwd: '/home/ubuntu/workspace/docs-viewer',
    env: {
      NODE_ENV: 'development',
      PORT: 3003
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
