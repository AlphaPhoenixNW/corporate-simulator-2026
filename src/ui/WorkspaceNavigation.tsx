import type {GameState} from '../engine/types';
import {WORKSPACES,workspaceAvailable,type Workspace} from './workspaces';
export function WorkspaceNavigation({state,current,onNavigate}:{state:GameState;current:Workspace;onNavigate:(id:Workspace)=>void}){
 const items=WORKSPACES.filter(w=>workspaceAvailable(state,w.id));
 const groups=[...new Set(items.map(w=>w.group))];
 return <><nav className="workspace-nav" aria-label="Workspace">{groups.map(g=><div className="nav-group" key={g}><span>{g}</span>{items.filter(w=>w.group===g).map(w=><a key={w.id} href={'#'+w.id} data-route={w.id} aria-current={current===w.id?'page':undefined} onClick={e=>{e.preventDefault();onNavigate(w.id);}}>{w.label}</a>)}</div>)}</nav>
 <nav className="mobile-primary" aria-label="Quick workspaces">{(['office','departments','finance','campaign'] as const).map((id,i)=><button key={id} aria-current={current===id?'page':undefined} onClick={()=>onNavigate(id)}>{['Office','Company','Finance','Campaign'][i]}</button>)}</nav>
 <div className="mobile-jump"><label htmlFor="workspace-jump">All workspaces</label><select id="workspace-jump" value={current} onChange={e=>onNavigate(e.target.value as Workspace)}>{groups.map(g=><optgroup key={g} label={g}>{items.filter(w=>w.group===g).map(w=><option key={w.id} value={w.id}>{w.label}</option>)}</optgroup>)}</select></div></>;
}
