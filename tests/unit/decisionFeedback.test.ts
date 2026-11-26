import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {ACTIONS} from '../../src/engine/content';
import {METRIC_KEYS} from '../../src/engine/types';
import {ACTION_FLAVOUR,decisionReceipt,decisionCue,formatDelta} from '../../src/ui/decisionFeedback';
import {collectNotices} from '../../src/ui/experience';
describe('executive decision receipts',()=>{
 it('covers all seven actions and reports actual clamped changes, not advertised effects',()=>{
  for(const action of ACTIONS){
   const before=newGame(),command={type:'action' as const,id:action.id},after=dispatch(before,command);
   const receipt=decisionReceipt(before,after,command,1)!;
   expect(receipt.title).toBe(action.label);expect(ACTION_FLAVOUR[action.id].length).toBeGreaterThanOrEqual(3);
   expect(receipt.flavour).toBe(ACTION_FLAVOUR[action.id][0]);
   for(const key of METRIC_KEYS)expect(receipt.deltas.find(d=>d.key===key)?.value??0).toBe(after.metrics[key]-before.metrics[key]);
   expect(receipt.deltas.find(d=>d.key==='cash')?.value??0).toBe(after.cash-before.cash);
   expect(receipt.deltas.find(d=>d.key==='capacity')?.value).toBe(-1);
   expect(decisionReceipt(before,after,command,2)?.flavour).not.toBe(receipt.flavour);
  }
 });
 it('omits rejected actions and exposes actual compensation and cash changes',()=>{
  const before=newGame(),command={type:'action' as const,id:'bonus'},after=dispatch(before,command);
  const receipt=decisionReceipt(before,after,command,1)!;
  expect(formatDelta(receipt.deltas.find(d=>d.key==='compensation')!)).toBe('+£1,800');
  expect(formatDelta(receipt.deltas.find(d=>d.key==='cash')!)).toBe('−£1,800');
  expect(decisionReceipt(before,before,command,2)).toBeNull();
  expect(decisionCue(before,after,command,collectNotices(before,after))).toBe('bonus');
 });
 it('recognises bed-led achievement and records day and other valid commands',()=>{
  const before=newGame(),rest={type:'action' as const,id:'rest'},after=dispatch(before,rest);
  expect(decisionCue(before,after,rest,collectNotices(before,after))).toBe('award');
  const day={type:'endDay' as const},next=dispatch(after,day);
  expect(decisionReceipt(after,next,day,2)?.kind).toBe('day');
  const finance={type:'finance' as const,operation:'acquire-customers' as const},customers=dispatch(before,finance);
  expect(decisionReceipt(before,customers,finance,3)?.title).toBe('Corporate decision recorded');
 });
});
