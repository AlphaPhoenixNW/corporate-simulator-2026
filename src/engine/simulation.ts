import { ACTIONS, EVENTS } from './content';
import { METRIC_KEYS, type GameState, type Command, type Delta, type CashCategory, type GameOptions } from './types';
import { initialDepartments, changeDepartment, runDepartments } from './departments';
import { seedEmployees, syncDepartments, payrollByDepartment, reconcileStaffing, changeEmployee, runEmployees } from './employees';
import { changeMeeting, runMeetings } from './meetings';
import { changeCommunication, runCommunications, generateCommunication } from './communications';
import { changeProgramme, runProgrammes } from './programmes';
import { initialFinance, trackCash, changeFinance, runFinance, closeFinanceDay } from './finance';
import { initialOS, changeOS, runOS } from './os';
import { initialAgents, changeAgents, runAgents } from './agents';
import { selectIncident } from './incidents';
import {initialCampaign,DIFFICULTIES,SCENARIOS,dailyCapacity,actualLimit,campaignOverhead,campaignEligibility,advanceCampaign,STAGES} from './campaign';
import {initialBoss,spawnBoss,changeBoss,runBoss,protectedBoss} from './boss';
import {initialAchievements,updateAchievements} from './achievements';
export const DAILY_CAPACITY = 2;
const clamp = (n:number) => Math.max(0,Math.min(100,n));
export function random(rng:number): [number,number] {
  const next = (Math.imul(1664525,rng) + 1013904223) >>> 0;
  return [next,next / 4294967296];
}
export function newGame(seed=2026,options:GameOptions={}): GameState {
  const normalized = seed >>> 0;
  const staff=seedEmployees(normalized,initialDepartments(),1);
  const campaign=initialCampaign(options),scenario=SCENARIOS[campaign.scenario],cash=Math.round(scenario.cash*DIFFICULTIES[campaign.difficulty].cashMultiplier);
  return {version:13,achievements:initialAchievements(),boss:initialBoss(),campaign,incidentHistory:[],agents:initialAgents(),os:initialOS(),finance:initialFinance(1,cash,scenario.metrics.confidence??55),programmes:[],communications:[],nextCommunicationId:1,meetings:[],nextMeetingId:1,...staff,departments:syncDepartments(initialDepartments(),staff.employees),seed:normalized,rng:normalized,day:1,cash,capacity:DAILY_CAPACITY,compensation:0,
    metrics:{confidence:55,prestige:20,morale:70,bureaucracy:15,perceived:25,actual:12,buzzwords:20,meetings:10,regulation:10,incompetence:25,...scenario.metrics},
    pendingEvent:null,resolvedEvents:[],scheduled:[],log:['Day 1: NOTHING™ incorporated. No product roadmap has been approved.'],ledger:[],ending:null};
}
function record(s:GameState,label:string,amount:number,category:CashCategory=amount>0?'revenue':'expense') {
  if (!amount) return;
  s.cash += amount;
  s.finance=trackCash(s.finance,amount,category);
  s.ledger = [...s.ledger,{day:s.day,label,amount,category}].slice(-200);
}
function apply(s:GameState,delta:Delta,label:string) {
  for(const key of METRIC_KEYS) s.metrics[key] = clamp(s.metrics[key] + (delta[key] ?? 0));
  record(s,label,delta.cash ?? 0);
  s.compensation += delta.compensation ?? 0;
}
function log(s:GameState,message:string) { s.log = [`Day ${s.day}: ${message}`,...s.log].slice(0,100); }
function checkEnding(s:GameState) {
  if(s.cash<=0) s.ending='insolvent';
  else if(s.metrics.actual>=actualLimit(s)) s.ending='useful';
  else if(s.metrics.confidence<=0) s.ending='board';
}
export function dispatch(state:GameState,command:Command):GameState {
  if(state.ending) return state;
  let s:GameState = spawnBoss({...state,metrics:{...state.metrics}});
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
  } else if(command.type==='finance'){
    const result=changeFinance(s,command);
    if(!result)return state;
    s.capacity--;s.finance=result.finance;
    for(const entry of result.entries)record(s,entry.label,entry.amount,entry.category);
    apply(s,result.delta,result.message);log(s,result.message);
  } else if(command.type==='os'){
    const result=changeOS(s,command);
    if(!result)return state;
    s.capacity--;s.os=result.os;
    if(command.operation==='shutdown')s.agents={...s.agents,lastTokens:0,lastStatus:'Offline: all agent inference suspended.'};
    record(s,result.message,-result.cost);apply(s,result.delta,result.message);log(s,result.message);
  } else if(command.type==='agent'){
    const result=changeAgents(s,command);
    if(!result)return state;
    s.capacity--;s.agents=result.agents;
    record(s,result.message,-result.cost);apply(s,result.delta,result.message);log(s,result.message);
  } else if(command.type==='boss'){
    const result=changeBoss(s,command);
    if(!result)return state;
    s.capacity--;s.boss=result.boss;s.employees=result.employees;s.meetings=result.meetings;s.nextMeetingId=result.nextMeetingId;
    s.departments=syncDepartments(s.departments,s.employees);
    record(s,result.message,-result.cost);apply(s,result.delta,result.message);log(s,result.message);
  } else if(command.type==='campaign'){
    if(campaignEligibility(s,command))return state;
    s.capacity--;
    if(command.operation==='certify'){s.ending='certified';log(s,'Systemically important nothingness certified.');}
    else {
      s.campaign=advanceCampaign(s);
      const stage=STAGES[s.campaign.stage-1];
      record(s,'Stage capital injection: '+stage.name,stage.grant,'financing');
      log(s,'Campaign stage attained: '+stage.name+'.');
      s.communications=[...s.communications,{...generateCommunication(s,'announcement',s.nextCommunicationId++,nextRandom),subject:'Corporate expansion | '+stage.name}];
      s=spawnBoss(s);
    }
  } else if(command.type==='choose'){
    const e=EVENTS.find(x=>x.id===s.pendingEvent);
    const c=e?.choices.find(x=>x.id===command.id);
    if(!e || !c) return state;
    apply(s,c.effect,e.title);
    if(c.delayed) s.scheduled=[...s.scheduled,{day:s.day+c.delayed.days,effect:c.delayed.effect,message:c.delayed.message}];
    s.resolvedEvents=[...s.resolvedEvents,e.id];
    s.incidentHistory=[...s.incidentHistory,{eventId:e.id,choiceId:c.id,day:s.day}];
    s.pendingEvent=null;
    log(s,c.label);
  } else if(command.type==='endDay'){
    if(s.pendingEvent) return state;
    const m=s.metrics;
    const [rng,roll]=random(s.rng); s.rng=rng;
    record(s,'Predictive savings revenue',Math.round(350+m.perceived*8+m.confidence*5));
    record(s,'Operating expenditure',-Math.round((850+m.bureaucracy*4+m.meetings*3+campaignOverhead(s))*DIFFICULTIES[s.campaign.difficulty].overhead));
    apply(s,{actual:Math.max(-4,Math.round(4+roll*3+m.morale/30-m.meetings/12-m.bureaucracy/18)),
      morale:-1,meetings:-3,perceived:-2,confidence:(m.perceived>=45?2:-2)-(m.morale<20?2:0),regulation:(m.buzzwords>=80?2:0)+DIFFICULTIES[s.campaign.difficulty].regulatoryPressure+(s.campaign.stage>=6?1:0)},'Daily operations');
    const calendar=runMeetings(s.meetings,s.nextMeetingId,s.employees,s.day,()=>{const [next,value]=random(s.rng);s.rng=next;return value;});
    s.meetings=calendar.meetings;s.nextMeetingId=calendar.nextMeetingId;s.employees=calendar.employees;
    for(const cost of calendar.costs)record(s,cost.label,cost.amount);
    apply(s,calendar.delta,'Meeting outcomes');for(const report of calendar.reports)log(s,report);
    const confrontation=runBoss(s,calendar.minutes);
    s.boss=confrontation.boss;s.employees=confrontation.employees;
    record(s,'Non-delivery transformation governance',-confrontation.cost);apply(s,confrontation.delta,'Competent employee confrontation');for(const report of confrontation.reports)log(s,report);
    const daily=runDepartments(s.departments,()=>{const [next,value]=random(s.rng);s.rng=next;return value;},payrollByDepartment(s.employees),s.employees,confrontation.minutes);
    s.departments=daily.departments;
    for(const entry of daily.costs)record(s,entry.label,entry.amount);
    apply(s,daily.delta,'Departmental operating results');
    for(const report of daily.reports)log(s,report);
    const people=runEmployees(s.employees,s.relationships,s.departments,s.day,()=>{const [next,value]=random(s.rng);s.rng=next;return value;},confrontation.minutes,s.boss.employeeId!==null&&protectedBoss(s,s.boss.employeeId)?s.boss.employeeId:undefined);
    s.employees=people.employees;s.relationships=people.relationships;
    s.departments=syncDepartments(s.departments,s.employees);
    apply(s,people.delta,'Employee activity');for(const report of people.reports)log(s,report);
    const portfolio=runProgrammes(s,confrontation.minutes,nextRandom);
    s.programmes=portfolio.programmes;for(const cost of portfolio.costs)record(s,cost.label,cost.amount);
    apply(s,portfolio.delta,'Transformation portfolio');for(const report of portfolio.reports)log(s,report);
    const comms=runCommunications(s,nextRandom);
    s.communications=comms.communications;s.nextCommunicationId=comms.nextCommunicationId;
    apply(s,comms.delta,'Corporate communications');for(const report of comms.reports)log(s,report);
    const trading=runFinance(s,nextRandom);
    s.finance=trading.finance;
    for(const entry of trading.entries)record(s,entry.label,entry.amount,entry.category);
    apply(s,trading.delta,'Financial operations');for(const report of trading.reports)log(s,report);
    const operatingSystem=runOS(s.os);
    s.os=operatingSystem.os;record(s,'NOTHING™ OS simulated inference',-operatingSystem.cost);
    apply(s,operatingSystem.delta,'Operating system activity');
    const orchestration=runAgents(s,nextRandom);
    s.agents=orchestration.agents;record(s,'Agentic workflow simulated inference',-orchestration.cost);
    apply(s,orchestration.delta,'Agent orchestration');
    for(const report of orchestration.reports)log(s,report);
    if(orchestration.runs.length)s.communications=[...s.communications,{...generateCommunication(s,'email',s.nextCommunicationId++,nextRandom),subject:'Agentic operations report | Day '+s.day,body:orchestration.reports.join(' ')}];
    s.finance=closeFinanceDay(s);
    if(s.finance.reports.at(-1)?.endDay===s.day){
      const report=s.finance.reports.at(-1)!;
      s.communications=[...s.communications,{...generateCommunication(s,'shareholder',s.nextCommunicationId++,nextRandom),subject:'Quarterly earnings | Working day '+s.day,body:'Revenue £'+report.revenue+'; expenses £'+report.expenses+'; operating result £'+report.profit+'. Financing and investment cash flows are reported separately.'}];
      log(s,'Quarterly earnings report published.');
    }
    log(s,'Daily operations reconciled. No further alignment required until tomorrow.');
    s.day++; s.capacity=dailyCapacity(s);
    const due=s.scheduled.filter(x=>x.day<=s.day);
    s.scheduled=s.scheduled.filter(x=>x.day>s.day);
    for(const effect of due){apply(s,effect.effect,effect.message);log(s,effect.message);}
    if(s.day%3===2){
      s.pendingEvent=selectIncident(s,nextRandom())?.id??null;
    }
  } else return state;
  checkEnding(s);
  s.achievements=updateAchievements(state,s,command);
  return s;
}
