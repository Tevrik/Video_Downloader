import { VideoMetadata, PlatformId, VideoQuality } from '../types';

const RATE_LIMIT_KEY = 'snapsave_req_count';
const RATE_LIMIT_TIMESTAMP_KEY = 'snapsave_req_timestamp';
const MAX_REQUESTS_PER_HOUR = 50;

// API Configurations

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const storedTimestamp = localStorage.getItem(RATE_LIMIT_TIMESTAMP_KEY);
  const storedCount = localStorage.getItem(RATE_LIMIT_KEY);

  let count = storedCount ? parseInt(storedCount, 10) : 0;
  let timestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : now;

  // Reset if hour has passed
  if (now - timestamp > 3600 * 1000) {
    count = 0;
    timestamp = now;
  }

  if (count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  localStorage.setItem(RATE_LIMIT_KEY, (count + 1).toString());
  localStorage.setItem(RATE_LIMIT_TIMESTAMP_KEY, timestamp.toString());
  return true;
};

// --- STRATEGY 1: Local Backend API ---
async function tryLocalBackend(url: string, platform: PlatformId): Promise<VideoMetadata | null> {
  // Always use relative path in production/development for standard structure
  const baseUrl = '';
  const endpoint = '/api/download';

  try {
    // 2 second timeout to check if local server is running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, platform }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json() as VideoMetadata;

      // If we have a remote baseUrl, transform relative URLs to absolute
      if (baseUrl) {
        const transformUrl = (url: string) => url.startsWith('/') ? `${baseUrl}${url}` : url;

        if (data.qualities) {
          data.qualities = data.qualities.map(q => ({ ...q, url: transformUrl(q.url) }));
        }
        if (data.audio) {
          data.audio = data.audio.map(a => ({ ...a, url: transformUrl(a.url) }));
        }
        if (data.video) {
          data.video = data.video.map(v => ({ ...v, url: transformUrl(v.url) }));
        }
      }

      return data;
    }
  } catch (e) {
    console.warn(`Failed to connect to ${endpoint}`, e);
  }
  return null;
}

// --- STRATEGY 2: Cobalt API (Fallback) ---
const COBALT_INSTANCES = [
  'https://api.cobalt.tools/api/json',
  'https://cobalt-api.kwiatekmiki.pl/api/json',
  'https://api.cobalt.tools/api/json'
];

async function tryCobaltDownload(url: string, platform: PlatformId): Promise<VideoMetadata> {
  let lastError: Error | null = null;

  for (const instance of COBALT_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(instance, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          vQuality: '1080',
          filenamePattern: 'basic',
          isAudioOnly: false,
          disableMetadata: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.status === 'error' || !data) throw new Error(data?.text || 'API Error');

      // Transform Cobalt Response
      const qualities: VideoQuality[] = [];
      let title = data.filename || `${platform} Video`;

      if (data.status === 'picker' && data.picker) {
        data.picker.forEach((p: any) => {
          qualities.push({
            label: p.type ? p.type.toUpperCase() : 'VIDEO',
            size: 'HD',
            format: 'mp4',
            url: p.url
          });
        });
      } else if (data.url) {
        qualities.push({
          label: 'High Quality',
          size: 'HD',
          format: 'mp4',
          url: data.url
        });
      }

      if (qualities.length === 0) throw new Error("No links found");

      const getThumbnail = () => {
        const map: Record<string, string> = {
          youtube: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&q=80',
          instagram: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=640&q=80',
          tiktok: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=640&q=80',
          facebook: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=640&q=80',
          twitter: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=640&q=80',
          pinterest: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&q=80',
          snapchat: 'https://images.unsplash.com/photo-1595088265008-8e6d27d53066?w=640&q=80'
        };
        return map[platform] || 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?w=640&q=80';
      };

      return {
        id: `cb-${Date.now()}`,
        title: title,
        thumbnail: getThumbnail(),
        duration: '00:00',
        author: 'Social Media User',
        platform: platform,
        qualities: qualities,
        audio: [],
        video: []
      };

    } catch (error: any) {
      console.warn(`Instance ${instance} failed:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error("All download services are currently busy.");
}

// --- MAIN SERVICE ---

export const fetchVideoMetadata = async (url: string, platform: PlatformId): Promise<VideoMetadata> => {
  if (!checkRateLimit()) {
    throw new Error(`Rate limit exceeded. Please wait a moment.`);
  }

  // 1. Direct File Handling
  if (url.match(/\.(mp4|mp3|webm|mov)($|\?)/i)) {
    const isAudio = url.match(/\.mp3($|\?)/i);
    return {
      id: `file-${Date.now()}`,
      title: url.split('/').pop()?.split('?')[0] || "Direct File",
      thumbnail: 'https://placehold.co/640x360?text=Direct+File',
      duration: '00:00',
      author: 'Direct Link',
      platform: platform,
      qualities: [{
        label: 'Original',
        size: 'Unknown',
        format: isAudio ? 'mp3' : 'mp4',
        url: url
      }],
      audio: [],
      video: []
    };
  }

  // 2. Try Local Node.js API (Primary)
  console.log("Attempting local backend...");
  const localResult = await tryLocalBackend(url, platform);
  if (localResult) {
    console.log("Local backend success");
    return localResult;
  }

  // 3. Fallback to Cobalt API
  console.log("Local backend failed, trying Cobalt...");
  try {
    return await tryCobaltDownload(url, platform);
  } catch (error: any) {
    console.error("Download Error Details:", error);
    let msg = error.message;
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        msg = "Could not reach download server. Please ensure you have started the application with 'npm run dev'.";
      } else {
        msg = "The download server is currently unreachable. If you are the owner, please ensure your backend service is running and properly configured.";
      }
    }
    throw new Error(msg);
  }
};