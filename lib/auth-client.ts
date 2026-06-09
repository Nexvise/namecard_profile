import { supabase } from './supabase';

export interface UserSession {
  id: string;
  email: string;
}

// Check if we are running in mock mode
const isMockMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-url');
};

export async function getCurrentUser(): Promise<UserSession | null> {
  if (isMockMode()) {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('mock_user_session');
    return session ? JSON.parse(session) : null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email || '' };
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (isMockMode()) {
    // Basic mock authentication: any password works for testing
    const mockUser: UserSession = {
      id: email === 'john@nexvise.com' ? 'mock-john-id' : 'mock-aaron-id',
      email: email
    };
    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication failed' };
  }
}

export async function signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (isMockMode()) {
    const mockUser: UserSession = {
      id: 'mock-new-user-' + Math.random().toString(36).substring(2, 9),
      email: email
    };
    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    
    // Create default mock profile for the new user
    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const newProfile = {
      id: mockUser.id,
      user_id: mockUser.id,
      custom_slug: slug || 'user-' + Math.random().toString(36).substring(2, 5),
      full_name: email.split('@')[0],
      title: 'New Member',
      company_name: '',
      bio: 'Welcome to my digital name card!',
      avatar_url: '',
      phone: '',
      email: email,
      whatsapp: '',
      theme_preset: 'glassmorphism' as const,
      accent_color: '#4f46e5',
      background_style: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      font_family: 'Inter',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save to local storage for local testing
    localStorage.setItem(`mock_profile_${mockUser.id}`, JSON.stringify(newProfile));
    localStorage.setItem(`mock_links_${mockUser.id}`, JSON.stringify([]));
    
    return { success: true };
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    
    if (data?.user) {
      // In live mode, we can create the default profile row
      const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      await supabase.from('profiles').insert([
        {
          user_id: data.user.id,
          custom_slug: slug || 'user-' + Math.random().toString(36).substring(2, 5),
          full_name: email.split('@')[0],
          theme_preset: 'glassmorphism',
          accent_color: '#4f46e5',
          background_style: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          font_family: 'Inter',
          email: email
        }
      ]);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration failed' };
  }
}

export async function signOut(): Promise<void> {
  if (isMockMode()) {
    localStorage.removeItem('mock_user_session');
    return;
  }
  await supabase.auth.signOut();
}
