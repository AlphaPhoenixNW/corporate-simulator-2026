import { StrictMode, useEffect, useRef, useState } from 'react';
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
import {CampaignPanel} from './ui/CampaignPanel';
import {STAGES,DIFFICULTIES,SCENARIOS,actualLimit,dailyCapacity,unlockedScenarios} from './engine/campaign';
import {loadHighestStage,saveHighestStage} from './storage';
import type {Difficulty,GameMode,Scenario} from './engine/types';
import {BossPanel} from './ui/BossPanel';
import {AchievementPanel} from './ui/AchievementPanel';
import {ExecutiveIntelligence} from './ui/ExecutiveIntelligence';
import {WorkspaceNavigation} from './ui/WorkspaceNavigation';
import {GlobalNotices} from './ui/GlobalNotices';
import {collectNotices,loadPreferences,savePreferences,type Notice} from './ui/experience';
import {CorporateAudio} from './ui/audio';
import './styles.css';

const labels: Record<Metric,string> = {
  confidence:'Shareholder confidence',prestige:'Executive prestige',morale:'Employee morale',
  bureaucracy:'Bureaucratic complexity',perceived:'Perceived productivity',actual:'Actual productivity',
  buzzwords:'Buzzword density',meetings:'Meeting saturation',regulation:'Regulatory exposure',
  incompetence:'Organisational incompetence'
};
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const endings={insolvent:'Insolvency: we ran out of resources to consume.',useful:'Strategic failure: measurable organisational value has been delivered.',board:'The board has withdrawn its confidence.',certified:'Systemically important nothingness certified. The company has become indispensable without measurable value.'};
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
  const [preferences,setPreferences]=useState(loadPreferences);
  const reduced=preferences.reduced;
  const [notices,setNotices]=useState<Notice[]>([]);
  const audio=useRef<CorporateAudio|null>(null);
  const previous=useRef(state);
  const replacing=useRef(false);
  useEffect(()=>{const player=new CorporateAudio();audio.current=player;return ()=>{player.dispose();audio.current=null;};},[]);
  useEffect(()=>{savePreferences(preferences);audio.current?.configure(preferences.audio,preferences.music,preferences.volume);},[preferences]);
  useEffect(()=>{
    const before=previous.current;previous.current=state;
    if(replacing.current){replacing.current=false;setNotices([]);return;}
    if(before===state)return;
    const incoming=collectNotices(before,state);
    if(incoming.length)setNotices(old=>[...incoming,...old.filter(n=>!incoming.some(x=>x.id===n.id))].slice(0,20));
    audio.current?.play(state.ending&&!before.ending?'ending':before.os.power==='online'&&state.os.power==='offline'?'shutdown':incoming.some(n=>n.kind==='award')?'award':incoming.some(n=>n.kind==='incident'||n.kind==='warning')?'incident':state.day!==before.day?'day':'action');
  },[state]);
  const [highest,setHighest]=useState(()=>Math.max(loadHighestStage(),state.campaign.stage));
  const [mode,setMode]=useState<GameMode>(state.campaign.mode);
  const [difficulty,setDifficulty]=useState<Difficulty>(state.campaign.difficulty);
  const [scenario,setScenario]=useState<Scenario>(state.campaign.scenario);
  useEffect(()=>{if(state.campaign.mode==='campaign'){saveHighestStage(state.campaign.stage);setHighest(n=>Math.max(n,state.campaign.stage));}},[state.campaign.stage,state.campaign.mode]);
  useEffect(()=>{setSaved(saveGame(state));},[state]);
  const send=(c:Command)=>{if(preferences.audio)void audio.current?.activate();setState(s=>dispatch(s,c));};
  const e=EVENTS.find(x=>x.id===state.pendingEvent);
  const validSeed=/^\d+$/.test(seed)&&Number(seed)<=4294967295;
  return <div className={'suite'+(reduced?' reduce-motion':'')}>
    <a className="skip" href="#workspace">Skip to workspace</a>
    <header className="topbar"><div className="brand"><span className="logo" aria-hidden="true">N.</span><div><strong>NOTHING™</strong><span>Executive management suite</span></div></div><div className="top-meta"><span className="stage" data-testid="campaign-stage">{state.campaign.mode==="sandbox"?"Endless sandbox":String(state.campaign.stage).padStart(2,"0")+" / "+STAGES[state.campaign.stage-1].name}</span><span className="save" role="status">{saved?'● Local save active':'Local save unavailable'}</span></div></header>
    <aside className="rail"><div className="rail-caption">WORKSPACE</div><WorkspaceNavigation state={state}/><div className="rail-bottom"><label><input type="checkbox" checked={reduced} onChange={e=>setPreferences(p=>({...p,reduced:e.target.checked}))}/> Reduce motion</label>
    <details className="audio-settings"><summary>Audio settings</summary><label><input type="checkbox" checked={preferences.audio} onChange={e=>{const enabled=e.target.checked;audio.current?.configure(enabled,preferences.music,preferences.volume);if(enabled)void audio.current?.activate();setPreferences(p=>({...p,audio:enabled}));}}/> Sound enabled</label><label><input type="checkbox" checked={preferences.music} disabled={!preferences.audio} onChange={e=>{const music=e.target.checked;audio.current?.configure(preferences.audio,music,preferences.volume);if(music)void audio.current?.activate();setPreferences(p=>({...p,music}));}}/> Corporate hold music</label><label htmlFor="sound-volume">Volume · {preferences.volume}%</label><input id="sound-volume" type="range" min={0} max={100} value={preferences.volume} onChange={e=>setPreferences(p=>({...p,volume:Number(e.target.value)}))}/></details><button className="link-button" onClick={()=>setReset(!reset)} aria-expanded={reset}>New simulation</button><small>BUILD 0.15.0 · PLAYTEST CANDIDATE</small></div></aside>
    <main id="workspace" tabIndex={-1}>
      <div className="intro"><div><p className="eyebrow">OFFICE OF THE CHIEF EXECUTIVE</p><h1>Executive overview</h1><p>Delivering tomorrow’s nothing, today.</p></div><div className="day"><span>WORKING DAY</span><strong data-testid="day">{state.day.toString().padStart(3,'0')}</strong></div></div>
      {reset&&<section className="panel reset" aria-label="New simulation"><h2>Start a new simulation</h2><p>This replaces the current local save.</p><label htmlFor="seed">World seed (0–4294967295)</label><input id="seed" value={seed} onChange={e=>setSeed(e.target.value)} inputMode="numeric"/><div className="people-filter"><label htmlFor="game-mode">Mode</label><select id="game-mode" value={mode} onChange={e=>setMode(e.target.value as GameMode)}><option value="campaign">Campaign</option><option value="sandbox">Endless sandbox</option></select></div>
      <div className="people-filter"><label htmlFor="game-difficulty">Difficulty</label><select id="game-difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}>{Object.entries(DIFFICULTIES).map(([id,d])=><option key={id} value={id}>{d.name}</option>)}</select></div><p className="hint">{DIFFICULTIES[difficulty].description}</p>
      <div className="people-filter"><label htmlFor="game-scenario">Scenario</label><select id="game-scenario" value={scenario} onChange={e=>setScenario(e.target.value as Scenario)}>{Object.entries(SCENARIOS).map(([id,d])=><option key={id} value={id} disabled={!unlockedScenarios(highest).includes(id as Scenario)}>{d.name}{highest<d.unlock?' (unlocks at stage '+d.unlock+')':''}</option>)}</select></div><p className="hint">{SCENARIOS[scenario].description}</p>
      <div className="controls"><button disabled={!validSeed||!unlockedScenarios(highest).includes(scenario)} onClick={()=>{replacing.current=true;setState(newGame(Number(seed),{mode,difficulty,scenario}));setReset(false);}}>Replace save</button><button className="secondary" onClick={()=>setReset(false)}>Cancel</button></div></section>}
      <section className="kpis" aria-label="Executive indicators"><article><span>Corporate liquidity</span><strong data-testid="cash">{money(state.cash)}</strong><small>Available capital</small></article><article><span>Shareholder confidence</span><strong>{state.metrics.confidence}<small>%</small></strong><small>Investor sentiment</small></article><article><span>Value avoidance</span><strong>{100-state.metrics.actual}<small>%</small></strong><small>Inverse of actual productivity</small></article><article><span>Executive compensation</span><strong>{money(state.compensation)}</strong><small>Bonuses paid to date</small></article></section>
      {state.ending&&<section className="panel alert" id="board-notification" role="alert"><p className="eyebrow">BOARD NOTIFICATION</p><h2>Simulation concluded</h2><p>{endings[state.ending]}</p><button onClick={()=>setReset(true)}>Start another simulation</button></section>}
      {!state.ending&&e&&<section className="panel alert" id="pending-decision" aria-label="Pending corporate decision"><p className="eyebrow">DECISION REQUIRED · {CATEGORY_NAMES[e.category??"general"].toUpperCase()}</p><h2>{e.title}</h2><p>{e.description}</p><div className="choice-grid">{e.choices.map(c=><button key={c.id} onClick={()=>send({type:'choose',id:c.id})}><strong>{c.label}</strong><span>{c.detail}</span><small className="incident-effect">{describeEffects(c.effect)}</small>{c.delayed&&<small>Further consequences possible.</small>}</button>)}</div></section>}
      <div className="workspace-grid">
        <section className="panel" id="decisions"><div className="section-head"><div><p className="eyebrow">DAILY OPERATIONS</p><h2>Executive actions</h2></div><span className="capacity" aria-live="polite">{state.capacity} / {dailyCapacity(state)} available</span></div><p className="hint">Actions consume one executive capacity. Advance the day to reconcile revenue, expenditure and operational risk.</p><div className="actions">{ACTIONS.map(a=><button className="action" key={a.id} disabled={!!state.ending||!!e||state.capacity===0||state.cash<a.cost} onClick={()=>send({type:'action',id:a.id})}><span><strong>{a.label}</strong><small>{a.detail}</small></span><span className="cost">{money(a.cost)}</span></button>)}</div><button className="advance" disabled={!!state.ending||!!e} onClick={()=>send({type:'endDay'})}>Conclude working day <span aria-hidden="true">→</span></button></section>
        <section className="panel" id="metrics"><p className="eyebrow">PERFORMANCE INTELLIGENCE</p><h2>Organisational metrics</h2><div className="metric-grid">{METRIC_KEYS.map(k=><MetricBar key={k} name={k} value={state.metrics[k]}/>)}</div><p className="hint">Actual productivity reaching {actualLimit(state)} ends the simulation. Insolvency or a loss of board confidence also ends it.</p></section>
      </div>
      <GlobalNotices notices={notices} dismiss={()=>setNotices([])}/>
      <ExecutiveIntelligence state={state}/>
      <CampaignPanel state={state} send={send} highest={highest}/>
      {state.campaign.stage===7&&<BossPanel state={state} send={send}/>}
      <DepartmentsPanel state={state} send={send}/>
      <EmployeesPanel state={state} send={send}/>
      <MeetingsPanel state={state} send={send}/>
      <CommunicationsPanel state={state} send={send}/>
      <ProgrammesPanel state={state} send={send}/>
      <FinancePanel state={state} send={send}/>
      <OSPanel state={state} send={send} reduced={reduced}/>
      <AgentsPanel state={state} send={send}/>
      <IncidentsPanel state={state}/>
      <AchievementPanel state={state}/>
      <div className="workspace-grid"><section className="panel" id="ledger"><p className="eyebrow">FINANCIAL CONTROL</p><h2>Transaction ledger</h2>{state.ledger.length===0?<p className="hint">No transactions recorded.</p>:<div className="ledger-scroll"><table><thead><tr><th scope="col">Day</th><th scope="col">Transaction</th><th scope="col">Category</th><th scope="col">Amount</th></tr></thead><tbody>{[...state.ledger].reverse().slice(0,12).map((x,i)=><tr key={i}><td>{x.day}</td><td>{x.label}</td><td>{x.category??"Legacy"}</td><td className={x.amount<0?'negative':'positive'}>{x.amount>0?'+':''}{money(x.amount)}</td></tr>)}</tbody></table></div>}</section><section className="panel" id="activity"><p className="eyebrow">CORPORATE RECORD</p><h2>Activity log</h2><ol className="activity">{state.log.slice(0,10).map((x,i)=><li key={i}>{x}</li>)}</ol></section></div>
      <footer>NOTHING™ · Internal use only · Seed {state.seed} · All financial values are simulated.</footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
