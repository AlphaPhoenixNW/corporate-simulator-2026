import type {Preferences} from './experience';
export function AudioSettings({preferences:p,onChange}:{preferences:Preferences;onChange:(patch:Partial<Preferences>)=>void}){
 return <details className="audio-settings"><summary>Audio settings</summary>
 <label><input type="checkbox" checked={p.audio} onChange={e=>onChange({audio:e.target.checked})}/> Sound enabled</label>
 <label><input type="checkbox" checked={p.music} onChange={e=>onChange({music:e.target.checked,...(e.target.checked?{audio:true}:{})})}/> Corporate hold music</label>
 <label htmlFor="sound-volume">Music volume · {p.volume}%</label><input id="sound-volume" type="range" min={0} max={100} value={p.volume} onChange={e=>onChange({volume:Number(e.target.value)})}/>
 <label><input type="checkbox" checked={p.effects} onChange={e=>onChange({effects:e.target.checked,...(e.target.checked?{audio:true}:{})})}/> Reward and action sounds</label>
 <label htmlFor="effects-volume">Effects volume · {p.effectsVolume}%</label><input id="effects-volume" type="range" min={0} max={100} value={p.effectsVolume} onChange={e=>onChange({effectsVolume:Number(e.target.value)})}/>
 </details>;
}
