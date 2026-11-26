import {useEffect,useState} from 'react';
interface InstallEvent extends Event{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
export function InstallControl(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(()=>typeof matchMedia==='function'&&matchMedia('(display-mode: standalone)').matches),[help,setHelp]=useState(false);
 useEffect(()=>{const before=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent);};const done=()=>{setInstalled(true);setPrompt(null);};window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);};},[]);
 if(location.protocol==='file:')return <p className="launch-hint">Portable edition · opens without installation.</p>;
 return <div className="install-control">{installed?<p className="launch-hint">App installed</p>:<button className="secondary" onClick={async()=>{if(!prompt){setHelp(v=>!v);return;}try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='accepted')setInstalled(true);}catch{setHelp(true);}finally{setPrompt(null);}}}>Install game</button>}
 {help&&<p className="launch-hint">On iPhone or iPad, open in Safari, tap Share, then Add to Home Screen. On other supported browsers, use the browser menu and choose Install app or Add to Home Screen. Availability varies by browser. Once the hosted game finishes caching, it can open offline.</p>}</div>;
}
