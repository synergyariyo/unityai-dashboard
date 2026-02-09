export enum AppTool {
  Dashboard = 'DASHBOARD',
  GenerativeBrain = 'GENERATIVE_BRAIN',
  MediaStudio = 'MEDIA_STUDIO',
  BrandingAssistant = 'BRANDING_ASSISTANT',
  ScriptToVideo = 'SCRIPT_TO_VIDEO',
  VoiceOver = 'VOICE_OVER',
  SmartEditor = 'SMART_EDITOR',
  Copywriter = 'COPYWRITER'
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GeneratedMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  createdAt: Date;
  audioVariant?: {
    voice: string;
    speed: number;
    pitch: number;
  };
}

export interface EditorPreset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}