import {test,expect} from '@playwright/test';
import {openSettings} from '../support/enterGame';
test('starts real audio from a player gesture, produces a signal, mutes and resumes after reload',async({page})=>{
 await page.addInitScript(()=>{
  // Observe the actual master gain, not a stubbed player or saved preference.
  const Audio=window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Audio)return;
  const original=Audio.prototype.createGain;
  const analysers:AnalyserNode[]=[];
  Audio.prototype.createGain=function(this:AudioContext){
   const gain=original.call(this);
   if(analysers.length<3){const analyser=this.createAnalyser();analyser.fftSize=1024;gain.connect(analyser);analysers.push(analyser);}
   return gain;
  };
  Object.defineProperty(window,'__nothingAudioLevel',{value:(channel=0)=>{
   const analyser=analysers[channel];if(!analyser)return 0;
   const samples=new Uint8Array(analyser.fftSize);
   analyser.getByteTimeDomainData(samples);
   return Math.sqrt(samples.reduce((sum,x)=>sum+((x-128)/128)**2,0)/samples.length);
  }});
 });
 const signal=(channel=0)=>page.evaluate(i=>(window as Window & {__nothingAudioLevel?:(channel:number)=>number}).__nothingAudioLevel?.(i)??0,channel);
 await page.goto('/');
 const status=page.getByTestId('audio-status');
 await expect(status).toHaveText('Audio muted');
 await page.getByRole('button',{name:'Enable sound & music'}).click();
 await expect(status).toHaveText('Hold music active');
 await expect.poll(signal,{timeout:8000}).toBeGreaterThan(.002);
 await page.getByRole('button',{name:'Play now',exact:true}).click();
 await expect(status).toHaveText('Hold music active');
 await expect.poll(signal,{timeout:8000}).toBeGreaterThan(.002);
 await openSettings(page);
 await page.getByText('Audio settings',{exact:true}).click();
 await page.getByLabel('Reward and action sounds',{exact:true}).uncheck();
 await expect(page.getByRole('button',{name:'Test sound',exact:true})).toBeDisabled();
 await expect(status).toHaveText('Hold music active');
 await expect.poll(()=>signal(1),{timeout:8000}).toBeGreaterThan(.002);
 await page.getByRole('button',{name:/Practise bed-led leadership/}).click();
 await expect.poll(()=>signal(2),{timeout:1000}).toBeLessThan(.001);
 await expect.poll(()=>signal(1),{timeout:8000}).toBeGreaterThan(.002);
 await page.getByLabel('Reward and action sounds',{exact:true}).check();
 await page.getByLabel('Corporate hold music',{exact:true}).uncheck();
 await expect(status).toHaveText('Sound effects active');
 // Sustained pads must fade promptly on music-off, then the reward cue plays alone.
 await expect.poll(signal,{timeout:5000}).toBeLessThan(.001);
 await page.getByRole('button',{name:'Test sound',exact:true}).click();
 await expect.poll(()=>signal(2),{timeout:3000,intervals:[10,20,40,60]}).toBeGreaterThan(.002);
 await expect.poll(()=>signal(1),{timeout:5000}).toBeLessThan(.001);
 await page.getByRole('button',{name:'Mute audio',exact:true}).click();
 await expect(status).toHaveText('Audio muted');
 await expect.poll(signal,{timeout:5000}).toBeLessThan(.001);
 await page.getByRole('button',{name:'Enable sound & music'}).click();
 await expect(status).toHaveText('Hold music active');
 await page.reload();
 await expect(status).toHaveText('Audio awaiting a tap to start');
 await page.getByRole('button',{name:'Start audio',exact:true}).click();
 await expect(status).toHaveText('Hold music active');
 await expect(page.getByRole('button',{name:'Mute audio',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nothing-sim:experience')??'{}').audio)).toBe(true);
 await expect.poll(signal,{timeout:8000}).toBeGreaterThan(.002);
 await expect(page.getByTestId('day')).toHaveText('001');
 await expect(page.locator('.compact-kpis')).toContainText('1/2');
 // An interrupted or newly loaded player can explicitly mute without unlocking audio.
 await page.reload();
 await expect(status).toHaveText('Audio awaiting a tap to start');
 await page.getByRole('button',{name:'Mute audio',exact:true}).click();
 await expect(status).toHaveText('Audio muted');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nothing-sim:experience')??'{}').audio)).toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
