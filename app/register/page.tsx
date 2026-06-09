'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, getCurrentUser } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, Sparkles, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    getCurrentUser().then((user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUp(email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Failed to create an account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 relative z-10">
        <Smartphone className="w-6 h-6 text-indigo-400" />
        <span>Namecard<span className="text-indigo-400">.</span></span>
      </div>

      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white rounded-3xl p-4 shadow-xl relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-center">Create an Account</CardTitle>
          <CardDescription className="text-slate-400 text-center text-sm">
            Enter your details to create your digital business card
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 rounded-xl text-white py-5 px-4 focus-visible:ring-indigo-500 placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-slate-950 border-slate-800 rounded-xl text-white py-5 px-4 focus-visible:ring-indigo-500 placeholder:text-slate-600"
              />
            </div>

            {/* Quick Helper Info */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-400/80 w-full justify-center">
              <Sparkles className="w-3 h-3" />
              <span>We will auto-provision a profile template for your slug!</span>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 mt-2 bg-transparent border-t-0">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            
            <p className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
