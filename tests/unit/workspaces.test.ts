import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {resolveWorkspace,recommend,workspaceAvailable,WORKSPACES} from '../../src/ui/workspaces';
import {ACHIEVEMENTS} from '../../src/engine/achievements';
describe('focused executive workspaces',()=>{
 it('maps legacy deep links and unknown routes safely to the office',()=>{
  for(const hash of ['','#workspace','#decisions','#pending-decision','#board-notification','#unknown'])expect(resolveWorkspace(hash)).toBe('office');
  for(const item of WORKSPACES)expect(resolveWorkspace('#'+item.id)).toBe(item.id);
  expect(workspaceAvailable(newGame(),'containment')).toBe(false);
 });
 it('recommends a real affordable action that satisfies the founder stage requirement',()=>{
  const s=newGame();expect(recommend(s).action).toBe('alignment');
  const next=dispatch(s,{type:'action',id:'alignment'});
  expect(recommend(next).workspace).toBe('finance');
 });
 it('prioritises pending decisions, failure risks and exhausted capacity',()=>{
  const s=newGame();
  expect(recommend({...s,metrics:{...s.metrics,actual:65}}).action).toBe('alignment');
  expect(recommend({...s,metrics:{...s.metrics,confidence:20}}).action).toBe('statement');
  expect(recommend({...s,capacity:0}).title).toBe('Conclude working day');
  const pending=dispatch(s,{type:'endDay'});
  expect(recommend(pending).title).toBe('Resolve the corporate incident');
 });
 it('recommends campaign authorisation when all gates are met',()=>{
  const s=newGame(),ready={...s,day:3,metrics:{...s.metrics,perceived:40,confidence:60,actual:0}};
  expect(recommend(ready).workspace).toBe('campaign');
 });
 it('retains all twelve specifically required named achievements',()=>{
  const names=ACHIEVEMENTS.map(a=>a.name);
  for(const n of ['Successfully Not Launched','Accidental Business Value','Bed-Led Leadership','Meeting About a Meeting','Zero-Token Hero','Too Competent to Remain Employed','Strategically Unavailable','Enterprise-Grade Nothing','Maximum Buzzword Density','Synergy Without Substance','The Horizontal Executive','Nothing at Scale'])expect(names).toContain(n);
  expect(ACHIEVEMENTS).toHaveLength(74);
 });
});
