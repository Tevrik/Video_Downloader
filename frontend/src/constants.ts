import { Youtube, Instagram, Facebook, Twitter, Video, Camera, Ghost } from 'lucide-react';
import { PlatformConfig } from './types';

// Using 'Video' icon as a generic placeholder for TikTok since specific icon might not be available in all lucide versions
// Using 'Camera' for Pinterest generic
export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    gradient: 'from-red-500 to-pink-600',
    placeholder: 'Paste YouTube link (e.g., https://youtu.be/...)',
    regex: /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
    description: 'Download YouTube videos in 1080p, 4K, or convert to MP3 instantly.'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    gradient: 'from-purple-500 to-pink-500',
    placeholder: 'Paste Instagram Reel or Post link...',
    regex: /instagram\.com/,
    description: 'Save Instagram Reels, Stories, and IGTV videos without watermarks.'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video, // Generic video icon for TikTok
    color: 'text-black',
    gradient: 'from-cyan-400 to-blue-500',
    placeholder: 'Paste TikTok video link...',
    regex: /tiktok\.com/,
    description: 'Download TikTok videos without the watermark in HD quality.'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    gradient: 'from-blue-600 to-blue-400',
    placeholder: 'Paste Facebook video URL...',
    regex: /facebook\.com|fb\.watch/,
    description: 'Extract public Facebook videos in standard or high definition.'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-sky-500',
    gradient: 'from-sky-400 to-sky-600',
    placeholder: 'Paste Twitter/X post link...',
    regex: /twitter\.com|x\.com/,
    description: 'Save GIFs and videos from Twitter tweets efficiently.'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Camera,
    color: 'text-red-700',
    gradient: 'from-red-600 to-red-800',
    placeholder: 'Paste Pinterest pin link...',
    regex: /pinterest\.com|pin\.it/,
    description: 'Download Pinterest video pins and story pins easily.'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: Ghost,
    color: 'text-yellow-400',
    gradient: 'from-yellow-300 to-yellow-500',
    placeholder: 'Paste Snapchat Story or Spotlight link...',
    regex: /snapchat\.com/,
    description: 'Download Snapchat Spotlights and Stories in high quality.'
  }
];

export const RATE_LIMIT_KEY = 'snapsave_req_count';
export const RATE_LIMIT_TIMESTAMP_KEY = 'snapsave_req_timestamp';
export const MAX_REQUESTS_PER_HOUR = 20;
