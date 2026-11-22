import Image from 'next/image';

import { cn } from '@/lib/utils';

export function DapyoLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full', className)}
    >
      <Image src="/images/round-logo.png" alt="" fill sizes="32px" className="object-contain" />
    </span>
  );
}
