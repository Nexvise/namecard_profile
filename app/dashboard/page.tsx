'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth-client';
import { getProfileByUserId, getLinksByProfileId, saveProfile, saveLinks, isSlugAvailable } from '@/lib/data';
import { Profile, Link as DBLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Palette, 
  Link2, 
  Smartphone, 
  LogOut, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  QrCode, 
  Download,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<DBLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'links' | 'nfc'>('profile');
  
  // Feedback states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [copied, setCopied] = useState(false);

  // Link manager states
  const [newLinkType, setNewLinkType] = useState('linkedin');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const userProfile = await getProfileByUserId(currentUser.id);
      if (userProfile) {
        setProfile(userProfile);
        const userLinks = await getLinksByProfileId(userProfile.id);
        setLinks(userLinks);
      }
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const result = await saveProfile(profile);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || 'Failed to save profile changes.');
    }
    setSaving(false);
  };

  const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, custom_slug: value } : null);
    
    if (value.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const available = await isSlugAvailable(value, profile.id);
    setSlugStatus(available ? 'available' : 'taken');
  };

  // Link management operations
  const handleAddLink = async () => {
    if (!profile || !newLinkLabel || !newLinkUrl) return;
    
    const newLink: DBLink = {
      id: 'link-' + Math.random().toString(36).substring(2, 9),
      profile_id: profile.id,
      link_type: newLinkType,
      label: newLinkLabel,
      url: newLinkUrl,
      display_order: links.length + 1,
      created_at: new Date().toISOString()
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    
    // Auto-save links
    await saveLinks(profile.id, updatedLinks);
    
    // Reset inputs
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleDeleteLink = async (id: string) => {
    if (!profile) return;
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    await saveLinks(profile.id, updatedLinks);
  };

  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    if (!profile) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const reordered = [...links];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Recalculate display orders
    const updatedLinks = reordered.map((link, idx) => ({
      ...link,
      display_order: idx + 1
    }));

    setLinks(updatedLinks);
    await saveLinks(profile.id, updatedLinks);
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/${profile.custom_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const profileUrl = profile ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.custom_slug}` : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center font-sans">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 text-center font-sans">
        <h1 className="text-2xl font-bold mb-2">No Profile Found</h1>
        <p className="text-slate-400 mb-6 max-w-sm">We couldn't retrieve your digital namecard profile. Try logging in again.</p>
        <Button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-500">Log Out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-8">
            <Smartphone className="w-6 h-6 text-indigo-400" />
            <span>Namecard<span className="text-indigo-400">.</span></span>
          </div>

          <div className="text-xs text-slate-500 font-semibold mb-4 uppercase tracking-wider">Dashboard Menu</div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <User className="w-4 h-4" />
              Profile details
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Palette className="w-4 h-4" />
              Branding & Theme
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'links' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Link2 className="w-4 h-4" />
              Manage Links
            </button>
            <button
              onClick={() => setActiveTab('nfc')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'nfc' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Smartphone className="w-4 h-4" />
              NFC Provisioning
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3">
          <div className="px-4 text-xs text-slate-500 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl overflow-y-auto">
        {/* Banner displays */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Saved changes successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            {saveError}
          </div>
        )}

        {/* Tab 1: Profile Builder */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Personal Card Details</CardTitle>
                <CardDescription className="text-slate-400">Configure what details are printed on your dynamic landing page</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs text-slate-400 font-semibold">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      required
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl" className="text-xs text-slate-400 font-semibold">Avatar Image URL</Label>
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar_url || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, avatar_url: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs text-slate-400 font-semibold">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior Product Manager"
                      value={profile.title || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-xs text-slate-400 font-semibold">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g. Nexvise"
                      value={profile.company_name || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs text-slate-400 font-semibold">Bio / Summary</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="Brief professional summary about yourself..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    className="bg-slate-950 border-slate-800 rounded-xl text-white resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Quick Contact Actions</CardTitle>
                <CardDescription className="text-slate-400">Direct shortcuts displayed as action circle buttons at the top of the card</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-slate-400 font-semibold">Phone (Call)</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +15551234567"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-slate-400 font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      placeholder="e.g. you@domain.com"
                      value={profile.email || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-xs text-slate-400 font-semibold">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      placeholder="e.g. +15551234567"
                      value={profile.whatsapp || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-8 py-5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Profile Details'
              )}
            </Button>
          </form>
        )}

        {/* Tab 2: Branding & Customization */}
        {activeTab === 'branding' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Theme & Font Settings</CardTitle>
                <CardDescription className="text-slate-400">Manage visual layouts and card styles</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-semibold">Base Theme Preset</Label>
                    <Select
                      value={profile.theme_preset}
                      onValueChange={(value: any) => setProfile(prev => prev ? { ...prev, theme_preset: value } : null)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 rounded-xl py-5 text-white">
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-850 text-white">
                        <SelectItem value="light">Minimalist Light</SelectItem>
                        <SelectItem value="dark">Professional Dark</SelectItem>
                        <SelectItem value="glassmorphism">Premium Glassmorphism</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-semibold">Typography Font Style</Label>
                    <Select
                      value={profile.font_family}
                      onValueChange={(value) => setProfile(prev => prev ? { ...prev, font_family: value as string } : null)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 rounded-xl py-5 text-white">
                        <SelectValue placeholder="Select Font" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-850 text-white">
                        <SelectItem value="Inter">Inter (Sleek/Modern)</SelectItem>
                        <SelectItem value="Outfit">Outfit (Clean/Tech)</SelectItem>
                        <SelectItem value="Space Grotesk">Space Grotesk (Creative/Bold)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Classy/Elegant)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Standard/Reliable)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-xs text-slate-400 font-semibold">Primary Accent Color</Label>
                    <div className="flex gap-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={profile.accent_color || '#4f46e5'}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, accent_color: e.target.value } : null)}
                        className="w-12 h-12 p-1 bg-slate-950 border-slate-800 rounded-xl"
                      />
                      <Input
                        type="text"
                        value={profile.accent_color || '#4f46e5'}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, accent_color: e.target.value } : null)}
                        className="bg-slate-950 border-slate-800 rounded-xl py-5 flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundStyle" className="text-xs text-slate-400 font-semibold">Background CSS Color or Gradient</Label>
                    <Input
                      id="backgroundStyle"
                      placeholder="e.g. #09090b or linear-gradient(...)"
                      value={profile.background_style || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, background_style: e.target.value } : null)}
                      className="bg-slate-950 border-slate-800 rounded-xl py-5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Custom URL Link Slug</CardTitle>
                <CardDescription className="text-slate-400">Claim your dynamic address path (e.g. domain.com/yourname)</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs text-slate-400 font-semibold">Claim Slug Address</Label>
                  <div className="flex rounded-xl bg-slate-950 border border-slate-800 overflow-hidden items-center px-4">
                    <span className="text-slate-500 text-sm mr-1 select-none">domain.com/</span>
                    <input
                      id="slug"
                      value={profile.custom_slug || ''}
                      onChange={handleSlugChange}
                      required
                      className="bg-transparent border-none text-white py-3 outline-none flex-1 text-sm font-semibold"
                    />
                  </div>
                  <div className="text-xs mt-1">
                    {slugStatus === 'checking' && <span className="text-slate-400">Validating availability...</span>}
                    {slugStatus === 'available' && <span className="text-emerald-400 font-semibold">✓ Slug is available!</span>}
                    {slugStatus === 'taken' && <span className="text-red-400 font-semibold">✗ Slug is already taken or reserved.</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saving || slugStatus === 'taken'}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-8 py-5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Branding Styles'
              )}
            </Button>
          </form>
        )}

        {/* Tab 3: Social Links Manager */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            
            {/* Add New Link Card */}
            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Add Custom URL / Social Link</CardTitle>
                <CardDescription className="text-slate-400">Add buttons pointing to your GitHub, LinkedIn, Calendly, etc.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-semibold">Link Type</Label>
                    <Select
                      value={newLinkType}
                      onValueChange={(val) => setNewLinkType(val || 'linkedin')}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 rounded-xl py-5 text-white">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-850 text-white">
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="twitter">Twitter / X</SelectItem>
                        <SelectItem value="website">Personal Website</SelectItem>
                        <SelectItem value="calendly">Calendly / Calendar</SelectItem>
                        <SelectItem value="custom">Custom / Other Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkLabel" className="text-xs text-slate-400 font-semibold">Display Text / Label</Label>
                    <Input
                      id="linkLabel"
                      placeholder="e.g. Visit My Portfolio"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl" className="text-xs text-slate-400 font-semibold">Target URL Link</Label>
                    <Input
                      id="linkUrl"
                      placeholder="https://example.com"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 rounded-xl text-white py-5"
                    />
                  </div>
                </div>
              </CardContent>
              <CardContent className="px-0 pt-2 flex justify-end">
                <Button 
                  onClick={handleAddLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-6 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Link
                </Button>
              </CardContent>
            </Card>

            {/* List Existing Links */}
            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Your Links List</CardTitle>
                <CardDescription className="text-slate-400">Reorder or delete your added buttons below</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {links.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No custom links added yet. Use the form above to add one!
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {links.map((link, index) => (
                      <div 
                        key={link.id}
                        className="flex items-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all"
                      >
                        <div className="flex flex-col gap-1 select-none">
                          <button
                            onClick={() => handleMoveLink(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveLink(index, 'down')}
                            disabled={index === links.length - 1}
                            className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold flex items-center gap-1.5">
                            <span className="text-indigo-400 capitalize text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{link.link_type}</span>
                            <span className="truncate">{link.label}</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">{link.url}</div>
                        </div>

                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* Tab 4: NFC Provisioning */}
        {activeTab === 'nfc' && (
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold">Your Digital Namecard Link</CardTitle>
                <CardDescription className="text-slate-400">Share this URL directly, or program it onto a physical card</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-sm break-all text-indigo-400 flex items-center justify-between">
                    <span>{profileUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCopyLink}
                      className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 h-full py-4 text-sm font-semibold flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-slate-800 text-slate-300 hover:text-white rounded-xl px-4 h-full py-4 flex items-center gap-1.5">
                        Test Page
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center pt-4 border-t border-slate-800">
                  <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl w-60 h-60 justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Digital profile QR code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      Downloadable Sharing QR
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Download this QR code to print on brochures, slide decks, or show on your smartwatch face for quick, frictionless offline scanning.
                    </p>
                    <a href={qrCodeUrl} download="my-namecard-qr.png" target="_blank" rel="noopener noreferrer">
                      <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 font-semibold">
                        <Download className="w-4 h-4" />
                        Download QR PNG
                      </Button>
                    </a>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  How to Program physical NFC cards
                </CardTitle>
                <CardDescription className="text-slate-400">Burn your digital profile URL to any standard NFC smart tag in seconds</CardDescription>
              </CardHeader>
              <CardContent className="px-0 text-sm space-y-4 leading-relaxed text-slate-300">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    Buy blank **NTAG213** or **NTAG215** tags/cards (available very cheaply on Amazon or eBay).
                  </li>
                  <li>
                    Download a free app like **NFC Tools** on your smartphone ([iOS App Store](https://apps.apple.com/us/app/nfc-tools/id1252962749) or [Google Play Store](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)).
                  </li>
                  <li>
                    Open the app, select **Write**, click **Add a record**, and choose **URL / URI**.
                  </li>
                  <li>
                    Paste your personal address slug: <br />
                    <code className="text-indigo-400 bg-slate-950 px-2 py-0.5 rounded text-xs select-all">{profileUrl}</code>
                  </li>
                  <li>
                    Click **Write** in the app and tap your smartphone against your blank physical NFC card.
                  </li>
                  <li>
                    **Test it!** Lock your screen, tap the physical card on the back of any NFC-capable phone, and watch it load your profile instantly!
                  </li>
                </ol>
              </CardContent>
            </Card>

          </div>
        )}

      </main>
    </div>
  );
}
