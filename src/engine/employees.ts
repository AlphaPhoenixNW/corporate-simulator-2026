import { ARCHETYPES, DEPARTMENT_IDS, type Archetype, type DepartmentId, type DepartmentState, type Employee, type EmployeeCommand, type GameState, type Relationship, type Delta } from './types';
import { MAX_HEADCOUNT } from './departments';

interface ArchetypeDefinition { name:string; description:string; skill:number; ambition:number; politics:number; salary:number; effect:Delta }
export const EMPLOYEE_ARCHETYPES:Record<Archetype,ArchetypeDefinition>={
  engineer:{name:'The Competent Engineer',description:'Solves problems before stakeholders have agreed they exist.',skill:88,ambition:55,politics:20,salary:82,effect:{actual:2}},
  'thought-leader':{name:'The LinkedIn Thought Leader',description:'Converts oxygen into thought leadership.',skill:30,ambition:85,politics:80,salary:65,effect:{perceived:2,buzzwords:2}},
  consultant:{name:'The Management Consultant',description:'Can turn a question into a twelve-week engagement.',skill:40,ambition:80,politics:75,salary:95,effect:{bureaucracy:2,cash:-35}},
  'meeting-enthusiast':{name:'The Meeting Enthusiast',description:'Considers an empty calendar a medical emergency.',skill:35,ambition:50,politics:60,salary:50,effect:{meetings:2,actual:-1}},
  'agile-evangelist':{name:'The Agile Evangelist',description:'Measures agility by the number of mandatory ceremonies.',skill:45,ambition:65,politics:70,salary:65,effect:{meetings:1,perceived:2}},
  survivor:{name:'The Corporate Survivor',description:'Has outlasted six transformation programmes.',skill:55,ambition:35,politics:88,salary:58,effect:{incompetence:1,regulation:-1}},
  veteran:{name:'The Disillusioned Veteran',description:'Remembers when the organisation had an objective.',skill:74,ambition:20,politics:35,salary:74,effect:{morale:-1,actual:1}},
  innovator:{name:'The Accidental Innovator',description:'Frequently improves things without authorisation.',skill:92,ambition:45,politics:15,salary:80,effect:{actual:3}},
  nepotism:{name:'The Executive Nepotism Hire',description:'Has a proven track record of being related to leadership.',skill:18,ambition:90,politics:90,salary:78,effect:{incompetence:2,prestige:1}},
  'ai-specialist':{name:'The AI Transformation Specialist',description:'Automates the production of transformation proposals.',skill:62,ambition:75,politics:65,salary:88,effect:{perceived:2,cash:-25}}
};
const FIRST=['Alex','Morgan','Sam','Riley','Taylor','Jamie','Jordan','Casey','Avery','Robin','Ellis','Cameron','Drew','Harper','Blair','Quinn'];
const LAST=['Bennett','Patel','Evans','Shah','Morgan','Chen','Reed','Williams','Clarke','Singh','Foster','Hughes','Okafor','Parker','Davies','Nguyen'];
const preferred:Record<DepartmentId,Archetype>={hr:'meeting-enthusiast',finance:'survivor',engineering:'engineer',marketing:'thought-leader',sales:'consultant',legal:'veteran',strategy:'agile-evangelist',digital:'innovator',ai:'ai-specialist',executive:'nepotism'};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const hash=(n:number)=>{n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0;};
export function createEmployee(seed:number,id:number,department:DepartmentId,day:number,first=false):Employee{
  const h=hash(seed^Math.imul(id,2654435761));
  const archetype=first||h%3!==0?preferred[department]:ARCHETYPES[h%ARCHETYPES.length];
  const def=EMPLOYEE_ARCHETYPES[archetype],variation=(shift:number)=>((h>>>shift)%13)-6;
  return {id,name:FIRST[h%FIRST.length]+' '+LAST[(h>>>8)%LAST.length],department,archetype,skill:clamp(def.skill+variation(4)),
    ambition:clamp(def.ambition+variation(10)),politics:clamp(def.politics+variation(15)),morale:clamp(70+variation(20)),
    salary:def.salary+variation(24),level:1,joined:day,status:'active',departed:null,promotionRequested:false,complaints:0,warnings:0,reviews:0,usefulWork:0,lastReview:'Not yet reviewed.',report:'Awaiting onboarding alignment.'};
}
export function seedEmployees(seed:number,departments:DepartmentState[],day:number){
  const employees:Employee[]=[];
  for(const d of departments)for(let i=0;i<d.headcount;i++)employees.push(createEmployee(seed,employees.length+1,d.id,day,i===0));
  return {employees,nextEmployeeId:employees.length+1,relationships:[] as Relationship[]};
}
export function syncDepartments(departments:DepartmentState[],employees:Employee[]):DepartmentState[]{
  return departments.map(d=>{
    const team=employees.filter(e=>e.status==='active'&&e.department===d.id);
    return {...d,headcount:team.length,competence:team.length?Math.round(team.reduce((n,e)=>n+Math.round(e.skill/(e.level===1?1:1.5)),0)/team.length):d.competence};
  });
}
export function payrollByDepartment(employees:Employee[]):Partial<Record<DepartmentId,number>>{
  const payroll:Partial<Record<DepartmentId,number>>={};
  for(const e of employees)if(e.status==='active')payroll[e.department]=(payroll[e.department]??0)+e.salary;
  return payroll;
}
export const PROMOTION_COST=250,REVIEW_COST=50,DISCIPLINE_COST=100,REASSIGN_COST=150;
export function redundancyCost(e:Employee){return e.salary*5;}
export function employeeEligibility(s:GameState,id:number,operation:EmployeeCommand['operation'],target?:DepartmentId):string|null{
  const e=s.employees.find(x=>x.id===id);
  if(!e||e.status!=='active')return 'Employee not active';
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  if(operation==='promote'&&e.level>=4)return 'Maximum management grade';
  if(operation==='redundancy'||operation==='reassign'){
    if(s.departments.find(d=>d.id===e.department)!.headcount<=1)return 'Minimum staffing reached';
  }
  if(operation==='reassign'&&(!target||target===e.department||!s.departments.some(d=>d.id===target&&d.active&&d.headcount<MAX_HEADCOUNT)))return 'Select an active department with capacity';
  const cost=operation==='review'?REVIEW_COST:operation==='promote'?PROMOTION_COST:operation==='discipline'?DISCIPLINE_COST:operation==='reassign'?REASSIGN_COST:redundancyCost(e);
  return s.cash<cost?'Insufficient liquidity':null;
}
export function changeEmployee(s:GameState,c:EmployeeCommand):{employees:Employee[];cost:number;delta:Delta;message:string}|null{
  if(employeeEligibility(s,c.id,c.operation,c.target))return null;
  const e=s.employees.find(x=>x.id===c.id)!;
  let next={...e},cost=0,delta:Delta={};
  switch(c.operation){
    case 'review':cost=REVIEW_COST;next.reviews++;next.lastReview=e.usefulWork>0?'Demonstrates concerning levels of initiative; recommend governance exposure.':'Exceeds expectations in strategic non-delivery.';next.morale=clamp(e.morale+(e.usefulWork>0?-3:5));delta={perceived:2,bureaucracy:1};break;
    case 'promote':cost=PROMOTION_COST;next.level++;next.salary+=Math.ceil(e.salary*.2);next.promotionRequested=false;next.morale=clamp(e.morale+12);delta={actual:-2,bureaucracy:3,prestige:1};break;
    case 'discipline':cost=DISCIPLINE_COST;next.warnings++;next.morale=clamp(e.morale-10);next.complaints++;delta={actual:-2,regulation:2,morale:-2};break;
    case 'redundancy':cost=redundancyCost(e);next.status='redundant';next.departed=s.day;next.promotionRequested=false;delta={morale:-4,regulation:2,actual:e.skill>70?-4:0};break;
    case 'reassign':cost=REASSIGN_COST;next.department=c.target!;next.morale=clamp(e.morale-4);delta={bureaucracy:2,actual:-1};break;
  }
  next.report=c.operation==='review'?next.lastReview:'Executive '+c.operation+' authorised.';
  return {employees:s.employees.map(x=>x.id===e.id?next:x),cost,delta,message:e.name+': '+next.report};
}
export function reconcileStaffing(s:GameState,departments:DepartmentState[],id:DepartmentId){
  let employees=[...s.employees],nextEmployeeId=s.nextEmployeeId;
  const desired=departments.find(d=>d.id===id)!.headcount;
  const team=employees.filter(e=>e.status==='active'&&e.department===id);
  let cost=0;
  if(desired>team.length){employees.push(createEmployee(s.seed,nextEmployeeId++,id,s.day,team.length===0));}
  if(desired<team.length){
    const last=team[team.length-1];cost=redundancyCost(last);
    if(s.cash<cost)return null;
    employees=employees.map(e=>e.id===last.id?{...e,status:'redundant',departed:s.day,promotionRequested:false,report:'Position removed in departmental restructuring.'}:e);
  }
  return {employees,nextEmployeeId,cost};
}
export function runEmployees(employees:Employee[],relationships:Relationship[],departments:DepartmentState[],day:number,random:()=>number){
  const delta:Delta={},reports:string[]=[];
  const add=(effect:Delta)=>{for(const key of Object.keys(effect) as (keyof Delta)[])delta[key]=(delta[key]??0)+(effect[key]??0);};
  const counts=new Map<DepartmentId,number>();
  for(const e of employees)if(e.status==='active')counts.set(e.department,(counts.get(e.department)??0)+1);
  const next=employees.map(e=>{
    if(e.status!=='active')return e;
    const d=departments.find(d=>d.id===e.department)!;
    const roll=random(),funded=d.budget>=d.headcount*50;
    const n={...e,morale:clamp(e.morale+(funded?1:-3)+(d.morale<40?-2:0)-(e.promotionRequested?1:0)),report:'Routine alignment completed.'};
    if(e.skill>=70&&e.level===1&&roll<(d.focus==='operations'?.22:.04)){
      n.usefulWork++;add({actual:2});n.report='Completed a useful task without authorisation.';reports.push(e.name+': '+n.report);
    }else if(roll>.75){
      const effect={...EMPLOYEE_ARCHETYPES[e.archetype].effect};
      if(e.level>1||d.focus==='governance')delete effect.actual;
      add(effect);n.report='Archetype-specific operational activity recorded.';
    }
    if(!e.promotionRequested&&e.level<4&&day-e.joined>=3&&roll<e.ambition/500){
      n.promotionRequested=true;n.report='Requested promotion to a less operational role.';reports.push(e.name+': '+n.report);
    }
    if(n.morale<35&&roll<.25){n.complaints++;add({regulation:1});n.report='Submitted an internal complaint.';reports.push(e.name+': '+n.report);}
    if(n.morale<20&&roll<.12&&(counts.get(e.department)??0)>1){
      n.status='resigned';n.departed=day;n.promotionRequested=false;counts.set(e.department,counts.get(e.department)!-1);
      n.report='Resigned following a strategic engagement review.';reports.push(e.name+': '+n.report);add({morale:-2});
    }
    return n;
  });
  const active=next.filter(e=>e.status==='active'),ids=new Set(active.map(e=>e.id));
  let rel=relationships.filter(r=>ids.has(r.a)&&ids.has(r.b));
  // One interaction per day, preventing quadratic relationship growth.
  if(active.length>1){
    const a=active[Math.floor(random()*active.length)];
    const others=active.filter(e=>e.id!==a.id);
    const b=others[Math.floor(random()*others.length)];
    const low=Math.min(a.id,b.id),high=Math.max(a.id,b.id);
    const old=rel.find(r=>r.a===low&&r.b===high);
    const aligned=Math.abs(a.politics-b.politics)<30;
    const affinity=Math.max(-100,Math.min(100,(old?.affinity??0)+(aligned?25:-25)));
    rel=[...rel.filter(r=>r.a!==low||r.b!==high),{a:low,b:high,affinity}];
    if(Math.abs(affinity)>=50&&Math.abs(old?.affinity??0)<50){
      reports.push(a.name+' and '+b.name+(affinity>0?' formed an alliance.':' developed a rivalry.'));
      add(affinity>0?{bureaucracy:1,perceived:1}:{morale:-2,meetings:1});
    }
  }
  return {employees:next,relationships:rel,delta,reports};
}
export function validEmployees(value:unknown,relations:unknown,nextId:unknown,departments:DepartmentState[]):boolean{
  const integer=(n:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
  if(!Array.isArray(value)||!Array.isArray(relations)||!integer(nextId,1))return false;
  const ids=new Set<number>();
  for(const e of value){
    if(!e||typeof e!=='object'||!integer(e.id,1)||ids.has(e.id)||e.id>=Number(nextId)||typeof e.name!=='string'||!DEPARTMENT_IDS.includes(e.department)||!ARCHETYPES.includes(e.archetype)||!['skill','ambition','morale','politics'].every(k=>integer(e[k],0,100))||!integer(e.salary,1)||!integer(e.level,1,4)||!integer(e.joined,1)||!['active','resigned','redundant'].includes(e.status)||!(e.status==='active'?e.departed===null:integer(e.departed,e.joined))||typeof e.promotionRequested!=='boolean'||!['complaints','warnings','reviews','usefulWork'].every(k=>integer(e[k]))||typeof e.lastReview!=='string'||typeof e.report!=='string')return false;
    ids.add(e.id);
  }
  if(!departments.every(d=>value.filter(e=>e.status==='active'&&e.department===d.id).length===d.headcount))return false;
  const pairs=new Set<string>();
  for(const r of relations){
    if(!r||!integer(r.a,1)||!integer(r.b,1)||r.a>=r.b||!ids.has(r.a)||!ids.has(r.b)||!integer(r.affinity,-100,100)||pairs.has(r.a+':'+r.b))return false;
    pairs.add(r.a+':'+r.b);
  }
  return true;
}
