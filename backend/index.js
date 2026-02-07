import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import youtubedl from 'yt-dlp-exec';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), 'temp_downloads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

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
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            referer: url
        });

        const videoId = info.id || Date.now().toString();
        const title = info.title || 'Downloaded Video';
        const thumbnail = info.thumbnail || '';
        const uploader = info.uploader || 'Unknown Author';
        const durationStr = formatDuration(info.duration);

        const commonHeaders = info.http_headers || {};
        const userAgent = commonHeaders['User-Agent'] || '';
        const referer = commonHeaders['Referer'] || '';

        const createProxyUrl = (targetUrl) => {
            if (!targetUrl) return "";
            const encodedUrl = encodeURIComponent(targetUrl);
            const encodedUa = encodeURIComponent(userAgent);
            const encodedRef = encodeURIComponent(referer);
            return `/api/proxy?url=${encodedUrl}&ua=${encodedUa}&ref=${encodedRef}`;
        };

        const audioFormats = [];
        const videoFormats = [];

        // 1. Best Quality (Merged HD/4K)
        videoFormats.push({
            label: "Best Quality (HD/4K)",
            sub_label: "High",
            size: "Original",
            format: "mp4",
            quality_badge: "High",
            url: `/api/process?url=${encodeURIComponent(url)}`
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

                let sizeStr = "Unknown";
                if (filesize) {
                    const mb = filesize / (1024 * 1024);
                    sizeStr = mb >= 1 ? `${mb.toFixed(2)} MB` : `${(filesize / 1024).toFixed(2)} KB`;
                }

                // Audio Only
                if (vcodec === 'none' && acodec !== 'none') {
                    const bitrate = abr ? `${Math.floor(abr)}KBPS` : "Audio";
                    if (!seenAudio.has(bitrate)) {
                        audioFormats.push({
                            label: "MP3",
                            sub_label: bitrate,
                            size: sizeStr,
                            format: "mp3",
                            url: createProxyUrl(f.url)
                        });
                        seenAudio.add(bitrate);
                    }
                }
                // Progressive Video
                else if (vcodec !== 'none' && acodec !== 'none') {
                    const label = height ? `${height}p` : "Video";
                    if (!seenVideo.has(label)) {
                        videoFormats.push({
                            label: "MP4",
                            sub_label: label,
                            size: sizeStr,
                            format: "mp4",
                            url: createProxyUrl(f.url)
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
    const { url } = req.query;
    console.log(`Processing Full Download: ${url}`);

    const timestamp = Math.floor(Date.now() / 1000);
    const outputFilename = `${timestamp}_video.mp4`;
    const outputPath = path.join(tempDir, outputFilename);

    try {
        await youtubedl(url, {
            format: 'bestvideo+bestaudio/best',
            output: outputPath,
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            noCallHome: true
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error("File not found after download");
        }

        console.log(`File downloaded to: ${outputPath}`);

        res.download(outputPath, (err) => {
            if (err) {
                console.error('Download sending error:', err);
            }
            // Delete file after sending
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Process Error:', error);
        res.status(400).json({ error: `Server download error: ${error.message}` });
    }
});

app.get('/api/proxy', async (req, res) => {
    const { url, ua, ref } = req.query;
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

        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');

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
