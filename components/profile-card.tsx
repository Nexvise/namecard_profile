'use client';

import React from 'react';
import { 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ExternalLink, 
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { Profile, Link as DBLink } from '@/types';
import { Button } from '@/components/ui/button';

interface ProfileCardProps {
  profile: Profile;
  links: DBLink[];
}

export default function ProfileCard({ profile, links }: ProfileCardProps) {
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

  // Map link type to Lucide icons (using custom inline SVGs for brand logos)
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'website':
      case 'portfolio':
        return <Globe className="w-5 h-5" />;
      case 'calendly':
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  // Dynamic Styles Setup
  const containerStyle = {
    fontFamily: profile.font_family ? `'${profile.font_family}', sans-serif` : 'inherit',
    background: profile.background_style || '#0f172a',
  };

  const accentButtonStyle = {
    backgroundColor: profile.accent_color || '#4f46e5',
    color: '#ffffff',
  };

  const accentTextStyle = {
    color: profile.accent_color || '#4f46e5',
  };

  const themeClasses = {
    light: 'bg-white/90 text-slate-900 border-slate-200/80 shadow-md',
    dark: 'bg-slate-900/90 text-white border-slate-800/80 shadow-2xl',
    glassmorphism: 'bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl'
  }[profile.theme_preset] || 'bg-white/10 backdrop-blur-md text-white border-white/20';

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

      {/* Profile Card Container */}
      <div className={`w-full max-w-md rounded-3xl border p-6 flex flex-col items-center ${themeClasses} transition-all duration-300`}>
        
        {/* Avatar */}
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.full_name} 
            className="w-28 h-28 rounded-full object-cover border-4 border-white/10 shadow-lg mb-4"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-slate-400 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
            {profile.full_name.charAt(0)}
          </div>
        )}

        {/* Name and Titles */}
        <h1 className="text-2xl font-bold text-center mb-1">{profile.full_name}</h1>
        {(profile.title || profile.company_name) && (
          <p className="text-sm opacity-80 text-center mb-3 font-medium">
            {profile.title} {profile.company_name && `at ${profile.company_name}`}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-center mb-6 max-w-xs leading-relaxed opacity-75">
            {profile.bio}
          </p>
        )}

        {/* Quick Contact Actions */}
        <div className="flex gap-3 mb-6 w-full justify-center">
          {profile.phone && (
            <a 
              href={`tel:${profile.phone}`} 
              aria-label="Call Contact" 
              className="flex items-center justify-center w-12 h-12 rounded-full border border-current opacity-90 hover:opacity-100 hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          {profile.email && (
            <a 
              href={`mailto:${profile.email}`} 
              aria-label="Email Contact" 
              className="flex items-center justify-center w-12 h-12 rounded-full border border-current opacity-90 hover:opacity-100 hover:scale-105 transition-all"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
          {profile.whatsapp && (
            <a 
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="WhatsApp Chat" 
              className="flex items-center justify-center w-12 h-12 rounded-full border border-current opacity-90 hover:opacity-100 hover:scale-105 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Save Contact Button */}
        <Button 
          onClick={handleSaveToContacts}
          className="w-full rounded-2xl py-6 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md mb-6"
          style={accentButtonStyle}
        >
          <UserPlus className="w-5 h-5" />
          Save to Contacts
        </Button>

        {/* Dividers */}
        {links.length > 0 && (
          <div className="w-full border-t border-current opacity-20 mb-6" />
        )}

        {/* Social / External Links */}
        <div className="w-full flex flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border text-sm font-medium transition-all hover:translate-x-1 hover:bg-current/[0.05]`}
              style={{ borderColor: profile.accent_color || 'currentColor' }}
            >
              <span style={accentTextStyle}>{getIcon(link.link_type)}</span>
              <span className="flex-1 truncate">{link.label}</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
