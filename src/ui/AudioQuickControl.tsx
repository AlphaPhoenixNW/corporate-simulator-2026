import {AUDIO_STATUS,type AudioStatus} from './audio';
export function AudioQuickControl({enabled,status,onToggle,onTest}:{enabled:boolean;status:AudioStatus;onToggle:()=>void;onTest:()=>void}){
 return <section className="quick-audio" aria-label="Executive audio">
  <div className="quick-audio-buttons"><button className="secondary" onClick={onToggle}>{!enabled?'Enable sound & music':status==='waiting'||status==='unavailable'?'Start audio':'Mute audio'}</button>{enabled&&<button className="secondary" onClick={onTest}>Test sound</button>}</div>
  <span role="status" data-testid="audio-status">{AUDIO_STATUS[status]}</span>
 </section>;
}
