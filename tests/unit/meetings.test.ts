import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {MEETING_DEFINITIONS,runMeetings,bookingCost,meetingEligibility,reservedMinutes,validMeetings} from '../../src/engine/meetings';
import {decodeSave} from '../../src/storage';
import {runDepartments} from '../../src/engine/departments';
import {runEmployees,payrollByDepartment} from '../../src/engine/employees';
import type {GameState,MeetingType} from '../../src/engine/types';
const book=(s:GameState,type:MeetingType='alignment',attendees=s.employees.map(e=>e.id),day=s.day)=>dispatch(s,{type:'meeting',operation:'schedule',meetingType:type,attendees,day});
describe('meeting simulation',()=>{
  it('implements eight meeting types and uses executive capacity',()=>{
    const s=newGame(),next=book(s);
    expect(Object.keys(MEETING_DEFINITIONS)).toHaveLength(8);
    expect(next.capacity).toBe(1);expect(next.cash).toBe(s.cash);
    expect(next.meetings[0]).toMatchObject({id:1,status:'scheduled',duration:120});
    expect(s.meetings).toHaveLength(0);
  });
  it('rejects duplicate attendees and past or distant dates',()=>{
    const s=newGame(),id=s.employees[0].id;
    expect(book(s,'standup',[id,id])).toBe(s);
    expect(book(s,'standup',[id],0)).toBe(s);
    expect(book(s,'standup',[id],9)).toBe(s);
    expect(book(s,'standup',[])).toBe(s);
  });
  it('respects calendar capacity and cancellation restores reserved time',()=>{
    let s=newGame();const id=s.employees[0].id;
    for(let i=0;i<4;i++)s=book({...s,capacity:2},'alignment',[id]);
    expect(reservedMinutes(s.meetings,1,id)).toBe(480);
    expect(meetingEligibility(s,{type:'meeting',operation:'schedule',meetingType:'standup',attendees:[id],day:1})).toBe('Calendar capacity exceeded');
    s=dispatch(s,{type:'meeting',operation:'cancel',id:1});
    expect(reservedMinutes(s.meetings,1,id)).toBe(360);
    expect(s.meetings[0].status).toBe('cancelled');
  });
  it('charges attendance fees and generates documents and person-minutes',()=>{
    const s=book(newGame());const next=dispatch(s,{type:'endDay'});
    expect(next.meetings[0]).toMatchObject({status:'held',personMinutes:360,cost:bookingCost('alignment',3)});
    expect(next.meetings[0].document).toContain('alignment matrix');
    expect(next.ledger.some(l=>l.label==='Strategic alignment workshop'&&l.amount===-210)).toBe(true);
  });
  it('does not hold future meetings prematurely',()=>{
    const s=book(newGame(),'standup',undefined,3);
    expect(dispatch(s,{type:'endDay'}).meetings[0].status).toBe('scheduled');
  });
  it('produces a recursive follow-up with bounded generation',()=>{
    const s=book(newGame(),'scheduling');
    const first=runMeetings(s.meetings,s.nextMeetingId,s.employees,1,()=>.5);
    expect(first.meetings[1]).toMatchObject({type:'prealignment',day:2,parentId:1,depth:1});
    const limited=runMeetings([{...s.meetings[0],depth:4}],2,s.employees,1,()=>0);
    expect(limited.meetings).toHaveLength(1);
  });
  it('excludes departed employees and cancels empty meetings',()=>{
    const s=book(newGame(),'standup',[1]);
    const result=runMeetings(s.meetings,s.nextMeetingId,s.employees.map(e=>e.id===1?{...e,status:'resigned' as const}:e),1,()=>.5);
    expect(result.meetings[0].status).toBe('cancelled');expect(result.costs).toHaveLength(0);
  });
  it('reduces actual productivity and morale through attendance',()=>{
    const s=book(newGame(),'alignment');
    const result=runMeetings(s.meetings,s.nextMeetingId,s.employees,1,()=>0);
    expect(result.delta.actual).toBeLessThan(0);expect(result.delta.perceived).toBeGreaterThan(0);
    expect(result.employees[0].morale).toBeLessThan(s.employees[0].morale);
    expect(result.meetings[0].outcome).toContain('Conflicting');
  });
  it('reduces department and employee operational time',()=>{
    const s=newGame(),id=s.employees.find(e=>e.department==='engineering')!.id;
    const ds=s.departments.map(d=>d.id==='engineering'?{...d,focus:'operations' as const}:d);
    const payroll=payrollByDepartment(s.employees);
    const free=runDepartments(ds,()=>.5,payroll,s.employees);
    const busy=runDepartments(ds,()=>.5,payroll,s.employees,{[id]:480});
    expect(busy.delta.actual!).toBeLessThan(free.delta.actual!);
    expect(busy.departments.find(d=>d.id==='engineering')?.progress).toBe(0);
    const people=runEmployees(s.employees,[],ds,1,()=>0,{[id]:480});
    expect(people.employees.find(e=>e.id===id)?.usefulWork).toBe(0);
  });
  it('migrates older saves and validates persisted meeting identities',()=>{
    const s=newGame(),legacy={...s,version:3,meetings:undefined,nextMeetingId:undefined};
    expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:6,meetings:[],nextMeetingId:1});
    const booked=book(s);
    expect(validMeetings(booked.meetings,booked.nextMeetingId,booked.employees)).toBe(true);
    expect(decodeSave(JSON.stringify(booked))).toEqual(booked);
    expect(decodeSave(JSON.stringify({...booked,meetings:[{...booked.meetings[0],attendees:[999]}]}))).toBeNull();
  });
});
