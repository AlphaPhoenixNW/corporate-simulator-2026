import {useEffect,useRef,useState} from 'react';
import InlineWorker from '../engine/autopilot.worker?worker&inline';
import {loadAutopilot,saveAutopilot,recordAttempt,MAX_AUTOMATED_ATTEMPTS,type AutoProfile,type AutoProgress,type AutoMode} from '../engine/autopilot';
import {runAutopilot,type AutoMessage,type AutoRequest} from '../engine/autopilotRunner';
export function useAutopilot(){
 const [profile,setProfile]=useState(loadAutopilot),[running,setRunning]=useState(false),[progress,setProgress]=useState<AutoProgress|null>(null),[notice,setNotice]=useState(''),[saved,setSaved]=useState(true);
 const current=useRef(profile),cancel=useRef<(()=>void)|null>(null),generation=useRef(0);
 const commit=(p:AutoProfile)=>{current.current=p;setProfile(p);setSaved(saveAutopilot(p));};
 const stop=()=>{generation.current++;cancel.current?.();cancel.current=null;setRunning(false);setProgress(null);};
 useEffect(()=>()=>{generation.current++;cancel.current?.();cancel.current=null;},[]);
 const launch=(goal:number,mode:AutoMode)=>{
  if(cancel.current)return;
  // Another tab may have finished work since this screen was opened.
  const stored=loadAutopilot(),p=stored.attempts>current.current.attempts?stored:current.current;
  if(p.attempts>=MAX_AUTOMATED_ATTEMPTS)return;
  const target=Math.min(MAX_AUTOMATED_ATTEMPTS,Math.max(p.attempts,goal));
  if(target<=p.attempts)return;
  const next={...p,goal:target,mode};commit(next);
  setNotice('');setRunning(true);setProgress(null);
  const token=++generation.current;
  const request:AutoRequest={start:next.attempts,goal:next.goal,mode};
  const receive=(message:AutoMessage)=>{
   if(generation.current!==token)return;
   if(message.type==='result'){
    const recorded=recordAttempt(current.current,message.result);
    if(recorded!==current.current)commit(recorded);
   }else if(message.type==='progress')setProgress(message.progress);
   else if(message.type==='done'){stop();setNotice('Mandate complete. Executive involvement remained unnecessary.');}
   else{stop();setNotice(message.message);}
  };
  try{
   const worker=new InlineWorker();
   cancel.current=()=>worker.terminate();
   worker.onmessage=(event:MessageEvent<AutoMessage>)=>receive(event.data);
   worker.onerror=()=>{if(generation.current!==token)return;worker.terminate();setNotice('Worker unavailable. Continuing with cooperative local execution.');cancel.current=runAutopilot({start:current.current.attempts,goal:current.current.goal,mode},receive);};
   worker.postMessage(request);
  }catch{
   setNotice('Worker unavailable. Continuing with cooperative local execution.');
   cancel.current=runAutopilot(request,receive);
  }
 };
 return {profile,running,progress,notice,saved,start:(amount:number,mode:AutoMode)=>launch(current.current.attempts+amount,mode),million:()=>launch(MAX_AUTOMATED_ATTEMPTS,'batch'),resume:()=>launch(current.current.goal,current.current.mode),pause:()=>{stop();setNotice('Executive absence suspended. Completed attempts retained; unfinished attempt will restart.');}};
}
