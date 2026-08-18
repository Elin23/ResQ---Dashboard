import { Clock3, MapPinCheck, PauseCircle, RefreshCw } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import type { FeedingPointFilters, FeedingPointSummary } from '../types';

const cards = [
  { key:'pendingPoints' as const, label:'طلبات نقاط جديدة', icon:Clock3, filter:{status:'PENDING'} satisfies Partial<FeedingPointFilters> },
  { key:'pendingRefills' as const, label:'تعبئات تنتظر التحقق', icon:RefreshCw, filter:{pendingRefills:true} satisfies Partial<FeedingPointFilters> },
  { key:'activePoints' as const, label:'النقاط النشطة', icon:MapPinCheck, filter:{status:'ACTIVE'} satisfies Partial<FeedingPointFilters> },
  { key:'inactivePoints' as const, label:'النقاط المعطلة', icon:PauseCircle, filter:{status:'INACTIVE'} satisfies Partial<FeedingPointFilters> },
];

export function FeedingPointSummaryCards({summary,loading,onFilter}:{summary?:FeedingPointSummary;loading:boolean;onFilter:(patch:Partial<FeedingPointFilters>)=>void}){
  return <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({key,label,icon:Icon,filter})=><button key={key} type="button" onClick={()=>onFilter({...filter,page:1})} className="group rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"><Card className="h-[94px] rounded-xl border-border/45 bg-white p-3.5 shadow-none transition-[border-color,background-color] duration-200 group-hover:border-primary/25 group-hover:bg-primary/[0.025]"><div className="flex items-start justify-between gap-3"><div><p className="text-[12px] text-muted-foreground transition-colors group-hover:text-foreground">{label}</p>{loading?<Skeleton className="mt-3 h-7 w-12"/>:<p className="mt-2 text-[1.55rem] font-semibold leading-none tracking-tight transition-colors group-hover:text-primary">{summary?.[key]??0}</p>}</div><span className="grid size-8 place-items-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-4" strokeWidth={1.7}/></span></div></Card></button>)}</div>;
}
