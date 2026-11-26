import { useState } from 'react';
import { PROGRAMME_TYPES, type ProgrammeType, type GameState, type Command, type ProgrammeCommand } from '../engine/types';
import { PROGRAMME_DEFINITIONS, programmeEligibility, TOPUP } from '../engine/programmes';
import { DEPARTMENTS } from '../engine/departments';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export function ProgrammesPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const [selected,setSelected]=useState<ProgrammeType>('cloud');
  const [lead,setLead]=useState<number|null>(null);
  const [confirm,setConfirm]=useState(false);
  const def=PROGRAMME_DEFINITIONS[selected],p=state.programmes.find(x=>x.type===selected);
  const candidates=state.employees.filter(e=>e.status==='active'&&e.department===def.sponsor);
  const leadId=candidates.some(e=>e.id===lead)?lead!:candidates[0]?.id??0;
  const committee=state.meetings.find(m=>m.id===p?.committeeId);
  const currentLead=state.employees.find(e=>e.id===p?.leadId);
  const leadAvailable=currentLead?.status==='active'&&currentLead.department===def.sponsor;
  const closed=p?.status==='complete'||p?.status==='cancelled';
  const controls: {label:string;command:ProgrammeCommand}[]=!p?[{label:'Commission programme · '+money(def.launchFee),command:{type:'programme',operation:'commission',programme:selected,leadId}}]:closed?[]:[
    {label:'Authorise '+money(TOPUP)+' additional budget',command:{type:'programme',operation:'topup',programme:selected}},
    {label:'Replace programme lead',command:{type:'programme',operation:'replace-lead',programme:selected,leadId}},
    ...(p.status==='review'?[{label:'Convene milestone committee',command:{type:'programme',operation:'committee',programme:selected} as const},{label:'Approve milestone',command:{type:'programme',operation:'approve',programme:selected} as const}]:[]),
    ...(p.status==='active'?[{label:'Pause programme',command:{type:'programme',operation:'pause',programme:selected} as const}]:p.status==='paused'?[{label:'Resume programme',command:{type:'programme',operation:'resume',programme:selected} as const}]:[])
  ];
  return <section className="panel departments" id="programmes" aria-labelledby="programmes-heading">
    <p className="eyebrow">ENTERPRISE TRANSFORMATION OFFICE</p><h2 id="programmes-heading">Transformation portfolio</h2>
    <div className="department-summary"><div><span>Programmes commissioned</span><strong data-testid="programme-count">{state.programmes.length}/9</strong></div><div><span>Authorised budget</span><strong>{money(state.programmes.reduce((n,x)=>n+x.budget,0))}</strong></div><div><span>Consultancy expenditure</span><strong>{money(state.programmes.reduce((n,x)=>n+x.consultancy,0))}</strong></div><div><span>Accidental usefulness incidents</span><strong>{state.programmes.reduce((n,x)=>n+x.incidents,0)}</strong></div></div>
    <div className="programme-workspace">
      <div className="department-tabs" aria-label="Programme selection">{PROGRAMME_TYPES.map(t=>{const x=state.programmes.find(q=>q.type===t);return <button key={t} className="secondary" aria-pressed={t===selected} onClick={()=>{setSelected(t);setLead(null);setConfirm(false);}}>{PROGRAMME_DEFINITIONS[t].name}<small>{x?x.status.toUpperCase():'NOT COMMISSIONED'}</small></button>;})}</div>
      <article className="department-detail" aria-label="Programme details">
        <p className="eyebrow">{DEPARTMENTS[def.sponsor].name} · {p?.status.toUpperCase()??'PROPOSAL'}</p>
        <h3>{def.name}</h3><p className="hint">{def.description}</p>
        <div className="department-summary"><div><span>Budget</span><strong>{money(p?.budget??def.budget)}</strong></div><div><span>Spend to date</span><strong data-testid="programme-spend">{money(p?.spent??0)}</strong></div><div><span>Daily consultancy</span><strong>{money(def.dailyFee)}</strong></div><div><span>Scope expansions</span><strong>{p?.scopeCreep??0}</strong></div></div>
        <p className="hint">Budget is a spending ceiling, not an upfront payment. Consultancy charges accrue on active days; steering committee fees are recorded separately in the corporate ledger.</p>
        <h4>Prerequisites</h4>{def.dependencies.length===0?<p className="hint">No programme dependencies.</p>:<ul className="programme-dependencies">{def.dependencies.map(t=><li key={t}>{PROGRAMME_DEFINITIONS[t].name} · {state.programmes.some(x=>x.type===t&&x.status==='complete')?'Certified':'Not certified'}</li>)}</ul>}
        {p&&<><p className="hint">Programme lead: {currentLead?.name??'Unavailable'}{!leadAvailable?' (replacement required)':''} · Incidents: {p.incidents}</p>{p.status==='active'&&p.spent+def.dailyFee>p.budget&&<p role="status" className="department-report">Budget exhausted. Authorise additional allocation to resume work.</p>}</>}
        <h4>Milestone governance</h4><ol className="programme-milestones">{def.milestones.map((m,i)=><li key={m}><strong>{m}</strong><span>{i<(p?.milestone??0)?'Certified':p&&i===p.milestone?p.status==='review'?'Awaiting governance review':p.status.toUpperCase():'Not started'}</span>{p&&i===p.milestone&&<><progress max={p.target} value={p.progress} aria-label="Current milestone progress"/><small>{p.progress}/{p.target} work units</small></>}</li>)}</ol>
        {committee&&<p className="department-report">Steering committee #{committee.id}: {committee.status} · working day {committee.day}</p>}
        {!closed&&<><div className="people-filter"><label htmlFor="programme-lead">{p?'Replacement lead':'Programme lead'}</label><select id="programme-lead" value={leadId} onChange={e=>setLead(Number(e.target.value))}>{!candidates.length&&<option value={0}>No active sponsor employee</option>}{candidates.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
        <div className="controls programme-controls">{controls.map(({label,command})=>{const reason=programmeEligibility(state,command);return <div key={command.operation}><button className="secondary" disabled={!!reason} onClick={()=>send(command)}>{label}</button>{reason&&<small>{reason}</small>}</div>;})}</div>
        {p&&<div className="controls"><button className="secondary" disabled={!!programmeEligibility(state,{type:'programme',operation:'cancel',programme:selected})} onClick={()=>setConfirm(true)}>Cancel programme</button>{confirm&&<button onClick={()=>{send({type:'programme',operation:'cancel',programme:selected});setConfirm(false);}}>Confirm cancellation</button>}</div>}</>}
        {p&&<><h4>Governance record</h4><div className="meeting-list">{p.history.slice().reverse().map((h,i)=><p key={i} className="meeting-record">{h}</p>)}</div></>}
      </article>
    </div>
  </section>;
}
