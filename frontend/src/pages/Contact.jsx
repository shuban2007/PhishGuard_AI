import React from 'react';
import { Github, Linkedin, Mail, Crown, User } from 'lucide-react';

const TEAM = [
  {
    name: 'Shuban',
    role: 'Team Leader',
    email: 'shuban1227@gmail.com',
    github: 'https://github.com/shuban2007',
    linkedin: 'https://www.linkedin.com/in/shuban-shinde-58437838b',
    gradient: 'from-indigo-500 to-purple-600',
    glow: 'hover:shadow-indigo-500/20',
    isLeader: true,
  },
  {
    name: 'Anurag',
    role: 'Team Member',
    email: 'shrivastavanurag648@gmail.com',
    github: 'https://github.com/shrivastavanurag648',
    linkedin: 'https://www.linkedin.com/in/anurag-shrivastav-585113387',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'hover:shadow-cyan-500/20',
    isLeader: false,
  },
  {
    name: 'Harshavardhan',
    role: 'Team Member',
    email: 'harshshetty422@gmail.com',
    github: 'https://github.com/Harsh-4444',
    linkedin: 'https://www.linkedin.com/in/harshavardhanshetty422',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'hover:shadow-emerald-500/20',
    isLeader: false,
  },
];

const SocialButton = ({ href, icon: Ico, label, color }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium ${color}`}
    title={label}
  >
    <Ico className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </a>
);

const TeamCard = ({ member }) => {
  const { name, role, email, github, linkedin, gradient, glow, isLeader } = member;

  return (
    <div className={`group bg-[#0b1021]/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 shadow-xl ${glow} hover:scale-[1.02] overflow-hidden`}>
      {/* Top accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-8 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {isLeader
            ? <Crown className="w-9 h-9 text-white" />
            : <User className="w-9 h-9 text-white" />
          }
        </div>

        {/* Info */}
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <span className={`text-xs font-semibold tracking-widest uppercase mb-5 ${isLeader ? 'text-indigo-400' : 'text-slate-400'}`}>
          {role}
        </span>

        {/* Social links */}
        <div className="flex flex-wrap justify-center gap-2 w-full">
          <SocialButton href={github} icon={Github} label="GitHub" color="text-slate-300 hover:text-white" />
          <SocialButton href={linkedin} icon={Linkedin} label="LinkedIn" color="text-blue-400 hover:text-blue-300" />
          <SocialButton href={`mailto:${email}`} icon={Mail} label="Email" color="text-emerald-400 hover:text-emerald-300" />
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="flex-grow bg-transparent text-slate-200">
      <div className="py-16 px-4">

        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-block bg-[#0b1021]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
              Meet the{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Team
              </span>
            </h1>
            <p className="text-lg text-slate-300">
              The people behind PhishGuard AI building smarter security for everyone.
            </p>
          </div>
        </div>

        {/* Team Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TEAM.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#0b1021]/40 backdrop-blur-xl rounded-2xl p-8 border border-white/5">
            <p className="text-slate-400 text-[15px] leading-relaxed">
              Want to contribute or collaborate? We're always looking for passionate developers.
              Reach out to any team member or open a pull request on{' '}
              <a
                href="https://github.com/shuban2007/PhishGuard_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                GitHub
              </a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
