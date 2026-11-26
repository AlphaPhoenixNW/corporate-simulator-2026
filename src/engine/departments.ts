import { DEPARTMENT_IDS, type DepartmentId, type DepartmentState, type DepartmentCommand, type GameState, type Delta } from './types';

interface Definition {
  name: string; objective: string; unlockDay: number; competence: number;
  routine: Delta; governance: Delta; incident: Delta; failure: string;
}
export const DEPARTMENTS: Record<DepartmentId, Definition> = {
  hr: {name:'Human Resources', objective:'Maintain morale through policy proliferation',unlockDay:2,competence:35,routine:{morale:3},governance:{bureaucracy:2,actual:-1},incident:{morale:-5},failure:'A grievance was escalated to the grievance committee.'},
  finance:{name:'Finance',objective:'Optimise the cost of avoiding value',unlockDay:1,competence:50,routine:{cash:110},governance:{regulation:-2,cash:50},incident:{cash:-180},failure:'A spreadsheet discovered an unexplained consultancy invoice.'},
  engineering:{name:'Engineering',objective:'Prevent prototypes becoming products',unlockDay:1,competence:80,routine:{actual:4},governance:{actual:-2,meetings:1},incident:{actual:5},failure:'A prototype accidentally passed acceptance testing.'},
  marketing:{name:'Marketing',objective:'Manufacture perceived momentum',unlockDay:3,competence:45,routine:{perceived:3,buzzwords:2},governance:{confidence:2,buzzwords:3},incident:{regulation:4},failure:'An extravagant claim attracted an advertising complaint.'},
  sales:{name:'Sales',objective:'Monetise resources that were never consumed',unlockDay:4,competence:55,routine:{cash:240,confidence:1},governance:{cash:100,perceived:2},incident:{cash:-180,confidence:-2},failure:'A customer requested delivery of a hypothetical service.'},
  legal:{name:'Legal and Compliance',objective:'Maintain defensible procedural complexity',unlockDay:5,competence:65,routine:{regulation:-4},governance:{regulation:-2,bureaucracy:2},incident:{regulation:6},failure:'Two contradictory compliance policies were approved.'},
  strategy:{name:'Corporate Strategy',objective:'Develop a roadmap for the roadmap',unlockDay:6,competence:30,routine:{perceived:3,confidence:1},governance:{bureaucracy:3,buzzwords:2},incident:{confidence:-3},failure:'The strategy deck contained a deliverable.'},
  digital:{name:'Digital Transformation',objective:'Replace an existing system with a more expensive one',unlockDay:8,competence:45,routine:{perceived:4,cash:-90},governance:{bureaucracy:3,actual:-2},incident:{cash:-260,morale:-3},failure:'The migration accidentally improved system performance.'},
  ai:{name:'AI and Agentic Innovation',objective:'Demonstrate adoption without inference value',unlockDay:10,competence:55,routine:{perceived:4,actual:2,cash:-70},governance:{buzzwords:3,prestige:1,cash:-60},incident:{regulation:5,actual:3},failure:'An agent generated a surprisingly actionable recommendation.'},
  executive:{name:'Executive Non-Intervention',objective:'Protect executives from operational obligations',unlockDay:1,competence:15,routine:{prestige:1,morale:1},governance:{actual:-2,prestige:2},incident:{confidence:-3},failure:'The CEO was unexpectedly asked to attend work.'}
};
export const MIN_BUDGET=0, MAX_BUDGET=600, MAX_HEADCOUNT=10, HIRE_COST=350, ACTIVATION_COST=750, DAILY_WAGE=55, BUDGET_STEP=50;
const clamp=(n:number)=>Math.min(100,Math.max(0,n));
export function initialDepartments():DepartmentState[]{
  return DEPARTMENT_IDS.map(id=>({
    id,active:DEPARTMENTS[id].unlockDay===1,budget:100,headcount:DEPARTMENTS[id].unlockDay===1?1:0,
    morale:70,competence:DEPARTMENTS[id].competence,influence:20,progress:0,focus:id==='engineering'?'governance':'operations',
    spent:0,request:false,report:'Awaiting first operational review.'
  }));
}
export function departmentEligibility(s:GameState,id:DepartmentId,op:DepartmentCommand['operation']):string|null{
  const d=s.departments.find(x=>x.id===id);
  if(!d)return 'Unknown department';
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  if(op==='activate')return d.active?'Already active':s.day<DEPARTMENTS[id].unlockDay?'Not yet available':s.cash<ACTIVATION_COST?'Insufficient liquidity':null;
  if(!d.active)return 'Department not active';
  if(op==='increase'&&d.budget>=MAX_BUDGET)return 'Budget ceiling reached';
  if(op==='decrease'&&d.budget<=MIN_BUDGET)return 'Budget floor reached';
  if(op==='hire'&&(d.headcount>=MAX_HEADCOUNT||s.cash<HIRE_COST))return 'Staffing limit or insufficient liquidity';
  if(op==='reduce'&&d.headcount<=1)return 'Minimum staffing reached';
  return null;
}
export function changeDepartment(s:GameState,command:DepartmentCommand):{departments:DepartmentState[]; cost:number; message:string}|null{
  if(departmentEligibility(s,command.id,command.operation))return null;
  let cost=0;
  const departments=s.departments.map(d=>{
    if(d.id!==command.id)return d;
    const next={...d};
    switch(command.operation){
      case 'activate':next.active=true;next.headcount=1;cost=ACTIVATION_COST;break;
      case 'increase':next.budget+=BUDGET_STEP;next.request=false;next.morale=clamp(next.morale+6);next.influence=clamp(next.influence+5);break;
      case 'decrease':next.budget-=BUDGET_STEP;next.morale=clamp(next.morale-6);next.influence=clamp(next.influence-5);break;
      case 'hire':next.headcount++;next.request=false;next.morale=clamp(next.morale+4);cost=HIRE_COST;break;
      case 'reduce':next.headcount--;next.morale=clamp(next.morale-10);break;
      case 'focus':next.focus=d.focus==='operations'?'governance':'operations';break;
    }
    return next;
  });
  return {departments,cost,message:DEPARTMENTS[command.id].name+': '+command.operation+' authorised.'};
}
export interface DepartmentDay { departments:DepartmentState[]; delta:Delta; costs:{label:string;amount:number}[]; reports:string[] }
export function runDepartments(departments:DepartmentState[],random:()=>number):DepartmentDay{
  const delta:Delta={},costs:DepartmentDay['costs']=[],reports:string[]=[];
  const active=departments.filter(d=>d.active);
  const leader=[...active].sort((a,b)=>b.influence-a.influence)[0];
  const add=(effect:Delta,scale=1)=>{
    for(const key of Object.keys(effect) as (keyof Delta)[])delta[key]=(delta[key]??0)+Math.round((effect[key]??0)*scale);
  };
  const next=departments.map(d=>{
    if(!d.active)return d;
    const def=DEPARTMENTS[d.id],roll=random();
    const spent=d.budget+d.headcount*DAILY_WAGE;
    costs.push({label:def.name+' operating costs',amount:-spent});
    const funded=d.budget>=d.headcount*50;
    const scale=funded?Math.min(2,(.75+d.competence/200)+(d.headcount-1)*.25):.5;
    add(d.focus==='operations'?def.routine:def.governance,scale);
    const legal=active.find(x=>x.id==='legal');
    const oversight=legal&&legal.budget>=legal.headcount*50&&legal.focus==='governance'?.03:0;
    const failureRisk=Math.max(.02,.06+(funded?0:.12)+(d.morale<40?.12:0)+(d.id==='engineering'&&d.focus==='operations'?d.competence/400:0)-oversight);
    const failure=roll<failureRisk;
    if(failure){add(def.incident);reports.push(def.failure);}
    const progress=(d.progress+(funded?12:4))%100;
    const completed=progress<d.progress;
    if(completed){add({perceived:2,prestige:1});reports.push(def.name+' completed an internal objective.');}
    const influence=clamp(d.influence+(d.id===leader?.id?1:-1)+(funded?1:-2)+(completed?5:0));
    const request=!funded||(d.id!==leader?.id&&influence<15)||d.headcount===1&&roll>.85;
    if(request&&!d.request)reports.push(def.name+' requests additional resources.');
    return {...d,spent,progress,influence,request,morale:clamp(d.morale+(funded?1:-3)-(failure?3:0)),report:failure?def.failure:completed?'Objective completed; follow-up requested.':request?'Resource request awaiting executive attention.':d.focus==='governance'?'Governance obligations processed.':'Daily operations reconciled.'};
  });
  return {departments:next,delta,costs,reports};
}
export function validDepartments(value:unknown):value is DepartmentState[]{
  if(!Array.isArray(value)||value.length!==DEPARTMENT_IDS.length)return false;
  const bounded=(n:unknown,max:number,min=0)=>typeof n==='number'&&Number.isInteger(n)&&n>=min&&n<=max;
  return DEPARTMENT_IDS.every((id,i)=>{
    const d=value[i];
    return d&&typeof d==='object'&&d.id===id&&typeof d.active==='boolean'&&bounded(d.budget,MAX_BUDGET)&&d.budget%BUDGET_STEP===0&&bounded(d.headcount,MAX_HEADCOUNT,d.active?1:0)&&(d.active||d.headcount===0)&&bounded(d.morale,100)&&bounded(d.competence,100)&&bounded(d.influence,100)&&bounded(d.progress,99)&&bounded(d.spent,MAX_BUDGET+MAX_HEADCOUNT*DAILY_WAGE)&&typeof d.request==='boolean'&&typeof d.report==='string'&&['governance','operations'].includes(d.focus);
  });
}
