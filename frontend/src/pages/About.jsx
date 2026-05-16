import React from 'react';
import { Users, Rocket, Heart, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="flex-grow bg-transparent text-slate-200">
      <div className="py-16 px-4">

        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block bg-[#0b1021]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
              About{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                SlixCrew
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A team focused on creating useful products that make a real difference.
              We always welcome new members as our goal is to turn this small team into a huge community.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Rocket,
              title: 'Our Mission',
              desc: 'Build intelligent, open-source tools that protect people from online threats accessible to everyone.',
              gradient: 'from-indigo-500 to-blue-600',
              glow: 'shadow-indigo-500/10',
            },
            {
              icon: Heart,
              title: 'Our Values',
              desc: 'Transparency, collaboration, and user safety are at the heart of everything we build.',
              gradient: 'from-rose-500 to-pink-600',
              glow: 'shadow-rose-500/10',
            },
            {
              icon: Star,
              title: 'Our Vision',
              desc: 'Grow from a small crew into a thriving open-source community making the internet safer for all.',
              gradient: 'from-amber-500 to-orange-600',
              glow: 'shadow-amber-500/10',
            },
          ].map(({ icon: Ico, title, desc, gradient, glow }) => (
            <div
              key={title}
              className={`group bg-[#0b1021]/50 backdrop-blur-xl rounded-2xl p-8 border border-white/5 hover:border-white/15 transition-all duration-300 shadow-xl ${glow} hover:scale-[1.02]`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Ico className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">{desc}</p>
            </div>
          ))}
        </div>

        {/* Project Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-indigo-900/40 backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">🛡️</span>
              About PhishGuard AI
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              PhishGuard AI is an intelligent phishing detection system that combines Machine Learning,
              Google Safe Browsing API, keyword intelligence, and rule-based heuristics to protect
              users from malicious URLs and scam messages.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              Built with Python (FastAPI), React, and scikit-learn designed to be fast, accurate,
              and completely open source.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
