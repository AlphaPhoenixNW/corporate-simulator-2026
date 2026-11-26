import {AUDIO_STATUS,type AudioStatus} from './audio';
export function AudioQuickControl({enabled,effects,status,onToggle,onTest}:{enabled:boolean;effects:boolean;status:AudioStatus;onToggle:(intent:'enable'|'resume'|'mute')=>void;onTest:()=>void}){
 const intent=!enabled?'enable':status==='waiting'||status==='unavailable'?'resume':'mute';
 return <section className="quick-audio" aria-label="Executive audio">
  <div className="quick-audio-buttons"><button className="secondary" onClick={()=>onToggle(intent)}>{intent==='enable'?'Enable sound & music':intent==='resume'?'Start audio':'Mute audio'}</button>{enabled&&<button className="secondary" disabled={!effects} onClick={onTest}>Test sound</button>}{intent==='resume'&&<button className="secondary" onClick={()=>onToggle('mute')}>Mute audio</button>}</div>
  <span role="status" data-testid="audio-status">{AUDIO_STATUS[status]}</span>
 </section>;
}
