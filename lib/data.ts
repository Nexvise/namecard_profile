import { supabase } from './supabase';
import { Profile, Link } from '@/types';

// Mock profiles for local testing
const DEFAULT_MOCK_PROFILES: Record<string, Profile> = {
  johnsmith: {
    id: 'mock-john-id',
    user_id: 'mock-user-1',
    custom_slug: 'johnsmith',
    full_name: 'John Smith',
    title: 'Senior Product Manager',
    company_name: 'Nexvise',
    bio: 'Building template-driven digital business cards for networking. Specialized in mobile UX and SaaS platforms.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    phone: '+15551234567',
    email: 'john.smith@nexvise.com',
    whatsapp: '+15551234567',
    theme_preset: 'glassmorphism',
    accent_color: '#6366f1',
    background_style: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    font_family: 'Inter',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  aaron: {
    id: 'mock-aaron-id',
    user_id: 'mock-user-2',
    custom_slug: 'aaron',
    full_name: 'Aaron Overse',
    title: 'Lead Architect',
    company_name: 'Nexvise',
    bio: 'Designing scalable web applications. Passionate about Next.js, Tailwind, and React.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    phone: '+15559876543',
    email: 'aaron@nexvise.com',
    whatsapp: '',
    theme_preset: 'dark',
    accent_color: '#10b981',
    background_style: '#09090b',
    font_family: 'Outfit',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
};

const DEFAULT_MOCK_LINKS: Record<string, Link[]> = {
  'mock-john-id': [
    {
      id: 'mock-link-1',
      profile_id: 'mock-john-id',
      link_type: 'linkedin',
      label: 'Connect on LinkedIn',
      url: 'https://linkedin.com/in/johnsmith',
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-link-2',
      profile_id: 'mock-john-id',
      link_type: 'github',
      label: 'Follow my GitHub',
      url: 'https://github.com/johnsmith',
      display_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-link-3',
      profile_id: 'mock-john-id',
      link_type: 'website',
      label: 'Visit Nexvise Website',
      url: 'https://github.com/Nexvise/namecard_profile',
      display_order: 3,
      created_at: new Date().toISOString(),
    }
  ],
  'mock-aaron-id': [
    {
      id: 'mock-link-4',
      profile_id: 'mock-aaron-id',
      link_type: 'linkedin',
      label: 'LinkedIn Profile',
      url: 'https://linkedin.com/in/aaronoverse',
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-link-5',
      profile_id: 'mock-aaron-id',
      link_type: 'github',
      label: 'GitHub Portfolio',
      url: 'https://github.com/Nexvise/namecard_profile',
      display_order: 2,
      created_at: new Date().toISOString(),
    }
  ]
};

const isMockMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-url');
};

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const isMock = isMockMode();
  
  if (isMock) {
    if (typeof window !== 'undefined') {
      // Try to load any updated session-based user profiles first
      const sessionUser = localStorage.getItem('mock_user_session');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        const profileStr = localStorage.getItem(`mock_profile_${user.id}`);
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          if (profile.custom_slug.toLowerCase() === slug.toLowerCase()) {
            return profile;
          }
        }
      }
      // Check for any general modified profiles in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('mock_profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          if (profile.custom_slug?.toLowerCase() === slug.toLowerCase()) {
            return profile;
          }
        }
      }
    }
    return DEFAULT_MOCK_PROFILES[slug.toLowerCase()] || null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('custom_slug', slug)
      .single();
      
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const isMock = isMockMode() || userId.startsWith('mock-');

  if (isMock) {
    if (typeof window !== 'undefined') {
      const profileStr = localStorage.getItem(`mock_profile_${userId}`);
      if (profileStr) return JSON.parse(profileStr);
    }
    
    // Fallback to default mock profiles
    if (userId === 'mock-john-id' || userId === 'mock-user-1') return DEFAULT_MOCK_PROFILES.johnsmith;
    if (userId === 'mock-aaron-id' || userId === 'mock-user-2') return DEFAULT_MOCK_PROFILES.aaron;
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export async function getLinksByProfileId(profileId: string): Promise<Link[]> {
  const isMock = isMockMode() || profileId.startsWith('mock-');
  
  if (isMock) {
    if (typeof window !== 'undefined') {
      const linksStr = localStorage.getItem(`mock_links_${profileId}`);
      if (linksStr) return JSON.parse(linksStr);
    }
    return DEFAULT_MOCK_LINKS[profileId] || [];
  }

  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileId)
      .order('display_order', { ascending: true });
      
    if (error || !data) return [];
    return data as Link[];
  } catch {
    return [];
  }
}

export async function saveProfile(profile: Profile): Promise<{ success: boolean; error?: string }> {
  const isMock = isMockMode() || profile.id.startsWith('mock-');
  
  if (isMock) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mock_profile_${profile.id}`, JSON.stringify(profile));
      // If the profile user_id is different, map that too
      if (profile.user_id && profile.user_id !== profile.id) {
        localStorage.setItem(`mock_profile_${profile.user_id}`, JSON.stringify(profile));
      }
    }
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        title: profile.title,
        company_name: profile.company_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        email: profile.email,
        whatsapp: profile.whatsapp,
        theme_preset: profile.theme_preset,
        accent_color: profile.accent_color,
        background_style: profile.background_style,
        font_family: profile.font_family,
        custom_slug: profile.custom_slug,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}

export async function saveLinks(profileId: string, links: Link[]): Promise<{ success: boolean; error?: string }> {
  const isMock = isMockMode() || profileId.startsWith('mock-');
  
  if (isMock) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mock_links_${profileId}`, JSON.stringify(links));
    }
    return { success: true };
  }

  try {
    // Delete existing links
    await supabase.from('links').delete().eq('profile_id', profileId);
    
    // Insert new links
    if (links.length > 0) {
      const linksToInsert = links.map(({ id, ...link }) => ({
        ...link,
        profile_id: profileId
      }));
      const { error } = await supabase.from('links').insert(linksToInsert);
      if (error) return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update links' };
  }
}

export async function isSlugAvailable(slug: string, excludeProfileId?: string): Promise<boolean> {
  const isMock = isMockMode();
  const lowerSlug = slug.toLowerCase();

  // Validate reserved terms
  const RESERVED_SLUGS = [
    'dashboard', 'login', 'register', 'auth', 'api', 'static', 'admin', 
    'settings', 'index', 'help', 'privacy', 'terms', 'reset-password'
  ];
  if (RESERVED_SLUGS.includes(lowerSlug)) return false;

  if (isMock) {
    // Check default mock data
    for (const [k, p] of Object.entries(DEFAULT_MOCK_PROFILES)) {
      if (p.custom_slug.toLowerCase() === lowerSlug && p.id !== excludeProfileId) {
        return false;
      }
    }
    // Check localStorage items
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('mock_profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          if (profile.custom_slug?.toLowerCase() === lowerSlug && profile.id !== excludeProfileId) {
            return false;
          }
        }
      }
    }
    return true;
  }

  try {
    const query = supabase
      .from('profiles')
      .select('id')
      .eq('custom_slug', lowerSlug);
      
    if (excludeProfileId) {
      query.neq('id', excludeProfileId);
    }
    
    const { data, error } = await query.maybeSingle();
    return !data;
  } catch {
    return false;
  }
}
