import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- What actually happens from commit to scale-up
  - You push to Git or point at a container image
  - App Platform builds (Buildpacks or Docker) → creates a container image → deploys behind a managed load balancer → scales based on your settings
  - Zero-downtime rollouts with health checks and instant rollback on failure
\`\`\`mermaid 
  flowchart LR
    Dev[git push] --> Repo[GitHub/GitLab]
    Dev -. or .-> ImgSrc[Container Image in DOCR/Docker Hub]
    Repo -->|Webhook| AP[DigitalOcean App Platform]
    ImgSrc --> AP
    AP --> Detect{Build method?}
    Detect -->|Source code| BP[Cloud Native Buildpacks]
    Detect -->|Dockerfile/Image| DK[Docker build or pull]
    BP --> IMG[Container image]
    DK --> IMG
    IMG --> REG[Registry (internal/DOCR)]
    REG --> DEPLOY[Provision app instances]
    DEPLOY --> HC[Health checks]
    HC -->|healthy| SWITCH[Zero-downtime traffic switch]
    HC -->|fail| ROLLBACK[Automatic rollback]
    SWITCH --> LB[Managed HTTPS LB + CDN]
    LB --> USERS[(Users)]
    DEPLOY --> SCALE[Scale: instance count + size + autoscale]
    SCALE --> OBS[Logs & metrics]
\`\`\`
Build phase
- Buildpacks path (no Dockerfile needed):
  - Auto-detects language/runtime (Node, Python, Go, Ruby, Java, PHP, static sites)
  - Produces an OCI image with dependency caching for faster rebuilds
  - Environment variables and build secrets are injected securely
- Docker path:
  - Uses your Dockerfile, or deploy directly from a prebuilt image in DO Container Registry or Docker Hub
  - Full control over base image, OS packages, and build steps

Deploy phase
- App spec drives deploys (components, routes, env vars, scaling). Generated for you, editable in UI or as code
- Managed: HTTPS/SSL via Let’s Encrypt, custom domains, HTTP/2, WebSockets, global CDN for static/assets
- Health-checked rollout; traffic swaps only after instances are healthy
- One-click rollbacks; PR Deploy Previews for safe testing

Scale phase
- Vertical: choose instance size (CPU/RAM)
- Horizontal: set instance count; optional autoscaling within min/max bounds
- Stateless services scale instantly; sticky sessions via cookies if needed
- Observability: aggregated logs, request metrics, alerts; attach managed databases and queues

Example: Docker vs. Buildpacks
- Buildpacks (no Dockerfile):
  - Push code → App Platform detects Node → runs build → deploys
- Dockerfile (full control):
\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
\`\`\`
- Connect this repo or push a prebuilt image to DOCR and point App Platform at it`;
  
  return (
    <div className="slide markdown-slide">
      <h1>Under the Hood: App Platform Architecture and Workflow (Git → Buildpacks/Docker → Deploy → Scale)</h1>
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
                <Mermaid chart={String(children).replace(/\n$/, '')} />
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