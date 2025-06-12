import { useEffect, useState, useRef } from 'react';
import { Menu, Share2, User, Code2, X, Send, PlayCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ChatMessage } from '../components/ChatMessage';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent } from '../components/ui/dialog';

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  videoUrl?: string;
}

interface WebSocketMessage {
  type: 'agent_log';
  sender: string;
  message: string;
  timestamp: string;
}

interface ChatResponse {
  messages: ChatMessage[];
  videoUrl: string | null;
}

export function Workspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [isNewChat, setIsNewChat] = useState<Boolean>(true);
  const [currChat, setCurrChat] = useState<HistoryItem | null>(null);
  const [userId, setUserId] = useState<string>('5');
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    if (data.type === 'agent_log') {
      setMessages(prev => {
        const isDuplicate = prev.some(msg => 
          msg.sender === data.sender && 
          msg.content === data.message && 
          msg.timestamp === data.timestamp
        );
        
        if (isDuplicate) {
          return prev;
        }

        return [...prev, {
          sender: data.sender,
          content: data.message,
          timestamp: data.timestamp
        }];
      });
    }
  };

  const generateVideoForNewPrompt = async () => {
    setPrompt('');
    await axios
      .post(`${BACKEND_URL}/api/userprompt`, {
        prompt: prompt,
        userId: parseInt(userId),
      })
      .then((res: any) => {
        setHistory((prev: any) => [...prev, res.data.history]);
        setIsNewChat(false);
        setCurrChat(res.data.history);
        setPrompt('');
        if (res.data.videoUrl) {
          setCurrentVideoUrl(res.data.videoUrl);
        }
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  const modifyVideo = async () => {
    // setMessages(prev => [...prev, { 
    //   sender: 'User', 
    //   content: prompt,
    //   timestamp: new Date().toISOString()
    // }]);
    setPrompt("");
    await axios
      .post(`${BACKEND_URL}/api/userprompt`, {
        prompt: prompt,
        userId: parseInt(userId),
        historyId: currChat?.id,
      })
      .then((res: any) => {
        setPrompt('');
        if (res.data.videoUrl) {
          setCurrentVideoUrl(res.data.videoUrl);
        }
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  const generateVideo = () => {
    if (!prompt.trim()) return;
    if (isNewChat) {
      generateVideoForNewPrompt();
    } else {
      modifyVideo();
    }
  };

  const getHistory = async () => {
    let userId = localStorage.getItem('userId');
    console.log("User Id : ", userId);
    if (userId === null) {
      userId = '5';
    }
    await axios
      .post(`${BACKEND_URL}/api/users/gethistory`, {
        userId: parseInt(userId),
      })
      .then((res: any) => {
        setHistory(res.data.message);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let id = localStorage.getItem('userId');
    if (id !== null) {
      setUserId(id);
    }
    getHistory();
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
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
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">MAVEN</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-4">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r bg-card shrink-0"
            >
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-4">History</h2>
                  <div className="space-y-2">
                    {history?.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                        onClick={async() => {
                          setCurrChat(item);
                          setIsNewChat(false);
                          setMessages([]);
                          await axios.get<ChatResponse>(`${BACKEND_URL}/api/users/getchat/${item.id}`)
                            .then(res => {
                              console.log(res.data);
                              setMessages(res.data.messages);
                              setCurrentVideoUrl(res.data.videoUrl);
                            })
                            .catch(err => console.error('Error fetching chat:', err));
                        }}
                      >
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 && isNewChat ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-2xl w-full space-y-6">
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-center">What would you like to create?</h2>
                  <div className="space-y-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the animation you want to create..."
                      className="w-full min-h-[120px] p-4 rounded-md bg-background border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={generateVideo}
                        size="lg"
                        disabled={!prompt.trim()}
                      >
                        Generate Animation
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      sender={message.sender}
                      content={message.content}
                      timestamp={message.timestamp}
                      videoUrl={message.videoUrl}
                    />
                  ))}
                  {currentVideoUrl && (
                    <div className="p-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsVideoPreviewOpen(true)}
                        className="gap-2"
                      >
                        <PlayCircle className="h-5 w-5" />
                        Preview Generated Video
                      </Button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4 shrink-0">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the animation you want to create..."
                      className="flex-1 min-h-[60px] p-3 rounded-md bg-background border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          generateVideo();
                        }
                      }}
                    />
                    <Button 
                      onClick={generateVideo}
                      size="icon"
                      className="h-[60px] w-[60px]"
                      disabled={!prompt.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="h-12 border-t flex items-center justify-center text-sm text-muted-foreground shrink-0">
        Created by Yashwanth S — Made with ❤️ for the users.
      </footer>

      <Dialog open={isVideoPreviewOpen} onOpenChange={setIsVideoPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video rounded-lg bg-black">
            <video controls className="w-full h-full rounded-lg">
              <source src={currentVideoUrl || ''} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
