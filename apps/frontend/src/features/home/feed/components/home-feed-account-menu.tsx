'use client';

import Link from 'next/link';
import { LogOut, Settings, SunMoon, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AccountMenuVariant = 'sidebar' | 'collapsed' | 'mobile' | 'header' | 'rail';

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
};

export function HomeFeedAccountMenu({
  displayName,
  initials,
  variant,
}: {
  displayName: string;
  initials: string;
  variant: AccountMenuVariant;
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const { setTheme } = useTheme();
  const isMobile = variant === 'mobile';
  const isCollapsed = variant === 'collapsed';
  const isHeader = variant === 'header';
  const isRail = variant === 'rail';
  const avatarSize = isMobile ? 'size-6 text-[8px]' : 'size-9 text-xs';

  const triggerClassName = isMobile
    ? 'flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-lg text-[9px] font-medium text-[#7a8980] transition-colors hover:bg-[#f5f7f4] hover:text-[#1d604c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a75f] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white'
    : isHeader
      ? 'grid size-10 place-items-center rounded-full transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78]'
      : isRail
        ? 'mx-auto grid size-9 place-items-center rounded-[8px] text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] lg:size-12'
        : isCollapsed
          ? 'mx-auto grid size-11 place-items-center rounded-[8px] text-[#64756c] transition-colors hover:bg-[#edf2ed] hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:text-white dark:hover:bg-white/[0.08] dark:hover:text-white'
          : 'flex w-full min-w-0 items-center gap-3 rounded-[8px] px-2 py-2 text-left text-[#64756c] transition-colors hover:bg-[#edf2ed] hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] dark:text-white dark:hover:bg-white/[0.08] dark:hover:text-white';

  const changeTheme = (element: HTMLElement, nextIsDark: boolean) => {
    const root = document.documentElement;
    const nextTheme = nextIsDark ? 'dark' : 'light';
    const bounds = element.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.style.setProperty('--theme-toggle-x', `${x}px`);
    root.style.setProperty('--theme-toggle-y', `${y}px`);
    root.style.setProperty('--theme-toggle-radius', `${radius}px`);

    const updateTheme = () => {
      setIsDark(nextIsDark);
      setTheme(nextTheme);
      root.classList.toggle('dark', nextIsDark);
      root.classList.toggle('light', !nextIsDark);
      root.style.colorScheme = nextTheme;
    };
    const clearOrigin = () => {
      root.style.removeProperty('--theme-toggle-x');
      root.style.removeProperty('--theme-toggle-y');
      root.style.removeProperty('--theme-toggle-radius');
    };
    const transitionDocument = document as DocumentWithViewTransition;

    if (
      !transitionDocument.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      updateTheme();
      clearOrigin();
      return;
    }

    const transition = transitionDocument.startViewTransition(updateTheme);
    void transition.finished.then(clearOrigin, clearOrigin);
  };

  const themeSwitch = (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors duration-200 ${isDark ? 'bg-[#1d604c]' : 'bg-[#dce8df]'}`}
    >
      <span
        className={`size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${isDark ? 'translate-x-[14px]' : 'translate-x-0.5'}`}
      />
    </span>
  );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Open profile menu for ${displayName}`}
            title={isCollapsed || isRail ? 'Profile menu' : undefined}
            className={triggerClassName}
          >
            <span
              aria-hidden="true"
              className={`grid shrink-0 place-items-center rounded-full border-none bg-gradient-to-br from-[#d8a75f] to-[#1d604c] font-semibold text-white shadow-sm ${avatarSize}`}
            >
              {initials}
            </span>
            {variant === 'sidebar' && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#263d33] dark:text-white">
                  {displayName}
                </span>
                <span className="mt-0.5 block text-[10px] text-[#89968e] dark:text-white/55">
                  Profile & settings
                </span>
              </span>
            )}
            {isMobile && <span>Profile</span>}
            {isCollapsed && <span className="sr-only">Profile and settings</span>}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isHeader ? 'bottom' : isMobile ? 'top' : 'right'}
          align="end"
          sideOffset={8}
          style={{
            transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin, center)',
          }}
          className="w-56 rounded-[8px] border-[#17342e]/10 bg-white p-1.5 text-[#17342e] shadow-xl dark:border-white/10 dark:bg-[#17342e] dark:text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:delay-150 data-[state=open]:fill-mode-backwards data-[state=open]:duration-200 data-[state=closed]:duration-150 ease-out"
        >
          <div className="px-2 py-2.5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border-none bg-gradient-to-br from-[#d8a75f] to-[#1d604c] text-xs font-semibold text-white shadow-sm"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#263d33] dark:text-white">
                  {displayName}
                </p>
                <p className="text-xs text-[#89968e] dark:text-white/55">DAPYO hiker</p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-[#e5ebe5] dark:bg-white/10" />
          <DropdownMenuItem
            asChild
            className="gap-2.5 text-[#64756c] focus:bg-[#edf2ed] focus:text-[#17342e] dark:text-white/70 dark:focus:bg-white/[0.07] dark:focus:text-white"
          >
            <Link href="#profile">
              <UserRound className="size-4" aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            role="menuitemcheckbox"
            aria-checked={isDark}
            className="justify-between gap-2.5 text-[#64756c] focus:bg-[#edf2ed] focus:text-[#17342e] dark:text-white/70 dark:focus:bg-white/[0.07] dark:focus:text-white"
            onSelect={(event) => event.preventDefault()}
            onClick={(event) => changeTheme(event.currentTarget, !isDark)}
          >
            <SunMoon className="size-4" aria-hidden="true" />
            <span className="mr-auto">Theme</span>
            {themeSwitch}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2.5 text-[#64756c] focus:bg-[#edf2ed] focus:text-[#17342e] dark:text-white/70 dark:focus:bg-white/[0.07] dark:focus:text-white"
            onSelect={() => setIsSettingsOpen(true)}
          >
            <Settings className="size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#e5ebe5] dark:bg-white/10" />
          <DropdownMenuItem
            className="gap-2.5 text-[#a77845] focus:bg-[#edf2ed] focus:text-[#17342e] dark:text-[#e8bd78] dark:focus:bg-white/[0.07] dark:focus:text-white"
            onSelect={() => void signOut({ redirectTo: '/login' })}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-sm border-[#dce4dc] bg-[#f8faf7] text-[#233a31] ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:duration-200 data-[state=closed]:duration-150 dark:border-white/10 dark:bg-[#17342e] dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-[#17342e] dark:text-white">Settings</DialogTitle>
            <DialogDescription className="text-[#718077] dark:text-white/65">
              Choose how DAPYO looks on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-4 rounded-[8px] border border-[#e2e9e2] bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-[#263d33] dark:text-white">Appearance</p>
              <p className="mt-1 text-xs text-[#89968e] dark:text-white/55">
                Switch between light and dark mode.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              aria-checked={isDark}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a75f]"
              onClick={(event) => changeTheme(event.currentTarget, !isDark)}
            >
              {themeSwitch}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
