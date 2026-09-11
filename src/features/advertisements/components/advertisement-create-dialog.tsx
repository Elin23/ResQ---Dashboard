import { useState, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Modal, Select, Textarea } from '@/components/ui';

import { advertisementPaymentMethodLabels, advertisementPlacementConfig } from '../constants';
import { advertisementPaymentMethods, advertisementPlacements, type AdvertisementPaymentMethod, type AdvertisementPlacement } from '../types';
import { useCreateAdvertisement } from '../hooks';

interface AdvertisementFormState {
  publicationTitle: string;
  description: string;
  publicationPhone: string;
  publicationEmail: string;
  paid: boolean;
  paymentMethod: AdvertisementPaymentMethod;
  placement: AdvertisementPlacement;
  startAt: string;
  endAt: string;
}

const initialForm: AdvertisementFormState = {
  publicationTitle: '',
  description: '',
  publicationPhone: '',
  publicationEmail: '',
  paid: false,
  paymentMethod: 'CASH',
  placement: 'HOME_BANNER',
  startAt: '',
  endAt: '',
};

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('IMAGE_READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

export function AdvertisementCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const mutation = useCreateAdvertisement();
  const [form, setForm] = useState<AdvertisementFormState>(initialForm);
  const [images, setImages] = useState<string[]>([]);

  const set = <K extends keyof AdvertisementFormState>(key: K, value: AdvertisementFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onImagesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    event.target.value = '';
    if (!files.length) return;

    try {
      const available = Math.max(0, 5 - images.length);
      const next = await Promise.all(files.slice(0, available).map(readImage));
      setImages((current) => [...current, ...next].slice(0, 5));
      if (files.length > available) toast.info('يمكن إضافة خمس صور كحد أقصى لكل إعلان');
    } catch {
      toast.error('تعذر قراءة إحدى الصور');
    }
  };

  const valid =
    form.publicationTitle.trim().length >= 3 &&
    form.publicationPhone.trim().length >= 5 &&
    images.length > 0 &&
    (!form.startAt || !form.endAt || new Date(form.endAt) > new Date(form.startAt));

  const reset = () => {
    setForm(initialForm);
    setImages([]);
  };

  const submit = () => {
    if (!valid) return;

    mutation.mutate(
      {
        publicationTitle: form.publicationTitle.trim(),
        description: form.description.trim() || undefined,
        imageUrls: images,
        publicationPhone: form.publicationPhone.trim(),
        publicationEmail: form.publicationEmail.trim() || undefined,
        paid: form.paid,
        paymentMethod: form.paymentMethod,
        placement: form.placement,
        startAt: form.startAt || undefined,
        endAt: form.endAt || undefined,
      },
      {
        onSuccess: (advertisement) => {
          toast.success('تمت إضافة الإعلان');
          reset();
          onOpenChange(false);
          onCreated?.(advertisement.id);
        },
        onError: () => toast.error('تعذر إضافة الإعلان'),
      },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value && !mutation.isPending) reset();
    onOpenChange(value);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="إضافة إعلان"
      description="أدخل بيانات الإعلان التي يدعمها الخادم فقط؛ لن تُعرض حقول غير محفوظة في قاعدة البيانات."
      footer={
        <>
          <Button variant="secondary" className="h-9 rounded-xl" onClick={() => handleOpenChange(false)}>
            إلغاء
          </Button>
          <Button className="h-9 rounded-xl" disabled={!valid || mutation.isPending} onClick={submit}>
            حفظ الإعلان
          </Button>
        </>
      }
    >
      <div className="space-y-4" dir="rtl">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium sm:col-span-2">
            عنوان الإعلان
            <Input className="mt-1.5 h-9 rounded-xl" value={form.publicationTitle} onChange={(event) => set('publicationTitle', event.target.value)} />
          </label>

          <label className="text-[12px] font-medium">
            هاتف التواصل
            <Input dir="ltr" className="mt-1.5 h-9 rounded-xl text-left" value={form.publicationPhone} onChange={(event) => set('publicationPhone', event.target.value)} />
          </label>

          <label className="text-[12px] font-medium">
            بريد التواصل <span className="font-normal text-muted-foreground">(اختياري)</span>
            <Input dir="ltr" type="email" className="mt-1.5 h-9 rounded-xl text-left" value={form.publicationEmail} onChange={(event) => set('publicationEmail', event.target.value)} />
          </label>

          <label className="text-[12px] font-medium">
            طريقة الدفع
            <div className="mt-1.5">
              <Select
                value={form.paymentMethod}
                onValueChange={(value) => set('paymentMethod', value as AdvertisementPaymentMethod)}
                options={advertisementPaymentMethods.map((value) => ({ value, label: advertisementPaymentMethodLabels[value] }))}
              />
            </div>
          </label>

          <label className="text-[12px] font-medium">
            موضع الظهور
            <div className="mt-1.5">
              <Select
                value={form.placement}
                onValueChange={(value) => set('placement', value as AdvertisementPlacement)}
                options={advertisementPlacements.map((value) => ({ value, label: advertisementPlacementConfig[value].label }))}
              />
            </div>
          </label>
        </div>

        <label className="flex items-center gap-2 rounded-lg bg-muted/25 px-3 py-2 text-[12px]">
          <input type="checkbox" checked={form.paid} onChange={(event) => set('paid', event.target.checked)} />
          تم تسجيل الإعلان كمدفوع
        </label>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[12px] font-medium">صور الإعلان</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">أضف من صورة واحدة وحتى خمس صور.</p>
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border/50 bg-white px-3 text-[12px] font-medium transition-colors hover:border-primary/20 hover:bg-primary/[0.025]">
              <ImagePlus className="size-4" />
              إضافة صور
              <input className="hidden" type="file" accept="image/*" multiple onChange={onImagesSelected} />
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((src, index) => (
                <div key={`${src.slice(0, 32)}-${index}`} className="group relative overflow-hidden rounded-xl border border-border/40 bg-muted/20">
                  <img src={src} alt={`صورة الإعلان ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`حذف الصورة ${index + 1}`}
                    className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-sm transition-colors hover:bg-critical/10 hover:text-critical"
                    onClick={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium">
            بداية النشر
            <Input type="date" className="mt-1.5 h-9 rounded-xl" value={form.startAt} onChange={(event) => set('startAt', event.target.value)} />
          </label>
          <label className="text-[12px] font-medium">
            نهاية النشر
            <Input type="date" className="mt-1.5 h-9 rounded-xl" value={form.endAt} onChange={(event) => set('endAt', event.target.value)} />
          </label>
          <label className="text-[12px] font-medium sm:col-span-2">
            الوصف
            <Textarea className="mt-1.5 rounded-xl" value={form.description} onChange={(event) => set('description', event.target.value)} />
          </label>
        </div>
      </div>
    </Modal>
  );
}
