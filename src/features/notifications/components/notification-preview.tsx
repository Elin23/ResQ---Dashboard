import { Bell, Smartphone } from 'lucide-react';
import { Badge, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import type { NotificationChannel } from '../types';

export function NotificationPreview({ title, body, channels, imageUrl }: { title: string; body: string; channels: NotificationChannel[]; imageUrl?: string }) {
  // Prefer the push preview when that channel is part of the broadcast.
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">
            معاينة تقريبية
          </p>

          <p className="text-xs text-muted-foreground">
            قد تختلف طريقة العرض النهائية حسب نظام التشغيل وإصدار التطبيق.
          </p>
        </div>

        <Badge tone="info">
          معاينة
        </Badge>
      </div>

      <Tabs defaultValue={channels.includes('PUSH') ? 'push' : 'inapp'}>
        <TabsList className="inline-flex rounded-lg bg-muted p-1">
          <TabsTrigger value="push">
            إشعار دفع
          </TabsTrigger>

          <TabsTrigger value="inapp">
            داخل التطبيق
          </TabsTrigger>
        </TabsList>

        <TabsContent value="push" className="mt-4">
          <div className="mx-auto max-w-sm rounded-[1.5rem] border bg-muted/50 p-4">
            <div className="rounded-xl bg-surface p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-primary p-2 text-white">
                  <Bell className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {title || 'عنوان الإشعار'}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {body || 'سيظهر نص الإشعار هنا.'}
                  </p>
                </div>
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="صورة مرفقة بالإشعار"
                  className="mt-3 aspect-[16/7] w-full rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inapp" className="mt-4">
          <div className="rounded-xl border bg-surface p-5">
            <div className="flex items-start gap-3">
              <Smartphone className="mt-1 size-5 text-primary" />

              <div>
                <p className="font-bold">
                  {title || 'عنوان الإشعار'}
                </p>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {body || 'سيظهر نص الإشعار داخل مركز الإشعارات في التطبيق.'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}