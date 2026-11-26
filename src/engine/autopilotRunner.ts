import {createAttempt,stepAttempt,progress,type AutoMode,type AutoProgress,type AutoResult} from './autopilot';
export type AutoRequest={start:number;goal:number;mode:AutoMode};
export type AutoMessage={type:'progress';progress:AutoProgress}|{type:'result';result:AutoResult}|{type:'done'}|{type:'error';message:string};
// Cooperative time slices work both in the worker and in a portable-file fallback.
// Only settled attempts are sent to the persistent profile, never optimistic counts.
export function runAutopilot(request:AutoRequest,emit:(message:AutoMessage)=>void):()=>void{
 let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,index=request.start,a=createAttempt(index);
 const schedule=(delay:number)=>{if(!stopped)timer=setTimeout(tick,delay);};
 const tick=()=>{
  if(stopped)return;
  try{
   const deadline=performance.now()+25;
   do{
    a=stepAttempt(a);
    if(a.done){
     emit({type:'result',result:a.done});index++;
     if(stopped)return;
     if(index>=request.goal){emit({type:'done'});return;}
     a=createAttempt(index);
    }
    if(request.mode==='watch'){emit({type:'progress',progress:progress(a)});schedule(180);return;}
   }while(!stopped&&performance.now()<deadline);
   if(!stopped){emit({type:'progress',progress:progress(a)});schedule(0);}
  }catch{emit({type:'error',message:'Autonomous operations paused after a strategy or engine error. Completed attempts retained.'});}
 };
 if(index>=request.goal){schedule(0);}else schedule(0);
 return ()=>{stopped=true;if(timer!==undefined)clearTimeout(timer);};
}
