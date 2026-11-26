export const METRIC_KEYS = [
  'confidence','prestige','morale','bureaucracy','perceived','actual',
  'buzzwords','meetings','regulation','incompetence'
] as const;
export type Metric = typeof METRIC_KEYS[number];
export type Metrics = Record<Metric, number>;
export type Delta = Partial<Metrics> & { cash?: number; compensation?: number };
export const DEPARTMENT_IDS = ['hr','finance','engineering','marketing','sales','legal','strategy','digital','ai','executive'] as const;
export type DepartmentId = typeof DEPARTMENT_IDS[number];
export type DepartmentFocus = 'governance' | 'operations';
export interface DepartmentState {
  id: DepartmentId; active: boolean; budget: number; headcount: number;
  morale: number; competence: number; influence: number; progress: number;
  focus: DepartmentFocus; spent: number; request: boolean; report: string;
}
export type DepartmentCommand = { type: 'department'; id: DepartmentId; operation: 'activate' | 'increase' | 'decrease' | 'hire' | 'reduce' | 'focus' };
export const ARCHETYPES = ['engineer','thought-leader','consultant','meeting-enthusiast','agile-evangelist','survivor','veteran','innovator','nepotism','ai-specialist'] as const;
export type Archetype = typeof ARCHETYPES[number];
export type EmployeeStatus = 'active' | 'resigned' | 'redundant';
export interface Employee {
  id: number; name: string; department: DepartmentId; archetype: Archetype;
  skill: number; ambition: number; morale: number; politics: number; salary: number;
  level: number; joined: number; status: EmployeeStatus; departed: number | null;
  promotionRequested: boolean; complaints: number; warnings: number; reviews: number;
  usefulWork: number; lastReview: string; report: string;
}
export interface Relationship { a: number; b: number; affinity: number }
export type EmployeeCommand = {type:'employee'; id:number; operation:'review'|'promote'|'discipline'|'redundancy'|'reassign'; target?:DepartmentId};
export const MEETING_TYPES = ['standup','steering','alignment','prealignment','retro','emergency','scheduling','frequency-audit'] as const;
export type MeetingType = typeof MEETING_TYPES[number];
export interface Meeting {
  id:number; type:MeetingType; day:number; attendees:number[]; duration:number;
  status:'scheduled'|'held'|'cancelled'; parentId:number|null; depth:number;
  actualAttendees:number[]; personMinutes:number; cost:number; outcome:string; document:string;
}
export type MeetingCommand = {type:'meeting'; operation:'schedule'; meetingType:MeetingType; attendees:number[]; day:number} | {type:'meeting'; operation:'cancel'; id:number};
export const COMMUNICATION_TYPES = ['email','announcement','newsletter','press-release','shareholder','performance-review','consultancy','social','apology','transformation'] as const;
export type CommunicationType = typeof COMMUNICATION_TYPES[number];
export interface SocialComment {authorId:number|null; text:string}
export interface Communication {
  id:number; day:number; type:CommunicationType; authorId:number|null; author:string; subject:string; body:string;
  impressions:number; reactions:number; comments:SocialComment[]; congratulated:boolean;
  viral:boolean; scandal:'none'|'open'|'resolved'; relatedId:number|null;
}
export type CommunicationCommand = {type:'communication';operation:'publish';format:CommunicationType} | {type:'communication';operation:'congratulate'|'respond';id:number};
export const PROGRAMME_TYPES=['salesforce','cloud','quantum','agile','agentic','transformation','non-intervention','bed-led','os-migration'] as const;
export type ProgrammeType=typeof PROGRAMME_TYPES[number];
export interface Programme {
  type:ProgrammeType; startDay:number; status:'active'|'review'|'paused'|'complete'|'cancelled';
  budget:number; spent:number; consultancy:number; milestone:number; progress:number; target:number;
  scopeCreep:number; incidents:number; committeeId:number|null; leadId:number; history:string[];
}
export type ProgrammeCommand={type:'programme';operation:'commission'|'replace-lead';programme:ProgrammeType;leadId:number}|
  {type:'programme';operation:'topup'|'committee'|'approve'|'pause'|'resume'|'cancel';programme:ProgrammeType};
export const ACQUISITION_IDS=['deckworks','nullcloud','synergy-labs'] as const;
export type AcquisitionId=typeof ACQUISITION_IDS[number];
export type SavingsPlan='conservative'|'standard'|'aggressive';
export type CashCategory='revenue'|'expense'|'financing'|'investing';
export interface CashTotals {revenue:number;expenses:number;financing:number;investing:number}
export interface FinancialPeriod extends CashTotals {
  startDay:number;endDay:number;openingCash:number;closingCash:number;profit:number;debt:number;sharePrice:number;subscribers:number;
}
export interface MarketPoint {day:number;price:number;sentiment:number;cash:number}
export interface FinanceState {
  debt:number;subscribers:number;plan:SavingsPlan;acquisitions:AcquisitionId[];
  sentiment:number;sharePrice:number;market:MarketPoint[];
  trackedFromDay:number;periodStart:number;openingCash:number;period:CashTotals;lifetime:CashTotals;
  reports:FinancialPeriod[];lastInvoice:number;lastSubscription:number;lastInterest:number;lastChurn:number;
}
export type FinanceCommand={type:'finance';operation:'borrow'|'repay'|'acquire-customers'}|
  {type:'finance';operation:'pricing';plan:SavingsPlan}|
  {type:'finance';operation:'acquire';target:AcquisitionId};
export type OSProfile='efficiency'|'enterprise'|'maximum';
export interface OSDiagnostic {day:number; tokens:number; processes:number; exposure:number; findings:string[]}
export interface OSState {
  power:'offline'|'online'; profile:OSProfile; licence:'unissued'|'active'|'expired';
  boots:number; shutdowns:number; licenceSpend:number; totalTokens:number; lastTokens:number;
  totalInferenceCost:number; avoidedTokens:number; zeroTokenShutdowns:number;
  diagnostics:OSDiagnostic[]; history:string[];
}
export type OSCommand={type:'os';operation:'boot'|'shutdown'|'diagnose'|'compliance-review'}|{type:'os';operation:'profile';profile:OSProfile};
export const AGENT_ROLES=['planner','executor','critic','governance','supervisor','non-intervention'] as const;
export type AgentRole=typeof AGENT_ROLES[number];
export type AgentModel='compact'|'enterprise'|'reasoning';
export type AgentObjective='alignment'|'savings'|'transformation';
export interface AgentStep {role:AgentRole; tokens:number; input:string; output:string; status:'completed'|'blocked'}
export interface AgentRun {id:number;day:number;model:AgentModel;objective:AgentObjective;steps:AgentStep[];tokens:number;cost:number;hallucination:boolean;useful:boolean;blocked:boolean;report:string}
export interface AgentState {enabled:boolean;model:AgentModel;objective:AgentObjective;governance:'strict'|'permissive';budget:number;adoption:number;nextId:number;runs:AgentRun[];totalRuns:number;totalTokens:number;totalCost:number;hallucinations:number;usefulRuns:number;lastTokens:number;lastStatus:string}
export type AgentCommand={type:'agent';operation:'toggle'|'promote-adoption'|'governance'}|{type:'agent';operation:'model';model:AgentModel}|{type:'agent';operation:'objective';objective:AgentObjective}|{type:'agent';operation:'budget';budget:number};
export interface Choice { id: string; label: string; detail: string; effect: Delta; delayed?: { days: number; effect: Delta; message: string } }
export const INCIDENT_CATEGORIES=['people','engineering','finance','sales','compliance','marketing','meetings','transformation','executive','os','agents','strategy','general'] as const;
export type IncidentCategory=typeof INCIDENT_CATEGORIES[number];
export type IncidentSystem='staff'|'customers'|'exposure'|'social'|'meetings'|'programmes'|'os'|'agents';
export interface IncidentTrigger {minDay?:number;system?:IncidentSystem;after?:{eventId:string;choiceId:string;days:number}}
export interface IncidentDecision {eventId:string;choiceId:string;day:number}
export interface CorporateEvent { id: string; title: string; description: string; choices: Choice[]; department?: DepartmentId;category?:IncidentCategory;trigger?:IncidentTrigger }
export interface Action { id: string; label: string; detail: string; cost: number; effect: Delta }
export interface LedgerEntry { day: number; label: string; amount: number; category?:CashCategory }
export interface ScheduledEffect { day: number; effect: Delta; message: string }
export type Difficulty='relaxed'|'standard'|'ruthless';
export type GameMode='campaign'|'sandbox';
export type Scenario='founder'|'board-crisis'|'compliance-crisis';
export interface CampaignState {mode:GameMode;difficulty:Difficulty;scenario:Scenario;stage:number;enteredDay:number;history:{stage:number;day:number}[]}
export interface GameOptions {mode?:GameMode;difficulty?:Difficulty;scenario?:Scenario}
export type CampaignCommand={type:'campaign';operation:'advance'|'certify'};
export interface GameState {
  version: 11; campaign:CampaignState; incidentHistory:IncidentDecision[]; agents:AgentState; os:OSState; finance:FinanceState; programmes: Programme[]; communications: Communication[]; nextCommunicationId:number; meetings: Meeting[]; nextMeetingId:number; departments: DepartmentState[]; employees: Employee[]; relationships: Relationship[]; nextEmployeeId: number; seed: number; rng: number; day: number; cash: number;
  metrics: Metrics; capacity: number; compensation: number;
  pendingEvent: string | null; resolvedEvents: string[];
  scheduled: ScheduledEffect[]; log: string[]; ledger: LedgerEntry[];
  ending: 'insolvent' | 'useful' | 'board' | 'certified' | null;
}
export type Command = CampaignCommand | AgentCommand | OSCommand | FinanceCommand | ProgrammeCommand | CommunicationCommand | MeetingCommand | EmployeeCommand | DepartmentCommand | { type: 'action'; id: string } | { type: 'choose'; id: string } | { type: 'endDay' };
