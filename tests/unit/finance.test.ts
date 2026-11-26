import {describe,it,expect} from 'vitest';
import {newGame,dispatch} from '../../src/engine/simulation';
import {initialFinance,trackCash,runFinance,closeFinanceDay,forecastSavingsPerCustomer,financeEligibility,validFinance,QUARTER_DAYS} from '../../src/engine/finance';
import {decodeSave} from '../../src/storage';
import type {GameState} from '../../src/engine/types';
describe('corporate finance',()=>{
  it('tracks operating expenditure and reconciles existing executive actions',()=>{
    const s=dispatch(newGame(),{type:'action',id:'bonus'});
    expect(s.finance.period.expenses).toBe(1800);
    expect(s.finance.lifetime.expenses).toBe(1800);
    expect(s.finance.openingCash-s.finance.period.expenses).toBe(s.cash);
    expect(s.ledger.at(-1)?.category).toBe('expense');
  });
  it('draws credit without recognising debt as operating revenue',()=>{
    const s=newGame(),n=dispatch(s,{type:'finance',operation:'borrow'});
    expect(n.cash).toBe(85000);expect(n.finance.debt).toBe(10000);
    expect(n.finance.period).toEqual({revenue:0,expenses:0,financing:10000,investing:0});
    expect(n.capacity).toBe(1);expect(s.finance.debt).toBe(0);
  });
  it('repays principal separately and enforces lender eligibility',()=>{
    const s=dispatch(newGame(),{type:'finance',operation:'borrow'}),n=dispatch(s,{type:'finance',operation:'repay'});
    expect(n.cash).toBe(80000);expect(n.finance.debt).toBe(5000);expect(n.finance.period.financing).toBe(5000);
    expect(financeEligibility({...s,finance:{...s.finance,debt:50000}},{type:'finance',operation:'borrow'})).toBe('Debt ceiling reached');
    expect(dispatch(newGame(),{type:'finance',operation:'repay'}).finance.debt).toBe(0);
  });
  it('charges daily interest on debt and does not reduce principal',()=>{
    const s=dispatch(newGame(),{type:'finance',operation:'borrow'}),n=dispatch(s,{type:'endDay'});
    expect(n.finance.lastInterest).toBe(20);expect(n.finance.debt).toBe(10000);
    expect(n.ledger.some(l=>l.label==='Credit facility interest'&&l.amount===-20&&l.category==='expense')).toBe(true);
  });
  it('acquires subscribers and bills forecast savings without actual delivery',()=>{
    const s=dispatch(newGame(),{type:'finance',operation:'acquire-customers'});
    expect(s.finance.subscribers).toBe(12);expect(s.cash).toBe(74400);
    const r=runFinance(s,()=>0);
    expect(r.finance.lastSubscription).toBe(216);
    expect(r.finance.lastInvoice).toBe(Math.round(12*forecastSavingsPerCustomer(s)*.2));
    expect(r.entries.every(e=>e.category==='revenue')).toBe(true);
  });
  it('changes pricing and models regulatory exposure and churn',()=>{
    const s=dispatch(newGame(),{type:'finance',operation:'pricing',plan:'aggressive'});
    const r=runFinance({...s,finance:{...s.finance,subscribers:100},metrics:{...s.metrics,regulation:90,confidence:25}},()=>.95);
    expect(r.finance.lastChurn).toBeGreaterThan(0);expect(r.delta.regulation).toBe(3);
    expect(r.finance.subscribers).toBe(100-r.finance.lastChurn);
  });
  it('acquires a company as investing cash flow and records separate daily receipts and costs',()=>{
    const s=dispatch(newGame(),{type:'finance',operation:'acquire',target:'deckworks'});
    expect(s.cash).toBe(66500);expect(s.finance.period.investing).toBe(-8500);expect(s.finance.period.expenses).toBe(0);
    const r=runFinance(s,()=>0);
    expect(r.entries).toEqual([{label:'DeckWorks Advisory trading receipts',amount:480,category:'revenue'},{label:'DeckWorks Advisory operating expenses',amount:-190,category:'expense'}]);
    expect(r.delta.actual).toBe(4);
    expect(dispatch(s,{type:'finance',operation:'acquire',target:'deckworks'})).toBe(s);
  });
  it('reconciles quarter closing cash and excludes financing and investing from earnings',()=>{
    let f=initialFinance(1,75000);
    f=trackCash(f,1000,'revenue');f=trackCash(f,-300,'expense');f=trackCash(f,10000,'financing');f=trackCash(f,-8500,'investing');
    const s={...newGame(),day:QUARTER_DAYS,cash:77200,finance:f};
    const next=closeFinanceDay(s);
    expect(next.reports[0]).toMatchObject({profit:700,closingCash:77200,financing:10000,investing:-8500});
    expect(next.periodStart).toBe(QUARTER_DAYS+1);expect(next.period.revenue).toBe(0);
    expect(validFinance(next)).toBe(true);
  });
  it('publishes quarterly earnings at day close and keeps market history',()=>{
    const s={...newGame(),day:QUARTER_DAYS};
    const n=dispatch(s,{type:'endDay'});
    expect(n.finance.reports).toHaveLength(1);expect(n.finance.market.at(-1)?.day).toBe(QUARTER_DAYS);
    expect(n.communications.some(c=>c.subject.includes('Quarterly earnings'))).toBe(true);
    expect(validFinance(n.finance)).toBe(true);
  });
  it('reconciles cash across daily settlement and all transaction categories',()=>{
    const s=dispatch(dispatch(newGame(),{type:'finance',operation:'borrow'}),{type:'finance',operation:'acquire',target:'deckworks'});
    const n=dispatch(s,{type:'endDay'}),f=n.finance;
    expect(f.openingCash+f.period.revenue-f.period.expenses+f.period.financing+f.period.investing).toBe(n.cash);
    expect(n.ledger.reduce((v,l)=>v+l.amount,75000)).toBe(n.cash);
    expect(decodeSave(JSON.stringify(n))).toEqual(n);
  });
  it('migrates legacy saves at their actual cash balance without inventing historic accounts',()=>{
    const s=dispatch(newGame(),{type:'action',id:'bonus'});
    const legacy={...s,version:6,finance:undefined,day:9};
    const n=decodeSave(JSON.stringify(legacy))!;
    expect(n.version).toBe(11);expect(n.cash).toBe(s.cash);expect(n.finance.openingCash).toBe(s.cash);
    expect(n.finance.trackedFromDay).toBe(9);expect(n.finance.period.revenue).toBe(0);
    expect(decodeSave(JSON.stringify({...n,finance:{...n.finance,debt:-1}}))).toBeNull();
  });
});
