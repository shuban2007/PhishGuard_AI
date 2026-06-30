import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scanMessage } from '../api';
import MessageResultCard from '../components/MessageResultCard';
import { Loader2, ShieldCheck, Lock, Cpu, Layers, Brain, Zap } from 'lucide-react';

const MessageScanner = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const autoScanned = useRef(false);

  // Core scan logic (reusable by both form submit and auto-scan)
  const runScan = async (msg) => {
    if (!msg) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await scanMessage(msg);
      setResult(data);
    } catch (err) {
      setError(err?.message || 'Server error — make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scan when opened with ?message= query param (e.g. from SlixBlock extension)
  useEffect(() => {
    const prefilled = searchParams.get('message');
    if (prefilled && !autoScanned.current) {
      autoScanned.current = true;
      const decoded = decodeURIComponent(prefilled);
      setMessage(decoded);
      runScan(decoded);
    }
  }, [searchParams]);

  const handleScan = async (e) => {
    e.preventDefault();
    runScan(message);
  };

  return (
    <div className="flex-grow bg-transparent text-slate-200">
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-block bg-[#0b1021]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 mb-2 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
              Message Scanner
            </h1>
            <p className="text-lg text-slate-300">
              Paste suspicious emails, texts, or DMs to analyze for threats.
            </p>

            {/* Feature pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                { icon: Cpu, label: 'ML Analysis' },
                { icon: Layers, label: 'Multi-Layer Detection' },
                { icon: Brain, label: 'Intent Classification' },
                { icon: Zap, label: 'Keyword Intelligence' },
              ].map(({ icon: Ico, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold"
                >
                  <Ico className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleScan} className="flex flex-col shadow-2xl bg-[#0b1021]/40 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl p-3 border border-white/10">
            <textarea
              rows="6"
              placeholder="Paste the suspicious content here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-6 py-5 bg-white text-slate-900 border-none outline-none text-lg rounded-2xl placeholder:text-slate-500 resize-y focus:ring-4 focus:ring-purple-500/30 transition-all shadow-inner font-medium"
              required
            />
            <button
               type="submit"
               disabled={loading || !message}
               className="w-full mt-3 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl transition-all flex items-center justify-center shadow-lg"
             >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing…</span>
                </span>
              ) : (
                'Scan Message'
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

          {/* ── Loading animation ─────────────────────────────────────────── */}
          {loading && (
            <div className="mt-10 flex flex-col items-center gap-4 text-slate-400 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-medium text-slate-300">Analyzing your message…</p>
              <p className="text-sm text-slate-500">Checking for threats using AI + keyword intelligence</p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-900/50 text-red-100 border border-red-800 text-center font-bold text-lg rounded-xl animate-in fade-in">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-4 pb-16">
        {result && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex justify-center w-full">
            <MessageResultCard
              score={result.risk_score}
              threatType={result.prediction}
              reasons={result.reasons}
              intent={result.intent}
              matchedPatterns={result.matched_patterns}
              keywordScore={result.keyword_score}
              scamSignals={result.scam_signals}
              safeSignals={result.safe_signals}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageScanner;
