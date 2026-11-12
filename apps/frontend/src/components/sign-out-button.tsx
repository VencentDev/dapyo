'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      aria-label="Sign out"
      title="Sign out"
      className="flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/20 hover:text-white active:scale-[.97]"
      onClick={() => void signOut({ redirectTo: '/login' })}
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span>Sign out</span>
    </button>
  );
}
