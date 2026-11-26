import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {initialOS,runOS,projectedTokens,osEligibility,validOS,FIRST_LICENCE,RESTART_LICENCE} from '../../src/engine/os';
import {decodeSave} from '../../src/storage';
describe('NOTHING OS',()=>{
  it('starts offline without a charge or simulated token demand',()=>{
    const s=newGame();
    expect(s.os).toEqual(initialOS());expect(projectedTokens(s.os)).toBe(0);
    expect(runOS(s.os).cost).toBe(0);expect(validOS(s.os)).toBe(true);
  });
  it('activates a licence and records its financial cost',()=>{
    const s=newGame(),n=dispatch(s,{type:'os',operation:'boot'});
    expect(n.os).toMatchObject({power:'online',licence:'active',boots:1,licenceSpend:FIRST_LICENCE});
    expect(n.cash).toBe(s.cash-FIRST_LICENCE);expect(n.capacity).toBe(1);expect(s.os.power).toBe('offline');
    expect(dispatch(n,{type:'os',operation:'boot'})).toBe(n);
    expect(osEligibility({...s,cash:1},{type:'os',operation:'boot'})).toContain('liquidity');
  });
  it('settles simulated inference and incorporates its cost into financial accounting',()=>{
    const s=dispatch(newGame(),{type:'os',operation:'boot'}),n=dispatch(s,{type:'endDay'});
    expect(n.os.totalTokens).toBe(24000);expect(n.os.lastTokens).toBe(24000);
    expect(n.os.totalInferenceCost).toBe(48);
    expect(n.ledger.some(l=>l.label==='NOTHING™ OS simulated inference'&&l.amount===-48&&l.category==='expense')).toBe(true);
  });
  it('changes the compute profile and projects a matching cost',()=>{
    const s=dispatch(newGame(),{type:'os',operation:'boot'}),n=dispatch(s,{type:'os',operation:'profile',profile:'maximum'});
    expect(projectedTokens(n.os)).toBe(96000);expect(runOS(n.os).cost).toBe(192);
    expect(n.capacity).toBe(0);
  });
  it('shuts down, expires entitlement and eliminates all active token demand',()=>{
    const s=dispatch(newGame(),{type:'os',operation:'boot'}),n=dispatch(s,{type:'os',operation:'shutdown'});
    expect(n.os).toMatchObject({power:'offline',licence:'expired',shutdowns:1,zeroTokenShutdowns:1,lastTokens:0});
    expect(projectedTokens(n.os)).toBe(0);
    const daily=runOS(n.os);expect(daily.cost).toBe(0);expect(daily.os.avoidedTokens).toBe(24000);
    expect(daily.os.totalTokens).toBe(0);expect(validOS(daily.os)).toBe(true);
  });
  it('requires an expensive new entitlement for restart',()=>{
    const s=dispatch(dispatch(newGame(),{type:'os',operation:'boot'}),{type:'os',operation:'shutdown'});
    const ready={...s,capacity:2},n=dispatch(ready,{type:'os',operation:'boot'});
    expect(n.cash).toBe(ready.cash-RESTART_LICENCE);
    expect(n.os).toMatchObject({power:'online',boots:2,shutdowns:1,licenceSpend:FIRST_LICENCE+RESTART_LICENCE});
    expect(validOS(n.os)).toBe(true);
  });
  it('generates a contextual diagnostic report and runs compliance reviews',()=>{
    const s=dispatch(newGame(),{type:'os',operation:'boot'}),n=dispatch(s,{type:'os',operation:'diagnose'});
    expect(n.os.diagnostics[0]).toMatchObject({day:1,tokens:24000,processes:48,exposure:s.metrics.regulation});
    expect(n.cash).toBe(s.cash-75);
    const ready={...n,capacity:2},reviewed=dispatch(ready,{type:'os',operation:'compliance-review'});
    expect(reviewed.metrics.regulation).toBe(ready.metrics.regulation-5);expect(reviewed.cash).toBe(ready.cash-200);
    expect(dispatch(newGame(),{type:'os',operation:'diagnose'}).os.diagnostics).toHaveLength(0);
  });
  it('migrates v7 saves and validates lifecycle consistency',()=>{
    const s=newGame(),legacy={...s,version:7,os:undefined};
    expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:10,os:initialOS()});
    const n=dispatch(s,{type:'os',operation:'boot'});
    expect(decodeSave(JSON.stringify(n))).toEqual(n);
    expect(decodeSave(JSON.stringify({...n,os:{...n.os,licence:'expired'}}))).toBeNull();
  });
});
