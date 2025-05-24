import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { BACKEND_URL } from '../lib/utils';

interface AgentLog {
  type: 'agent_log';
  sender: string;
  message: string;
  timestamp: string;
}

interface AgentLogsProps {
  userId: string;
  className?: string;
}

export function AgentLogs({ userId, className }: AgentLogsProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'agent_log') {
            setLogs((prevLogs) => [...prevLogs, data]);
            // Scroll to bottom when new log arrives
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }, 100);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Agent Logs</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50">
          {error}
        </div>
      )}

      <ScrollArea ref={scrollRef} className="h-[300px] p-4">
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="rounded-lg border bg-muted/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary">{log.sender}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-background/50 p-2 rounded">
                {log.message}
              </pre>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Waiting for agent logs...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 