import  { useState } from 'react';
import { Menu, Share2, User, Code2, X, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BACKEND_URL } from '../lib/utils';
interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

export function Workspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [sampleCode,setSampleCode] = useState<string | null>(null);
  const [preview,setPreview] = useState("");
  const [history,setHistory] = useState<HistoryItem[] | null>(null);
  
  const generateVideo = async() =>{
    await axios.post(`${BACKEND_URL}/api/userprompt`,{
        "prompt" : prompt
    }).then((res : any)=>{
        console.log(res.data.code);
        setSampleCode(res.data.code);
        setPrompt("");
    }).catch((err : any)=>{
        alert(err)
    })
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
                      <p className="text-sm text-muted-foreground">
                        {item.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <h2 className="text-lg font-semibold mb-4">
                  What would you like to create?
                </h2>
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
                  I'll help you create an animation based on your prompt. The
                  generated code and preview will appear in the right panel.
                </p>
              </div>
            </div>
          </div>
        </main>
        {sampleCode && (
            <aside className="w-[480px] border-l bg-card overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Generated Code</h2>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm">{sampleCode}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="aspect-video rounded-lg border bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Animation preview will appear here
                </p>
              </div>
            </div>
          </div>
        </aside>
        )}
      </div>

      <footer className="h-12 border-t flex items-center justify-center text-sm text-muted-foreground">
        Created by Yashwanth S — Made with ❤️ for the users.
      </footer>
    </div>
  );
}