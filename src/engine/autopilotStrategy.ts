import {EVENTS} from './content';
import {campaignEligibility,departmentStageReady} from './campaign';
import {departmentEligibility} from './departments';
import {programmeEligibility,PROGRAMME_DEFINITIONS} from './programmes';
import {bossEligibility} from './boss';
import type {Command,GameState,ProgrammeType,BossCommand} from './types';

export function chooseIncident(s:GameState):Command{
 const event=EVENTS.find(e=>e.id===s.pendingEvent)!;
 const score=(c:typeof event.choices[number])=>{
  const e=c.effect,d=c.delayed?.effect??{};
  return (e.actual??0)*-4+(d.actual??0)*-3+(e.confidence??0)*(s.metrics.confidence<65?4:1)+(e.perceived??0)*2+(e.regulation??0)*(s.metrics.regulation>30?-3:-1)+(e.bureaucracy??0)*(s.metrics.bureaucracy<75?1:0)+(e.cash??0)/(s.cash<15000?100:1000);
 };
 return {type:'choose',id:[...event.choices].sort((a,b)=>score(b)-score(a))[0].id};
}
export function nextCommand(s:GameState):Command{
 if(s.pendingEvent)return chooseIncident(s);
 if(!s.capacity)return {type:'endDay'};
 const m=s.metrics,stage=s.campaign.stage;
 const action=(id:string):Command=>({type:'action',id});
 const advance:Command={type:'campaign',operation:stage===7?'certify':'advance'};
 if(!campaignEligibility(s,advance))return advance;
 if(m.confidence<28)return action('statement');
 if(m.actual>Math.min(30,s.campaign.difficulty==='ruthless'?25:30))return action('alignment');
 if(m.regulation>44)return action('audit');
 if(m.morale<18&&m.actual<12&&s.cash>=800)return action('wellbeing');
 if(s.cash<5000&&s.finance.debt<50000&&m.confidence>=35)return {type:'finance',operation:'borrow'};
 const b=s.boss;
 const operation:BossCommand['operation']|null=b.phase==='promotion'?'promote':b.phase==='committee'?'committee':b.phase==='reassignment'?'reassign':b.phase==='training'?'train':b.phase==='programme'?'appoint':null;
 if(operation){const c:BossCommand={type:'boss',operation};if(!bossEligibility(s,c))return c;}
 if(m.perceived<45||m.confidence<48)return action(m.confidence<48?'statement':'alignment');
 // Establish revenue early; a retained subscription base funds later governance.
 if(s.finance.subscribers<(s.campaign.mode==='sandbox'?150:stage===1?36:stage<4?75:stage<6?120:175))return {type:'finance',operation:'acquire-customers'};
 if(s.finance.plan!=='conservative')return {type:'finance',operation:'pricing',plan:'conservative'};
 // Establish and configure departments as they unlock.
 const inactive=s.departments.find(d=>!d.active&&departmentStageReady(s,d.id)&&!departmentEligibility(s,d.id,'activate'));
 if(inactive)return {type:'department',id:inactive.id,operation:'activate'};
 const focus=s.departments.find(d=>d.active&&(['executive','digital','ai'].includes(d.id)?d.focus!=='governance':['legal','hr'].includes(d.id)?d.focus!=='operations':false));
 if(focus)return {type:'department',id:focus.id,operation:'focus'};
 // Two sequential executive-sponsored programmes have no useful product dependencies.
 const targets:ProgrammeType[]=['non-intervention','bed-led'];
 for(const type of targets){
  const def=PROGRAMME_DEFINITIONS[type],p=s.programmes.find(x=>x.type===type);
  if(p?.status==='complete')continue;
  if(!p){
   if(stage<3)break;
   const lead=s.employees.find(e=>e.status==='active'&&e.department===def.sponsor);
   if(lead){const c:Command={type:'programme',operation:'commission',programme:type,leadId:lead.id};if(!programmeEligibility(s,c))return c;}
  }else if(p.status==='review'){
   for(const operation of ['approve','committee'] as const){const c:Command={type:'programme',operation,programme:type};if(!programmeEligibility(s,c))return c;}
  }else if(p.status==='active'&&p.spent+def.dailyFee>p.budget){
   const c:Command={type:'programme',operation:'topup',programme:type};if(!programmeEligibility(s,c))return c;
  }
  break;
 }
 if(stage>=5&&!s.finance.acquisitions.length)return {type:'finance',operation:'acquire',target:'deckworks'};
 if(stage>=5&&s.agents.totalRuns<3){
  if(s.os.power==='offline')return {type:'os',operation:'boot'};
  if(!s.agents.enabled)return {type:'agent',operation:'toggle'};
 }
 if(s.agents.enabled&&s.agents.totalRuns>=3)return {type:'agent',operation:'toggle'};
 if(stage>=5&&s.compensation<5400&&m.confidence>=60)return action('bonus');
 if(m.regulation>25)return action('audit');
 if(m.actual>8||m.perceived<90)return action('alignment');
 if(m.confidence<85)return action('statement');
 if(m.bureaucracy<75)return action('consultants');
 return {type:'endDay'};
}
