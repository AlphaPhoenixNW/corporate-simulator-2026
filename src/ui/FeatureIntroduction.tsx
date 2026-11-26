import {INTRODUCTIONS} from './progression';
import {workspaceInfo,type Workspace} from './workspaces';
export function FeatureIntroduction({id,dismiss}:{id:Exclude<Workspace,'office'>;dismiss:()=>void}){
 const intro=INTRODUCTIONS[id];
 return <section className="panel feature-introduction" aria-label="Workspace introduction"><div className="section-head"><div><p className="eyebrow">EXECUTIVE BRIEFING / FIRST VISIT</p><h2>Welcome to {workspaceInfo(id).label}</h2></div><button className="secondary" onClick={dismiss}>Got it</button></div><p>{intro.purpose}</p><dl><dt>Try this first</dt><dd>{intro.first}</dd><dt>Watch out for</dt><dd>{intro.risk}</dd></dl></section>;
}
