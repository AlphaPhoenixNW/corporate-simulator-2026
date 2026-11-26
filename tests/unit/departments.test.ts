import { describe,it,expect } from 'vitest';
import { newGame,dispatch } from '../../src/engine/simulation';
import { DEPARTMENTS, initialDepartments, runDepartments, validDepartments } from '../../src/engine/departments';
import { decodeSave } from '../../src/storage';
import { EVENTS } from '../../src/engine/content';
import type { GameState } from '../../src/engine/types';
describe('department simulation',()=>{
  it('has ten unique definitions, with three active at inception',()=>{
    const s=newGame();
    expect(s.departments).toHaveLength(10);
    expect(s.departments.filter(d=>d.active)).toHaveLength(3);
    expect(new Set(Object.values(DEPARTMENTS).map(d=>d.objective)).size).toBe(10);
    expect(EVENTS.filter(e=>e.department)).toHaveLength(10);
    expect(validDepartments(s.departments)).toBe(true);
  });
  it('adjusts a daily budget using capacity without immediately spending cash',()=>{
    const s=newGame();
    const next=dispatch(s,{type:'department',id:'engineering',operation:'increase'});
    expect(next.capacity).toBe(1);
    expect(next.cash).toBe(s.cash);
    expect(next.departments.find(d=>d.id==='engineering')?.budget).toBe(150);
    expect(s.departments.find(d=>d.id==='engineering')?.budget).toBe(100);
  });
  it('blocks locked departments and charges for establishment when unlocked',()=>{
    const s=newGame();
    expect(dispatch(s,{type:'department',id:'hr',operation:'activate'})).toBe(s);
    const ready={...s,day:2};
    const next=dispatch(ready,{type:'department',id:'hr',operation:'activate'});
    expect(next.cash).toBe(s.cash-750);
    expect(next.departments.find(d=>d.id==='hr')).toMatchObject({active:true,headcount:1});
  });
  it('charges staffing costs and preserves a minimum headcount',()=>{
    const s=newGame();
    expect(dispatch(s,{type:'department',id:'finance',operation:'reduce'})).toBe(s);
    const hired=dispatch(s,{type:'department',id:'finance',operation:'hire'});
    expect(hired.cash).toBe(s.cash-350);
    const next=dispatch(hired,{type:'endDay'});
    expect(next.ledger.some(l=>l.label==='Finance operating costs'&&l.amount===-210)).toBe(true);
  });
  it('makes engineering operations riskier than governance',()=>{
    const initial=initialDepartments();
    const governance=runDepartments(initial,()=>.5);
    const operations=runDepartments(initial.map(d=>d.id==='engineering'?{...d,focus:'operations'}:d),()=>.5);
    expect(operations.delta.actual!).toBeGreaterThan(governance.delta.actual!);
    expect(governance.costs).toHaveLength(3);
  });
  it('produces seeded incidents and underfunded resource requests',()=>{
    const initial=initialDepartments().map(d=>d.id==='engineering'?{...d,budget:0}:d);
    const result=runDepartments(initial,()=>0);
    expect(result.departments.find(d=>d.id==='engineering')).toMatchObject({request:true,spent:55});
    expect(result.reports).toContain(DEPARTMENTS.engineering.failure);
    expect(result.delta.actual).toBeGreaterThan(0);
  });
  it('migrates v1 saves without changing day, cash or RNG; validates v2',()=>{
    const s=newGame(42);
    const legacy={...s,version:1,departments:undefined,day:9,cash:12345};
    const migrated=decodeSave(JSON.stringify(legacy))!;
    expect(migrated).toMatchObject({version:2,day:9,cash:12345,rng:42});
    expect(migrated.departments).toEqual(initialDepartments());
    expect(decodeSave(JSON.stringify(migrated))).toEqual(migrated);
    expect(decodeSave(JSON.stringify({...migrated,departments:[]}))).toBeNull();
  });
  it('never selects events for inactive departments',()=>{
    for(let seed=0;seed<30;seed++){
      const next=dispatch(newGame(seed),{type:'endDay'});
      const event=EVENTS.find(e=>e.id===next.pendingEvent);
      expect(event).toBeDefined();
      if(event?.department)expect(next.departments.find(d=>d.id===event.department)?.active).toBe(true);
    }
  });
  it('runs all ten departments independently with bounded values',()=>{
    const departments:GameState['departments']=initialDepartments().map(d=>({...d,active:true,headcount:1}));
    const result=runDepartments(departments,()=>.5);
    expect(result.costs).toHaveLength(10);
    expect(result.departments.every(d=>d.progress===12&&d.spent===155)).toBe(true);
    expect(validDepartments(result.departments)).toBe(true);
  });
});
