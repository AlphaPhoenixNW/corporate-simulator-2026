import {runAutopilot,type AutoRequest} from './autopilotRunner';
const worker=self as unknown as {onmessage:((event:MessageEvent<AutoRequest>)=>void)|null;postMessage:(value:unknown)=>void};
let stop:(()=>void)|undefined;
worker.onmessage=event=>{stop?.();stop=runAutopilot(event.data,message=>worker.postMessage(message));};
