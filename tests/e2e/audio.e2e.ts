import {test,expect} from '@playwright/test';
import {openSettings} from '../support/enterGame';
test('starts real audio from a player gesture, produces a signal, mutes and resumes after reload',async({page})=>{
 await page.addInitScript(()=>{
  // Observe the actual master gain, not a stubbed player or saved preference.
  const Audio=window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Audio)return;
  const original=Audio.prototype.createGain;
  let analyser:AnalyserNode|null=null;
  Audio.prototype.createGain=function(this:AudioContext){
   const gain=original.call(this);
   if(!analyser){analyser=this.createAnalyser();analyser.fftSize=1024;gain.connect(analyser);}
   return gain;
  };
  Object.defineProperty(window,'__nothingAudioLevel',{value:()=>{
   if(!analyser)return 0;
   const samples=new Uint8Array(analyser.fftSize);
   analyser.getByteTimeDomainData(samples);
   return Math.sqrt(samples.reduce((sum,x)=>sum+((x-128)/128)**2,0)/samples.length);
  }});
 });
 const signal=()=>page.evaluate(()=>(window as Window & {__nothingAudioLevel?:()=>number}).__nothingAudioLevel?.()??0);
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
 await page.getByLabel('Corporate hold music',{exact:true}).uncheck();
 await expect(status).toHaveText('Sound effects active');
 // Wait for the last scheduled backing note to decay, then test the cue alone.
 await expect.poll(signal,{timeout:5000}).toBeLessThan(.001);
 await page.getByRole('button',{name:'Test sound',exact:true}).click();
 await expect.poll(signal,{timeout:3000,intervals:[10,20,40,60]}).toBeGreaterThan(.002);
 await page.getByRole('button',{name:'Mute audio',exact:true}).click();
 await expect(status).toHaveText('Audio muted');
 await expect.poll(signal,{timeout:5000}).toBeLessThan(.001);
 await page.getByRole('button',{name:'Enable sound & music'}).click();
 await expect(status).toHaveText('Hold music active');
 await page.reload();
 await expect(status).toHaveText('Audio awaiting a tap to start');
 await page.getByRole('button',{name:'Start audio',exact:true}).click();
 await expect(status).toHaveText('Hold music active');
 await expect.poll(signal,{timeout:8000}).toBeGreaterThan(.002);
 await expect(page.getByTestId('day')).toHaveText('001');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
