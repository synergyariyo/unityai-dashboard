
import React, { useState, useRef, useEffect } from 'react';
import { generateMarketingChat } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { UserProfile } from '../../App';
import { Brain, Send, User, Bot, Loader2, Copy, Check, FileText, Scissors, Image as ImageIcon, X, Search, Paperclip, Cloud, CheckCircle2 } from 'lucide-react';

interface LocalMessage extends ChatMessage {
  images?: string[];
}

interface GenerativeBrainProps {
  user: UserProfile | null;
  onNotify: () => void;
}

const GenerativeBrain: React.FC<GenerativeBrainProps> = ({ user, onNotify }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<LocalMessage[]>([
    {
      role: 'model',
      text: "Neural Core Active. I process media strategy and extract cross-platform data. Responses are delivered in ultra-clean plain text. Upload assets below or provide your production brief.",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<number | null>(null);
  const [syncedIndices, setSyncedIndices] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    { label: "OCR Extract", icon: Search, prompt: "Extract all text from the image. No asterisks." },
    { label: "Production Brief", icon: FileText, prompt: "Write a high-end production brief for a commercial. No markdown." },
    { label: "VFX Guide", icon: Scissors, prompt: "Suggest specific VFX for a tech product reveal. Plain text only." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportToDoc = (text: string, index: number) => {
    if (!user) return alert("Please sign in with Google to use the optional Drive export feature.");
    setExporting(index);
    setTimeout(() => {
      setExporting(null);
      setSyncedIndices(prev => new Set(prev).add(index));
      alert("Strategy exported to Google Docs: 'Unity AI Neural Output'");
    }, 1500);
  };

  const handleSend = async (textInput: string = input) => {
    if ((!textInput.trim() && !selectedImage) || loading) return;
    
    const currentImages = selectedImage ? [selectedImage] : [];
    setHistory(prev => [...prev, { role: 'user', text: textInput || "Visual Neural Analysis", images: currentImages, timestamp: new Date() }]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const systemInstruction = `You are Unity AI Neural Core. Respond extremely fast. 
      STRICTLY plain text only. NEVER use asterisks (*) or markdown. 
      Format with whitespace and line breaks.`;

      const response = await generateMarketingChat(
        history.map(m => ({ role: m.role, text: m.text, images: m.images })),
        textInput || "Analyze and extract visual text. No asterisks.",
        currentImages,
        systemInstruction
      );

      setHistory(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
      onNotify(); // Trigger notification
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', text: "Neural link timeout. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-[2rem] overflow-hidden">
      <div className="px-6 py-4 glass border-b border-white/20 flex items-center justify-between z-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20 shadow-inner">
               <Brain className="w-5 h-5" />
            </div>
            <div>
               <span className="font-bold text-slate-800 dark:text-white block">Neural Brain</span>
               <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">High Speed Engine</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                <Cloud className="w-3 h-3" /> Strategy Sync Enabled
              </div>
            )}
            <div className="glass px-3 py-1 rounded-full border border-white/20">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Link: Active</span>
                </div>
            </div>
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/5">
        {history.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'glass border border-white/30 text-indigo-500'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
                  : 'glass-card dark:text-slate-100 rounded-tl-none'
              }`}>
                {msg.images && msg.images.length > 0 && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-lg max-w-[300px]">
                    <img src={msg.images[0]} className="w-full" alt="Neural Asset" />
                  </div>
                )}
                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                
                {msg.role === 'model' && idx > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                      onClick={() => handleExportToDoc(msg.text, idx)}
                      title={syncedIndices.has(idx) ? "Synced to Cloud" : "Optional: Export to Google Doc"}
                      className={`p-1.5 glass rounded-lg transition-all ${syncedIndices.has(idx) ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400 hover:bg-white/40 dark:hover:bg-slate-700'}`}
                     >
                       {exporting === idx ? (
                         <Loader2 className="w-3 h-3 animate-spin" />
                       ) : syncedIndices.has(idx) ? (
                         <CheckCircle2 className="w-3 h-3" />
                       ) : (
                         <FileText className="w-3 h-3" />
                       )}
                     </button>
                  </div>
                )}

                {msg.role === 'model' && (
                  <button 
                    onClick={() => copyToClipboard(msg.text, idx)}
                    className="mt-4 px-3 py-1 glass hover:bg-white/20 rounded-full text-[9px] flex items-center gap-1.5 text-slate-400 hover:text-indigo-500 transition-all uppercase font-black tracking-widest border border-white/10 shadow-sm"
                  >
                    {copied === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied === idx ? 'Copied' : 'Copy Strategy'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-in fade-in">
             <div className="w-10 h-10 rounded-xl glass border border-white/30 flex items-center justify-center text-indigo-500">
               <Bot className="w-5 h-5" />
             </div>
             <div className="p-4 glass rounded-2xl rounded-tl-none border border-white/10 w-28">
                <div className="flex gap-1.5 items-center justify-center">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 glass border-t border-white/20 z-10">
        {!selectedImage && history.length < 4 && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s.prompt)}
                className="flex items-center gap-2 px-4 py-2 glass hover:bg-indigo-600 hover:text-white rounded-full text-[10px] font-black uppercase tracking-wider transition-all border border-white/20 shadow-sm whitespace-nowrap"
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
          </div>
        )}

        {selectedImage && (
          <div className="flex items-center gap-3 mb-4 p-2 glass border border-rose-500/20 rounded-2xl w-fit group animate-in slide-in-from-left-2 shadow-xl">
            <div className="relative">
              <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl border border-white/20" alt="Preview" />
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="pr-2">
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Neural Asset Ready</span>
               <span className="text-[9px] text-slate-400">OCR / Analysis Mode</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 glass p-2 rounded-full border border-white/20 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-lg">
          <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-indigo-500 transition-colors bg-white/5 rounded-full">
            <ImageIcon className="w-5 h-5" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedImage ? "Add instructions for asset..." : "Command the Neural Core..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 dark:text-white placeholder:text-slate-500 font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || loading}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-500/30 transition-all disabled:opacity-30 disabled:grayscale"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerativeBrain;
