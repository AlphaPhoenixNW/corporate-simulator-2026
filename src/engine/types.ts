export const METRIC_KEYS = [
  'confidence','prestige','morale','bureaucracy','perceived','actual',
  'buzzwords','meetings','regulation','incompetence'
] as const;
export type Metric = typeof METRIC_KEYS[number];
export type Metrics = Record<Metric, number>;
export type Delta = Partial<Metrics> & { cash?: number; compensation?: number };
export interface Choice { id: string; label: string; detail: string; effect: Delta; delayed?: { days: number; effect: Delta; message: string } }
export interface CorporateEvent { id: string; title: string; description: string; choices: Choice[] }
export interface Action { id: string; label: string; detail: string; cost: number; effect: Delta }
export interface LedgerEntry { day: number; label: string; amount: number }
export interface ScheduledEffect { day: number; effect: Delta; message: string }
export interface GameState {
  version: 1; seed: number; rng: number; day: number; cash: number;
  metrics: Metrics; capacity: number; compensation: number;
  pendingEvent: string | null; resolvedEvents: string[];
  scheduled: ScheduledEffect[]; log: string[]; ledger: LedgerEntry[];
  ending: 'insolvent' | 'useful' | 'board' | null;
}
export type Command = { type: 'action'; id: string } | { type: 'choose'; id: string } | { type: 'endDay' };
