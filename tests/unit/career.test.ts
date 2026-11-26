import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {buildCareer,careerHtml,CAREER_NOTICE} from '../../src/ui/career';
describe('executive career portfolio',()=>{
 it('starts with a genuine appointment and no unearned accomplishments or qualifications',()=>{
  const s=newGame(),cv=buildCareer(s);
  expect(cv.role).toBe('Founder & Chief Executive Officer');
  expect(cv.appointments).toHaveLength(1);
  expect(cv.accomplishments).toEqual([]);
  expect(cv.credentials).toEqual([]);
  expect(cv.indicators.find(e=>e.title==='Corporate liquidity')?.detail).toBe('£75,000');
  expect(cv.indicators.find(e=>e.title==='Actual productivity')?.detail).toBe('12/100');
 });
 it('updates from accepted actions, not achievement labels or invented results',()=>{
  const s=newGame(),rest=dispatch(s,{type:'action',id:'rest'}),bonus=dispatch(rest,{type:'action',id:'bonus'}),cv=buildCareer(bonus);
  expect(cv.accomplishments.find(e=>e.title==='Horizontal leadership')?.detail).toContain('1 recorded');
  expect(cv.credentials.map(e=>e.title)).toContain('Bed-Led Leadership Practitioner™');
  expect(cv.indicators.find(e=>e.title==='Executive remuneration')?.detail).toBe('£1,800');
  expect(cv.indicators.find(e=>e.title==='Corporate liquidity')?.detail).toBe('£73,200');
  expect(buildCareer(s).accomplishments).toEqual([]);
  expect(buildCareer({...bonus,achievements:{...bonus.achievements,unlocked:[]}})).toEqual(cv);
 });
 it('uses actual career history and does not claim unearned final certification',()=>{
  const s=newGame(),ready={...s,day:3,metrics:{...s.metrics,confidence:60,perceived:40,actual:0}},next=dispatch(ready,{type:'campaign',operation:'advance'}),cv=buildCareer(next);
  expect(next.campaign.stage).toBe(2);
  expect(cv.appointments).toHaveLength(2);
  expect(cv.role).toContain('Seed-Funded');
  expect(cv.credentials.map(e=>e.title)).not.toContain('Certified Strategic Nothingness Executive™');
  expect(buildCareer({...next,ending:'board'}).status).toContain('board confidence withdrawn');
  expect(buildCareer(newGame(2026,{mode:'sandbox'})).appointments[0].detail).toContain('Sandbox');
 });
 it('exports an escaped self-contained fictional CV without remote resources or scripts',()=>{
  const cv=buildCareer(newGame()),html=careerHtml({...cv,role:'<img src=x onerror=alert(1)>'});
  expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  expect(html).not.toContain('<img');
  expect(html).not.toMatch(/<script\b|https?:\/\//);
  expect(html).toContain(CAREER_NOTICE);
  expect(html).toContain('@media print');
 });
});
