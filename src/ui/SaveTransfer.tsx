import {useState} from 'react';
import type {GameState} from '../engine/types';
import {decodeBackup,downloadBackup,MAX_BACKUP_BYTES,type Backup} from './onboarding';
export function SaveTransfer({game,onImport}:{game:GameState|null;onImport:(backup:Backup)=>void}){
 const [candidate,setCandidate]=useState<Backup|null>(null),[error,setError]=useState(''),[status,setStatus]=useState('');
 return <section className="save-transfer" aria-label="Saved game transfer">
 <h3>Saved game transfer</h3><p>Back up your company or move it to another browser. Files remain on your device.</p>
 <div className="controls">{game&&<button className="secondary" onClick={()=>{try{downloadBackup(game);setStatus('Backup created.');setError('');}catch{setError('Unable to export the save.');}}}>Export saved game</button>}
 <label className="file-control">Import saved game<input aria-label="Import saved game" type="file" accept=".json,application/json" onChange={async e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';setCandidate(null);setError('');setStatus('');if(!file)return;if(file.size>MAX_BACKUP_BYTES){setError('Save file exceeds the 10 MB limit.');return;}try{const b=decodeBackup(await file.text());if(b)setCandidate(b);else setError('This file is not a valid or supported NOTHING™ save.');}catch{setError('The selected file could not be read.');}}}/></label></div>
 {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
 {candidate&&<div className="import-preview" role="region" aria-label="Import confirmation"><p><strong>Seed {candidate.game.seed} · Working day {candidate.game.day}</strong></p><p>Importing replaces the current simulation. Lifetime recognition and unlocked scenarios are merged.</p><div className="controls"><button onClick={()=>{onImport(candidate);setCandidate(null);setStatus('Saved game imported.');}}>Confirm import</button><button className="secondary" onClick={()=>setCandidate(null)}>Cancel import</button></div></div>}
 </section>;
}
