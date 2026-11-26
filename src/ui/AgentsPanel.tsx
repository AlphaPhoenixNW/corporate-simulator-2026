import {useState} from 'react';
import {AGENT_ROLES,type AgentModel,type AgentObjective,type AgentCommand,type GameState,type Command} from '../engine/types';
import {AGENT_MODELS,AGENT_OBJECTIVES,ROLE_NAMES,TOKEN_BUDGETS,ADOPTION_COST,plannedRuns,workflowTokens,workflowCost,agentEligibility} from '../engine/agents';
import {projectedTokens} from '../engine/os';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const num=(n:number)=>n.toLocaleString('en-GB');
export function AgentsPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const a=state.agents,online=state.os.power==='online',runs=plannedRuns(state);
  const [selected,setSelected]=useState<number|null>(null);
  const report=a.runs.find(r=>r.id===selected)??a.runs.at(-1);
  const disabled=!!agentEligibility(state,{type:'agent',operation:'toggle'});
  const control=(c:AgentCommand,label:string)=>{const reason=agentEligibility(state,c);return <div className="agent-control"><button className="secondary" disabled={!!reason} onClick={()=>send(c)}>{label}</button>{reason&&<small>{reason}</small>}</div>;};
  return <section className="panel departments" id="agents" aria-labelledby="agents-heading">
    <p className="eyebrow">AGENTIC ENTERPRISE INNOVATION</p><h2 id="agents-heading">Agentic AI control centre</h2>
    <div className="department-summary"><div><span>Orchestration</span><strong data-testid="agent-status">{!online?'Offline':a.enabled?'Enabled':'Disabled'}</strong></div><div><span>Projected agent tokens/day</span><strong data-testid="agent-projection">{num(runs*workflowTokens(a.model))}</strong></div><div><span>Lifetime workflows</span><strong data-testid="agent-runs">{a.totalRuns}</strong></div><div><span>Lifetime inference cost</span><strong>{money(a.totalCost)}</strong></div></div>
    {!online&&<p className="department-report">NOTHING™ OS is offline. All agent demand is suspended. <a href="#nothing-os">Activate the enterprise OS.</a></p>}
    <div className="meeting-workspace">
      <article className="department-detail" aria-label="Agent configuration">
        <h3>Workflow configuration</h3>
        <p className="hint">Every configuration change uses one executive action. Each full workflow runs at day close if enabled, online and within the daily token budget.</p>
        <div className="controls">{control({type:'agent',operation:'toggle'},a.enabled?'Disable orchestration':'Enable orchestration')}{control({type:'agent',operation:'governance'},'Switch to '+(a.governance==='strict'?'permissive':'strict')+' governance')}</div>
        <div className="people-filter"><label htmlFor="agent-model">Simulated model</label><select id="agent-model" value={a.model} disabled={disabled} onChange={e=>send({type:'agent',operation:'model',model:e.target.value as AgentModel})}>{Object.entries(AGENT_MODELS).map(([id,m])=><option key={id} value={id}>{m.name}</option>)}</select></div>
        <div className="people-filter"><label htmlFor="agent-objective">Workflow objective</label><select id="agent-objective" value={a.objective} disabled={disabled} onChange={e=>send({type:'agent',operation:'objective',objective:e.target.value as AgentObjective})}>{Object.entries(AGENT_OBJECTIVES).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
        <div className="people-filter"><label htmlFor="agent-budget">Daily token budget</label><select id="agent-budget" value={a.budget} disabled={disabled} onChange={e=>send({type:'agent',operation:'budget',budget:Number(e.target.value)})}>{TOKEN_BUDGETS.map(n=><option key={n} value={n}>{num(n)} tokens</option>)}</select></div>
        <p className="department-report">Per workflow: {num(workflowTokens(a.model))} tokens · {money(workflowCost(a.model))}. Projected: {runs} workflows, {money(runs*workflowCost(a.model))} agent expense/day. Combined OS and agent demand: {num(projectedTokens(state.os)+runs*workflowTokens(a.model))} tokens/day.</p>
        <h3>Executive adoption</h3><meter min={0} max={100} value={a.adoption} aria-label="Executive AI adoption"/><p>{a.adoption}/100 adoption · up to {1+Math.floor(a.adoption/40)} workflows/day before budget limits.</p>{control({type:'agent',operation:'promote-adoption'},'Promote AI adoption · '+money(ADOPTION_COST))}
        <h3>Governance exposure</h3><p>Mode: <strong>{a.governance}</strong>. Strict governance blocks hallucinated claims and useful recommendations; permissive governance may release either.</p><dl className="agent-totals"><dt>Hallucinations detected</dt><dd>{a.hallucinations}</dd><dt>Useful releases</dt><dd>{a.usefulRuns}</dd><dt>Lifetime agent tokens</dt><dd>{num(a.totalTokens)}</dd></dl>
        <p className="hint" role="status">{a.lastStatus}</p>
      </article>
      <article className="department-detail" aria-label="Agent workflow diagram">
        <h3>Six-agent execution trace</h3><p className="hint">Each agent receives the preceding agent's output. The workflow culminates in strategic non-intervention.</p>
        {a.runs.length>0&&<div className="people-filter"><label htmlFor="agent-report">Operational report</label><select id="agent-report" value={report?.id??''} onChange={e=>setSelected(Number(e.target.value))}>{a.runs.slice().reverse().map(r=><option key={r.id} value={r.id}>Workflow #{r.id} · day {r.day}</option>)}</select></div>}
        <ol className="agent-flow">{AGENT_ROLES.map((role,i)=>{const step=report?.steps[i];return <li key={role}><div className="agent-node"><span className="eyebrow">AGENT {String(i+1).padStart(2,'0')}</span><strong>{ROLE_NAMES[role]}</strong><span className="agent-state">{step?step.status.toUpperCase():'AWAITING EXECUTION'}</span>{step&&<><p>{step.output}</p><small>{num(step.tokens)} tokens</small><details><summary>Input received</summary><p>{step.input}</p></details></>}</div>{i<5&&<div className="agent-connector" aria-hidden="true">↓</div>}</li>;})}</ol>
        {report&&<p className="department-report" data-testid="agent-report">{report.report}</p>}
      </article>
    </div>
    <p className="hint">Models, outputs, tokens and costs are deterministic local simulation only. No external AI services or subscriptions are used. The latest 60 reports are retained alongside lifetime counters.</p>
  </section>;
}
