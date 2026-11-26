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
export interface Choice { id: string; label: string; detail: string; effect: Delta; delayed?: { days: number; effect: Delta; message: string } }
export interface CorporateEvent { id: string; title: string; description: string; choices: Choice[]; department?: DepartmentId }
export interface Action { id: string; label: string; detail: string; cost: number; effect: Delta }
export interface LedgerEntry { day: number; label: string; amount: number }
export interface ScheduledEffect { day: number; effect: Delta; message: string }
export interface GameState {
  version: 3; departments: DepartmentState[]; employees: Employee[]; relationships: Relationship[]; nextEmployeeId: number; seed: number; rng: number; day: number; cash: number;
  metrics: Metrics; capacity: number; compensation: number;
  pendingEvent: string | null; resolvedEvents: string[];
  scheduled: ScheduledEffect[]; log: string[]; ledger: LedgerEntry[];
  ending: 'insolvent' | 'useful' | 'board' | null;
}
export type Command = EmployeeCommand | DepartmentCommand | { type: 'action'; id: string } | { type: 'choose'; id: string } | { type: 'endDay' };
