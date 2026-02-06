import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-xl font-bold text-white mb-4 block">SnapSave Pro</span>
            <p className="text-sm text-slate-400">
              The fastest and most secure video downloader for your favorite social media platforms.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platforms</h3>
            <ul className="space-y-2">
              <li><Link to="/youtube" className="text-sm hover:text-white transition-colors">YouTube</Link></li>
              <li><Link to="/instagram" className="text-sm hover:text-white transition-colors">Instagram</Link></li>
              <li><Link to="/tiktok" className="text-sm hover:text-white transition-colors">TikTok</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Copyright</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
             <p className="text-sm text-slate-400 mb-2">support@snapsavepro.com</p>
             <div className="flex items-center space-x-1 text-xs text-slate-500">
               <span>Made with</span>
               <Heart className="w-3 h-3 text-red-500 fill-current" />
               <span>by Engineers</span>
             </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SnapSave Pro. All rights reserved. Not affiliated with any social media platforms.
        </div>
      </div>
    </footer>
  );
};

export default Footer;