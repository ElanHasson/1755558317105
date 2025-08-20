import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Goal: Ship a Web service + background Worker + one‑time DB Migration with a single App Spec
- What you’ll see: One YAML, one command, auto‑ordered deploy (migrations run before app boots)

App Spec (minimal example)
\`\`\`yaml
name: web-worker-migrate
region: nyc

services:
  - name: web
    github:
      repo: your-org/your-repo
      branch: main
      deploy_on_push: true
    source_dir: web
    environment_slug: node-js
    instance_size_slug: basic-xxs
    instance_count: 1
    routes:
      - path: "/"
    http_port: 3000
    run_command: "npm start"

workers:
  - name: worker
    github:
      repo: your-org/your-repo
      branch: main
    source_dir: worker
    environment_slug: node-js
    instance_size_slug: basic-xxs
    instance_count: 1
    run_command: "node worker.js"

jobs:
  - name: migrate-db
    kind: PRE_DEPLOY   # runs before web/worker start
    github:
      repo: your-org/your-repo
      branch: main
    source_dir: web
    environment_slug: node-js
    run_command: "npm run migrate"
\`\`\`
Deploy from the CLI
\`\`\`bash
# Create the app from spec
export DO_TOKEN=...   # or already logged in via \`doctl auth init\`
doctl apps create --spec app.yaml

# Capture the App ID from the output, then watch the deployment
APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

doctl apps deployments list $APP_ID

# Tail logs: migration (job), then web and worker
# Build logs
doctl apps logs $APP_ID --component migrate-db --type build --follow
# Run logs (job execution)
doctl apps logs $APP_ID --component migrate-db --type run --follow
# Web and worker runtime logs
doctl apps logs $APP_ID --component web --type run --follow
\`\`\`
A quick look at the flow
\`\`\`mermaid 
  flowchart LR
    A(Code push / Spec apply) --> B[Pre-deploy Job: migrate-db]
    B -->|Success| C[Start Web]
    B -->|Success| D[Start Worker]
    B -.->|Failure stops rollout| X[Abort Deploy]
    C --> E[Routes live]
    D --> F[Background tasks running]
\`\`\`
Notes
- Secrets/DB URLs: add in App Platform UI or as encrypted env vars; App Spec picks them up at deploy
- Roll forward on push; redeploy/rollback available from UI; no servers to manage`;
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
      <h1>2‑Minute Demo: Deploy a Web + Worker + Migration Job with App Spec</h1>
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