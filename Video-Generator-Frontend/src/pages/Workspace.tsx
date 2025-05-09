import { useEffect, useState } from 'react';
import { Menu, Share2, User, Code2, X, Send, Video, ClipboardCopy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BACKEND_URL } from '../lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

export function Workspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [sampleCode, setSampleCode] = useState<string | null>(null);
  const [preview, setPreview] = useState('');
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [isNewChat, setIsNewChat] = useState<Boolean>(true);
  const [currChat, setCurrChat] = useState<HistoryItem | null>(null);
  const [userId, setUserId] = useState<string>('5');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const generateVideoForNewPrompt = async () => {
    await axios
      .post(`${BACKEND_URL}/api/userprompt`, {
        prompt: prompt,
        userId: parseInt(userId),
      })
      .then((res: any) => {
        console.log(res.data.message);
        setSampleCode(res.data.message);
        setHistory((prev: any) => [...prev, res.data.history]);
        setIsNewChat(false);
        setPreview(`${BACKEND_URL}/preview/${res.data.history.title}`)
        setCurrChat(res.data.history);
        setPrompt('');
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  const modifyVideo = async () => {
    await axios
      .post(`${BACKEND_URL}/api/userprompt`, {
        prompt: prompt,
        userId: parseInt(userId),
        historyId: currChat?.id,
      })
      .then((res: any) => {
        console.log(res.data.message);
        setSampleCode(res.data.message);
        setPreview(`${BACKEND_URL}/preview/${currChat?.title}`)
        setPrompt('');
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  const generateVideo = () => {
    if (isNewChat) {
      generateVideoForNewPrompt();
    } else {
      modifyVideo();
    }
  };

  const getHistory = async () => {
    let userId = localStorage.getItem('userId');
    if (userId === null) {
      userId = '5';
    }
    await axios
      .post(`${BACKEND_URL}/api/users/gethistory`, {
        userId: parseInt(userId),
      })
      .then((res: any) => {
        console.log(res.data);
        setHistory(res.data.message);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  useEffect(() => {
    let id = localStorage.getItem('userId');
    if (id !== null) {
      setUserId(id);
    }
    getHistory();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4">
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

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r bg-card"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">History</h2>
                <div className="space-y-2">
                  {history?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    >
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex overflow-hidden">
          <div className="w-1/2 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <h2 className="text-lg font-semibold mb-4">What would you like to create?</h2>
                <div className="flex space-x-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the animation you want to create..."
                    className="flex-1 min-h-[100px] p-3 rounded-md bg-background border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={generateVideo}>
                    Generate Animation
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Assistant Response</h3>
                <p className="text-muted-foreground">
                  I’ll help you create an animation based on your prompt. The generated code and preview will appear in
                  the right panel.
                </p>
              </div>
            </div>
          </div>

          {sampleCode && (
            <aside className="w-1/2 border-l bg-card flex flex-col">
              <div className="flex items-center justify-center border-b p-2 space-x-2">
                <Button
                  variant={activeTab === 'code' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('code')}
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Code
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('preview')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-auto">
                {activeTab === 'code' && (
                  <div className="relative rounded-lg bg-muted p-4">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} wrapLines>
                      {sampleCode || ''}
                    </SyntaxHighlighter>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(sampleCode || '')}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="aspect-video rounded-lg border bg-black flex items-center justify-center">
                    <video controls className="w-full h-full rounded-lg">
                      <source src={preview || 'public\\HelloEveryone.mp4'} type="video/mp4"/>
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            </aside>
          )}
        </main>
      </div>

      <footer className="h-12 border-t flex items-center justify-center text-sm text-muted-foreground">
        Created by Yashwanth S — Made with ❤️ for the users.
      </footer>
    </div>
  );
}
