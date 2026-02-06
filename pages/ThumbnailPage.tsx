import React, { useState } from 'react';
import { Search, Loader2, Image as ImageIcon, Download, Film } from 'lucide-react';
import { fetchVideoMetadata } from '../services/mockBackend';
import { VideoMetadata, PlatformId } from '../types';

const ThumbnailPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VideoMetadata | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Determine platform from URL simply for the API call
            // In a real app we might want more robust detection or just pass 'youtube' as default
            let platform: PlatformId = 'youtube';
            if (url.includes('instagram')) platform = 'instagram';
            else if (url.includes('tiktok')) platform = 'tiktok';
            else if (url.includes('facebook')) platform = 'facebook';
            else if (url.includes('twitter') || url.includes('x.com')) platform = 'twitter';
            else if (url.includes('pinterest')) platform = 'pinterest';
            else if (url.includes('snapchat')) platform = 'snapchat';

            const data = await fetchVideoMetadata(url, platform);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch thumbnail. Please check the URL.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!result?.thumbnail) return;
        try {
            const response = await fetch(result.thumbnail);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `thumbnail-${result.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            // Fallback for cross-origin images if fetch fails
            window.open(result.thumbnail, '_blank');
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-24 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-violet-100 mb-6 text-violet-600">
                        <ImageIcon className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Free Video <span className="text-violet-600">Thumbnail Downloader</span>
                    </h1>
                    <p className="text-lg text-slate-500">
                        Get high-quality thumbnails from YouTube, Instagram, TikTok, and more.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-slate-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="relative mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Film className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste video URL here..."
                                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center mb-6">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 relative group shadow-md mb-6">
                                <img
                                    src={result.thumbnail}
                                    alt={result.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate pr-4">{result.title}</h3>
                                    <p className="text-sm text-slate-500">Source: {result.platform}</p>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="whitespace-nowrap flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Thumbnail</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="prose prose-slate mx-auto text-center text-slate-500">
                    <p>Simply paste the video link from any supported platform to grab the full resolution thumbnail image.</p>
                </div>
            </div>
        </div>
    );
};

export default ThumbnailPage;
