import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {COMMUNICATION_FORMATS,generateCommunication,runCommunications,influencerLeaderboard,validCommunications} from '../../src/engine/communications';
import {COMMUNICATION_TYPES,type GameState} from '../../src/engine/types';
import {decodeSave} from '../../src/storage';
const publish=(s:GameState,format:'social'|'announcement'='announcement')=>dispatch(s,{type:'communication',operation:'publish',format});
describe('corporate communications',()=>{
  it('generates ten required formats with contextual content and deterministic output',()=>{
    const s=newGame();
    expect(Object.keys(COMMUNICATION_FORMATS)).toHaveLength(10);
    const messages=COMMUNICATION_TYPES.map((t,i)=>generateCommunication(s,t,i+1,()=>.5));
    expect(messages.every(m=>m.subject.length>0&&m.body.length>50)).toBe(true);
    expect(new Set(messages.map(m=>m.subject)).size).toBe(10);
    expect(generateCommunication(s,'shareholder',1,()=>.5).body).toContain('75,000');
    expect(generateCommunication(s,'newsletter',1,()=>.5)).toEqual(generateCommunication(s,'newsletter',1,()=>.5));
  });
  it('publishes a statement with a fee and executive capacity, without mutating input',()=>{
    const s=newGame(),next=publish(s);
    expect(next.communications).toHaveLength(1);
    expect(next.communications[0]).toMatchObject({id:1,type:'announcement',authorId:null});
    expect(next.capacity).toBe(1);expect(next.cash).toBe(s.cash-150);
    expect(next.metrics.confidence).toBe(s.metrics.confidence+4);
    expect(s.communications).toHaveLength(0);
  });
  it('blocks publication if attention or cash is unavailable',()=>{
    const s=newGame();
    for(const bad of [{...s,capacity:0},{...s,cash:0},{...s,pendingEvent:'viral'}])expect(publish(bad)).toBe(bad);
  });
  it('records executive announcements and personnel reviews from existing actions',()=>{
    const s=dispatch(newGame(),{type:'action',id:'statement'});
    const next=dispatch(s,{type:'employee',id:s.employees[0].id,operation:'review'});
    expect(next.communications.map(p=>p.type)).toEqual(['announcement','performance-review']);
    expect(next.communications[1].subject).toContain(s.employees[0].name);
  });
  it('generates a daily bulletin and employee social post',()=>{
    const s=dispatch(newGame(),{type:'endDay'});
    expect(s.communications.map(p=>p.type)).toEqual(['email','social']);
    expect(s.communications[1].authorId).not.toBeNull();
    expect(s.communications[1].impressions).toBeGreaterThan(0);
    expect(influencerLeaderboard(s.communications,s.employees)).toHaveLength(1);
  });
  it('allows one executive congratulations per post and persists comments',()=>{
    const s=publish(newGame(),'social');
    const next=dispatch(s,{type:'communication',operation:'congratulate',id:1});
    expect(next.communications[0].congratulated).toBe(true);
    expect(next.communications[0].comments.length).toBe(s.communications[0].comments.length+1);
    expect(next.metrics.prestige).toBe(s.metrics.prestige+1);
    expect(dispatch(next,{type:'communication',operation:'congratulate',id:1})).toBe(next);
  });
  it('creates viral engagement and a scandal with a productivity credibility gap',()=>{
    const s=newGame();
    const post={...generateCommunication(s,'social',1,()=>.5,s.employees[0]),impressions:990};
    const scenario={...s,communications:[post],nextCommunicationId:2,metrics:{...s.metrics,perceived:80,actual:5}};
    const result=runCommunications(scenario,()=>.95);
    expect(result.communications[0]).toMatchObject({viral:true,scandal:'open'});
    expect(result.delta.regulation).toBe(8);
    expect(result.reports).toHaveLength(2);
    expect(runCommunications({...scenario,communications:result.communications,nextCommunicationId:result.nextCommunicationId},()=>.95).reports.filter(r=>r.includes(post.author+' went viral'))).toHaveLength(0);
  });
  it('resolves a scandal with a linked corporate apology and charges a fee',()=>{
    const s=publish(newGame(),'social');
    const scenario:GameState={...s,communications:s.communications.map(p=>({...p,scandal:'open'}))};
    const next=dispatch(scenario,{type:'communication',operation:'respond',id:1});
    expect(next.communications[0].scandal).toBe('resolved');
    expect(next.communications[1]).toMatchObject({type:'apology',relatedId:1});
    expect(next.cash).toBe(scenario.cash-125);
    expect(next.capacity).toBe(scenario.capacity-1);
  });
  it('migrates v4 records and preserves current social activity across save round trips',()=>{
    const s=newGame(),legacy={...s,version:4,communications:undefined,nextCommunicationId:undefined};
    expect(decodeSave(JSON.stringify(legacy))).toMatchObject({version:5,communications:[],nextCommunicationId:1});
    const p=publish(s,'social');
    expect(validCommunications(p.communications,p.nextCommunicationId,p.employees)).toBe(true);
    expect(decodeSave(JSON.stringify(p))).toEqual(p);
    expect(decodeSave(JSON.stringify({...p,communications:[{...p.communications[0],authorId:999}]}))).toBeNull();
  });
});
