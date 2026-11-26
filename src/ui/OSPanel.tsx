import {useEffect,useState} from 'react';
import type {GameState,Command,OSCommand,OSProfile} from '../engine/types';
import {OS_PROFILES,bootFee,projectedTokens,inferenceFee,osEligibility,DIAGNOSTIC_FEE,COMPLIANCE_FEE} from '../engine/os';

const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const num=(n:number)=>n.toLocaleString('en-GB');
const apps=[
  ['overview','System monitor','SYS'],['finance','Financial console','FIN'],['people','People directory','HR'],
  ['calendar','Calendar console','CAL'],['communications','Align™ terminal','COM'],['portfolio','Transformation console','PMO'],
  ['settings','Enterprise settings','CFG'],['diagnostics','Diagnostics','DIA'],['licence','Licence centre','LIC'],
  ['compliance','Compliance dashboard','GRC']
] as const;
type App=typeof apps[number][0];
const bootSteps=['Verifying enterprise entitlement','Initialising strategic inactivity kernel','Allocating idle processes','Validating absence of deliverables','Enterprise desktop authorised'];
const shutdownSteps=['Deferring outstanding decisions','Closing unnecessary processes','Revoking enterprise entitlement','Reducing simulated inference demand to zero','Strategic shutdown certified'];
export function OSPanel({state,send,reduced}:{state:GameState;send:(c:Command)=>void;reduced:boolean}){
  const o=state.os,online=o.power==='online';
  const [app,setApp]=useState<App>('overview');
  const [transition,setTransition]=useState<'boot'|'shutdown'|null>(null);
  const [step,setStep]=useState(0);
  const [confirm,setConfirm]=useState(false);
  useEffect(()=>{
    if(!transition)return;
    if(reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches){setTransition(null);return;}
    const timer=window.setTimeout(()=>{if(step>=4)setTransition(null);else setStep(step+1);},300);
    return ()=>window.clearTimeout(timer);
  },[transition,step,reduced]);
  const perform=(c:OSCommand)=>{if(osEligibility(state,c))return;send(c);if(c.operation==='boot'||c.operation==='shutdown'){setStep(0);setTransition(reduced?null:c.operation);setConfirm(false);if(c.operation==='boot')setApp('overview');}};
  const action=(c:OSCommand,label:string)=>{const reason=osEligibility(state,c);return <div className="os-control"><button className="secondary" disabled={!!reason} onClick={()=>perform(c)}>{label}</button>{reason&&<small>{reason}</small>}</div>;};
  const tokens=projectedTokens(o),diagnostic=o.diagnostics.at(-1);
  return <section className="panel departments" id="nothing-os" aria-labelledby="os-heading">
    <p className="eyebrow">ENTERPRISE DIGITAL INFRASTRUCTURE</p><h2 id="os-heading">NOTHING™ OS Enterprise Edition</h2>
    <div className="department-summary"><div><span>System status</span><strong data-testid="os-power">{online?'Online':'Offline'}</strong></div><div><span>Projected daily tokens</span><strong data-testid="os-tokens">{num(tokens)}</strong></div><div><span>Licence expenditure</span><strong data-testid="os-licence-spend">{money(o.licenceSpend)}</strong></div><div><span>Tokens avoided while offline</span><strong>{num(o.avoidedTokens)}</strong></div></div>
    <div className="os-shell">
      <header className="os-titlebar"><span className="os-mark">N.</span><div><strong>NOTHING™ OS</strong><small>ENTERPRISE EDITION / BUILD 2026.08</small></div><span className="os-light" data-online={online}>{online?'● ONLINE':'○ OFFLINE'}</span></header>
      {transition?<div className="os-boot" role="status" aria-live="polite">
        <div className="os-wordmark">N.</div><h3>{transition==='boot'?'Enterprise startup sequence':'Strategic shutdown sequence'}</h3>
        <div className="os-progress"><div style={{width:((step+1)*20)+'%'}}/></div>
        <ol>{(transition==='boot'?bootSteps:shutdownSteps).slice(0,step+1).map((text,i)=><li key={text}>{i===step?'›':'✓'} {text}</li>)}</ol><button className="secondary" onClick={()=>setTransition(null)}>Skip animation</button>
      </div>:!online?<div className="os-offline">
        <div className="os-wordmark">N.</div><p className="eyebrow">SYSTEM OFFLINE</p><h3>{o.boots?'Strategic non-operation achieved':'Enterprise entitlement required'}</h3>
        <p>{o.boots?'All simulated inference demand is suspended. No active processes remain.':'Initialise the enterprise operating environment to begin consuming simulated resources.'}</p>
        {o.shutdowns>0&&<p className="os-cert" data-testid="os-certificate">100% reduction in active token demand certified.</p>}
        {action({type:'os',operation:'boot'},(o.boots?'Purchase restart licence':'Activate enterprise licence')+' · '+money(bootFee(o)))}
        <p className="os-muted">The main corporate simulator remains available while the fictional OS is offline.</p>
      </div>:<div className="os-desktop">
        <nav className="os-apps" aria-label="NOTHING OS applications">{apps.map(([id,label,icon])=><button key={id} className="os-app" aria-pressed={app===id} onClick={()=>setApp(id)}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav>
        <article className="os-window" aria-label={apps.find(a=>a[0]===app)?.[1]}>
          <div className="os-windowbar"><strong>{apps.find(a=>a[0]===app)?.[1]}</strong><span>ENTERPRISE SESSION {o.boots}</span></div>
          <div className="os-windowbody">
            {app==='overview'&&<><h3>System monitor</h3><p>Operational resources allocated. Measurable outcomes not required.</p><dl><dt>Compute profile</dt><dd>{OS_PROFILES[o.profile].name}</dd><dt>Strategically idle processes</dt><dd>{OS_PROFILES[o.profile].processes}</dd><dt>Projected tokens/day</dt><dd>{num(tokens)}</dd><dt>Projected inference cost/day</dt><dd>{money(inferenceFee(tokens))}</dd><dt>Lifetime simulated tokens</dt><dd>{num(o.totalTokens)}</dd><dt>Lifetime inference expense</dt><dd>{money(o.totalInferenceCost)}</dd></dl></>}
            {app==='finance'&&<><h3>Financial console</h3><dl><dt>Corporate liquidity</dt><dd>{money(state.cash)}</dd><dt>Debt</dt><dd>{money(state.finance.debt)}</dd><dt>Operating result this quarter</dt><dd>{money(state.finance.period.revenue-state.finance.period.expenses)}</dd></dl><a href="#finance">Open corporate finance</a></>}
            {app==='people'&&<><h3>People directory</h3><dl><dt>Active personnel</dt><dd>{state.employees.filter(e=>e.status==='active').length}</dd><dt>Active departments</dt><dd>{state.departments.filter(d=>d.active).length}</dd><dt>Promotion requests</dt><dd>{state.employees.filter(e=>e.status==='active'&&e.promotionRequested).length}</dd></dl><a href="#employees">Open personnel directory</a></>}
            {app==='calendar'&&<><h3>Calendar console</h3><dl><dt>Scheduled meetings</dt><dd>{state.meetings.filter(m=>m.status==='scheduled').length}</dd><dt>Held meetings</dt><dd>{state.meetings.filter(m=>m.status==='held').length}</dd><dt>Person-hours consumed</dt><dd>{(state.meetings.reduce((n,m)=>n+m.personMinutes,0)/60).toFixed(1)}</dd></dl><a href="#meetings">Open meeting governance</a></>}
            {app==='communications'&&<><h3>Align™ terminal</h3><dl><dt>Communications</dt><dd>{state.communications.length}</dd><dt>Viral posts</dt><dd>{state.communications.filter(c=>c.viral).length}</dd><dt>Open scandals</dt><dd>{state.communications.filter(c=>c.scandal==='open').length}</dd></dl><a href="#communications">Open communications desk</a></>}
            {app==='portfolio'&&<><h3>Transformation console</h3><dl><dt>Commissioned programmes</dt><dd>{state.programmes.length}/9</dd><dt>Consultancy spend</dt><dd>{money(state.programmes.reduce((n,p)=>n+p.consultancy,0))}</dd><dt>Certified programmes</dt><dd>{state.programmes.filter(p=>p.status==='complete').length}</dd></dl><a href="#programmes">Open transformation portfolio</a></>}
            {app==='settings'&&<><h3>Enterprise settings</h3><p>Changing the compute profile uses executive capacity. No real inference is performed.</p><div className="os-profiles">{(Object.keys(OS_PROFILES) as OSProfile[]).map(profile=><div key={profile}><strong>{OS_PROFILES[profile].name}</strong><p>{num(OS_PROFILES[profile].tokens)} tokens/day · {money(inferenceFee(OS_PROFILES[profile].tokens))}/day</p>{action({type:'os',operation:'profile',profile},o.profile===profile?'Selected':'Apply '+OS_PROFILES[profile].name)}</div>)}</div></>}
            {app==='diagnostics'&&<><h3>System diagnostics</h3>{action({type:'os',operation:'diagnose'},'Run diagnostics · '+money(DIAGNOSTIC_FEE))}{diagnostic?<div className="os-report"><strong>Diagnostic record · day {diagnostic.day}</strong><ul>{diagnostic.findings.map(x=><li key={x}>{x}</li>)}</ul></div>:<p>No diagnostic report available.</p>}</>}
            {app==='licence'&&<><h3>Enterprise licence centre</h3><dl><dt>Entitlement status</dt><dd>{o.licence}</dd><dt>Activated sessions</dt><dd>{o.boots}</dd><dt>Total licence charges</dt><dd>{money(o.licenceSpend)}</dd><dt>Next restart entitlement</dt><dd>£2,500</dd></dl><p>Current entitlement expires immediately upon shutdown. No perpetual licence is available.</p></>}
            {app==='compliance'&&<><h3>Compliance dashboard</h3><dl><dt>Regulatory exposure</dt><dd>{state.metrics.regulation}/100</dd><dt>Governance complexity</dt><dd>{state.metrics.bureaucracy}/100</dd><dt>Licence validity</dt><dd>{o.licence}</dd></dl><meter min={0} max={100} value={state.metrics.regulation} aria-label="OS regulatory exposure"/>{action({type:'os',operation:'compliance-review'},'Commission compliance review · '+money(COMPLIANCE_FEE))}</>}
          </div>
        </article>
      </div>}
      {online&&!transition&&<footer className="os-taskbar"><span>Day {state.day} · {num(tokens)} projected tokens/day</span>{!confirm?<button disabled={!!osEligibility(state,{type:'os',operation:'shutdown'})} onClick={()=>setConfirm(true)}>Strategic shutdown</button>:<div className="os-shutdown-confirm"><p>Terminate all processes and expire this licence?</p><button disabled={!!osEligibility(state,{type:'os',operation:'shutdown'})} onClick={()=>perform({type:'os',operation:'shutdown'})}>Confirm shutdown</button><button className="secondary" onClick={()=>setConfirm(false)}>Keep operating</button></div>}</footer>}
    </div>
    <details className="os-history"><summary>Operating system audit history ({o.history.length})</summary>{o.history.slice().reverse().map((h,i)=><p key={i}>{h}</p>)}</details>
    <p className="hint">All tokens, licence charges and inference expenses are fictional in-game values. Operating costs settle at day close; shutdown immediately sets projected demand to zero. Full multi-agent orchestration will be added in the next increment.</p>
  </section>;
}
