import {ACTIONS,EVENTS} from '../engine/content';
import {METRIC_KEYS,type Command,type GameState,type Metric} from '../engine/types';
import type {Cue} from './audio';
import type {Notice} from './experience';

export const ACTION_FLAVOUR:Record<string,readonly string[]>={
 alignment:['Consensus has been established on the strategic importance of further consensus.','The alignment framework has been aligned with the alignment framework.','Stakeholders are now positioned to begin discussing their positions.'],
 statement:['The organisation has issued a confident statement of intent. Outcomes remain out of scope.','Stakeholders have received a compelling narrative in advance of any supporting evidence.','Strategic visibility has been enhanced without creating a deliverable.'],
 consultants:['An external perspective has been commissioned to assess the value of additional perspectives.','The procurement of recommendations is progressing independently of implementation.','The review of potential reviews has entered its initial assessment phase.'],
 rest:['The Chief Executive remains strategically horizontal.','The executive has declined vertical participation.','Leadership availability has been optimised through non-intervention.'],
 bonus:['Exceptional executive performance has been independently recognised by the executive.','Remuneration has been decoupled from operational interference.','The board acknowledges the strategic importance of executive financial wellbeing.'],
 audit:['Governance has been strengthened through the introduction of more governance.','The organisation has initiated a process to assure the adequacy of its processes.','Regulatory exposure is being addressed through an appropriately documented review.'],
 wellbeing:['Employee wellbeing has received a formal allocation. Renewed competence remains a risk.','The organisation has invested in its people. The board will monitor any unintended usefulness.','Human capital has been recognised as human. Operational consequences remain under review.']
};
const LABELS:Record<Metric,string>={confidence:'Shareholder confidence',prestige:'Executive prestige',morale:'Employee morale',bureaucracy:'Bureaucracy',perceived:'Perceived productivity',actual:'Actual productivity',buzzwords:'Buzzword density',meetings:'Meeting saturation',regulation:'Regulatory exposure',incompetence:'Organisational incompetence'};
export interface DecisionDelta {key:string;label:string;value:number;unit:'points'|'money'|'actions';tone:'positive'|'negative'|'neutral'}
export interface DecisionReceipt {id:number;title:string;flavour:string;deltas:DecisionDelta[];kind:'decision'|'day'|'recognition'}
export function decisionReceipt(before:GameState,after:GameState,command:Command,id:number):DecisionReceipt|null{
 if(before===after||before.seed!==after.seed||after.day<before.day)return null;
 const action=command.type==='action'?ACTIONS.find(a=>a.id===command.id):undefined;
 const choice=command.type==='choose'?EVENTS.find(e=>e.id===before.pendingEvent)?.choices.find(c=>c.id===command.id):undefined;
 const pool=action?ACTION_FLAVOUR[action.id]:undefined;
 const log=after.log[0]?.replace(/^Day \d+: /,'')??'Executive decision recorded.';
 const title=command.type==='endDay'?'Working day '+before.day+' reconciled':action?.label??choice?.label??'Corporate decision recorded';
 const flavour=command.type==='endDay'?'Accounts reconciled. Executive capacity renewed.':pool?.[(id-1)%pool.length]??(choice?'The selected response has been entered into the corporate record.':log);
 const deltas:DecisionDelta[]=[];
 const add=(key:string,label:string,value:number,unit:DecisionDelta['unit'],tone:DecisionDelta['tone'])=>{if(value!==0)deltas.push({key,label,value,unit,tone});};
 const cash=after.cash-before.cash;add('cash','Corporate liquidity',cash,'money',cash>0?'positive':'negative');
 const compensation=after.compensation-before.compensation;add('compensation','Executive compensation',compensation,'money',compensation>0?'positive':'negative');
 for(const key of METRIC_KEYS){
  const value=after.metrics[key]-before.metrics[key];
  const reverse=key==='actual'||key==='regulation';
  const neutral=key==='meetings'||key==='bureaucracy'||key==='incompetence'||key==='buzzwords';
  add(key,LABELS[key],value,'points',neutral?'neutral':(reverse?value<0:value>0)?'positive':'negative');
 }
 add('capacity','Executive capacity',after.capacity-before.capacity,'actions','neutral');
 return {id,title,flavour,deltas,kind:command.type==='endDay'?'day':after.campaign.stage>before.campaign.stage||after.compensation>before.compensation?'recognition':'decision'};
}
export function decisionCue(before:GameState,after:GameState,command:Command| null,notices:Notice[]):Cue{
 if(after.ending&&!before.ending)return after.ending==='certified'?'expansion':'ending';
 if(before.os.power==='online'&&after.os.power==='offline')return 'shutdown';
 if(notices.some(n=>n.kind==='stage'))return 'expansion';
 if(after.compensation>before.compensation)return 'bonus';
 if(notices.some(n=>n.kind==='award'))return 'award';
 if(notices.some(n=>n.kind==='incident'||n.kind==='warning'))return 'incident';
 if(after.day!==before.day)return after.cash>before.cash?'revenue':'day';
 return command?.type==='finance'&&after.cash>before.cash?'revenue':'action';
}
export function formatDelta(delta:DecisionDelta){
 const sign=delta.value>0?'+':'−',abs=Math.abs(delta.value);
 return sign+(delta.unit==='money'?new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(abs):String(abs)+(delta.unit==='actions'?' action'+(abs===1?'':'s'):''));
}
