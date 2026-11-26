import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ACTIONS, EVENTS } from './engine/content';
import { dispatch, newGame } from './engine/simulation';
import { METRIC_KEYS, type Metric, type GameState, type Command } from './engine/types';
import { loadGame, saveGame } from './storage';
import { DepartmentsPanel } from './ui/DepartmentsPanel';
import { EmployeesPanel } from './ui/EmployeesPanel';
import { MeetingsPanel } from './ui/MeetingsPanel';
import { CommunicationsPanel } from './ui/CommunicationsPanel';
import { ProgrammesPanel } from './ui/ProgrammesPanel';
import { FinancePanel } from './ui/FinancePanel';
import { OSPanel } from './ui/OSPanel';
import { AgentsPanel } from './ui/AgentsPanel';
import { IncidentsPanel } from './ui/IncidentsPanel';
import { describeEffects, CATEGORY_NAMES } from './engine/incidents';
import './styles.css';

const labels: Record<Metric,string> = {
  confidence:'Shareholder confidence',prestige:'Executive prestige',morale:'Employee morale',
  bureaucracy:'Bureaucratic complexity',perceived:'Perceived productivity',actual:'Actual productivity',
  buzzwords:'Buzzword density',meetings:'Meeting saturation',regulation:'Regulatory exposure',
  incompetence:'Organisational incompetence'
};
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const endings={insolvent:'Insolvency: we ran out of resources to consume.',useful:'Strategic failure: measurable organisational value has been delivered.',board:'The board has withdrawn its confidence.'};
function MetricBar({name,value}:{name:Metric;value:number}){
  return <div className="metric">
    <div className="metric-label"><span>{labels[name]}</span><strong>{value}<small>/100</small></strong></div>
    <meter min={0} max={100} value={value} aria-label={labels[name]} className={name==='actual'||name==='regulation'?'risk':''}>{value}</meter>
  </div>;
}
function App(){
  const [state,setState]=useState<GameState>(()=>loadGame()??newGame());
  const [saved,setSaved]=useState(true);
  const [reset,setReset]=useState(false);
  const [seed,setSeed]=useState(String(state.seed));
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{setSaved(saveGame(state));},[state]);
  const send=(c:Command)=>setState(s=>dispatch(s,c));
  const e=EVENTS.find(x=>x.id===state.pendingEvent);
  const validSeed=/^\d+$/.test(seed)&&Number(seed)<=4294967295;
  return <div className={'suite'+(reduced?' reduce-motion':'')}>
    <a className="skip" href="#workspace">Skip to workspace</a>
    <header className="topbar"><div className="brand"><span className="logo" aria-hidden="true">N.</span><div><strong>NOTHING™</strong><span>Executive management suite</span></div></div><div className="top-meta"><span className="stage">01 / Bedroom Startup</span><span className="save" role="status">{saved?'● Local save active':'Local save unavailable'}</span></div></header>
    <aside className="rail"><div className="rail-caption">WORKSPACE</div><nav aria-label="Workspace"><a href="#workspace">Overview</a><a href="#decisions">Executive actions</a><a href="#metrics">Performance</a><a href="#departments">Departments</a><a href="#employees">People</a><a href="#meetings">Meetings</a><a href="#communications">Communications</a><a href="#programmes">Transformation</a><a href="#finance">Finance</a><a href="#nothing-os">NOTHING™ OS</a><a href="#agents">Agentic AI</a><a href="#incidents">Incidents</a><a href="#ledger">Ledger</a><a href="#activity">Activity log</a></nav><div className="rail-bottom"><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Reduce motion</label><button className="link-button" onClick={()=>setReset(!reset)} aria-expanded={reset}>New simulation</button><small>BUILD 0.10.0 · INCIDENTS</small></div></aside>
    <main id="workspace" tabIndex={-1}>
      <div className="intro"><div><p className="eyebrow">OFFICE OF THE CHIEF EXECUTIVE</p><h1>Executive overview</h1><p>Delivering tomorrow’s nothing, today.</p></div><div className="day"><span>WORKING DAY</span><strong data-testid="day">{state.day.toString().padStart(3,'0')}</strong></div></div>
      {reset&&<section className="panel reset" aria-label="New simulation"><h2>Start a new simulation</h2><p>This replaces the current local save.</p><label htmlFor="seed">World seed (0–4294967295)</label><input id="seed" value={seed} onChange={e=>setSeed(e.target.value)} inputMode="numeric"/><div className="controls"><button disabled={!validSeed} onClick={()=>{setState(newGame(Number(seed)));setReset(false);}}>Replace save</button><button className="secondary" onClick={()=>setReset(false)}>Cancel</button></div></section>}
      <section className="kpis" aria-label="Executive indicators"><article><span>Corporate liquidity</span><strong data-testid="cash">{money(state.cash)}</strong><small>Available capital</small></article><article><span>Shareholder confidence</span><strong>{state.metrics.confidence}<small>%</small></strong><small>Investor sentiment</small></article><article><span>Value avoidance</span><strong>{100-state.metrics.actual}<small>%</small></strong><small>Inverse of actual productivity</small></article><article><span>Executive compensation</span><strong>{money(state.compensation)}</strong><small>Bonuses paid to date</small></article></section>
      {state.ending&&<section className="panel alert" role="alert"><p className="eyebrow">BOARD NOTIFICATION</p><h2>Simulation concluded</h2><p>{endings[state.ending]}</p><button onClick={()=>setReset(true)}>Start another simulation</button></section>}
      {!state.ending&&e&&<section className="panel alert" aria-label="Pending corporate decision"><p className="eyebrow">DECISION REQUIRED · {CATEGORY_NAMES[e.category??"general"].toUpperCase()}</p><h2>{e.title}</h2><p>{e.description}</p><div className="choice-grid">{e.choices.map(c=><button key={c.id} onClick={()=>send({type:'choose',id:c.id})}><strong>{c.label}</strong><span>{c.detail}</span><small className="incident-effect">{describeEffects(c.effect)}</small>{c.delayed&&<small>Further consequences possible.</small>}</button>)}</div></section>}
      <div className="workspace-grid">
        <section className="panel" id="decisions"><div className="section-head"><div><p className="eyebrow">DAILY OPERATIONS</p><h2>Executive actions</h2></div><span className="capacity" aria-live="polite">{state.capacity} / 2 available</span></div><p className="hint">Actions consume one executive capacity. Advance the day to reconcile revenue, expenditure and operational risk.</p><div className="actions">{ACTIONS.map(a=><button className="action" key={a.id} disabled={!!state.ending||!!e||state.capacity===0||state.cash<a.cost} onClick={()=>send({type:'action',id:a.id})}><span><strong>{a.label}</strong><small>{a.detail}</small></span><span className="cost">{money(a.cost)}</span></button>)}</div><button className="advance" disabled={!!state.ending||!!e} onClick={()=>send({type:'endDay'})}>Conclude working day <span aria-hidden="true">→</span></button></section>
        <section className="panel" id="metrics"><p className="eyebrow">PERFORMANCE INTELLIGENCE</p><h2>Organisational metrics</h2><div className="metric-grid">{METRIC_KEYS.map(k=><MetricBar key={k} name={k} value={state.metrics[k]}/>)}</div><p className="hint">Actual productivity reaching 70 ends the simulation. Insolvency or a loss of board confidence also ends it.</p></section>
      </div>
      <DepartmentsPanel state={state} send={send}/>
      <EmployeesPanel state={state} send={send}/>
      <MeetingsPanel state={state} send={send}/>
      <CommunicationsPanel state={state} send={send}/>
      <ProgrammesPanel state={state} send={send}/>
      <FinancePanel state={state} send={send}/>
      <OSPanel state={state} send={send} reduced={reduced}/>
      <AgentsPanel state={state} send={send}/>
      <IncidentsPanel state={state}/>
      <div className="workspace-grid"><section className="panel" id="ledger"><p className="eyebrow">FINANCIAL CONTROL</p><h2>Transaction ledger</h2>{state.ledger.length===0?<p className="hint">No transactions recorded.</p>:<div className="ledger-scroll"><table><thead><tr><th scope="col">Day</th><th scope="col">Transaction</th><th scope="col">Category</th><th scope="col">Amount</th></tr></thead><tbody>{[...state.ledger].reverse().slice(0,12).map((x,i)=><tr key={i}><td>{x.day}</td><td>{x.label}</td><td>{x.category??"Legacy"}</td><td className={x.amount<0?'negative':'positive'}>{x.amount>0?'+':''}{money(x.amount)}</td></tr>)}</tbody></table></div>}</section><section className="panel" id="activity"><p className="eyebrow">CORPORATE RECORD</p><h2>Activity log</h2><ol className="activity">{state.log.slice(0,10).map((x,i)=><li key={i}>{x}</li>)}</ol></section></div>
      <footer>NOTHING™ · Internal use only · Seed {state.seed} · All financial values are simulated.</footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
