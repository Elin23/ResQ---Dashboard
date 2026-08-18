import { Building2, Cat, Hotel, PawPrint, Pill, ShoppingBag, Stethoscope, Utensils, type LucideIcon } from 'lucide-react';
import type { MapEntityType, MapLayerKey } from '../types';
export type MapLayerConfig={key:MapLayerKey;label:string;description:string;icon:LucideIcon;defaultVisible:boolean};
export const mapLayerConfigs:MapLayerConfig[]=[
 {key:'PET_SUPPLIES',label:'مستلزمات الحيوانات',description:'متاجر الطعام والمستلزمات والعناية',icon:ShoppingBag,defaultVisible:true},
 {key:'VET_CLINIC',label:'عيادات بيطرية',description:'عيادات وخدمات بيطرية ظاهرة للعامة',icon:Stethoscope,defaultVisible:true},
 {key:'ANIMAL_PHARMACY',label:'مستودعات وأدوية',description:'صيدليات ومستودعات أدوية بيطرية',icon:Pill,defaultVisible:true},
 {key:'CAT_HOTEL',label:'فنادق الحيوانات',description:'أماكن استضافة ورعاية مؤقتة',icon:Hotel,defaultVisible:true},
 {key:'CAT_CAFE',label:'مقاهي القطط',description:'مقاهٍ ومساحات تفاعل مع القطط',icon:Cat,defaultVisible:true},
 {key:'ZOO',label:'حدائق الحيوان',description:'حدائق ومرافق مشاهدة الحيوانات',icon:PawPrint,defaultVisible:true},
 {key:'ORGANIZATION',label:'الجمعيات',description:'الجمعيات الموثقة تسجل تلقائيًا',icon:Building2,defaultVisible:true},
 {key:'FEEDING_POINT',label:'نقاط الإطعام',description:'نقاط الإطعام المنشورة',icon:Utensils,defaultVisible:true},
];
export const entityTypeLabels:Record<MapEntityType,string>={PET_SUPPLIES:'مستلزمات حيوانات',VET_CLINIC:'عيادة بيطرية',ANIMAL_PHARMACY:'مستودع أدوية',CAT_HOTEL:'فندق حيوانات',CAT_CAFE:'مقهى قطط',ZOO:'حديقة حيوان',ORGANIZATION:'جمعية',FEEDING_POINT:'نقطة إطعام'};
export const syrianGovernorates=['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','درعا','السويداء','القنيطرة','دير الزور','الرقة','الحسكة'] as const;
