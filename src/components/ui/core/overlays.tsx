import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ChevronDown, Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { exportTableToExcel, exportTableToPdf, type ExportColumn } from '@/lib/data-export';
import { cn } from '@/lib/cn';

import { Button, IconButton } from './controls';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  className,
  align = 'end',
}: {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={8}
        className={cn(
          'resq-popover z-50 min-w-48 rounded-xl border border-border/80 bg-surface p-1.5 shadow-overlay',
          className,
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      className={cn(
        'flex min-h-10 cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-primary/8 data-[highlighted]:text-foreground',
        className,
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  );
}

export function ExportMenuButton<T>({
  title,
  fileName,
  columns,
  rows,
  subtitle,
  disabled = false,
}: {
  title: string;
  fileName: string;
  columns: Array<ExportColumn<T>>;
  rows: T[];
  subtitle?: string;
  disabled?: boolean;
}) {
  const options = {
    title,
    fileName,
    columns,
    rows,
    subtitle,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="h-9 rounded-xl px-3 text-[12px]"
          disabled={disabled}
        >
          <Download className="size-4" />
          تصدير
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-40"
      >
        <DropdownMenuItem
          onSelect={() =>
            void exportTableToPdf(options)
          }
        >
          <FileText className="size-4" />
          PDF
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() =>
            exportTableToExcel(options)
          }
        >
          <FileSpreadsheet className="size-4" />
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="resq-dialog-overlay fixed inset-0 z-50 bg-brown/35" />

        <DialogPrimitive.Content
          dir="rtl"
          className="resq-dialog-content fixed left-1/2 top-1/2 z-50 max-h-[min(88dvh,48rem)] w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border/50 bg-white p-5 shadow-lg"
        >
          <div className="pe-8">
            <DialogPrimitive.Title className="text-[15px] font-semibold">
              {title}
            </DialogPrimitive.Title>

            {description && (
              <DialogPrimitive.Description className="mt-1 text-[12px] text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>

          <DialogPrimitive.Close asChild>
            <IconButton
              label="إغلاق"
              className="absolute end-4 top-4"
            >
              <X className="size-5" />
            </IconButton>
          </DialogPrimitive.Close>

          <div className="mt-5">
            {children}
          </div>

          {footer && (
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'تأكيد',
  onConfirm,
  destructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div
        className={cn(
          'rounded-md border p-3 text-sm',
          destructive
            ? 'border-critical/30 bg-critical/5 text-critical'
            : 'bg-muted',
        )}
      >
        لا يمكن التراجع عن هذا الإجراء إذا كان نهائيًا.
      </div>
    </Modal>
  );
}

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className="rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-[background-color,color,box-shadow] duration-150 hover:text-foreground data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-card"
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export const TabsContent = TabsPrimitive.Content;

