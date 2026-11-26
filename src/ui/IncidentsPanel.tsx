import {useState} from 'react';
import {EVENTS} from '../engine/content';
import {CATEGORY_NAMES,describeEffects} from '../engine/incidents';
import {INCIDENT_CATEGORIES,type GameState} from '../engine/types';
export function IncidentsPanel({state}:{state:GameState}){
  const [filter,setFilter]=useState('all');
  const [limit,setLimit]=useState(15);
  const known=new Set(state.resolvedEvents);
  const catalog=new Map(EVENTS.map(e=>[e.id,e]));
  const visible=state.incidentHistory.slice().reverse().filter(h=>filter==='all'||(catalog.get(h.eventId)?.category??'general')===filter);
  return <section className="panel departments" id="incidents" aria-labelledby="incidents-heading">
    <p className="eyebrow">CORPORATE INCIDENT INTELLIGENCE</p><h2 id="incidents-heading">Incident and decision archive</h2>
    <div className="department-summary"><div><span>Incident catalogue</span><strong data-testid="incident-catalogue-count">{EVENTS.length}</strong></div><div><span>Incidents encountered</span><strong>{known.size}/{EVENTS.length}</strong></div><div><span>Recorded decisions</span><strong data-testid="incident-history-count">{state.incidentHistory.length}</strong></div><div><span>Pending consequences</span><strong>{state.scheduled.length}</strong></div></div>
    <p className="hint">Incidents depend on active departments, operational systems and previous decisions. Follow-up stories take priority when eligible. Unseen incidents are preferred over repeats.</p>
    <div className="meeting-workspace"><article className="department-detail" aria-label="Incident collection"><h3>Corporate exposure by category</h3>
      {INCIDENT_CATEGORIES.filter(c=>EVENTS.some(e=>(e.category??'general')===c)).map(c=>{const all=EVENTS.filter(e=>(e.category??'general')===c),seen=all.filter(e=>known.has(e.id)).length;return <div className="incident-category" key={c}><div><span>{CATEGORY_NAMES[c]}</span><strong>{seen}/{all.length}</strong></div><progress value={seen} max={all.length} aria-label={CATEGORY_NAMES[c]+' encountered'}/></div>;})}
      <h3>Pending consequences</h3>{state.scheduled.length?<ul className="incident-due">{state.scheduled.slice().sort((a,b)=>a.day-b.day).map((e,i)=><li key={i}>Working day {e.day}: follow-up effect pending.</li>)}</ul>:<p className="hint">No delayed effects currently scheduled.</p>}
      {known.size>0&&state.incidentHistory.length===0&&<p className="hint">Earlier save: encountered incident IDs retained. Individual historical choices were not recorded in that version.</p>}
      </article><article className="department-detail" aria-label="Decision history"><h3>Executive decision history</h3>
      <div className="people-filter"><label htmlFor="incident-filter">Incident category</label><select id="incident-filter" value={filter} onChange={e=>{setFilter(e.target.value);setLimit(15);}}><option value="all">All categories</option>{INCIDENT_CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_NAMES[c]}</option>)}</select></div>
      <div className="meeting-list">{visible.length===0&&<p className="hint">No recorded decisions in this category.</p>}{visible.slice(0,limit).map((h,i)=>{const e=catalog.get(h.eventId)!,choice=e.choices.find(c=>c.id===h.choiceId)!;return <div className="meeting-record" key={h.eventId+':'+h.day+':'+i}><p className="eyebrow">DAY {h.day} · {CATEGORY_NAMES[e.category??'general'].toUpperCase()}</p><strong>{e.title}</strong><p>Decision: {choice.label}</p><p>{describeEffects(choice.effect)}</p>{choice.delayed&&<p>Delayed consequences scheduled at decision time.</p>}</div>;})}</div>
      {visible.length>limit&&<button className="secondary" onClick={()=>setLimit(n=>n+15)}>Load older decisions</button>}
      </article></div>
  </section>;
}
