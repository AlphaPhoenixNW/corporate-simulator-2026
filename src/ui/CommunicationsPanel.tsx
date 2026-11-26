import { useState } from 'react';
import { COMMUNICATION_TYPES, type CommunicationType, type GameState, type Command } from '../engine/types';
import { COMMUNICATION_FORMATS, communicationEligibility, influencerLeaderboard, RESPONSE_COST } from '../engine/communications';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const number=(n:number)=>n.toLocaleString('en-GB');
export function CommunicationsPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const [format,setFormat]=useState<CommunicationType>('announcement');
  const [filter,setFilter]=useState('all');
  const [expanded,setExpanded]=useState<number[]>([]);
  const [limit,setLimit]=useState(12);
  const posts=state.communications.filter(p=>p.type==='social');
  const scandals=state.communications.filter(p=>p.scandal==='open');
  const leaders=influencerLeaderboard(state.communications,state.employees);
  const command={type:'communication',operation:'publish',format} as const;
  const reason=communicationEligibility(state,command);
  const visible=state.communications.filter(p=>filter==='all'||filter==='scandals'&&p.scandal!=='none'||p.type===filter).slice().reverse();
  const commentsName=(id:number|null)=>id===null?'Chief Executive':state.employees.find(e=>e.id===id)?.name??('Employee #'+id);
  return <section className="panel departments" id="communications" aria-labelledby="communications-heading">
    <p className="eyebrow">STRATEGIC NARRATIVE MANAGEMENT</p><h2 id="communications-heading">Corporate communications</h2>
    <div className="department-summary"><div><span>Communications issued</span><strong data-testid="communication-count">{state.communications.length}</strong></div><div><span>Align™ impressions</span><strong>{number(posts.reduce((n,p)=>n+p.impressions,0))}</strong></div><div><span>Viral posts</span><strong>{posts.filter(p=>p.viral).length}</strong></div><div><span>Open scandals</span><strong data-testid="scandal-count">{scandals.length}</strong></div></div>
    <div className="communication-workspace">
      <article className="department-detail" aria-label="Publish a communication">
        <h3>Executive publishing desk</h3>
        <p className="hint">Publish a context-aware statement for one executive action. All content is generated locally from the current simulation.</p>
        <div className="people-filter"><label htmlFor="communication-format">Communication format</label><select id="communication-format" value={format} onChange={e=>setFormat(e.target.value as CommunicationType)}>{COMMUNICATION_TYPES.map(t=><option key={t} value={t}>{COMMUNICATION_FORMATS[t].name}</option>)}</select></div>
        <p className="department-report">Publication fee: <strong>{money(COMMUNICATION_FORMATS[format].fee)}</strong></p>
        <button disabled={!!reason} onClick={()=>send(command)}>Publish communication</button>{reason&&<p className="hint">{reason}</p>}
        <h3 className="communication-subtitle">Align™ influencer rankings</h3><p className="hint">Professional visibility, independently of professional contribution.</p>
        {leaders.length===0?<p className="hint">No employee engagement recorded yet.</p>:<ol className="influencer-list">{leaders.slice(0,5).map(e=><li key={e.id}><strong>{e.name}</strong><span>{number(e.impressions)} impressions · {number(e.reactions)} reactions</span></li>)}</ol>}
        <h3 className="communication-subtitle">Reputational response desk</h3>
        {scandals.length===0?<p className="hint">No open scandals. This statement has not been independently audited.</p>:<div className="meeting-list">{scandals.map(p=><div key={p.id} className="meeting-record"><strong>{p.author}</strong><p>{p.subject}</p><button className="secondary" disabled={!!communicationEligibility(state,{type:'communication',operation:'respond',id:p.id})} onClick={()=>send({type:'communication',operation:'respond',id:p.id})}>Issue apology · {money(RESPONSE_COST)}</button></div>)}</div>}
      </article>
      <article className="department-detail" aria-label="Communication feed"><h3>Corporate record & Align™</h3>
        <div className="people-filter"><label htmlFor="communication-filter">Filter messages</label><select id="communication-filter" value={filter} onChange={e=>{setFilter(e.target.value);setLimit(12);}}><option value="all">All communications</option><option value="scandals">Reputational incidents</option>{COMMUNICATION_TYPES.map(t=><option key={t} value={t}>{COMMUNICATION_FORMATS[t].name}</option>)}</select></div>
        <div className="communication-feed">{visible.length===0&&<p className="hint">No communications have been issued. Strategic silence is in effect.</p>}{visible.slice(0,limit).map(p=><div className="communication-record" key={p.id}>
          <p className="eyebrow">DAY {p.day} · {COMMUNICATION_FORMATS[p.type].name.toUpperCase()} · #{p.id}</p><h4>{p.subject}</h4><p className="communication-author">{p.author}{p.viral?' · VIRAL':''}{p.scandal!=='none'?' · SCANDAL '+p.scandal.toUpperCase():''}</p><p>{p.body}</p>
          {p.type==='social'&&<><p className="hint">{number(p.impressions)} impressions · {number(p.reactions)} reactions · {p.comments.length} comments</p><div className="controls"><button className="secondary" disabled={!!communicationEligibility(state,{type:'communication',operation:'congratulate',id:p.id})} onClick={()=>send({type:'communication',operation:'congratulate',id:p.id})}>{p.congratulated?'Congratulated':'Congratulate'}</button><button className="secondary" aria-expanded={expanded.includes(p.id)} onClick={()=>setExpanded(old=>old.includes(p.id)?old.filter(x=>x!==p.id):[...old,p.id])}>{expanded.includes(p.id)?'Hide':'Show'} comments</button></div>{expanded.includes(p.id)&&<div className="social-comments">{p.comments.map((c,i)=><p key={i}><strong>{commentsName(c.authorId)}</strong><br/>{c.text}</p>)}</div>}</>}
        </div>)}</div>
        {visible.length>limit&&<button className="secondary" onClick={()=>setLimit(n=>n+12)}>Load older communications</button>}
      </article>
    </div>
  </section>;
}
