
import React, { useState, useRef } from 'react';
import { generateOrEditImage, generateVideo, generateText } from '../../services/geminiService';
import { GeneratedMedia, AspectRatio } from '../../types';
import { UserProfile } from '../../App';
import { Image as ImageIcon, Video, Loader2, Download, AlertCircle, Ratio, Palette, Sparkles, Upload, FileText, Layout, MousePointer2, CloudCheck, Cloud } from 'lucide-react';

interface MediaStudioProps {
  user: UserProfile | null;
  onNotify: () => void;
}

const MediaStudio: React.FC<MediaStudioProps> = ({ user, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'flyer' | 'icon'>('image');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [designPlan, setDesignPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setDesignPlan(null);

    try {
      let url = '';
      if (activeTab === 'flyer') {
        const plan = await generateText(
          prompt,
          "You are a master graphic designer. For the following flyer request, provide a plan in this EXACT format: Headline: [text] | Image Idea: [description] | Colors: [list] | Layout: [instructions]. Be brief."
        );
        setDesignPlan(plan);
        url = await generateOrEditImage(`Graphic Flyer Design based on this plan: ${plan}`, referenceImage || undefined, 'image/png', aspectRatio);
      } else if (activeTab === 'icon') {
        url = await generateOrEditImage(`Professional minimal app icon for: ${prompt}, centered, white background, high quality vector style`, undefined, 'image/png', '1:1');
      } else if (activeTab === 'video') {
        url = await generateVideo(prompt, aspectRatio);
      } else {
        url = await generateOrEditImage(prompt, referenceImage || undefined, 'image/png', aspectRatio);
      }

      setGeneratedMedia(prev => [{ type: activeTab === 'video' ? 'video' : 'image', url, prompt, createdAt: new Date() }, ...prev]);
      onNotify(); // Trigger bell notification
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 h-full flex flex-col overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Production Studio</h2>
          {user && (
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
               <Cloud className="w-3 h-3" /> Auto-Syncing to Drive
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
          {[
            { id: 'image', label: 'Image', icon: ImageIcon },
            { id: 'video', label: 'Video (Veo)', icon: Video },
            { id: 'flyer', label: 'Flyer Designer', icon: Layout },
            { id: 'icon', label: 'Icon Lab', icon: MousePointer2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setDesignPlan(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === 'flyer' ? "Describe your flyer (e.g. Summer Music Festival, June 20th)" : "What are we creating?"}
            className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 resize-none dark:text-white"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              {referenceImage ? (
                <img src={referenceImage} className="h-20 mx-auto object-contain" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Reference Image (Optional)</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                  <button key={r} onClick={() => setAspectRatio(r as any)} className={`px-2 py-1 text-xs rounded border ${aspectRatio === r ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-white'}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm flex items-center gap-2 bg-red-50 p-2 rounded"><AlertCircle className="w-4 h-4" />{error}</div>}

          <div className="flex justify-end">
            <button onClick={handleGenerate} disabled={loading || !prompt} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span>{loading ? 'Creating...' : `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}</span>
            </button>
          </div>
        </div>
      </div>

      {generatedMedia.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {generatedMedia.map((m, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border dark:border-slate-700 group relative">
              {m.type === 'video' ? <video src={m.url} controls className="w-full rounded-xl aspect-video bg-black" /> : <img src={m.url} className="w-full rounded-xl" />}
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium dark:text-white line-clamp-1 flex-1">{m.prompt}</p>
                  {user && <CloudCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <a href={m.url} download={`unity-${idx}`} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"><Download className="w-4 h-4" /> Download</a>
                  {user && <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Synced to Google Drive</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaStudio;
