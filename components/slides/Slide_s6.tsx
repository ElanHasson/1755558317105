import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Avoid the gotchas
  - Stateless by default: App Platform file system is ephemeral. Persist state in Managed Databases, Redis, or Spaces/S3; keep services 12‑factor.
  - Long requests/timeouts: Don’t block HTTP for heavy work. Use worker components and queues; stream where needed; verify platform timeouts for your runtime.
  - Autoscaling assumptions: Scaling isn’t instant. Set a safe minimum instance count, add health checks, and load‑test your max concurrency.
  - Build/deploy surprises: Control runtime via version settings or a Dockerfile. Define build context for monorepos, use staging and deploy previews, and review build logs.
  - Networking/costs: Watch egress. Place components and databases in the same region/VPC, cache aggressively, and use a CDN for static assets.
  - Secrets/config: Never commit secrets. Use App secrets/env vars and rotate regularly.
\`\`\`mermaid
  flowchart LR
    A[Gotcha] --> B[Ephemeral FS]
    B --> Bfix[Use Managed DBs/Redis/Spaces]
    A --> C[Long requests]
    C --> Cfix[Workers + queues; stream]
    A --> D[Autoscale lag]
    D --> Dfix[Min instances + health checks + load test]
    A --> E[Build/deploy]
    E --> Efix[Dockerfile or pin runtime; staging]
    A --> F[Egress/region]
    F --> Ffix[Same region/VPC + CDN + cache]
\`\`\`
- Trends to watch
  - Platform engineering and golden paths
  - Serverless containers and buildpacks
  - FinOps and cost‑aware design
  - AI/LLM workloads offloaded to workers
  - Multi‑cloud portability with Dockerfile + 12‑factor
- What’s next (quick checklist)
  - Import repo; choose runtime or Dockerfile
  - Attach Managed Postgres/Redis; set env/secrets
  - Configure health checks and min/max instances
  - Enable CDN/caching for static assets
  - Set up staging and deploy previews; promote to prod
  - Add alerts and log forwarding; run a quick load test
  - Start a pilot with credits; grab docs/templates (doctl/Terraform)`;
  
  return (
    <div className="slide markdown-slide">
      <h1>Avoid the Gotchas + What’s Next: Pitfalls, Trends, and Quick CTA</h1>
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