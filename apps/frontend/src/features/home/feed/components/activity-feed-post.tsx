import Image from 'next/image';
import { Activity, Clock3, Heart, MapPin, MessageCircle, Mountain, TrendingUp } from 'lucide-react';

import type { sampleActivities } from '@/features/home/feed/lib/home-feed-preview';

type ActivityPreview = (typeof sampleActivities)[number];

export function ActivityFeedPost({ post }: { post: ActivityPreview }) {
  return (
    <article className="overflow-hidden rounded-[8px] bg-white shadow-sm ring-1 ring-[#17342e]/[0.06]">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: post.avatar }}
          aria-hidden="true"
        >
          {post.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-semibold text-[#253b32]">{post.author}</h3>
            <span className="rounded-full bg-[#f5f1e8] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#9a7548]">
              Sample
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8a968e]">
            <MapPin className="size-3" aria-hidden="true" /> {post.location}
            <span aria-hidden="true">·</span> {post.time}
          </p>
        </div>
        <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e796a]">
          Completed hike
        </span>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <p className="text-sm leading-6 text-[#53645b]">{post.note}</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2e4e40]">
          <Mountain className="size-3.5 text-[#b17e43]" aria-hidden="true" />
          {post.title}
        </div>
      </div>

      <div className="relative aspect-[16/9] max-h-[410px] w-full overflow-hidden bg-[#dce5dc] sm:aspect-[2/1]">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(min-width: 1280px) 620px, (min-width: 768px) 70vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-3 border-b border-[#edf0ec] px-4 py-3 text-center sm:px-5">
        <FeedMetric icon={TrendingUp} value={post.distance} label="Distance" />
        <FeedMetric icon={Clock3} value={post.duration} label="Moving time" />
        <FeedMetric icon={Activity} value={post.elevation} label="Elevation" />
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-xs text-[#819087] sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-3.5 fill-[#d99a6a] text-[#d99a6a]" aria-hidden="true" />
          {post.likes} hikers appreciated this
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          {post.comments} comments
        </span>
      </div>
    </article>
  );
}

function FeedMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TrendingUp;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-left">
      <Icon className="hidden size-4 text-[#b17e43] sm:block" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-[#3e5748]">{value}</p>
        <p className="mt-0.5 text-[9px] text-[#98a39c]">{label}</p>
      </div>
    </div>
  );
}
