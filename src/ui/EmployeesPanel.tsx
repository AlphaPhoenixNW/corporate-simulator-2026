import { useState } from 'react';
import { DEPARTMENTS } from '../engine/departments';
import { EMPLOYEE_ARCHETYPES, employeeEligibility, redundancyCost, PROMOTION_COST, REVIEW_COST, DISCIPLINE_COST, REASSIGN_COST } from '../engine/employees';
import type { GameState, Command, DepartmentId, EmployeeCommand } from '../engine/types';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const grades=['','Individual contributor','Manager','Director','Executive'];
export function EmployeesPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const [filter,setFilter]=useState('active');
  const [selected,setSelected]=useState<number|null>(null);
  const [target,setTarget]=useState<DepartmentId|''>('');
  const [confirm,setConfirm]=useState(false);
  const active=state.employees.filter(e=>e.status==='active');
  const list=state.employees.filter(e=>filter==='all'||filter==='active'&&e.status==='active'||filter===e.department);
  const employee=list.find(e=>e.id===selected)??list[0];
  const controls:{op:EmployeeCommand['operation'];label:string}[]=employee?[
    {op:'review',label:'Performance review · '+money(REVIEW_COST)},
    {op:'promote',label:'Promote · '+money(PROMOTION_COST)},
    {op:'discipline',label:'Disciplinary proceeding · '+money(DISCIPLINE_COST)},
    {op:'redundancy',label:'Make redundant · '+money(redundancyCost(employee))},
    {op:'reassign',label:'Reassign · '+money(REASSIGN_COST)}
  ]:[];
  return <section className="panel departments" id="employees" aria-labelledby="people-heading">
    <p className="eyebrow">HUMAN CAPITAL INTELLIGENCE</p><h2 id="people-heading">Personnel directory</h2>
    <div className="department-summary"><div><span>Active employees</span><strong data-testid="employee-count">{active.length}</strong></div><div><span>Daily payroll</span><strong>{money(active.reduce((n,e)=>n+e.salary,0))}</strong></div><div><span>Promotion requests</span><strong>{active.filter(e=>e.promotionRequested).length}</strong></div><div><span>Departures to date</span><strong>{state.employees.length-active.length}</strong></div></div>
    <p className="hint">Recruit through the department workspace. People retain their identities when promoted or reassigned. Management grades reduce operational competence at the cost of higher salaries.</p>
    <div className="people-filter"><label htmlFor="people-filter">Filter personnel</label><select id="people-filter" value={filter} onChange={e=>{setFilter(e.target.value);setSelected(null);setConfirm(false);}}><option value="active">Active employees</option><option value="all">All records</option>{state.departments.filter(d=>d.active).map(d=><option key={d.id} value={d.id}>{DEPARTMENTS[d.id].name}</option>)}</select></div>
    <div className="department-workspace">
      <div className="department-list people-list" aria-label="Employee selection">{list.map(e=><button key={e.id} aria-pressed={employee?.id===e.id} className={'department-tab'+(employee?.id===e.id?' selected':'')} onClick={()=>{setSelected(e.id);setTarget('');setConfirm(false);}}><span>{e.name} · #{e.id}</span><small>{EMPLOYEE_ARCHETYPES[e.archetype].name} · {e.status}</small></button>)}{!list.length&&<p className="hint">No personnel records.</p>}</div>
      {employee&&<article className="department-detail" aria-label="Employee profile">
        <div className="person-heading"><span className="person-avatar" aria-hidden="true">{employee.name.split(' ').map(s=>s[0]).join('')}</span><div><p className="eyebrow">{DEPARTMENTS[employee.department].name} · STAFF #{employee.id}</p><h3>{employee.name}</h3><p className="hint">{EMPLOYEE_ARCHETYPES[employee.archetype].name} · {grades[employee.level]}</p></div></div>
        <p className="hint">{EMPLOYEE_ARCHETYPES[employee.archetype].description}</p>
        <div className="department-stats"><div><span>Daily salary</span><strong data-testid="employee-salary">{money(employee.salary)}</strong></div><div><span>Grade</span><strong data-testid="employee-grade">{grades[employee.level]}</strong></div><div><span>Useful tasks</span><strong>{employee.usefulWork}</strong></div><div><span>Joined</span><strong>Day {employee.joined}</strong></div></div>
        <div className="department-metrics">{([['Skill',employee.skill],['Ambition',employee.ambition],['Morale',employee.morale],['Political aptitude',employee.politics]] as const).map(([label,value])=><div className="metric" key={label}><div className="metric-label"><span>{label}</span><strong>{value}/100</strong></div><meter min={0} max={100} value={value} aria-label={label}>{value}</meter></div>)}</div>
        <p className="department-report"><strong>Personnel record</strong><br/>{employee.report}<br/>Reviews: {employee.reviews} · Warnings: {employee.warnings} · Complaints: {employee.complaints}<br/>{employee.lastReview}{employee.promotionRequested&&<><br/><strong>Promotion requested</strong></>}{employee.departed!==null&&<><br/>Departed on day {employee.departed}</>}</p>
        <h4>Working relationships</h4><div className="relationships">{state.relationships.filter(r=>r.a===employee.id||r.b===employee.id).map(r=>{const other=state.employees.find(e=>e.id===(r.a===employee.id?r.b:r.a));return <p key={r.a+':'+r.b}>{other?.name} · {r.affinity>=50?'Alliance':r.affinity<=-50?'Rivalry':r.affinity>0?'Positive':'Tense'} ({r.affinity})</p>;})}{!state.relationships.some(r=>r.a===employee.id||r.b===employee.id)&&<p className="hint">No recorded working relationships yet.</p>}</div>
        {employee.status==='active'&&<><div className="people-filter"><label htmlFor="reassign-target">Reassignment destination</label><select id="reassign-target" value={target} onChange={e=>setTarget(e.target.value as DepartmentId|'')}><option value="">Choose department</option>{state.departments.filter(d=>d.active&&d.id!==employee.department).map(d=><option key={d.id} value={d.id}>{DEPARTMENTS[d.id].name}</option>)}</select></div><div className="department-controls">{controls.map(({op,label})=>{const reason=employeeEligibility(state,employee.id,op,target||undefined);return <div key={op}><button className="secondary" disabled={!!reason} onClick={()=>{if(op==='redundancy'){setConfirm(true);return;}setConfirm(false);send({type:'employee',id:employee.id,operation:op,target:target||undefined});}}>{label}</button>{reason&&<small>{reason}</small>}</div>;})}</div>
        {confirm&&<div className="redundancy-confirm"><p>Remove {employee.name} from active employment? Severance: {money(redundancyCost(employee))}.</p><div className="controls"><button disabled={!!employeeEligibility(state,employee.id,'redundancy')} onClick={()=>{send({type:'employee',id:employee.id,operation:'redundancy'});setConfirm(false);}}>Confirm redundancy</button><button className="secondary" onClick={()=>setConfirm(false)}>Cancel</button></div></div>}</>}
      </article>}
    </div>
  </section>;
}
