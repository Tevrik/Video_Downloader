import { LucideIcon } from 'lucide-react';

export type PlatformId = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'pinterest' | 'snapchat';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  placeholder: string;
  regex: RegExp;
  description: string;
}

export interface VideoQuality {
  label: string; // e.g., "1080p", "720p", "Audio Only"
  size: string;  // e.g., "45.2 MB"
  format: string; // e.g., "mp4", "mp3"
  url: string;   // Mock URL
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  platform: PlatformId;
  qualities: VideoQuality[]; // Keep for backward compat if needed, or deprecate
  audio: VideoQuality[];     // New: dedicated audio tracks
  video: VideoQuality[];     // New: dedicated video tracks
}

export interface DownloadState {
  status: 'idle' | 'analyzing' | 'downloading' | 'completed' | 'error';
  progress: number;
  error?: string;
  data?: VideoMetadata;
}
