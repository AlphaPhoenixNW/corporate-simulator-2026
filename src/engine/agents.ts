import {AGENT_ROLES,type AgentRole,type AgentModel,type AgentObjective,type AgentState,type AgentRun,type AgentStep,type AgentCommand,type GameState,type Delta} from './types';
export const AGENT_MODELS:Record<AgentModel,{name:string;multiplier:number;price:number;hallucination:number;useful:number}>={
  compact:{name:'NothingLite 1.0',multiplier:1,price:1,hallucination:.28,useful:.04},
  enterprise:{name:'Nothing Enterprise 2026',multiplier:2,price:3,hallucination:.18,useful:.12},
  reasoning:{name:'Nothing Reasoning Ultra',multiplier:4,price:8,hallucination:.10,useful:.26}
};
export const AGENT_OBJECTIVES:Record<AgentObjective,string>={alignment:'Produce a stakeholder alignment strategy',savings:'Identify hypothetical resource savings',transformation:'Prepare a transformation readiness assessment'};
export const ROLE_NAMES:Record<AgentRole,string>={planner:'Planner Agent',executor:'Executor Agent',critic:'Critic Agent',governance:'Governance Agent',supervisor:'Supervisor Agent','non-intervention':'Strategic Non-Intervention Agent'};
const BASE:Record<AgentRole,number>={planner:800,executor:1600,critic:1000,governance:800,supervisor:600,'non-intervention':200};
export const TOKEN_BUDGETS=[5000,10000,20000,40000,80000] as const;
export const ADOPTION_COST=300;
export function initialAgents():AgentState{return {enabled:false,model:'enterprise',objective:'alignment',governance:'strict',budget:20000,adoption:20,nextId:1,runs:[],totalRuns:0,totalTokens:0,totalCost:0,hallucinations:0,usefulRuns:0,lastTokens:0,lastStatus:'Orchestration not enabled.'};}
export function workflowTokens(model:AgentModel){return Object.values(BASE).reduce((a,b)=>a+b,0)*AGENT_MODELS[model].multiplier;}
export function workflowCost(model:AgentModel){return Math.ceil(workflowTokens(model)/1000)*AGENT_MODELS[model].price;}
export function plannedRuns(s:GameState){return s.agents.enabled&&s.os.power==='online'?Math.min(1+Math.floor(s.agents.adoption/40),Math.floor(s.agents.budget/workflowTokens(s.agents.model))):0;}
export function agentEligibility(s:GameState,c:AgentCommand):string|null{
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  if(s.os.power!=='online')return 'NOTHING™ OS must be online';
  const a=s.agents;
  switch(c.operation){
    case 'toggle':return null;
    case 'promote-adoption':return a.adoption>=100?'Adoption ceiling reached':s.cash<ADOPTION_COST?'Insufficient liquidity':null;
    case 'governance':return null;
    case 'model':return !Object.hasOwn(AGENT_MODELS,c.model)?'Unknown model':a.model===c.model?'Model already selected':null;
    case 'objective':return !Object.hasOwn(AGENT_OBJECTIVES,c.objective)?'Unknown objective':a.objective===c.objective?'Objective already selected':null;
    case 'budget':return !TOKEN_BUDGETS.some(n=>n===c.budget)?'Invalid budget':a.budget===c.budget?'Budget already selected':null;
  }
}
export function changeAgents(s:GameState,c:AgentCommand):{agents:AgentState;cost:number;delta:Delta;message:string}|null{
  if(agentEligibility(s,c))return null;
  const a={...s.agents};let cost=0,delta:Delta={},message='';
  switch(c.operation){
    case 'toggle':a.enabled=!a.enabled;message=a.enabled?'Agentic workflow enabled.':'Agentic workflow suspended.';if(!a.enabled)a.lastTokens=0;break;
    case 'promote-adoption':cost=ADOPTION_COST;a.adoption=Math.min(100,a.adoption+20);delta={prestige:2,buzzwords:3};message='Executive AI adoption campaign authorised.';break;
    case 'governance':a.governance=a.governance==='strict'?'permissive':'strict';message='Agent governance set to '+a.governance+'.';break;
    case 'model':a.model=c.model;message=AGENT_MODELS[c.model].name+' selected.';break;
    case 'objective':a.objective=c.objective;message='Workflow objective updated.';break;
    case 'budget':a.budget=c.budget;message='Daily agent token budget set to '+c.budget+'.';break;
  }
  a.lastStatus=message;
  return {agents:a,cost,delta,message};
}
export function runAgents(s:GameState,random:()=>number){
  const a=s.agents,model=AGENT_MODELS[a.model],count=plannedRuns(s);
  const delta:Delta={},reports:string[]=[],runs:AgentRun[]=[];
  const add=(d:Delta)=>{for(const k of Object.keys(d) as (keyof Delta)[])delta[k]=(delta[k]??0)+(d[k]??0);};
  if(!count)return {agents:{...a,lastTokens:0,lastStatus:s.os.power==='offline'?'Offline: all agent inference suspended.':a.enabled?'Token budget insufficient for one workflow.':'Orchestration disabled.'},cost:0,delta,reports,runs};
  for(let i=0;i<count;i++){
    const id=a.nextId+i,objective=AGENT_OBJECTIVES[a.objective];
    const hallucination=random()<model.hallucination;
    const usefulCandidate=random()<model.useful;
    const blocked=a.governance==='strict'&&(hallucination||usefulCandidate);
    const useful=usefulCandidate&&!blocked;
    const steps:AgentStep[]=[];
    const step=(role:AgentRole,output:string,status:AgentStep['status']='completed')=>steps.push({role,tokens:BASE[role]*model.multiplier,input:steps.at(-1)?.output??objective,output,status});
    step('planner','Plan '+id+': establish discovery, alignment and review workstreams for '+objective.toLowerCase()+'.');
    step('executor',hallucination?'Draft claims 47 undocumented enterprise integrations.':usefulCandidate?'Draft includes a measurable operational improvement.':'Draft readiness matrix with no implementation commitment.');
    step('critic',hallucination?'Evidence check failed: claimed integrations are unverified.':usefulCandidate?'Potentially useful recommendation detected.':'No measurable deliverable identified; strategic objective satisfied.');
    step('governance',blocked?'Release blocked pending independent governance review.':hallucination?'Exception approved; unverified claims retained.':'Narrative release authorised.',blocked?'blocked':'completed');
    step('supervisor',blocked?'Escalation accepted. Assign additional review, not implementation.':'Release approved for executive reporting.');
    step('non-intervention',blocked?'No action taken. Governance preserved.':useful?'Recommendation escaped non-intervention controls.':'Report filed. No operational intervention required.');
    const tokens=workflowTokens(a.model),cost=workflowCost(a.model);
    const report='Workflow #'+id+' | '+objective+'. Six agents consumed '+tokens+' simulated tokens (£'+cost+'). '+(blocked?'Governance prevented release.':useful?'A measurable improvement escaped controls.':'No measurable deliverable released.')+(hallucination?' Unverified claims detected.':'');
    runs.push({id,day:s.day,model:a.model,objective:a.objective,steps,tokens,cost,hallucination,useful,blocked,report});
    add({perceived:3,buzzwords:2,prestige:1});
    if(blocked)add({bureaucracy:2,actual:-1});
    if(hallucination&&!blocked)add({regulation:5,confidence:-2});
    if(useful)add({actual:8});
    reports.push(report);
  }
  const tokens=runs.reduce((n,r)=>n+r.tokens,0),cost=runs.reduce((n,r)=>n+r.cost,0);
  return {agents:{...a,nextId:a.nextId+runs.length,runs:[...a.runs,...runs].slice(-60),totalRuns:a.totalRuns+runs.length,totalTokens:a.totalTokens+tokens,totalCost:a.totalCost+cost,hallucinations:a.hallucinations+runs.filter(r=>r.hallucination).length,usefulRuns:a.usefulRuns+runs.filter(r=>r.useful).length,lastTokens:tokens,lastStatus:runs.length+' workflow(s) reconciled.'},cost,delta,reports,runs};
}
export function validAgents(v:unknown):v is AgentState{
  const int=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
  const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
  if(!obj(v)||typeof v.enabled!=='boolean'||typeof v.model!=='string'||!Object.hasOwn(AGENT_MODELS,v.model)||typeof v.objective!=='string'||!Object.hasOwn(AGENT_OBJECTIVES,v.objective)||!['strict','permissive'].includes(String(v.governance))||!TOKEN_BUDGETS.some(n=>n===v.budget)||!int(v.adoption,0,100)||!int(v.nextId,1)||!['totalRuns','totalTokens','totalCost','hallucinations','usefulRuns','lastTokens'].every(k=>int(v[k]))||typeof v.lastStatus!=='string'||!Array.isArray(v.runs)||v.runs.length>60)return false;
  if(Number(v.nextId)!==Number(v.totalRuns)+1||Number(v.hallucinations)>Number(v.totalRuns)||Number(v.usefulRuns)>Number(v.totalRuns)||Number(v.lastTokens)>Number(v.totalTokens)||v.runs.length>Number(v.totalRuns))return false;
  const ids=new Set<number>();
  for(const r of v.runs){
    if(!obj(r)||!int(r.id,1,Number(v.nextId)-1)||ids.has(Number(r.id))||!int(r.day,1)||typeof r.model!=='string'||!Object.hasOwn(AGENT_MODELS,r.model)||typeof r.objective!=='string'||!Object.hasOwn(AGENT_OBJECTIVES,r.objective)||r.tokens!==workflowTokens(r.model as AgentModel)||r.cost!==workflowCost(r.model as AgentModel)||typeof r.hallucination!=='boolean'||typeof r.useful!=='boolean'||typeof r.blocked!=='boolean'||(r.blocked&&r.useful)||typeof r.report!=='string'||!Array.isArray(r.steps)||r.steps.length!==6)return false;
    const steps=r.steps;
    if(!steps.every((step,i)=>obj(step)&&step.role===AGENT_ROLES[i]&&step.tokens===BASE[AGENT_ROLES[i]]*AGENT_MODELS[r.model as AgentModel].multiplier&&typeof step.input==='string'&&typeof step.output==='string'&&['completed','blocked'].includes(String(step.status))&&(i===0||step.input===steps[i-1].output)))return false;
    ids.add(Number(r.id));
  }
  return true;
}
