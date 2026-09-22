import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isModalMode, setIsModalMode] = useState(false);
  const [installState, setInstallState] = useState<'ready' | 'prompted' | 'manual_needed'>('ready');

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);
    if (standalone) {
      return; // Already installed and running as standalone app
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    // Triggered when user clicks "Install App" in dashboard header
    const openHandler = () => {
      setIsVisible(true);
      setIsModalMode(true);
    };
    window.addEventListener('open-pwa-install', openHandler);

    // Auto-show banner after 2s if never dismissed in this session
    const dismissed = sessionStorage.getItem('testament_pwa_dismissed_session');
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!dismissed) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('open-pwa-install', openHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    soundEngine.playSnap();

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          setInstallState('ready');
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.warn('Native install prompt failed:', err);
      }
    }

    // If deferredPrompt is not available (Safari iOS, or desktop browser requiring manual address-bar click)
    setInstallState('manual_needed');
  };

  const handleDismiss = () => {
    soundEngine.playClick();
    setIsVisible(false);
    setIsModalMode(false);
    sessionStorage.setItem('testament_pwa_dismissed_session', 'true');
  };

  if (!isVisible || isStandalone) return null;

  // Render content
  const cardContent = (
    <div className="w-full bg-[#141820] border-2 border-amber-500/70 rounded-3xl shadow-2xl backdrop-blur-xl p-5 md:p-6 text-left flex flex-col gap-4">
      {/* Header with App Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-amber-500/70 shadow-glow-gold bg-stone-950 shrink-0">
            <img 
              src="/icons/icon-192.png" 
              alt="Testament App Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-parchment-50">
                Install Testament
              </h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              100% offline access, audio narration & home screen launch
            </p>
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-stone-400 hover:text-parchment-100 p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Feature Bullets */}
      <div className="grid grid-cols-2 gap-2 py-1 text-[11px] text-stone-300">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Full Offline Mode</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Cinematic Voice Audio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Zero App Store Delay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Desktop & Mobile Icon</span>
        </div>
      </div>

      {/* Primary Install Action Button (ALWAYS VISIBLE & PROMINENT) */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleInstallClick}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-glow-gold cursor-pointer active:scale-[0.98]"
        >
          <Download className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          <span>Install Testament App Now</span>
        </button>

        {/* If deferredPrompt not immediately available, show clear visual instructions */}
        {installState === 'manual_needed' && (
          <div className="mt-3 p-3.5 rounded-xl bg-stone-900/90 border border-amber-500/40 text-xs text-stone-200 space-y-2 animate-fadeIn">
            {isIOS ? (
              <>
                <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Installing on iPhone / iPad (Safari):</span>
                </div>
                <div className="text-stone-300 space-y-1 pl-1 text-[11px] leading-relaxed">
                  <p>1. Tap the <strong>Share</strong> button at the bottom of Safari (square with up arrow <ArrowUpRight className="w-3 h-3 inline" />).</p>
                  <p>2. Scroll down and select <strong>"Add to Home Screen"</strong>.</p>
                  <p>3. Tap <strong>"Add"</strong> in the top-right corner.</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>Installing on Computer / Chrome / Edge:</span>
                </div>
                <div className="text-stone-300 space-y-1.5 pl-1 text-[11px] leading-relaxed">
                  <p className="flex items-center gap-1.5">
                    <span>1. Look at the top right of your address bar for the</span>
                    <strong className="text-amber-300 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">Install icon (⊕)</strong>
                  </p>
                  <p>2. Or open browser menu <strong>(⋮)</strong> ➔ click <strong>"Install Testament"</strong> or <strong>"Add to Home screen"</strong>.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer / Dismiss */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-xs text-stone-400">
        <button
          onClick={() => setInstallState(installState === 'manual_needed' ? 'ready' : 'manual_needed')}
          className="text-amber-400/90 hover:text-amber-300 underline text-[11px]"
        >
          {installState === 'manual_needed' ? 'Hide device tips' : 'Need help installing?'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-200 py-1 px-2 text-[11px]"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );

  // If opened via header button, show as focused modal with backdrop
  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="max-w-md w-full animate-scaleUp">
          {cardContent}
        </div>
      </div>
    );
  }

  // Floating banner mode (positioned cleanly above bottom nav bar)
  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-22 sm:w-96 z-50 animate-bounce-short">
      {cardContent}
    </div>
  );
};
