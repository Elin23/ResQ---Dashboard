import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      ...props
    },
    ref,
  ) {
    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/92',
      secondary:
        'border border-border/50 bg-white text-foreground hover:border-primary/20 hover:bg-primary/[0.025]',
      ghost:
        'text-foreground hover:bg-primary/[0.035]',
      danger:
        'bg-critical text-white hover:bg-critical/90',
    };

    const sizes = {
      sm: 'h-9 px-3 text-[12px]',
      md: 'h-9 px-3.5 text-[12px]',
      lg: 'h-10 px-4 text-[13px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[background-color,border-color,color] duration-150 disabled:pointer-events-none disabled:opacity-50',
          focusRing,
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-primary/[0.035] hover:text-foreground',
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-xl border border-border/50 bg-white px-3 text-[12px] shadow-none transition-[border-color,background-color] duration-150 placeholder:text-muted-foreground/70 hover:border-primary/20 focus:border-primary/30 disabled:cursor-not-allowed disabled:bg-muted/35 disabled:opacity-65',
        focusRing,
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-border/50 bg-white px-3 py-2.5 text-[12px] leading-6 shadow-none transition-[border-color,background-color] duration-150 placeholder:text-muted-foreground/70 hover:border-primary/20 focus:border-primary/30 disabled:cursor-not-allowed disabled:bg-muted/35 disabled:opacity-65',
        focusRing,
        className,
      )}
      {...props}
    />
  );
});

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'اختر',
  className,
  disabled = false,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      dir="rtl"
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-9 min-w-0 items-center justify-between gap-2 rounded-xl border border-border/50 bg-white px-3 text-[12px] shadow-none transition-[border-color,background-color] duration-150 hover:border-primary/20 hover:bg-primary/[0.02] focus:border-primary/30 data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/35 data-[disabled]:opacity-65',
          focusRing,
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />

        <SelectPrimitive.Icon className="text-muted-foreground">
          <ChevronDown className="size-4 transition-transform duration-150" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="resq-popover z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[min(92vw,24rem)] overflow-hidden rounded-xl border border-border/80 bg-surface p-1.5 shadow-overlay"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-10 cursor-default select-none items-center rounded-lg py-2 pe-9 ps-3 text-sm outline-none transition-colors data-[highlighted]:bg-primary/8 data-[highlighted]:text-foreground data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>

                <SelectPrimitive.ItemIndicator className="absolute end-2.5 text-primary">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  ariaLabel,
  disabled = false,
}: {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (
    checked: boolean | 'indeterminate',
  ) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 text-sm',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <CheckboxPrimitive.Root
        aria-label={ariaLabel}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'flex size-5 items-center justify-center rounded-md border border-border/90 bg-surface shadow-sm transition-[border-color,background-color,box-shadow] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-white disabled:cursor-not-allowed',
          focusRing,
        )}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label}
    </label>
  );
}

export function Radio({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <RadioGroupPrimitive.Item
        value={value}
        className={cn(
          'flex size-5 items-center justify-center rounded-full border',
          focusRing,
        )}
      >
        <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Item>

      {label}
    </label>
  );
}

export const RadioGroup = RadioGroupPrimitive.Root;

export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative h-6 w-11 rounded-full border border-border/70 bg-muted shadow-inner transition-[background-color,border-color] duration-150 data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          focusRing,
        )}
      >
        <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-150 data-[state=checked]:-translate-x-5" />
      </SwitchPrimitive.Root>

      {label}
    </label>
  );
}

