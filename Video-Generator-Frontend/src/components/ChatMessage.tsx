import { User, Bot } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { PlayCircle, Download } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { useState } from 'react';

interface ChatMessageProps {
  sender: string;
  content: string;
  timestamp: string;
  videoUrl?: string;
}

export function ChatMessage({ sender, content, timestamp, videoUrl }: ChatMessageProps) {
  const isUser = sender === 'User';
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);

  const preprocessContent = (text: string) => {
    const codeKeywords = ['def ', 'class ', 'import ', 'from ', '= ', '(', ')', '[', ']'];
    const looksLikeCode = codeKeywords.some(keyword => text.includes(keyword));
    if (looksLikeCode && !text.includes('```')) {
      let language = 'python';
      if (text.includes('from manim import *')) language = 'python';
      return `\`\`\`${language}\n${text}\n\`\`\``;
    }
    return text;
  };

  const processedContent = preprocessContent(content);

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
                const language = match ? match[1] : 'text';
                return (
                  <div className="relative">
                    <SyntaxHighlighter
                      language={language}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {videoUrl && (
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsVideoPreviewOpen(true)}
              className="gap-1"
            >
              <PlayCircle className="h-4 w-4" /> Preview Video
            </Button>
          </div>
        )}

      </div>

      <Dialog open={isVideoPreviewOpen} onOpenChange={setIsVideoPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video rounded-lg bg-black">
            <video controls className="w-full h-full rounded-lg">
              <source src={videoUrl || ''} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {videoUrl && (
            <div className="flex justify-end">
              <a href={videoUrl} download>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" /> Download Video
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 