import { User, Bot } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  sender: string;
  content: string;
  timestamp: string;
}

export function ChatMessage({ sender, content, timestamp }: ChatMessageProps) {
  const isCodeMessage = sender === 'Code Generating Agent' || 
                       sender === 'Code Modifying Agent' || 
                       sender === 'Error Rectifying Agent';
  const isUser = sender === 'User';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'bg-muted/50' : ''}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm text-muted-foreground">
            {sender}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        {isCodeMessage ? (
          <div className="relative rounded-lg bg-muted p-4">
            <SyntaxHighlighter 
              language="python" 
              style={vscDarkPlus} 
              wrapLines
              customStyle={{ margin: 0, borderRadius: '0.5rem' }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => (
                  <div className="relative rounded-lg bg-muted p-4">
                    {children}
                  </div>
                ),
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  if (match) {
                    return (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  return <code className={className}>{children}</code>;
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 