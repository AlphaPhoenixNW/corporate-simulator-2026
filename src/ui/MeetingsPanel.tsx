import { useState } from 'react';
import { MEETING_TYPES, type MeetingType, type GameState, type Command, type MeetingCommand } from '../engine/types';
import { MEETING_DEFINITIONS, bookingCost, meetingEligibility, reservedMinutes, WORKDAY_MINUTES } from '../engine/meetings';
import { DEPARTMENTS } from '../engine/departments';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export function MeetingsPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const [type,setType]=useState<MeetingType>('alignment');
  const [offset,setOffset]=useState(0);
  const [selected,setSelected]=useState<number[]|null>(null);
  const [showHistory,setShowHistory]=useState(false);
  const active=state.employees.filter(e=>e.status==='active');
  const attendees=selected===null?active.map(e=>e.id):selected.filter(id=>active.some(e=>e.id===id));
  const day=state.day+offset,def=MEETING_DEFINITIONS[type];
  const command:MeetingCommand={type:'meeting',operation:'schedule',meetingType:type,attendees,day};
  const reason=meetingEligibility(state,command);
  const scheduled=state.meetings.filter(m=>m.status==='scheduled').sort((a,b)=>a.day-b.day||a.id-b.id);
  const held=state.meetings.filter(m=>m.status==='held');
  const history=state.meetings.filter(m=>m.status!=='scheduled').slice().reverse();
  const names=(ids:number[])=>ids.map(id=>state.employees.find(e=>e.id===id)?.name??('#'+id)).join(', ');
  return <section className="panel departments" id="meetings" aria-labelledby="meeting-heading">
    <p className="eyebrow">ENTERPRISE CALENDAR INTELLIGENCE</p><h2 id="meeting-heading">Meeting governance centre</h2>
    <div className="department-summary"><div><span>Scheduled meetings</span><strong data-testid="meeting-count">{scheduled.length}</strong></div><div><span>Meetings held</span><strong data-testid="meetings-held">{held.length}</strong></div><div><span>Employee hours consumed</span><strong>{(held.reduce((n,m)=>n+m.personMinutes,0)/60).toFixed(1)}</strong></div><div><span>Meeting expenditure</span><strong>{money(held.reduce((n,m)=>n+m.cost,0))}</strong></div></div>
    <p className="hint">Booking and cancellation each consume one executive action. Meetings take place when you conclude their working day. Payroll continues while staff attend; booking fees are charged on attendance. Automatic follow-ups are limited by calendar capacity and four generations.</p>
    <div className="meeting-workspace">
      <article className="department-detail" aria-label="Schedule a meeting"><h3>Reserve strategic capacity</h3>
        <div className="people-filter"><label htmlFor="meeting-type">Meeting type</label><select id="meeting-type" value={type} onChange={e=>setType(e.target.value as MeetingType)}>{MEETING_TYPES.map(t=><option key={t} value={t}>{MEETING_DEFINITIONS[t].name}</option>)}</select></div>
        <p className="hint">{def.description} · {def.duration} minutes</p>
        <div className="people-filter"><label htmlFor="meeting-day">Working day</label><select id="meeting-day" value={offset} onChange={e=>setOffset(Number(e.target.value))}>{Array.from({length:8},(_,i)=><option key={i} value={i}>Day {state.day+i}{i===0?' (today)':''}</option>)}</select></div>
        <fieldset className="meeting-attendees"><legend>Invite employees</legend><div className="controls"><button className="secondary" onClick={()=>setSelected(null)}>Select all</button><button className="secondary" onClick={()=>setSelected([])}>Clear</button></div>{active.map(e=><label key={e.id}><input type="checkbox" checked={attendees.includes(e.id)} onChange={ev=>setSelected(ev.target.checked?[...attendees,e.id]:attendees.filter(id=>id!==e.id))}/><span>{e.name}<small>{DEPARTMENTS[e.department].name} · {reservedMinutes(state.meetings,day,e.id)}/{WORKDAY_MINUTES} min reserved</small></span></label>)}</fieldset>
        <p className="department-report">Estimated attendance fee: <strong>{money(bookingCost(type,attendees.length))}</strong><br/>Reserved employee time: {def.duration*attendees.length} person-minutes.</p>
        <button disabled={!!reason} onClick={()=>send(command)}>Schedule meeting</button>{reason&&<p className="hint">{reason}</p>}
      </article>
      <article className="department-detail" aria-label="Meeting calendar"><h3>Forward calendar</h3>{scheduled.length===0&&<p className="hint">No scheduled meetings. An alarming amount of calendar space is available.</p>}
        <div className="meeting-list">{scheduled.map(m=><div className="meeting-record" key={m.id}><p className="eyebrow">DAY {m.day} · {m.duration} MIN · #{m.id}</p><strong>{MEETING_DEFINITIONS[m.type].name}</strong><p>{names(m.attendees)}</p>{m.parentId!==null&&<p>Follow-up to meeting #{m.parentId} · generation {m.depth}</p>}<button className="secondary" disabled={!!meetingEligibility(state,{type:'meeting',operation:'cancel',id:m.id})} onClick={()=>send({type:'meeting',operation:'cancel',id:m.id})}>Cancel meeting #{m.id}</button></div>)}</div>
        <h3>Minutes and documentation</h3><button className="secondary" aria-expanded={showHistory} onClick={()=>setShowHistory(!showHistory)}>{showHistory?'Hide':'Show'} meeting history ({history.length})</button>
        {showHistory&&<div className="meeting-list">{history.map(m=><div key={m.id} className="meeting-record"><p className="eyebrow">DAY {m.day} · {m.status.toUpperCase()} · #{m.id}</p><strong>{MEETING_DEFINITIONS[m.type].name}</strong><p>{m.outcome}</p>{m.status==='held'&&<><p>{m.document}</p><p>{m.personMinutes} person-minutes · {money(m.cost)} · {names(m.actualAttendees)}</p></>}</div>)}</div>}
      </article>
    </div>
  </section>;
}
