import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-between gap-3 rounded-2xl px-6 h-14 w-full font-semibold text-base text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
  {
    variants: {
      variant: {
        cittadino: 'bg-[#007a52] shadow-[0px_4px_18px_0px_rgba(0,122,82,0.35)] hover:opacity-90',
        operatore: 'bg-[#1f3a89] shadow-[0px_4px_18px_0px_rgba(31,58,137,0.35)] hover:opacity-90',
        ghost: 'bg-transparent text-[#6a7282] shadow-none hover:text-[#1f3a89] justify-start h-auto p-0 text-sm font-medium',
      },
    },
    defaultVariants: {
      variant: 'operatore',
    },
  }
);

export function Button({ className, variant, asChild = false, children, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({ variant }), className)} {...props}>
      {children}
    </Comp>
  );
}
