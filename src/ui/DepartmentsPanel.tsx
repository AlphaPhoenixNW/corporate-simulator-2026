import { useState } from 'react';
import { DEPARTMENTS, departmentEligibility, ACTIVATION_COST, HIRE_COST, BUDGET_STEP } from '../engine/departments';
import { payrollByDepartment } from '../engine/employees';
import type { GameState, Command, DepartmentCommand, DepartmentId } from '../engine/types';

const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export function DepartmentsPanel({state,send}:{state:GameState;send:(command:Command)=>void}){
  const [selected,setSelected]=useState<DepartmentId>('engineering');
  const d=state.departments.find(x=>x.id===selected)!;
  const definition=DEPARTMENTS[d.id];
  const active=state.departments.filter(x=>x.active);
  const totalHeadcount=active.reduce((n,x)=>n+x.headcount,0);
  const payroll=payrollByDepartment(state.employees);
  const daily=active.reduce((n,x)=>n+x.budget+(payroll[x.id]??0),0);
  const operations:{op:DepartmentCommand['operation'];label:string}[]=d.active?[
    {op:'increase',label:'Increase budget '+money(BUDGET_STEP)},{op:'decrease',label:'Decrease budget '+money(BUDGET_STEP)},
    {op:'hire',label:'Hire staff · '+money(HIRE_COST)},{op:'reduce',label:'Reduce headcount'},
    {op:'focus',label:d.focus==='governance'?'Switch to operations':'Switch to governance'}
  ]:[{op:'activate',label:'Establish department · '+money(ACTIVATION_COST)}];
  return <section className="panel departments" id="departments" aria-labelledby="department-heading">
    <p className="eyebrow">ORGANISATIONAL GOVERNANCE</p><h2 id="department-heading">Corporate departments</h2>
    <div className="department-summary"><div><span>Active departments</span><strong>{active.length} / 10</strong></div><div><span>Allocated headcount</span><strong>{totalHeadcount}</strong></div><div><span>Daily departmental cost</span><strong>{money(daily)}</strong></div><div><span>Resource requests</span><strong>{active.filter(x=>x.request).length}</strong></div></div>
    <p className="hint">Departmental actions use one executive capacity. Budgets are daily operating allocations, plus individual employee salaries. Departments become available over the opening working days.</p>
    <div className="department-workspace">
      <div className="department-list" aria-label="Department selection">{state.departments.map(x=><button key={x.id} aria-pressed={selected===x.id} onClick={()=>setSelected(x.id)} className={'department-tab'+(selected===x.id?' selected':'')}><span>{DEPARTMENTS[x.id].name}</span><small>{x.active?(x.request?'Resource request':'Active'):state.day>=DEPARTMENTS[x.id].unlockDay?'Available':'Day '+DEPARTMENTS[x.id].unlockDay}</small></button>)}</div>
      <article className="department-detail" aria-label={definition.name+' details'}>
        <p className="eyebrow">{d.active?'ACTIVE DEPARTMENT':state.day>=definition.unlockDay?'AVAILABLE FOR ESTABLISHMENT':'NOT YET AVAILABLE'}</p>
        <h3>{definition.name}</h3><p className="hint">{definition.objective}</p>
        {d.active?<><div className="department-stats"><div><span>Daily budget</span><strong data-testid="department-budget">{money(d.budget)}</strong></div><div><span>Headcount</span><strong>{d.headcount}</strong></div><div><span>Focus</span><strong>{d.focus==='governance'?'Governance':'Operations'}</strong></div><div><span>Last daily spend</span><strong>{money(d.spent)}</strong></div></div>
        <div className="department-metrics">{([['Morale',d.morale],['Competence',d.competence],['Influence',d.influence],['Objective progress',d.progress]] as const).map(([name,value])=><div key={name} className="metric"><div className="metric-label"><span>{name}</span><strong>{value}/100</strong></div><meter min={0} max={100} value={value} aria-label={definition.name+' '+name}>{value}</meter></div>)}</div>
        <p className="department-report"><strong>Latest operational report</strong><br/>{d.report}</p></>:<p className="hint">Unlocks on working day {definition.unlockDay}. Establishment includes one staff allocation.</p>}
        <div className="department-controls">{operations.map(({op,label})=>{const reason=departmentEligibility(state,d.id,op);return <div key={op}><button className="secondary" disabled={!!reason} onClick={()=>send({type:'department',id:d.id,operation:op})}>{label}</button>{reason&&<small>{reason}</small>}</div>})}</div>
      </article>
    </div>
  </section>;
}
