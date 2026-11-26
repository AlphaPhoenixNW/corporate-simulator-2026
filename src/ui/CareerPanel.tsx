import type {GameState} from '../engine/types';
import type {AutoProfile} from '../engine/autopilot';
import {buildCareer,careerHtml,CAREER_NOTICE,type CareerEntry} from './career';
function Entries({items,empty}:{items:CareerEntry[];empty:string}){
 return items.length?<ul className="career-entries">{items.map(e=><li key={e.title}><strong>{e.title}</strong><span>{e.detail}</span></li>)}</ul>:<p className="hint">{empty}</p>;
}
export function CareerPanel({state,automation}:{state:GameState;automation?:AutoProfile}){
 const cv=buildCareer(state,automation);
 const download=()=>{const url=URL.createObjectURL(new Blob([careerHtml(cv)],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='NOTHING Executive CV - Simulation '+state.seed+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="panel career-panel" aria-label="Executive career portfolio">
 <div className="career-tools"><p className="eyebrow">EXECUTIVE TALENT DIVISION</p><p className="hint">A live fictional CV, separate from your achievement collection. Updated from your current simulation. Download the standalone edition or print to PDF where supported by your browser.</p><div className="controls"><button onClick={download}>Download executive CV</button><button className="secondary" onClick={()=>window.print()}>Print / Save as PDF</button></div></div>
 <article className="career-document" aria-label="Fictional executive CV">
 <p className="eyebrow">NOTHING™ EXECUTIVE TALENT DIVISION · FICTIONAL CAREER RECORD</p><h2>{cv.role}</h2><p className="career-status"><strong>{cv.organisation}</strong> · {cv.status}</p><small>{cv.reference}</small>
 <h3>Executive profile</h3><p>{cv.profile}</p>
 <h3>Career progression</h3><Entries items={cv.appointments} empty="No appointment history recorded."/>
 <h3>Selected career accomplishments</h3><Entries items={cv.accomplishments} empty="No accomplishments recorded yet. Strategic potential remains considerable."/>
 <h3>Current performance indicators</h3><dl className="career-indicators">{cv.indicators.map(e=><div key={e.title}><dt>{e.title}</dt><dd>{e.detail}</dd></div>)}</dl>
 <h3>Internal fictional qualifications</h3><Entries items={cv.credentials} empty="No internal qualifications earned yet."/>
 {cv.automation.length>0&&<><h3>Autonomous leadership (separate laboratory)</h3><Entries items={cv.automation} empty=""/></>}
 <p className="career-disclaimer">{CAREER_NOTICE}</p>
 </article></section>;
}
