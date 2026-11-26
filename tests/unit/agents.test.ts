import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {initialAgents,AGENT_MODELS,workflowTokens,workflowCost,plannedRuns,runAgents,validAgents,agentEligibility} from '../../src/engine/agents';
import {AGENT_ROLES,type GameState} from '../../src/engine/types';
import {decodeSave} from '../../src/storage';
const boot=()=>dispatch(newGame(),{type:'os',operation:'boot'});
const enabled=()=>dispatch(boot(),{type:'agent',operation:'toggle'});
describe('agent orchestration',()=>{
  it('starts disabled and cannot run while the OS is offline',()=>{
    const s=newGame();expect(s.agents).toEqual(initialAgents());
    expect(dispatch(s,{type:'agent',operation:'toggle'})).toBe(s);
    expect(runAgents({...s,agents:{...s.agents,enabled:true}},()=>0).cost).toBe(0);
  });
  it('enables workflows and selects three simulated models with different costs',()=>{
    const s=enabled();expect(s.agents.enabled).toBe(true);expect(s.capacity).toBe(0);
    expect(Object.keys(AGENT_MODELS)).toHaveLength(3);
    expect(workflowTokens('compact')).toBe(5000);expect(workflowTokens('enterprise')).toBe(10000);
    expect(workflowTokens('reasoning')).toBe(20000);expect(workflowCost('reasoning')).toBe(160);
    const next=dispatch({...s,capacity:2},{type:'agent',operation:'model',model:'reasoning'});
    expect(next.agents.model).toBe('reasoning');
  });
  it('passes output through six ordered roles and reconciles tokens and costs',()=>{
    const s=enabled(),r=runAgents(s,()=>.9);
    expect(r.runs).toHaveLength(1);
    const trace=r.runs[0];expect(trace.steps.map(step=>step.role)).toEqual([...AGENT_ROLES]);
    for(let i=1;i<trace.steps.length;i++)expect(trace.steps[i].input).toBe(trace.steps[i-1].output);
    expect(trace.steps.reduce((n,step)=>n+step.tokens,0)).toBe(trace.tokens);
    expect(r.cost).toBe(30);expect(r.agents.totalTokens).toBe(10000);
    expect(s.agents.runs).toHaveLength(0);expect(validAgents(r.agents)).toBe(true);
  });
  it('blocks hallucinations and useful recommendations under strict governance',()=>{
    const r=runAgents(enabled(),()=>0);
    expect(r.runs[0]).toMatchObject({hallucination:true,useful:false,blocked:true});
    expect(r.runs[0].steps[3].status).toBe('blocked');
    expect(r.delta.actual).toBe(-1);expect(r.delta.regulation).toBeUndefined();
  });
  it('allows hallucinations and actual usefulness in permissive mode',()=>{
    const s=enabled(),r=runAgents({...s,agents:{...s.agents,governance:'permissive'}},()=>0);
    expect(r.runs[0]).toMatchObject({hallucination:true,useful:true,blocked:false});
    expect(r.delta.actual).toBe(8);expect(r.delta.regulation).toBe(5);
    expect(r.agents.hallucinations).toBe(1);expect(r.agents.usefulRuns).toBe(1);
  });
  it('respects daily budgets and executive adoption limits',()=>{
    const s=enabled();
    const low={...s,agents:{...s.agents,budget:5000}};
    expect(plannedRuns(low)).toBe(0);expect(runAgents(low,()=>0).runs).toHaveLength(0);
    const high={...s,agents:{...s.agents,adoption:100,budget:20000}};
    expect(plannedRuns(high)).toBe(2);expect(runAgents(high,()=>.9).agents.lastTokens).toBe(20000);
    expect(agentEligibility({...s,capacity:2},{type:'agent',operation:'budget',budget:123})).toBe('Invalid budget');
  });
  it('charges executive adoption and supports model, objective and governance settings',()=>{
    const s={...enabled(),capacity:2},n=dispatch(s,{type:'agent',operation:'promote-adoption'});
    expect(n.cash).toBe(s.cash-300);expect(n.agents.adoption).toBe(40);
    const g=dispatch(n,{type:'agent',operation:'governance'});
    expect(g.agents.governance).toBe('permissive');
    const o=dispatch({...g,capacity:2},{type:'agent',operation:'objective',objective:'savings'});
    expect(runAgents(o,()=>.9).runs[0].steps[0].input).toContain('hypothetical resource savings');
  });
  it('posts separate OS and agent costs and produces an operational communication',()=>{
    const s=enabled(),n=dispatch(s,{type:'endDay'});
    expect(n.agents.totalRuns).toBe(1);expect(n.os.totalTokens).toBe(24000);
    expect(n.ledger.some(l=>l.label==='NOTHING™ OS simulated inference'&&l.amount===-48)).toBe(true);
    expect(n.ledger.some(l=>l.label==='Agentic workflow simulated inference'&&l.amount===-30)).toBe(true);
    expect(n.communications.some(c=>c.subject.includes('Agentic operations report'))).toBe(true);
    const f=n.finance;expect(f.openingCash+f.period.revenue-f.period.expenses+f.period.financing+f.period.investing).toBe(n.cash);
  });
  it('suspends all workflow demand immediately on shutdown and resumes only when online',()=>{
    const s=enabled(),daily=runAgents(s,()=>.9);
    const ready:GameState={...s,agents:daily.agents,capacity:2};
    const off=dispatch(ready,{type:'os',operation:'shutdown'});
    expect(off.agents.lastTokens).toBe(0);expect(plannedRuns(off)).toBe(0);
    expect(runAgents(off,()=>0).agents.totalRuns).toBe(1);
    const restarted=dispatch(off,{type:'os',operation:'boot'});
    expect(plannedRuns(restarted)).toBe(1);
  });
  it('migrates v8 saves and persists valid workflow histories',()=>{
    const s=newGame(),legacy={...s,version:8,agents:undefined};
    expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:11,agents:initialAgents()});
    const n=dispatch(enabled(),{type:'endDay'});
    expect(decodeSave(JSON.stringify(n))).toEqual(n);
    expect(decodeSave(JSON.stringify({...n,agents:{...n.agents,budget:123}}))).toBeNull();
  });
});
