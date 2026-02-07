import React, { useState } from 'react';
import { VideoMetadata, VideoQuality } from '../types';
import { Download, Music, Video, ArrowDown } from 'lucide-react';
import { generateSmartTitle, suggestTags } from '../services/geminiService';

interface ResultCardProps {
  data: VideoMetadata;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  // Use new arrays if available, fallback to legacy cleaning if needed
  const audioOptions = data.audio || [];
  const videoOptions = data.video || [];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto transition-colors">
      <div className="md:flex">
        {/* Left Column: Video Info */}
        <div className="md:w-1/3 p-6 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative group rounded-lg overflow-hidden shadow-sm mb-4">
            <img
              src={data.thumbnail}
              alt={data.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
              {data.duration}
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug mb-2">
            {data.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Uploaded by <span className="font-semibold text-slate-700 dark:text-slate-300">{data.author}</span>
          </p>

          <button
            onClick={onReset}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
          >
            ← Download another video
          </button>
        </div>

        {/* Right Column: Download Options */}
        <div className="md:w-2/3 p-6">

          {/* Audio Section */}
          {audioOptions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Music className="w-5 h-5 text-green-500" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Music</h4>
              </div>

              <div className="space-y-3">
                {audioOptions.map((opt, idx) => (
                  <DownloadRow key={`audio-${idx}`} option={opt} type="audio" />
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          {(videoOptions.length > 0) && (
            <div>
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Video className="w-5 h-5 text-green-500" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Video</h4>
              </div>

              <div className="space-y-3">
                {videoOptions.map((opt, idx) => (
                  <DownloadRow key={`video-${idx}`} option={opt} type="video" />
                ))}
              </div>
            </div>
          )}

          {/* Fallback if both empty (legacy support) */}
          {audioOptions.length === 0 && videoOptions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No format options found.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const DownloadRow: React.FC<{ option: VideoQuality, type: 'audio' | 'video' }> = ({ option, type }) => {
  const badgeColor = type === 'audio' ? 'bg-amber-400 text-white' : 'bg-orange-400 text-white';

  return (
    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${badgeColor} uppercase w-12 text-center shrink-0`}>
          {option.format}
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            {option.sub_label || option.label}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {option.size}
          </span>
        </div>
      </div>

      <a
        href={option.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="flex items-center space-x-1 px-4 py-1.5 bg-white dark:bg-transparent border-2 border-green-500 text-green-600 dark:text-green-400 rounded text-sm font-bold hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
      >
        <ArrowDown className="w-4 h-4" />
        <span>Download</span>
      </a>
    </div>
  );
}

export default ResultCard;