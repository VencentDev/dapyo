'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';

import { HikeChatWindow } from '@/features/home/feed/components/hike-chat-workspace';
import { useHikeChats } from '@/features/hikes/api/hike-chat.hooks';

export function HikeChatPageContent({ hikeId }: { hikeId: string }) {
  const chatsQuery = useHikeChats();
  const { resolvedTheme } = useTheme();
  const surfaceColor =
    resolvedTheme === undefined ? undefined : resolvedTheme === 'dark' ? '#17342e' : '#ffffff';
  const chat = chatsQuery.data?.find((item) => item.hikeId === hikeId);

  if (chatsQuery.isLoading) {
    return (
      <div
        role="status"
        className="dapyo-card-elevation min-w-0 rounded-[8px] bg-white p-8 text-center text-sm text-[#65776c] dark:bg-[#17342e] dark:text-white/60 xl:col-span-2"
      >
        Loading hike chat…
      </div>
    );
  }

  if (chatsQuery.isError || !chat) {
    return (
      <section className="dapyo-card-elevation min-w-0 rounded-[8px] bg-white p-8 text-center dark:bg-[#17342e] xl:col-span-2">
        <p role="alert" className="text-sm font-medium text-[#8c3727] dark:text-[#ffb7a8]">
          {chatsQuery.isError
            ? 'This hike chat could not be loaded.'
            : 'You do not have access to this hike chat.'}
        </p>
        <button
          type="button"
          onClick={() => void chatsQuery.refetch()}
          className="mt-3 text-xs font-semibold text-[#1d604c] underline underline-offset-2 dark:text-[#cde5d3]"
        >
          Try again
        </button>
        <div>
          <Link
            href="/home#feed"
            className="mt-3 inline-block text-xs font-semibold text-[#1d604c] hover:underline dark:text-[#cde5d3]"
          >
            Back to hikes
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="min-w-0 xl:col-span-2">
      <HikeChatWindow chat={chat} presentation="page" surfaceColor={surfaceColor} />
    </div>
  );
}
