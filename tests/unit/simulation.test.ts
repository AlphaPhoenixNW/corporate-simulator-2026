import { describe,it,expect } from 'vitest';
import { dispatch,newGame } from '../../src/engine/simulation';
import type { GameState } from '../../src/engine/types';
import { EVENTS } from '../../src/engine/content';
import { decodeSave } from '../../src/storage';
describe('daily simulation',()=>{
  it('uses deterministic seeded state and does not mutate the prior state',()=>{
    const original=newGame(42);
    const a=dispatch(original,{type:'action',id:'alignment'});
    expect(original.cash).toBe(75000);
    expect(a.cash).toBe(74400);
    expect(a.metrics.actual).toBe(5);
    expect(dispatch(a,{type:'endDay'})).toEqual(dispatch(dispatch(newGame(42),{type:'action',id:'alignment'}),{type:'endDay'}));
  });
  it('enforces capacity and affordability',()=>{
    let s=newGame();
    s=dispatch(s,{type:'action',id:'rest'});
    s=dispatch(s,{type:'action',id:'rest'});
    expect(dispatch(s,{type:'action',id:'rest'})).toBe(s);
    const broke={...newGame(),cash:10};
    expect(dispatch(broke,{type:'action',id:'consultants'})).toBe(broke);
  });
  it('requires a decision before progressing and applies its effect',()=>{
    const s=dispatch(newGame(),{type:'endDay'});
    expect(s.day).toBe(2);
    expect(s.capacity).toBe(2);
    expect(dispatch(s,{type:'endDay'})).toBe(s);
    const e=EVENTS.find(e=>e.id===s.pendingEvent)!;
    const next=dispatch(s,{type:'choose',id:e.choices[0].id});
    expect(next.pendingEvent).toBeNull();
    expect(next.resolvedEvents).toContain(e.id);
  });
  it('applies delayed effects on the due day',()=>{
    let s: GameState={...newGame(),pendingEvent:'functional-product'};
    s=dispatch(s,{type:'choose',id:'launch'});
    expect(s.cash).toBe(79000);
    expect(s.scheduled[0].day).toBe(3);
    s=dispatch(s,{type:'endDay'});
    const e=EVENTS.find(e=>e.id===s.pendingEvent)!;
    s=dispatch(s,{type:'choose',id:e.choices[0].id});
    s=dispatch(s,{type:'endDay'});
    expect(s.log.some(x=>x.includes('Customers have started'))).toBe(true);
  });
  it('ends the game for actual productivity and prevents further actions',()=>{
    const s=dispatch({...newGame(),metrics:{...newGame().metrics,actual:69}},{type:'action',id:'wellbeing'});
    expect(s.ending).toBe('useful');
    expect(dispatch(s,{type:'endDay'})).toBe(s);
  });
  it('tracks bonuses and cash ledger consistently',()=>{
    const s=dispatch(newGame(),{type:'action',id:'bonus'});
    expect(s.compensation).toBe(1800);
    expect(s.cash).toBe(73200);
    expect(s.ledger.reduce((n,x)=>n+x.amount,75000)).toBe(s.cash);
  });
  it('round trips and rejects corrupt saves',()=>{
    const s=dispatch(newGame(),{type:'endDay'});
    expect(decodeSave(JSON.stringify(s))).toEqual(s);
    expect(decodeSave('invalid')).toBeNull();
    expect(decodeSave(JSON.stringify({...s,capacity:99}))).toBeNull();
    expect(decodeSave(JSON.stringify({...s,version:999}))).toBeNull();
  });
});
