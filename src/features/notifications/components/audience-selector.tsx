import { Checkbox, Select } from '@/components/ui';
import { governorates } from '../constants';
import { useNotificationTargets } from '../hooks';
import type { NotificationAudience, NotificationAudienceUserType } from '../types';

const userTypes: Array<{ value: NotificationAudienceUserType; label: string }> = [
  { value: 'USER', label: 'المستخدمون' },
  { value: 'ORGANIZATION', label: 'الجمعيات' },
];

function toggle<T extends string>(items: T[] | undefined, value: T, checked: boolean) {
  const set = new Set(items ?? []);

  if (checked) {
    set.add(value);
  } else {
    set.delete(value);
  }

  return [...set];
}

type Mode = 'EVERYONE' | 'TYPE' | 'GOVERNORATE' | 'ORGANIZATION' | 'USER';

function modeOf(value: NotificationAudience): Mode {
  if (value.everyone) {
    return 'EVERYONE';
  }

  if (value.organizationIds?.length) {
    return 'ORGANIZATION';
  }

  if (value.userIds?.length) {
    return 'USER';
  }

  if (value.governorates?.length) {
    return 'GOVERNORATE';
  }

  return 'TYPE';
}

export function AudienceSelector({ value, onChange }: { value: NotificationAudience; onChange: (value: NotificationAudience) => void }) {
  const targets = useNotificationTargets();
  const mode = modeOf(value);

  // Reset audience fields when switching between targeting modes.
  const setMode = (next: string) => {
    const m = next as Mode;

    if (m === 'EVERYONE') {
      onChange({ everyone: true });
    } else if (m === 'ORGANIZATION') {
      onChange({
        everyone: false,
        userTypes: ['ORGANIZATION'],
        organizationIds: [],
      });
    } else if (m === 'USER') {
      onChange({
        everyone: false,
        userTypes: ['USER'],
        userIds: [],
      });
    } else if (m === 'GOVERNORATE') {
      onChange({
        everyone: false,
        userTypes: ['USER'],
        governorates: ['دمشق'],
      });
    } else {
      onChange({
        everyone: false,
        userTypes: ['USER'],
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          نمط الجمهور
        </label>

        <Select
          value={mode}
          onValueChange={setMode}
          options={[
            { value: 'EVERYONE', label: 'الجميع' },
            { value: 'TYPE', label: 'حسب نوع الحساب' },
            { value: 'GOVERNORATE', label: 'حسب المحافظة' },
            { value: 'ORGANIZATION', label: 'جمعية محددة' },
            { value: 'USER', label: 'مستخدم محدد' },
          ]}
        />
      </div>

      {mode === 'TYPE' && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">
            نوع الحساب
          </legend>

          <div className="flex flex-wrap gap-4">
            {userTypes.map((item) => (
              <Checkbox
                key={item.value}
                label={item.label}
                checked={value.userTypes?.includes(item.value)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    userTypes: toggle(
                      value.userTypes,
                      item.value,
                      checked === true,
                    ),
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      )}

      {mode === 'GOVERNORATE' && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              نوع الحساب
            </label>

            <Select
              value={value.userTypes?.[0] ?? 'USER'}
              onValueChange={(value) =>
                onChange({
                  ...value,
                  userTypes: [value as NotificationAudienceUserType],
                })
              }
              options={userTypes}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              المحافظة
            </label>

            <Select
              value={value.governorates?.[0] ?? 'دمشق'}
              onValueChange={(value) =>
                onChange({
                  ...value,
                  governorates: [value],
                })
              }
              options={governorates.map((governorate) => ({
                value: governorate,
                label: governorate,
              }))}
            />
          </div>
        </>
      )}

      {mode === 'ORGANIZATION' && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            الجمعية
          </label>

          <Select
            value={value.organizationIds?.[0]}
            onValueChange={(value) =>
              onChange({
                ...value,
                organizationIds: [value],
              })
            }
            options={(targets.data?.organizations ?? []).map((organization) => ({
              value: organization.id,
              label: organization.name,
            }))}
            placeholder="اختر الجمعية"
          />
        </div>
      )}

      {mode === 'USER' && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            المستخدم
          </label>

          <Select
            value={value.userIds?.[0]}
            onValueChange={(value) =>
              onChange({
                ...value,
                userIds: [value],
              })
            }
            options={(targets.data?.users ?? []).map((user) => ({
              value: user.id,
              label: user.name,
            }))}
            placeholder="اختر المستخدم"
          />

          <p className="mt-1 text-xs text-muted-foreground">
            يعرض النموذج التجريبي عينة محدودة؛ البحث الكامل سيكون عبر الخادم.
          </p>
        </div>
      )}
    </div>
  );
}