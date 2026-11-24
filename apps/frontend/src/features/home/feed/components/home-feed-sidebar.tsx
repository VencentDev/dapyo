import Link from 'next/link';
import { CalendarDays, ChevronRight, Compass, MapPin } from 'lucide-react';

import { popularTrails } from '@/features/hikes/create/lib/mountain-suggestions';

export function HomeFeedSidebar({
  displayName,
  initials,
}: {
  displayName: string;
  initials: string;
}) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <section
        id="discover"
        className="dapyo-card-elevation scroll-mt-24 rounded-[8px] bg-white p-4 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#9a7548] dark:text-[#e8bd78]">
              Find your next route
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#263d33] dark:text-white">
              Popular trails
            </h2>
          </div>
          <Compass className="size-5 text-[#b17e43]" aria-hidden="true" />
        </div>
        <div className="mt-3 divide-y divide-[#edf0ec] dark:divide-white/10">
          {popularTrails.map((trail, index) => (
            <div key={trail.name} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
              <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[#edf2ed] font-mono text-[10px] text-[#4c6a58] dark:bg-white/[0.08] dark:text-white/70">
                0{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#31473b] dark:text-white/90">
                  {trail.name}
                </p>
                <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#89968e] dark:text-white/50">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" /> {trail.location}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-[#89968e] dark:text-white/50">
                {trail.length}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 border-t border-[#edf0ec] pt-3 text-[10px] leading-5 text-[#89968e] dark:border-white/10 dark:text-white/50">
          Browse upcoming community hikes and find a group to join.
        </p>
      </section>

      <section
        id="my-hikes"
        className="dapyo-card-elevation scroll-mt-24 rounded-[8px] bg-[#e5ede6] p-4 ring-1 ring-[#17342e]/[0.04] dark:bg-[#1d4037] dark:ring-white/[0.06]"
      >
        <div className="flex items-center gap-2 text-[#31533f] dark:text-white/85">
          <CalendarDays className="size-4" aria-hidden="true" />
          <h2 className="text-sm font-semibold">My hikes</h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#6a7a6f] dark:text-white/60">
          Your joined and completed hikes will collect here.
        </p>
        <Link
          href="/discover"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#286044] hover:text-[#a16d35] dark:text-[#e8bd78] dark:hover:text-white"
        >
          Browse upcoming hikes <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </section>

      <section
        id="profile"
        className="dapyo-card-elevation scroll-mt-24 rounded-[8px] bg-white p-4 ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#dce9df] text-sm font-bold text-[#1d604c] dark:bg-white/10 dark:text-[#dfece3]">
            {initials}
          </span>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: 'var(--dapyo-color-foreground)' }}
            >
              {displayName}
            </p>
            <p className="text-[10px] text-[#89968e] dark:text-white/50">Your trail profile</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-5 text-[#89968e] dark:text-white/50">
          Your profile will bring together hike history, progress, and shared moments.
        </p>
      </section>

      <p className="px-1 text-[9px] leading-4 text-[#9aa59e] dark:text-white/40">
        DAPYO is built around real participation: discover, join, hike, and share what you choose.
      </p>
    </aside>
  );
}
