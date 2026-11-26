import { METRIC_KEYS, type GameState } from './engine/types';
import { EVENTS } from './engine/content';
import { initialDepartments, validDepartments } from './engine/departments';
import { seedEmployees, syncDepartments, validEmployees } from './engine/employees';
import { validMeetings } from './engine/meetings';
import { validCommunications } from './engine/communications';
import { validProgrammes } from './engine/programmes';
import { initialFinance, validFinance } from './engine/finance';
import { initialOS, validOS } from './engine/os';
import { initialAgents, validAgents } from './engine/agents';
import { validIncidentHistory } from './engine/incidents';
import { initialCampaign, validCampaign, dailyCapacity } from './engine/campaign';
export const SAVE_KEY='nothing-sim:v1';
const int=(n:unknown,min=0,max=Number.MAX_SAFE_INTEGER):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function decodeSave(raw:string):GameState | null {
  try {
    const v:unknown=JSON.parse(raw);
    if(!obj(v)||(v.version!==1&&v.version!==2&&v.version!==3&&v.version!==4&&v.version!==5&&v.version!==6&&v.version!==7&&v.version!==8&&v.version!==9&&v.version!==10&&v.version!==11)||!int(v.seed,0,4294967295)||!int(v.rng,0,4294967295)||!int(v.day,1)||!int(v.cash,-Number.MAX_SAFE_INTEGER)||!int(v.capacity,0,v.version===11?4:2)||!int(v.compensation)) return null;
    const m=v.metrics;
    if(!obj(m)||!METRIC_KEYS.every(k=>int(m[k],0,100))) return null;
    if(v.pendingEvent!==null&&!EVENTS.some(e=>e.id===v.pendingEvent)) return null;
    if(![null,'insolvent','useful','board','certified'].includes(v.ending as string|null)) return null;
    if(!Array.isArray(v.log)||!v.log.every(x=>typeof x==='string')||!Array.isArray(v.resolvedEvents)||!v.resolvedEvents.every(x=>EVENTS.some(e=>e.id===x))) return null;
    if(!Array.isArray(v.ledger)||!v.ledger.every(x=>obj(x)&&int(x.day,1)&&typeof x.label==='string'&&int(x.amount,-Number.MAX_SAFE_INTEGER))) return null;
    if(!Array.isArray(v.scheduled)||!v.scheduled.every(x=>obj(x)&&int(x.day,1)&&typeof x.message==='string'&&obj(x.effect)&&Object.entries(x.effect).every(([k,n])=>([...METRIC_KEYS,'cash','compensation'] as string[]).includes(k)&&int(n,-Number.MAX_SAFE_INTEGER)))) return null;
    const finance=initialFinance(v.day,v.cash,Number(m.confidence));
    const departments=v.version===1?initialDepartments():v.departments;
    if(!validDepartments(departments))return null;
    if(v.version===1||v.version===2){
      const staff=seedEmployees(v.seed,departments,v.day);
      return {...v,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS(),finance,programmes:[],communications:[],nextCommunicationId:1,meetings:[],nextMeetingId:1,...staff,departments:syncDepartments(departments,staff.employees)} as unknown as GameState;
    }
    if(!validEmployees(v.employees,v.relationships,v.nextEmployeeId,departments))return null;
    const state=v as unknown as GameState;
    if(v.version===3)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS(),finance,programmes:[],meetings:[],nextMeetingId:1,communications:[],nextCommunicationId:1};
    if(!validMeetings(v.meetings,v.nextMeetingId,state.employees))return null;
    if(v.version===4)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS(),finance,programmes:[],communications:[],nextCommunicationId:1};
    if(!validCommunications(v.communications,v.nextCommunicationId,state.employees))return null;
    if(v.version===5)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS(),finance,programmes:[]};
    if(!validProgrammes(v.programmes,state.employees,state.meetings))return null;
    if(v.version===6)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS(),finance};
    if(!validFinance(v.finance))return null;
    if(v.version===7)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents(),os:initialOS()};
    if(!validOS(v.os))return null;
    if(v.version===8)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[],agents:initialAgents()};
    if(!validAgents(v.agents)||(state.os.power==='offline'&&state.agents.lastTokens!==0))return null;
    if(v.version===9)return {...state,version:11,campaign:initialCampaign(),incidentHistory:[]};
    if(!validIncidentHistory(v.incidentHistory,state.resolvedEvents,state.day))return null;
    if(v.version===10)return {...state,version:11,campaign:initialCampaign()};
    if(!validCampaign(v.campaign,state.day)||state.capacity>dailyCapacity(state)||(state.ending==='certified'&&(state.campaign.stage!==7||state.campaign.mode!=='campaign')))return null;
    return state;
  } catch { return null; }
}
export function loadGame():GameState|null { try {const raw=localStorage.getItem(SAVE_KEY);return raw?decodeSave(raw):null;}catch{return null;} }
export function saveGame(s:GameState):boolean {try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}

const PROFILE_KEY='nothing-sim:campaign-profile';
export function loadHighestStage():number{try{const n=Number(localStorage.getItem(PROFILE_KEY));return Number.isInteger(n)&&n>=1&&n<=7?n:1;}catch{return 1;}}
export function saveHighestStage(stage:number):boolean{try{localStorage.setItem(PROFILE_KEY,String(Math.max(loadHighestStage(),stage)));return true;}catch{return false;}}
