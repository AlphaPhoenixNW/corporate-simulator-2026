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
import {loadHighestStage,saveHighestStage,saveAchievementProfile} from './storage';
import type {Difficulty,GameMode,Scenario,GameOptions} from './engine/types';
import {BossPanel} from './ui/BossPanel';
import {AchievementPanel} from './ui/AchievementPanel';
import {ExecutiveIntelligence} from './ui/ExecutiveIntelligence';
import {WorkspaceNavigation} from './ui/WorkspaceNavigation';
import {resolveWorkspace,workspaceAvailable,workspaceInfo,recommend,type Workspace} from './ui/workspaces';
import {ExecutiveBrief} from './ui/ExecutiveBrief';
import {newlyIntroduced} from './ui/progression';
import {FeatureIntroduction} from './ui/FeatureIntroduction';
import {ExecutiveLibrary} from './ui/ExecutiveLibrary';
import {GlobalNotices} from './ui/GlobalNotices';
import {collectNotices,loadPreferences,savePreferences,type Notice,type Preferences} from './ui/experience';
import {CorporateAudio,type AudioStatus} from './ui/audio';
import {AudioQuickControl} from './ui/AudioQuickControl';
import {AudioSettings} from './ui/AudioSettings';
import {DecisionFeedback} from './ui/DecisionFeedback';
import {decisionReceipt,decisionCue,type DecisionReceipt} from './ui/decisionFeedback';
import {TitleScreen} from './ui/TitleScreen';
import {TutorialPanel} from './ui/TutorialPanel';
import {sessionPlaying,setSessionPlaying,tutorialAdvance,type Backup} from './ui/onboarding';
import {registerWebApp} from './ui/webApp';
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
  const [hasGame,setHasGame]=useState(()=>!!loadGame());
  const [playing,setPlaying]=useState(()=>sessionPlaying()&&!!loadGame());
  const [tutorial,setTutorial]=useState(-1);
  const [libraryOpen,setLibraryOpen]=useState(false);
  const [workspace,setWorkspace]=useState<Workspace>(()=>resolveWorkspace(location.hash));
  const [showAll,setShowAll]=useState(()=>{try{return localStorage.getItem('nothing-sim:all-workspaces')==='yes';}catch{return false;}});
  const [introduced,setIntroduced]=useState<Workspace[]>([]);
  const [newWorkspaces,setNewWorkspaces]=useState<Workspace[]>([]);
  useEffect(()=>{try{localStorage.setItem('nothing-sim:all-workspaces',showAll?'yes':'no');}catch{/* optional navigation preference */}},[showAll]);
  const navigate=(id:Workspace)=>{setWorkspace(id);if(location.hash!=='#'+id)location.hash=id;window.scrollTo(0,0);};
  useEffect(()=>{const changed=()=>{setWorkspace(resolveWorkspace(location.hash));};window.addEventListener('hashchange',changed);return()=>window.removeEventListener('hashchange',changed);},[]);
  useEffect(()=>{if(playing){document.getElementById('workspace')?.focus({preventScroll:true});window.scrollTo(0,0);}},[workspace,playing]);
  const lastCommand=useRef<Command|null>(null);
  const [saved,setSaved]=useState(true);
  const [reset,setReset]=useState(false);
  const [seed,setSeed]=useState(String(state.seed));
  const [preferences,setPreferences]=useState(loadPreferences);
  const [audioStatus,setAudioStatus]=useState<AudioStatus>('muted');
  const reduced=preferences.reduced;
  const [notices,setNotices]=useState<Notice[]>([]);
  const [receipt,setReceipt]=useState<DecisionReceipt|null>(null);
  const receiptSequence=useRef(0);
  const audio=useRef<CorporateAudio|null>(null);
  const previous=useRef(state);
  const replacing=useRef(false);
  useEffect(()=>{const player=new CorporateAudio(setAudioStatus);audio.current=player;const unlock=(event:MouseEvent)=>{
    // Explicit audio controls own their gesture. Recovering in capture phase could
    // change Start audio into Mute audio before the same click reaches React.
    if(event.target instanceof Element&&event.target.closest('.quick-audio,.audio-settings'))return;
    if(player.status==='waiting')void player.activate();
  };document.addEventListener('click',unlock,true);return ()=>{document.removeEventListener('click',unlock,true);player.dispose();audio.current=null;};},[]);
  useEffect(()=>{savePreferences(preferences);audio.current?.configure(preferences.audio,preferences.music,preferences.volume,preferences.effects,preferences.effectsVolume);},[preferences]);
  useEffect(()=>{
    const before=previous.current;previous.current=state;
    if(replacing.current){replacing.current=false;setNotices([]);setReceipt(null);receiptSequence.current=0;setIntroduced([]);setNewWorkspaces([]);return;}
    if(before===state)return;
    const command=lastCommand.current;if(command){setTutorial(step=>step<0?step:tutorialAdvance(step,before,state,command));setReceipt(decisionReceipt(before,state,command,++receiptSequence.current));}
    const incoming=collectNotices(before,state);
    const fresh=newlyIntroduced(before,state);if(fresh.length)setNewWorkspaces(old=>[...new Set([...old,...fresh])]);
    if(incoming.length)setNotices(old=>[...incoming,...old.filter(n=>!incoming.some(x=>x.id===n.id))].slice(0,20));
    audio.current?.play(decisionCue(before,state,command,incoming));
  },[state]);
  const [highest,setHighest]=useState(()=>Math.max(loadHighestStage(),state.campaign.stage));
  const [mode,setMode]=useState<GameMode>(state.campaign.mode);
  const [difficulty,setDifficulty]=useState<Difficulty>(state.campaign.difficulty);
  const [scenario,setScenario]=useState<Scenario>(state.campaign.scenario);
  useEffect(()=>{if(hasGame&&state.campaign.mode==='campaign'){saveHighestStage(state.campaign.stage);setHighest(n=>Math.max(n,state.campaign.stage));}},[state.campaign.stage,state.campaign.mode,hasGame]);
  useEffect(()=>{if(hasGame)setSaved(saveGame(state));},[state,hasGame]);
  const send=(c:Command)=>{lastCommand.current=c;if(c.type==='endDay')window.scrollTo(0,0);if(preferences.audio)void audio.current?.activate();setState(s=>dispatch(s,c));};
  const enter=()=>{setSessionPlaying(true);setPlaying(true);window.scrollTo(0,0);audio.current?.configure(preferences.audio,preferences.music,preferences.volume,preferences.effects,preferences.effectsVolume);if(preferences.audio)void audio.current?.activate();};
  const start=(newSeed:number,options:GameOptions,guided:boolean)=>{replacing.current=true;setState(newGame(newSeed,options));setHasGame(true);setSeed(String(newSeed));setMode(options.mode??'campaign');setDifficulty(options.difficulty??'standard');setScenario(options.scenario??'founder');setTutorial(guided?0:-1);setReset(false);navigate('office');enter();};
  const importGame=(backup:Backup)=>{replacing.current=true;setState(backup.game);setHasGame(true);setSeed(String(backup.game.seed));setMode(backup.game.campaign.mode);setDifficulty(backup.game.campaign.difficulty);setScenario(backup.game.campaign.scenario);setTutorial(-1);saveHighestStage(backup.highestStage);setHighest(n=>Math.max(n,backup.highestStage));saveAchievementProfile(backup.achievements);};
  const menu=()=>{setSessionPlaying(false);setPlaying(false);setTutorial(-1);setReceipt(null);window.scrollTo(0,0);};
  const e=EVENTS.find(x=>x.id===state.pendingEvent);
  const validSeed=/^\d+$/.test(seed)&&Number(seed)<=4294967295;
  const current=workspaceAvailable(state,workspace)?workspace:'office';
  const info=workspaceInfo(current),guidance=recommend(state);
  const view=(id:Workspace,content:React.ReactNode)=><div className="workspace-view" hidden={current!==id}>{content}</div>;
  const openLibrary=()=>{setLibraryOpen(true);setReceipt(null);window.scrollTo(0,0);};
  const closeLibrary=()=>{setLibraryOpen(false);requestAnimationFrame(()=>{window.scrollTo(0,0);document.getElementById(playing?'workspace':'launch-title')?.focus({preventScroll:true});});};
  const changeAudio=(patch:Partial<Preferences>)=>{
    const next={...preferences,...patch};audio.current?.configure(next.audio,next.music,next.volume,next.effects,next.effectsVolume);
    if(next.audio)void audio.current?.activate();setPreferences(next);
  };
  const toggleAudio=(intent:'enable'|'resume'|'mute')=>{
    const player=audio.current;
    if(intent==='resume'){void player?.activate();return;}
    const enabled=intent==='enable';
    changeAudio(enabled?{audio:true,...(!preferences.music&&!preferences.effects?{music:true,effects:true}:{})}:{audio:false});
  };
  const testAudio=()=>{if(preferences.audio&&preferences.effects){void audio.current?.activate();audio.current?.play('award');}};
  const quickAudio=<AudioQuickControl enabled={preferences.audio&&(preferences.music||preferences.effects)} effects={preferences.effects&&preferences.effectsVolume>0} enableLabel={preferences.music===preferences.effects?'Enable sound & music':'Enable audio'} status={audioStatus} onToggle={toggleAudio} onTest={testAudio}/>;
  if(libraryOpen)return <ExecutiveLibrary onBack={closeLibrary} returnLabel={playing?'Return to simulation':'Return to title screen'}/>;
  if(!playing)return <TitleScreen game={hasGame?state:null} highest={highest} onStart={start} onContinue={enter} onImport={importGame} onLibrary={openLibrary} audioControl={<>{quickAudio}<AudioSettings preferences={preferences} onChange={changeAudio}/></>}/>;
  return <div className={'suite'+(reduced?' reduce-motion':'')}>
    <a className="skip" href="#workspace">Skip to workspace</a>
    <header className="topbar"><div className="brand"><span className="logo" aria-hidden="true">N.</span><div><strong>NOTHING™</strong><span>Executive management suite</span></div></div><div className="top-meta"><span className="stage" data-testid="campaign-stage">{state.campaign.mode==="sandbox"?"Endless sandbox":String(state.campaign.stage).padStart(2,"0")+" / "+STAGES[state.campaign.stage-1].name}</span><span className="save" role="status">{saved?'● Local save active':'Local save unavailable'}</span></div></header>
    <aside className="rail"><div className="rail-caption">WORKSPACE</div><WorkspaceNavigation state={state} current={current} onNavigate={navigate} showAll={showAll} setShowAll={setShowAll}/>{quickAudio}<button className="secondary library-entry" onClick={openLibrary}>Executive Library</button><details className="workspace-settings"><summary>Settings and saves</summary><div className="rail-bottom"><label><input type="checkbox" checked={reduced} onChange={e=>setPreferences(p=>({...p,reduced:e.target.checked}))}/> Reduce motion</label>
    <AudioSettings preferences={preferences} onChange={changeAudio}/><button className="link-button" onClick={()=>setReset(!reset)} aria-expanded={reset}>New simulation</button><button className="link-button" onClick={menu}>Title screen and backups</button><button className="link-button" onClick={()=>{setTutorial(0);navigate('office');}}>Show executive induction</button><small>BUILD 0.18.0 · REWARD EXPERIENCE</small></div></details></aside>
    <main id="workspace" tabIndex={-1}>
      <div className="intro"><div><p className="eyebrow">OFFICE OF THE CHIEF EXECUTIVE</p><h1>{current==='office'?'Executive overview':info.label}</h1><p>{info.description}</p></div><div className="day"><span>WORKING DAY</span><strong data-testid="day">{state.day.toString().padStart(3,'0')}</strong></div></div>
      {reset&&<section className="panel reset" aria-label="New simulation"><h2>Start a new simulation</h2><p>This replaces the current local save.</p><label htmlFor="seed">World seed (0–4294967295)</label><input id="seed" value={seed} onChange={e=>setSeed(e.target.value)} inputMode="numeric"/><div className="people-filter"><label htmlFor="game-mode">Mode</label><select id="game-mode" value={mode} onChange={e=>setMode(e.target.value as GameMode)}><option value="campaign">Campaign</option><option value="sandbox">Endless sandbox</option></select></div>
      <div className="people-filter"><label htmlFor="game-difficulty">Difficulty</label><select id="game-difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}>{Object.entries(DIFFICULTIES).map(([id,d])=><option key={id} value={id}>{d.name}</option>)}</select></div><p className="hint">{DIFFICULTIES[difficulty].description}</p>
      <div className="people-filter"><label htmlFor="game-scenario">Scenario</label><select id="game-scenario" value={scenario} onChange={e=>setScenario(e.target.value as Scenario)}>{Object.entries(SCENARIOS).map(([id,d])=><option key={id} value={id} disabled={!unlockedScenarios(highest).includes(id as Scenario)}>{d.name}{highest<d.unlock?' (unlocks at stage '+d.unlock+')':''}</option>)}</select></div><p className="hint">{SCENARIOS[scenario].description}</p>
      <div className="controls"><button disabled={!validSeed||!unlockedScenarios(highest).includes(scenario)} onClick={()=>{start(Number(seed),{mode,difficulty,scenario},false);}}>Replace save</button><button className="secondary" onClick={()=>setReset(false)}>Cancel</button></div></section>}
      {tutorial>=0&&!state.ending&&<TutorialPanel step={tutorial} skip={()=>setTutorial(-1)} finish={()=>setTutorial(-1)}/>}
      <section className="kpis compact-kpis" aria-label="Executive indicators"><article><span>Corporate liquidity</span><strong data-testid="cash">{money(state.cash)}</strong><small>Available capital</small></article><article><span>Executive actions</span><strong>{state.capacity}/{dailyCapacity(state)}</strong><small>Remaining today</small></article></section>
      {state.ending&&<section className="panel alert" id="board-notification" role="alert"><p className="eyebrow">BOARD NOTIFICATION</p><h2>Simulation concluded</h2><p>{endings[state.ending]}</p><button onClick={()=>setReset(true)}>Start another simulation</button></section>}
      {!state.ending&&e&&<section className="panel alert" id="pending-decision" aria-label="Pending corporate decision"><p className="eyebrow">DECISION REQUIRED · {CATEGORY_NAMES[e.category??"general"].toUpperCase()}</p><h2>{e.title}</h2><p>{e.description}</p><div className="choice-grid">{e.choices.map(c=><button key={c.id} onClick={()=>send({type:'choose',id:c.id})}><strong>{c.label}</strong><span>{c.detail}</span><small className="incident-effect">{describeEffects(c.effect)}</small>{c.delayed&&<small>Further consequences possible.</small>}</button>)}</div></section>}
      {current!=='office'&&!introduced.includes(current)&&<FeatureIntroduction id={current} dismiss={()=>setIntroduced(old=>[...old,current])}/>}
      {view('office',<>{newWorkspaces.length>0&&<section className="panel new-workspaces" aria-label="New workspaces"><p className="eyebrow">CORPORATE CAPABILITIES EXPANDED</p><h2>New workspaces introduced</h2><p>Explore them when you're ready. Your current daily objectives remain unchanged.</p><div className="controls">{newWorkspaces.map(id=><button key={id} className="secondary" onClick={()=>{navigate(id);setNewWorkspaces(old=>old.filter(w=>w!==id));}}>{workspaceInfo(id).label}</button>)}<button className="secondary" onClick={()=>setNewWorkspaces([])}>Dismiss introductions</button></div></section>}<ExecutiveBrief state={state} navigate={navigate} send={send}/><section className="panel" id="decisions"><div className="section-head"><div><p className="eyebrow">DAILY OPERATIONS</p><h2>Executive actions</h2></div><span className="capacity" aria-live="polite">{state.capacity} / {dailyCapacity(state)} available</span></div><p className="hint">Actions consume one executive capacity. Advance the day to reconcile revenue, expenditure and operational risk.</p><div className="actions">{[...ACTIONS].sort((a,b)=>Number(b.id===guidance.action)-Number(a.id===guidance.action)).map(a=><button className={'action'+(guidance.action===a.id?' recommended-action':'')} key={a.id} disabled={!!state.ending||!!e||state.capacity===0||state.cash<a.cost} onClick={()=>send({type:'action',id:a.id})}><span><strong>{a.label}</strong>{guidance.action===a.id&&<small className="recommend-label">Suggested action</small>}<small>{a.detail}</small></span><span className="cost">{money(a.cost)}</span></button>)}</div></section></>)}
      <GlobalNotices notices={notices} dismiss={()=>setNotices([])}/>
      {receipt&&<DecisionFeedback key={receipt.id} receipt={receipt} onDismiss={()=>setReceipt(null)}/>}
      {view('metrics',<section className="panel" id="metrics"><p className="eyebrow">PERFORMANCE INTELLIGENCE</p><h2>Organisational metrics</h2><div className="metric-grid">{METRIC_KEYS.map(k=><MetricBar key={k} name={k} value={state.metrics[k]}/>)}</div><p className="hint">Actual productivity reaching {actualLimit(state)} ends the simulation. Insolvency or a loss of board confidence also ends it.</p></section>)}
      {view('intelligence',<ExecutiveIntelligence state={state}/>)}
      {view('campaign',<CampaignPanel state={state} send={send} highest={highest}/>)}
      {state.campaign.stage===7&&view('containment',<BossPanel state={state} send={send}/>)}
      {view('departments',<DepartmentsPanel state={state} send={send}/>)}
      {view('employees',<EmployeesPanel state={state} send={send}/>)}
      {view('meetings',<MeetingsPanel state={state} send={send}/>)}
      {view('communications',<CommunicationsPanel state={state} send={send}/>)}
      {view('programmes',<ProgrammesPanel state={state} send={send}/>)}
      {view('finance',<FinancePanel state={state} send={send}/>)}
      {view('nothing-os',<OSPanel state={state} send={send} reduced={reduced}/>)}
      {view('agents',<AgentsPanel state={state} send={send}/>)}
      {view('incidents',<IncidentsPanel state={state}/>)}
      {view('achievements',<AchievementPanel state={state}/>)}
      {view('ledger',<section className="panel" id="ledger"><p className="eyebrow">FINANCIAL CONTROL</p><h2>Transaction ledger</h2>{state.ledger.length===0?<p className="hint">No transactions recorded.</p>:<div className="ledger-scroll"><table><thead><tr><th scope="col">Day</th><th scope="col">Transaction</th><th scope="col">Category</th><th scope="col">Amount</th></tr></thead><tbody>{[...state.ledger].reverse().slice(0,12).map((x,i)=><tr key={i}><td>{x.day}</td><td>{x.label}</td><td>{x.category??"Legacy"}</td><td className={x.amount<0?'negative':'positive'}>{x.amount>0?'+':''}{money(x.amount)}</td></tr>)}</tbody></table></div>}</section>)}{view('activity',<section className="panel" id="activity"><p className="eyebrow">CORPORATE RECORD</p><h2>Activity log</h2><ol className="activity">{state.log.slice(0,10).map((x,i)=><li key={i}>{x}</li>)}</ol></section>)}
      <div className="day-controls"><button className="advance" disabled={!!state.ending||!!e} onClick={()=>send({type:'endDay'})}>Conclude working day <span aria-hidden="true">→</span></button><p className="hint">{state.ending?'Simulation concluded.':e?'Resolve the pending corporate decision first.':state.capacity?`${state.capacity} executive action${state.capacity===1?'':'s'} remain. You can conclude the day without using them.`:'All executive actions used. Conclude the day to recover your capacity.'}</p></div>
      <footer>NOTHING™ · Internal use only · Seed {state.seed} · All financial values are simulated.</footer>
    </main>
  </div>;
}
void registerWebApp();
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
