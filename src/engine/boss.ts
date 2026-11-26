import {BOSS_PHASES,type BossState,type BossCommand,type BossPhase,type GameState,type Delta,type MeetingCommand,type DepartmentId} from './types';
import {createEmployee,changeEmployee,employeeEligibility,syncDepartments} from './employees';
import {MAX_HEADCOUNT} from './departments';
import {changeMeeting,meetingEligibility} from './meetings';
export const TRAINING_FEE=450,TRAINING_DAYS=2,TRAINING_MINUTES=180,PROGRAMME_FEE=900,PROGRAMME_DAILY_FEE=200,PROGRAMME_DAYS=3,PROGRAMME_MINUTES=240;
export const BOSS_PROGRAMME='Enterprise Operational Non-Delivery Transformation';
export const PHASE_LABELS:Record<BossPhase,string>={dormant:'Not yet encountered',promotion:'Promote out of delivery',committee:'Governance committee',reassignment:'Strategic reassignment',training:'Mandatory leadership training',programme:'Transformation programme leadership',contained:'Strategic containment certified'};
export const initialBoss=():BossState=>({phase:'dormant',employeeId:null,startDay:null,containedDay:null,committeeId:null,trainingEnrolled:false,trainingDays:0,programmeAppointed:false,programmeDays:0,programmeSpend:0,interventions:0,usefulTasks:0,history:[]});
const history=(b:BossState,day:number,message:string)=>[...b.history,'Day '+day+': '+message];
export function spawnBoss(s:GameState):GameState{
 if(s.campaign.mode!=='campaign'||s.campaign.stage!==7||s.boss.phase!=='dormant'||s.ending)return s;
 const department=s.departments.find(d=>d.id==='engineering')!;
 const existing=s.employees.filter(e=>e.status==='active'&&e.department==='engineering').sort((a,b)=>b.skill-a.skill||a.id-b.id);
 const hire=department.headcount<MAX_HEADCOUNT||existing.length===0;
 const source=hire?createEmployee(s.seed,s.nextEmployeeId,'engineering',s.day,true):existing[0];
 const employee={...source,archetype:'engineer' as const,skill:100,ambition:90,politics:35,morale:85,level:1,salary:Math.max(source.salary,125),report:'Identified several operational problems and proposed immediate fixes.'};
 const employees=hire?[...s.employees,employee]:s.employees.map(e=>e.id===employee.id?employee:e);
 const boss:BossState={...initialBoss(),phase:'promotion',employeeId:employee.id,startDay:s.day,history:['Day '+s.day+': '+employee.name+' identified a measurable opportunity. Board-mandated retention protection activated.']};
 return {...s,boss,employees,nextEmployeeId:s.nextEmployeeId+(hire?1:0),departments:syncDepartments(s.departments,employees),log:['Day '+s.day+': CRITICAL: exceptionally competent employee detected.',...s.log].slice(0,100)};
}
export const protectedBoss=(s:GameState,id:number)=>s.boss.employeeId===id&&s.boss.phase!=='contained'&&s.boss.phase!=='dormant';
function committee(s:GameState):MeetingCommand{
 const executive=s.employees.find(e=>e.status==='active'&&e.department==='executive');
 return {type:'meeting',operation:'schedule',meetingType:'steering',day:s.day,attendees:[...new Set([s.boss.employeeId!,...(executive?[executive.id]:[])])]};
}
const GOVERNANCE_DEPTS:DepartmentId[]=['strategy','digital','executive','hr','legal'];
function targetDepartment(s:GameState):DepartmentId|undefined{
 const e=s.employees.find(e=>e.id===s.boss.employeeId);
 return GOVERNANCE_DEPTS.find(id=>s.departments.some(d=>d.id===id&&d.active&&d.headcount<MAX_HEADCOUNT)&&id!==e?.department);
}
export function bossEligibility(s:GameState,c:BossCommand):string|null{
 const b=s.boss,e=s.employees.find(e=>e.id===b.employeeId);
 if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
 if(!e||e.status!=='active'||b.phase==='contained'||b.phase==='dormant')return 'No active confrontation';
 if(c.operation==='promote')return b.phase!=='promotion'?'Promotion phase not active':e.level>=2?null:employeeEligibility(s,e.id,'promote');
 if(c.operation==='committee'){
  if(b.phase!=='committee')return 'Committee phase not active';
  const m=s.meetings.find(m=>m.id===b.committeeId);
  if(m?.status==='scheduled')return 'Committee already scheduled';
  return meetingEligibility(s,committee(s));
 }
 if(c.operation==='reassign'){
  if(b.phase!=='reassignment')return 'Reassignment phase not active';
  if(GOVERNANCE_DEPTS.includes(e.department))return null;
  const target=targetDepartment(s);
  return target?employeeEligibility(s,e.id,'reassign',target):'No governance department with spare capacity';
 }
 if(c.operation==='train')return b.phase!=='training'?'Training phase not active':b.trainingEnrolled?'Training already enrolled':s.cash<TRAINING_FEE?'Insufficient liquidity':null;
 if(c.operation==='appoint')return b.phase!=='programme'?'Programme phase not active':b.programmeAppointed?'Programme already appointed':s.cash<PROGRAMME_FEE?'Insufficient liquidity':null;
 return 'Unknown intervention';
}
export function changeBoss(s:GameState,c:BossCommand):{boss:BossState;employees:GameState['employees'];meetings:GameState['meetings'];nextMeetingId:number;cost:number;delta:Delta;message:string}|null{
 if(bossEligibility(s,c))return null;
 const b={...s.boss},e=s.employees.find(e=>e.id===b.employeeId)!;
 let employees=s.employees,meetings=s.meetings,nextMeetingId=s.nextMeetingId,cost=0,delta:Delta={},message='';
 switch(c.operation){
  case 'promote':{
   if(e.level<2){const r=changeEmployee(s,{type:'employee',id:e.id,operation:'promote'});if(!r)return null;employees=r.employees;cost=r.cost;delta=r.delta;}
   b.phase='committee';message='Management promotion certified. Direct delivery responsibilities reduced.';break;
  }
  case 'committee':{
   const r=changeMeeting(s,committee(s));if(!r)return null;meetings=r.meetings;nextMeetingId=r.nextMeetingId;b.committeeId=s.nextMeetingId;message='Steering committee membership arranged. Attendance required.';break;
  }
  case 'reassign':{
   if(!GOVERNANCE_DEPTS.includes(e.department)){const r=changeEmployee(s,{type:'employee',id:e.id,operation:'reassign',target:targetDepartment(s)});if(!r)return null;employees=r.employees;cost=r.cost;delta=r.delta;}
   b.phase='training';message='Strategic reassignment certified. Governance responsibilities take priority.';break;
  }
  case 'train':cost=TRAINING_FEE;b.trainingEnrolled=true;delta={bureaucracy:3,perceived:2};message='Enrolled in mandatory leadership alignment training.';break;
  case 'appoint':cost=PROGRAMME_FEE;b.programmeAppointed=true;b.programmeSpend=cost;delta={prestige:2,bureaucracy:3,perceived:3};message='Appointed lead of '+BOSS_PROGRAMME+'.';break;
 }
 b.interventions++;b.history=history(b,s.day,message);
 return {boss:b,employees,meetings,nextMeetingId,cost,delta,message};
}
export function runBoss(s:GameState,meetingMinutes:Record<number,number>){
 const b={...s.boss},minutes={...meetingMinutes},delta:Delta={},reports:string[]=[];
 let employees=s.employees,cost=0;
 const e=s.employees.find(e=>e.id===b.employeeId&&e.status==='active');
 if(!e||b.phase==='contained'||b.phase==='dormant')return {boss:b,minutes,employees,cost,delta,reports};
 const note=(message:string)=>{b.history=history(b,s.day,message);reports.push(message);};
 let available=Math.max(0,480-(minutes[e.id]??0));
 if(b.phase==='committee'&&s.meetings.some(m=>m.id===b.committeeId&&m.status==='held'&&m.actualAttendees.includes(e.id))){
  b.phase='reassignment';note('Governance committee attended. Reassignment authorised.');
 }
 if(b.phase==='training'&&b.trainingEnrolled&&available>=TRAINING_MINUTES){
  minutes[e.id]=(minutes[e.id]??0)+TRAINING_MINUTES;available-=TRAINING_MINUTES;b.trainingDays++;
  note('Mandatory training attendance '+b.trainingDays+'/'+TRAINING_DAYS+' certified.');
  if(b.trainingDays===TRAINING_DAYS){b.phase='programme';note('Training complete. Transformation leadership appointment required.');}
 }
 if(b.phase==='programme'&&b.programmeAppointed&&available>=PROGRAMME_MINUTES){
  minutes[e.id]=(minutes[e.id]??0)+PROGRAMME_MINUTES;available-=PROGRAMME_MINUTES;b.programmeDays++;
  cost=PROGRAMME_DAILY_FEE;b.programmeSpend+=cost;
  note('Non-delivery transformation governance milestone '+b.programmeDays+'/'+PROGRAMME_DAYS+' recorded.');
  if(b.programmeDays===PROGRAMME_DAYS){b.phase='contained';b.containedDay=s.day;delta.prestige=8;delta.confidence=5;delta.perceived=6;delta.actual=-5;note('Containment certified: a 100-skill employee now leads a programme with no delivery mandate.');}
 }
 if(b.phase!=='contained'){
  const pressure:Partial<Record<BossPhase,number>>={promotion:8,committee:6,reassignment:5,training:4,programme:3};
  const useful=Math.ceil((pressure[b.phase]??0)*available/480);
  if(useful>0){b.usefulTasks++;delta.actual=useful;employees=s.employees.map(x=>x.id===e.id?{...x,usefulWork:x.usefulWork+1}:x);note(e.name+' completed unauthorised useful work (+'+useful+' actual productivity).');}
 }
 return {boss:b,minutes,employees,cost,delta,reports};
}
export function validBoss(value:unknown,s:GameState):value is BossState{
 if(!value||typeof value!=='object')return false;
 const b=value as BossState;
 const int=(n:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
 if(!BOSS_PHASES.includes(b.phase)||!int(b.trainingDays,0,TRAINING_DAYS)||!int(b.programmeDays,0,PROGRAMME_DAYS)||!int(b.programmeSpend)||!int(b.interventions)||!int(b.usefulTasks)||typeof b.trainingEnrolled!=='boolean'||typeof b.programmeAppointed!=='boolean'||!Array.isArray(b.history)||!b.history.every(x=>typeof x==='string'))return false;
 if(b.phase==='dormant')return b.employeeId===null&&b.startDay===null&&b.containedDay===null&&b.committeeId===null&&!b.trainingEnrolled&&!b.programmeAppointed&&b.trainingDays===0&&b.programmeDays===0&&b.programmeSpend===0&&b.interventions===0&&b.usefulTasks===0&&b.history.length===0;
 if(s.campaign.mode!=='campaign'||s.campaign.stage!==7||!int(b.startDay,1,s.day)||!s.employees.some(e=>e.id===b.employeeId&&(b.phase==='contained'||e.status==='active')))return false;
 if(b.committeeId!==null&&!s.meetings.some(m=>m.id===b.committeeId&&m.type==='steering'&&m.attendees.includes(b.employeeId!)))return false;
 if(b.trainingDays>0&&!b.trainingEnrolled||b.programmeDays>0&&!b.programmeAppointed||b.programmeAppointed&&b.trainingDays!==TRAINING_DAYS||b.programmeSpend!==(b.programmeAppointed?PROGRAMME_FEE+b.programmeDays*PROGRAMME_DAILY_FEE:0))return false;
 if(['reassignment','training','programme','contained'].includes(b.phase)&&!s.meetings.some(m=>m.id===b.committeeId&&m.status==='held'&&m.actualAttendees.includes(b.employeeId!)))return false;
 if(['programme','contained'].includes(b.phase)&&b.trainingDays!==TRAINING_DAYS)return false;
 return b.phase==='contained'?int(b.containedDay,Number(b.startDay),s.day)&&b.programmeDays===PROGRAMME_DAYS:b.containedDay===null&&b.programmeDays<PROGRAMME_DAYS;
}
