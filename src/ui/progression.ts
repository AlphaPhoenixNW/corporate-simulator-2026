import type {GameState} from '../engine/types';
import {WORKSPACES,workspaceAvailable,type Workspace} from './workspaces';
type Introduction={stage:number;day:number;purpose:string;first:string;risk:string};
export const INTRODUCTIONS:Record<Exclude<Workspace,'office'>,Introduction>={
 campaign:{stage:1,day:1,purpose:'Expand through seven corporate stages by satisfying measurable board requirements.',first:'Review the unmet requirements and authorise expansion when they are all satisfied.',risk:'Expansion increases operating overhead as well as providing capital.'},
 departments:{stage:1,day:1,purpose:'Direct teams towards governance or operational work.',first:'Inspect Engineering and its current focus. Governance can reduce actual delivery.',risk:'Hiring and higher budgets add recurring costs.'},
 finance:{stage:1,day:1,purpose:'Keep cash positive and establish recurring subscriber income.',first:'Acquire customers for £600 using one executive action.',risk:'Customers incur servicing costs; debt attracts daily interest.'},
 employees:{stage:1,day:2,purpose:'Manage individual staff, their morale and the risk of excessive competence.',first:'Select an employee to review their profile and available personnel decisions.',risk:'Promotions and hires increase salaries; demoralised employees may resign.'},
 meetings:{stage:1,day:3,purpose:'Use scheduled meetings to absorb employee time and generate governance records.',first:'Choose a meeting type, attendees and working day.',risk:'Every meeting consumes time and money.'},
 communications:{stage:2,day:1,purpose:'Build the company narrative through announcements and the Align™ network.',first:'Choose a communication format and publish a message.',risk:'Viral posts can attract scrutiny and scandals.'},
 programmes:{stage:3,day:1,purpose:'Turn corporate ambition into consultancy fees, milestones and committees.',first:'Select a programme and a suitable sponsor employee, then commission it.',risk:'Scope creep and useful delivery can threaten your strategic objectives.'},
 'nothing-os':{stage:4,day:1,purpose:'Operate the fictional enterprise desktop, licences and simulated compute settings.',first:'Review the licence cost before activating the system.',risk:'An online system consumes simulated tokens and cash; shutting down expires its licence.'},
 agents:{stage:5,day:1,purpose:'Orchestrate six simulated agents to generate reports rather than useful work.',first:'Activate NOTHING™ OS, then review the agent model, budget and governance settings.',risk:'Permissive governance can release hallucinations or accidental value.'},
 metrics:{stage:1,day:3,purpose:'Inspect all ten organisational scores and their risks.',first:'Check actual productivity, morale and regulatory exposure.',risk:'Actual productivity reaching the difficulty limit ends the game.'},
 intelligence:{stage:1,day:4,purpose:'Inspect financial trends, the productivity gap and the reporting structure.',first:'Review the performance gap and select a reporting unit.',risk:'The charts reflect simulated state; they do not make decisions for you.'},
 incidents:{stage:1,day:2,purpose:'Review previous corporate decisions and their consequences.',first:'Inspect your resolved incident history and scheduled effects.',risk:'Some consequences arrive several days after your choice.'},
 achievements:{stage:1,day:4,purpose:'Collect recognition for strategic non-delivery and corporate career milestones.',first:'Inspect earned and locked awards using the category and status filters.',risk:'Awards do not change your cash or metrics.'},
 ledger:{stage:1,day:2,purpose:'Inspect the individual transactions behind your cash balance.',first:'Compare recent receipts, expenditure and financing entries.',risk:'Capital injections and borrowing are not operating profit.'},
 activity:{stage:1,day:2,purpose:'Read recent decisions and operational changes in chronological context.',first:'Review the newest activity entries after settling a working day.',risk:'The activity log retains recent events rather than a complete company history.'},
 containment:{stage:7,day:1,purpose:'Prevent the exceptionally competent employee from delivering measurable value.',first:'Review the current containment phase and perform its required intervention.',risk:'The employee may generate useful work every day until contained.'}
};
export function introduced(s:GameState,id:Workspace):boolean{
 if(!workspaceAvailable(s,id))return false;
 if(id==='office'||s.campaign.mode==='sandbox')return true;
 const rule=INTRODUCTIONS[id];
 if(s.campaign.stage>=rule.stage&&s.day>=rule.day)return true;
 // Previously used features and deep-linked records must not disappear on an old save.
 switch(id){
 case 'meetings':return s.meetings.length>0;
 case 'communications':return s.communications.length>0;
 case 'programmes':return s.programmes.length>0;
 case 'nothing-os':return s.os.boots>0;
 case 'agents':return s.agents.enabled||s.agents.totalRuns>0;
 case 'incidents':return s.incidentHistory.length>0||!!s.pendingEvent;
 case 'achievements':return s.achievements.unlocked.length>0;
 default:return false;
 }
}
export function visibleWorkspaces(s:GameState,showAll:boolean,current:Workspace='office'){
 return WORKSPACES.filter(w=>workspaceAvailable(s,w.id)&&(showAll||w.id===current||introduced(s,w.id)));
}
export function newlyIntroduced(before:GameState,after:GameState):Workspace[]{
 return WORKSPACES.filter(w=>introduced(after,w.id)&&!introduced(before,w.id)).map(w=>w.id);
}
export function introductionTiming(id:Exclude<Workspace,'office'>){const r=INTRODUCTIONS[id];return r.stage>1?'Campaign stage '+r.stage:r.day>1?'Working day '+r.day:'Available immediately';}
