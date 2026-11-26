import {describe,it,expect} from 'vitest';
import {newGame} from '../../src/engine/simulation';
import {AUTO_AWARDS,EMPTY_AUTOPILOT,MAX_AUTOMATED_ATTEMPTS,attemptSeed,createAttempt,stepAttempt,runAttempt,recordAttempt,decodeAutopilot} from '../../src/engine/autopilot';
import {runAutopilot} from '../../src/engine/autopilotRunner';
import {playthrough} from '../support/campaignDriver';
import {buildCareer,careerHtml} from '../../src/ui/career';
describe('executive autopilot',()=>{
 it('uses real campaign outcomes, matching the regression strategy',()=>{
  const a=runAttempt(0),reference=playthrough(2026);
  expect(a).toMatchObject({seed:2026,outcome:'certified',day:reference.state.day,commands:reference.commands.length,cash:reference.state.cash,compensation:reference.state.compensation});
  expect(runAttempt(0)).toEqual(a);
  expect(attemptSeed(1)).toBe(2027);
 });
 it('records only settled unique sequential attempts and preserves separate outcomes',()=>{
  const start={...EMPTY_AUTOPILOT,goal:3};
  const r={seed:2026,outcome:'certified' as const,day:42,commands:150,compensation:5400,cash:100000};
  const p=recordAttempt(start,r);
  expect(p).toMatchObject({attempts:1,certified:1,failed:0,bounded:0,commands:150,compensation:5400});
  expect(recordAttempt(p,r)).toBe(p);
  const q=recordAttempt(p,{...r,seed:2027,outcome:'failed',compensation:0});
  const done=recordAttempt(q,{...r,seed:2028,outcome:'bounded',compensation:0});
  expect(done).toMatchObject({attempts:3,certified:1,failed:1,bounded:1,commands:450,compensation:5400});
  expect(recordAttempt(done,{...r,seed:2029})).toBe(done);
  expect(decodeAutopilot(JSON.stringify(done))).toEqual(done);
  expect(decodeAutopilot(JSON.stringify({...done,certified:3}))).toEqual(EMPTY_AUTOPILOT);
  expect(decodeAutopilot(JSON.stringify({...done,last:{...done.last,seed:1}}))).toEqual(EMPTY_AUTOPILOT);
 });
 it('counts genuine milestones, not a million target or incomplete run',()=>{
  const p={...EMPTY_AUTOPILOT,goal:MAX_AUTOMATED_ATTEMPTS};
  expect(AUTO_AWARDS.filter(a=>a.test(p))).toHaveLength(0);
  expect(AUTO_AWARDS.filter(a=>a.test({...p,attempts:999999,certified:1}))).toHaveLength(5);
  expect(AUTO_AWARDS.filter(a=>a.test({...p,attempts:1000000,certified:1}))).toHaveLength(6);
  const attempt=createAttempt(0);expect(stepAttempt(attempt).commands).toBe(1);
  expect(attempt.commands).toBe(0);
 });
 it('settles a bounded real attempt without changing an unrelated manual game',()=>{
  const manual=newGame(44),copy=JSON.stringify(manual),a=createAttempt(0);
  const next=stepAttempt({...a,commands:1439});
  expect(next.done?.outcome).toBe('bounded');
  expect(next.done?.commands).toBe(1440);
  expect(JSON.stringify(manual)).toBe(copy);
  expect(manual.achievements.unlocked).toEqual([]);
 });
 it('supports cooperative completion and cancellation without fabricated counts',async()=>{
  const messages:string[]=[];
  await new Promise<void>((resolve,reject)=>{
   const stop=runAutopilot({start:0,goal:1,mode:'batch'},m=>{
    messages.push(m.type);
    if(m.type==='done'){stop();resolve();}
    if(m.type==='error'){stop();reject(Error(m.message));}
   });
  });
  expect(messages.filter(x=>x==='result')).toHaveLength(1);
  const cancelled:string[]=[];
  const stop=runAutopilot({start:1,goal:1000000,mode:'batch'},m=>cancelled.push(m.type));stop();
  await new Promise(r=>setTimeout(r,30));expect(cancelled).toEqual([]);
 });
 it('labels autonomous accomplishments separately in the CV',()=>{
  const s=newGame(),p={...EMPTY_AUTOPILOT,attempts:1,certified:1,commands:150};
  const cv=buildCareer(s,p);
  expect(cv.accomplishments).toEqual([]);
  expect(cv.automation[0].detail).toContain('1 independent automated campaign attempt; 1 certified.');
  expect(careerHtml(cv)).toContain('Autonomous leadership (separate laboratory)');
 });
});
