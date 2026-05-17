import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Globe, Link2, Search, Info } from 'lucide-react';

const getUrlGuidance = (score, isHighRisk, isMediumRisk, source) => {
  if (source?.includes('trusted')) return {
    icon: '✅', text: 'This is a verified trusted domain — in our curated database of known legitimate sites.',
    bg: 'bg-emerald-500/10 border-emerald-500/20', textColor: 'text-emerald-200',
  };
  if (isHighRisk) return {
    icon: '🚨', text: 'This website is highly likely to be a phishing page. Do NOT enter any credentials or personal information.',
    bg: 'bg-red-500/10 border-red-500/20', textColor: 'text-red-200',
  };
  if (isMediumRisk) return {
    icon: '⚠️', text: 'This website shows suspicious characteristics. Verify the domain independently before entering any data.',
    bg: 'bg-amber-500/10 border-amber-500/20', textColor: 'text-amber-200',
  };
  return {
    icon: '✅', text: 'This website appears safe based on domain analysis and threat intelligence.',
    bg: 'bg-emerald-500/10 border-emerald-500/20', textColor: 'text-emerald-200',
  };
};

const UrlResultCard = ({ score, threatType, explanation, source }) => {
  const isHighRisk = score >= 71 || ['phishing','malicious'].some(t => threatType?.toLowerCase().includes(t));
  const isMediumRisk = (score >= 41 && score < 71) || threatType?.toLowerCase().includes('suspicious');
  const isTrusted = source?.includes('trusted');

  let bgGradient, borderColor, Icon, headerText, accentColor, glowColor;
  if (isHighRisk) {
    bgGradient = 'from-red-900/90 via-red-800/80 to-red-900/90';
    borderColor = 'border-red-500/30'; accentColor = 'text-red-400';
    glowColor = 'shadow-[0_0_60px_rgba(239,68,68,0.15)]';
    Icon = ShieldAlert; headerText = 'Threat Detected';
  } else if (isMediumRisk) {
    bgGradient = 'from-amber-900/90 via-yellow-800/80 to-amber-900/90';
    borderColor = 'border-amber-500/30'; accentColor = 'text-amber-400';
    glowColor = 'shadow-[0_0_60px_rgba(245,158,11,0.15)]';
    Icon = AlertTriangle; headerText = 'Suspicious Website';
  } else {
    bgGradient = 'from-emerald-900/90 via-green-800/80 to-emerald-900/90';
    borderColor = 'border-emerald-500/30'; accentColor = 'text-emerald-400';
    glowColor = 'shadow-[0_0_60px_rgba(16,185,129,0.15)]';
    Icon = ShieldCheck; headerText = 'Website is Safe';
  }

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;
  const gaugeColor = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981';
  const guidance = getUrlGuidance(score, isHighRisk, isMediumRisk, source);

  return (
    <div className={`mt-8 w-full max-w-5xl rounded-2xl bg-gradient-to-br ${bgGradient} backdrop-blur-xl border ${borderColor} ${glowColor} text-white overflow-hidden`}>
      {/* Context label */}
      <div className="px-8 pt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold tracking-widest uppercase">
          <Globe className="w-3.5 h-3.5" />
          Website Analysis Result
        </div>
      </div>

      {/* Main card */}
      <div className="px-8 py-10 md:py-12 flex flex-col items-center text-center">
        <Icon className={`w-16 h-16 mb-4 ${accentColor} drop-shadow-lg`} />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">{headerText}</h2>
        <p className="text-lg text-white/60 font-medium">{threatType || 'SAFE'}</p>

        {isTrusted && score === 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-sm shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Verified Trusted Domain
          </div>
        )}

        {/* Gauge */}
        <div className="mt-8">
          <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={gaugeColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: gaugeColor }}>{score}</span>
              <span className="text-xs text-white/50 font-bold tracking-widest uppercase">/ 100</span>
            </div>
          </div>
        </div>

        {/* Guidance */}
        <div className={`mt-8 max-w-xl w-full rounded-xl border px-6 py-4 ${guidance.bg}`}>
          <p className={`text-[15px] leading-relaxed font-medium ${guidance.textColor}`}>
            <span className="mr-1.5">{guidance.icon}</span>{guidance.text}
          </p>
        </div>
      </div>

      {/* Analysis details */}
      {explanation && (
        <div className="px-8 pb-6">
          <div className="bg-black/15 p-5 rounded-xl text-sm leading-relaxed border-l-4 border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Search className={`w-4 h-4 ${accentColor}`} />
              <span className="font-bold opacity-70 uppercase tracking-widest text-xs">Analysis Details</span>
            </div>
            <p className="opacity-90">{explanation}</p>
            {source && (
              <div className="mt-3 flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40 font-medium">
                  Detection: {source.split('+').map(s => s.replace(/-/g, ' ')).join(' → ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-8 py-4">
        <div className="flex items-start gap-2 justify-center">
          <Info className="w-3.5 h-3.5 text-white/25 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/30 leading-relaxed text-center">
            Analysis powered by AI and may not be 100% accurate. Always verify URLs independently.
          </p>
        </div>
      </div>
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${gaugeColor}, transparent)` }} />
    </div>
  );
};

export default UrlResultCard;
