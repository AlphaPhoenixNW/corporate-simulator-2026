import type {BossCommand,GameState,Command} from '../engine/types';
import {PHASE_LABELS,bossEligibility,TRAINING_FEE,TRAINING_DAYS,TRAINING_MINUTES,PROGRAMME_FEE,PROGRAMME_DAYS,PROGRAMME_DAILY_FEE,PROGRAMME_MINUTES,BOSS_PROGRAMME} from '../engine/boss';
import {DEPARTMENTS} from '../engine/departments';
const phases=['promotion','committee','reassignment','training','programme','contained'] as const;
const labels:Record<BossCommand['operation'],string>={promote:'Promote to management',committee:'Convene steering committee',reassign:'Authorise strategic reassignment',train:'Enrol in mandatory training · £450',appoint:'Appoint transformation programme lead · £900'};
const descriptions={promotion:'Move the employee out of direct delivery by promoting them to management.',committee:'Arrange an executive steering committee. The employee must actually attend before the reassignment can proceed.',reassignment:'Move the employee to a governance-oriented department with available staffing capacity.',training:'Reserve three hours on each of two working days for mandatory leadership training.',programme:'Appoint the employee to a dedicated non-delivery transformation programme. Three days of governance milestones are required.',contained:'Every intervention is complete. Final campaign certification may proceed when the other requirements are met.'};
export function BossPanel({state,send}:{state:GameState;send:(c:Command)=>void}){
 const b=state.boss,e=state.employees.find(x=>x.id===b.employeeId),index=phases.findIndex(x=>x===b.phase);
 const operation:BossCommand['operation']|null=b.phase==='promotion'?'promote':b.phase==='committee'?'committee':b.phase==='reassignment'?'reassign':b.phase==='training'?'train':b.phase==='programme'?'appoint':null;
 const command:BossCommand|null=operation?{type:'boss',operation}:null;
 const reason=command?bossEligibility(state,command):null;
 const meeting=state.meetings.find(m=>m.id===b.committeeId);
 return <section className="panel departments" id="containment" aria-labelledby="boss-heading">
 <p className="eyebrow">BOARD CLASSIFICATION / STRATEGIC THREAT</p><h2 id="boss-heading">The competent employee</h2>
 {b.phase==='dormant'?<p className="department-report">Containment file not yet activated. Conclude a working day to initiate the encounter in an existing final-stage save.</p>:<>
 <div className="boss-banner" data-contained={b.phase==='contained'}><div><p className="eyebrow">{b.phase==='contained'?'THREAT NEUTRALISED':'CRITICAL OPERATIONAL COMPETENCE'}</p><h3>{e?.name??'Personnel record'}</h3><p>{e?DEPARTMENTS[e.department].name:''} · Staff #{b.employeeId} · Skill {e?.skill??100}/100</p></div><div><span>Containment phase</span><strong data-testid="boss-phase">{PHASE_LABELS[b.phase]}</strong></div></div>
 <div className="department-summary"><div><span>Unauthorised useful tasks</span><strong>{b.usefulTasks}</strong></div><div><span>Interventions authorised</span><strong>{b.interventions}</strong></div><div><span>Training days</span><strong data-testid="boss-training">{b.trainingDays}/{TRAINING_DAYS}</strong></div><div><span>Programme governance days</span><strong data-testid="boss-programme">{b.programmeDays}/{PROGRAMME_DAYS}</strong></div></div>
 <div className="meeting-workspace"><article className="department-detail" aria-label="Containment roadmap"><h3>Executive response plan</h3><ol className="campaign-roadmap">{phases.map((p,i)=><li key={p} data-current={p===b.phase}><span className="campaign-number">{i<index?'✓':String(i+1).padStart(2,'0')}</span><div><strong>{PHASE_LABELS[p]}</strong><p>{descriptions[p]}</p><small>{i<index?'CERTIFIED':p===b.phase?'CURRENT':'PENDING'}</small></div></li>)}</ol></article>
 <article className="department-detail" aria-label="Containment intervention"><h3>Authorised intervention</h3><p>{descriptions[b.phase]}</p>
 {b.phase!=='contained'&&<p className="department-report">The board requires retention of this employee. Direct dismissal and departmental redundancy are unavailable during the confrontation. Unoccupied working hours may generate actual productivity.</p>}
 {meeting&&<p className="hint">Steering committee #{meeting.id}: {meeting.status} · working day {meeting.day}</p>}
 {b.phase==='training'&&<p className="hint">Training fee £{TRAINING_FEE}. {TRAINING_MINUTES} minutes must remain after meetings on each qualifying day. {b.trainingEnrolled?'Enrolment confirmed.':'Enrolment required.'}</p>}
 {['programme','contained'].includes(b.phase)&&<p className="department-report"><strong>{BOSS_PROGRAMME}</strong><br/>Appointment fee £{PROGRAMME_FEE}; £{PROGRAMME_DAILY_FEE} per qualifying governance day; {PROGRAMME_MINUTES} minutes required after meetings. Spend to date £{b.programmeSpend.toLocaleString('en-GB')}.</p>}
 {command&&operation&&<><button disabled={!!reason} onClick={()=>send(command)}>{labels[operation]}</button>{reason&&<p className="hint">{reason}</p>}</>}
 {b.phase==='contained'&&<p role="status" className="boss-certificate">Strategic containment certified on working day {b.containedDay}. No delivery mandate remains.</p>}
 <h4>Containment audit record</h4><div className="meeting-list">{b.history.slice().reverse().map((h,i)=><p key={i} className="meeting-record">{h}</p>)}</div>
 </article></div></>}
 </section>;
}
