
import React, { useState } from 'react';
import { generateText, generateVideo, generateOrEditImage } from '../../services/geminiService';
import { Film, Loader2, AlertCircle, PlayCircle, Video as VideoIcon, Ratio, Lock, Image as ImageIcon, Clapperboard } from 'lucide-react';
import { AspectRatio } from '../../types';

interface ScriptToVideoProps {
  onNotify: () => void;
}

const ScriptToVideo: React.FC<ScriptToVideoProps> = ({ onNotify }) => {
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [step, setStep] = useState<'idle' | 'analyzing' | 'generating'>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  const ratios: { value: AspectRatio; label: string }[] = [
    { value: '16:9', label: '16:9 Landscape' },
    { value: '9:16', label: '9:16 Portrait' },
    { value: '1:1', label: '1:1 Square' },
    { value: '4:3', label: '4:3 Classic' },
    { value: '3:4', label: '3:4 Vertical' },
  ];

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      setStep('analyzing');
      const visualPrompt = await generateText(
        script, 
        "Summarize this script into a single, highly detailed visual prompt suitable for an AI image/video generation model. Focus on the establishing shot, lighting, mood, and main subject movement. Keep it under 50 words.",
        'gemini-2.5-flash'
      );

      setStep('generating');
      
      let url = '';
      if (mode === 'image') {
        url = await generateOrEditImage(visualPrompt, undefined, undefined, aspectRatio);
      } else {
        url = await generateVideo(visualPrompt, aspectRatio);
      }
      
      setResultUrl(url);
      onNotify(); // Trigger bell notification

    } catch (err: any) {
      setError(err.message || "Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative h-full">
      
       <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Script to Scene</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Turn your text script into visual storyboards or video scenes.</p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
               <button 
                 onClick={() => { setMode('image'); setResultUrl(null); setError(null); }}
                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${mode === 'image' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                 <ImageIcon className="w-4 h-4" />
                 Storyboard (Image)
               </button>
               <button 
                 onClick={() => { setMode('video'); setResultUrl(null); setError(null); }}
                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${mode === 'video' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                 <Clapperboard className="w-4 h-4" />
                 Video Scene
               </button>
             </div>

             <div className="relative">
                {mode === 'video' && (
                  <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-full shadow-lg mb-3">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Video Generation Coming Soon</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs text-center mt-1">
                        We are upgrading our video engine. Switch to <b>Storyboard</b> mode to generate scene images instantly.
                    </p>
                  </div>
                )}

                <div className={mode === 'video' ? 'opacity-20 pointer-events-none' : ''}>
                   <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Script / Scene Description</label>
                        <textarea 
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none text-slate-800 dark:text-slate-200"
                          placeholder="Interior, Day. A futuristic coffee shop with neon lights..."
                        />
                     </div>

                     <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                           <Ratio className="w-3 h-3" /> Output Ratio
                        </label>
                        <div className="flex flex-wrap gap-2">
                           {ratios.map(r => (
                             <button
                               key={r.value}
                               onClick={() => setAspectRatio(r.value)}
                               className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                                 aspectRatio === r.value 
                                 ? 'bg-indigo-600 text-white border-indigo-600' 
                                 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                               }`}
                             >
                               {r.label}
                             </button>
                           ))}
                        </div>
                     </div>
                     
                     {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                     <div className="flex justify-end items-center gap-4 pt-2">
                        <button 
                          onClick={handleGenerate}
                          disabled={loading || !script.trim()}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'image' ? <ImageIcon className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                            <span>Generate {mode === 'image' ? 'Storyboard' : 'Video'}</span>
                        </button>
                     </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {resultUrl && (
         <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 border border-slate-200 dark:border-slate-700">
            <div className="p-4 flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
               {mode === 'image' ? <ImageIcon className="w-5 h-5 text-indigo-500" /> : <PlayCircle className="w-5 h-5 text-indigo-500" />}
               <span className="font-medium">{mode === 'image' ? 'Generated Storyboard' : 'Generated Scene'}</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2 min-h-[300px]">
               {mode === 'image' ? (
                 <img src={resultUrl} alt="Storyboard" className="max-w-full max-h-[500px] rounded-lg shadow-sm" />
               ) : (
                 <video src={resultUrl} controls autoPlay loop className="max-w-full max-h-[500px] rounded-lg" />
               )}
            </div>
         </div>
       )}
    </div>
  );
};

export default ScriptToVideo;
