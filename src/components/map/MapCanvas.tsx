import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

import type { MapCanvasProps } from './types';
import { MapMarker } from './MapMarker';

import { isValidCoordinate } from '@/lib/runtime-safety';

import 'leaflet/dist/leaflet.css';

function geometryKey(entities: MapCanvasProps['entities']) {
  return entities
    .filter((entity) =>
      isValidCoordinate(
        entity.coordinates.latitude,
        entity.coordinates.longitude,
      ),
    )
    .map(
      (entity) =>
        `${entity.coordinates.latitude},${entity.coordinates.longitude}`,
    )
    .join('|');
}

function coordinatesFromKey(key: string): Array<[number, number]> {
  if (!key) {
    return [];
  }

  return key
    .split('|')
    .map((point) => {
      const [latitude, longitude] = point.split(',').map(Number);

      return [
        latitude ?? 0,
        longitude ?? 0,
      ] as [number, number];
    })
    .filter(([latitude, longitude]) =>
      isValidCoordinate(latitude, longitude),
    );
}

function ViewportController({
  entities,
  fitNonce,
  focusEntity,
}: {
  entities: MapCanvasProps['entities'];
  fitNonce: number;
  focusEntity?: MapCanvasProps['focusEntity'];
}) {
  const map = useMap();

  const boundsKey = useMemo(() => geometryKey(entities), [entities]);

  const focusLatitude = focusEntity?.coordinates.latitude;
  const focusLongitude = focusEntity?.coordinates.longitude;

  const validFocus = isValidCoordinate(
    focusLatitude,
    focusLongitude,
  );

  // Focus one place first, otherwise fit all valid markers.
  useEffect(() => {
    if (
      validFocus &&
      focusLatitude !== undefined &&
      focusLongitude !== undefined
    ) {
      map.setView(
        [focusLatitude, focusLongitude],
        13,
        { animate: false },
      );

      return;
    }

    const coordinates = coordinatesFromKey(boundsKey);

    if (!coordinates.length) {
      return;
    }

    if (coordinates.length === 1) {
      const first = coordinates[0];

      if (first) {
        map.setView(first, 11, { animate: false });
      }

      return;
    }

    map.fitBounds(
      L.latLngBounds(coordinates),
      {
        padding: [30, 30],
        maxZoom: 12,
        animate: false,
      },
    );
  }, [
    map,
    boundsKey,
    fitNonce,
    focusLatitude,
    focusLongitude,
    validFocus,
  ]);

  // Keep Leaflet size correct when the layout changes.
  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;

    const invalidate = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    };

    invalidate();

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(invalidate)
        : undefined;

    observer?.observe(container);
    window.addEventListener('resize', invalidate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

  return null;
}

export function MapCanvas({
  entities,
  selectedId,
  onSelect,
  fitNonce,
  focusEntity,
  compact = false,
}: MapCanvasProps) {
  const [tileError, setTileError] = useState(false);

  const safeEntities = useMemo(
    () =>
      entities.filter((entity) =>
        isValidCoordinate(
          entity.coordinates.latitude,
          entity.coordinates.longitude,
        ),
      ),
    [entities],
  );

  const invalidEntityCount = entities.length - safeEntities.length;

  const tileHandlers = useMemo(
    () => ({
      tileerror: () => setTileError(true),
      load: () => setTileError(false),
    }),
    [],
  );

  return (
    <div
      className={`relative ${
        compact ? 'h-64' : 'h-[34rem] min-h-[28rem]'
      } overflow-hidden rounded-xl border bg-muted/40`}
    >
      <MapContainer
        center={[35.0, 38.0]}
        zoom={6}
        minZoom={5}
        maxZoom={18}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={tileHandlers}
        />

        <ViewportController
          entities={safeEntities}
          fitNonce={fitNonce}
          focusEntity={focusEntity}
        />

        {safeEntities.map((entity) => (
          <MapMarker
            key={entity.id}
            entity={entity}
            selected={selectedId === entity.id}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>

      {invalidEntityCount > 0 && (
        <div
          role="status"
          className="absolute inset-x-3 top-3 z-[500] rounded-lg border bg-surface/95 p-3 text-sm shadow-card"
        >
          تم تجاهل {invalidEntityCount} عنصر بخطوط عرض/طول غير صالحة لحماية
          الخريطة من التعطل.
        </div>
      )}

      {tileError && (
        <div
          role="alert"
          className="absolute inset-x-3 bottom-3 z-[500] rounded-lg border bg-surface/95 p-3 text-sm shadow-card"
        >
          تعذر تحميل بعض بلاطات الخريطة. بيانات دليل الأماكن ما زالت متاحة
          ويمكن إعادة المحاولة عند استقرار الشبكة.
        </div>
      )}
    </div>
  );
}