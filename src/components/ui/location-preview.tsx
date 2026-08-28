import { Copy, ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from './index';

export function LocationPreview({ title, address, latitude, longitude,mapHref }: {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  mapHref?: string;
}) {
  const coordinates = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(coordinates);
    toast.success('تم نسخ الإحداثيات');
  };

  const open = () => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative flex min-h-52 items-center justify-center bg-muted/60 p-6 text-center">
        <div
          className="absolute inset-0 opacity-70"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-1/3 border-t border-dashed" />
          <div className="absolute inset-x-0 top-2/3 border-t border-dashed" />
          <div className="absolute inset-y-0 start-1/3 border-s border-dashed" />
          <div className="absolute inset-y-0 start-2/3 border-s border-dashed" />
        </div>

        <div className="relative">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-card">
            <MapPin className="size-6" />
          </span>

          <p className="mt-3 font-bold">
            {title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {address}
          </p>

          <p
            className="mt-1 font-mono text-xs text-muted-foreground"
            dir="ltr"
          >
            {coordinates}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            معاينة موقع مضغوطة مرتبطة بمحول الخرائط المشترك.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t p-3">
        {mapHref && (
          <Link
            to={mapHref}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <MapPin className="size-4" />
            فتح في الخريطة التشغيلية
          </Link>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={open}
        >
          <ExternalLink className="size-4" />
          فتح الموقع الخارجي
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => void copy()}
        >
          <Copy className="size-4" />
          نسخ الإحداثيات
        </Button>
      </div>
    </div>
  );
}