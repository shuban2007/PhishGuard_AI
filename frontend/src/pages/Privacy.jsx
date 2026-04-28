import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Database, Share2, Globe, Activity } from 'lucide-react';

const Section = ({ icon: Icon, iconColor, title, children }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl bg-white/5 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
    </div>
    <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const Privacy = () => {
  return (
    <div className="flex-grow bg-transparent text-white py-16 px-4 relative z-10">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] bg-purple-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[20rem] h-[20rem] bg-indigo-500/20 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Lock className="w-4 h-4" />
            Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Privacy <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your privacy matters to us. Here's a transparent overview of how PhishGuard AI handles your data.
          </p>
          <p className="text-slate-500 text-sm mt-3">Last updated: April 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <Section icon={Database} iconColor="text-indigo-400" title="No Permanent Data Storage">
            <p>
              PhishGuard AI does <strong className="text-white">not permanently store</strong> any personal data. URLs and messages you submit are processed transiently and are not retained in any database after the analysis is complete.
            </p>
            <p>
              You can use the service with confidence that your inputs are not being archived or associated with your identity.
            </p>
          </Section>

          <Section icon={Activity} iconColor="text-purple-400" title="Temporary Processing">
            <p>
              Inputs (URLs or messages) are processed <strong className="text-white">temporarily in-memory</strong> solely for the purpose of phishing analysis. Once the response is returned to you, the input data is discarded.
            </p>
            <p>
              No session data, cookies tracking your inputs, or browser fingerprinting is used by this service.
            </p>
          </Section>

          <Section icon={Share2} iconColor="text-rose-400" title="No Third-Party Data Sharing">
            <p>
              PhishGuard AI does <strong className="text-white">not sell, share, or transmit</strong> your submitted data to any third-party advertisers, data brokers, or analytics platforms.
            </p>
            <p>
              Your inputs remain strictly within the processing pipeline of this service.
            </p>
          </Section>

          <Section icon={Globe} iconColor="text-yellow-400" title="External API Usage — Google Safe Browsing">
            <p>
              PhishGuard AI integrates with the <strong className="text-white">Google Safe Browsing API</strong> to cross-reference URLs against Google's known threat intelligence database.
            </p>
            <p>
              When a URL is submitted for scanning, it may be sent to Google's Safe Browsing API for verification. This is governed by{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
              >
                Google's Privacy Policy
              </a>
              . By using this tool, you acknowledge this external processing.
            </p>
          </Section>

          <Section icon={Lock} iconColor="text-green-400" title="System Logs & Performance">
            <p>
              Basic system-level logs (e.g., request timestamps, error traces) may be retained temporarily to monitor system health, detect abuse, and improve model performance.
            </p>
            <p>
              These logs do <strong className="text-white">not contain</strong> personally identifiable information (PII) and are not linked to individual users.
            </p>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-12 text-center text-sm text-slate-500">
          Also read our{' '}
          <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
            Terms &amp; Conditions
          </Link>
          {' '}| Questions? Contact{' '}
          <a href="mailto:shuban1227@gmail.com" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
            shuban1227@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
