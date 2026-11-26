import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {createEmployee,EMPLOYEE_ARCHETYPES,runEmployees,payrollByDepartment,validEmployees} from '../../src/engine/employees';
import {decodeSave} from '../../src/storage';
describe('employee simulation',()=>{
  it('generates persistent seeded identities and ten archetypes',()=>{
    expect(Object.keys(EMPLOYEE_ARCHETYPES)).toHaveLength(10);
    const s=newGame(42);expect(s.employees).toEqual(newGame(42).employees);
    expect(s.employees).toHaveLength(3);
    expect(s.employees.find(e=>e.department==='engineering')?.archetype).toBe('engineer');
    expect(validEmployees(s.employees,s.relationships,s.nextEmployeeId,s.departments)).toBe(true);
  });
  it('hires named staff and pays their individual salaries without double counting',()=>{
    const s=dispatch(newGame(),{type:'department',id:'engineering',operation:'hire'});
    expect(s.employees).toHaveLength(4);expect(s.nextEmployeeId).toBe(5);
    expect(s.departments.find(d=>d.id==='engineering')?.headcount).toBe(2);
    const next=dispatch(s,{type:'endDay'});
    expect(next.ledger.find(l=>l.label==='Engineering operating costs')?.amount).toBe(-(100+payrollByDepartment(s.employees).engineering!));
  });
  it('promotes a competent employee into management while increasing salary',()=>{
    const s=newGame(),e=s.employees.find(e=>e.department==='engineering')!;
    const next=dispatch(s,{type:'employee',id:e.id,operation:'promote'});
    const promoted=next.employees.find(x=>x.id===e.id)!;
    expect(promoted.level).toBe(2);expect(promoted.salary).toBeGreaterThan(e.salary);
    expect(next.metrics.actual).toBe(s.metrics.actual-2);
    expect(next.departments.find(d=>d.id==='engineering')!.competence).toBeLessThan(s.departments.find(d=>d.id==='engineering')!.competence);
    expect(s.employees.find(x=>x.id===e.id)?.level).toBe(1);
  });
  it('records reviews and disciplinary proceedings',()=>{
    const s=newGame(),id=s.employees[0].id;
    const reviewed=dispatch(s,{type:'employee',id,operation:'review'});
    const warned=dispatch(reviewed,{type:'employee',id,operation:'discipline'});
    expect(warned.employees[0]).toMatchObject({reviews:1,warnings:1,complaints:1});
    expect(warned.capacity).toBe(0);
  });
  it('reassigns named staff while maintaining staffing limits',()=>{
    const s=newGame(),id=s.employees.find(e=>e.department==='engineering')!.id;
    expect(dispatch(s,{type:'employee',id,operation:'reassign',target:'finance'})).toBe(s);
    const hired=dispatch(s,{type:'department',id:'engineering',operation:'hire'});
    const moved=dispatch(hired,{type:'employee',id,operation:'reassign',target:'finance'});
    expect(moved.employees.find(e=>e.id===id)?.department).toBe('finance');
    expect(moved.departments.find(d=>d.id==='finance')?.headcount).toBe(2);
  });
  it('records redundancy and pays severance, preserving the employee record',()=>{
    const s=dispatch(newGame(),{type:'department',id:'engineering',operation:'hire'});
    const e=s.employees[s.employees.length-1];
    const next=dispatch(s,{type:'employee',id:e.id,operation:'redundancy'});
    expect(next.cash).toBe(s.cash-e.salary*5);
    expect(next.employees.find(x=>x.id===e.id)).toMatchObject({status:'redundant',departed:s.day});
    expect(next.departments.find(d=>d.id==='engineering')?.headcount).toBe(1);
  });
  it('simulates useful work, promotion requests, complaints and resignation',()=>{
    const s=newGame();
    const e={...createEmployee(1,10,'engineering',1,true),morale:5};
    const team=[...s.employees,e];
    const departments=s.departments.map(d=>d.id==='engineering'?{...d,headcount:2,focus:'operations' as const}:d);
    const daily=runEmployees(team,[],departments,5,()=>0);
    const after=daily.employees.find(x=>x.id===10)!;
    expect(after.status).toBe('resigned');expect(after.complaints).toBe(1);expect(after.usefulWork).toBe(1);
    expect(daily.employees.some(x=>x.promotionRequested)).toBe(true);
  });
  it('forms persistent alliances and rivalries through repeated interactions',()=>{
    const s=newGame();
    const team=s.employees.slice(0,2).map(e=>({...e,politics:50}));
    const one=runEmployees(team,[],s.departments,1,()=>.5);
    const two=runEmployees(one.employees,one.relationships,s.departments,2,()=>.5);
    expect(two.relationships[0].affinity).toBe(50);
    const rivals=team.map((e,i)=>({...e,politics:i*100}));
    const first=runEmployees(rivals,[],s.departments,1,()=>.5);
    const second=runEmployees(first.employees,first.relationships,s.departments,2,()=>.5);
    expect(second.relationships[0].affinity).toBe(-50);
  });
  it('migrates v2 staffing and rejects corrupt identity records',()=>{
    const s=dispatch(newGame(),{type:'department',id:'finance',operation:'hire'});
    const legacy={...s,version:2,employees:undefined,relationships:undefined,nextEmployeeId:undefined};
    const migrated=decodeSave(JSON.stringify(legacy))!;
    expect(migrated).toMatchObject({version:5,cash:s.cash,rng:s.rng});
    expect(migrated.employees).toHaveLength(4);
    expect(decodeSave(JSON.stringify(migrated))).toEqual(migrated);
    expect(decodeSave(JSON.stringify({...migrated,employees:[...migrated.employees,migrated.employees[0]]}))).toBeNull();
  });
});
