
import React from 'react';
import { AppTool } from '../types';
import { UserProfile } from '../App';
import GenerativeBrain from './tools/GenerativeBrain';
import MediaStudio from './tools/MediaStudio';
import VoiceOver from './tools/VoiceOver';
import SmartEditor from './tools/SmartEditor';
import Copywriter from './tools/Copywriter';
import BrandingAssistant from './tools/BrandingAssistant';
import ScriptToVideo from './tools/ScriptToVideo';
import { ArrowRight, Sparkles, Zap, Shield, Target } from 'lucide-react';

interface WorkspaceProps {
  activeTool: AppTool;
  onToolSelect: (tool: AppTool) => void;
  user: UserProfile | null;
  onNotify: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ activeTool, onToolSelect, user, onNotify }) => {
  
  const isDashboard = activeTool === AppTool.Dashboard;

  return (
    <main className="flex-1 h-full p-4 md:p-6 lg:p-8 relative flex flex-col overflow-hidden">
      
      {/* Dashboard View */}
      {isDashboard && (
        <div className="max-w-6xl mx-auto py-6 md:py-10 animate-in fade-in overflow-y-auto w-full h-full no-scrollbar">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3" /> Creative Neural Engine
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                Your Production Stack<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Unconditionally Unified.</span>
              </h1>

              <div className="max-w-3xl space-y-6">
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  One subscription. Seven high-fidelity production tools. Powered by the next generation of Gemini multimodal intelligence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 glass-card p-4 rounded-2xl">
                    <div className="mt-1 p-2 bg-emerald-500/10 rounded text-emerald-500"><Target className="w-4 h-4" /></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Zero friction from prompt to 4K cinematic delivery.</p>
                  </div>
                  <div className="flex items-start gap-3 glass-card p-4 rounded-2xl">
                    <div className="mt-1 p-2 bg-indigo-500/10 rounded text-indigo-500"><Shield className="w-4 h-4" /></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Strict brand guardrails for absolute visual consistency.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Production Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {[
                  { id: AppTool.GenerativeBrain, title: 'Generative Brain', desc: 'Neural core. Extract text from images, generate scripts, and plan campaigns.' },
                  { id: AppTool.MediaStudio, title: 'Media Studio', desc: 'Visual synthesis. 4K Image and Veo Video generation at scale.' },
                  { id: AppTool.BrandingAssistant, title: 'Identity Lab', desc: 'Brand architecture. Auto-generate visual kits from any logo.' },
                  { id: AppTool.ScriptToVideo, title: 'Script-to-Scene', desc: 'Pre-viz engine. Cinematic storyboarding from raw text.' },
                  { id: AppTool.SmartEditor, title: 'Post-Production AI', desc: 'Mastering tool. 4K upscaling and magic object removal.' },
                  { id: AppTool.VoiceOver, title: 'Vocal Synthesis', desc: 'Natural speech. Multi-accent support and zero-shot voice cloning.' },
                  { id: AppTool.Copywriter, title: 'Pro Content Writer', desc: 'Enquiry expert. High-ROI copy and automated client response handling.' },
                ].map((card) => (
                  <div 
                    key={card.id}
                    onClick={() => onToolSelect(card.id)}
                    className="glass-card p-8 rounded-3xl hover:bg-indigo-600/5 hover:border-indigo-500/30 cursor-pointer transition-all duration-300 group flex flex-col"
                  >
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{card.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-1 leading-relaxed">{card.desc}</p>
                    <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-bold mt-auto group-hover:gap-2 transition-all">
                      Open Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      )}

      {/* Persistent Tools */}
      <div className={activeTool === AppTool.GenerativeBrain ? 'flex-1 h-full overflow-hidden' : 'hidden'}><GenerativeBrain user={user} onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.MediaStudio ? 'flex-1 h-full overflow-y-auto' : 'hidden'}><MediaStudio user={user} onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.VoiceOver ? 'flex-1 h-full overflow-y-auto' : 'hidden'}><VoiceOver onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.SmartEditor ? 'flex-1 h-full overflow-y-auto' : 'hidden'}><SmartEditor onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.Copywriter ? 'flex-1 h-full overflow-hidden' : 'hidden'}><Copywriter user={user} onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.BrandingAssistant ? 'flex-1 h-full overflow-y-auto' : 'hidden'}><BrandingAssistant user={user} onNotify={onNotify} /></div>
      <div className={activeTool === AppTool.ScriptToVideo ? 'flex-1 h-full overflow-y-auto' : 'hidden'}><ScriptToVideo onNotify={onNotify} /></div>
      
    </main>
  );
};

export default Workspace;
