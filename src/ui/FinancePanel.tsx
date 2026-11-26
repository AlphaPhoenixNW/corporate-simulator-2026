import { useState } from 'react';
import { ACQUISITION_IDS, type GameState, type Command, type FinanceCommand, type SavingsPlan } from '../engine/types';
import { ACQUISITIONS, PLANS, QUARTER_DAYS, LOAN_TRANCHE, REPAYMENT, CUSTOMER_COST, DEBT_LIMIT, forecastSavingsPerCustomer, financeEligibility } from '../engine/finance';
const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const price=(p:number)=>'£'+(p/100).toFixed(2);
export function FinancePanel({state,send}:{state:GameState;send:(c:Command)=>void}){
  const f=state.finance,plan=PLANS[f.plan];
  const [showReports,setShowReports]=useState(false);
  const [target,setTarget]=useState<typeof ACQUISITION_IDS[number]>('deckworks');
  const a=ACQUISITIONS[target];
  const controls:{label:string;command:FinanceCommand}[]=[
    {label:'Draw '+money(LOAN_TRANCHE)+' credit',command:{type:'finance',operation:'borrow'}},
    {label:'Repay '+money(Math.min(REPAYMENT,f.debt||REPAYMENT))+' principal',command:{type:'finance',operation:'repay'}},
    {label:'Acquire customers · '+money(CUSTOMER_COST),command:{type:'finance',operation:'acquire-customers'}}
  ];
  const values=f.market.slice(-30),min=Math.min(...values.map(p=>p.price)),max=Math.max(...values.map(p=>p.price));
  const line=values.map((p,i)=>[10+i*280/Math.max(1,values.length-1),90-(p.price-min)*75/Math.max(1,max-min)].join(',')).join(' ');
  const net=f.period.revenue-f.period.expenses;
  return <section className="panel departments" id="finance" aria-labelledby="finance-heading">
    <p className="eyebrow">CAPITAL MARKETS & FINANCIAL INTELLIGENCE</p><h2 id="finance-heading">Corporate finance</h2>
    <div className="department-summary"><div><span>Outstanding debt</span><strong data-testid="finance-debt">{money(f.debt)}</strong></div><div><span>Active subscribers</span><strong data-testid="finance-subscribers">{f.subscribers}</strong></div><div><span>Indicative share price</span><strong>{price(f.sharePrice)}</strong></div><div><span>Investor sentiment</span><strong>{f.sentiment}/100</strong></div></div>
    <div className="meeting-workspace">
      <article className="department-detail" aria-label="Predictive savings monetisation">
        <h3>Predictive Savings Monetisation™</h3><p className="hint">Invoice clients for resources they might otherwise have consumed. Charge a daily subscription plus a percentage of forecast savings. No actual savings are required by this fictional business model.</p>
        <div className="people-filter"><label htmlFor="savings-pricing">Pricing strategy</label><select id="savings-pricing" value={f.plan} disabled={state.capacity<1||!!state.pendingEvent||!!state.ending} onChange={e=>send({type:'finance',operation:'pricing',plan:e.target.value as SavingsPlan})}>{Object.entries(PLANS).map(([id,p])=><option key={id} value={id}>{p.label}</option>)}</select></div>
        <div className="department-summary"><div><span>Forecast avoided cost / client</span><strong>{money(forecastSavingsPerCustomer(state))}</strong></div><div><span>Daily subscription / client</span><strong>{money(plan.subscription)}</strong></div><div><span>Savings fee</span><strong>{Math.round(plan.rate*100)}%</strong></div><div><span>Latest churn</span><strong>{f.lastChurn}</strong></div></div>
        <p className="department-report">Previous day: {money(f.lastSubscription)} subscriptions + {money(f.lastInvoice)} savings invoices. Higher fees increase scrutiny and customer attrition.</p>
        <h3>Capital allocation</h3><p className="hint">Credit ceiling {money(DEBT_LIMIT)}. Daily interest 0.2% of outstanding principal, rounded up. Borrowing requires shareholder confidence of at least 35.</p>
        <div className="department-controls">{controls.map(({label,command})=>{const reason=financeEligibility(state,command);return <div key={command.operation}><button className="secondary" disabled={!!reason} onClick={()=>send(command)}>{label}</button>{reason&&<small>{reason}</small>}</div>;})}</div>
        <p className="hint">Latest interest charge: {money(f.lastInterest)}. Each financial decision consumes one executive action.</p>
        <h3>Acquisitions</h3><div className="people-filter"><label htmlFor="acquisition-target">Acquisition target</label><select id="acquisition-target" value={target} onChange={e=>setTarget(e.target.value as typeof target)}>{ACQUISITION_IDS.map(id=><option key={id} value={id}>{ACQUISITIONS[id].name}</option>)}</select></div><p className="hint">{a.description} Purchase price {money(a.price)}; daily receipts {money(a.revenue)}; daily expenses {money(a.expense)}. Risk of useful activity: {Math.round(a.risk*100)}% per day.</p>
        <button className="secondary" disabled={!!financeEligibility(state,{type:'finance',operation:'acquire',target})} onClick={()=>send({type:'finance',operation:'acquire',target})}>Acquire {a.name}</button><p className="hint">Portfolio: {f.acquisitions.map(id=>ACQUISITIONS[id].name).join(', ')||'No acquisitions'}</p>
      </article>
      <article className="department-detail" aria-label="Earnings and market performance">
        <h3>Indicative market performance</h3><p className="hint">Private valuation proxy until public listing is implemented. Last 30 recorded working days.</p>
        {values.length>0?<><svg className="finance-chart" viewBox="0 0 300 100" role="img" aria-label="Indicative share price history"><path d="M10 10V90H290" fill="none" stroke="currentColor" opacity=".25"/><polyline points={line} fill="none" stroke="#b28b43" strokeWidth="2"/>{values.map((p,i)=><circle key={p.day} cx={10+i*280/Math.max(1,values.length-1)} cy={90-(p.price-min)*75/Math.max(1,max-min)} r="2.5" fill="#14263d"><title>Day {p.day}: {price(p.price)}</title></circle>)}</svg><p className="hint">{price(min)} low · {price(max)} high · latest {price(f.sharePrice)}</p></>:<p className="hint">Market data appears after the first working day.</p>}
        <h3>Current earnings period</h3><p className="hint">Working days {f.periodStart}–{f.periodStart+QUARTER_DAYS-1}. An accelerated quarter lasts {QUARTER_DAYS} working days. Financial tracking began on day {f.trackedFromDay}.</p>
        <table className="finance-table"><tbody>{[['Opening cash',f.openingCash],['Operating receipts',f.period.revenue],['Operating expenses',-f.period.expenses],['Operating result',net],['Financing cash flow',f.period.financing],['Investing cash flow',f.period.investing],['Current cash',state.cash]].map(([label,value])=><tr key={String(label)}><th scope="row">{label}</th><td>{money(Number(value))}</td></tr>)}</tbody></table>
        <p className="hint">Cash reconciliation: {money(f.openingCash+net+f.period.financing+f.period.investing)}. Loan principal and acquisition prices are excluded from operating earnings.</p>
        <h3>Quarterly reports</h3><button className="secondary" aria-expanded={showReports} onClick={()=>setShowReports(!showReports)}>{showReports?'Hide':'Show'} earnings reports ({f.reports.length})</button>
        {showReports&&<div className="meeting-list">{f.reports.length===0&&<p className="hint">No closed periods yet.</p>}{f.reports.slice().reverse().map(r=><div className="meeting-record" key={r.startDay}><strong>Working days {r.startDay}–{r.endDay}</strong><p>Revenue {money(r.revenue)} · expenses {money(r.expenses)} · operating result {money(r.profit)}</p><p>Financing {money(r.financing)} · investing {money(r.investing)}</p><p>Cash {money(r.closingCash)} · debt {money(r.debt)} · indicative price {price(r.sharePrice)} · {r.subscribers} subscribers</p></div>)}</div>}
      </article>
    </div>
  </section>;
}
