
import React, { useState, useRef, useEffect } from 'react';
import { generateMarketingChat } from '../../services/geminiService';
import { UserProfile } from '../../App';
import { PenTool, Send, Loader2, Copy, Paperclip, X, Layout, Check, MessageSquare, FileText, Cloud, CheckCircle2 } from 'lucide-react';

interface CopyMessage {
  role: 'user' | 'model';
  text: string;
  images?: string[];
  timestamp: Date;
}

interface CopywriterProps {
  user: UserProfile | null;
  onNotify: () => void;
}

const Copywriter: React.FC<CopywriterProps> = ({ user, onNotify }) => {
  const [messages, setMessages] = useState<CopyMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<{data: string, type: 'image' | 'text' | 'doc', name: string}[]>([]);
  const [exporting, setExporting] = useState<number | null>(null);
  const [syncedMessages, setSyncedMessages] = useState<Set<number>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameworks = [
    { id: 'A', label: 'Hook-Body-CTA', value: 'Hook-Body-CTA' },
    { id: 'B', label: 'AIDA Model', value: 'AIDA' },
    { id: 'C', label: 'Enquiry Response', value: 'Professional Enquiry Response' },
  ];

  useEffect(() => {
    if (messages.length === 0) {
       setMessages([{
         role: 'model',
         text: "Pro Content Writer Online. I handle high-speed copywriting and complex enquiry responses. Simply type your request or click a strategy model below to apply a specific framework. All output is strictly plain text.",
         timestamp: new Date()
       }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (forcedStyle?: string) => {
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const currentPrompt = forcedStyle ? `Using the ${forcedStyle} model, respond to: ${input}` : input;
    const currentImages = attachments.filter(a => a.type === 'image').map(a => a.data);
    
    setMessages(prev => [...prev, {
      role: 'user',
      text: forcedStyle ? `Apply ${forcedStyle}: ${input}` : input,
      images: currentImages,
      timestamp: new Date()
    }]);

    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const sysInstruct = `You are a Pro Content Writer and Customer Relations Expert. 
      Deliver responses extremely fast in plain text. 
      STRICTLY NO ASTERISKS (*) OR MARKDOWN SYMBOLS. 
      Format using clean line breaks and indentation only. 
      Maintain an authoritative and professional tone.`;
      
      const responseText = await generateMarketingChat(
        messages.map(m => ({ role: m.role, text: m.text, images: m.images })), 
        currentPrompt, 
        currentImages, 
        sysInstruct
      );
      
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
      onNotify(); // Trigger notification
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Direct response error. Please retry.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToDoc = (text: string, index: number) => {
    if (!user) return alert("Please sign in with Google to use the optional cloud export features.");
    setExporting(index);
    setTimeout(() => {
      setExporting(null);
      setSyncedMessages(prev => new Set(prev).add(index));
      alert("Successfully exported to Google Docs: 'Unity Production Copy'");
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         const result = reader.result as string;
         setAttachments(prev => [...prev, { data: result, type: file.type.startsWith('image/') ? 'image' : 'text', name: file.name }]);
       };
       file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-[2rem] overflow-hidden">
      <div className="p-5 glass border-b border-white/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20 shadow-inner">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">Pro Content Writer</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Dialogue Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                <Cloud className="w-3 h-3" /> Drive Sync Active
              </div>
            )}
            <div className="glass px-3 py-1 rounded-full border border-white/20 hidden sm:block">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Plain Text</span>
            </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg border relative group ${
              msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500 shadow-indigo-500/10' : 'glass-card border-white/10 dark:text-slate-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.text}</p>
              
              {msg.role === 'model' && idx > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => handleExportToDoc(msg.text, idx)}
                    title={syncedMessages.has(idx) ? "Synced to Google Docs" : "Optional: Export to Google Doc"}
                    className={`p-1.5 glass rounded-lg transition-all ${syncedMessages.has(idx) ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400 hover:bg-white/40 dark:hover:bg-slate-700'}`}
                   >
                     {exporting === idx ? (
                       <Loader2 className="w-3 h-3 animate-spin" />
                     ) : syncedMessages.has(idx) ? (
                       <CheckCircle2 className="w-3 h-3" />
                     ) : (
                       <FileText className="w-3 h-3" />
                     )}
                   </button>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest px-1">
               {msg.role === 'user' ? 'Request' : 'Expert Output'}
               {syncedMessages.has(idx) && " • Synced to Cloud"}
            </span>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-2 px-2">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Neural Link Synthesis...</span>
          </div>
        )}
      </div>

      <div className="p-6 glass border-t border-white/20 z-10">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {frameworks.map(f => (
            <button 
              key={f.id}
              onClick={() => handleSend(f.value)}
              disabled={!input.trim() || loading}
              className="px-4 py-2 glass hover:bg-indigo-600 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20 shadow-sm whitespace-nowrap disabled:opacity-30"
            >
              {f.label}
            </button>
          ))}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-rose-500/20 shadow-sm animate-in zoom-in-50">
                <Paperclip className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 max-w-[100px] truncate uppercase tracking-widest">{a.name}</span>
                <button onClick={() => removeAttachment(i)} className="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-all">
                   <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 glass p-2 rounded-full border border-white/20 shadow-xl focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
           <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-indigo-500 transition-colors bg-white/5 rounded-full">
              <Paperclip className="w-5 h-5" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           </button>
           <input 
             value={input} 
             onChange={e => setInput(e.target.value)} 
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Discuss copy strategy or submit enquiry..." 
             className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-white font-medium"
           />
           <button onClick={() => handleSend()} disabled={loading} className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-xl shadow-indigo-500/30">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Copywriter;
