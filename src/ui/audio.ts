// Original local synthesis. The audio graph is created only from a player gesture.
export const HOLD_MOTIF=[60,64,67,71,62,65,69,72,59,62,67,69,60,64,67,0] as const;
export const CUES={action:[72,76],day:[60,64,67],incident:[65,61,65],award:[67,72,76,79],shutdown:[72,67,60],ending:[60,55,48]} as const;
export type Cue=keyof typeof CUES;
export type AudioStatus='muted'|'zero-volume'|'waiting'|'ready'|'playing'|'unavailable';
export const AUDIO_STATUS:Record<AudioStatus,string>={
 muted:'Audio muted', 'zero-volume':'Volume is set to zero',waiting:'Audio awaiting a tap to start',ready:'Sound effects active',playing:'Hold music active',unavailable:'Audio unavailable in this browser'
};
export const frequency=(midi:number)=>440*2**((midi-69)/12);
export class CorporateAudio {
 private context:AudioContext|null=null;
 private gain:GainNode|null=null;
 private timer:ReturnType<typeof setInterval>|null=null;
 private position=0;
 private music=false;
 private enabled=false;
 private volume=.35;
 private unavailable=false;
 private pending:Cue|null=null;
 private lastStatus:AudioStatus='muted';
 constructor(private onStatus:(status:AudioStatus)=>void=()=>{}){}
 get status():AudioStatus{
  if(!this.enabled)return 'muted';
  if(this.volume===0)return 'zero-volume';
  if(this.unavailable)return 'unavailable';
  if(this.context?.state!=='running')return 'waiting';
  return this.timer!==null?'playing':'ready';
 }
 private publish(){const status=this.status;if(status!==this.lastStatus){this.lastStatus=status;this.onStatus(status);}}
 async activate(){
  if(!this.enabled)return false;
  try{
   if(!this.context||this.context.state==='closed'){
    const Audio=typeof window!=='undefined'?(window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext):undefined;
    if(!Audio){this.unavailable=true;this.publish();return false;}
    const c=new Audio();
    this.context=c;this.gain=c.createGain();this.gain.gain.value=this.volume;
    this.gain.connect(c.destination);
    this.unavailable=false;
    c.onstatechange=()=>{if(this.context!==c)return;this.syncMusic();this.flushCue();this.publish();};
   }
   const c=this.context;
   // resume() must be invoked in the initiating gesture, not from a later React effect.
   if(c.state!=='running'){
    const resumed=c.resume();
    // A silent buffer starts inside the same gesture for WebKit's audio unlock path.
    const unlock=c.createBufferSource();unlock.buffer=c.createBuffer(1,1,c.sampleRate);
    unlock.connect(this.gain!);unlock.onended=()=>unlock.disconnect();unlock.start();
    this.publish();
    await resumed;
   }
   if(this.context!==c)return false;
   this.syncMusic();this.flushCue();this.publish();
   return c.state==='running';
  }catch{if(!this.context)this.unavailable=true;this.publish();return false;}
 }
 configure(enabled:boolean,music:boolean,volume:number){
  this.enabled=enabled;this.music=music;this.volume=Math.max(0,Math.min(1,volume/100));
  if(!enabled||this.volume===0)this.pending=null;
  if(this.gain&&this.context&&this.context.state!=='closed')this.gain.gain.setTargetAtTime(enabled?this.volume:0,this.context.currentTime,.025);
  this.syncMusic();this.publish();
 }
 private note(midi:number,delay:number,duration:number,level:number,type:OscillatorType='sine'){
  const c=this.context,g=this.gain;if(!this.enabled||!this.volume||!c||!g||c.state!=='running'||!midi)return;
  const start=c.currentTime+delay,osc=c.createOscillator(),env=c.createGain();
  osc.type=type;osc.frequency.value=frequency(midi);env.gain.setValueAtTime(.0001,start);env.gain.exponentialRampToValueAtTime(level,start+.018);env.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(env);env.connect(g);osc.start(start);osc.stop(start+duration+.02);osc.onended=()=>{osc.disconnect();env.disconnect();};
 }
 private flushCue(){if(this.pending&&this.enabled&&this.context?.state==='running'){const cue=this.pending;this.pending=null;this.play(cue);}}
 play(cue:Cue){
  if(!this.enabled||!this.volume)return;
  if(this.context?.state!=='running'){this.pending=cue;return;}
  CUES[cue].forEach((n,i)=>this.note(n,i*.12,.30,.20,'triangle'));
 }
 private tick(){
  if(typeof document!=='undefined'&&document.hidden)return;
  const i=this.position++%HOLD_MOTIF.length;
  this.note(HOLD_MOTIF[i],0,.54,.14,'triangle');
  if(i%4===0){this.note(HOLD_MOTIF[i]-12,0,1.55,.065);this.note(HOLD_MOTIF[i]+7,.02,1.2,.025);}
 }
 private syncMusic(){
  const shouldPlay=this.enabled&&this.volume>0&&this.music&&this.context?.state==='running';
  if(!shouldPlay){if(this.timer!==null){clearInterval(this.timer);this.timer=null;}return;}
  if(this.timer!==null)return;
  this.tick();this.timer=setInterval(()=>this.tick(),480);
 }
 dispose(){
  if(this.timer!==null)clearInterval(this.timer);this.timer=null;this.pending=null;
  const c=this.context;this.context=null;this.gain=null;
  if(c){c.onstatechange=null;if(c.state!=='closed')void c.close().catch(()=>{});}
 }
}
