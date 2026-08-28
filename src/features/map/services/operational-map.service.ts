import { getFeedingPoints } from '@/features/feeding-points/services/feeding-points.mock';
import { getOrganizations } from '@/features/organizations/services/organizations.mock';
import { mockDelay } from '@/services/mock/delay';
import type { CreateMapListingInput, MapDirectoryData, MapEntity, MapListingRequest } from '../types';

const now = () => new Date().toISOString();

let sequence = 20;

let directory: MapEntity[] = [
  {
    id: 'MAP:PET-001',
    sourceId: 'PET-001',
    type: 'PET_SUPPLIES',
    coordinates: {
      latitude: 33.5149,
      longitude: 36.2765,
    },
    title: 'بيت الحيوان للمستلزمات',
    subtitle: 'متجر مستلزمات',
    governorate: 'دمشق',
    city: 'المزة',
    address: 'أوتستراد المزة، دمشق',
    updatedAt: now(),
    metadata: {
      source: 'USER_REQUEST',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'USER',
      ownerName: 'رامي الأحمد',
      phone: '0944001122',
      openingHours: '10:00 - 22:00',
      description: 'مستلزمات وطعام وأدوات عناية للحيوانات.',
    },
  },
  {
    id: 'MAP:VET-002',
    sourceId: 'VET-002',
    type: 'VET_CLINIC',
    coordinates: {
      latitude: 33.5102,
      longitude: 36.2981,
    },
    title: 'عيادة الرفق البيطرية',
    subtitle: 'عيادة بيطرية',
    governorate: 'دمشق',
    city: 'أبو رمانة',
    address: 'أبو رمانة، دمشق',
    updatedAt: now(),
    metadata: {
      source: 'ADMIN',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'ADMIN',
      ownerName: 'إدارة ResQ',
      phone: '0113344556',
      email: 'care@example.test',
      openingHours: '09:00 - 20:00',
    },
  },
  {
    id: 'MAP:PHARM-003',
    sourceId: 'PHARM-003',
    type: 'ANIMAL_PHARMACY',
    coordinates: {
      latitude: 36.2017,
      longitude: 37.1343,
    },
    title: 'مستودع الشفاء البيطري',
    governorate: 'حلب',
    city: 'الجميلية',
    address: 'الجميلية، حلب',
    updatedAt: now(),
    metadata: {
      source: 'USER_REQUEST',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'USER',
      ownerName: 'محمود سليمان',
      phone: '0933554411',
    },
  },
  {
    id: 'MAP:HOTEL-004',
    sourceId: 'HOTEL-004',
    type: 'CAT_HOTEL',
    coordinates: {
      latitude: 33.5251,
      longitude: 36.2852,
    },
    title: 'بيت القطط للاستضافة',
    governorate: 'دمشق',
    city: 'المالكي',
    address: 'المالكي، دمشق',
    updatedAt: now(),
    metadata: {
      source: 'ADMIN',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'ADMIN',
      ownerName: 'إدارة ResQ',
      phone: '0955007744',
    },
  },
  {
    id: 'MAP:CAFE-005',
    sourceId: 'CAFE-005',
    type: 'CAT_CAFE',
    coordinates: {
      latitude: 33.5124,
      longitude: 36.2914,
    },
    title: 'Cat Corner',
    governorate: 'دمشق',
    city: 'الشعلان',
    address: 'الشعلان، دمشق',
    updatedAt: now(),
    metadata: {
      source: 'USER_REQUEST',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'USER',
      ownerName: 'نور جابر',
      phone: '0999221100',
      email: 'hello@catcorner.example',
    },
  },
  {
    id: 'MAP:ZOO-006',
    sourceId: 'ZOO-006',
    type: 'ZOO',
    coordinates: {
      latitude: 33.468,
      longitude: 36.212,
    },
    title: 'حديقة الحيوانات التعليمية',
    governorate: 'ريف دمشق',
    city: 'قدسيا',
    address: 'قدسيا، ريف دمشق',
    updatedAt: now(),
    metadata: {
      source: 'ADMIN',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'ADMIN',
      ownerName: 'إدارة ResQ',
    },
  },
];

let requests: MapListingRequest[] = [
  {
    id: 'MAP:REQ-101',
    sourceId: 'REQ-101',
    type: 'VET_CLINIC',
    coordinates: {
      latitude: 34.7308,
      longitude: 36.709,
    },
    title: 'عيادة الرحمة البيطرية',
    governorate: 'حمص',
    city: 'الإنشاءات',
    address: 'حي الإنشاءات، حمص',
    updatedAt: now(),
    metadata: {
      source: 'USER_REQUEST',
      reviewStatus: 'PENDING',
      status: 'ACTIVE',
      ownerType: 'USER',
      ownerName: 'سارة الحسن',
      phone: '0944556677',
      description: 'عيادة للحيوانات الأليفة مع قسم إسعاف.',
      submittedAt: now(),
      imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80',
    },
  },
  {
    id: 'MAP:REQ-102',
    sourceId: 'REQ-102',
    type: 'PET_SUPPLIES',
    coordinates: {
      latitude: 35.5317,
      longitude: 35.7901,
    },
    title: 'مخزن أصدقاء الحيوانات',
    governorate: 'اللاذقية',
    city: 'المشروع السابع',
    address: 'المشروع السابع، اللاذقية',
    updatedAt: now(),
    metadata: {
      source: 'USER_REQUEST',
      reviewStatus: 'PENDING',
      status: 'ACTIVE',
      ownerType: 'USER',
      ownerName: 'عمر المصري',
      phone: '0933112211',
      submittedAt: now(),
    },
  },
];

// Organizations and active feeding points are derived from their original records.
async function automaticEntities(): Promise<MapEntity[]> {
  const [orgs, feeding] = await Promise.all([
    getOrganizations({
      search: '',
      page: 1,
      pageSize: 250,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    }),
    getFeedingPoints({
      search: '',
      page: 1,
      pageSize: 250,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    }),
  ]);

  const organizations: MapEntity[] = orgs.items
    .filter(
      (organization) =>
        organization.status === 'ACTIVE' &&
        organization.verificationStatus === 'VERIFIED' &&
        organization.latitude !== undefined &&
        organization.longitude !== undefined,
    )
    .map((organization) => ({
      id: `ORGANIZATION:${organization.id}`,
      sourceId: organization.id,
      type: 'ORGANIZATION',
      coordinates: {
        latitude: organization.latitude!,
        longitude: organization.longitude!,
      },
      title: organization.name,
      subtitle: 'جمعية موثقة',
      governorate: organization.governorate,
      city: organization.city,
      address: organization.address,
      updatedAt: organization.updatedAt,
      metadata: {
        source: 'ORGANIZATION_AUTO',
        reviewStatus: 'APPROVED',
        status: 'ACTIVE',
        ownerType: 'ORGANIZATION',
        ownerName: organization.name,
        phone: organization.phone,
        email: organization.email,
        website: organization.website,
        description: organization.description,
      },
    }));

  const points: MapEntity[] = feeding.items
    .filter((point) => point.status === 'ACTIVE')
    .map((point) => ({
      id: `FEEDING_POINT:${point.id}`,
      sourceId: point.id,
      type: 'FEEDING_POINT',
      coordinates: {
        latitude: point.location.latitude,
        longitude: point.location.longitude,
      },
      title: point.name ?? 'نقطة إطعام',
      subtitle: point.id,
      governorate: point.location.governorate,
      city: point.location.city,
      address: point.location.address,
      updatedAt: point.updatedAt,
      metadata: {
        source: 'FEEDING_POINT_AUTO',
        reviewStatus: 'APPROVED',
        status: 'ACTIVE',
        ownerType: 'SYSTEM',
        ownerName: point.createdBy.name,
        description: point.description,
      },
    }));

  return [
    ...organizations,
    ...points,
  ];
}

export async function getOperationalMapData(): Promise<MapDirectoryData> {
  await mockDelay(90);

  return {
    entities: [
      ...directory.filter(
        (item) => item.metadata.reviewStatus === 'APPROVED',
      ),
      ...(await automaticEntities()),
    ],
    requests: structuredClone(requests),
    generatedAt: now(),
  };
}

export async function createMapListing(input: CreateMapListingInput) {
  await mockDelay(90);

  sequence += 1;

  const id = `MAN-${String(sequence).padStart(3, '0')}`;

  const item: MapEntity = {
    id: `MAP:${id}`,
    sourceId: id,
    type: input.type,
    coordinates: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    title: input.title,
    governorate: input.governorate,
    city: input.city,
    address: input.address,
    updatedAt: now(),
    metadata: {
      source: 'ADMIN',
      reviewStatus: 'APPROVED',
      status: 'ACTIVE',
      ownerType: 'ADMIN',
      ownerName: input.ownerName,
      description: input.description,
      phone: input.phone,
      email: input.email,
      website: input.website,
      openingHours: input.openingHours,
    },
  };

  // Admin-created listings are published directly into the directory.
  directory = [
    item,
    ...directory,
  ];

  return structuredClone(item);
}

export async function approveMapListing(id: string) {
  await mockDelay(70);

  const index = requests.findIndex(
    (item) => item.id === id,
  );

  if (index < 0) {
    throw new Error('MAP_REQUEST_NOT_FOUND');
  }

  const req = requests[index]!;

  const approved: MapEntity = {
    ...req,
    updatedAt: now(),
    metadata: {
      ...req.metadata,
      reviewStatus: 'APPROVED',
    },
  };

  // Keep the original request history while publishing the approved entry.
  requests = requests.map((item, itemIndex) =>
    itemIndex === index
      ? ({
          ...item,
          updatedAt: approved.updatedAt,
          metadata: {
            ...item.metadata,
            reviewStatus: 'APPROVED',
          },
        } as MapListingRequest)
      : item,
  );

  directory = [
    approved,
    ...directory.filter(
      (item) => item.id !== id,
    ),
  ];

  return structuredClone(approved);
}

export async function rejectMapListing(id: string, reason: string) {
  await mockDelay(70);

  requests = requests.map((item) =>
    item.id === id
      ? ({
          ...item,
          updatedAt: now(),
          metadata: {
            ...item.metadata,
            reviewStatus: 'REJECTED',
            rejectionReason: reason,
          },
        } as MapListingRequest)
      : item,
  );

  return true;
}

export async function toggleMapListing(id: string) {
  await mockDelay(60);

  directory = directory.map((item) =>
    item.id === id
      ? {
          ...item,
          updatedAt: now(),
          metadata: {
            ...item.metadata,
            status:
              item.metadata.status === 'ACTIVE'
                ? 'INACTIVE'
                : 'ACTIVE',
          },
        }
      : item,
  );

  return true;
}

export async function deleteMapListing(id: string) {
  await mockDelay(60);

  // Remove the entry from both collections in case it originated from a request.
  directory = directory.filter(
    (item) => item.id !== id,
  );

  requests = requests.filter(
    (item) => item.id !== id,
  );

  return true;
}