import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {PROGRAMME_DEFINITIONS,programmeEligibility,runProgrammes,validProgrammes} from '../../src/engine/programmes';
import {runMeetings} from '../../src/engine/meetings';
import {decodeSave} from '../../src/storage';
import type {GameState,ProgrammeType} from '../../src/engine/types';
const commission=(s:GameState,type:ProgrammeType='cloud')=>dispatch(s,{type:'programme',operation:'commission',programme:type,leadId:s.employees.find(e=>e.department===PROGRAMME_DEFINITIONS[type].sponsor&&e.status==='active')?.id??0});
const review=():GameState=>{const s=commission(newGame());return {...s,capacity:2,programmes:s.programmes.map(p=>({...p,status:'review',progress:p.target}))};};
describe('transformation programmes',()=>{
  it('defines nine programmes with three unique milestones each',()=>{
    expect(Object.keys(PROGRAMME_DEFINITIONS)).toHaveLength(9);
    expect(new Set(Object.values(PROGRAMME_DEFINITIONS).flatMap(d=>d.milestones)).size).toBe(27);
  });
  it('commissions a named programme lead, charges only the launch fee and publishes an announcement',()=>{
    const s=newGame(),next=commission(s);
    expect(next.cash).toBe(s.cash-600);expect(next.capacity).toBe(1);
    expect(next.programmes[0]).toMatchObject({type:'cloud',budget:3600,spent:600,consultancy:600,status:'active'});
    expect(next.communications[0].type).toBe('transformation');expect(s.programmes).toHaveLength(0);
    expect(commission(next)).toBe(next);
  });
  it('blocks unavailable sponsors, incomplete dependencies and invalid leads',()=>{
    const s=newGame();
    expect(commission(s,'quantum')).toBe(s);expect(commission(s,'salesforce')).toBe(s);
    expect(dispatch(s,{type:'programme',operation:'commission',programme:'cloud',leadId:999})).toBe(s);
    const c=commission(s);
    const certified:GameState={...c,programmes:c.programmes.map(p=>({...p,status:'complete',milestone:3}))};
    expect(commission(certified,'quantum').programmes).toHaveLength(2);
  });
  it('accrues consultancy fees and progress without mutating the old state',()=>{
    const s=commission(newGame());
    const next=runProgrammes(s,{},()=>.5);
    expect(next.programmes[0].spent).toBe(750);expect(next.programmes[0].progress).toBe(12);
    expect(next.costs).toEqual([{label:'Cloud-Native Distributed Nothingness consultancy',amount:-150}]);
    expect(s.programmes[0].progress).toBe(0);
    expect(dispatch(s,{type:'endDay'}).ledger.some(l=>l.label===next.costs[0].label&&l.amount===-150)).toBe(true);
  });
  it('allows scope expansion and accidental useful work with bounded scope creep',()=>{
    const s=commission(newGame()),result=runProgrammes(s,{},()=>0);
    expect(result.programmes[0]).toMatchObject({scopeCreep:1,incidents:1,target:44});
    expect(result.delta.actual).toBe(12);
    const maxed={...s,programmes:s.programmes.map(p=>({...p,scopeCreep:3}))};
    expect(runProgrammes(maxed,{},()=>0).programmes[0].scopeCreep).toBe(3);
  });
  it('stops at the budget ceiling and resumes after authorising funds',()=>{
    const s=commission(newGame()),blocked={...s,programmes:s.programmes.map(p=>({...p,budget:p.spent}))};
    expect(runProgrammes(blocked,{},()=>.5).costs).toHaveLength(0);
    const funded=dispatch(blocked,{type:'programme',operation:'topup',programme:'cloud'});
    expect(funded.cash).toBe(blocked.cash);
    expect(runProgrammes(funded,{},()=>.5).costs).toHaveLength(1);
  });
  it('requires a held steering committee before a milestone is approved',()=>{
    const s=review();
    expect(programmeEligibility(s,{type:'programme',operation:'approve',programme:'cloud'})).toContain('committee');
    const booked=dispatch(s,{type:'programme',operation:'committee',programme:'cloud'});
    expect(booked.meetings[0].type).toBe('steering');expect(booked.programmes[0].committeeId).toBe(booked.meetings[0].id);
    const result=runMeetings(booked.meetings,booked.nextMeetingId,booked.employees,booked.day,()=>.9);
    const held={...booked,meetings:result.meetings,nextMeetingId:result.nextMeetingId};
    const approved=dispatch(held,{type:'programme',operation:'approve',programme:'cloud'});
    expect(approved.programmes[0]).toMatchObject({milestone:1,progress:0,status:'active',committeeId:null});
    const final={...held,programmes:held.programmes.map(p=>({...p,milestone:2}))};
    expect(dispatch(final,{type:'programme',operation:'approve',programme:'cloud'}).programmes[0].status).toBe('complete');
  });
  it('uses lead availability and permits pause, resume and cancellation',()=>{
    const s=commission(newGame()),id=s.programmes[0].leadId;
    expect(runProgrammes(s,{[id]:480},()=>.5).programmes[0].progress).toBe(0);
    const paused=dispatch(s,{type:'programme',operation:'pause',programme:'cloud'});
    expect(runProgrammes(paused,{},()=>.5).costs).toHaveLength(0);
    const resumed=dispatch({...paused,capacity:2},{type:'programme',operation:'resume',programme:'cloud'});
    expect(resumed.programmes[0].status).toBe('active');
    expect(dispatch(resumed,{type:'programme',operation:'cancel',programme:'cloud'}).programmes[0].status).toBe('cancelled');
  });
  it('can replace a reassigned or unavailable programme lead',()=>{
    const s=commission(newGame()),hired=dispatch(s,{type:'department',id:'engineering',operation:'hire'});
    const replacement=hired.employees.find(e=>e.department==='engineering'&&e.id!==s.programmes[0].leadId)!;
    const next=dispatch({...hired,capacity:2},{type:'programme',operation:'replace-lead',programme:'cloud',leadId:replacement.id});
    expect(next.programmes[0].leadId).toBe(replacement.id);
  });
  it('migrates v5 saves and validates persistent portfolio records',()=>{
    const s=newGame(),legacy={...s,version:5,programmes:undefined};
    expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:8,programmes:[]});
    const next=commission(s);
    expect(validProgrammes(next.programmes,next.employees,next.meetings)).toBe(true);
    expect(decodeSave(JSON.stringify(next))).toEqual(next);
    expect(decodeSave(JSON.stringify({...next,programmes:[{...next.programmes[0],spent:99999}]}))).toBeNull();
  });
});
