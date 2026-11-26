import type {Command,GameState,AchievementUnlock} from '../engine/types';
import {decodeSave,loadHighestStage,loadAchievementProfile} from '../storage';
import {validAchievementUnlocks,mergeAchievementProfile} from '../engine/achievements';
export const SESSION_KEY='nothing-sim:playing';
export function sessionPlaying(){try{return sessionStorage.getItem(SESSION_KEY)==='yes';}catch{return false;}}
export function setSessionPlaying(value:boolean){try{sessionStorage.setItem(SESSION_KEY,value?'yes':'no');}catch{/* optional session preference */}}
export const TUTORIAL_STEPS=[
 {title:'Establish the narrative',detail:'Issue a strategic announcement to increase shareholder confidence and perceived productivity. This consumes one executive action.',target:'decisions'},
 {title:'Avoid measurable delivery',detail:'Schedule an alignment workshop. It raises perceived productivity while reducing actual productivity.',target:'decisions'},
 {title:'Reconcile the working day',detail:'Conclude the working day. Revenue, salaries, operating costs and departmental activity are settled automatically.',target:'decisions'},
 {title:'Handle corporate escalation',detail:'Choose a response to the pending corporate incident. Choices have consequences, some delayed.',target:'pending-decision'},
 {title:'Monetise hypothetical savings',detail:'In Corporate finance, acquire customers to establish recurring revenue. Customers also incur servicing costs.',target:'finance'},
 {title:'Review your mandate',detail:'Inspect Campaign progression to see the requirements for the next stage. Keep actual productivity below the failure threshold, cash positive and shareholder confidence above zero.',target:'campaign'}
] as const;
export function tutorialAdvance(step:number,before:GameState,after:GameState,command:Command){
 if(before===after)return step;
 if(step===0&&command.type==='action'&&command.id==='statement')return 1;
 if(step===1&&command.type==='action'&&command.id==='alignment')return 2;
 if(step===2&&command.type==='endDay')return after.pendingEvent?3:4;
 if(step===3&&command.type==='choose'&&!after.pendingEvent)return 4;
 if(step===4&&command.type==='finance'&&command.operation==='acquire-customers')return 5;
 return step;
}
export interface Backup {format:'nothing-sim-backup';version:1;game:GameState;highestStage:number;achievements:AchievementUnlock[]}
export function createBackup(game:GameState,highestStage=loadHighestStage(),achievements=loadAchievementProfile()):Backup{
 return {format:'nothing-sim-backup',version:1,game,highestStage:Math.max(highestStage,game.campaign.stage),achievements:mergeAchievementProfile(achievements,game.achievements.unlocked)};
}
export const MAX_BACKUP_BYTES=10*1024*1024;
export function decodeBackup(raw:string):Backup|null{
 try{
  if(raw.length>MAX_BACKUP_BYTES)return null;
  const value=JSON.parse(raw);
  if(!value||typeof value!=='object')return null;
  if(value.format!=='nothing-sim-backup'){
   const game=decodeSave(raw);
   return game?createBackup(game,game.campaign.stage,[]):null;
  }
  if(value.version!==1||!Number.isInteger(value.highestStage)||value.highestStage<1||value.highestStage>7||!validAchievementUnlocks(value.achievements))return null;
  const game=decodeSave(JSON.stringify(value.game));
  return game?createBackup(game,value.highestStage,value.achievements):null;
 }catch{return null;}
}
export function downloadBackup(game:GameState){
 const data=JSON.stringify(createBackup(game),null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='NOTHING-save-seed-'+game.seed+'-day-'+game.day+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
