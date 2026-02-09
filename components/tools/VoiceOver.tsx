
import React, { useState, useRef } from 'react';
import { generateSpeech, generateSpeechFromReference } from '../../services/geminiService';
import { GeneratedMedia } from '../../types';
import { Mic, Play, Download, Volume2, Loader2, Upload, Trash2, User, Sliders, History, Globe, Sparkles } from 'lucide-react';

interface VoiceOverProps {
  onNotify: () => void;
}

const VoiceOver: React.FC<VoiceOverProps> = ({ onNotify }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  
  // Voice Market State
  const [region, setRegion] = useState('US');
  const [voicePersona, setVoicePersona] = useState('female_professional');
  
  const [customVoiceFile, setCustomVoiceFile] = useState<{data: string, name: string, mime: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(50); 
  const [pitch, setPitch] = useState(50); 
  const [generatedList, setGeneratedList] = useState<GeneratedMedia[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const regions = [
    { id: 'US', label: 'American English (US)' },
    { id: 'NG', label: 'Nigerian English' },
    { id: 'UK', label: 'British English (UK)' },
    { id: 'IN', label: 'Indian English' },
    { id: 'EU', label: 'European English' },
    { id: 'CN', label: 'Chinese (Mandarin)' },
    { id: 'IL', label: 'Hebrew (Israel)' },
  ];

  const getPersonasForRegion = (reg: string) => {
     return [
       { id: 'female_soft', label: 'Female - Soft & Soothing', gender: 'Female' },
       { id: 'female_prof', label: 'Female - Professional', gender: 'Female' },
       { id: 'female_energetic', label: 'Female - Energetic', gender: 'Female' },
       { id: 'male_deep', label: 'Male - Deep & Authoritative', gender: 'Male' },
       { id: 'male_casual', label: 'Male - Casual & Friendly', gender: 'Male' },
       { id: 'male_prof', label: 'Male - Professional', gender: 'Male' },
     ];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Please upload an audio file smaller than 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const mime = result.substring(result.indexOf(':') + 1, result.indexOf(';'));
        setCustomVoiceFile({
          data: result,
          name: file.name,
          mime: mime
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInstructions = () => {
    const instructions = [];
    if (speed > 75) instructions.push("speak quickly");
    if (speed < 25) instructions.push("speak slowly");
    if (pitch > 75) instructions.push("use a high-pitched voice");
    if (pitch < 25) instructions.push("use a deep voice");
    return instructions;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (mode === 'custom' && !customVoiceFile) return;

    setLoading(true);

    try {
      let audioBuffer: AudioBuffer;
      const techInstructions = getInstructions();
      
      if (mode === 'custom' && customVoiceFile) {
        const styleText = techInstructions.join(' and ');
        const base64Data = customVoiceFile.data.split(',')[1];
        audioBuffer = await generateSpeechFromReference(text, base64Data, customVoiceFile.mime, styleText);
      } else {
        const persona = getPersonasForRegion(region).find(p => p.id === voicePersona) || getPersonasForRegion(region)[0];
        const baseVoice = persona.gender === 'Male' ? 'Fenrir' : 'Kore';
        let languageName = regions.find(r => r.id === region)?.label || 'English';
        let accentInstruction = `Speak in ${languageName}. Use a ${persona.label.split('-')[1].trim()} tone.`;
        if (techInstructions.length > 0) {
          accentInstruction += ` Also, ${techInstructions.join(' and ')}.`;
        }
        audioBuffer = await generateSpeech(text, baseVoice, accentInstruction);
      }
      
      const wavBlob = await audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setGeneratedList(prev => [{
        type: 'audio',
        url,
        prompt: text,
        createdAt: new Date(),
        audioVariant: {
          voice: mode === 'custom' ? 'Custom Clone' : `${region} - ${getPersonasForRegion(region).find(p => p.id === voicePersona)?.label}`,
          speed,
          pitch
        }
      }, ...prev]);
      onNotify(); // Trigger bell notification

    } catch (error) {
      console.error(error);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferOut = new ArrayBuffer(length);
    const view = new DataView(bufferOut);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this example)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < buffer.length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(44 + offset, sample, true); // write 16-bit sample
        offset += 2;
      }
      pos++;
    }

    return new Blob([bufferOut], { type: "audio/wav" });

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Voice Over Generator</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Transform your script into lifelike speech.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
             <button 
               onClick={() => setMode('preset')}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'preset' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               Voice Market
             </button>
             <button 
               onClick={() => setMode('custom')}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'custom' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               Custom Clone
             </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Script</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Enter your script here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {mode === 'preset' ? (
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <Globe className="w-4 h-4" /> Language & Region
                     </label>
                     <select 
                       value={region}
                       onChange={(e) => {
                           setRegion(e.target.value);
                           setVoicePersona(getPersonasForRegion(e.target.value)[0].id);
                       }}
                       className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                     >
                       {regions.map(r => (
                         <option key={r.id} value={r.id}>{r.label}</option>
                       ))}
                     </select>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Voice Persona
                      </label>
                      <select 
                        value={voicePersona}
                        onChange={(e) => setVoicePersona(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                      >
                         {getPersonasForRegion(region).map(p => (
                             <option key={p.id} value={p.id}>{p.label}</option>
                         ))}
                      </select>
                   </div>
                </div>
              ) : (
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reference Audio</label>
                   {!customVoiceFile ? (
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800"
                     >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="audio/*" 
                          onChange={handleFileChange} 
                        />
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-slate-700 dark:text-slate-300">Upload Voice Sample</p>
                          <p className="text-xs text-slate-400">MP3, WAV (Max 10MB)</p>
                        </div>
                     </div>
                   ) : (
                     <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3 bg-white dark:bg-slate-800 pr-4">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-sm max-w-[150px]">
                          <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{customVoiceFile.name}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready to clone</p>
                        </div>
                        <button 
                          onClick={() => { setCustomVoiceFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Generation Settings</span>
               </div>
               
               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Speed</span>
                    <span>{speed < 40 ? 'Slow' : speed > 60 ? 'Fast' : 'Normal'}</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" value={speed} 
                   onChange={(e) => setSpeed(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
               </div>

               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Pitch</span>
                    <span>{pitch < 40 ? 'Deep' : pitch > 60 ? 'High' : 'Normal'}</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" value={pitch} 
                   onChange={(e) => setPitch(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={loading || !text || (mode === 'custom' && !customVoiceFile)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
              <span>{mode === 'custom' ? 'Clone & Generate' : 'Generate Audio'}</span>
            </button>
          </div>
        </div>
      </div>

      {generatedList.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Generated Voice Library
          </h3>
          
          <div className="grid gap-3">
             {generatedList.map((media, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors">
                   <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                      <Play className="w-4 h-4 ml-0.5" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white text-sm line-clamp-1">{media.prompt}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                         <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{media.audioVariant?.voice}</span>
                         <span className="text-slate-400 ml-auto md:ml-0">{media.createdAt.toLocaleTimeString()}</span>
                      </div>
                   </div>

                   <div className="w-full md:w-auto flex items-center gap-3">
                      <audio controls src={media.url} className="h-8 w-full md:w-48 accent-indigo-600" />
                      <a 
                        href={media.url} 
                        download={`voiceover-${idx}.wav`} 
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg transition-colors shrink-0"
                        title="Download WAV"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceOver;
