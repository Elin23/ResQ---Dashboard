export const mapEntityTypes = ['PET_SUPPLIES','VET_CLINIC','ANIMAL_PHARMACY','CAT_HOTEL','CAT_CAFE','ZOO','ORGANIZATION','FEEDING_POINT'] as const;
export type MapEntityType = (typeof mapEntityTypes)[number];
export type MapLayerKey = MapEntityType;
export type MapCoordinates = { latitude:number; longitude:number };
export type MapListingSource = 'USER_REQUEST'|'ADMIN'|'ORGANIZATION_AUTO'|'FEEDING_POINT_AUTO';
export type MapListingReviewStatus = 'PENDING'|'APPROVED'|'REJECTED';
export type MapListingStatus = 'ACTIVE'|'INACTIVE';

export type MapEntity = {
  id:string;
  sourceId:string;
  type:MapEntityType;
  coordinates:MapCoordinates;
  title:string;
  subtitle?:string;
  governorate:string;
  city?:string;
  address:string;
  updatedAt:string;
  metadata:{
    source:MapListingSource;
    reviewStatus:MapListingReviewStatus;
    status:MapListingStatus;
    description?:string;
    phone?:string;
    email?:string;
    website?:string;
    openingHours?:string;
    ownerName?:string;
    ownerType?:'USER'|'ORGANIZATION'|'ADMIN'|'SYSTEM';
    imageUrl?:string;
    rejectionReason?:string;
    submittedAt?:string;
  };
};

export type MapListingRequest = MapEntity & {
  metadata: MapEntity['metadata'] & { source:'USER_REQUEST'; reviewStatus:'PENDING'|'REJECTED'|'APPROVED'; ownerType:'USER' };
};

export type MapFilters = { search:string; governorate?:string; type?:MapEntityType };
export type MapDirectoryData = { entities:MapEntity[]; requests:MapListingRequest[]; generatedAt:string };
export type CreateMapListingInput = {
  type:Exclude<MapEntityType,'ORGANIZATION'|'FEEDING_POINT'>;
  title:string;
  governorate:string;
  city?:string;
  address:string;
  latitude:number;
  longitude:number;
  description?:string;
  phone?:string;
  email?:string;
  website?:string;
  openingHours?:string;
  ownerName:string;
};
