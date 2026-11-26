import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {collectNotices,cashHistory,chartPoints,organisation,decodePreferences,DEFAULT_PREFERENCES} from '../../src/ui/experience';
import {frequency,CUES,CorporateAudio} from '../../src/ui/audio';
import {AMBIENT_STEP,AMBIENT_DURATION,AMBIENT_CHORDS,ambientFrame} from '../../src/ui/ambience';
describe('enterprise experience',()=>{
 it('reports new achievements without repeating existing recognition',()=>{
  const s=newGame(),n=dispatch(s,{type:'action',id:'rest'});
  expect(collectNotices(s,n)).toEqual(expect.arrayContaining([expect.objectContaining({kind:'award',detail:'Bed-Led Leadership',target:'achievements'})]));
  expect(collectNotices(n,n)).toEqual([]);
 });
 it('reports a newly pending decision and terminal board notice',()=>{
  const s=newGame(),n=dispatch(s,{type:'endDay'});
  expect(collectNotices(s,n).some(x=>x.kind==='incident')).toBe(true);
  expect(collectNotices(s,{...s,ending:'useful'}).some(x=>x.kind==='ending')).toBe(true);
 });
 it('builds a live organisation from actual active personnel',()=>{
  const s=newGame(),groups=organisation(s);
  expect(groups).toHaveLength(10);expect(groups.reduce((n,g)=>n+g.employees.length,0)).toBe(3);
  expect(groups.find(g=>g.id==='engineering')?.employees.length).toBe(1);
 });
 it('uses recorded liquidity and current balance rather than invented history',()=>{
  const s=newGame(),n=dispatch(s,{type:'endDay'});
  expect(cashHistory(s)).toEqual([{day:1,value:s.cash}]);
  expect(cashHistory(n).at(-1)).toEqual({day:n.day,value:n.cash});
 });
 it('scales chart points safely for empty, flat and varying values',()=>{
  expect(chartPoints([])).toEqual([]);expect(chartPoints([10])).toEqual([{x:10,y:45}]);
  expect(chartPoints([5,5]).map(p=>p.y)).toEqual([45,45]);
  expect(chartPoints([0,10])).toEqual([{x:10,y:80},{x:290,y:10}]);
 });
 it('defaults to silent audio and validates saved preferences',()=>{
  expect(decodePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  expect(decodePreferences('{bad')).toEqual(DEFAULT_PREFERENCES);
  expect(decodePreferences(JSON.stringify({audio:true,music:true,reduced:true,volume:150}))).toEqual({audio:true,music:true,reduced:true,volume:100});
  expect(decodePreferences(JSON.stringify({audio:'yes',volume:-5}))).toMatchObject({audio:false,volume:0});
 });
 it('defines six contextual cues, with safe inactive lifecycle',()=>{
  expect(frequency(69)).toBe(440);expect(Object.keys(CUES)).toHaveLength(6);
  const audio=new CorporateAudio();audio.configure(false,false,35);audio.play('award');audio.dispose();
 });
});
