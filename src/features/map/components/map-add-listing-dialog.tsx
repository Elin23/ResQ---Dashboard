import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, Modal, Select, Textarea } from '@/components/ui';

import { mapLayerConfigs } from '../constants';
import { useLocations } from '@/features/settings/hooks';
import { useCreateMapListing } from '../hooks';
import type { CreateMapListingInput } from '../types';

const manualTypes = mapLayerConfigs
  .filter((item) => !['ORGANIZATION', 'FEEDING_POINT'].includes(item.key))
  .map((item) => ({ value: item.key, label: item.label }));

const defaultDraft = {
  type: 'PET_SUPPLIES' as CreateMapListingInput['type'],
  title: '',
  governorateId: '',
  regionId: '',
  address: '',
  latitude: '33.5138',
  longitude: '36.2765',
  ownerName: 'إدارة ResQ',
  phone: '',
  email: '',
  website: '',
  openingHours: '',
  description: '',
};

type Draft = typeof defaultDraft;

export function MapAddListingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useCreateMapListing();
  const locations = useLocations();
  const [form, setForm] = useState<Draft>(defaultDraft);
  const governorates = locations.data?.governorates ?? [];
  const regions = (locations.data?.regions ?? []).filter((item) => item.governorateId === form.governorateId);

  useEffect(() => {
    if (open) {
      setForm(defaultDraft);
    }
  }, [open]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Validate coordinates as text first so clearing a number field never becomes a valid zero coordinate.
  const submit = async () => {
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const coordinatesValid =
      form.latitude.trim() !== '' &&
      form.longitude.trim() !== '' &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (!form.governorateId || !form.regionId) {
      toast.error('اختر المحافظة والمنطقة من القوائم المعتمدة.');
      return;
    }

    if (!form.title.trim() || !form.address.trim()) {
      toast.error('أكمل اسم المكان والعنوان.');
      return;
    }

    if (!coordinatesValid) {
      toast.error('أدخل إحداثيات صحيحة ضمن النطاق المسموح.');
      return;
    }

    const input: CreateMapListingInput = {
      ...form,
      latitude,
      longitude,
      title: form.title.trim(),
      address: form.address.trim(),
      ownerName: form.ownerName.trim(),
    };

    try {
      await mutation.mutateAsync(input);
      toast.success('تمت إضافة المكان إلى الخريطة.');
      onOpenChange(false);
    } catch {
      toast.error('تعذر إضافة المكان.');
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إضافة مكان إلى الخريطة"
      description="الإضافة اليدوية من الإدارة تنشر مباشرة. الجمعيات ونقاط الإطعام تضاف تلقائيًا من سجلاتها."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button disabled={mutation.isPending} onClick={() => void submit()}>
            <Plus className="size-4" />
            إضافة ونشر
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] font-medium">
          الفئة
          <Select value={form.type} onValueChange={(value) => update('type', value as CreateMapListingInput['type'])} options={manualTypes} />
        </label>

        <label className="text-[12px] font-medium">
          اسم المكان
          <Input className="mt-1" value={form.title} onChange={(event) => update('title', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium">
          المحافظة
          <Select
            value={form.governorateId}
            onValueChange={(value) => setForm((current) => ({ ...current, governorateId: value, regionId: '' }))}
            placeholder="اختر المحافظة"
            options={governorates.map((item) => ({ value: item.id, label: item.name }))}
          />
        </label>

        <label className="text-[12px] font-medium">
          المنطقة
          <Select
            value={form.regionId}
            onValueChange={(value) => update('regionId', value)}
            placeholder={form.governorateId ? 'اختر المنطقة' : 'اختر المحافظة أولًا'}
            disabled={!form.governorateId}
            options={regions.map((item) => ({ value: item.id, label: item.name }))}
          />
        </label>

        <label className="text-[12px] font-medium sm:col-span-2">
          العنوان
          <Input className="mt-1" value={form.address} onChange={(event) => update('address', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium">
          خط العرض
          <Input
            dir="ltr"
            className="mt-1 text-left"
            type="number"
            step="any"
            inputMode="decimal"
            value={form.latitude}
            onChange={(event) => update('latitude', event.target.value)}
          />
          <span className="mt-1 block text-[10px] font-normal text-muted-foreground">من -90 إلى 90</span>
        </label>

        <label className="text-[12px] font-medium">
          خط الطول
          <Input
            dir="ltr"
            className="mt-1 text-left"
            type="number"
            step="any"
            inputMode="decimal"
            value={form.longitude}
            onChange={(event) => update('longitude', event.target.value)}
          />
          <span className="mt-1 block text-[10px] font-normal text-muted-foreground">من -180 إلى 180</span>
        </label>

        <label className="text-[12px] font-medium">
          اسم صاحب المكان
          <Input className="mt-1" value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium">
          رقم التواصل
          <Input dir="ltr" className="mt-1 text-left" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium">
          البريد الإلكتروني
          <Input dir="ltr" className="mt-1 text-left" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium">
          الموقع الإلكتروني
          <Input dir="ltr" className="mt-1 text-left" type="url" value={form.website} onChange={(event) => update('website', event.target.value)} />
        </label>

        <label className="text-[12px] font-medium sm:col-span-2">
          ساعات العمل
          <Input className="mt-1" value={form.openingHours} onChange={(event) => update('openingHours', event.target.value)} placeholder="مثال: 09:00 - 21:00" />
        </label>

        <label className="text-[12px] font-medium sm:col-span-2">
          وصف مختصر
          <Textarea className="mt-1" value={form.description} onChange={(event) => update('description', event.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
