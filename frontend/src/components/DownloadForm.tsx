import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle, Clipboard } from 'lucide-react';
import { PlatformConfig, DownloadState } from '../types';
import { fetchVideoMetadata } from '../services/mockBackend';
import ResultCard from './ResultCard';

interface DownloadFormProps {
  activePlatform?: PlatformConfig;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ activePlatform }) => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<DownloadState>({ status: 'idle', progress: 0 });

  useEffect(() => {
    // Reset state when changing platforms
    setUrl('');
    setState({ status: 'idle', progress: 0 });
  }, [activePlatform]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Basic Validation
    if (activePlatform && !activePlatform.regex.test(url)) {
      setState({ 
        status: 'error', 
        progress: 0, 
        error: `Please enter a valid ${activePlatform.name} URL.` 
      });
      return;
    }

    setState({ status: 'analyzing', progress: 10 });

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setState(prev => {
        if (prev.status === 'completed' || prev.status === 'error') {
          clearInterval(progressInterval);
          return prev;
        }
        const nextProgress = prev.progress + (Math.random() * 10);
        return { ...prev, progress: Math.min(nextProgress, 90) };
      });
    }, 300);

    try {
      const platformId = activePlatform ? activePlatform.id : 'youtube'; // Default to youtube if generic
      const data = await fetchVideoMetadata(url, platformId);
      
      clearInterval(progressInterval);
      setState({ status: 'completed', progress: 100, data });
    } catch (error: any) {
      clearInterval(progressInterval);
      setState({ status: 'error', progress: 0, error: error.message || 'Something went wrong.' });
    }
  };

  if (state.status === 'completed' && state.data) {
    return <ResultCard data={state.data} onReset={() => setState({ status: 'idle', progress: 0 })} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 p-2 sm:p-4 border border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={activePlatform?.placeholder || "Paste video URL here..."}
                className="w-full h-14 pl-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base"
                disabled={state.status === 'analyzing' || state.status === 'downloading'}
              />
              {!url && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={state.status === 'analyzing' || !url}
              className={`h-14 px-8 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 min-w-[140px]
                ${activePlatform 
                  ? `bg-gradient-to-r ${activePlatform.gradient}` 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30'
                }
                ${(state.status === 'analyzing' || !url) ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {state.status === 'analyzing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Bar */}
        {(state.status === 'analyzing' || state.status === 'downloading') && (
          <div className="mt-4 px-2">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Analyzing video...</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out ${activePlatform ? `bg-gradient-to-r ${activePlatform.gradient}` : 'bg-indigo-600'}`}
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start space-x-3 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-400">
        By using our service you agree to our <Link to="#" className="underline hover:text-slate-600">Terms of Service</Link>.
      </div>
    </div>
  );
};

export default DownloadForm;