import { useState } from 'react';
import { toast } from 'sonner';

import { Button, Modal, Textarea } from '@/components/ui';

import { useDeleteDonationCampaign, useRejectDonationCampaign } from '../hooks';

export function RejectDonationCampaignDialog({ campaignId, open, onOpenChange }: { campaignId: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const [reason, setReason] = useState('');
  const mutation = useRejectDonationCampaign(campaignId);

  // Require a clear rejection reason before sending the action.
  const handleReject = () => {
    mutation.mutate(reason.trim(), {
      onSuccess: () => {
        toast.success('تم رفض نشر الحملة');
        onOpenChange(false);
      },
      onError: () => {
        toast.error('تعذر رفض الحملة');
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="رفض نشر الحملة"
      description="سيظهر سبب الرفض لصاحب الحملة."
      footer={
        <>
          <Button
            variant="secondary"
            className="h-9 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            className="h-9 rounded-xl"
            disabled={mutation.isPending || reason.trim().length < 3}
            onClick={handleReject}
          >
            رفض الحملة
          </Button>
        </>
      }
    >
      <label className="block text-[12px] font-medium">
        سبب الرفض
        <Textarea
          className="mt-1.5 rounded-xl"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="وضح سبب عدم الموافقة على النشر…"
        />
      </label>
    </Modal>
  );
}

export function DeleteDonationCampaignDialog({ campaignId, open, onOpenChange, onDeleted }: { campaignId: string; open: boolean; onOpenChange: (value: boolean) => void; onDeleted?: () => void }) {
  const [reason, setReason] = useState('');
  const mutation = useDeleteDonationCampaign(campaignId);

  // Keep the delete reason required because this is an administrative action.
  const handleDelete = () => {
    mutation.mutate(reason.trim(), {
      onSuccess: () => {
        toast.success('تم حذف الحملة');
        onOpenChange(false);
        onDeleted?.();
      },
      onError: () => {
        toast.error('تعذر حذف الحملة');
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="حذف الحملة من الأرشيف"
      description="الحذف إداري ويخفي الحملة من لوحة الإدارة."
      footer={
        <>
          <Button
            variant="secondary"
            className="h-9 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            className="h-9 rounded-xl"
            disabled={mutation.isPending || reason.trim().length < 3}
            onClick={handleDelete}
          >
            حذف
          </Button>
        </>
      }
    >
      <label className="block text-[12px] font-medium">
        سبب الحذف
        <Textarea
          className="mt-1.5 rounded-xl"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="سبب الحذف الإداري…"
        />
      </label>
    </Modal>
  );
}