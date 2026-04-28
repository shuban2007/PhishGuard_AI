import React, { useState, useEffect, useRef } from 'react';
import { scanUrl } from '../api';
import ResultCard from '../components/ResultCard';
import { Loader2, ShieldCheck, Lock, Zap } from 'lucide-react';

const UrlScanner = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  // Track when the scan was triggered by the extension (for the auto-scan banner)
  const [autoScanned, setAutoScanned] = useState(false);
  const hasAutoScanned = useRef(false);

  /**
   * Core scan function.
   * @param {string} [urlOverride] - If provided, scan this URL instead of the state value.
   *   Used for programmatic (extension) invocations so we don't depend on stale state.
   */
  const handleScan = async (urlOverride) => {
    const target = typeof urlOverride === 'string' ? urlOverride : url;
    if (!target) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await scanUrl(target);
      setResult(data);
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Form submit handler — prevents default and calls handleScan with no override. */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleScan();
  };

  /**
   * On mount: check for ?url= query parameter injected by the Chrome extension.
   * If present → pre-fill the input and fire the scan automatically.
   */
  useEffect(() => {
    if (hasAutoScanned.current) return; // run only once
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get('url');

    if (paramUrl) {
      hasAutoScanned.current = true;
      setAutoScanned(true);
      setUrl(paramUrl);
      // Use the raw param value — don't rely on state update being synchronous
      handleScan(paramUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-grow bg-transparent text-slate-200">
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-block bg-[#0b1021]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 mb-2 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
              URL Scanner
            </h1>
            <p className="text-lg text-slate-300">
              Analyze any link for potential phishing threats.
            </p>
          </div>
        </div>

        {/* ── Extension auto-scan indicator ───────────────────────────────── */}
        {autoScanned && (
          <div className="max-w-3xl mx-auto mb-5 flex items-center gap-3 px-5 py-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong className="text-indigo-200">Auto-scan triggered</strong> — URL captured from your active browser tab via PhishGuard extension.
            </span>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col md:flex-row shadow-2xl bg-[#0b1021]/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl md:rounded-full p-2 border border-white/10"
          >
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow px-6 py-4 bg-white text-slate-900 border-none outline-none text-lg rounded-xl md:rounded-l-full placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner font-medium"
              required
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="px-8 py-4 mt-2 md:mt-0 md:ml-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl md:rounded-r-full transition-all flex items-center justify-center min-w-[140px] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-base">Analyzing…</span>
                </span>
              ) : (
                'Scan'
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-center items-center gap-8 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secure Scan
            </div>
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <Lock className="w-4 h-4 text-slate-300" />
              No Logs Stored
            </div>
          </div>

          {/* ── Loading state (shown during auto-scan before result arrives) ── */}
          {loading && (
            <div className="mt-10 flex flex-col items-center gap-4 text-slate-400 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-medium text-slate-300">Analyzing URL…</p>
              <p className="text-sm text-slate-500">Running AI + Safe Browsing + heuristic analysis</p>
            </div>
          )}

          {/* ── Error banner ─────────────────────────────────────────────────── */}
          {error && (
            <div className="mt-8 p-6 bg-red-900/50 text-red-100 border border-red-800 text-center font-bold text-lg rounded-sm animate-in fade-in">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ── Result card ────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {result && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <ResultCard
              score={result.risk_score}
              threatType={result.prediction}
              explanation={result.reason}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlScanner;
