import { useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { Button, Modal, Select, Textarea } from '@/components/ui';

import { rejectionReasons } from '../constants';
import { useApproveAdoptionRequest, useRejectAdoptionRequest,} from '../hooks';

import type { AdoptionRequestDetails, RejectAdoptionInput} from '../types';

export function ApprovalDialog({details,open,onOpenChange,}: {
  details: AdoptionRequestDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useApproveAdoptionRequest(details.request.id);
  const [note, setNote] = useState('');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="الموافقة على نشر العرض"
      description={`سيصبح عرض ${
        details.request.animal.name ?? details.request.animal.id
      } مرئياً للمستخدمين ويمكنهم إرسال طلبات تبنٍ للناشر.`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(note || undefined, {
                onSuccess: () => {
                  toast.success('تم نشر عرض التبني');
                  onOpenChange(false);
                },
                onError: () => {
                  toast.error('تعذر نشر العرض');
                },
              })
            }
          >
            الموافقة والنشر
          </Button>
        </>
      }
    >
      <label className="block text-sm font-semibold">
        ملاحظة داخلية{' '}
        <span className="font-normal text-muted-foreground">
          (اختيارية)
        </span>

        <Textarea
          className="mt-1"
          value={note}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setNote(event.target.value)
          }
          placeholder="أي ملاحظة تخص قرار النشر…"
        />
      </label>
    </Modal>
  );
}

export function RejectionDialog({
  details,
  open,
  onOpenChange,
}: {
  details: AdoptionRequestDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useRejectAdoptionRequest(details.request.id);

  const [reason, setReason] = useState<string>(rejectionReasons[0]);
  const [otherReason, setOtherReason] = useState('');

  // Add the custom text only when the admin selects "other reason".
  const input: RejectAdoptionInput = {
    reason,
    otherReason:
      reason === 'سبب آخر'
        ? otherReason
        : undefined,
  };

  const invalidOtherReason =
    reason === 'سبب آخر' &&
    otherReason.trim().length < 3;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="رفض نشر العرض"
      description="لن يظهر العرض للمستخدمين، وسيتم حفظ سبب الرفض ليعرف الناشر لماذا لم يتم نشره."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            disabled={mutation.isPending || invalidOtherReason}
            onClick={() =>
              mutation.mutate(input, {
                onSuccess: () => {
                  toast.success('تم رفض نشر العرض');
                  onOpenChange(false);
                },
                onError: () => {
                  toast.error('تعذر رفض العرض');
                },
              })
            }
          >
            رفض النشر
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          سبب الرفض

          <Select
            value={reason}
            onValueChange={setReason}
            options={rejectionReasons.map((value) => ({
              value,
              label: value,
            }))}
          />
        </label>

        {reason === 'سبب آخر' && (
          <label className="block text-sm font-semibold">
            التفاصيل

            <Textarea
              className="mt-1"
              value={otherReason}
              onChange={(event) =>
                setOtherReason(event.target.value)
              }
              placeholder="اكتب سبباً واضحاً للناشر…"
            />
          </label>
        )}
      </div>
    </Modal>
  );
}