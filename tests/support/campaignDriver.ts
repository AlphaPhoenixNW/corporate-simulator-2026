import {newGame,dispatch} from '../../src/engine/simulation';
import type {Command,GameState,GameOptions} from '../../src/engine/types';
import {decodeSave} from '../../src/storage';
import {nextCommand} from '../../src/engine/autopilotStrategy';
export {nextCommand,chooseIncident} from '../../src/engine/autopilotStrategy';
export interface Playthrough {state:GameState;commands:Command[];maxActual:number;minCash:number;stageDays:number[]}
export function playthrough(seed:number,options:GameOptions={},limit=180):Playthrough{
 let state=newGame(seed,options),maxActual=state.metrics.actual,minCash=state.cash;
 const commands:Command[]=[];
 for(let i=0;i<limit*8&&!state.ending&&state.day<=limit;i++){
  const command=nextCommand(state),next=dispatch(state,command);
  if(next===state)throw Error('Rejected strategy command '+JSON.stringify(command)+' on day '+state.day+' stage '+state.campaign.stage+' '+state.log.slice(0,3).join(' / '));
  commands.push(command);state=next;maxActual=Math.max(maxActual,state.metrics.actual);minCash=Math.min(minCash,state.cash);
  if(command.type==='endDay'){
   const decoded=decodeSave(JSON.stringify(state));
   if(!decoded)throw Error('Save round-trip rejected on day '+state.day+' stage '+state.campaign.stage);
   state=decoded;
  }
 }
 return {state,commands,maxActual,minCash,stageDays:state.campaign.history.map(h=>h.day)};
}
export function summarize(run:Playthrough){
 const s=run.state;return {seed:s.seed,difficulty:s.campaign.difficulty,day:s.day,stage:s.campaign.stage,ending:s.ending,stageDays:run.stageDays,subscribers:s.finance.subscribers,compensation:s.compensation,metrics:s.metrics,cash:s.cash,programmes:s.programmes.map(p=>({type:p.type,status:p.status,milestone:p.milestone,spent:p.spent})),boss:s.boss.phase,awards:s.achievements.unlocked.length,commands:run.commands.length,maxActual:run.maxActual,minCash:run.minCash};
}
