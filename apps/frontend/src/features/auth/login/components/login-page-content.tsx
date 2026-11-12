'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/theme-toggle';
import { OAuthButtons } from '@/features/auth/shared/components/oauth-buttons';
import { signIn } from 'next-auth/react';

export function LoginPageContent() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  return <LoginShell callbackUrl={callbackUrl} />;
}

function LoginShell({ callbackUrl }: { callbackUrl?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!validEmail) {
      setEmailError('Enter a valid email');
      return;
    }

    setEmailError('');
    setIsSubmitting(true);
    void signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    }).then((result) => {
      if (result?.ok) {
        window.location.assign(callbackUrl ?? '/');
        return;
      }
      setIsSubmitting(false);
      setEmailError('Invalid email or password');
    });
  }

  return (
    <main
      data-auth-page
      className="full-bleed -my-6 min-h-[100svh] bg-[#f5f6f2] text-[#10231f] selection:bg-[#d8a75f]/30 dark:bg-[#10231f] dark:text-[#edf4ef]"
    >
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle className="text-[#17342e] hover:bg-[#17342e]/10 hover:text-[#17342e] dark:text-[#dfece3] dark:hover:bg-white/10 dark:hover:text-white" />
      </div>
      <div className="grid min-h-[100svh] lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden overflow-hidden bg-[#17342e] text-white lg:block">
          <Image
            src="/images/hero-section-2.png"
            alt="Hikers walking through a mountain landscape"
            fill
            priority
            className="object-cover object-[62%_center] opacity-80"
            sizes="55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10231f] via-[#10231f]/30 to-transparent" />
          <div className="relative z-10 flex min-h-[100svh] flex-col justify-between p-12 xl:p-20">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-[0.18em]"
            >
              <Mountain className="size-[1.15rem]" strokeWidth={1.8} />
              DAPYO
            </Link>
            <div className="max-w-lg">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#d8a75f]">
                Find your people outside
              </p>
              <h2 className="text-5xl font-semibold leading-[0.98] tracking-[-0.05em] xl:text-6xl">
                The next trail is better together.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-6 text-white/65">
                Join a community that keeps showing up for the places and people that make hiking
                worth it.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[100svh] items-center justify-center px-5 py-12 sm:px-10 lg:bg-[#f5f6f2] lg:px-16 dark:lg:bg-[#10231f] xl:px-24">
          <div className="w-full max-w-md animate-float-in">
            <Link
              href="/"
              className="mb-14 flex items-center gap-2.5 font-mono text-sm font-semibold tracking-[0.18em] text-[#17342e] dark:text-[#dfece3] lg:hidden"
            >
              <Mountain className="size-[1.15rem]" strokeWidth={1.8} />
              DAPYO
            </Link>
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#668077] dark:text-[#b5c9bd]">
                Welcome back
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Sign in and go further.
              </h1>
              <p className="max-w-sm text-sm leading-6 text-[#52645f] dark:text-[#b5c9bd]">
                Find your next hike, reconnect with your trail crew, and keep your momentum going.
              </p>
            </div>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#668077] dark:text-[#b5c9bd]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={siteConfig.emailPlaceholder}
                  className={`field-input border-[#cbd8d0] bg-white/70 text-[#10231f] focus:border-[#1d604c] dark:border-[#48675a] dark:bg-white/10 dark:text-[#f1f7f2] dark:focus:border-[#d8a75f] ${emailError ? 'border-[#b5483e] animate-[field-shake_0.35s_ease-in-out] dark:border-[#ed8d82]' : ''}`}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError('');
                  }}
                  aria-invalid={Boolean(emailError)}
                />
                {emailError && (
                  <p className="text-xs text-[#b5483e] dark:text-[#ed8d82]">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#668077] dark:text-[#b5c9bd]"
                  >
                    Password
                  </label>
                  <Link
                    href="/login"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1d604c] hover:text-[#d09b51] dark:text-[#d8a75f]"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="field-input border-[#cbd8d0] bg-white/70 text-[#10231f] focus:border-[#1d604c] dark:border-[#48675a] dark:bg-white/10 dark:text-[#f1f7f2] dark:focus:border-[#d8a75f]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[8px] bg-[#17342e] py-3 text-sm font-semibold text-white transition-all hover:bg-[#254f44] active:scale-[.97] disabled:cursor-wait disabled:opacity-80"
              >
                Sign in
              </button>
            </form>

            <div className="my-8">
              <AuthDivider label="Or continue with" />
            </div>
            <OAuthButtons callbackUrl={callbackUrl} />
            <p className="mt-8 text-center text-sm text-[#668077] dark:text-[#b5c9bd]">
              New here?{' '}
              <Link href="/signup" className="font-semibold text-[#1d604c] hover:text-[#d09b51]">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-[#d6e0d9]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#f5f6f2] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#668077] dark:bg-[#10231f] dark:text-[#b5c9bd]">
          {label}
        </span>
      </div>
    </div>
  );
}
