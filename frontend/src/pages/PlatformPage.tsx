import React from 'react';
import { PlatformConfig } from '../types';
import DownloadForm from '../components/DownloadForm';
import { CheckCircle2, Zap, Shield, Smartphone } from 'lucide-react';

interface PlatformPageProps {
  config: PlatformConfig;
}

const PlatformPage: React.FC<PlatformPageProps> = ({ config }) => {
  const Icon = config.icon;

  return (
    <div className="min-h-screen pt-12 pb-24">
      {/* Hero Section */}
      <section className="px-4 text-center mb-16">
        <div className={`inline-flex items-center justify-center p-4 rounded-full bg-slate-100 mb-6 ${config.color}`}>
          <Icon className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
            {config.name}
          </span> Video Downloader
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          {config.description} Fast, free, and no watermark.
        </p>

        <DownloadForm activePlatform={config} />
      </section>

      {/* SEO Content / Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Why use SnapSave for {config.name}?</h2>
            <p className="text-slate-600 leading-relaxed">
              Our advanced algorithm allows you to download {config.name} videos in the highest quality available. 
              Whether it's 4K, HD, or MP3 audio, we process your request instantly without storing any of your data.
            </p>
            <ul className="space-y-4">
              {[
                'Unlimited downloads without restriction',
                'No registration or software installation required',
                'Works on all devices (iPhone, Android, PC, Mac)',
                '100% Safe and Secure'
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <CheckCircle2 className={`w-5 h-5 ${config.color}`} />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
             <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Lightning Fast</h3>
                    <p className="text-sm text-slate-500 mt-1">Servers optimized for speed ensure your downloads start in milliseconds.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Secure & Private</h3>
                    <p className="text-sm text-slate-500 mt-1">We use 256-bit SSL encryption. No logs are kept.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Mobile Friendly</h3>
                    <p className="text-sm text-slate-500 mt-1">Designed for a perfect experience on mobile browsers.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* How to steps */}
        <div className="border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">How to download {config.name} videos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center px-4">
              <div className="w-12 h-12 mx-auto bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-indigo-200">1</div>
              <h3 className="font-semibold text-slate-900 mb-2">Copy Link</h3>
              <p className="text-sm text-slate-500">Find the video you want to save on {config.name} and copy its URL.</p>
            </div>
            <div className="relative text-center px-4">
              <div className="w-12 h-12 mx-auto bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-indigo-200">2</div>
              <h3 className="font-semibold text-slate-900 mb-2">Paste & Click</h3>
              <p className="text-sm text-slate-500">Paste the link into our search box and hit the download button.</p>
            </div>
            <div className="relative text-center px-4">
              <div className="w-12 h-12 mx-auto bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-indigo-200">3</div>
              <h3 className="font-semibold text-slate-900 mb-2">Save File</h3>
              <p className="text-sm text-slate-500">Select your preferred quality (MP4 or MP3) and save it to your device.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformPage;