import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { PermissionGuard, usePermission } from '@/features/auth/rbac';

import type { Report } from '../types';
import { ReportWorkflowDialog, type ReportWorkflow } from './report-workflow-dialogs';

export function ReportActions({ report }: { report: Report }) {
  const navigate = useNavigate();

  const [workflow, setWorkflow] =
    useState<ReportWorkflow | null>(null);

  const canUpdate = usePermission('reports:update');
  const canDelete = usePermission('reports:reject');

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <PermissionGuard permission="reports:assign">
          <Button
            className="h-9 rounded-xl px-3 text-[12px] font-medium"
            onClick={() => setWorkflow('assign')}
            disabled={report.status === 'CLOSED'}
          >
            {report.assignedOrganization
              ? 'تغيير الجمعية'
              : 'تعيين جمعية'}
          </Button>
        </PermissionGuard>

        {(canUpdate || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label="إجراءات إضافية"  className="h-9 w-9 rounded-xl">
                <MoreHorizontal className="size-4" />
              </IconButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {canUpdate && (
                <DropdownMenuItem
                  onSelect={() =>
                    setWorkflow('status-override')
                  }
                >
                  تجاوز إداري للحالة
                </DropdownMenuItem>
              )}

              {canDelete && (
                <DropdownMenuItem
                  className="text-critical"
                  onSelect={() =>
                    setWorkflow('delete')
                  }
                >
                  <Trash2 className="size-4" />
                  حذف البلاغ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Keep the selected workflow mounted only while its dialog is open. */}
      {workflow && (
        <ReportWorkflowDialog
          report={report}
          workflow={workflow}
          open
          onOpenChange={(open) => {
            if (!open) {
              setWorkflow(null);
            }
          }}
          onDeleted={() =>  navigate('/reports')}
        />
      )}
    </>
  );
}