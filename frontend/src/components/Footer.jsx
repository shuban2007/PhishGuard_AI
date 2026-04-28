import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0b1021] border-t border-slate-800 py-10 text-slate-400 mt-auto w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-slate-300">
                <span className="italic text-white">PhishGuard</span>{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              AI-powered phishing detection using Machine Learning, Google Safe Browsing, and rule-based heuristics.
            </p>
          </div>

          {/* Link groups */}
          <div className="flex flex-wrap gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-slate-300 font-semibold mb-1">Tools</p>
              <Link to="/scan-url" className="hover:text-white transition-colors">Scan URL</Link>
              <Link to="/scan-message" className="hover:text-white transition-colors">Scan Message</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-300 font-semibold mb-1">Legal</p>
              <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-300 font-semibold mb-1">Connect</p>
              <a
                href="https://github.com/shrivastavanurag648/phishguard-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <a
                href="mailto:shuban1227@gmail.com"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                shuban1227@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6"></div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <span className="italic text-slate-300">PhishGuard</span>{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">AI</span>.
            {' '}Built for educational purposes. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span className="text-slate-700">·</span>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span className="text-slate-700">·</span>
            <a
              href="https://github.com/shrivastavanurag648/phishguard-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
