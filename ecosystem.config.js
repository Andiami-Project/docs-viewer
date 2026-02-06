module.exports = {
  apps: [
    {
      name: 'docs-viewer',
      script: 'npx',
      args: 'docusaurus serve --port 3003 --host 0.0.0.0',
      cwd: '/home/ubuntu/workspace/docs-viewer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
