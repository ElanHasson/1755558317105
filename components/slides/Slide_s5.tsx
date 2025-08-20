import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

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
  
  return (
    <div className="slide markdown-slide">
      <h1>Patterns that Ship: SaaS, Jamstack, and Monorepo Microservices</h1>
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