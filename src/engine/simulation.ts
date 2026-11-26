import { ACTIONS, EVENTS } from './content';
import { METRIC_KEYS, type GameState, type Command, type Delta } from './types';
export const DAILY_CAPACITY = 2;
const clamp = (n:number) => Math.max(0,Math.min(100,n));
export function random(rng:number): [number,number] {
  const next = (Math.imul(1664525,rng) + 1013904223) >>> 0;
  return [next,next / 4294967296];
}
export function newGame(seed=2026): GameState {
  const normalized = seed >>> 0;
  return {version:1,seed:normalized,rng:normalized,day:1,cash:75000,capacity:DAILY_CAPACITY,compensation:0,
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
  if(command.type==='action'){
    const a=ACTIONS.find(x=>x.id===command.id);
    if(!a || s.capacity<1 || s.cash<a.cost || s.pendingEvent) return state;
    s.capacity--;
    record(s,a.label,-a.cost);
    apply(s,a.effect,a.label);
    log(s,a.label+' completed. An outcome is not anticipated.');
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
    log(s,'Daily operations reconciled. No further alignment required until tomorrow.');
    s.day++; s.capacity=DAILY_CAPACITY;
    const due=s.scheduled.filter(x=>x.day<=s.day);
    s.scheduled=s.scheduled.filter(x=>x.day>s.day);
    for(const effect of due){apply(s,effect.effect,effect.message);log(s,effect.message);}
    if(s.day%3===2){
      const unused=EVENTS.filter(e=>!s.resolvedEvents.includes(e.id));
      const pool=unused.length?unused:EVENTS;
      const [next,value]=random(s.rng); s.rng=next;
      s.pendingEvent=pool[Math.floor(value*pool.length)].id;
    }
  }
  checkEnding(s);
  return s;
}
