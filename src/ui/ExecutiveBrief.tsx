import type {GameState} from '../engine/types';
import {campaignGates,gateMet,actualLimit} from '../engine/campaign';
import {mandate,recommend,type Workspace} from './workspaces';
export function ExecutiveBrief({state,navigate}:{state:GameState;navigate:(id:Workspace)=>void}){
 const guidance=recommend(state),gates=state.campaign.mode==='campaign'?campaignGates(state):[],remaining=gates.filter(g=>!gateMet(g));
 return <section className="panel executive-brief" aria-label="Today's objectives">
 <p className="eyebrow">YOUR MANDATE</p><h2>Look productive. Avoid actual delivery.</h2><p>{mandate(state)}</p>
 <div className="brief-scores"><div><span>Perceived productivity</span><strong>{state.metrics.perceived}/100</strong><progress max={100} value={state.metrics.perceived} aria-label="Perceived productivity"/></div><div><span>Actual productivity</span><strong>{state.metrics.actual}/{actualLimit(state)} limit</strong><progress className="risk-progress" max={actualLimit(state)} value={Math.min(actualLimit(state),state.metrics.actual)} aria-label="Actual productivity risk"/></div><div><span>Shareholder confidence</span><strong>{state.metrics.confidence}/100</strong></div><div><span>Employee morale</span><strong>{state.metrics.morale}/100</strong></div></div>
 {gates.length>0&&<div className="brief-objective"><div><strong>Next stage: {gates.length-remaining.length}/{gates.length} requirements met</strong>{remaining.length?<ul>{remaining.slice(0,3).map(g=><li key={g.label}>{g.label}: {g.current.toLocaleString('en-GB')} / {g.direction==='min'?'≥':'≤'} {g.target.toLocaleString('en-GB')}</li>)}</ul>:<p>All stage requirements satisfied.</p>}</div><button className="secondary" onClick={()=>navigate('campaign')}>Review campaign requirements</button></div>}
 {!state.ending&&<div className="brief-recommendation"><p className="eyebrow">SUGGESTED NEXT MOVE</p><h3>{guidance.title}</h3><p>{guidance.detail}</p>{guidance.workspace&&guidance.workspace!=='office'&&<button onClick={()=>navigate(guidance.workspace!)}>Open {guidance.workspace==='campaign'?'campaign':guidance.workspace==='containment'?'containment':'finance'}</button>}{guidance.action&&<a href="#decisions">See recommended executive action below</a>}</div>}
 </section>;
}
