import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Brain, Tag, ChevronRight, ChevronDown, Zap, Shield, Info } from 'lucide-react';

const INTENT_CONFIG = {
  threatening:    { label: 'Threatening',    color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  transactional:  { label: 'Transactional',  color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  promotional:    { label: 'Promotional',    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  informational:  { label: 'Informational',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

// Smart guidance messages based on risk level
const getGuidance = (score, isHighRisk, isMediumRisk) => {
  if (isHighRisk) return {
    icon: '🚨',
    text: 'This message is highly likely to be a scam. Do NOT click any links or share sensitive information.',
    bg: 'bg-red-500/10 border-red-500/20',
    textColor: 'text-red-200',
  };
  if (isMediumRisk) return {
    icon: '⚠️',
    text: 'This message shows some suspicious patterns, but may not be fully malicious. We recommend verifying this message directly with the official organization before taking any action.',
    bg: 'bg-amber-500/10 border-amber-500/20',
    textColor: 'text-amber-200',
  };
  return {
    icon: '✅',
    text: 'This message appears safe, but always remain cautious when sharing personal or financial information.',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    textColor: 'text-emerald-200',
  };
};

const ResultCard = ({ score, threatType, explanation, reasons, intent, matchedPatterns, keywordScore, scamSignals, safeSignals }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isHighRisk = score >= 71 || threatType?.toLowerCase().includes('phishing') || threatType?.toLowerCase().includes('scam') || threatType?.toLowerCase().includes('malicious');
  const isMediumRisk = (score >= 41 && score < 71) || threatType?.toLowerCase().includes('suspicious');

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
    Icon = AlertTriangle; headerText = 'Suspicious Content';
  } else {
    bgGradient = 'from-emerald-900/90 via-green-800/80 to-emerald-900/90';
    borderColor = 'border-emerald-500/30'; accentColor = 'text-emerald-400';
    glowColor = 'shadow-[0_0_60px_rgba(16,185,129,0.15)]';
    Icon = ShieldCheck; headerText = 'No Threats Found';
  }

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;
  const gaugeColor = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#10b981';
  const intentConfig = INTENT_CONFIG[intent] || null;
  const guidance = getGuidance(score, isHighRisk, isMediumRisk);

  // Flatten matched patterns
  const patternChips = [];
  if (matchedPatterns) {
    for (const [, keywords] of Object.entries(matchedPatterns)) {
      for (const kw of keywords) { if (patternChips.length < 8) patternChips.push(kw); }
    }
  }

  const kiScoreColor = keywordScore > 30 ? 'text-red-400' : keywordScore > 0 ? 'text-amber-400' : keywordScore < 0 ? 'text-emerald-400' : 'text-white/50';
  const kiScoreSign = keywordScore > 0 ? '+' : '';

  // Check if there's any detailed content to show
  const hasDetails = (reasons?.length > 0) || (scamSignals?.length > 0) || (safeSignals?.length > 0) || (patternChips.length > 0) || intentConfig || (keywordScore !== undefined && keywordScore !== null);

  return (
    <div className={`mt-8 w-full max-w-5xl rounded-2xl bg-gradient-to-br ${bgGradient} backdrop-blur-xl border ${borderColor} ${glowColor} text-white overflow-hidden`}>

      {/* ═══ MAIN CARD: Prediction + Gauge + Guidance ═══ */}
      <div className="px-8 py-10 md:py-14 flex flex-col items-center text-center">
        <Icon className={`w-16 h-16 mb-4 ${accentColor} drop-shadow-lg`} />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">{headerText}</h2>
        <p className="text-lg text-white/60 font-medium">{threatType || 'Safe'}</p>

        {/* Risk Gauge */}
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

        {/* Smart User Guidance */}
        <div className={`mt-8 max-w-xl w-full rounded-xl border px-6 py-4 ${guidance.bg}`}>
          <p className={`text-[15px] leading-relaxed font-medium ${guidance.textColor}`}>
            <span className="mr-1.5">{guidance.icon}</span>
            {guidance.text}
          </p>
        </div>
      </div>

      {/* ═══ COLLAPSIBLE DETAILED ANALYSIS ═══ */}
      {hasDetails && (
        <div className="px-8 pb-2">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white font-semibold text-sm tracking-wide"
          >
            <Search className="w-4 h-4" />
            {detailsOpen ? 'Hide Detailed Analysis' : 'View Detailed Analysis'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {hasDetails && detailsOpen && (
        <div className="px-8 pt-4 pb-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

          {/* KI Score + Intent badges */}
          <div className="flex flex-wrap justify-center gap-4">
            {keywordScore !== undefined && keywordScore !== null && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-white/40 font-bold tracking-widest uppercase">Keyword Intel</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/20 text-sm font-bold ${kiScoreColor}`}>
                  <Zap className="w-4 h-4" />{kiScoreSign}{keywordScore} pts
                </div>
              </div>
            )}
            {intentConfig && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-white/40 font-bold tracking-widest uppercase">Intent</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${intentConfig.color}`}>
                  <Brain className="w-4 h-4" />{intentConfig.label}
                </div>
              </div>
            )}
          </div>

          {/* Analysis Breakdown (Reasons) */}
          {reasons && reasons.length > 0 && (
            <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
              <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
                <Search className={`w-4 h-4 ${accentColor}`} />
                <h3 className="text-xs font-bold tracking-widest uppercase text-white/70">Analysis Breakdown</h3>
              </div>
              <ul className="divide-y divide-white/5">
                {reasons.map((reason, i) => (
                  <li key={i} className="px-6 py-2.5 flex items-start gap-3 text-white/80 text-sm">
                    <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${accentColor}`} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Signal Intelligence */}
          {((scamSignals?.length > 0) || (safeSignals?.length > 0)) && (
            <div className="bg-black/20 rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className={`w-4 h-4 ${accentColor}`} />
                <span className="text-xs font-bold tracking-widest uppercase text-white/50">Signal Intelligence</span>
              </div>
              {scamSignals?.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-red-400/70 mb-1.5 block">Scam Signals</span>
                  <div className="flex flex-wrap gap-1.5">
                    {scamSignals.slice(0, 12).map((sig, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">{sig}</span>
                    ))}
                  </div>
                </div>
              )}
              {safeSignals?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400/70 mb-1.5 block">Safe Signals</span>
                  <div className="flex flex-wrap gap-1.5">
                    {safeSignals.slice(0, 12).map((sig, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">{sig}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matched Pattern Chips */}
          {patternChips.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className={`w-4 h-4 ${accentColor}`} />
                <span className="text-xs font-bold tracking-widest uppercase text-white/50">Matched Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patternChips.map((chip, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">{chip}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy explanation (URL scanner backward compat) */}
      {explanation && !reasons?.length && (
        <div className="px-8 pb-6">
          <div className="bg-black/15 p-5 rounded-xl text-sm leading-relaxed border-l-4 border-white/20">
            <span className="font-bold opacity-70 block mb-1.5 uppercase tracking-widest text-xs">Analysis Details</span>
            <p className="opacity-90">{explanation}</p>
          </div>
        </div>
      )}

      {/* ═══ AI DISCLAIMER ═══ */}
      <div className="px-8 py-4">
        <div className="flex items-start gap-2 justify-center">
          <Info className="w-3.5 h-3.5 text-white/25 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/30 leading-relaxed text-center">
            This analysis is powered by AI and may not be 100% accurate. Always verify important messages independently.
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${gaugeColor}, transparent)` }} />
    </div>
  );
};

export default ResultCard;
