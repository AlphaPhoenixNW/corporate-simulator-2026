import {useEffect,useState} from 'react';
import {formatDelta,type DecisionReceipt} from './decisionFeedback';
export function DecisionFeedback({receipt,onDismiss}:{receipt:DecisionReceipt;onDismiss:()=>void}){
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{if(expanded)return;const timer=setTimeout(onDismiss,7500);return ()=>clearTimeout(timer);},[receipt.id,expanded,onDismiss]);
 const visible=expanded?receipt.deltas:receipt.deltas.slice(0,4);
 return <aside className={'decision-receipt '+receipt.kind+(expanded?' expanded':'')} aria-label="Executive decision feedback" data-testid="decision-feedback">
 <div className="receipt-top"><span>{receipt.kind==='day'?'DAILY RECONCILIATION':receipt.kind==='recognition'?'EXECUTIVE RECOGNITION':'DECISION RATIFIED'}</span><button type="button" className="receipt-close" onClick={onDismiss} aria-label="Dismiss decision feedback">×</button></div>
 <div role="status" aria-live="polite" aria-atomic="true"><strong className="receipt-title">{receipt.title}</strong><p>{receipt.flavour}</p>
 {visible.length>0?<div className="receipt-deltas">{visible.map(d=><div key={d.key} className={'receipt-delta '+d.tone}><span>{d.label}</span><strong>{formatDelta(d)}</strong></div>)}</div>:<small>Decision recorded. No immediate change to tracked indicators.</small>}</div>
 {receipt.deltas.length>4&&<button className="receipt-more" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?'Show fewer changes':'Show all '+receipt.deltas.length+' changes'}</button>}
 </aside>;
}
