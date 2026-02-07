import React from 'react';
import { Link } from 'react-router-dom';
import DownloadForm from '../components/DownloadForm';
import { PLATFORMS } from '../constants';
import { Layers, Globe, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-32 px-4 text-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100 dark:bg-indigo-950/30 rounded-full blur-3xl opacity-50 -z-10" />

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Download Videos <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            From Any Platform
          </span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          The all-in-one video downloader. Save content from YouTube, Instagram, TikTok, Facebook, and more in original quality.
        </p>

        <DownloadForm />

        {/* Platform Quick Links */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 opacity-70 hover:opacity-100 transition-opacity duration-300">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to={`/${p.id}`}
                className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{p.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white dark:bg-slate-900 py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Universal Video Downloader</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Built for speed, simplicity, and quality.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Support 50+ Sites</h3>
              <p className="text-slate-500 dark:text-slate-400">We support all major social media platforms and streaming sites. One tool for everything.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">High Quality</h3>
              <p className="text-slate-500 dark:text-slate-400">Download videos in SD, HD, FullHD, 2K, and 4K. We preserve the original source quality.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Fast & Free</h3>
              <p className="text-slate-500 dark:text-slate-400">No limits on download speed or file size. Completely free to use forever.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;