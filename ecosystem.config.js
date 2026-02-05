/**
 * PM2 Ecosystem Configuration
 * 
 * Start all: pm2 start ecosystem.config.js
 * Start watcher only: pm2 start ecosystem.config.js --only docs-watcher
 * Start server only: pm2 start ecosystem.config.js --only docs-viewer
 */

module.exports = {
  apps: [
    {
      // File watcher - auto-rebuilds on changes
      name: 'docs-watcher',
      script: 'scripts/watch-and-rebuild.js',
      cwd: '/home/ubuntu/workspace/docs-viewer',
      instances: 1,
      autorestart: true,
      watch: false, // Don't watch the watcher itself
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/watcher-error.log',
      out_file: 'logs/watcher-out.log',
      merge_logs: true,
    },
    {
      // Static file server (using serve)
      name: 'docs-viewer',
      script: 'npx',
      args: 'serve build -l 3456',
      cwd: '/home/ubuntu/workspace/docs-viewer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/server-error.log',
      out_file: 'logs/server-out.log',
      merge_logs: true,
    },
  ],
};
