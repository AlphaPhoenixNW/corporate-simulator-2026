import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {createBackup,decodeBackup,tutorialAdvance,TUTORIAL_STEPS} from '../../src/ui/onboarding';
import {canRegisterWebApp} from '../../src/ui/webApp';
describe('one-click executive onboarding',()=>{
 it('defines six optional induction steps and advances only on intended accepted commands',()=>{
  const s=newGame(),announce={type:'action',id:'statement'} as const,n=dispatch(s,announce);
  expect(TUTORIAL_STEPS).toHaveLength(6);expect(tutorialAdvance(0,s,s,announce)).toBe(0);
  expect(tutorialAdvance(0,s,n,announce)).toBe(1);
  const alignment={type:'action',id:'alignment'} as const,next=dispatch(n,alignment);
  expect(tutorialAdvance(1,n,next,alignment)).toBe(2);
  const close={type:'endDay'} as const,day=dispatch(next,close);
  expect(tutorialAdvance(2,next,day,close)).toBe(3);
 });
 it('preserves the full simulation and independent lifetime recognition in an export',()=>{
  const s=dispatch(newGame(),{type:'action',id:'rest'}),backup=createBackup(s,3,[{id:'boot',day:4}]);
  expect(backup.highestStage).toBe(3);expect(backup.achievements.map(a=>a.id)).toEqual(['boot','bed-led-leadership']);
  expect(decodeBackup(JSON.stringify(backup))).toEqual(backup);
 });
 it('imports raw legacy save data as well as the backup envelope',()=>{
  const s=newGame();expect(decodeBackup(JSON.stringify(s))?.game).toEqual(s);
  expect(decodeBackup(JSON.stringify({...s,version:12,achievements:undefined}))?.game.version).toBe(13);
 });
 it('rejects unsupported versions, corrupted balances and invalid profile entries',()=>{
  const s=newGame(),b=createBackup(s,1,[]);
  expect(decodeBackup('{broken')).toBeNull();
  expect(decodeBackup(JSON.stringify({...b,version:2}))).toBeNull();
  expect(decodeBackup(JSON.stringify({...b,highestStage:8}))).toBeNull();
  expect(decodeBackup(JSON.stringify({...b,game:{...s,cash:s.cash+1}}))).toBeNull();
  expect(decodeBackup(JSON.stringify({...b,achievements:[{id:'not-real',day:1}]}))).toBeNull();
 });
 it('registers a worker only for production web origins with browser support',()=>{
  expect(canRegisterWebApp('https:',true,true)).toBe(true);
  expect(canRegisterWebApp('http:',true,true)).toBe(true);
  expect(canRegisterWebApp('file:',true,true)).toBe(false);
  expect(canRegisterWebApp('https:',false,true)).toBe(false);
  expect(canRegisterWebApp('https:',true,false)).toBe(false);
 });
});
