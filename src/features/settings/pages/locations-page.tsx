import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, PageHeader, Select, Switch } from '@/components/ui';
import { useAddGovernorate, useAddRegion, useLocations, useUpdateGovernorate, useUpdateRegion } from '../hooks';
import type { GovernorateRecord, RegionRecord } from '../types';

function GovernorateRow({ item }: { item: GovernorateRecord }) {
  const mutation = useUpdateGovernorate();
  const [name, setName] = useState(item.name);

  const update = async (patch: { name?: string; isActive?: boolean }) => {
    try {
      await mutation.mutateAsync({ id: item.id, patch });
      toast.success('تم تحديث المحافظة.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تحديث المحافظة.');
    }
  };

  return (
    <div className="grid gap-2 rounded-lg border border-border/45 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div className="flex items-center gap-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Badge tone={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'فعالة' : 'غير فعالة'}</Badge>
      </div>
      <Button variant="secondary" size="sm" disabled={name.trim().length < 2 || name.trim() === item.name || mutation.isPending} onClick={() => void update({ name: name.trim() })}>
        حفظ الاسم
      </Button>
      <Switch checked={item.isActive} onCheckedChange={(checked) => void update({ isActive: checked })} label={item.isActive ? 'فعال' : 'غير فعال'} />
    </div>
  );
}

function RegionRow({ item, governorates }: { item: RegionRecord; governorates: GovernorateRecord[] }) {
  const mutation = useUpdateRegion();
  const [name, setName] = useState(item.name);
  const activeGovernorates = governorates.filter((governorate) => governorate.isActive);
  const parent = governorates.find((governorate) => governorate.id === item.governorateId);

  const update = async (patch: { name?: string; governorateId?: string; isActive?: boolean }) => {
    try {
      await mutation.mutateAsync({ id: item.id, patch });
      toast.success('تم تحديث المنطقة.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تحديث المنطقة.');
    }
  };

  return (
    <div className="grid gap-2 rounded-lg border border-border/45 p-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-center">
      <Input value={name} onChange={(event) => setName(event.target.value)} />
      <Select
        value={item.governorateId}
        onValueChange={(value) => void update({ governorateId: value })}
        options={[
          ...(parent && !parent.isActive ? [{ value: parent.id, label: `${parent.name} (غير فعالة)` }] : []),
          ...activeGovernorates.map((governorate) => ({ value: governorate.id, label: governorate.name })),
        ]}
      />
      <Button variant="secondary" size="sm" disabled={name.trim().length < 2 || name.trim() === item.name || mutation.isPending} onClick={() => void update({ name: name.trim() })}>
        حفظ الاسم
      </Button>
      <Switch checked={item.isActive} onCheckedChange={(checked) => void update({ isActive: checked })} label={item.isActive ? 'فعال' : 'غير فعال'} />
    </div>
  );
}

export function LocationsPage() {
  const locations = useLocations(true);
  const addGovernorate = useAddGovernorate();
  const addRegion = useAddRegion();
  const [governorateName, setGovernorateName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionGovernorateId, setRegionGovernorateId] = useState('');

  const governorates = locations.data?.governorates ?? [];
  const regions = locations.data?.regions ?? [];
  const activeGovernorates = useMemo(() => governorates.filter((item) => item.isActive), [governorates]);

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="المحافظات والمناطق"
        description="المصدر المركزي للمواقع المستخدمة في جميع الإدخالات الجديدة. تعطيل محافظة يمنع استخدامها ويمنع تلقائيًا مناطقها في الإدخالات الجديدة، مع بقاء البيانات التاريخية قابلة للعرض."
        breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات', href: '/settings' }, { label: 'المحافظات والمناطق' }]}
      />

      <Card>
        <h2 className="text-sm font-semibold">المحافظات</h2>
        <p className="mt-1 text-xs text-muted-foreground">لا يتم حذف المحافظات فعليًا؛ استخدم التعطيل للحفاظ على السجلات القديمة.</p>
        <div className="mt-4 space-y-2">
          {governorates.map((item) => <GovernorateRow key={item.id} item={item} />)}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={governorateName} onChange={(event) => setGovernorateName(event.target.value)} placeholder="اسم محافظة جديدة" />
          <Button disabled={governorateName.trim().length < 2 || addGovernorate.isPending} onClick={async () => {
            try {
              await addGovernorate.mutateAsync(governorateName.trim());
              setGovernorateName('');
              toast.success('تمت إضافة المحافظة.');
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'تعذر إضافة المحافظة.');
            }
          }}>إضافة</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">المناطق</h2>
        <p className="mt-1 text-xs text-muted-foreground">كل منطقة مرتبطة بمحافظة واحدة، ولا يمكن ربط إدخال جديد بمحافظة غير فعالة.</p>
        <div className="mt-4 space-y-2">
          {regions.map((item) => <RegionRow key={item.id} item={item} governorates={governorates} />)}
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <Select
            value={regionGovernorateId}
            onValueChange={setRegionGovernorateId}
            placeholder="اختر المحافظة"
            options={activeGovernorates.map((item) => ({ value: item.id, label: item.name }))}
          />
          <Input value={regionName} onChange={(event) => setRegionName(event.target.value)} placeholder="اسم المنطقة الجديدة" />
          <Button disabled={!regionGovernorateId || regionName.trim().length < 2 || addRegion.isPending} onClick={async () => {
            try {
              await addRegion.mutateAsync({ governorateId: regionGovernorateId, name: regionName.trim() });
              setRegionName('');
              toast.success('تمت إضافة المنطقة.');
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'تعذر إضافة المنطقة.');
            }
          }}>إضافة</Button>
        </div>
      </Card>
    </div>
  );
}
