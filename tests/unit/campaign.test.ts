import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {STAGES,DIFFICULTIES,SCENARIOS,campaignGates,gateMet,campaignEligibility,dailyCapacity,departmentStageReady,isListed,unlockedScenarios,validCampaign} from '../../src/engine/campaign';
import {decodeSave} from '../../src/storage';
import type {GameState} from '../../src/engine/types';
const atStage=(stage:number):GameState=>{
 const s=newGame();
 return {...s,day:100,cash:100000,campaign:{...s.campaign,stage,enteredDay:80,history:Array.from({length:stage},(_,i)=>({stage:i+1,day:i===stage-1?80:i+1}))},metrics:{...s.metrics,confidence:100,perceived:100,actual:0,regulation:0},capacity:2};
};
describe('campaign progression',()=>{
 it('defines seven stages, three difficulty settings and three scenarios',()=>{
  expect(STAGES).toHaveLength(7);expect(Object.keys(DIFFICULTIES)).toHaveLength(3);expect(Object.keys(SCENARIOS)).toHaveLength(3);
  expect(newGame().campaign).toMatchObject({stage:1,mode:'campaign',difficulty:'standard',scenario:'founder'});
 });
 it('requires simultaneous gates before progressing',()=>{
  const s=newGame();expect(dispatch(s,{type:'campaign',operation:'advance'})).toBe(s);
  const ready=atStage(1);expect(campaignGates(ready).every(gateMet)).toBe(true);
  expect(campaignEligibility({...ready,metrics:{...ready.metrics,actual:36}},{type:'campaign',operation:'advance'})).toContain('requirements');
 });
 it('advances exactly one stage, records funding as financing and publishes an announcement',()=>{
  const s=atStage(1),n=dispatch(s,{type:'campaign',operation:'advance'});
  expect(n.campaign.stage).toBe(2);expect(n.campaign.enteredDay).toBe(100);expect(n.cash).toBe(s.cash+15000);
  expect(n.finance.period.financing).toBe(15000);expect(n.capacity).toBe(1);
  expect(n.communications.at(-1)?.subject).toContain('Seed-Funded Nothingness');expect(s.campaign.stage).toBe(1);
  expect(dispatch(n,{type:'campaign',operation:'advance'})).toBe(n);
 });
 it('unlocks departments with stages while preserving active teams',()=>{
  const s=atStage(1);expect(departmentStageReady(s,'marketing')).toBe(false);
  expect(dispatch(s,{type:'department',id:'marketing',operation:'activate'})).toBe(s);
  const n=dispatch(s,{type:'campaign',operation:'advance'});
  expect(departmentStageReady(n,'marketing')).toBe(true);
  expect(dispatch(n,{type:'department',id:'marketing',operation:'activate'}).departments.find(d=>d.id==='marketing')?.active).toBe(true);
 });
 it('raises executive capacity and public listing status at the intended stages',()=>{
  expect(dailyCapacity(atStage(3))).toBe(3);expect(dailyCapacity(atStage(5))).toBe(4);
  expect(isListed(atStage(5))).toBe(false);expect(isListed(atStage(6))).toBe(true);
  expect(dispatch(atStage(3),{type:'endDay'}).capacity).toBe(3);
 });
 it('changes starting liquidity and strategic failure thresholds with difficulty',()=>{
  const relaxed=newGame(2026,{difficulty:'relaxed'}),hard=newGame(2026,{difficulty:'ruthless'});
  expect(relaxed.cash).toBe(112500);expect(hard.cash).toBe(52500);
  expect(relaxed.finance.openingCash).toBe(relaxed.cash);
  const risk={...hard,metrics:{...hard.metrics,actual:54}};
  expect(dispatch(risk,{type:'action',id:'wellbeing'}).ending).toBe('useful');
  const safer={...relaxed,metrics:{...relaxed.metrics,actual:54}};
  expect(dispatch(safer,{type:'action',id:'wellbeing'}).ending).toBeNull();
 });
 it('offers sandbox without stage gates or campaign victory',()=>{
  const s=newGame(2026,{mode:'sandbox'});
  expect(departmentStageReady(s,'ai')).toBe(true);
  expect(campaignEligibility(s,{type:'campaign',operation:'advance'})).toContain('Sandbox');
  expect(dispatch(s,{type:'campaign',operation:'certify'})).toBe(s);
  expect(dispatch(s,{type:'endDay'}).campaign.stage).toBe(1);
 });
 it('unlocks alternative scenarios and applies their starting conditions',()=>{
  expect(unlockedScenarios(1)).toEqual(['founder']);expect(unlockedScenarios(3)).toEqual(['founder','board-crisis']);
  expect(unlockedScenarios(5)).toHaveLength(3);
  expect(newGame(42,{scenario:'board-crisis'}).metrics.confidence).toBe(28);
  expect(newGame(42,{scenario:'compliance-crisis'}).metrics.regulation).toBe(65);
 });
 it('permits final certification only after all seven stages and final requirements',()=>{
  const s=atStage(7);
  expect(dispatch(s,{type:'campaign',operation:'certify'})).toBe(s);
  const ready={...s,departments:s.departments.map(d=>({...d,active:true})),finance:{...s.finance,subscribers:120},compensation:5000,programmes:[{status:'complete'},{status:'complete'}] as GameState['programmes']};
  expect(campaignGates(ready).every(gateMet)).toBe(false);
  expect(dispatch(ready,{type:'campaign',operation:'certify'})).toBe(ready);
  const contained:GameState={...ready,boss:{...ready.boss,phase:'contained'}};
  expect(campaignGates(contained).every(gateMet)).toBe(true);
  const n=dispatch(contained,{type:'campaign',operation:'certify'});expect(n.ending).toBe('certified');
  expect(dispatch(n,{type:'endDay'})).toBe(n);
 });
 it('migrates v10 saves and rejects invalid stages and capacity',()=>{
  const s=newGame(),legacy={...s,version:10,campaign:undefined};
  expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:13,campaign:s.campaign});
  expect(validCampaign(s.campaign,1)).toBe(true);
  expect(decodeSave(JSON.stringify(s))).toEqual(s);
  expect(decodeSave(JSON.stringify({...s,capacity:4}))).toBeNull();
  expect(decodeSave(JSON.stringify({...s,campaign:{...s.campaign,stage:8}}))).toBeNull();
 });
});
