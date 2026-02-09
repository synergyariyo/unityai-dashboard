
import React, { useState, useRef, useEffect } from 'react';
import { generateOrEditImage } from '../../services/geminiService';
import { Upload, Wand2, Loader2, Eraser, Image as ImageIcon, ScanLine, Monitor, Smartphone, Scaling, Zap, Download } from 'lucide-react';
import { AspectRatio } from '../../types';

interface SmartEditorProps {
  onNotify: () => void;
}

const SmartEditor: React.FC<SmartEditorProps> = ({ onNotify }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<'edit' | 'resize'>('edit');
  const [targetRatio, setTargetRatio] = useState<AspectRatio | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const editPresets = [
    { 
      label: "Remove Watermark (Perfect)", 
      prompt: "Remove ALL watermarks, text overlays, and logos from this image. Reconstruct the underlying texture and details perfectly so no trace remains. Do not alter the main subject.", 
      icon: Eraser 
    },
    { 
      label: "Remove Background (Clean)", 
      prompt: "Completely remove the background and replace it with a pure white studio background. Keep the subject perfectly isolated with clean edges. Do not distort the subject.", 
      icon: ScanLine 
    },
    { 
      label: "Enhance to 4K", 
      prompt: "Upscale this image to high-fidelity 4K resolution. Sharpen details, improve lighting, and remove noise without changing the composition or subject identity. Photorealistic quality.", 
      icon: Zap 
    },
  ];

  const resizePresets = [
    { label: "16:9 Landscape", ratio: '16:9' as AspectRatio, prompt: "Expand this image to 16:9 aspect ratio. Seamlessly outpaint the sides to match the existing scene and lighting." },
    { label: "9:16 Portrait", ratio: '9:16' as AspectRatio, prompt: "Expand this image to 9:16 aspect ratio. Seamlessly outpaint the top and bottom to match the existing scene." },
    { label: "1:1 Square", ratio: '1:1' as AspectRatio, prompt: "Crop and center this image to a perfect 1:1 square. Keep the main subject centered." },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage || !prompt) return;
    setLoading(true);
    
    const base64Data = selectedImage.split(',')[1];
    const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

    try {
      const ratioToPass = activeMode === 'resize' ? targetRatio : undefined;
      const result = await generateOrEditImage(prompt, base64Data, mimeType, ratioToPass);
      setResultImage(result);
      onNotify(); // Trigger notification
      
      setTimeout(() => {
        if (window.innerWidth < 1024) {
           resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error(error);
      alert("Editing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-auto lg:h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 pb-20 lg:pb-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1 h-auto lg:h-full">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col lg:overflow-hidden">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Smart Editor</h2>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 lg:p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group mb-6 shrink-0"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
               {selectedImage ? "Change Image" : "Upload Image"}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4 shrink-0">
             <button 
               onClick={() => { setActiveMode('edit'); setTargetRatio(undefined); }}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
             >
               Magic Edit
             </button>
             <button 
               onClick={() => setActiveMode('resize')}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeMode === 'resize' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
             >
               AI Resizer
             </button>
          </div>

          <div className="space-y-3 flex-1 lg:overflow-y-auto pr-1">
             <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
               {activeMode === 'edit' ? 'Select Action' : 'Select Target Ratio'}
             </label>
             
             <div className="grid grid-cols-1 gap-2">
               {activeMode === 'edit' ? (
                 editPresets.map((preset, idx) => (
                   <button 
                    key={idx}
                    onClick={() => setPrompt(preset.prompt)}
                    className={`flex items-center gap-3 p-3 text-left rounded-lg border transition-all ${
                      prompt === preset.prompt 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                   >
                     <preset.icon className={`w-4 h-4 ${prompt === preset.prompt ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                     <span className="text-sm font-medium">{preset.label}</span>
                   </button>
                 ))
               ) : (
                 resizePresets.map((preset, idx) => (
                    <button 
                     key={idx}
                     onClick={() => {
                        setPrompt(preset.prompt);
                        setTargetRatio(preset.ratio);
                     }}
                     className={`flex items-center gap-3 p-3 text-left rounded-lg border transition-all ${
                       prompt === preset.prompt 
                         ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                         : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                     }`}
                    >
                      {preset.label.includes('16:9') && <Monitor className="w-4 h-4" />}
                      {preset.label.includes('9:16') && <Smartphone className="w-4 h-4" />}
                      {preset.label.includes('1:1') && <Scaling className="w-4 h-4" />}
                      <span className="text-sm font-medium">{preset.label}</span>
                    </button>
                  ))
               )}
             </div>
             
             <div className="mt-4">
               <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  {activeMode === 'edit' ? 'Custom Edit Prompt' : 'Refinement Instructions'}
               </label>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 resize-none text-slate-800 dark:text-slate-200"
                 placeholder="Describe exactly what you want..."
               />
             </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!selectedImage || !prompt || loading}
            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            <span>{activeMode === 'edit' ? 'Process Image' : 'Resize Image'}</span>
          </button>
        </div>
      </div>

      <div 
        ref={resultRef}
        className="w-full lg:flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 flex flex-col items-center justify-center relative overflow-hidden order-1 lg:order-2 min-h-[40vh] lg:h-full"
      >
         {!selectedImage && (
           <div className="text-center text-slate-400">
             <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
             <p>Upload an image below to start editing</p>
           </div>
         )}

         {selectedImage && !resultImage && !loading && (
           <img src={selectedImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
         )}

        {loading && (
          <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
             <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
             <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">AI is working its magic...</p>
          </div>
        )}

         {resultImage && (
           <div className="w-full h-full flex flex-col gap-4">
              <div className="flex-1 flex items-center justify-center gap-4 w-full h-full relative">
                 <img src={resultImage} alt="Result" className="max-w-full max-h-[60vh] lg:max-h-full object-contain rounded-lg shadow-md" />
              </div>
              <div className="flex justify-center shrink-0">
                <a href={resultImage} download="edited-image.png" className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-full shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Result
                </a>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default SmartEditor;
