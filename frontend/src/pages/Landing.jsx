import React from 'react';
import { Link } from 'react-router-dom';
import {
  Link2, MessageSquare, ShieldCheck, Lock, Zap,
  BrainCircuit, Globe, ListChecks, ScanLine, FileText,
  BarChart3, ArrowRight, CheckCircle, AlertTriangle, XCircle,
  Github, Mail
} from 'lucide-react';

/* ─── Reusable Pill Badge ─────────────────────────────────────────── */
const Pill = ({ icon: Icon, color, children }) => (
  <div className={`inline-flex items-center gap-2 ${color} text-sm font-semibold px-4 py-2 rounded-full mb-6`}>
    <Icon className="w-4 h-4" />
    {children}
  </div>
);

/* ─── "How It Works" feature card ────────────────────────────────── */
const FeatureCard = ({ icon: Icon, iconGradient, step, title, description }) => (
  <div className="relative group bg-white/5 hover:bg-white/8 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 shadow-xl transition-all duration-300">
    <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${iconGradient} shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="absolute top-4 right-5 text-xs font-bold text-slate-600 bg-white/5 px-2 py-1 rounded-full border border-white/5">
      {step}
    </span>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

/* ─── Result indicator row ────────────────────────────────────────── */
const ResultRow = ({ icon: Icon, color, label, description }) => (
  <div className="flex items-start gap-3">
    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
    <div>
      <span className={`font-bold ${color}`}>{label}</span>
      <span className="text-slate-400 text-sm"> — {description}</span>
    </div>
  </div>
);

const Landing = () => {
  return (
    <div className="flex-grow bg-transparent text-white flex flex-col w-full relative z-0">

      {/* ── Static Background Glows ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[24rem] h-[24rem] bg-indigo-500/30 rounded-full blur-[90px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-3/4 right-1/4 w-[24rem] h-[24rem] bg-purple-500/30 rounded-full blur-[90px] translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex flex-col items-center bg-[#0b1021]/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 mb-10 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
              <span className="italic">PhishGuard</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-8">
              Intelligent Defense Against Digital Deception
            </p>
            <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
            <p className="text-slate-400 font-semibold tracking-wide text-base md:text-lg">
              Check if a link or message is a phishing threat
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              to="/scan-url"
              className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-xl backdrop-saturate-150 border border-indigo-500/30 text-white text-lg font-bold rounded-full transition-all shadow-xl hover:shadow-indigo-500/20"
            >
              <Link2 className="w-5 h-5 text-indigo-300" />
              Scan URL
            </Link>
            <Link
              to="/scan-message"
              className="group flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-xl backdrop-saturate-150 border border-purple-500/30 text-white text-lg font-bold rounded-full transition-all shadow-xl hover:shadow-purple-500/20"
            >
              <MessageSquare className="w-5 h-5 text-purple-300" />
              Scan Message
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm font-semibold text-slate-300/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Real-time AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span>Zero Data Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Instant Threat Detection</span>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Using PhishGuard AI is subject to the{' '}
            <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
              terms of use
            </Link>.
          </p>
        </div>
      </section>

      {/* ── How PhishGuard AI Works ──────────────────────────────── */}
      <section className="w-full py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Pill icon={BrainCircuit} color="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Under the Hood
            </Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              How <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">PhishGuard AI</span> Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              PhishGuard AI uses a powerful multi-layered approach to detect phishing threats — combining real-time databases, machine learning, and behavioral logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <FeatureCard
              icon={BrainCircuit}
              iconGradient="from-indigo-500 to-indigo-700"
              step="Layer 1"
              title="Machine Learning"
              description="Trained ML models analyze URL structures, patterns, and message text to detect phishing signatures — even on newly created malicious links."
            />
            <FeatureCard
              icon={Globe}
              iconGradient="from-purple-500 to-purple-700"
              step="Layer 2"
              title="Google Safe Browsing"
              description="Cross-references URLs against Google's real-time threat intelligence database covering billions of known malicious sites and phishing pages."
            />
            <FeatureCard
              icon={ListChecks}
              iconGradient="from-pink-500 to-rose-700"
              step="Layer 3"
              title="Rule-Based Logic"
              description="Keyword analysis and behavioral heuristics detect suspicious patterns like urgency language, lookalike domains, and deceptive phrasing."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ScanLine, title: 'URL Scanning', desc: 'Checks full URL structure, domain age, redirect chains, and suspicious path patterns.' },
              { icon: FileText, title: 'Message Analysis', desc: 'Analyzes text content for phishing language, social engineering cues, and suspicious links.' },
              { icon: BarChart3, title: 'Risk Score (0–100)', desc: 'Generates a numeric risk score: higher scores indicate a greater likelihood of phishing.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Use — Direction Card ──────────────────────────── */}
      <section className="w-full py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Steps */}
              <div>
                <Pill icon={ArrowRight} color="bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  Quick Start
                </Pill>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">How to Use</h2>

                <div className="space-y-5">
                  {[
                    { n: '01', title: 'Enter a URL or Message', desc: 'Paste a suspicious link or copy-paste a message you received.' },
                    { n: '02', title: 'Click Scan', desc: 'Hit the scan button to run multi-layer AI analysis instantly.' },
                    { n: '03', title: 'View Risk Score & Result', desc: 'See your 0–100 risk score and a clear Safe / Suspicious / Phishing verdict.' },
                    { n: '04', title: 'Follow Safety Recommendation', desc: 'Take the recommended action based on the result — stay protected.' },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-9 h-9 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-black text-xs rounded-full flex items-center justify-center">
                        {n}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{title}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result Legend */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-bold text-xl mb-4">Understanding Your Result</h3>
                  <div className="space-y-4 bg-black/20 border border-white/5 rounded-2xl p-6">
                    <ResultRow
                      icon={CheckCircle}
                      color="text-emerald-400"
                      label="Green — Safe"
                      description="The URL or message appears legitimate and poses no known threat."
                    />
                    <div className="h-px bg-white/5"></div>
                    <ResultRow
                      icon={AlertTriangle}
                      color="text-yellow-400"
                      label="Yellow — Suspicious"
                      description="Some risk indicators detected. Proceed with caution and verify independently."
                    />
                    <div className="h-px bg-white/5"></div>
                    <ResultRow
                      icon={XCircle}
                      color="text-red-400"
                      label="Red — Phishing"
                      description="Strong phishing indicators detected. Do not click or submit any information."
                    />
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 text-sm text-slate-400">
                  <p className="font-semibold text-indigo-300 mb-1">💡 Pro Tip</p>
                  Even a "Safe" result doesn't guarantee 100% safety. Always exercise caution with unexpected links or messages from unknown senders.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────────────── */}
      <section className="w-full py-24 px-4 bg-transparent flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-5xl mx-auto z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            <div className="text-center mb-10">
              <div className="inline-block bg-[#0b1021]/50 backdrop-blur-xl rounded-[2.5rem] px-8 py-6 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">Global Phishing Landscape</h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Over 3.4 billion malicious emails and countless malicious links are sent daily worldwide. Let's break down the threat vectors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-x-1/2"></div>

              <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors shadow-inner">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-indigo-600 mb-6 drop-shadow-lg tracking-tighter">68%</span>
                <h3 className="text-xl font-bold text-white mb-2">URL Phishing</h3>
                <p className="text-slate-400 text-center text-sm leading-relaxed">
                  Fraudulent links disguised as legitimate websites, aimed at tricking victims into handing over credentials.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors shadow-inner">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 mb-6 drop-shadow-lg tracking-tighter">32%</span>
                <h3 className="text-xl font-bold text-white mb-2">Message Phishing</h3>
                <p className="text-slate-400 text-center text-sm leading-relaxed">
                  SMS, direct messages, and text-based spear phishing containing deceptive language to manipulate intent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GitHub + Contact Section ─────────────────────────────── */}
      <section className="w-full py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* GitHub */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 rounded-2xl p-8 shadow-xl transition-all duration-300 flex flex-col gap-5">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg w-fit">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">View Source Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Explore the full project, ML models, and backend implementation on GitHub. Contributions and feedback are welcome.
              </p>
            </div>
            <a
              href="https://github.com/shuban2007/PhishGuard_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-semibold rounded-full transition-all w-fit text-sm"
            >
              <Github className="w-4 h-4" />
              Open on GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Contact */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 rounded-2xl p-8 shadow-xl transition-all duration-300 flex flex-col gap-5">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-lg w-fit">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Contact Us</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                For support, feedback, or collaboration opportunities, reach out and we'll get back to you as soon as possible.
              </p>
            </div>
            <a
              href="mailto:shuban1227@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white font-semibold rounded-full transition-all w-fit text-sm"
            >
              <Mail className="w-4 h-4" />
              shuban1227@gmail.com
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
