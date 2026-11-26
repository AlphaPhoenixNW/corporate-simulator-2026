import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {spawnBoss,initialBoss,runBoss,bossEligibility,validBoss,TRAINING_FEE,PROGRAMME_FEE,PROGRAMME_DAILY_FEE} from '../../src/engine/boss';
import {runMeetings} from '../../src/engine/meetings';
import {employeeEligibility,runEmployees} from '../../src/engine/employees';
import {departmentEligibility} from '../../src/engine/departments';
import {decodeSave} from '../../src/storage';
import type {GameState,BossCommand} from '../../src/engine/types';
const finale=():GameState=>{const s=newGame();return {...s,day:30,capacity:4,campaign:{...s.campaign,stage:7,enteredDay:30,history:Array.from({length:7},(_,i)=>({stage:i+1,day:i===6?30:i+1}))},metrics:{...s.metrics,confidence:95,perceived:95,actual:0}};};
const act=(s:GameState,operation:BossCommand['operation'])=>dispatch({...s,capacity:4},{type:'boss',operation});
const settle=(s:GameState,minutes:Record<number,number>={}):GameState=>{const r=runBoss(s,minutes);return {...s,day:s.day+1,boss:r.boss,employees:r.employees};};
const reassignment=():GameState=>{
 const promoted=act(spawnBoss(finale()),'promote'),booked=act(promoted,'committee');
 const r=runMeetings(booked.meetings,booked.nextMeetingId,booked.employees,booked.day,()=>.9);
 return settle({...booked,meetings:r.meetings,nextMeetingId:r.nextMeetingId},r.minutes);
};
describe('competent employee confrontation',()=>{
 it('spawns once at the final stage with a persistent 100-skill employee',()=>{
  const base=finale(),s=spawnBoss(base),e=s.employees.find(e=>e.id===s.boss.employeeId)!;
  expect(s.boss.phase).toBe('promotion');expect(e.skill).toBe(100);expect(e.level).toBe(1);
  expect(s.employees.length).toBe(base.employees.length+1);expect(s.departments.find(d=>d.id==='engineering')?.headcount).toBe(2);
  expect(spawnBoss(s)).toBe(s);expect(spawnBoss(newGame()).boss).toEqual(initialBoss());
  expect(spawnBoss({...base,campaign:{...base.campaign,mode:'sandbox'}}).boss.phase).toBe('dormant');
  expect(validBoss(s.boss,s)).toBe(true);
 });
 it('blocks dismissal, restructuring and involuntary loss of the antagonist',()=>{
  const s=spawnBoss(finale()),id=s.boss.employeeId!;
  expect(employeeEligibility(s,id,'redundancy')).toContain('retention');
  expect(departmentEligibility(s,'engineering','reduce')).toContain('retention');
  const low=s.employees.map(e=>e.id===id?{...e,morale:1}:e);
  const r=runEmployees(low,[],s.departments,s.day,()=>0,{},id);
  expect(r.employees.find(e=>e.id===id)?.status).toBe('active');
 });
 it('generates actual productivity in proportion to free employee time',()=>{
  const s=spawnBoss(finale()),id=s.boss.employeeId!;
  const r=runBoss(s,{});expect(r.delta.actual).toBe(8);expect(r.boss.usefulTasks).toBe(1);
  expect(r.employees.find(e=>e.id===id)?.usefulWork).toBe(1);
  expect(runBoss(s,{[id]:480}).delta.actual).toBeUndefined();
  expect(runBoss(s,{[id]:240}).delta.actual).toBe(4);
 });
 it('requires promotion through the actual employee management system',()=>{
  const s=spawnBoss(finale()),n=act(s,'promote');
  expect(n.boss.phase).toBe('committee');expect(n.cash).toBe(s.cash-250);
  expect(n.employees.find(e=>e.id===n.boss.employeeId)?.level).toBe(2);
  expect(s.boss.phase).toBe('promotion');
  expect(bossEligibility(n,{type:'boss',operation:'train'})).toContain('phase');
 });
 it('requires actual committee attendance, and allows cancelled bookings to be replaced',()=>{
  const s=act(spawnBoss(finale()),'promote'),booked=act(s,'committee');
  expect(booked.meetings[0].attendees).toContain(booked.boss.employeeId);
  expect(runBoss(booked,{}).boss.phase).toBe('committee');
  const cancelled=dispatch({...booked,capacity:4},{type:'meeting',operation:'cancel',id:booked.boss.committeeId!});
  expect(act(cancelled,'committee').boss.committeeId).not.toBe(booked.boss.committeeId);
  expect(reassignment().boss.phase).toBe('reassignment');
 });
 it('reassigns the employee through real department staffing',()=>{
  const s=reassignment(),n=act(s,'reassign');
  expect(n.boss.phase).toBe('training');expect(n.cash).toBe(s.cash-150);
  expect(n.employees.find(e=>e.id===n.boss.employeeId)?.department).toBe('executive');
  expect(n.departments.find(d=>d.id==='engineering')?.headcount).toBe(1);
 });
 it('requires training attendance on two days with sufficient free time',()=>{
  const s=act(reassignment(),'reassign'),n=act(s,'train'),id=n.boss.employeeId!;
  expect(n.cash).toBe(s.cash-TRAINING_FEE);expect(n.boss.trainingEnrolled).toBe(true);
  expect(runBoss(n,{[id]:400}).boss.trainingDays).toBe(0);
  const one=runBoss(n,{});expect(one.minutes[id]).toBe(180);
  expect(one.boss.trainingDays).toBe(1);
  expect(settle(settle(n)).boss.phase).toBe('programme');
 });
 it('funds a dedicated three-day transformation and awards containment only on completion',()=>{
  const s=settle(settle(act(act(reassignment(),'reassign'),'train'))),n=act(s,'appoint');
  expect(n.cash).toBe(s.cash-PROGRAMME_FEE);expect(n.boss.programmeSpend).toBe(PROGRAMME_FEE);
  const id=n.boss.employeeId!,first=runBoss(n,{});
  expect(first.minutes[id]).toBe(240);expect(first.cost).toBe(PROGRAMME_DAILY_FEE);
  const two=settle(settle(n)),last=runBoss(two,{});
  expect(last.boss.phase).toBe('contained');expect(last.boss.programmeSpend).toBe(1500);expect(last.delta.actual).toBe(-5);
  const final={...two,boss:last.boss,employees:last.employees};
  expect(runBoss(final,{}).cost).toBe(0);expect(validBoss(final.boss,final)).toBe(true);
 });
 it('settles the confrontation through daily engine dispatch and retains the save',()=>{
  const s=spawnBoss(finale()),n=dispatch(s,{type:'endDay'});
  expect(n.boss.usefulTasks).toBe(1);expect(n.day).toBe(31);
  expect(decodeSave(JSON.stringify(n))).toEqual(n);
 });
 it('blocks final certification until containment and migrates v11 saves',()=>{
  const s=finale(),legacy={...s,version:11,boss:undefined};
  expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:12,boss:initialBoss()});
  expect(dispatch(s,{type:'campaign',operation:'certify'})).toBe(s);
  const active=spawnBoss(s);expect(decodeSave(JSON.stringify(active))).toEqual(active);
  expect(decodeSave(JSON.stringify({...active,boss:{...active.boss,employeeId:999}}))).toBeNull();
 });
});
