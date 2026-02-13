import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Trash2, MessageSquare } from 'lucide-react';
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  // const [messages, setMessages] = useState([
  //   { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you with your projects today?" }
  // ]);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved
      ? JSON.parse(saved)
      : [{ role: 'assistant', content: "Hello! I'm your AI assistant." }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        messages: [...messages, userMessage]
      });

      // const aiMessage = { role: 'assistant', content: response.data.content };
      const aiMessage = {
        role: 'assistant',
        content: String(response.data.content)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared. How can I help you?" }]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-1 md:p-5 text-slate-800 font-sans flex items-center justify-center">
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-5xl h-[85vh] flex flex-col bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project AI Assistant</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Llama 3.3 Intelligence</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-red-500 group"
              title="Clear Conversation"
            >
              <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FBFCFE] scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user'
                    ? 'bg-white border border-slate-100  text-blue-600'
                    : 'bg-white border border-slate-100 text-blue-600'
                    }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <div className={`p-5 rounded-[1.5rem] shadow-sm ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                      <div className={`text-sm leading-relaxed prose prose-slate max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown>
                          {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start ml-14"
            >
              <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Synthesizing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your research assistant..."
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-5 pl-7 pr-20 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`absolute right-2.5 p-3.5 rounded-2xl transition-all shadow-lg ${isLoading || !input.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-blue-500/30'
                  }`}
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-300"></div>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">
                Encrypted & Secure AI Environment
              </p>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-300"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;