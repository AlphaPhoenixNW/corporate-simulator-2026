import { ACTIONS, EVENTS } from './content';
import { METRIC_KEYS, type GameState, type Command, type Delta } from './types';
import { initialDepartments, changeDepartment, runDepartments } from './departments';
import { seedEmployees, syncDepartments, payrollByDepartment, reconcileStaffing, changeEmployee, runEmployees } from './employees';
import { changeMeeting, runMeetings } from './meetings';
import { changeCommunication, runCommunications, generateCommunication } from './communications';
import { changeProgramme, runProgrammes } from './programmes';
export const DAILY_CAPACITY = 2;
const clamp = (n:number) => Math.max(0,Math.min(100,n));
export function random(rng:number): [number,number] {
  const next = (Math.imul(1664525,rng) + 1013904223) >>> 0;
  return [next,next / 4294967296];
}
export function newGame(seed=2026): GameState {
  const normalized = seed >>> 0;
  const staff=seedEmployees(normalized,initialDepartments(),1);
  return {version:6,programmes:[],communications:[],nextCommunicationId:1,meetings:[],nextMeetingId:1,...staff,departments:syncDepartments(initialDepartments(),staff.employees),seed:normalized,rng:normalized,day:1,cash:75000,capacity:DAILY_CAPACITY,compensation:0,
    metrics:{confidence:55,prestige:20,morale:70,bureaucracy:15,perceived:25,actual:12,buzzwords:20,meetings:10,regulation:10,incompetence:25},
    pendingEvent:null,resolvedEvents:[],scheduled:[],log:['Day 1: NOTHING™ incorporated. No product roadmap has been approved.'],ledger:[],ending:null};
}
function record(s:GameState,label:string,amount:number) {
  if (!amount) return;
  s.cash += amount;
  s.ledger = [...s.ledger,{day:s.day,label,amount}].slice(-200);
}
function apply(s:GameState,delta:Delta,label:string) {
  for(const key of METRIC_KEYS) s.metrics[key] = clamp(s.metrics[key] + (delta[key] ?? 0));
  record(s,label,delta.cash ?? 0);
  s.compensation += delta.compensation ?? 0;
}
function log(s:GameState,message:string) { s.log = [`Day ${s.day}: ${message}`,...s.log].slice(0,100); }
function checkEnding(s:GameState) {
  if(s.cash<=0) s.ending='insolvent';
  else if(s.metrics.actual>=70) s.ending='useful';
  else if(s.metrics.confidence<=0) s.ending='board';
}
export function dispatch(state:GameState,command:Command):GameState {
  if(state.ending) return state;
  const s:GameState = {...state,metrics:{...state.metrics}};
  const nextRandom=()=>{const [next,value]=random(s.rng);s.rng=next;return value;};
  if(command.type==='action'){
    const a=ACTIONS.find(x=>x.id===command.id);
    if(!a || s.capacity<1 || s.cash<a.cost || s.pendingEvent) return state;
    s.capacity--;
    record(s,a.label,-a.cost);
    apply(s,a.effect,a.label);
    log(s,a.label+' completed. An outcome is not anticipated.');
    if(a.id==='statement'||a.id==='consultants'){
      s.communications=[...s.communications,generateCommunication(s,a.id==='statement'?'announcement':'consultancy',s.nextCommunicationId++,nextRandom)];
    }
  } else if(command.type==='department'){
    const result=changeDepartment(s,command);
    if(!result)return state;
    s.capacity--;
    const staffing=reconcileStaffing(s,result.departments,command.id);
    if(!staffing)return state;
    s.employees=staffing.employees;s.nextEmployeeId=staffing.nextEmployeeId;
    s.departments=syncDepartments(result.departments,s.employees);
    record(s,result.message,-result.cost-staffing.cost);
    log(s,result.message);
  } else if(command.type==='employee'){
    const result=changeEmployee(s,command);
    if(!result)return state;
    s.capacity--;s.employees=result.employees;
    s.departments=syncDepartments(s.departments,s.employees);
    record(s,result.message,-result.cost);
    apply(s,result.delta,result.message);log(s,result.message);
    if(command.operation==='review'){
      const employee=s.employees.find(e=>e.id===command.id);
      s.communications=[...s.communications,generateCommunication(s,'performance-review',s.nextCommunicationId++,nextRandom,undefined,employee)];
    }
  } else if(command.type==='meeting'){
    const result=changeMeeting(s,command);
    if(!result)return state;
    s.capacity--;s.meetings=result.meetings;s.nextMeetingId=result.nextMeetingId;
    log(s,result.message);
  } else if(command.type==='communication'){
    const result=changeCommunication(s,command,nextRandom);
    if(!result)return state;
    s.capacity-=result.capacity;s.communications=result.communications;s.nextCommunicationId=result.nextCommunicationId;
    record(s,result.message,-result.cost);apply(s,result.delta,result.message);log(s,result.message);
  } else if(command.type==='programme'){
    const result=changeProgramme(s,command);
    if(!result)return state;
    s.capacity--;s.programmes=result.programmes;s.meetings=result.meetings;s.nextMeetingId=result.nextMeetingId;
    record(s,result.message,-result.cost);apply(s,result.delta,result.message);log(s,result.message);
    if(command.operation==='commission')s.communications=[...s.communications,{...generateCommunication(s,'transformation',s.nextCommunicationId++,nextRandom),subject:result.message}];
  } else if(command.type==='choose'){
    const e=EVENTS.find(x=>x.id===s.pendingEvent);
    const c=e?.choices.find(x=>x.id===command.id);
    if(!e || !c) return state;
    apply(s,c.effect,e.title);
    if(c.delayed) s.scheduled=[...s.scheduled,{day:s.day+c.delayed.days,effect:c.delayed.effect,message:c.delayed.message}];
    s.resolvedEvents=[...s.resolvedEvents,e.id];
    s.pendingEvent=null;
    log(s,c.label);
  } else {
    if(s.pendingEvent) return state;
    const m=s.metrics;
    const [rng,roll]=random(s.rng); s.rng=rng;
    record(s,'Predictive savings revenue',Math.round(350+m.perceived*8+m.confidence*5));
    record(s,'Operating expenditure',-Math.round(850+m.bureaucracy*4+m.meetings*3));
    apply(s,{actual:Math.max(-4,Math.round(4+roll*3+m.morale/30-m.meetings/12-m.bureaucracy/18)),
      morale:-1,meetings:-3,perceived:-2,confidence:m.perceived>=45?2:-2,regulation:m.buzzwords>=80?2:0},'Daily operations');
    const calendar=runMeetings(s.meetings,s.nextMeetingId,s.employees,s.day,()=>{const [next,value]=random(s.rng);s.rng=next;return value;});
    s.meetings=calendar.meetings;s.nextMeetingId=calendar.nextMeetingId;s.employees=calendar.employees;
    for(const cost of calendar.costs)record(s,cost.label,cost.amount);
    apply(s,calendar.delta,'Meeting outcomes');for(const report of calendar.reports)log(s,report);
    const daily=runDepartments(s.departments,()=>{const [next,value]=random(s.rng);s.rng=next;return value;},payrollByDepartment(s.employees),s.employees,calendar.minutes);
    s.departments=daily.departments;
    for(const entry of daily.costs)record(s,entry.label,entry.amount);
    apply(s,daily.delta,'Departmental operating results');
    for(const report of daily.reports)log(s,report);
    const people=runEmployees(s.employees,s.relationships,s.departments,s.day,()=>{const [next,value]=random(s.rng);s.rng=next;return value;},calendar.minutes);
    s.employees=people.employees;s.relationships=people.relationships;
    s.departments=syncDepartments(s.departments,s.employees);
    apply(s,people.delta,'Employee activity');for(const report of people.reports)log(s,report);
    const portfolio=runProgrammes(s,calendar.minutes,nextRandom);
    s.programmes=portfolio.programmes;for(const cost of portfolio.costs)record(s,cost.label,cost.amount);
    apply(s,portfolio.delta,'Transformation portfolio');for(const report of portfolio.reports)log(s,report);
    const comms=runCommunications(s,nextRandom);
    s.communications=comms.communications;s.nextCommunicationId=comms.nextCommunicationId;
    apply(s,comms.delta,'Corporate communications');for(const report of comms.reports)log(s,report);
    log(s,'Daily operations reconciled. No further alignment required until tomorrow.');
    s.day++; s.capacity=DAILY_CAPACITY;
    const due=s.scheduled.filter(x=>x.day<=s.day);
    s.scheduled=s.scheduled.filter(x=>x.day>s.day);
    for(const effect of due){apply(s,effect.effect,effect.message);log(s,effect.message);}
    if(s.day%3===2){
      const eligible=EVENTS.filter(e=>!e.department||s.departments.some(d=>d.id===e.department&&d.active));
      const unused=eligible.filter(e=>!s.resolvedEvents.includes(e.id));
      const pool=unused.length?unused:eligible;
      const [next,value]=random(s.rng); s.rng=next;
      s.pendingEvent=pool[Math.floor(value*pool.length)].id;
    }
  }
  checkEnding(s);
  return s;
}
