'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ExternalLink, 
  UserPlus,
  MessageSquare,
  QrCode,
  Heart
} from 'lucide-react';
import { Profile, Link as DBLink } from '@/types';
import { Button } from '@/components/ui/button';

interface ProfileCardProps {
  profile: Profile;
  links: DBLink[];
}

export default function ProfileCard({ profile, links }: ProfileCardProps) {
  const [showQR, setShowQR] = useState(false);

  // Client-side vCard Generation & Download
  const handleSaveToContacts = () => {
    const cleanPhone = profile.phone?.replace(/\s+/g, '') || '';
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.full_name}`,
      `ORG:${profile.company_name || ''}`,
      `TITLE:${profile.title || ''}`,
      `TEL;TYPE=CELL:${cleanPhone}`,
      `EMAIL;TYPE=INTERNET:${profile.email || ''}`,
      `URL:${window.location.origin}/${profile.custom_slug}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.setAttribute('download', `${profile.full_name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  // Map link type to custom SVG or Lucide icons
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.61-4.041-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'website':
      case 'portfolio':
        return <Globe className="w-5 h-5 text-white" />;
      case 'calendly':
      case 'calendar':
        return <Calendar className="w-5 h-5 text-white" />;
      default:
        return <ExternalLink className="w-5 h-5 text-white" />;
    }
  };

  // Map link type to brand colors
  const getIconBackground = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-600';
      case 'github':
        return 'bg-slate-700';
      case 'twitter':
      case 'x':
        return 'bg-sky-500';
      case 'website':
      case 'portfolio':
        return 'bg-blue-400';
      case 'calendly':
      case 'calendar':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-700';
    }
  };

  // Dynamic Styles Setup
  const containerStyle = {
    fontFamily: profile.font_family ? `'${profile.font_family}', sans-serif` : 'inherit',
    background: profile.background_style || 'radial-gradient(circle at top right, #1e1b4b, #020617)',
  };

  const accentColor = profile.accent_color || '#3b82f6';

  const buttonGradientStyle = {
    background: `linear-gradient(90deg, ${accentColor} 0%, #4f46e5 100%)`,
    boxShadow: `0 10px 15px -3px ${accentColor}4D`,
  };

  const profileGlowStyle = {
    boxShadow: `0 0 25px 2px ${accentColor}99`,
    borderColor: accentColor,
  };

  // Theme-specific styles overrides
  const themeClasses = {
    light: 'bg-white/80 text-slate-900 border-slate-200/80 shadow-md backdrop-blur-lg',
    dark: 'bg-slate-950/20 text-white border-white/10 shadow-2xl backdrop-blur-lg',
    glassmorphism: 'bg-slate-900/20 text-white border-white/15 shadow-xl backdrop-blur-lg'
  }[profile.theme_preset] || 'bg-slate-900/20 text-white border-white/15';

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500"
      style={containerStyle}
    >
      {/* Dynamic Font Loader */}
      {profile.font_family && (
        <link 
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(profile.font_family)}:wght@300;400;500;600;700&display=swap`} 
          rel="stylesheet" 
        />
      )}

      {/* Main Card Container */}
      <main 
        className={`relative w-full max-w-md rounded-[3rem] p-8 overflow-hidden flex flex-col items-center main-card-border ${themeClasses}`} 
        data-purpose="digital-business-card"
        id="main-card"
      >
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center mb-8" data-purpose="profile-header">
          
          {/* Profile Image with Glowing ring */}
          <div className="relative w-40 h-40 mb-6">
            <div 
              className="absolute inset-0 rounded-full border-2 transition-all duration-300"
              style={profileGlowStyle}
            />
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.full_name} Profile`} 
                className="w-full h-full rounded-full object-cover relative z-10"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-5xl font-bold text-white relative z-10">
                {profile.full_name.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-2">{profile.full_name}</h1>
          
          {(profile.title || profile.company_name) && (
            <p className="text-lg text-slate-300 font-medium mb-4">
              {profile.title} {profile.company_name && (
                <>at <span style={{ color: accentColor }}>{profile.company_name}</span></>
              )}
            </p>
          )}

          {profile.bio && (
            <p className="text-sm text-slate-400 leading-relaxed px-4 max-w-xs">
              {profile.bio}
            </p>
          )}
        </section>

        {/* Quick Action Buttons */}
        <section className="flex justify-center space-x-8 mb-8" data-purpose="quick-actions">
          {profile.phone && (
            <div className="flex flex-col items-center">
              <a 
                href={`tel:${profile.phone}`}
                className="w-14 h-14 rounded-full glass-card flex items-center justify-center mb-2 hover:bg-slate-800 transition-colors"
              >
                <Phone className="h-6 w-6" style={{ color: accentColor }} />
              </a>
              <span className="text-xs text-slate-400">Call</span>
            </div>
          )}

          {profile.email && (
            <div className="flex flex-col items-center">
              <a 
                href={`mailto:${profile.email}`}
                className="w-14 h-14 rounded-full glass-card flex items-center justify-center mb-2 hover:bg-slate-800 transition-colors"
              >
                <Mail className="h-6 w-6 text-purple-400" />
              </a>
              <span className="text-xs text-slate-400">Email</span>
            </div>
          )}

          {profile.whatsapp && (
            <div className="flex flex-col items-center">
              <a 
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full glass-card flex items-center justify-center mb-2 hover:bg-slate-800 transition-colors"
              >
                <MessageSquare className="h-6 w-6 text-green-400" />
              </a>
              <span className="text-xs text-slate-400">WhatsApp</span>
            </div>
          )}
        </section>

        {/* Save to Contacts Button */}
        <section className="w-full mb-6" data-purpose="primary-action">
          <button 
            onClick={handleSaveToContacts}
            style={buttonGradientStyle}
            className="w-full py-4 rounded-2xl flex items-center justify-center space-x-3 text-lg font-semibold hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <UserPlus className="h-6 w-6 text-white" />
            <span className="text-white">Save to Contacts</span>
          </button>
        </section>

        {/* Links List */}
        <section className="w-full space-y-3 mb-8" data-purpose="links-list">
          {links.map((link) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 glass-card rounded-2xl bg-white/5 flex items-center hover:bg-white/10 transition-colors"
            >
              <div className={`p-2 rounded-lg mr-4 text-white ${getIconBackground(link.link_type)}`}>
                {getIcon(link.link_type)}
              </div>
              <span className="flex-grow font-medium text-slate-200">{link.label}</span>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </a>
          ))}
        </section>

        {/* Footer Actions */}
        <footer className="w-full flex flex-col items-center" data-purpose="card-footer">
          <button 
            onClick={() => setShowQR(true)}
            className="w-full p-4 glass-card rounded-2xl flex items-center justify-between mb-8 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center">
              <div className="mr-4">
                <QrCode className="w-6 h-6 text-slate-300" />
              </div>
              <span className="font-medium text-slate-200">Show QR Code</span>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400" />
          </button>

          <div className="text-slate-500 text-xs flex items-center space-x-1">
            <span>Powered by</span>
            <a href="https://nexvisesolution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:underline">Nexvise</a>
            <Heart className="w-3 h-3 text-red-400 fill-current ml-1" />
          </div>
        </footer>

      </main>

      {/* Dynamic QR Code Modal Overlay */}
      {showQR && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full flex flex-col items-center text-center relative glass-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Scan QR Code</h2>
            <p className="text-sm text-slate-400 mb-6">Scan to view my digital business card on your phone</p>
            
            <div className="bg-white p-4 rounded-3xl shadow-lg mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.href : ''
                )}`} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <Button 
              onClick={() => setShowQR(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-5 font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
