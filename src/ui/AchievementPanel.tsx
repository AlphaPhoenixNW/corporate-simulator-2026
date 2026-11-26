import {useEffect,useRef,useState} from 'react';
import {ACHIEVEMENTS,ACHIEVEMENT_CATEGORIES,CATEGORY_LABELS,mergeAchievementProfile} from '../engine/achievements';
import {loadAchievementProfile,saveAchievementProfile} from '../storage';
import type {GameState,AchievementUnlock} from '../engine/types';
export function AchievementPanel({state}:{state:GameState}){
 const unlocks=state.achievements.unlocked;
 const [profile,setProfile]=useState(()=>mergeAchievementProfile(loadAchievementProfile(),unlocks));
 const previous=useRef(unlocks);
 const [notice,setNotice]=useState<AchievementUnlock[]>([]);
 const [category,setCategory]=useState('all');
 const [filter,setFilter]=useState('all');
 useEffect(()=>{
  const old=new Set(previous.current.map(u=>u.id));
  const added=unlocks.filter(u=>!old.has(u.id));
  previous.current=unlocks;
  if(added.length)setNotice(added);
  else if(!unlocks.length)setNotice([]);
  setProfile(saveAchievementProfile(unlocks));
 },[unlocks]);
 const earned=new Map(profile.map(u=>[u.id,u])),current=new Map(unlocks.map(u=>[u.id,u]));
 const visible=ACHIEVEMENTS.filter(a=>(category==='all'||a.category===category)&&(filter==='all'||(filter==='earned'?earned.has(a.id):!earned.has(a.id))));
 return <section className="panel departments" id="achievements" aria-labelledby="achievement-heading">
 <p className="eyebrow">STRATEGIC RECOGNITION DIRECTORATE</p><h2 id="achievement-heading">Achievement framework</h2>
 <div className="department-summary"><div><span>Lifetime awards</span><strong data-testid="achievement-lifetime">{profile.length}/{ACHIEVEMENTS.length}</strong></div><div><span>This simulation</span><strong data-testid="achievement-current">{unlocks.length}/{ACHIEVEMENTS.length}</strong></div><div><span>Categories</span><strong>{ACHIEVEMENT_CATEGORIES.length}</strong></div><div><span>Best executive inactivity streak</span><strong>{state.achievements.bestIdleStreak} days</strong></div></div>
 <p className="hint">Awards are evaluated after valid executive actions and working-day settlement. Lifetime recognition is saved locally and survives replacing a simulation. No reward changes the corporate metrics.</p>
 {notice.length>0&&<aside className="achievement-notice" aria-live="polite" aria-label="Newly unlocked achievements"><div><p className="eyebrow">STRATEGIC RECOGNITION AUTHORISED</p><strong>{notice.length===1?'Achievement unlocked':notice.length+' achievements unlocked'}</strong><ul>{notice.map(u=><li key={u.id}>{ACHIEVEMENTS.find(a=>a.id===u.id)?.name}</li>)}</ul></div><button className="secondary" onClick={()=>setNotice([])}>Dismiss recognition</button></aside>}
 <div className="achievement-progress">{ACHIEVEMENT_CATEGORIES.map(c=>{const list=ACHIEVEMENTS.filter(a=>a.category===c),count=list.filter(a=>earned.has(a.id)).length;return <div key={c}><span>{CATEGORY_LABELS[c]}</span><strong>{count}/{list.length}</strong><progress max={list.length} value={count} aria-label={CATEGORY_LABELS[c]+' achievement progress'}/></div>;})}</div>
 <div className="achievement-filters"><div className="people-filter"><label htmlFor="achievement-category">Award category</label><select id="achievement-category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{ACHIEVEMENT_CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select></div><div className="people-filter"><label htmlFor="achievement-filter">Award status</label><select id="achievement-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All awards</option><option value="earned">Lifetime unlocked</option><option value="locked">Locked</option></select></div></div>
 <div className="achievement-grid">{visible.map((a)=>{const u=current.get(a.id),l=earned.get(a.id);return <article key={a.id} className="achievement-card" data-earned={!!l} aria-label={a.name}><span className="achievement-medal" aria-hidden="true">{l?'N.':'○'}</span><div><p className="eyebrow">{CATEGORY_LABELS[a.category]}</p><h3>{a.name}</h3><p>{a.description}</p><small>{u?'Unlocked this simulation · day '+u.day:l?'Lifetime award · first earned day '+l.day:'Locked'}</small></div></article>;})}</div>
 {!visible.length&&<p className="hint">No awards match these filters.</p>}
 </section>;
}
