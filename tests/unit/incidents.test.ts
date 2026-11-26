import {describe,it,expect} from 'vitest';
import {EVENTS} from '../../src/engine/content';
import {INCIDENT_CATALOGUE} from '../../src/engine/incidentCatalogue';
import {eventEligible,incidentPool,selectIncident,validIncidentHistory,describeEffects} from '../../src/engine/incidents';
import {newGame,dispatch} from '../../src/engine/simulation';
import {decodeSave} from '../../src/storage';
import {METRIC_KEYS,type GameState} from '../../src/engine/types';
const event=(id:string)=>EVENTS.find(e=>e.id===id)!;
describe('corporate incidents',()=>{
  it('has 150 unique individually authored events with valid branching choices',()=>{
    expect(EVENTS).toHaveLength(150);expect(INCIDENT_CATALOGUE).toHaveLength(108);
    expect(new Set(EVENTS.map(e=>e.id)).size).toBe(150);
    expect(new Set(EVENTS.map(e=>e.title)).size).toBe(150);
    expect(new Set(INCIDENT_CATALOGUE.map(e=>e.category)).size).toBe(12);
    for(const e of EVENTS){
      expect(e.description.length).toBeGreaterThan(20);expect(e.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(e.choices.map(c=>c.id)).size).toBe(e.choices.length);
      expect(e.choices[0].effect).not.toEqual(e.choices[1].effect);
      for(const c of e.choices){
        for(const effect of [c.effect,...(c.delayed?[c.delayed.effect]:[])])for(const [k,n] of Object.entries(effect)){
          expect([...METRIC_KEYS,'cash','compensation']).toContain(k);expect(Number.isSafeInteger(n)).toBe(true);
        }
        if(c.delayed)expect(c.delayed.days).toBeGreaterThan(0);
      }
    }
  });
  it('has twelve valid narrative continuations and 36 new delayed-effect incidents',()=>{
    const followups=INCIDENT_CATALOGUE.filter(e=>e.trigger?.after);
    expect(followups).toHaveLength(12);
    expect(INCIDENT_CATALOGUE.filter(e=>e.choices.some(c=>c.delayed))).toHaveLength(36);
    for(const e of followups){const a=e.trigger!.after!;expect(event(a.eventId).choices.some(c=>c.id===a.choiceId)).toBe(true);expect(a.days).toBeGreaterThan(0);}
  });
  it('gates incidents on operating context and active departments',()=>{
    const s=newGame();
    expect(eventEligible(s,event('incident-idle-kernel'))).toBe(false);
    expect(eventEligible(s,event('incident-agent-model-audit'))).toBe(false);
    expect(eventEligible(s,event('incident-customer-renewal'))).toBe(false);
    expect(eventEligible(s,event('incident-architecture-debate'))).toBe(true);
    expect(eventEligible(s,event('incident-mission-statement'))).toBe(false);
    const boot=dispatch(s,{type:'os',operation:'boot'});
    expect(eventEligible(boot,event('incident-idle-kernel'))).toBe(true);
    const customer=dispatch(s,{type:'finance',operation:'acquire-customers'});
    expect(eventEligible(customer,event('incident-customer-renewal'))).toBe(true);
  });
  it('requires the matching earlier choice and elapsed working days',()=>{
    const s=newGame(),parent=event('incident-salary-benchmark'),follow=event('incident-salary-benchmark-return');
    const pending:GameState={...s,pendingEvent:parent.id};
    const chosen=dispatch(pending,{type:'choose',id:'a'});
    expect(chosen.incidentHistory).toEqual([{eventId:parent.id,choiceId:'a',day:1}]);
    expect(eventEligible(chosen,follow)).toBe(false);
    const ready={...chosen,day:3};
    expect(eventEligible(ready,follow)).toBe(true);
    expect(incidentPool(ready)).toContain(follow);
    expect(incidentPool(ready).every(e=>!!e.trigger?.after)).toBe(true);
    const alternative=dispatch(pending,{type:'choose',id:'b'});
    expect(eventEligible({...alternative,day:10},follow)).toBe(false);
  });
  it('prefers unseen events and never replays a resolved continuation',()=>{
    const s=newGame(),base=event('incident-salary-benchmark'),follow=event('incident-salary-benchmark-return'),other=event('functional-product');
    const ready={...s,day:5,resolvedEvents:[base.id,follow.id],incidentHistory:[{eventId:base.id,choiceId:'a',day:1},{eventId:follow.id,choiceId:'a',day:3}]};
    expect(selectIncident(ready,0,[base,follow,other])?.id).toBe(other.id);
    expect(incidentPool({...ready,resolvedEvents:[base.id,follow.id,other.id]},[base,follow,other]).map(e=>e.id)).toEqual([base.id,other.id]);
    expect(selectIncident(s,.5,[])).toBeNull();
  });
  it('applies immediate and delayed consequences, keeping the decision record immutable',()=>{
    const s={...newGame(),pendingEvent:'incident-performance-curve'};
    const e=event(s.pendingEvent),choice=e.choices[0],n=dispatch(s,{type:'choose',id:choice.id});
    expect(n.cash).toBe(s.cash-500);expect(n.metrics.morale).toBe(s.metrics.morale-4);
    expect(n.scheduled[0].day).toBe(4);expect(s.incidentHistory).toHaveLength(0);
    expect(n.incidentHistory[0].eventId).toBe(e.id);
    const due=dispatch({...n,day:3},{type:'endDay'});
    expect(due.scheduled).toHaveLength(0);expect(due.log.some(l=>l.includes(choice.delayed!.message))).toBe(true);
  });
  it('provides human-readable immediate effects',()=>{
    expect(describeEffects({cash:-500,actual:4})).toBe('Cash −£500 · Actual productivity +4');
  });
  it('migrates v9 without inventing past choices and validates current records',()=>{
    const s=newGame(),legacy={...s,version:9,incidentHistory:undefined,resolvedEvents:['functional-product']};
    const n=decodeSave(JSON.stringify(legacy))!;
    expect(n).toMatchObject({version:12,incidentHistory:[],resolvedEvents:['functional-product']});
    const decided=dispatch({...s,pendingEvent:'functional-product'},{type:'choose',id:'committee'});
    expect(validIncidentHistory(decided.incidentHistory,decided.resolvedEvents,decided.day)).toBe(true);
    expect(decodeSave(JSON.stringify(decided))).toEqual(decided);
    expect(decodeSave(JSON.stringify({...decided,incidentHistory:[{eventId:'functional-product',choiceId:'invalid',day:1}]}))).toBeNull();
  });
});
