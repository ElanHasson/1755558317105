import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Slide() {
  const markdown = `- Why these patterns ship fast
  - SaaS: Multi-tenant API + Managed DB + background jobs
  - Jamstack: Static site build + global CDN + PR previews
  - Monorepo Microservices: Multiple components from one repo, each scaled independently

- How App Platform removes DevOps pain
  - Autodetects builds (no Dockerfile required) and deploys from Git on push
  - Per-component scaling, health checks, zero-downtime deploys and instant rollbacks
  - Secrets and env vars, VPC to Managed Databases/Redis, custom domains + HTTPS
  - Logs, metrics, alerts built-in; cron jobs and workers for async tasks

\`\`\`mermaid
flowchart LR
  A[Monorepo on GitHub/GitLab] --> B[App Platform\nBuildpacks + App Spec]
  B --> C[Static Site (Jamstack)]
  B --> D[API Service(s)]
  B --> E[Worker / Cron Job]
  D --> F[(Managed Database / Redis via VPC)]
  E --> F
  C -->|Calls| D
  C --> G[Global CDN + HTTPS]
  B --> H[PR Previews\nLogs/Metrics\nRollbacks\nAutoscaling]
  C --> I[Users]
\`\`\`

- Result: One pipeline, many components; fewer YAMLs, no cluster wrangling—just push code and ship.`;
  const mermaidRef = useRef(0);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#5a67d8',
        secondaryColor: '#764ba2',
        tertiaryColor: '#667eea',
        background: '#1a202c',
        mainBkg: '#2d3748',
        secondBkg: '#4a5568',
        tertiaryBkg: '#718096',
        textColor: '#fff',
        nodeTextColor: '#fff',
      }
    });
    
    // Find and render mermaid diagrams
    const renderDiagrams = async () => {
      const diagrams = document.querySelectorAll('.language-mermaid');
      for (let i = 0; i < diagrams.length; i++) {
        const element = diagrams[i];
        const graphDefinition = element.textContent;
        const id = `mermaid-${mermaidRef.current++}`;
        
        try {
          const { svg } = await mermaid.render(id, graphDefinition);
          element.innerHTML = svg;
          element.classList.remove('language-mermaid');
          element.classList.add('mermaid-rendered');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }
    };
    
    renderDiagrams();
  }, [markdown]);
  
  return (
    <div className="slide markdown-slide">
      <h1>Patterns that Ship: SaaS, Jamstack, and Monorepo Microservices</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, className, children, ...props}: any) {
            const match = /language-(w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !className;
            
            if (!isInline && language === 'mermaid') {
              return (
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}