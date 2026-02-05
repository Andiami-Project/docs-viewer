'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useRouter } from 'next/navigation';

export default function SystemFlowDiagram() {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Mermaid with dark theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#f59e0b', // Amber
        primaryTextColor: '#fff',
        primaryBorderColor: '#f59e0b',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        textColor: '#e2e8f0',
        fontSize: '16px',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
      },
    });

    const renderDiagram = async () => {
      if (!mermaidRef.current) return;

      try {
        const diagramId = 'system-flow-diagram';
        const diagram = `
graph LR
    %% Define nodes with IDs
    User["<div style='padding:10px;text-align:center'><strong>User</strong><br/><small>Web Browser</small></div>"]
    Frontend["<div style='padding:15px;text-align:center;cursor:pointer' data-link='wish-x'><strong style='color:#60a5fa'>Frontend Layer</strong><br/><strong>wish-x</strong><br/><small>Next.js 15 + React 19</small><br/><small>User Interface</small></div>"]
    Backend["<div style='padding:15px;text-align:center;cursor:pointer' data-link='wish-backend-x'><strong style='color:#f59e0b'>Backend Layer</strong><br/><strong>wish-backend-x</strong><br/><small>Trigger.dev v4</small><br/><small>Orchestration</small></div>"]
    Agent["<div style='padding:15px;text-align:center;cursor:pointer' data-link='claude-agent-server'><strong style='color:#a78bfa'>Agent Layer</strong><br/><strong>claude-agent-server</strong><br/><small>WebSocket + Agent SDK</small><br/><small>Tool Execution</small></div>"]

    %% Define flow with labels
    User -->|"HTTP Request"| Frontend
    Frontend -->|"WebSocket<br/>Connection"| Backend
    Backend -->|"Agent<br/>Invocation"| Agent
    Agent -.->|"Streaming<br/>Response"| Backend
    Backend -.->|"Real-time<br/>Updates"| Frontend
    Frontend -.->|"Display to<br/>User"| User

    %% Styling
    classDef frontendStyle fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#e0e7ff
    classDef backendStyle fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fef3c7
    classDef agentStyle fill:#4c1d95,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
    classDef userStyle fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#e2e8f0

    class Frontend frontendStyle
    class Backend backendStyle
    class Agent agentStyle
    class User userStyle
        `;

        // Render using the newer API
        const { svg } = await mermaid.render(diagramId, diagram);
        mermaidRef.current.innerHTML = svg;

        // Add click handlers to nodes with data-link
        const clickableNodes = mermaidRef.current.querySelectorAll('[data-link]');
        clickableNodes.forEach((node) => {
          const projectName = node.getAttribute('data-link');
          if (projectName) {
            node.addEventListener('click', () => {
              router.push(`/project/${projectName}/docs-list`);
            });
            // Add hover effect
            (node as HTMLElement).style.cursor = 'pointer';
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '<div style="color: #ef4444; padding: 20px;">Failed to render diagram. Please refresh the page.</div>';
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mermaid-diagram-container w-full overflow-x-auto">
      <div
        ref={mermaidRef}
        className="mermaid-diagram min-h-[400px] flex items-center justify-center"
      />
    </div>
  );
}
