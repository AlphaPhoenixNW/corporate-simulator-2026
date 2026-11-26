import { PROGRAMME_TYPES, type ProgrammeType, type Programme, type ProgrammeCommand, type GameState, type DepartmentId, type Delta, type MeetingCommand } from './types';
import { changeMeeting, meetingEligibility } from './meetings';
export interface ProgrammeDefinition {
  name:string; description:string; sponsor:DepartmentId; dependencies:ProgrammeType[];
  budget:number; launchFee:number; dailyFee:number; work:number; milestones:[string,string,string];
  effect:Delta; incident:Delta; risk:number;
}
export const PROGRAMME_DEFINITIONS:Record<ProgrammeType,ProgrammeDefinition>={
  salesforce:{name:'Salesforce Non-Integration',description:'Ensure no two systems agree on the customer.',sponsor:'sales',dependencies:[],budget:2800,launchFee:400,dailyFee:120,work:36,milestones:['Requirements disagreement','Interface non-design','Integration avoidance certification'],effect:{perceived:5,bureaucracy:3,confidence:2},incident:{actual:10,regulation:3},risk:.10},
  cloud:{name:'Cloud-Native Distributed Nothingness',description:'Distribute an empty workload across an enterprise architecture.',sponsor:'engineering',dependencies:[],budget:3600,launchFee:600,dailyFee:150,work:36,milestones:['Cloud readiness assessment','Empty service orchestration','Zero-workload acceptance'],effect:{perceived:6,buzzwords:4,prestige:2},incident:{actual:12},risk:.12},
  quantum:{name:'Quantum-Ready Zero-Outcome Infrastructure',description:'Future-proof the absence of an outcome.',sponsor:'engineering',dependencies:['cloud'],budget:4800,launchFee:800,dailyFee:210,work:44,milestones:['Quantum readiness framework','Unobservable architecture review','Outcome uncertainty certification'],effect:{prestige:5,buzzwords:6,perceived:4},incident:{actual:15,regulation:4},risk:.12},
  agile:{name:'Enterprise Agile Transformation',description:'Replace work with the ceremonies that describe work.',sponsor:'hr',dependencies:[],budget:2500,launchFee:350,dailyFee:95,work:32,milestones:['Ceremony inventory','Scrum-of-scrums rollout','Agility governance certification'],effect:{meetings:6,bureaucracy:4,perceived:4},incident:{actual:8,morale:2},risk:.08},
  agentic:{name:'Agentic AI Enablement',description:'Orchestrate agents to request further orchestration.',sponsor:'ai',dependencies:['cloud'],budget:4200,launchFee:650,dailyFee:180,work:40,milestones:['Agent governance discovery','Recursive workflow alignment','Inference avoidance sign-off'],effect:{buzzwords:6,perceived:6,prestige:3},incident:{actual:16,regulation:5},risk:.15},
  transformation:{name:'Digital Transformation Transformation',description:'Transform the transformation before it transforms anything.',sponsor:'digital',dependencies:['agile'],budget:3800,launchFee:550,dailyFee:160,work:40,milestones:['Transformation maturity survey','Transformation of roadmap','Post-transformation transformation review'],effect:{bureaucracy:6,perceived:5,confidence:3},incident:{actual:11,regulation:3},risk:.10},
  'non-intervention':{name:'Strategic Executive Non-Intervention',description:'Protect leadership from the consequences of leadership.',sponsor:'executive',dependencies:[],budget:1800,launchFee:250,dailyFee:70,work:28,milestones:['Delegation framework','Executive absence pilot','Non-intervention certification'],effect:{prestige:5,actual:-3,bureaucracy:2},incident:{actual:7,morale:3},risk:.06},
  'bed-led':{name:'Bed-Led Leadership',description:'Deploy a horizontal executive operating model.',sponsor:'executive',dependencies:['non-intervention'],budget:2200,launchFee:300,dailyFee:85,work:30,milestones:['Horizontal readiness assessment','Duvet governance pilot','Enterprise bed-led accreditation'],effect:{prestige:6,morale:3,actual:-4},incident:{actual:8,confidence:-2},risk:.07},
  'os-migration':{name:'NOTHING™ OS Enterprise Migration',description:'Migrate an empty workload to an expensive empty desktop.',sponsor:'digital',dependencies:['cloud','transformation'],budget:5200,launchFee:850,dailyFee:220,work:44,milestones:['Estate non-discovery','Zero-workload migration','Shutdown readiness certification'],effect:{perceived:6,buzzwords:5,regulation:-3},incident:{actual:18,regulation:4},risk:.14}
};
export const TOPUP=1000,MAX_SCOPE_CREEP=3,MAX_PROGRAMME_BUDGET=100000;
const recordHistory=(p:Programme,day:number,message:string)=>[...p.history,'Day '+day+': '+message].slice(-100);
export function committeeCommand(s:GameState,p:Programme):MeetingCommand{
  const lead=s.employees.find(e=>e.id===p.leadId&&e.status==='active');
  const team=s.employees.filter(e=>e.status==='active'&&e.department===PROGRAMME_DEFINITIONS[p.type].sponsor);
  const governance=s.employees.find(e=>e.status==='active'&&e.department==='executive');
  const attendees=[...new Set([...(lead?[lead.id]:[]),...team.slice(0,3).map(e=>e.id),...(governance?[governance.id]:[])])];
  return {type:'meeting',operation:'schedule',meetingType:'steering',day:s.day,attendees};
}
export function programmeEligibility(s:GameState,c:ProgrammeCommand):string|null{
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  const d=PROGRAMME_DEFINITIONS[c.programme],p=s.programmes.find(p=>p.type===c.programme);
  if(!d)return 'Unknown programme';
  if(c.operation==='commission'){
    if(p)return 'Programme already commissioned';
    if(!s.departments.some(x=>x.id===d.sponsor&&x.active))return 'Sponsor department not active';
    if(!d.dependencies.every(t=>s.programmes.some(x=>x.type===t&&x.status==='complete')))return 'Dependencies not completed';
    if(!s.employees.some(e=>e.id===c.leadId&&e.status==='active'&&e.department===d.sponsor))return 'Select an active sponsor employee';
    return s.cash<d.launchFee?'Insufficient liquidity':null;
  }
  if(!p||p.status==='complete'||p.status==='cancelled')return 'Programme not available';
  if(c.operation==='replace-lead')return s.employees.some(e=>e.id===c.leadId&&e.status==='active'&&e.department===d.sponsor&&e.id!==p.leadId)?null:'Select a different active sponsor employee';
  if(c.operation==='topup')return p.budget+TOPUP>MAX_PROGRAMME_BUDGET?'Budget ceiling reached':s.cash<TOPUP?'Insufficient liquidity to authorise allocation':null;
  if(c.operation==='pause')return p.status==='active'?null:'Programme not active';
  if(c.operation==='resume')return p.status==='paused'?null:'Programme not paused';
  if(c.operation==='cancel')return null;
  if(p.status!=='review')return 'Milestone not ready for review';
  const committee=s.meetings.find(m=>m.id===p.committeeId);
  if(c.operation==='committee'){
    if(committee&&(committee.status==='scheduled'||committee.status==='held'))return 'Committee already arranged';
    return meetingEligibility(s,committeeCommand(s,p));
  }
  if(c.operation==='approve')return committee?.status==='held'?null:'Hold the milestone governance committee first';
  return 'Unknown operation';
}
export function changeProgramme(s:GameState,c:ProgrammeCommand):{programmes:Programme[];meetings:GameState['meetings'];nextMeetingId:number;cost:number;delta:Delta;message:string}|null{
  if(programmeEligibility(s,c))return null;
  const d=PROGRAMME_DEFINITIONS[c.programme];
  let programmes=s.programmes,meetings=s.meetings,nextMeetingId=s.nextMeetingId,cost=0,delta:Delta={},message='';
  if(c.operation==='commission'){
    cost=d.launchFee;message=d.name+' commissioned.';
    programmes=[...programmes,{type:c.programme,startDay:s.day,status:'active',budget:d.budget,spent:cost,consultancy:cost,milestone:0,progress:0,target:d.work,scopeCreep:0,incidents:0,committeeId:null,leadId:c.leadId,history:['Day '+s.day+': '+message]}];
    delta={perceived:3,prestige:1,buzzwords:2};
  }else{
    const p=s.programmes.find(p=>p.type===c.programme)!,n={...p};
    switch(c.operation){
      case 'replace-lead':n.leadId=c.leadId;message='Programme leadership reassigned.';break;
      case 'topup':n.budget+=TOPUP;message='Additional budget authorised (not prepaid).';break;
      case 'pause':n.status='paused';message='Programme paused pending strategic review.';break;
      case 'resume':n.status='active';message='Programme resumed.';break;
      case 'cancel':n.status='cancelled';message='Programme cancelled; sunk costs retained.';delta={confidence:-3,prestige:-2};break;
      case 'committee':{
        const result=changeMeeting(s,committeeCommand(s,p));if(!result)return null;
        meetings=result.meetings;nextMeetingId=result.nextMeetingId;n.committeeId=s.nextMeetingId;message='Milestone steering committee scheduled.';break;
      }
      case 'approve':
        n.milestone++;n.progress=0;n.target=d.work;n.committeeId=null;
        n.status=n.milestone===3?'complete':'active';
        message=n.status==='complete'?'Programme certified complete without a committed deliverable.':'Milestone approved; next phase authorised.';
        delta=n.status==='complete'?d.effect:{perceived:3,bureaucracy:2};break;
    }
    n.history=recordHistory(p,s.day,message);
    programmes=programmes.map(x=>x.type===p.type?n:x);
    message=d.name+': '+message;
  }
  return {programmes,meetings,nextMeetingId,cost,delta,message};
}
export function runProgrammes(s:GameState,minutes:Record<number,number>,random:()=>number){
  const delta:Delta={},reports:string[]=[],costs:{label:string;amount:number}[]=[];
  const add=(d:Delta)=>{for(const k of Object.keys(d) as (keyof Delta)[])delta[k]=(delta[k]??0)+(d[k]??0);};
  const programmes=s.programmes.map(p=>{
    if(p.status!=='active')return p;
    const d=PROGRAMME_DEFINITIONS[p.type];
    if(p.spent+d.dailyFee>p.budget)return p;
    const lead=s.employees.find(e=>e.id===p.leadId&&e.status==='active'&&e.department===d.sponsor);
    if(!lead)return p;
    const dept=s.departments.find(x=>x.id===d.sponsor)!;
    const n={...p,spent:p.spent+d.dailyFee,consultancy:p.consultancy+d.dailyFee};
    costs.push({label:d.name+' consultancy',amount:-d.dailyFee});
    const available=Math.max(0,1-(minutes[lead.id]??0)/480);
    const work=Math.round((lead.level>1?8:12)*available);
    const roll=random();
    if(n.scopeCreep<MAX_SCOPE_CREEP&&roll<.12){
      n.scopeCreep++;n.target+=8;n.history=recordHistory(n,s.day,'Scope expanded by another eight work units.');reports.push(d.name+': scope expanded.');add({bureaucracy:2,perceived:1});
    }
    const risk=d.risk*(lead.skill/60)*(lead.level>1?.45:1)*(dept.focus==='governance'?.4:1)*available;
    if(random()<risk){
      n.incidents++;n.history=recordHistory(n,s.day,'Accidental usefulness incident recorded.');reports.push(d.name+': unexpected measurable benefit discovered.');add(d.incident);
    }
    n.progress=Math.min(n.target,n.progress+work);
    add({perceived:1});
    if(n.progress>=n.target){
      n.status='review';n.history=recordHistory(n,s.day,d.milestones[n.milestone]+' awaits committee approval.');
      reports.push(d.name+': milestone ready for review.');
    }
    return n;
  });
  return {programmes,delta,reports,costs};
}
export function validProgrammes(value:unknown,employees:GameState['employees'],meetings:GameState['meetings']):boolean{
  const int=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
  if(!Array.isArray(value)||value.length>PROGRAMME_TYPES.length)return false;
  const types=new Set<ProgrammeType>();
  for(const p of value){
    if(!p||!PROGRAMME_TYPES.includes(p.type)||types.has(p.type)||!int(p.startDay,1)||!['active','review','paused','complete','cancelled'].includes(p.status)||!int(p.budget,1,MAX_PROGRAMME_BUDGET)||!int(p.spent,0,p.budget)||!int(p.consultancy,0,p.spent)||!int(p.milestone,0,3)||((p.status==='complete')!==(p.milestone===3))||!int(p.target,1)||!int(p.progress,0,p.target)||!int(p.scopeCreep,0,MAX_SCOPE_CREEP)||!int(p.incidents)||!employees.some(e=>e.id===p.leadId)||!(p.committeeId===null||meetings.some(m=>m.id===p.committeeId&&m.type==='steering'))||!Array.isArray(p.history)||!p.history.every((h:unknown)=>typeof h==='string'))return false;
    types.add(p.type);
  }
  return true;
}
