import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const ResultCard = ({ score, threatType, explanation }) => {
  // Score logic (Assumption: 0-100, >66 equals high risk, >33 equals medium)
  const isHighRisk = score >= 66 || threatType?.toLowerCase().includes('phishing') || threatType?.toLowerCase().includes('scam') || threatType?.toLowerCase().includes('malicious');
  const isMediumRisk = (score >= 33 && score < 66) || threatType?.toLowerCase().includes('suspicious');

  let bgColor = 'bg-slate-800';
  let textColor = 'text-white';
  let Icon = ShieldCheck;
  let headerText = 'Scan Result';

  if (isHighRisk) {
    bgColor = 'bg-red-700'; // HIBP signature red
    Icon = ShieldAlert;
    headerText = 'Oh no — Threat Detected!';
  } else if (isMediumRisk) {
    bgColor = 'bg-yellow-600';
    Icon = AlertTriangle;
    headerText = 'Warning — Suspicious Content!';
  } else {
    bgColor = 'bg-green-700'; // HIBP signature green
    Icon = ShieldCheck;
    headerText = 'Good news — No threats found!';
  }

  return (
    <div className={`mt-8 w-full max-w-5xl rounded-sm ${bgColor} ${textColor} shadow-2xl overflow-hidden`}>
      <div className="px-8 py-12 md:py-16 flex flex-col items-center text-center">
        <Icon className="w-24 h-24 mb-6 opacity-90" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
          {headerText}
        </h2>

        <div className="w-full max-w-3xl bg-black/20 rounded-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 justify-center items-center text-xl">
          <div className="flex flex-col items-center">
            <span className="uppercase tracking-widest text-sm font-bold opacity-70 mb-2">Risk Score</span>
            <span className="text-5xl font-black">{score}<span className="text-2xl opacity-70">/100</span></span>
          </div>
          
          <div className="hidden md:block w-px h-16 bg-white/20"></div>
          
          <div className="flex flex-col items-center">
            <span className="uppercase tracking-widest text-sm font-bold opacity-70 mb-2">Threat Type</span>
            <span className="text-3xl font-bold">{threatType || 'Safe'}</span>
          </div>
        </div>

        {explanation && (
          <div className="mt-8 max-w-3xl text-left bg-black/10 p-6 rounded-sm text-lg leading-relaxed border-l-4 border-white/30">
            <span className="font-bold opacity-80 block mb-2 uppercase tracking-wide text-sm">Analysis Details</span>
            <p className="opacity-95">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
