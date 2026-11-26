import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {introduced,visibleWorkspaces,newlyIntroduced,INTRODUCTIONS} from '../../src/ui/progression';
import {WORKSPACES} from '../../src/ui/workspaces';
const stage=(n:number)=>{const s=newGame();return {...s,day:12,campaign:{...s.campaign,stage:n}};};
describe('progressive executive introductions',()=>{
 it('starts with only the four essential workspaces',()=>{
  const s=newGame();expect(visibleWorkspaces(s,false).map(w=>w.id)).toEqual(['office','campaign','departments','finance']);
  expect(visibleWorkspaces(s,true)).toHaveLength(WORKSPACES.length-1);
  expect(visibleWorkspaces(s,false,'nothing-os').some(w=>w.id==='nothing-os')).toBe(true);
 });
 it('reveals relevant workspaces at working-day and stage milestones',()=>{
  const s=newGame(),day2=dispatch(s,{type:'endDay'});
  expect(newlyIntroduced(s,day2)).toEqual(expect.arrayContaining(['employees','incidents','ledger','activity']));
  expect(introduced(stage(2),'communications')).toBe(true);
  expect(introduced(stage(2),'programmes')).toBe(false);
  expect(introduced(stage(3),'programmes')).toBe(true);
  expect(introduced(stage(4),'nothing-os')).toBe(true);
  expect(introduced(stage(4),'agents')).toBe(false);
  expect(introduced(stage(5),'agents')).toBe(true);
  expect(introduced(stage(7),'containment')).toBe(true);
 });
 it('preserves early access and reveals previously used features',()=>{
  const s=newGame(),n=dispatch(s,{type:'os',operation:'boot'});
  expect(introduced(s,'nothing-os')).toBe(false);
  expect(introduced(n,'nothing-os')).toBe(true);
  expect(newlyIntroduced(s,n)).toContain('nothing-os');
  expect(newlyIntroduced(n,n)).toEqual([]);
  const award=dispatch(s,{type:'action',id:'rest'});
  expect(introduced(award,'achievements')).toBe(true);
 });
 it('offers all applicable workspaces in sandbox',()=>{
  const s=newGame(2026,{mode:'sandbox'});expect(visibleWorkspaces(s,false)).toHaveLength(WORKSPACES.length-1);
 });
 it('includes a practical introduction and risk explanation for each management workspace',()=>{
  for(const w of WORKSPACES){if(w.id==='office')continue;const intro=INTRODUCTIONS[w.id];expect(intro.purpose.length).toBeGreaterThan(20);expect(intro.first.length).toBeGreaterThan(20);expect(intro.risk.length).toBeGreaterThan(20);}
 });
});
