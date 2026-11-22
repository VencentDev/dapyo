'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUp, Compass, Home, Mountain, Users } from 'lucide-react';

import { DapyoLogo } from '@/components/dapyo-logo';
import { siteConfig } from '@/config/site';
import { HomeFeedAccountMenu } from '@/features/home/feed/components/home-feed-account-menu';
import { cn } from '@/lib/utils';

const links = [
  { href: '#explore', label: 'Explore', icon: Compass },
  { href: '#how-it-works', label: 'How it works', icon: Mountain },
  { href: '#community', label: 'Community', icon: Users },
];

export function ResponsiveNav({
  isAuthenticated,
  displayName,
}: {
  isAuthenticated: boolean;
  displayName?: string | null;
}) {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/home' || pathname.startsWith('/home/');
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const accountName = displayName?.trim() || 'Hiker';
  const initials =
    accountName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'H';

  useEffect(() => {
    if (isHomeRoute) return;

    const updateScrollState = (event?: Event) => {
      const eventScrollTop = event?.target instanceof HTMLElement ? event.target.scrollTop : 0;
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop,
        document.scrollingElement?.scrollTop ?? 0,
        eventScrollTop,
      );
      setScrolled(scrollTop > 24);

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
    document.addEventListener('scroll', updateScrollState, { capture: true, passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      document.removeEventListener('scroll', updateScrollState, true);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [isHomeRoute]);

  if (isHomeRoute) return null;

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
            <DapyoLogo className="size-7" />
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
                <HomeFeedAccountMenu
                  displayName={accountName}
                  initials={initials}
                  variant="header"
                />
              ) : (
                <Link
                  href="/home"
                  aria-label="Open DAPYO"
                  title="Open DAPYO"
                  className="flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20 hover:text-white active:scale-[.97]"
                >
                  <Home className="size-[1.1rem]" strokeWidth={1.8} />
                  <span>Open DAPYO</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <aside
        aria-label="Section navigation"
        className={cn(
          'section-navigation-rail fixed left-1/2 z-50 flex flex-row items-center gap-1.5 rounded-[8px] border border-white/20 bg-[#10231f]/80 p-1.5 text-white shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 lg:left-3 lg:top-1/2 lg:flex-col lg:gap-3 lg:p-2 xl:left-12',
          scrolled ? 'is-visible' : 'is-hidden',
        )}
      >
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className={cn(
              'group relative flex size-9 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:size-12',
              activeSection === href &&
                'bg-[#d8a75f] text-[#17251f] hover:bg-[#e5bb7d] hover:text-[#17251f]',
            )}
          >
            <Icon className="size-[1.1rem]" strokeWidth={1.8} />
            <span className="section-navigation-label pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </Link>
        ))}
        <span className="section-navigation-divider" aria-hidden="true" />
        {!isAuthenticated && (
          <Link
            href="/home"
            aria-label="Open DAPYO"
            title="Open DAPYO"
            className="group relative flex size-9 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:size-12"
          >
            <Home className="size-[1.1rem]" strokeWidth={1.8} />
            <span className="section-navigation-label pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
              Open DAPYO
            </span>
          </Link>
        )}
        <button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative flex size-9 items-center justify-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:size-12"
        >
          <ArrowUp className="size-[1.1rem]" strokeWidth={1.8} />
          <span className="section-navigation-label pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/15 bg-[#10231f]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 shadow-xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
            Back to top
          </span>
        </button>
      </aside>
    </>
  );
}
