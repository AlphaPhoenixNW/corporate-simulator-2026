// Original, locally synthesised corporate hold music. No samples or network requests.
export const HOLD_MOTIF=[60,64,67,71,62,65,69,72,59,62,67,69,60,64,67,0] as const;
export const CUES={action:[72,76],day:[60,64,67],incident:[65,61,65],award:[67,72,76,79],shutdown:[72,67,60],ending:[60,55,48]} as const;
export type Cue=keyof typeof CUES;
export const frequency=(midi:number)=>440*2**((midi-69)/12);
export class CorporateAudio {
 private context:AudioContext|null=null;
 private gain:GainNode|null=null;
 private timer:ReturnType<typeof setInterval>|null=null;
 private position=0;
 private music=false;
 private enabled=false;
 private volume=.35;
 async activate(){
  try{
   if(!this.context){this.context=new AudioContext();this.gain=this.context.createGain();this.gain.gain.value=this.enabled?this.volume:0;this.gain.connect(this.context.destination);}
   await this.context.resume();this.syncMusic();
  }catch{/* audio is optional */}
 }
 configure(enabled:boolean,music:boolean,volume:number){
  this.enabled=enabled;this.music=music;this.volume=Math.max(0,Math.min(1,volume/100));
  if(this.gain&&this.context)this.gain.gain.setTargetAtTime(enabled?this.volume:0,this.context.currentTime,.03);
  this.syncMusic();
 }
 private note(midi:number,delay:number,duration:number,level:number,type:OscillatorType='sine'){
  const c=this.context,g=this.gain;if(!this.enabled||!c||!g||c.state!=='running'||!midi)return;
  const start=c.currentTime+delay,osc=c.createOscillator(),env=c.createGain();
  osc.type=type;osc.frequency.value=frequency(midi);env.gain.setValueAtTime(.0001,start);env.gain.exponentialRampToValueAtTime(level,start+.02);env.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(env);env.connect(g);osc.start(start);osc.stop(start+duration+.02);osc.onended=()=>{osc.disconnect();env.disconnect();};
 }
 play(cue:Cue){CUES[cue].forEach((n,i)=>this.note(n,i*.12,.24,.11,'triangle'));}
 private syncMusic(){
  if(this.timer){clearInterval(this.timer);this.timer=null;}
  if(!this.enabled||!this.music||this.context?.state!=='running')return;
  this.timer=setInterval(()=>{if(typeof document!=='undefined'&&document.hidden)return;const i=this.position++%HOLD_MOTIF.length;this.note(HOLD_MOTIF[i],0,.52,.045);if(i%4===0)this.note(HOLD_MOTIF[i]-12,0,1.6,.024,'triangle');},480);
 }
 dispose(){if(this.timer)clearInterval(this.timer);this.timer=null;if(this.context)void this.context.close().catch(()=>{});this.context=null;this.gain=null;}
}
