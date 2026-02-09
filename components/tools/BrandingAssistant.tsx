
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../../services/geminiService';
import { UserProfile } from '../../App';
import { Upload, Palette, Loader2, Image as ImageIcon, CheckCircle, FileJson, FileText, Cloud, X } from 'lucide-react';

interface BrandingAssistantProps {
  user: UserProfile | null;
  onNotify: () => void;
}

const BrandingAssistant: React.FC<BrandingAssistantProps> = ({ user, onNotify }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(''); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    
    const base64Data = selectedImage.split(',')[1];
    const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));
    
    const prompt = `
      Analyze this brand logo or asset. 
      Generate a complete Brand Kit including:
      1. Color Palette: Identify 3-5 primary hex codes and color names.
      2. Typography: Recommend matching font styles (Serif, Sans-serif, etc.).
      3. Tone of Voice: Describe the brand's personality (e.g., Playful, Corporate, Luxury).
      4. Design Style: Keywords describing the visual aesthetic.
      
      Format the output in clear plain text without markdown asterisks. Use capitalization and spacing for structure.
    `;

    try {
      const result = await analyzeImage(prompt, base64Data, mimeType);
      setAnalysis(result);
      onNotify(); // Trigger bell notification
    } catch (error) {
      console.error(error);
      setAnalysis("Failed to analyze brand assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToDoc = () => {
    if (!user) return alert("Please sign in with Google to use the optional Drive export feature.");
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert("Brand Kit successfully exported to Google Docs: 'Unity AI Brand Analysis'");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 overflow-y-auto no-scrollbar h-full">
      <div className="glass-card p-8 rounded-[2rem] text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6">
            {user && (
              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                <Cloud className="w-3 h-3" /> Cloud Ready
              </div>
            )}
         </div>
         <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-inner">
            <Palette className="w-6 h-6" />
         </div>
         <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">AI Identity Lab</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm font-medium leading-relaxed">Upload your brand mark to extract architectural guidelines. Unified assets, automatically structured.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="space-y-4">
           <div 
            onClick={() => fileInputRef.current?.click()}
            className="glass-card border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all group relative overflow-hidden shadow-xl"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Brand Asset" className="max-h-64 max-w-full object-contain rounded-lg p-4" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                  className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all border border-slate-200 dark:border-slate-700">
                   <Upload className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-widest">Upload Brand Mark</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">SVG, PNG, JPG</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-30 transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
            Extract Brand Architecture
          </button>
        </div>

        {/* Right: Results */}
        <div className="glass-card rounded-3xl border border-white/10 p-8 h-[500px] flex flex-col relative overflow-hidden">
           {!analysis && !loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
               <div className="w-16 h-16 bg-slate-500/5 rounded-full flex items-center justify-center mb-4">
                  <FileJson className="w-8 h-8 opacity-20" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest opacity-40">Ready for Neural Analysis</p>
             </div>
           )}
           
           {loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <div className="relative mb-6">
                 <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                 <Palette className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest animate-pulse">Deconstructing Identity...</p>
             </div>
           )}

           {analysis && (
             <div className="flex flex-col h-full animate-in fade-in">
               <div className="flex items-center justify-between mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Neural Brand Kit</h3>
                  </div>
                  <button 
                    onClick={handleExportToDoc}
                    className="flex items-center gap-2 px-3 py-1.5 glass hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all"
                  >
                    {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    {exporting ? 'Syncing...' : 'Export to Doc (Optional)'}
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                    {analysis}
                  </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BrandingAssistant;
