import{safeFormatDate}from'@/lib/runtime-safety';
export function slugifyTitle(title:string){return String(title??'').normalize('NFKD').replace(/[؀-ۿ]/g,'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||`content-${Date.now()}`;}
export function formatEditorialDate(value?:string){return safeFormatDate(value,{dateStyle:'medium',timeStyle:'short'});}
export function normalizeTags(tags:string[]){return[...new Set((Array.isArray(tags)?tags:[]).map(x=>String(x??'').trim()).filter(Boolean))].slice(0,8);}
