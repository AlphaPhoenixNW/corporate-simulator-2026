import type {AchievementState,AchievementUnlock,GameState,Command} from './types';
export const ACHIEVEMENT_CATEGORIES=['leadership','people','meetings','communications','transformation','finance','technology','campaign'] as const;
export type AchievementCategory=typeof ACHIEVEMENT_CATEGORIES[number];
export const CATEGORY_LABELS:Record<AchievementCategory,string>={leadership:'Executive leadership',people:'Human capital',meetings:'Meeting governance',communications:'Corporate narrative',transformation:'Transformation',finance:'Financial engineering',technology:'Digital innovation',campaign:'Campaign and endings'};
export interface Achievement {id:string;name:string;description:string;category:AchievementCategory;test:(s:GameState)=>boolean}
const held=(s:GameState)=>s.meetings.filter(m=>m.status==='held');
const longestMeetingDay=(s:GameState)=>{const days=new Map<number,number>();for(const m of s.meetings)if(m.status==='held')days.set(m.day,(days.get(m.day)??0)+m.personMinutes);return Math.max(0,...days.values());};
const decision=(s:GameState,eventId:string,choiceId:string)=>s.incidentHistory.some(h=>h.eventId===eventId&&h.choiceId===choiceId);
export const ACHIEVEMENTS:Achievement[]=[
  {id:"horizontal-executive",name:"The Horizontal Executive",description:"Practise bed-led leadership five times.",category:'leadership',test:s=>s.achievements.actions.rest>=5},
  {id:"bed-led-leadership",name:"Bed-Led Leadership",description:"Practise bed-led leadership for the first time.",category:'leadership',test:s=>s.achievements.actions.rest>=1},
  {id:"strategically-unavailable",name:"Strategically Unavailable",description:"Conclude three consecutive working days without using executive capacity.",category:'leadership',test:s=>s.achievements.bestIdleStreak>=3},
  {id:"bonus-season",name:"Bonus Season Is Every Season",description:"Collect £5,000 in executive compensation.",category:'leadership',test:s=>s.compensation>=5000},
  {id:"executive-magnificence",name:"Executive Magnificence",description:"Reach 100 executive prestige.",category:'leadership',test:s=>s.metrics.prestige===100},
  {id:"alignment-addict",name:"Alignment Addict",description:"Commission five executive alignment workshops.",category:'leadership',test:s=>s.achievements.actions.alignment>=5},
  {id:"synergy-without-substance",name:"Synergy Without Substance",description:"Reach perceived productivity 80 while actual productivity is at most 10.",category:'leadership',test:s=>s.metrics.perceived>=80&&s.metrics.actual<=10},
  {id:"max-buzzwords",name:"Maximum Buzzword Density",description:"Reach 100 buzzword density.",category:'leadership',test:s=>s.metrics.buzzwords===100},
  {id:"bureaucracy",name:"Bureaucracy Is the Product",description:"Reach 100 bureaucratic complexity.",category:'leadership',test:s=>s.metrics.bureaucracy===100},
  {id:"incompetence",name:"Institutional Excellence in Incompetence",description:"Reach 100 organisational incompetence.",category:'leadership',test:s=>s.metrics.incompetence===100},
  {id:"first-promotion",name:"A Promotion Away from Productivity",description:"Promote an employee into management.",category:'people',test:s=>s.employees.some(e=>e.level>=2)},
  {id:"director",name:"Director of Nothing",description:"Promote an employee to director or executive grade.",category:'people',test:s=>s.employees.some(e=>e.level>=3)},
  {id:"executive-grade",name:"Enterprise-Grade Nothing",description:"Promote an employee to the highest grade.",category:'people',test:s=>s.employees.some(e=>e.level===4)},
  {id:"talent-acquisition",name:"Talent Acquisition Framework",description:"Have at least ten active employees.",category:'people',test:s=>s.employees.filter(e=>e.status==='active').length>=10},
  {id:"org-chart",name:"Organisation Without a Purpose",description:"Activate all ten departments.",category:'people',test:s=>s.departments.every(d=>d.active)},
  {id:"review-board",name:"Review the Review",description:"Conduct five employee performance reviews.",category:'people',test:s=>s.employees.reduce((n,e)=>n+e.reviews,0)>=5},
  {id:"alliance",name:"Cross-Functional Friendship",description:"Form an employee alliance.",category:'people',test:s=>s.relationships.some(r=>r.affinity>=50)},
  {id:"rivalry",name:"Strategic Interdepartmental Friction",description:"Record an employee rivalry.",category:'people',test:s=>s.relationships.some(r=>r.affinity<=-50)},
  {id:"accidental-value",name:"Accidental Business Value",description:"Record a useful employee task or programme incident.",category:'people',test:s=>s.employees.some(e=>e.usefulWork>0)||s.programmes.some(p=>p.incidents>0)},
  {id:"restructuring",name:"Organisational Realignment",description:"Record an employee redundancy.",category:'people',test:s=>s.employees.some(e=>e.status==='redundant')},
  {id:"first-meeting",name:"Calendar Entry of Strategic Importance",description:"Hold a meeting.",category:'meetings',test:s=>held(s).length>=1},
  {id:"meeting-about-meeting",name:"Meeting About a Meeting",description:"Hold a meeting generated by another meeting.",category:'meetings',test:s=>held(s).some(m=>m.parentId!==null)},
  {id:"recursive-governance",name:"Recursive Governance",description:"Hold a meeting at follow-up depth three or greater.",category:'meetings',test:s=>held(s).some(m=>m.depth>=3)},
  {id:"full-calendar",name:"Nothing but Meetings",description:"Record at least eight person-hours of meetings on one day.",category:'meetings',test:s=>longestMeetingDay(s)>=480},
  {id:"meeting-audit",name:"Meeting Frequency Investigation",description:"Hold a meeting frequency investigation.",category:'meetings',test:s=>held(s).some(m=>m.type==='frequency-audit')},
  {id:"committee-collector",name:"Committee Collector",description:"Hold ten steering committees.",category:'meetings',test:s=>held(s).filter(m=>m.type==='steering').length>=10},
  {id:"minutes",name:"Minutes of Nothing",description:"Hold 25 meetings.",category:'meetings',test:s=>held(s).length>=25},
  {id:"saturation",name:"Calendar Fully Optimised",description:"Reach 100 meeting saturation.",category:'meetings',test:s=>s.metrics.meetings===100},
  {id:"announcement",name:"Announcement of an Announcement",description:"Issue an executive announcement.",category:'communications',test:s=>s.communications.some(c=>c.type==='announcement')},
  {id:"all-formats",name:"Omnichannel Nothingness",description:"Record all ten communication formats.",category:'communications',test:s=>new Set(s.communications.map(c=>c.type)).size===10},
  {id:"congratulations",name:"Congratulations on Congratulations",description:"Congratulate five social posts.",category:'communications',test:s=>s.communications.filter(c=>c.congratulated).length>=5},
  {id:"viral",name:"Thought Leadership Without Thoughts",description:"Record a viral social post.",category:'communications',test:s=>s.communications.some(c=>c.viral)},
  {id:"scandal",name:"Reputational Opportunity",description:"Experience a social scandal.",category:'communications',test:s=>s.communications.some(c=>c.scandal!=='none')},
  {id:"apology",name:"We Apologise for the Clarity",description:"Resolve a social scandal.",category:'communications',test:s=>s.communications.some(c=>c.scandal==='resolved')},
  {id:"impressions",name:"Impressions of Productivity",description:"Accumulate 10,000 social impressions.",category:'communications',test:s=>s.communications.filter(c=>c.type==='social').reduce((n,c)=>n+c.impressions,0)>=10000},
  {id:"newsletter",name:"Internal Narrative Domination",description:"Publish or receive five corporate newsletters.",category:'communications',test:s=>s.communications.filter(c=>c.type==='newsletter').length>=5},
  {id:"commission",name:"Transformation Initiated",description:"Commission a transformation programme.",category:'transformation',test:s=>s.programmes.length>=1},
  {id:"milestone",name:"Milestone Without a Deliverable",description:"Approve a programme milestone.",category:'transformation',test:s=>s.programmes.some(p=>p.milestone>=1)},
  {id:"scope-creep",name:"Scope Creep Is a Feature",description:"Experience three scope expansions on a programme.",category:'transformation',test:s=>s.programmes.some(p=>p.scopeCreep>=3)},
  {id:"consultancy",name:"Consultancy of Consultancies",description:"Spend £10,000 on portfolio consultancy.",category:'transformation',test:s=>s.programmes.reduce((n,p)=>n+p.consultancy,0)>=10000},
  {id:"certification",name:"Certified Non-Delivery",description:"Complete a transformation programme.",category:'transformation',test:s=>s.programmes.some(p=>p.status==='complete')},
  {id:"portfolio",name:"Transformation Transformation",description:"Commission all nine standard programmes.",category:'transformation',test:s=>s.programmes.length===9},
  {id:"duvet",name:"Duvet Governance Accreditation",description:"Complete Bed-Led Leadership.",category:'transformation',test:s=>s.programmes.some(p=>p.type==='bed-led'&&p.status==='complete')},
  {id:"sunk-cost",name:"Strategic Sunk Cost",description:"Cancel a programme after spending at least £1,000.",category:'transformation',test:s=>s.programmes.some(p=>p.status==='cancelled'&&p.spent>=1000)},
  {id:"first-customer",name:"A Paying Customer for Nothing",description:"Acquire at least one subscriber.",category:'finance',test:s=>s.finance.subscribers>0},
  {id:"hundred-customers",name:"Nothing as a Service",description:"Reach 100 subscribers.",category:'finance',test:s=>s.finance.subscribers>=100},
  {id:"hypothetical-invoice",name:"Predictive Savings Monetisation",description:"Issue at least £5,000 in one day's hypothetical savings invoices.",category:'finance',test:s=>s.finance.lastInvoice>=5000},
  {id:"credit",name:"Credit Without a Product",description:"Draw corporate credit.",category:'finance',test:s=>s.finance.debt>0},
  {id:"debt-ceiling",name:"Leveraged Nothingness",description:"Reach £50,000 outstanding debt.",category:'finance',test:s=>s.finance.debt>=50000},
  {id:"acquisitions",name:"Strategic Acquisition Spree",description:"Acquire all three fictional companies.",category:'finance',test:s=>s.finance.acquisitions.length===3},
  {id:"quarterly",name:"Quarterly Narrative Excellence",description:"Close a profitable quarter.",category:'finance',test:s=>s.finance.reports.some(r=>r.profit>0)},
  {id:"million",name:"Million-Pound Nothingness",description:"Record £1 million lifetime operating receipts.",category:'finance',test:s=>s.finance.lifetime.revenue>=1000000},
  {id:"boot",name:"Enterprise Entitlement Activated",description:"Boot NOTHING™ OS.",category:'technology',test:s=>s.os.boots>=1},
  {id:"zero-token",name:"Zero-Token Hero",description:"Complete a strategic OS shutdown.",category:'technology',test:s=>s.os.zeroTokenShutdowns>=1},
  {id:"restart",name:"Pay to Do Nothing Again",description:"Purchase a restart licence.",category:'technology',test:s=>s.os.boots>=2},
  {id:"diagnostics",name:"No Remediation Initiated",description:"Generate an OS diagnostic report.",category:'technology',test:s=>s.os.diagnostics.length>=1},
  {id:"resource-consumption",name:"Enterprise-Grade Resource Consumption",description:"Consume 100,000 agent tokens with zero useful releases.",category:'technology',test:s=>s.agents.totalTokens>=100000&&s.agents.usefulRuns===0},
  {id:"agent-workflow",name:"Six Agents, Zero Deliverables",description:"Complete an agent workflow without a useful release.",category:'technology',test:s=>s.agents.totalRuns>s.agents.usefulRuns},
  {id:"hallucination",name:"Forty-Seven Undocumented Integrations",description:"Detect an agent hallucination.",category:'technology',test:s=>s.agents.hallucinations>=1},
  {id:"governance",name:"Governance Saves the Day",description:"Block a workflow through strict governance.",category:'technology',test:s=>s.agents.runs.some(r=>r.blocked)},
  {id:"ai-adoption",name:"Adoption Without an Outcome",description:"Reach 100 executive AI adoption.",category:'technology',test:s=>s.agents.adoption===100},
  {id:"avoidance",name:"Compute Avoidance Specialist",description:"Avoid 100,000 baseline tokens while offline.",category:'technology',test:s=>s.os.avoidedTokens>=100000},
  {id:"not-launched",name:"Successfully Not Launched",description:"Choose the product readiness committee instead of accepting the launch.",category:'campaign',test:s=>decision(s,'functional-product','committee')},
  {id:"incident-collector",name:"Incident Intelligence",description:"Encounter 50 different corporate incidents.",category:'campaign',test:s=>new Set(s.resolvedEvents).size>=50},
  {id:"all-incidents",name:"Comprehensive Corporate Dysfunction",description:"Encounter all 150 incidents.",category:'campaign',test:s=>new Set(s.resolvedEvents).size>=150},
  {id:"seed-funded",name:"Funded on Faith",description:"Reach campaign stage two.",category:'campaign',test:s=>s.campaign.stage>=2},
  {id:"public-listing",name:"Publicly Listed Nothingness",description:"Reach campaign stage six.",category:'campaign',test:s=>s.campaign.stage>=6},
  {id:"competent",name:"Too Competent to Remain Employed",description:"Contain the competent employee in a non-delivery role.",category:'campaign',test:s=>s.boss.phase==='contained'},
  {id:"nothing-scale",name:"Nothing at Scale",description:"Achieve final campaign certification.",category:'campaign',test:s=>s.ending==='certified'},
  {id:"ruthless",name:"Shareholder Absolutism Certified",description:"Win on ruthless difficulty.",category:'campaign',test:s=>s.ending==='certified'&&s.campaign.difficulty==='ruthless'},
  {id:"useful-failure",name:"Catastrophically Useful",description:"Lose by exceeding the actual productivity threshold.",category:'campaign',test:s=>s.ending==='useful'},
  {id:"insolvent",name:"Liquidity Transformation Complete",description:"Lose by insolvency.",category:'campaign',test:s=>s.ending==='insolvent'},
  {id:"board",name:"Board-Level Strategic Departure",description:"Lose shareholder confidence entirely.",category:'campaign',test:s=>s.ending==='board'},
  {id:"sandbox",name:"Bureaucracy Without End",description:"Reach working day 100 in sandbox mode.",category:'campaign',test:s=>s.campaign.mode==='sandbox'&&s.day>=100},
];
export const initialAchievements=():AchievementState=>({unlocked:[],actions:{},idleStreak:0,bestIdleStreak:0});
export function updateAchievements(previous:GameState,next:GameState,command:Command):AchievementState{
 const a=previous.achievements;
 const actions=command.type==='action'?{...a.actions,[command.id]:(a.actions[command.id]??0)+1}:a.actions;
 let idleStreak=a.idleStreak;
 if(command.type==='endDay')idleStreak=previous.capacity===(previous.campaign.mode==='sandbox'?2:previous.campaign.stage>=5?4:previous.campaign.stage>=3?3:2)?a.idleStreak+1:0;
 const current={...a,actions,idleStreak,bestIdleStreak:Math.max(a.bestIdleStreak,idleStreak)};
 const candidate={...next,achievements:current};
 const known=new Set(a.unlocked.map(u=>u.id));
 const unlocked=ACHIEVEMENTS.filter(d=>!known.has(d.id)&&d.test(candidate)).map(d=>({id:d.id,day:next.day}));
 return {...current,unlocked:[...a.unlocked,...unlocked]};
}
export function validAchievementUnlocks(value:unknown,day=Number.MAX_SAFE_INTEGER):value is AchievementUnlock[]{
 if(!Array.isArray(value))return false;
 const ids=new Set<string>();
 for(const u of value){
  if(!u||typeof u!=='object'||!ACHIEVEMENTS.some(a=>a.id===u.id)||ids.has(u.id)||!Number.isSafeInteger(u.day)||u.day<1||u.day>day)return false;
  ids.add(u.id);
 }
 return true;
}
export function validAchievements(value:unknown,day:number):value is AchievementState{
 if(!value||typeof value!=='object')return false;
 const a=value as AchievementState;
 const int=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
 return validAchievementUnlocks(a.unlocked,day)&&!!a.actions&&typeof a.actions==='object'&&!Array.isArray(a.actions)&&Object.entries(a.actions).every(([id,n])=>['alignment','statement','consultants','rest','bonus','audit','wellbeing'].includes(id)&&int(n))&&int(a.idleStreak)&&int(a.bestIdleStreak)&&a.bestIdleStreak>=a.idleStreak;
}
export function mergeAchievementProfile(previous:AchievementUnlock[],current:AchievementUnlock[]):AchievementUnlock[]{
 const known=new Set(previous.map(u=>u.id));
 return [...previous,...current.filter(u=>!known.has(u.id))];
}
