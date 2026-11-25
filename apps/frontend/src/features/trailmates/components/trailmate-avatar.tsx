export function TrailmateAvatar({ name }: { name?: string | null }) {
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'H';

  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e5ede6] text-xs font-semibold text-[#1d604c] dark:bg-white/10 dark:text-[#dfece3]"
    >
      {initials}
    </span>
  );
}
