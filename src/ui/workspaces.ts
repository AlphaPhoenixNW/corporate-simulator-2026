import type {GameState} from '../engine/types';
import {ACTIONS} from '../engine/content';
import {actualLimit,campaignEligibility,campaignGates,gateMet,STAGES} from '../engine/campaign';
import {financeEligibility} from '../engine/finance';
export const WORKSPACES=[
 {id:'office',label:'Executive office',group:'Daily management',description:'Your objectives, decisions and working day.'},
 {id:'campaign',label:'Campaign',group:'Daily management',description:'Review your next stage and authorise expansion.'},
 {id:'departments',label:'Departments',group:'Organisation',description:'Establish teams, allocate budgets and choose their priorities.'},
 {id:'employees',label:'People',group:'Organisation',description:'Manage individual employees and corporate careers.'},
 {id:'meetings',label:'Meetings',group:'Organisation',description:'Consume productive time through calendar governance.'},
 {id:'communications',label:'Communications',group:'Organisation',description:'Maintain the corporate narrative.'},
 {id:'finance',label:'Finance',group:'Resources',description:'Acquire subscribers, manage credit and inspect earnings.'},
 {id:'programmes',label:'Transformation',group:'Resources',description:'Commission and certify strategic programmes.'},
 {id:'nothing-os',label:'NOTHING™ OS',group:'Technology',description:'Operate the fictional enterprise desktop.'},
 {id:'agents',label:'Agentic AI',group:'Technology',description:'Configure simulated agent workflows and costs.'},
 {id:'metrics',label:'Performance',group:'Records and analysis',description:'Inspect the full organisational metrics.'},
 {id:'intelligence',label:'Strategic intelligence',group:'Records and analysis',description:'Explore charts, risks and the reporting structure.'},
 {id:'incidents',label:'Incidents',group:'Records and analysis',description:'Review corporate incident history.'},
 {id:'achievements',label:'Achievements',group:'Records and analysis',description:'Review career recognition and lifetime awards.'},
 {id:'career',label:'Executive CV',group:'Records and analysis',description:'Review and export your fictional executive career portfolio.'},
 {id:'ledger',label:'Ledger',group:'Records and analysis',description:'Inspect the financial transaction record.'},
 {id:'activity',label:'Activity log',group:'Records and analysis',description:'Review recent organisational events.'},
 {id:'containment',label:'Containment',group:'Daily management',description:'Neutralise the threat of measurable delivery.'}
] as const;
export type Workspace=typeof WORKSPACES[number]['id'];
export function resolveWorkspace(hash:string):Workspace{
 const id=hash.replace(/^#/,'');
 if(['','workspace','office','decisions','pending-decision','board-notification'].includes(id))return 'office';
 return WORKSPACES.some(w=>w.id===id)?id as Workspace:'office';
}
export function workspaceAvailable(s:GameState,id:Workspace){return id!=='containment'||s.campaign.stage===7;}
export function workspaceInfo(id:Workspace){return WORKSPACES.find(w=>w.id===id)??WORKSPACES[0];}
export type Guidance={title:string;detail:string;action?:string;workspace?:Workspace};
export function recommend(s:GameState):Guidance{
 const m=s.metrics,stage=s.campaign.stage;
 const action=(id:string,detail:string):Guidance=>({title:ACTIONS.find(a=>a.id===id)!.label,detail,action:id});
 const can=(id:string)=>s.cash>=ACTIONS.find(a=>a.id===id)!.cost;
 if(s.ending)return {title:'Review your final result',detail:'This simulation is concluded. Start another from the title screen.'};
 if(s.pendingEvent)return {title:'Resolve the corporate incident',detail:'A decision is required before any further executive work or day settlement.',workspace:'office'};
 if(!s.capacity)return {title:'Conclude working day',detail:'All executive actions have been used. Settle the day and recover your capacity.'};
 if(m.actual>=actualLimit(s)-12&&can('alignment'))return action('alignment','Actual productivity is dangerously high. Reduce useful work before it ends the simulation.');
 if(m.confidence<45&&can('statement'))return action('statement','Shareholder confidence needs protection. An announcement raises confidence by 7 before daily effects.');
 if(m.regulation>40&&can('audit'))return action('audit','Reduce regulatory exposure by 12 before further scrutiny.');
 if(m.morale<25&&m.actual<actualLimit(s)-15&&can('wellbeing'))return action('wellbeing','Low morale undermines confidence. Improve morale by 12, at the cost of some actual productivity.');
 const command={type:'campaign',operation:stage===7?'certify':'advance'} as const;
 if(!campaignEligibility(s,command))return {title:stage===7?'Certify strategic nothingness':'Authorise next campaign stage',detail:'All current campaign requirements are met. Review and authorise the next milestone.',workspace:'campaign'};
 if(s.campaign.mode==='campaign'&&stage===7&&s.boss.phase!=='contained')return {title:'Contain the competent employee',detail:'The board requires the competence threat to be resolved before certification.',workspace:'containment'};
 const gates=s.campaign.mode==='campaign'?campaignGates(s):[];
 const perceived=gates.find(g=>g.label==='Perceived productivity');
 const actual=gates.find(g=>g.label==='Actual productivity');
 const customers=gates.find(g=>g.label==='Subscribers');
 if((perceived&&!gateMet(perceived)||actual&&!gateMet(actual))&&can('alignment'))return action('alignment','Improve perceived productivity by 9 and reduce actual productivity by 7 before daily effects.');
 if((s.finance.subscribers===0||customers&&!gateMet(customers))&&!financeEligibility(s,{type:'finance',operation:'acquire-customers'}))return {title:'Acquire paying subscribers',detail:'Establish recurring revenue in Finance. Customer acquisition costs £600 and consumes one executive action.',workspace:'finance'};
 if(s.campaign.mode==='campaign'&&gates.some(g=>!gateMet(g)&&!['Working days in stage','Perceived productivity','Actual productivity','Shareholder confidence','Cash (£)','Regulatory exposure','Subscribers'].includes(g.label)))return {title:'Review remaining stage requirements',detail:'Your next expansion depends on additional company systems. Check which requirements remain.',workspace:'campaign'};
 if(m.perceived<65&&can('alignment'))return action('alignment','Build the appearance of productivity while reducing delivery risk.');
 if(m.confidence<75&&can('statement'))return action('statement','Strengthen confidence before the next working day.');
 if(m.morale<55&&m.actual<actualLimit(s)-15&&can('wellbeing'))return action('wellbeing','Invest in morale while actual productivity remains safely below its limit.');
 if(m.actual>5&&can('alignment'))return action('alignment','Keep useful work comfortably below the failure threshold.');
 return {title:'Conclude working day when ready',detail:'You may use remaining executive actions or leave them unused. The next working day settles receipts, expenses and operational risks.'};
}
export function mandate(s:GameState){return s.campaign.mode==='sandbox'?'Maintain a solvent, confident company while preventing excessive actual productivity.':STAGES[s.campaign.stage-1].description;}
