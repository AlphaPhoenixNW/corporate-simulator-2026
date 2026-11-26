import { MEETING_TYPES, type MeetingType, type Meeting, type GameState, type MeetingCommand, type Delta, type Employee } from './types';
interface MeetingDefinition {name:string; duration:number; fee:number; description:string; effect:Delta; document:string; followup:MeetingType; probability:number}
export const MEETING_DEFINITIONS:Record<MeetingType,MeetingDefinition>={
  standup:{name:'Daily stand-up',duration:15,fee:15,description:'Synchronise blockers before creating new ones.',effect:{perceived:1,meetings:1},document:'Daily blocker register',followup:'alignment',probability:.20},
  steering:{name:'Executive steering committee',duration:90,fee:160,description:'Escalate decisions to a higher decision-making body.',effect:{prestige:3,bureaucracy:3,confidence:1,perceived:3},document:'Executive decision deferral memorandum',followup:'steering',probability:.55},
  alignment:{name:'Strategic alignment workshop',duration:120,fee:180,description:'Align stakeholders without committing to a direction.',effect:{perceived:5,buzzwords:3,bureaucracy:2},document:'Cross-functional alignment matrix',followup:'retro',probability:.55},
  prealignment:{name:'Pre-meeting alignment meeting',duration:30,fee:35,description:'Agree what to agree at the next meeting.',effect:{meetings:2,bureaucracy:2,perceived:2},document:'Pre-alignment readiness checklist',followup:'alignment',probability:1},
  retro:{name:'Post-meeting retrospective',duration:45,fee:45,description:'Evaluate whether the previous meeting required a retrospective.',effect:{perceived:2,morale:1,bureaucracy:1},document:'Meeting retrospective action log',followup:'scheduling',probability:.45},
  emergency:{name:'Emergency governance meeting',duration:60,fee:110,description:'Respond urgently to an unauthorised outcome.',effect:{regulation:-5,bureaucracy:3,actual:-2,morale:-2},document:'Emergency governance incident report',followup:'steering',probability:.45},
  scheduling:{name:'Meeting to schedule future meetings',duration:45,fee:55,description:'Reserve calendar capacity to reserve calendar capacity.',effect:{meetings:3,perceived:2,bureaucracy:2},document:'Forward meeting schedule',followup:'prealignment',probability:1},
  'frequency-audit':{name:'Meeting frequency investigation',duration:90,fee:125,description:'Investigate excessive meetings via an additional meeting.',effect:{meetings:2,regulation:-2,bureaucracy:3,perceived:3},document:'Meeting saturation review',followup:'scheduling',probability:1}
};
export const WORKDAY_MINUTES=480, MAX_DAILY_MEETINGS=8, MAX_FOLLOWUP_DEPTH=4;
const activeIds=(employees:Employee[])=>new Set(employees.filter(e=>e.status==='active').map(e=>e.id));
export function bookingCost(type:MeetingType,attendees:number){return MEETING_DEFINITIONS[type].fee+attendees*10;}
export function reservedMinutes(meetings:Meeting[],day:number,id:number){return meetings.filter(m=>m.status==='scheduled'&&m.day===day&&m.attendees.includes(id)).reduce((n,m)=>n+m.duration,0);}
function canFit(meetings:Meeting[],type:MeetingType,day:number,attendees:number[]){
  return meetings.filter(m=>m.day===day&&m.status==='scheduled').length<MAX_DAILY_MEETINGS&&attendees.every(id=>reservedMinutes(meetings,day,id)+MEETING_DEFINITIONS[type].duration<=WORKDAY_MINUTES);
}
export function meetingEligibility(s:GameState,c:MeetingCommand):string|null{
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  if(c.operation==='cancel')return s.meetings.some(m=>m.id===c.id&&m.status==='scheduled')?null:'Meeting is not scheduled';
  if(!MEETING_TYPES.includes(c.meetingType))return 'Unknown meeting type';
  if(!Number.isInteger(c.day)||c.day<s.day||c.day>s.day+7)return 'Choose a day in the next eight working days';
  const ids=activeIds(s.employees);
  if(!c.attendees.length||new Set(c.attendees).size!==c.attendees.length||c.attendees.some(id=>!ids.has(id)))return 'Select active employees';
  if(!canFit(s.meetings,c.meetingType,c.day,c.attendees))return 'Calendar capacity exceeded';
  if(s.cash<bookingCost(c.meetingType,c.attendees.length))return 'Insufficient liquidity';
  return null;
}
function makeMeeting(id:number,type:MeetingType,day:number,attendees:number[],parentId:number|null=null,depth=0):Meeting{
  return {id,type,day,attendees:[...attendees],duration:MEETING_DEFINITIONS[type].duration,status:'scheduled',parentId,depth,actualAttendees:[],personMinutes:0,cost:0,outcome:'Awaiting stakeholder attendance.',document:''};
}
export function changeMeeting(s:GameState,c:MeetingCommand){
  if(meetingEligibility(s,c))return null;
  if(c.operation==='cancel')return {meetings:s.meetings.map(m=>m.id===c.id?{...m,status:'cancelled' as const,outcome:'Cancelled by executive instruction.'}:m),nextMeetingId:s.nextMeetingId,message:'Meeting cancelled. Calendar capacity restored.'};
  return {meetings:[...s.meetings,makeMeeting(s.nextMeetingId,c.meetingType,c.day,c.attendees)],nextMeetingId:s.nextMeetingId+1,message:MEETING_DEFINITIONS[c.meetingType].name+' scheduled.'};
}
export function runMeetings(meetings:Meeting[],nextMeetingId:number,employees:Employee[],day:number,random:()=>number){
  let next=meetings.map(m=>({...m})),id=nextMeetingId;
  const ids=activeIds(employees),minutes:Record<number,number>={},delta:Delta={},reports:string[]=[],costs:{label:string;amount:number}[]=[];
  const add=(d:Delta)=>{for(const k of Object.keys(d) as (keyof Delta)[])delta[k]=(delta[k]??0)+(d[k]??0);};
  for(const m of next.filter(m=>m.status==='scheduled'&&m.day<=day)){
    const def=MEETING_DEFINITIONS[m.type];
    const present=m.attendees.filter(a=>ids.has(a)&&(minutes[a]??0)+m.duration<=WORKDAY_MINUTES);
    if(!present.length){m.status='cancelled';m.outcome='No eligible attendees remained.';reports.push(def.name+': '+m.outcome);continue;}
    for(const a of present)minutes[a]=(minutes[a]??0)+m.duration;
    m.actualAttendees=present;m.personMinutes=present.length*m.duration;m.cost=bookingCost(m.type,present.length);
    m.status='held';m.document=def.document+' · record '+m.id;
    costs.push({label:def.name,amount:-m.cost});
    const roll=random();
    const conflicting=roll<.18;
    m.outcome=conflicting?'Conflicting recommendations issued; no decision reached.':'Procedural actions assigned; delivery deferred.';
    add(def.effect);add({actual:-Math.max(1,Math.round(m.personMinutes/240)),meetings:Math.max(1,Math.round(m.duration/30)),morale:-Math.max(1,Math.round(m.duration/90))});
    if(conflicting)add({bureaucracy:2,morale:-1});
    if(m.depth<MAX_FOLLOWUP_DEPTH&&roll<def.probability){
      const tomorrow=day+1;
      if(canFit(next,def.followup,tomorrow,present)){
        next.push(makeMeeting(id++,def.followup,tomorrow,present,m.id,m.depth+1));
        m.outcome+=' Follow-up scheduled for tomorrow.';
      }else m.outcome+=' Follow-up deferred by calendar capacity.';
    }
    reports.push(def.name+': '+m.outcome);
  }
  const updatedEmployees=employees.map(e=>minutes[e.id]?{...e,morale:Math.max(0,e.morale-Math.ceil(minutes[e.id]/120))}:e);
  return {meetings:next,nextMeetingId:id,employees:updatedEmployees,minutes,delta,reports,costs};
}
export function validMeetings(value:unknown,nextId:unknown,employees:Employee[]):boolean{
  const int=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
  if(!Array.isArray(value)||!int(nextId,1))return false;
  const ids=new Set<number>(),people=new Set(employees.map(e=>e.id));
  for(const m of value){
    if(!m||!int(m.id,1)||m.id>=Number(nextId)||ids.has(m.id)||!MEETING_TYPES.includes(m.type)||!int(m.day,1)||m.duration!==MEETING_DEFINITIONS[m.type as MeetingType].duration||!['scheduled','held','cancelled'].includes(m.status)||!(m.parentId===null||int(m.parentId,1,m.id-1))||!int(m.depth,0,MAX_FOLLOWUP_DEPTH)||!Array.isArray(m.attendees)||!m.attendees.length||new Set(m.attendees).size!==m.attendees.length||!m.attendees.every((a:number)=>people.has(a))||!Array.isArray(m.actualAttendees)||new Set(m.actualAttendees).size!==m.actualAttendees.length||!m.actualAttendees.every((a:number)=>m.attendees.includes(a))||m.personMinutes!==m.actualAttendees.length*m.duration||!int(m.cost)||typeof m.outcome!=='string'||typeof m.document!=='string')return false;
    ids.add(m.id);
  }
  return value.every(m=>m.parentId===null||ids.has(m.parentId));
}
