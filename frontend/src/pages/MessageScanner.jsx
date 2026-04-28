import React, { useState } from 'react';
import { scanMessage } from '../api';
import ResultCard from '../components/ResultCard';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

const MessageScanner = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await scanMessage(message);
      setResult(data);
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
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
                <Loader2 className="w-8 h-8 animate-spin" />
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

          {error && (
            <div className="mt-8 p-6 bg-red-900/50 text-red-100 border border-red-800 text-center font-bold text-lg rounded-sm animate-in fade-in">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-4 pb-16">
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex justify-center w-full">
            <ResultCard 
              score={result.risk_score} 
              threatType={result.prediction} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageScanner;
