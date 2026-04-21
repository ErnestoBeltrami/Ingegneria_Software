import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm text-[#101828] font-[Montserrat] placeholder:text-[#98a2b3] outline-none transition-colors focus:border-[#1f3a89]',
        className
      )}
      {...props}
    />
  );
}
