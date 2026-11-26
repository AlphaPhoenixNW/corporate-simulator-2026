import type {GameState} from '../engine/types';
import {ACHIEVEMENTS} from '../engine/achievements';
import {DEPARTMENTS} from '../engine/departments';
import {EVENTS} from '../engine/content';
import {STAGES} from '../engine/campaign';
export interface Notice {id:string;kind:'award'|'incident'|'stage'|'warning'|'ending';title:string;detail:string;target:string}
export function collectNotices(previous:GameState,next:GameState):Notice[]{
 if(next.day<previous.day||next.seed!==previous.seed)return [];
 const items:Notice[]=[];
 if(next.campaign.stage>previous.campaign.stage)items.push({id:'stage-'+next.campaign.stage,kind:'stage',title:'Expansion authorised',detail:STAGES[next.campaign.stage-1].name,target:'campaign'});
 if(next.pendingEvent&&next.pendingEvent!==previous.pendingEvent)items.push({id:'incident-'+next.day,kind:'incident',title:'Executive decision required',detail:EVENTS.find(e=>e.id===next.pendingEvent)?.title??'Corporate incident',target:'pending-decision'});
 const prior=new Set(previous.achievements.unlocked.map(a=>a.id));
 for(const u of next.achievements.unlocked)if(!prior.has(u.id)){const a=ACHIEVEMENTS.find(x=>x.id===u.id);if(a)items.push({id:'award-'+u.id,kind:'award',title:'Recognition authorised',detail:a.name,target:'achievements'});}
 if(next.boss.phase==='promotion'&&previous.boss.phase==='dormant')items.push({id:'threat-'+next.day,kind:'warning',title:'Critical operational competence',detail:'Board-mandated containment required.',target:'containment'});
 if(next.ending&&!previous.ending)items.push({id:'ending-'+next.day,kind:'ending',title:next.ending==='certified'?'Final certification achieved':'Simulation concluded',detail:'Review the board notification.',target:'board-notification'});
 return items;
}
export function cashHistory(s:GameState){const recorded=s.finance.market.slice(-19).map(p=>({day:p.day,value:p.cash}));return [...recorded,{day:s.day,value:s.cash}];}
export function chartPoints(values:number[],width=300,height=90,pad=10){
 if(!values.length)return [];
 const min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min);
 return values.map((v,i)=>({x:pad+i*(width-2*pad)/Math.max(1,values.length-1),y:max===min?height/2:height-pad-(v-min)*(height-2*pad)/range}));
}
export function organisation(s:GameState){
 return s.departments.map(d=>({id:d.id,name:DEPARTMENTS[d.id].name,active:d.active,focus:d.focus,employees:s.employees.filter(e=>e.department===d.id&&e.status==='active'),request:d.request}));
}
export interface Preferences {reduced:boolean;audio:boolean;music:boolean;effects:boolean;volume:number;effectsVolume:number}
export const DEFAULT_PREFERENCES:Preferences={reduced:false,audio:false,music:true,effects:true,volume:35,effectsVolume:35};
const level=(v:unknown,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(100,Math.max(0,Math.round(v))):fallback;
export function decodePreferences(raw:string|null):Preferences{
 try{const v=JSON.parse(raw??'null');if(!v||typeof v!=='object')return {...DEFAULT_PREFERENCES};
 return {reduced:typeof v.reduced==='boolean'?v.reduced:false,audio:typeof v.audio==='boolean'?v.audio:false,music:typeof v.music==='boolean'?v.music:true,effects:typeof v.effects==='boolean'?v.effects:true,volume:level(v.volume,35),effectsVolume:level(v.effectsVolume,level(v.volume,35))};}catch{return {...DEFAULT_PREFERENCES};}
}
const KEY='nothing-sim:experience';
export function loadPreferences(){try{return decodePreferences(localStorage.getItem(KEY));}catch{return {...DEFAULT_PREFERENCES};}}
export function savePreferences(p:Preferences){try{localStorage.setItem(KEY,JSON.stringify(p));}catch{/* optional presentation preference */}}
