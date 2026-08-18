import { ChevronLeft, ChevronRight, Expand, Film } from 'lucide-react';
import { useState } from 'react';
import { IconButton, Modal } from './index';

export interface MediaGalleryItem { id: string; type: 'IMAGE' | 'VIDEO'; url: string; thumbnailUrl?: string; alt: string; }

function Preview({ item, className }: { item: MediaGalleryItem; className?: string }) {
  if (item.type === 'VIDEO') return <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ''}`}><div className="text-center"><Film className="mx-auto size-8" /><p className="mt-2 text-sm font-semibold">معاينة الفيديو غير مفعّلة بعد</p></div></div>;
  return <img src={item.url} alt={item.alt} loading="lazy" className={`object-cover ${className ?? ''}`} />;
}

export function MediaGallery({ items }: { items: MediaGalleryItem[] }) {
  const [selected, setSelected] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  if (items.length === 0) return <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">لا توجد وسائط مرفقة.</div>;
  const active = items[Math.min(selected, items.length - 1)];
  if (!active) return null;
  const move = (direction: number) => setSelected((current) => (current + direction + items.length) % items.length);
  return <div className="space-y-3">
    <div className="group relative overflow-hidden rounded-lg border bg-muted"><button type="button" className="block w-full" onClick={() => setFullscreen(true)} aria-label={`فتح ${active.alt} بالحجم الكامل`}><Preview item={active} className="h-72 w-full sm:h-96" /></button><div className="absolute end-3 top-3 rounded-full bg-surface/90"><IconButton label="عرض بالحجم الكامل" onClick={() => setFullscreen(true)}><Expand className="size-4" /></IconButton></div><span className="absolute bottom-3 start-3 rounded-full bg-brown/85 px-3 py-1 text-xs font-semibold text-white">{selected + 1} / {items.length}</span></div>
    {items.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{items.map((item, index) => <button key={item.id} type="button" onClick={() => setSelected(index)} aria-label={`عرض ${item.alt}`} aria-current={index === selected} className={`shrink-0 overflow-hidden rounded-md border-2 ${index === selected ? 'border-primary' : 'border-transparent'}`}><Preview item={item} className="size-20" /></button>)}</div>}
    <Modal open={fullscreen} onOpenChange={setFullscreen} title={active.alt} description={`وسيط ${selected + 1} من ${items.length}`}>
      <div className="relative overflow-hidden rounded-lg bg-muted"><Preview item={active} className="max-h-[68vh] w-full object-contain" />{items.length > 1 && <><div className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90"><IconButton label="الوسيط السابق" onClick={() => move(-1)}><ChevronRight className="size-5" /></IconButton></div><div className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90"><IconButton label="الوسيط التالي" onClick={() => move(1)}><ChevronLeft className="size-5" /></IconButton></div></>}</div>
    </Modal>
  </div>;
}
