import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Why App Platform gets you production‑ready fast
  - Managed HTTPS and TLS certs by default; enable "Enforce HTTPS"
  - Push‑to‑deploy from GitHub/GitLab with zero‑downtime rolling updates
  - Built‑in autoscaling and health checks; one‑click rollback to a prior deploy
- Security best practices
  - Store credentials as encrypted environment variables (secrets), never in code
  - Use private networking to connect to Managed Databases inside your VPC
  - Restrict exposure to only HTTP/HTTPS; terminate TLS at the edge
  - Enable preview environments only for trusted branches and clean them up after review
- CI/CD best practices
  - Protect your main branch; auto‑deploy from main only
  - Turn on preview deployments for PRs to run tests and QA before merge
  - Use buildpacks or your Dockerfile; keep images minimal and pinned
  - Add a health check endpoint (e.g., /healthz) so rollouts verify readiness
- Cost control best practices
  - Start with Basic tier and the smallest instance that meets baseline needs
  - Set min/max instances to cap autoscaling; right‑size using metrics
  - Use Static Sites + CDN for frontends; offload heavy state to Managed DBs
  - Regularly prune preview apps and unused components; set billing alerts
- Minimal App Spec example
\`\`\`yaml
# app.yaml
name: sample-prod-app
region: nyc
services:
  - name: web
    github:
      repo: org/repo
      branch: main
      deploy_on_push: true
    instance_size_slug: basic-xxs
    instance_count: 2
    health_check:
      http_path: /healthz
    envs:
      - key: APP_ENV
        value: production
        scope: RUN_TIME
      - key: SECRET_KEY
        type: SECRET
        scope: RUN_TIME
routes:
  - path: /
\`\`\`
\`\`\`mermaid
graph LR
  Dev[Developer push] --> GH[GitHub/GitLab]
  GH --> Build[App Platform build]
  Build --> Test[Health check]
  Test --> Deploy[Rolling deploy]
  Deploy --> Auto[Autoscale within limits]
  Sec[Secrets + HTTPS + VPC] -.enforced at build/deploy.-> Deploy
\`\`\`
- CLI workflow
\`\`\`bash
# First deploy
doctl apps create --spec app.yaml
# Update with guardrails as you iterate
doctl apps update $APP_ID --spec app.yaml
\`\`\``;
  const mermaidRef = useRef(0);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
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
        const element = diagrams[i] as HTMLElement;
        const graphDefinition = element.textContent || '';
        const id = `mermaid-${Date.now()}-${i}`;
        
        try {
          // Create a container for the diagram
          const container = document.createElement('div');
          container.id = id;
          container.className = 'mermaid-rendered';
          
          // Render the diagram
          const { svg } = await mermaid.render(id, graphDefinition);
          container.innerHTML = svg;
          
          // Replace the code block with the rendered diagram
          if (element.parentNode) {
            element.parentNode.replaceChild(container, element);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          // If there's an error, clean up
          const existingElement = document.getElementById(id);
          if (existingElement) {
            existingElement.remove();
          }
        }
      }
    };
    
    renderDiagrams();
  }, [markdown]);
  
  return (
    <div className="slide markdown-slide">
      <h1>Production‑Ready in Minutes: Best Practices for Security, CI/CD, and Cost Control</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Handle inline code
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            // Handle mermaid diagrams
            if (language === 'mermaid') {
              return (
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
              );
            }
            
            // Handle code blocks with syntax highlighting
            if (language) {
              return (
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  showLineNumbers={true}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            // Default code block without highlighting
            return (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}