import { EVENTS } from './content';
import type {CorporateEvent,GameState,IncidentDecision,IncidentCategory,IncidentSystem,Delta} from './types';
export const CATEGORY_NAMES:Record<IncidentCategory,string>={
  people:'People and HR',engineering:'Engineering',finance:'Finance and capital',sales:'Sales and customers',
  compliance:'Legal and compliance',marketing:'Marketing and communications',meetings:'Meetings and governance',
  transformation:'Transformation programmes',executive:'Executive leadership',os:'NOTHING™ OS',agents:'Agentic AI',strategy:'Corporate strategy',general:'General corporate affairs'
};
const systemReady=(s:GameState,system:IncidentSystem):boolean=>{
  switch(system){
    case 'staff':return s.employees.some(e=>e.status==='active');
    case 'customers':return s.finance.subscribers>0||s.departments.some(d=>d.id==='sales'&&d.active);
    case 'exposure':return s.metrics.regulation>=25||s.departments.some(d=>d.id==='legal'&&d.active);
    case 'social':return s.communications.some(c=>c.type==='social');
    case 'meetings':return s.meetings.some(m=>m.status==='held')||s.metrics.meetings>=25;
    case 'programmes':return s.programmes.length>0;
    case 'os':return s.os.boots>0;
    case 'agents':return s.agents.totalRuns>0;
  }
};
export function eventEligible(s:GameState,e:CorporateEvent):boolean{
  if(e.department&&!s.departments.some(d=>d.id===e.department&&d.active))return false;
  const t=e.trigger;
  if(!t)return true;
  if(t.minDay!==undefined&&s.day<t.minDay)return false;
  if(t.system&&!systemReady(s,t.system))return false;
  if(t.after&&!s.incidentHistory.some(h=>h.eventId===t.after!.eventId&&h.choiceId===t.after!.choiceId&&s.day>=h.day+t.after!.days))return false;
  return true;
}
// Prioritise due, unseen narrative continuations. Standalone events recycle only after all eligible unseen events are exhausted.
export function incidentPool(s:GameState,events:CorporateEvent[]=EVENTS):CorporateEvent[]{
  const eligible=events.filter(e=>eventEligible(s,e));
  const resolved=new Set(s.resolvedEvents);
  const unseen=eligible.filter(e=>!resolved.has(e.id));
  const continuations=unseen.filter(e=>e.trigger?.after);
  return continuations.length?continuations:unseen.length?unseen:eligible.filter(e=>!e.trigger?.after);
}
export function selectIncident(s:GameState,roll:number,events:CorporateEvent[]=EVENTS):CorporateEvent|null{
  const pool=incidentPool(s,events);
  return pool.length?pool[Math.min(pool.length-1,Math.max(0,Math.floor(roll*pool.length)))]:null;
}
export function validIncidentHistory(value:unknown,resolved:string[],day:number):value is IncidentDecision[]{
  if(!Array.isArray(value))return false;
  let previous=0;
  for(const h of value){
    if(!h||typeof h!=='object'||typeof h.eventId!=='string'||typeof h.choiceId!=='string'||!Number.isSafeInteger(h.day)||h.day<1||h.day<previous||h.day>day||!resolved.includes(h.eventId)||!EVENTS.some(e=>e.id===h.eventId&&e.choices.some(c=>c.id===h.choiceId)))return false;
    previous=h.day;
  }
  return true;
}
const EFFECT_NAMES:Record<keyof Delta,string>={confidence:'Confidence',prestige:'Prestige',morale:'Morale',bureaucracy:'Bureaucracy',perceived:'Perceived productivity',actual:'Actual productivity',buzzwords:'Buzzwords',meetings:'Meeting saturation',regulation:'Regulatory exposure',incompetence:'Incompetence',cash:'Cash',compensation:'Compensation'};
export function describeEffects(delta:Delta):string{
  return (Object.keys(delta) as (keyof Delta)[]).filter(k=>delta[k]!==0).map(k=>{
    const n=delta[k]??0;
    return EFFECT_NAMES[k]+' '+(n<0?'−':'+')+(k==='cash'||k==='compensation'?'£':'')+Math.abs(n).toLocaleString('en-GB');
  }).join(' · ');
}
