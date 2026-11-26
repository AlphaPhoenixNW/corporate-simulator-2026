import {useState} from 'react';
import type {GameState} from '../engine/types';
import {cashHistory,chartPoints,organisation} from './experience';
import {actualLimit} from '../engine/campaign';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export function ExecutiveIntelligence({state}:{state:GameState}){
 const [selected,setSelected]=useState('engineering');
 const groups=organisation(state),group=groups.find(d=>d.id===selected)??groups[0];
 const history=cashHistory(state),points=chartPoints(history.map(p=>p.value));
 const line=points.map(p=>p.x+','+p.y).join(' ');
 const m=state.metrics;
 return <section className="panel departments intelligence" id="intelligence" aria-labelledby="intelligence-heading">
  <div className="section-head"><div><p className="eyebrow">BOARD INTELLIGENCE / DAILY BRIEF</p><h2 id="intelligence-heading">Strategic intelligence</h2></div><span className="report-tag">DAY {String(state.day).padStart(3,'0')}</span></div>
  <div className="intelligence-grid">
   <article className="insight" aria-label="Value avoidance chart"><p className="eyebrow">PERFORMANCE GAP</p><h3>Perception versus delivery</h3><div className="gap-number">{m.perceived-m.actual>0?'+':''}{m.perceived-m.actual}<small> points</small></div>
    <div className="intelligence-bar"><span>Perceived output</span><strong>{m.perceived}</strong><div><i style={{width:m.perceived+'%'}}/></div></div>
    <div className="intelligence-bar actual"><span>Actual output</span><strong>{m.actual}</strong><div><i style={{width:m.actual+'%'}}/><b style={{left:actualLimit(state)+'%'}} title="Failure threshold"/></div></div>
    <p className="hint">Actual productivity failure threshold: {actualLimit(state)}. A larger positive gap favours the strategic mandate.</p></article>
   <article className="insight" aria-label="Liquidity history"><p className="eyebrow">CAPITAL POSITION</p><h3>Liquidity trend</h3><div className="gap-number">{money(state.cash)}</div>
    <svg viewBox="0 0 300 90" role="img" aria-label="Cash history over recent working days"><path d="M10 10V80H290" fill="none" stroke="#c8c0ad"/>{points.length>1&&<polygon points={line+' '+points.at(-1)!.x+',80 '+points[0].x+',80'} fill="#b28b43" opacity=".12"/>}<polyline points={line} fill="none" stroke="#796233" strokeWidth="2" vectorEffect="non-scaling-stroke"/>{points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.8" fill="#14263d"><title>Day {history[i].day}: {money(history[i].value)}</title></circle>)}</svg>
    <div className="chart-axis"><span>Day {history[0].day}</span><span>Day {state.day}</span></div><p className="hint">Recorded daily cash positions plus current cash. Vertical scale is relative to this period.</p>
    <details><summary>Cash history data</summary><table><tbody>{history.map((p,i)=><tr key={i}><th scope="row">Day {p.day}{i===history.length-1?' (current)':''}</th><td>{money(p.value)}</td></tr>)}</tbody></table></details></article>
   <article className="insight" aria-label="Operational exposure"><p className="eyebrow">RISK AND GOVERNANCE</p><h3>Board attention</h3><dl className="intelligence-list"><dt>Regulatory exposure</dt><dd>{m.regulation}/100</dd><dt>Resource requests</dt><dd>{state.departments.filter(d=>d.request&&d.active).length}</dd><dt>Open social scandals</dt><dd>{state.communications.filter(c=>c.scandal==='open').length}</dd><dt>Upcoming committees</dt><dd>{state.meetings.filter(x=>x.status==='scheduled'&&x.type==='steering').length}</dd><dt>Pending consequences</dt><dd>{state.scheduled.length}</dd></dl><p className="hint">Governance may reduce exposure. It does not guarantee the absence of problems.</p></article>
  </div>
  <h3 className="org-title">Organisational structure</h3><p className="hint">Department reporting lines to the executive office. Select a department to inspect its active personnel.</p>
  <div className="org-root"><span className="eyebrow">BOARD OF DIRECTORS</span><strong>Chief Executive Office</strong><small>Strategic non-intervention mandate</small></div>
  <div className="org-connector" aria-hidden="true"/>
  <div className="org-grid">{groups.map(d=><button className="org-node" key={d.id} aria-pressed={group.id===d.id} data-active={d.active} onClick={()=>setSelected(d.id)}><strong>{d.name}</strong><small>{d.active?d.employees.length+' staff · '+d.focus:'Not established'}</small>{d.request&&d.active&&<span className="org-request">Resource request</span>}</button>)}</div>
  <div className="org-detail"><h4>{group.name} reporting unit</h4>{group.employees.length?<div className="org-person-list">{group.employees.map(e=><div key={e.id}><span className="person-avatar" aria-hidden="true">{e.name.split(' ').map(n=>n[0]).join('')}</span><div><strong>{e.name}</strong><small>{['','Individual contributor','Manager','Director','Executive'][e.level]} · Skill {e.skill}/100</small></div></div>)}</div>:<p className="hint">No active personnel allocated.</p>}<a href="#departments">Manage department allocations</a> · <a href="#employees">Open personnel directory</a></div>
 </section>;
}
