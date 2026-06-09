import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Smartphone, Share2, Palette, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* Decorative gradient background blooms */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Smartphone className="w-6 h-6 text-indigo-400" />
          <span>Namecard<span className="text-indigo-400">.</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-5">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Future of Networking is Here</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Your Professional Profile, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Shared in a Tap.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Create a premium, responsive digital name card. Connect it to physical NFC cards or display a dynamic QR code. No app downloads required for recipients.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-6 text-md font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20">
              Create Your Card
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/johnsmith">
            <Button size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:text-white rounded-full px-8 py-6 text-md font-semibold">
              View Live Demo
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">NFC Provisioning</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Program your dynamic card URL onto any blank NFC tag. Tap on any smartphone to transfer your contact card instantly.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-6">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">One-Click Save</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Recipients can download your details straight to their phone contacts with a single tap. Complete with phone, email, and social handles.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400 mb-6">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-3">Custom Branding</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Choose from gorgeous Light, Dark, or Glassmorphism templates. Select your brand color and custom font styles.
            </p>
          </div>
        </div>

        {/* Live Test Links Section */}
        <div className="mt-20 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/40 max-w-md w-full">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Click to inspect demo profiles:</h4>
          <div className="flex flex-col gap-2">
            <Link href="/johnsmith" className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all">
              <span className="font-semibold">/johnsmith <span className="text-slate-500 text-xs font-normal">(Glassmorphism Theme)</span></span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link href="/aaron" className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all">
              <span className="font-semibold">/aaron <span className="text-slate-500 text-xs font-normal">(Dark Theme)</span></span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
