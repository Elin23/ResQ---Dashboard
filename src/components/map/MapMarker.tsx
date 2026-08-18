import { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MapEntity } from '@/features/map/types';
import { entityTypeLabels } from '@/features/map/constants';
import { safeDisplayText } from '@/lib/runtime-safety';

function tone(entity: MapEntity) {
  if (entity.type === 'ORGANIZATION') return 'success';
  if (entity.type === 'FEEDING_POINT') return 'pending';
  if (entity.type === 'VET_CLINIC') return 'primary';
  if (entity.type === 'ANIMAL_PHARMACY') return 'info';
  return 'neutral';
}

function MapMarkerComponent({ entity, selected, onSelect }: { entity: MapEntity; selected: boolean; onSelect: (entity: MapEntity) => void }) {
  const markerTone = tone(entity);
  const icon = useMemo(
    () => L.divIcon({
      className: 'resq-map-marker-shell',
      html: `<span class="resq-map-marker resq-map-marker--${markerTone}${selected ? ' resq-map-marker--selected' : ''}" aria-hidden="true"></span>`,
      iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
    }),
    [markerTone, selected],
  );
  const eventHandlers = useMemo(() => ({ click: () => onSelect(entity) }), [entity, onSelect]);
  return <Marker position={[entity.coordinates.latitude, entity.coordinates.longitude]} icon={icon} eventHandlers={eventHandlers}><Popup><div dir="rtl" className="min-w-44 text-right"><p className="text-xs text-muted-foreground">{entityTypeLabels[entity.type] ?? 'مكان'}</p><p className="font-bold">{safeDisplayText(entity.title, 'مكان بلا اسم')}</p><p className="mt-1 text-xs">{safeDisplayText(entity.governorate, 'موقع غير محدد')}{entity.city ? ` — ${entity.city}` : ''}</p></div></Popup></Marker>;
}
export const MapMarker = memo(MapMarkerComponent, (previous, next) => previous.entity === next.entity && previous.selected === next.selected && previous.onSelect === next.onSelect);
