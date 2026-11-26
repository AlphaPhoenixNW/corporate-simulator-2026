import {TUTORIAL_STEPS} from './onboarding';
export function TutorialPanel({step,skip,finish}:{step:number;skip:()=>void;finish:()=>void}){
 const item=TUTORIAL_STEPS[step];if(!item)return null;
 return <section className="panel tutorial-panel" aria-label="Executive induction"><div className="section-head"><div><p className="eyebrow">OPTIONAL EXECUTIVE INDUCTION · {step+1}/{TUTORIAL_STEPS.length}</p><h2>{item.title}</h2></div><button className="secondary" onClick={skip}>Skip tutorial</button></div><progress max={TUTORIAL_STEPS.length} value={step+1} aria-label="Tutorial progress"/><p>{item.detail}</p><div className="controls"><a href={'#'+item.target}>Go to relevant workspace</a>{step===5&&<button onClick={finish}>Complete induction</button>}</div><p className="hint">Your decisions are real gameplay. You can ignore or skip this guide at any point.</p></section>;
}
