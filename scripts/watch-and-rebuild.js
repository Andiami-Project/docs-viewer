#!/usr/bin/env node
/**
 * Watch for markdown file changes and auto-rebuild
 * Run with: node scripts/watch-and-rebuild.js
 * Or via pm2: pm2 start scripts/watch-and-rebuild.js --name docs-watcher
 */

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

// Source directories to watch (on the server)
const WATCH_PATHS = [
  '/home/ubuntu/workspace/.claude/**/*.md',
  '/home/ubuntu/workspace/wish-x/**/*.md',
  '/home/ubuntu/workspace/wish-backend-x/**/*.md',
  '/home/ubuntu/workspace/doc-automation-hub/**/*.md',
  '/home/ubuntu/workspace/claude-agent-server/**/*.md',
  '/home/ubuntu/workspace/*.md',
  '/home/ubuntu/workspace/docs/**/*.md',
];

// Directories to ignore
const IGNORED = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/.claude/**/.chat-analysis/**',
];

// Debounce settings
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last change
let rebuildTimeout = null;
let isRebuilding = false;

const projectDir = path.join(__dirname, '..');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function rebuild() {
  if (isRebuilding) {
    log('⏳ Rebuild already in progress, queuing another...');
    scheduleRebuild();
    return;
  }

  isRebuilding = true;
  log('🔄 Starting sync and rebuild...');

  exec('npm run sync:build', { cwd: projectDir }, (error, stdout, stderr) => {
    isRebuilding = false;
    
    if (error) {
      log(`❌ Rebuild failed: ${error.message}`);
      console.error(stderr);
      return;
    }
    
    log('✅ Rebuild complete!');
    
    // Optional: Reload the web server (uncomment if using pm2 for serving)
    // exec('pm2 reload docs-viewer', (err) => {
    //   if (err) log(`⚠️ Could not reload server: ${err.message}`);
    //   else log('🔄 Server reloaded');
    // });
  });
}

function scheduleRebuild() {
  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }
  rebuildTimeout = setTimeout(rebuild, DEBOUNCE_MS);
}

// Initialize watcher
log('👀 Starting file watcher...');
log(`📁 Watching: ${WATCH_PATHS.length} paths`);

const watcher = chokidar.watch(WATCH_PATHS, {
  ignored: IGNORED,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100,
  },
});

watcher
  .on('add', (filePath) => {
    log(`➕ New file: ${filePath}`);
    scheduleRebuild();
  })
  .on('change', (filePath) => {
    log(`📝 Changed: ${filePath}`);
    scheduleRebuild();
  })
  .on('unlink', (filePath) => {
    log(`🗑️ Deleted: ${filePath}`);
    scheduleRebuild();
  })
  .on('ready', () => {
    log('✅ Watcher ready. Waiting for changes...');
  })
  .on('error', (error) => {
    log(`❌ Watcher error: ${error.message}`);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('👋 Shutting down watcher...');
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('👋 Shutting down watcher...');
  watcher.close();
  process.exit(0);
});
