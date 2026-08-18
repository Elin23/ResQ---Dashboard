import type { MapEntity } from '@/features/map/types';
export type MapCanvasProps={entities:MapEntity[];selectedId?:string;onSelect:(entity:MapEntity)=>void;fitNonce:number;focusEntity?:MapEntity;compact?:boolean};
