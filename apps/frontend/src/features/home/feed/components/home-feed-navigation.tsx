'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Compass, Home, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { DapyoLogo } from '@/components/dapyo-logo';
import { HomeFeedAccountMenu } from '@/features/home/feed/components/home-feed-account-menu';

const homeLinks = [
  { label: 'Home', href: '#feed', icon: Home },
  { label: 'Discover', href: '#discover', icon: Compass },
  { label: 'My hikes', href: '#my-hikes', icon: CalendarDays },
  { label: 'Community', href: '#community', icon: Users },
];

export function HomeFeedNavigation({
  displayName,
  initials,
  children,
}: {
  displayName: string;
  initials: string;
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeHref, setActiveHref] = useState('#feed');

  useEffect(() => {
    const syncActiveLink = () => setActiveHref(window.location.hash || '#feed');
    syncActiveLink();
    window.addEventListener('hashchange', syncActiveLink);
    return () => window.removeEventListener('hashchange', syncActiveLink);
  }, []);

  return (
    <>
      <aside
        className="fixed bottom-4 left-5 top-4 z-40 hidden lg:block"
        aria-label="DAPYO sidebar"
      >
        <div
          id="dapyo-sidebar-panel"
          className={`flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-[#17342e]/10 bg-white p-3 text-[#17342e] shadow-[0_20px_60px_rgba(16,35,31,.14)] ring-1 ring-[#17342e]/[0.04] transition-[width] duration-200 dark:border-white/[0.08] dark:bg-[#17342e] dark:text-white dark:ring-black/[0.04] ${isCollapsed ? 'w-[4.5rem]' : 'w-60'}`}
        >
          <div
            className={`relative flex shrink-0 items-center ${isCollapsed ? 'min-h-[3.25rem] justify-center' : 'min-h-10 justify-between gap-2 px-1'}`}
          >
            <Link
              href="/home"
              aria-label="DAPYO home"
              className={`flex min-w-0 items-center rounded-lg text-[#17342e] transition-colors hover:text-[#a77845] dark:text-white dark:hover:text-[#e8bd78] ${isCollapsed ? 'flex-col justify-center gap-1' : 'gap-2.5'}`}
            >
              <DapyoLogo className="size-8" />
              {isCollapsed ? (
                <span className="text-center font-mono text-[8px] font-semibold uppercase leading-3 tracking-[0.04em]">
                  DAPYO
                </span>
              ) : (
                <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.15em]">
                  DAPYO
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                type="button"
                aria-label="Collapse sidebar"
                aria-controls="dapyo-sidebar-panel"
                aria-expanded="true"
                onClick={() => setIsCollapsed(true)}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-[#718077] transition-colors hover:bg-[#edf2ed] hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <nav
            aria-label="DAPYO"
            className="mt-8 flex min-h-0 flex-1 flex-col justify-center gap-1.5 overflow-y-auto"
          >
            {homeLinks.map(({ label, href, icon: Icon }) => {
              const isActive = activeHref === href;
              return (
                <Link
                  key={label}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  onClick={() => setActiveHref(href)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`flex h-11 shrink-0 items-center rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-[#e8eee9] text-[#17342e] shadow-[inset_0_0_0_1px_rgba(23,52,46,.05)] dark:bg-white/[0.12] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]' : 'text-[#64756c] hover:bg-[#f1f4f0] hover:text-[#17342e] dark:text-white/65 dark:hover:bg-white/[0.07] dark:hover:text-white'}`}
                >
                  <Icon className="size-[1.05rem] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  <span className={isCollapsed ? 'sr-only' : undefined}>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 h-56 shrink-0 border-t border-[#e5ebe5] pt-4 dark:border-white/10">
            {isCollapsed ? (
              <div className="flex h-full items-end justify-center pb-1">
                <Link
                  href="#discover"
                  title="Explore trails"
                  aria-label="Explore trails"
                  onClick={() => setActiveHref('#discover')}
                  className="grid size-8 translate-y-1.5 place-items-center rounded-lg text-[#a77845] transition-colors hover:bg-[#edf2ed] hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:text-[#e8bd78] dark:hover:bg-white/[0.08] dark:hover:text-white"
                >
                  <Compass className="size-[1.1rem]" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="flex h-full flex-col rounded-[8px] bg-[#f2f5f1] p-3.5 dark:bg-white/[0.06]">
                <div>
                  <DapyoLogo className="mb-3 size-8" />
                  <p className="text-sm font-semibold">Good things happen outside.</p>
                  <p className="mt-1.5 text-xs leading-5 text-[#64756c] dark:text-white/65">
                    Find a trail that fits your pace and meet the people heading there.
                  </p>
                </div>
                <Link
                  href="#discover"
                  onClick={() => setActiveHref('#discover')}
                  className="mt-auto inline-flex translate-y-1.5 items-center gap-1.5 text-xs font-semibold text-[#a77845] transition-colors hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:text-[#e8bd78] dark:hover:text-white"
                >
                  Explore trails <Compass className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-3 shrink-0 border-t border-[#e5ebe5] pt-3 dark:border-white/10">
            <HomeFeedAccountMenu
              displayName={displayName}
              initials={initials}
              variant={isCollapsed ? 'collapsed' : 'sidebar'}
            />
          </div>
        </div>
        {isCollapsed && (
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-controls="dapyo-sidebar-panel"
            aria-expanded="false"
            onClick={() => setIsCollapsed(false)}
            className="absolute right-2 top-3 grid size-8 translate-x-full place-items-center rounded-lg border border-[#17342e]/10 bg-white text-[#718077] shadow-lg transition-colors hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:border-white/[0.08] dark:bg-[#17342e] dark:text-white/60 dark:hover:text-white"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </aside>

      <div className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 pb-10 pt-7 sm:px-7 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-7 lg:px-10 xl:grid-cols-[210px_minmax(0,1fr)_285px]">
        <div className="hidden lg:block" aria-hidden="true" />
        {children}
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#dfe6df] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(16,35,31,.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#17342e]/95 lg:hidden"
      >
        {homeLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setActiveHref(href)}
            aria-current={activeHref === href ? 'location' : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[9px] font-medium ${activeHref === href ? 'text-[#1d604c] dark:text-[#e8bd78]' : 'text-[#7a8980] dark:text-white/60'}`}
          >
            <Icon
              className="size-[1.1rem]"
              strokeWidth={activeHref === href ? 2.2 : 1.8}
              aria-hidden="true"
            />
            {label}
          </Link>
        ))}
        <HomeFeedAccountMenu displayName={displayName} initials={initials} variant="mobile" />
      </nav>
    </>
  );
}
