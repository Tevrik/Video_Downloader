import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import youtubedl from 'yt-dlp-exec';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check with diagnostics
app.get('/api/health', async (req, res) => {
    let ytdlpVersion = 'unknown';
    try {
        ytdlpVersion = (await youtubedl('--version')).trim();
    } catch (e) {
        ytdlpVersion = `Error: ${e.message}`;
    }

    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        port: port,
        ytdlp: ytdlpVersion,
        cwd: process.cwd(),
        python: process.env.PYTHON_PATH || 'not set'
    });
});

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), 'temp_downloads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
console.log(`Temp directory confirmed at: ${tempDir}`);

// Serve Static Frontend Files (Production)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
}

function formatDuration(seconds) {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

app.post('/api/download', async (req, res) => {
    const { url, platform = 'auto' } = req.body;
    console.log(`Processing URL: ${url}`);

    try {
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            // noCallHome is deprecated in newer yt-dlp
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            referer: url,
            flatPlaylist: true
        });

        const isPlaylist = info._type === 'playlist' || (info.entries && info.entries.length > 0);

        if (isPlaylist) {
            const playlistEntries = info.entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`
            }));

            return res.json({
                id: info.id || `pl-${Date.now()}`,
                title: info.title || 'YouTube Playlist',
                thumbnail: info.thumbnails?.[0]?.url || (playlistEntries[0] ? `https://i.ytimg.com/vi/${playlistEntries[0].id}/hqdefault.jpg` : ''),
                duration: `${info.playlist_count || playlistEntries.length} Items`,
                author: info.uploader || 'YouTube',
                platform,
                isPlaylist: true,
                playlistEntries: playlistEntries,
                audio: [],
                video: []
            });
        }

        const videoId = info.id || Date.now().toString();
        const title = info.title || 'Downloaded Video';
        const thumbnail = info.thumbnail || '';
        const uploader = info.uploader || 'Unknown Author';
        const durationStr = formatDuration(info.duration);

        const commonHeaders = info.http_headers || {};
        const userAgent = commonHeaders['User-Agent'] || '';
        const referer = commonHeaders['Referer'] || '';

        const sanitizeFilename = (name) => {
            return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
        };

        const safeTitle = sanitizeFilename(title);

        const createProxyUrl = (targetUrl, ext = 'mp4') => {
            if (!targetUrl) return "";
            const encodedUrl = encodeURIComponent(targetUrl);
            const encodedUa = encodeURIComponent(userAgent);
            const encodedRef = encodeURIComponent(referer);
            const encodedTitle = encodeURIComponent(safeTitle);
            return `/api/proxy?url=${encodedUrl}&ua=${encodedUa}&ref=${encodedRef}&ext=${ext}&title=${encodedTitle}`;
        };

        const audioFormats = [];
        const videoFormats = [];

        // 1. Best Quality (Max 1080p)
        videoFormats.push({
            label: "Best Quality (Max 1080p)",
            sub_label: "High",
            size: "Original",
            format: "auto",
            quality_badge: "High",
            url: `/api/process?url=${encodeURIComponent(url)}&quality=1080&title=${encodeURIComponent(safeTitle)}`
        });

        if (info.formats) {
            const seenVideo = new Set();
            const seenAudio = new Set();

            for (const f of info.formats) {
                if (!f.url) continue;

                const protocol = f.protocol || '';
                if (protocol.includes('m3u8') || protocol.includes('dash')) continue;

                const vcodec = f.vcodec || 'none';
                const acodec = f.acodec || 'none';
                const filesize = f.filesize || f.filesize_approx;
                const height = f.height;
                const abr = f.abr;
                const ext = f.ext || 'v';

                let sizeStr = "Unknown";
                if (filesize) {
                    const mb = filesize / (1024 * 1024);
                    sizeStr = mb >= 1 ? `${mb.toFixed(2)} MB` : `${(filesize / 1024).toFixed(2)} KB`;
                }

                // Audio Only
                if (vcodec === 'none' && acodec !== 'none') {
                    const bitrate = abr ? `${Math.floor(abr)}KBPS` : "Audio";
                    const audioLabel = ext.toUpperCase() === 'M4A' ? 'M4A' : (ext.toUpperCase() === 'WEBM' ? 'WEBM' : 'Audio');
                    if (!seenAudio.has(bitrate + ext)) {
                        audioFormats.push({
                            label: audioLabel,
                            sub_label: bitrate,
                            size: sizeStr,
                            format: ext,
                            url: createProxyUrl(f.url, ext)
                        });
                        seenAudio.add(bitrate + ext);
                    }
                }
                // Progressive Video (Video + Audio combined)
                else if (vcodec !== 'none' && acodec !== 'none') {
                    // Skip resolutions higher than 1080p
                    if (height && height > 1080) continue;

                    const label = height ? `${height}p` : "Video";
                    const videoLabel = ext.toUpperCase();
                    if (!seenVideo.has(label + ext)) {
                        videoFormats.push({
                            label: videoLabel,
                            sub_label: label,
                            size: sizeStr,
                            format: ext,
                            url: createProxyUrl(f.url, ext)
                        });
                        seenVideo.add(label + ext);
                    }
                }
                // High Quality Video Only (Need merging)
                else if (vcodec !== 'none' && acodec === 'none' && height >= 1080 && height <= 1080) {
                    const label = `${height}p (High Quality)`;
                    if (!seenVideo.has(label)) {
                        videoFormats.push({
                            label: "Video",
                            sub_label: label,
                            size: sizeStr,
                            format: "auto",
                            quality_badge: "High",
                            url: `/api/process?url=${encodeURIComponent(url)}&quality=${height}&title=${encodeURIComponent(safeTitle)}`
                        });
                        seenVideo.add(label);
                    }
                }
            }

            // Sort
            videoFormats.sort((a, b) => {
                const ha = parseInt(a.sub_label) || 0;
                const hb = parseInt(b.sub_label) || 0;
                return hb - ha;
            });
            audioFormats.sort((a, b) => {
                const ba = parseInt(a.sub_label) || 0;
                const bb = parseInt(b.sub_label) || 0;
                return bb - ba;
            });
        }

        res.json({
            id: `js-${videoId}`,
            title,
            thumbnail,
            duration: durationStr,
            author: uploader,
            platform,
            qualities: [],
            audio: audioFormats,
            video: videoFormats
        });

    } catch (error) {
        console.error('Metadata Error:', error);
        res.status(400).json({ error: `Could not download video: ${error.message}` });
    }
});

app.get('/api/process', async (req, res) => {
    const { url, quality, title } = req.query;
    const safeTitle = title || 'video';
    console.log(`Processing Full Download: ${url} (Quality: ${quality || 'Best'}, Title: ${safeTitle})`);

    const timestamp = Math.floor(Date.now() / 1000);
    const uniqueId = `${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
    const outputTemplate = path.join(tempDir, `${uniqueId}_%(title)s.%(ext)s`);

    try {
        const options = {
            output: outputTemplate,
            noWarnings: true
            // noCallHome is deprecated
        };

        if (quality) {
            options.format = `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
        } else {
            options.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best';
        }

        await youtubedl(url, options);

        // Find the actual downloaded file since the extension could be mp4, mkv, webm, etc.
        const files = fs.readdirSync(tempDir);
        const downloadedFile = files.find(f => f.startsWith(uniqueId));

        if (!downloadedFile) {
            throw new Error("File not found after download");
        }

        const outputPath = path.join(tempDir, downloadedFile);
        const ext = path.extname(downloadedFile).substring(1) || 'mp4';

        const contentTypeMap = {
            'mp4': 'video/mp4',
            'mkv': 'video/x-matroska',
            'webm': 'video/webm',
            'm4a': 'audio/mp4',
            'mp3': 'audio/mpeg'
        };

        console.log(`File downloaded to: ${outputPath} (ext: ${ext})`);

        const stats = fs.statSync(outputPath);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);

        const filestream = fs.createReadStream(outputPath);
        filestream.pipe(res);

        filestream.on('end', () => {
            // Delete file after sending
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
        });

        filestream.on('error', (err) => {
            console.error('Stream error:', err);
        });
    } catch (error) {
        console.error('Process Error:', error);
        res.status(400).json({ error: `Server download error: ${error.message}` });
    }
});

app.get('/api/playlist/download', async (req, res) => {
    const { url, title } = req.query;
    const safeTitle = (title || 'playlist').replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    console.log(`Processing Playlist Download: ${url} (${safeTitle})`);

    const playlistDir = path.join(tempDir, `playlist_${Date.now()}`);
    if (!fs.existsSync(playlistDir)) fs.mkdirSync(playlistDir, { recursive: true });

    try {
        // Download all items in playlist
        // We use a simplified format to speed up playlist downloads
        await youtubedl(url, {
            output: `${playlistDir}/%(title)s.%(ext)s`,
            format: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            ignoreErrors: true, // If one video fails, continue with others
            ffmpegLocation: '/usr/bin/ffmpeg'
        });

        const files = fs.readdirSync(playlistDir);
        if (files.length === 0) {
            throw new Error("No videos could be downloaded from this playlist.");
        }

        // Create ZIP
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        for (const file of files) {
            archive.file(path.join(playlistDir, file), { name: file });
        }

        await archive.finalize();

        // Cleanup after streaming
        res.on('finish', () => {
            fs.rm(playlistDir, { recursive: true, force: true }, (err) => {
                if (err) console.error('Error cleaning up playlist dir:', err);
            });
        });

    } catch (error) {
        console.error('Playlist Process Error:', error);
        if (!res.headersSent) {
            res.status(400).json({ error: `Playlist download error: ${error.message}` });
        }
        // Cleanup on error
        fs.rm(playlistDir, { recursive: true, force: true }, () => { });
    }
});

app.get('/api/proxy', async (req, res) => {
    const { url, ua, ref, ext = 'mp4', title } = req.query;
    const safeTitle = title || 'download';
    try {
        const headers = {};
        if (ua) headers['User-Agent'] = ua;
        if (ref) headers['Referer'] = ref;

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: headers
        });

        const contentTypeMap = {
            'mp4': 'video/mp4',
            'm4a': 'audio/mp4',
            'webm': 'video/webm',
            'mp3': 'audio/mpeg',
            'opus': 'audio/opus'
        };

        res.setHeader('Content-Type', contentTypeMap[ext] || response.headers['content-type'] || 'video/mp4');
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(400).json({ error: `Proxy error: ${error.message}` });
    }
});

// Catch-all middleware for SPA support
app.use((req, res, next) => {
    // Skip API routes so they can be handled by actual routes or 404
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Serve index.html for all other routes
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend build not found. Please run: npm run build');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`SnapSave Node.js API starting on http://0.0.0.0:${port}`);
});
