/**
 * Centralized project configuration
 * SINGLE SOURCE OF TRUTH for all project paths
 */

export const PROJECT_ROOTS: Record<string, string> = {
  'workspace-docs': '/home/ubuntu/workspace/.claude',
  'wish-x': '/home/ubuntu/workspace/wish-x',
  'wish-backend-x': '/home/ubuntu/workspace/wish-backend-x',
  'doc-automation-hub': '/home/ubuntu/workspace/doc-automation-hub',
  'claude-agent-server': '/home/ubuntu/workspace/claude-agent-server',
};

export const VALID_PROJECT_NAMES = new Set(Object.keys(PROJECT_ROOTS));

export type ProjectName = keyof typeof PROJECT_ROOTS;
