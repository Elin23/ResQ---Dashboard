import { FileText } from 'lucide-react';

import { Badge, Button } from '@/components/ui';

export interface ReviewableDocument {
  id: string;
  type: string;
  name: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
  rejectionReason?: string;
}

export function DocumentReviewList({ documents, typeLabels, formatDate, canReview, onPreview, onApprove, onReject,
}: {
  documents: ReviewableDocument[];
  typeLabels: Record<string, string>;
  formatDate: (value: string) => string;
  canReview: boolean;
  onPreview: (document: ReviewableDocument) => void;
  onApprove: (document: ReviewableDocument) => void;
  onReject: (document: ReviewableDocument) => void;
}) {
  return (
    <div className="divide-y rounded-lg border">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex gap-3">
            <FileText className="mt-0.5 size-5 text-primary" />

            <div>
              <p className="font-semibold">
                {typeLabels[document.type] ?? document.type}
              </p>

              <p className="text-xs text-muted-foreground">
                {document.name} · رُفع {formatDate(document.uploadedAt)}
              </p>

              {document.rejectionReason && (
                <p className="mt-1 text-xs text-critical">
                  {document.rejectionReason}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                document.status === 'VERIFIED'
                  ? 'success'
                  : document.status === 'REJECTED'
                    ? 'critical'
                    : 'pending'
              }
            >
              {document.status === 'VERIFIED'
                ? 'معتمد'
                : document.status === 'REJECTED'
                  ? 'مرفوض'
                  : 'قيد المراجعة'}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(document)}
            >
              معاينة
            </Button>

            {document.status === 'PENDING' && canReview && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onApprove(document)}
                >
                  اعتماد
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(document)}
                >
                  رفض
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}