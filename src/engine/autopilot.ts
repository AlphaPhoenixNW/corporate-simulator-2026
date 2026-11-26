import {newGame,dispatch} from './simulation';
import {nextCommand} from './autopilotStrategy';
import type {GameState} from './types';
export const MAX_AUTOMATED_ATTEMPTS=1000000;
export const AUTOPILOT_DAY_LIMIT=180;
export type AutoMode='watch'|'batch';
export type Outcome='certified'|'failed'|'bounded';
export interface AutoResult {seed:number;outcome:Outcome;day:number;commands:number;compensation:number;cash:number}
export interface AutoProgress {seed:number;day:number;commands:number;compensation:number;cash:number;actual:number;perceived:number}
export interface AutoAttempt {state:GameState;commands:number;done:AutoResult|null}
export function attemptSeed(index:number){return (2026+index)>>>0;}
export function createAttempt(index:number):AutoAttempt{return {state:newGame(attemptSeed(index),{mode:'campaign',difficulty:'standard',scenario:'founder'}),commands:0,done:null};}
export function progress(a:AutoAttempt):AutoProgress{
 const s=a.state;return {seed:s.seed,day:s.day,commands:a.commands,compensation:s.compensation,cash:s.cash,actual:s.metrics.actual,perceived:s.metrics.perceived};
}
export function stepAttempt(a:AutoAttempt):AutoAttempt{
 if(a.done)return a;
 const s=a.state;
 // Every accepted action uses the real public simulation dispatcher. A rejected
 // policy decision falls back to a legal day settlement, never to forged state.
 let next=dispatch(s,nextCommand(s));
 if(next===s)next=dispatch(s,{type:'endDay'});
 const commands=a.commands+(next!==s?1:0);
 const outcome:Outcome|null=next.ending==='certified'?'certified':next.ending?'failed':next===s||next.day>AUTOPILOT_DAY_LIMIT||commands>=AUTOPILOT_DAY_LIMIT*8?'bounded':null;
 return {state:next,commands,done:outcome?{seed:next.seed,outcome,day:next.day,commands,compensation:next.compensation,cash:next.cash}:null};
}
export function runAttempt(index:number):AutoResult{
 let a=createAttempt(index);while(!a.done)a=stepAttempt(a);return a.done;
}
export interface AutoProfile {version:1;attempts:number;certified:number;failed:number;bounded:number;commands:number;days:number;compensation:number;last:AutoResult|null;goal:number;mode:AutoMode}
export const EMPTY_AUTOPILOT:AutoProfile={version:1,attempts:0,certified:0,failed:0,bounded:0,commands:0,days:0,compensation:0,last:null,goal:0,mode:'batch'};
export const AUTO_KEY='nothing-sim:autopilot:v1';
const natural=(n:unknown,max=Number.MAX_SAFE_INTEGER):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max;
export function decodeAutopilot(raw:string|null):AutoProfile{
 try{
 const p=JSON.parse(raw??'null') as AutoProfile|null;
 if(!p||p.version!==1||!natural(p.attempts,MAX_AUTOMATED_ATTEMPTS)||!natural(p.certified,p.attempts)||!natural(p.failed,p.attempts)||!natural(p.bounded,p.attempts)||p.certified+p.failed+p.bounded!==p.attempts||!natural(p.commands)||!natural(p.days)||!natural(p.compensation)||!natural(p.goal,MAX_AUTOMATED_ATTEMPTS)||p.goal<p.attempts||!['watch','batch'].includes(p.mode))return {...EMPTY_AUTOPILOT};
 if(p.attempts===0?p.last!==null:!p.last||p.last.seed!==attemptSeed(p.attempts-1)||!['certified','failed','bounded'].includes(p.last.outcome)||!natural(p.last.day,AUTOPILOT_DAY_LIMIT+1)||!natural(p.last.commands,AUTOPILOT_DAY_LIMIT*8)||!natural(p.last.compensation)||!Number.isSafeInteger(p.last.cash))return {...EMPTY_AUTOPILOT};
 return p;
 }catch{return {...EMPTY_AUTOPILOT};}
}
export function loadAutopilot(){try{return decodeAutopilot(localStorage.getItem(AUTO_KEY));}catch{return {...EMPTY_AUTOPILOT};}}
export function saveAutopilot(p:AutoProfile){try{localStorage.setItem(AUTO_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function recordAttempt(p:AutoProfile,r:AutoResult):AutoProfile{
 if(p.attempts>=p.goal||p.attempts>=MAX_AUTOMATED_ATTEMPTS||r.seed!==attemptSeed(p.attempts))return p;
 return {...p,attempts:p.attempts+1,[r.outcome]:p[r.outcome]+1,commands:p.commands+r.commands,days:p.days+r.day,compensation:p.compensation+r.compensation,last:r};
}
export const AUTO_AWARDS=[
 {id:'first',name:'Delegation Nation',description:'Complete the first automated campaign attempt.',test:(p:AutoProfile)=>p.attempts>=1},
 {id:'redundant',name:'The Executive Is Redundant',description:'Achieve one automated final certification.',test:(p:AutoProfile)=>p.certified>=1},
 {id:'hundred',name:'Management Without Attendance',description:'Complete 100 automated campaign attempts.',test:(p:AutoProfile)=>p.attempts>=100},
 {id:'thousand',name:'Industrialised Inactivity',description:'Complete 1,000 automated campaign attempts.',test:(p:AutoProfile)=>p.attempts>=1000},
 {id:'singularity',name:'The Singularity of Nothingness',description:'Complete 100,000 automated campaign attempts.',test:(p:AutoProfile)=>p.attempts>=100000},
 {id:'million',name:'One Million Instances of Nothing',description:'Complete 1,000,000 automated campaign attempts.',test:(p:AutoProfile)=>p.attempts>=1000000}
] as const;
