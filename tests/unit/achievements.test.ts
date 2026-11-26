import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {ACHIEVEMENTS,ACHIEVEMENT_CATEGORIES,initialAchievements,validAchievements,validAchievementUnlocks,mergeAchievementProfile,updateAchievements} from '../../src/engine/achievements';
import {decodeSave} from '../../src/storage';
import type {GameState} from '../../src/engine/types';
const has=(s:GameState,id:string)=>s.achievements.unlocked.some(u=>u.id===id);
describe('strategic recognition',()=>{
 it('defines 74 individually named functional awards in eight categories',()=>{
  expect(ACHIEVEMENTS).toHaveLength(74);expect(ACHIEVEMENT_CATEGORIES).toHaveLength(8);
  expect(new Set(ACHIEVEMENTS.map(a=>a.id)).size).toBe(74);
  expect(new Set(ACHIEVEMENTS.map(a=>a.name)).size).toBe(74);
  expect(ACHIEVEMENTS.every(a=>a.description.length>10&&typeof a.test==='function')).toBe(true);
  expect(ACHIEVEMENTS.filter(a=>a.test(newGame()))).toHaveLength(0);
 });
 it('tracks successful actions immutably and unlocks each award only once',()=>{
  const s=newGame(),first=dispatch(s,{type:'action',id:'rest'});
  expect(has(first,'bed-led-leadership')).toBe(true);expect(first.achievements.actions.rest).toBe(1);
  expect(s.achievements).toEqual(initialAchievements());
  const second=dispatch(first,{type:'action',id:'rest'});
  expect(second.achievements.unlocked.filter(u=>u.id==='bed-led-leadership')).toHaveLength(1);
  expect(dispatch(second,{type:'action',id:'rest'})).toBe(second);
  let n=second;
  for(let i=0;i<3;i++)n=dispatch({...n,capacity:2},{type:'action',id:'rest'});
  expect(has(n,'horizontal-executive')).toBe(true);
 });
 it('counts only consecutive days of unused executive capacity',()=>{
  let s=newGame();
  for(let i=0;i<3;i++){
   const next=dispatch({...s,pendingEvent:null},{type:'endDay'});
   s=next;
  }
  expect(s.achievements.bestIdleStreak).toBe(3);expect(has(s,'strategically-unavailable')).toBe(true);
  const busy=dispatch({...s,pendingEvent:null},{type:'action',id:'rest'}),next=dispatch(busy,{type:'endDay'});
  expect(next.achievements.idleStreak).toBe(0);expect(next.achievements.bestIdleStreak).toBe(3);
 });
 it('recognises recorded incident choices rather than simply encountering an event',()=>{
  const s={...newGame(),pendingEvent:'functional-product'};
  expect(has(dispatch(s,{type:'choose',id:'committee'}),'not-launched')).toBe(true);
  expect(has(dispatch(s,{type:'choose',id:'launch'}),'not-launched')).toBe(false);
 });
 it('recognises actual employee promotion and OS shutdown',()=>{
  const s=newGame(),n=dispatch(s,{type:'employee',id:s.employees[0].id,operation:'promote'});
  expect(has(n,'first-promotion')).toBe(true);
  const boot=dispatch(s,{type:'os',operation:'boot'}),off=dispatch(boot,{type:'os',operation:'shutdown'});
  expect(has(boot,'boot')).toBe(true);expect(has(off,'zero-token')).toBe(true);
  expect(has(boot,'zero-token')).toBe(false);
 });
 it('requires both high perceived and low actual productivity for synergy',()=>{
  const s=newGame(),rule=ACHIEVEMENTS.find(a=>a.id==='synergy-without-substance')!;
  expect(rule.test({...s,metrics:{...s.metrics,perceived:80,actual:10}})).toBe(true);
  expect(rule.test({...s,metrics:{...s.metrics,perceived:80,actual:11}})).toBe(false);
 });
 it('awards achievements at terminal outcomes and distinguishes difficulty',()=>{
  const s=newGame(),failed=dispatch({...s,metrics:{...s.metrics,actual:69}},{type:'action',id:'wellbeing'});
  expect(has(failed,'useful-failure')).toBe(true);
  const won:GameState={...s,ending:'certified',campaign:{...s.campaign,difficulty:'ruthless'}};
  const result=updateAchievements(s,won,{type:'campaign',operation:'certify'});
  expect(result.unlocked.map(u=>u.id)).toEqual(expect.arrayContaining(['nothing-scale','ruthless']));
  expect(result.unlocked.some(u=>u.id==='useful-failure')).toBe(false);
 });
 it('requires zero useful releases for the resource consumption award',()=>{
  const s=newGame(),rule=ACHIEVEMENTS.find(a=>a.id==='resource-consumption')!;
  expect(rule.test({...s,agents:{...s.agents,totalTokens:100000}})).toBe(true);
  expect(rule.test({...s,agents:{...s.agents,totalTokens:100000,usefulRuns:1}})).toBe(false);
 });
 it('merges lifetime collections without duplicate awards or replacing first earned day',()=>{
  const first=[{id:'boot',day:8}],second=[{id:'boot',day:1},{id:'zero-token',day:2}];
  expect(mergeAchievementProfile(first,second)).toEqual([{id:'boot',day:8},{id:'zero-token',day:2}]);
  expect(validAchievementUnlocks([...first,...second])).toBe(false);
 });
 it('migrates v12 without fabricating historical actions and validates persistent awards',()=>{
  const s=newGame(),legacy={...s,version:12,achievements:undefined};
  expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:13,achievements:initialAchievements()});
  const n=dispatch(s,{type:'action',id:'rest'});
  expect(validAchievements(n.achievements,n.day)).toBe(true);
  expect(decodeSave(JSON.stringify(n))).toEqual(n);
  expect(decodeSave(JSON.stringify({...n,achievements:{...n.achievements,unlocked:[{id:'invented-award',day:1}]}}))).toBeNull();
 });
});
