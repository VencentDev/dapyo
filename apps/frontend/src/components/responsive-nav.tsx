'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUp, Compass, LogIn, Menu, Mountain, Users, X } from 'lucide-react';

import { SignOutButton } from '@/components/sign-out-button';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const links = [
  { href: '#explore', label: 'Explore', icon: Compass },
  { href: '#how-it-works', label: 'How it works', icon: Mountain },
  { href: '#community', label: 'Community', icon: Users },
];

export function ResponsiveNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const updateScrollState = () => {
      setScrolled(window.scrollY > 96);

      const marker = window.innerHeight * 0.45;
      let currentSection = '';

      links.forEach(({ href }) => {
        const section = document.querySelector<HTMLElement>(href);
        if (!section) return;

        const bounds = section.getBoundingClientRect();
        if (bounds.top <= marker && bounds.bottom >= marker) {
          currentSection = href;
        }
      });

      setActiveSection(currentSection);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          'absolute inset-x-0 top-0 z-50 text-white transition-all duration-300 lg:fixed',
          scrolled && 'lg:-translate-y-6 lg:opacity-0',
        )}
      >
        <div className="flex h-[4.5rem] w-full items-center gap-4 px-5 sm:px-7 lg:px-20 xl:px-[12.5rem]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 font-mono text-sm font-semibold tracking-[0.18em]"
          >
            <Mountain className="size-[1.15rem]" strokeWidth={1.8} aria-hidden="true" />
            {siteConfig.navName}
          </Link>
          <span className="hidden text-white/35 md:inline" aria-hidden="true">
            |
          </span>
          <nav className="flex min-w-0 flex-1 items-center gap-5">
            <div className="hidden items-center gap-6 text-sm text-white/75 md:flex">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {isAuthenticated ? (
                <SignOutButton />
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  title="Sign in"
                  className="flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20 hover:text-white active:scale-[.97]"
                >
                  <LogIn className="size-[1.1rem]" strokeWidth={1.8} />
                  <span>Sign in</span>
                </Link>
              )}
              <button
                type="button"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex size-9 items-center justify-center rounded-[8px] border border-white/25 text-white transition-colors hover:bg-white/10 md:hidden"
              >
                {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </div>
        {mobileOpen && (
          <nav className="mx-5 rounded-[8px] border border-white/15 bg-[#10231f]/75 p-2 text-white shadow-2xl backdrop-blur-xl md:hidden">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <aside
        aria-label="Section navigation"
        className={cn(
          'fixed left-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 rounded-[8px] border border-white/20 bg-[#10231f]/55 p-2 text-white shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 xl:left-12 lg:flex',
          scrolled ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0',
        )}
      >
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className={cn(
              'group relative flex size-12 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white',
              activeSection === href &&
                'bg-[#d8a75f] text-[#17251f] hover:bg-[#e5bb7d] hover:text-[#17251f]',
            )}
          >
            <Icon className="size-[1.1rem]" strokeWidth={1.8} />
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </Link>
        ))}
        <span className="mx-2 h-px bg-white/15" aria-hidden="true" />
        {!isAuthenticated && (
          <Link
            href="/login"
            aria-label="Sign in"
            title="Sign in"
            className="group relative flex size-12 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogIn className="size-[1.1rem]" strokeWidth={1.8} />
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
              Sign in
            </span>
          </Link>
        )}
        <button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative flex size-12 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowUp className="size-[1.1rem]" strokeWidth={1.8} />
          <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
            Back to top
          </span>
        </button>
      </aside>
    </>
  );
}
