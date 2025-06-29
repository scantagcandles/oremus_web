import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  label?: string;
}

export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-white/10',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  );
}
