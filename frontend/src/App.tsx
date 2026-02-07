import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlatformPage from './pages/PlatformPage';
import ThumbnailPage from './pages/ThumbnailPage';
import { PLATFORMS } from './constants';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <ScrollToTop />
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/thumbnail-downloader" element={<ThumbnailPage />} />
            {PLATFORMS.map((platform) => (
              <React.Fragment key={platform.id}>
                <Route
                  path={`/${platform.id}`}
                  element={<PlatformPage config={platform} />}
                />
              </React.Fragment>
            ))}
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;