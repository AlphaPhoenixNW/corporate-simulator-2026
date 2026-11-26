import { COMMUNICATION_TYPES, type Communication, type CommunicationType, type CommunicationCommand, type GameState, type Employee, type Delta } from './types';
import { DEPARTMENTS } from './departments';

interface Format {name:string; fee:number; effect:Delta}
export const COMMUNICATION_FORMATS:Record<CommunicationType,Format>={
  email:{name:'Internal email',fee:25,effect:{bureaucracy:1,perceived:1}},
  announcement:{name:'Executive announcement',fee:150,effect:{confidence:4,prestige:2,perceived:3,buzzwords:2}},
  newsletter:{name:'Corporate newsletter',fee:100,effect:{morale:3,perceived:2,buzzwords:2}},
  'press-release':{name:'Press release',fee:300,effect:{confidence:6,perceived:4,regulation:3}},
  shareholder:{name:'Shareholder statement',fee:200,effect:{confidence:5,prestige:2,regulation:2}},
  'performance-review':{name:'Performance review',fee:50,effect:{bureaucracy:2,perceived:2}},
  consultancy:{name:'Consultancy recommendation',fee:450,effect:{bureaucracy:4,actual:-2,perceived:4}},
  social:{name:'Professional social post',fee:40,effect:{perceived:2,buzzwords:2}},
  apology:{name:'Corporate apology',fee:125,effect:{regulation:-4,confidence:-1,morale:2}},
  transformation:{name:'Strategic transformation announcement',fee:250,effect:{prestige:3,confidence:3,bureaucracy:3,buzzwords:4}}
};
const pick=<T,>(items:readonly T[],random:()=>number):T=>items[Math.min(items.length-1,Math.floor(random()*items.length))];
const THEMES=['cross-functional alignment','outcome-agnostic delivery','enterprise readiness','strategic optionality','value-adjacent innovation','stakeholder enablement','governance maturity','operational ambiguity'];
const VERBS=['accelerate','reimagine','operationalise','socialise','de-risk','unlock'];
const COMMENTS=['Congratulations on this important milestone.','So proud to be part of this journey.','A masterclass in strategic alignment.','Thrilled to see this taking shape.','Powerful insights. Let us connect.','This is what leadership looks like.'];
export const VIRAL_THRESHOLD=1000,RESPONSE_COST=125;
const staff=(s:GameState)=>s.employees.filter(e=>e.status==='active');
export function communicationEligibility(s:GameState,c:CommunicationCommand):string|null{
  if(s.ending||s.pendingEvent)return 'Executive attention unavailable';
  if(c.operation==='congratulate'){
    const p=s.communications.find(m=>m.id===c.id);
    if(!p||p.type!=='social'||p.congratulated)return 'Post is not eligible';
    return null;
  }
  if(s.capacity<1)return 'Executive attention unavailable';
  if(c.operation==='respond'){
    if(!s.communications.some(m=>m.id===c.id&&m.scandal==='open'))return 'No open scandal';
    return s.cash<RESPONSE_COST?'Insufficient liquidity':null;
  }
  if(c.operation==='publish'){
    if(!COMMUNICATION_TYPES.includes(c.format))return 'Unknown communication format';
    return s.cash<COMMUNICATION_FORMATS[c.format].fee?'Insufficient liquidity':null;
  }
  return 'Unknown communication operation';
}
export function generateCommunication(s:GameState,type:CommunicationType,id:number,random:()=>number,author?:Employee,subjectEmployee?:Employee,relatedId:number|null=null):Communication{
  const theme=pick(THEMES,random),verb=pick(VERBS,random);
  const team=staff(s),target=subjectEmployee??author??team[0];
  const dept=target?DEPARTMENTS[target.department].name:'Executive Office';
  const held=s.meetings.filter(m=>m.status==='held'&&m.day===s.day);
  const score=s.metrics.perceived,actual=s.metrics.actual;
  let subject='',body='';
  switch(type){
    case 'email':
      subject='Action required: '+theme;
      body='Colleagues, please '+verb+' '+theme+' across '+dept+'. Today\u2019s '+held.length+' completed meeting(s) have generated further alignment requirements. Kindly acknowledge this email before doing anything else.';break;
    case 'announcement':
      subject='A new chapter in '+theme;
      body='The Executive Office is pleased to announce a renewed commitment to '+theme+'. With perceived productivity at '+score+'/100, we are confident in our ability to '+verb+' momentum. Deliverables will be communicated following stakeholder alignment.';break;
    case 'newsletter':
      subject='NOTHING™ Inside | Working day '+s.day;
      body='This edition celebrates '+team.length+' colleagues and '+held.length+' completed meeting(s). '+dept+' has demonstrated exceptional commitment to '+theme+'. Employee morale stands at '+s.metrics.morale+'/100; a dedicated working group will investigate further opportunities for celebration.';break;
    case 'press-release':
      subject='NOTHING™ announces strategic progress';
      body='NOTHING™ today announced an initiative to '+verb+' '+theme+'. The organisation reported a perceived productivity score of '+score+'/100. Commercial availability, product specifications and measurable benefits remain subject to future announcements.';break;
    case 'shareholder':
      subject='Investor update | Working day '+s.day;
      body='Shareholder confidence stands at '+s.metrics.confidence+'/100 and available liquidity is £'+s.cash.toLocaleString('en-GB')+'. Management remains committed to '+theme+'. Actual output is currently '+actual+'/100, reflecting our disciplined approach to avoiding premature delivery.';break;
    case 'performance-review':
      subject='Confidential performance record: '+(target?.name??'Executive Office');
      body=(target?target.name+' of '+dept+' has recorded '+target.usefulWork+' useful task(s). '+target.lastReview:'No individual record available.')+' Development objectives include '+theme+' and further alignment with management expectations.';break;
    case 'consultancy':
      subject='Advisory recommendation: '+theme;
      body='Following a preliminary assessment of '+dept+', we recommend a phased programme to '+verb+' '+theme+'. Phase one establishes the governance necessary to commission phase two. Cost-benefit analysis will be scoped as an independent engagement.';break;
    case 'social':
      subject='Proud to share a milestone';
      body='Delighted to share that '+dept+' is continuing to '+verb+' '+theme+'. '+held.length+' meeting(s), countless stakeholder conversations, and so much still to announce. Grateful to everyone who made this possible. #Leadership #Alignment #NothingAtScale';break;
    case 'apology':
      subject='Statement regarding recent communications';
      body=(relatedId===null?'We recognise that recent messaging may have created expectations.':'We acknowledge concerns relating to communication #'+relatedId+'.')+' We apologise for any clarity that may have resulted. A review of our '+theme+' framework will ensure future statements are appropriately contextualised.';break;
    case 'transformation':
      subject='Introducing the next transformation';
      body='We are initiating a programme to '+verb+' '+theme+'. '+s.departments.filter(d=>d.active).length+' active departments will participate in discovery, governance and roadmap development. The programme will define its own success criteria after its first steering committee.';break;
  }
  const isSocial=type==='social';
  const influence=author?author.politics+(author.archetype==='thought-leader'?50:0):70+s.metrics.prestige;
  const impressions=isSocial?Math.round((30+influence*3)*(1+random()*1.5)):0;
  const reactions=isSocial?Math.min(impressions,Math.round(impressions*(.03+random()*.09))):0;
  const comments=isSocial?team.filter(e=>e.id!==author?.id).slice(0,Math.min(2,team.length)).map(e=>({authorId:e.id,text:pick(COMMENTS,random)})):[];
  return {id,day:s.day,type,authorId:author?.id??null,author:author?.name??'Office of the Chief Executive',subject,body,impressions,reactions,comments,congratulated:false,viral:false,scandal:'none',relatedId};
}
export function influencerLeaderboard(communications:Communication[],employees:Employee[]){
  return employees.map(e=>({id:e.id,name:e.name,impressions:communications.filter(c=>c.type==='social'&&c.authorId===e.id).reduce((n,c)=>n+c.impressions,0),reactions:communications.filter(c=>c.type==='social'&&c.authorId===e.id).reduce((n,c)=>n+c.reactions,0)})).filter(e=>e.impressions>0).sort((a,b)=>b.impressions-a.impressions||a.id-b.id);
}
export function changeCommunication(s:GameState,c:CommunicationCommand,random:()=>number):{communications:Communication[];nextCommunicationId:number;cost:number;capacity:number;delta:Delta;message:string}|null{
  if(communicationEligibility(s,c))return null;
  if(c.operation==='congratulate'){
    const post=s.communications.find(m=>m.id===c.id)!;
    return {communications:s.communications.map(m=>m.id===post.id?{...m,congratulated:true,reactions:Math.min(m.impressions,m.reactions+1),comments:[...m.comments,{authorId:null,text:'Congratulations on this strategically significant milestone.'}]}:m),nextCommunicationId:s.nextCommunicationId,cost:0,capacity:0,delta:{prestige:1},message:'Executive congratulations recorded.'};
  }
  if(c.operation==='respond'){
    const apology=generateCommunication(s,'apology',s.nextCommunicationId,random,undefined,undefined,c.id);
    return {communications:[...s.communications.map(m=>m.id===c.id?{...m,scandal:'resolved' as const}:m),apology],nextCommunicationId:s.nextCommunicationId+1,cost:RESPONSE_COST,capacity:1,delta:{regulation:-8,confidence:2},message:'Corporate apology issued; reputational response recorded.'};
  }
  if(c.operation!=='publish')return null;
  const format=COMMUNICATION_FORMATS[c.format];
  return {communications:[...s.communications,generateCommunication(s,c.format,s.nextCommunicationId,random)],nextCommunicationId:s.nextCommunicationId+1,cost:format.fee,capacity:1,delta:format.effect,message:format.name+' published.'};
}
export function runCommunications(s:GameState,random:()=>number){
  const delta:Delta={},reports:string[]=[];
  const add=(d:Delta)=>{for(const k of Object.keys(d) as (keyof Delta)[])delta[k]=(delta[k]??0)+(d[k]??0);};
  let id=s.nextCommunicationId;
  const team=staff(s);
  const messages=s.communications.map(p=>{
    if(p.type!=='social'||s.day-p.day>3)return p;
    const roll=random(),author=team.find(e=>e.id===p.authorId);
    const amplification=author?.archetype==='thought-leader'?1.6:1;
    const impressions=p.impressions+Math.round((60+p.impressions*(roll>.8?.85:.15))*amplification);
    const reactions=Math.min(impressions,p.reactions+Math.round((impressions-p.impressions)*(.04+roll*.05)));
    const viral=p.viral||impressions>=VIRAL_THRESHOLD;
    let scandal=p.scandal;
    if(viral&&!p.viral){add({confidence:3,perceived:4,prestige:2});reports.push(p.author+' went viral on Align™.');}
    if(scandal==='none'&&viral&&s.metrics.perceived-s.metrics.actual>=25&&roll>.76){
      scandal='open';add({confidence:-8,regulation:8,morale:-2});reports.push('Reputational scandal: '+p.author+' was challenged over measurable outcomes.');
    }
    return {...p,impressions,reactions,viral,scandal};
  });
  const scheduledFormats:CommunicationType[]=['email','newsletter','shareholder','consultancy','transformation','press-release','announcement','performance-review','apology'];
  const format=scheduledFormats[(s.day-1)%scheduledFormats.length];
  const author=team.length?pick(team,random):undefined;
  messages.push(generateCommunication(s,format,id++,random,['email','newsletter','consultancy'].includes(format)?author:undefined,author));
  if(team.length){
    const influencer=team.filter(e=>e.archetype==='thought-leader');
    const poster=influencer.length&&random()<.65?pick(influencer,random):pick(team,random);
    messages.push(generateCommunication(s,'social',id++,random,poster));
  }
  return {communications:messages,nextCommunicationId:id,delta,reports};
}
export function validCommunications(value:unknown,nextId:unknown,employees:Employee[]):boolean{
  const int=(x:unknown,min=0)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min;
  if(!Array.isArray(value)||!int(nextId,1))return false;
  const ids=new Set<number>(),people=new Set(employees.map(e=>e.id));
  for(const p of value){
    if(!p||!int(p.id,1)||p.id>=Number(nextId)||ids.has(p.id)||!int(p.day,1)||!COMMUNICATION_TYPES.includes(p.type)||!(p.authorId===null||people.has(p.authorId))||typeof p.author!=='string'||typeof p.subject!=='string'||typeof p.body!=='string'||!int(p.impressions)||!int(p.reactions)||p.reactions>p.impressions||!Array.isArray(p.comments)||!p.comments.every((c:unknown)=>{if(!c||typeof c!=='object')return false;const x=c as SocialCommentLike;return (x.authorId===null||people.has(x.authorId))&&typeof x.text==='string';})||typeof p.congratulated!=='boolean'||typeof p.viral!=='boolean'||!['none','open','resolved'].includes(p.scandal)||!(p.relatedId===null||(int(p.relatedId,1)&&p.relatedId<p.id)))return false;
    ids.add(p.id);
  }
  return value.every(p=>p.relatedId===null||ids.has(p.relatedId));
}
type SocialCommentLike={authorId:number|null;text:string};
