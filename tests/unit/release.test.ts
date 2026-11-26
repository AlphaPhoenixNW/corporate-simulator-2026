import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {decodeSave} from '../../src/storage';
import {customerServicingCost} from '../../src/engine/finance';
import {METRIC_KEYS,type Command} from '../../src/engine/types';
import {playthrough,summarize} from '../support/campaignDriver';
describe('release readiness',()=>{
 it('rejects unrecognised runtime commands without advancing time',()=>{
  const s=newGame();expect(dispatch(s,{type:'invalid'} as unknown as Command)).toBe(s);
 });
 it('rejects a save with cash inconsistent with the current financial period',()=>{
  const s=newGame();expect(decodeSave(JSON.stringify({...s,cash:s.cash+1}))).toBeNull();
 });
 it('plays a full campaign from a fresh seed through legitimate commands',()=>{
  const run=playthrough(2026);
  console.log('RELEASE_PLAYTHROUGH',JSON.stringify(summarize(run)));
  expect(run.state.ending).toBe('certified');
  expect(run.state.boss.phase).toBe('contained');
  expect(run.state.campaign.history.map(h=>h.stage)).toEqual([1,2,3,4,5,6,7]);
  expect(run.state.achievements.unlocked.some(a=>a.id==='nothing-scale')).toBe(true);
  expect(run.minCash).toBeGreaterThan(0);
 });
 it('replays identical commands deterministically across a full campaign',()=>{
  const run=playthrough(2026);let replay=newGame(2026);
  for(const command of run.commands)replay=dispatch(replay,command);
  expect(replay).toEqual(run.state);
 });
 it('keeps bounded metrics and financial reconciliation throughout a relaxed playthrough',()=>{
  const run=playthrough(42,{difficulty:'relaxed'});
  console.log('RELEASE_RELAXED',JSON.stringify(summarize(run)));
  expect(run.state.ending).toBe('certified');
  expect(METRIC_KEYS.every(k=>run.state.metrics[k]>=0&&run.state.metrics[k]<=100)).toBe(true);
  const f=run.state.finance,p=f.period;
  expect(f.openingCash+p.revenue-p.expenses+p.financing+p.investing).toBe(run.state.cash);
  expect(decodeSave(JSON.stringify(run.state))).toEqual(run.state);
 });
 it('completes ruthless difficulty using legitimate gameplay commands',()=>{
  const run=playthrough(73,{difficulty:'ruthless'});
  console.log('RELEASE_RUTHLESS',JSON.stringify(summarize(run)));
  expect(run.state.ending).toBe('certified');
  expect(run.state.achievements.unlocked.some(a=>a.id==='ruthless')).toBe(true);
  expect(run.maxActual).toBeLessThan(55);
  expect(run.minCash).toBeGreaterThan(0);
 });
 it.each([7,42,2026])('maintains a legal-command sandbox for 100 days, seed %i',(seed)=>{
  const run=playthrough(seed,{mode:'sandbox'},100);
  console.log('RELEASE_SANDBOX',JSON.stringify(summarize(run)));
  expect(run.state.day).toBe(101);
  expect(run.state.ending).toBeNull();
  expect(run.state.campaign.stage).toBe(1);
  expect(run.state.achievements.unlocked.some(a=>a.id==='sandbox')).toBe(true);
  expect(decodeSave(JSON.stringify(run.state))).toEqual(run.state);
  expect(run.minCash).toBeGreaterThan(0);
 });
 it('charges real simulated operating expenses in proportion to customers and difficulty',()=>{
  const s=newGame(),withCustomers={...s,finance:{...s.finance,subscribers:100}};
  expect(customerServicingCost(s)).toBe(0);
  expect(customerServicingCost(withCustomers)).toBe(2000);
  expect(customerServicingCost({...withCustomers,finance:{...withCustomers.finance,plan:'conservative'}})).toBe(1400);
  expect(customerServicingCost({...withCustomers,campaign:{...withCustomers.campaign,difficulty:'ruthless'}})).toBe(2400);
 });
 it('makes low morale erode daily shareholder confidence',()=>{
  const base=newGame(),normal=dispatch({...base,metrics:{...base.metrics,perceived:50,morale:20}},{type:'endDay'});
  const low=dispatch({...base,metrics:{...base.metrics,perceived:50,morale:19}},{type:'endDay'});
  expect(low.metrics.confidence).toBe(normal.metrics.confidence-2);
 });
});
