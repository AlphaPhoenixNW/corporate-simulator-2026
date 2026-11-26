import { ACQUISITION_IDS, type AcquisitionId, type SavingsPlan, type FinanceState, type CashTotals, type CashCategory, type FinanceCommand, type GameState, type Delta } from './types';
export const QUARTER_DAYS=20,LOAN_TRANCHE=10000,REPAYMENT=5000,DEBT_LIMIT=50000,CUSTOMER_COST=600,MAX_CUSTOMERS=500;
export const PLANS:Record<SavingsPlan,{label:string;subscription:number;rate:number;risk:number}>={
  conservative:{label:'Conservative',subscription:12,rate:.10,risk:0},
  standard:{label:'Strategic',subscription:18,rate:.20,risk:1},
  aggressive:{label:'Enterprise extraction',subscription:25,rate:.35,risk:3}
};
export const ACQUISITIONS:Record<AcquisitionId,{name:string;description:string;price:number;revenue:number;expense:number;risk:number}>={
  deckworks:{name:'DeckWorks Advisory',description:'Presentation slides with no accompanying implementation.',price:8500,revenue:480,expense:190,risk:.04},
  nullcloud:{name:'NullCloud Systems',description:'Reserved cloud capacity for absent workloads.',price:12000,revenue:720,expense:300,risk:.08},
  'synergy-labs':{name:'Synergy Labs',description:'An innovation lab alarmingly close to innovation.',price:16000,revenue:1000,expense:360,risk:.15}
};
export const emptyTotals=():CashTotals=>({revenue:0,expenses:0,financing:0,investing:0});
export function initialFinance(day=1,cash=75000,confidence=55):FinanceState{
  return {debt:0,subscribers:0,plan:'standard',acquisitions:[],sentiment:confidence,sharePrice:1000,market:[],trackedFromDay:day,periodStart:day,openingCash:cash,period:emptyTotals(),lifetime:emptyTotals(),reports:[],lastInvoice:0,lastSubscription:0,lastInterest:0,lastChurn:0};
}
export function trackCash(f:FinanceState,amount:number,category:CashCategory):FinanceState{
  const add=(t:CashTotals):CashTotals=>category==='revenue'?{...t,revenue:t.revenue+amount}:category==='expense'?{...t,expenses:t.expenses-amount}:{...t,[category]:t[category]+amount};
  return {...f,period:add(f.period),lifetime:add(f.lifetime)};
}
export function financeEligibility(s:GameState,c:FinanceCommand):string|null{
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  const f=s.finance;
  switch(c.operation){
    case 'borrow':return f.debt+LOAN_TRANCHE>DEBT_LIMIT?'Debt ceiling reached':s.metrics.confidence<35?'Lenders require 35 confidence':null;
    case 'repay':return f.debt===0?'No outstanding debt':s.cash<Math.min(REPAYMENT,f.debt)?'Insufficient liquidity':null;
    case 'acquire-customers':return f.subscribers>=MAX_CUSTOMERS?'Customer ceiling reached':s.cash<CUSTOMER_COST?'Insufficient liquidity':null;
    case 'pricing':return !Object.hasOwn(PLANS,c.plan)?'Unknown pricing plan':f.plan===c.plan?'Already selected':null;
    case 'acquire':return !Object.hasOwn(ACQUISITIONS,c.target)?'Unknown acquisition':f.acquisitions.includes(c.target)?'Already acquired':s.cash<ACQUISITIONS[c.target].price?'Insufficient liquidity':null;
  }
}
interface FinanceEntry {label:string;amount:number;category:CashCategory}
export function changeFinance(s:GameState,c:FinanceCommand):{finance:FinanceState;entries:FinanceEntry[];delta:Delta;message:string}|null{
  if(financeEligibility(s,c))return null;
  let finance={...s.finance},entries:FinanceEntry[]=[],delta:Delta={},message='';
  switch(c.operation){
    case 'borrow':finance.debt+=LOAN_TRANCHE;entries=[{label:'Credit facility drawdown',amount:LOAN_TRANCHE,category:'financing'}];delta={regulation:1};message='Credit facility drawn; no product required as collateral.';break;
    case 'repay':{const amount=Math.min(REPAYMENT,finance.debt);finance.debt-=amount;entries=[{label:'Debt principal repayment',amount:-amount,category:'financing'}];message='Debt principal repaid.';break;}
    case 'acquire-customers':{const gained=Math.min(MAX_CUSTOMERS-finance.subscribers,8+Math.floor(s.metrics.perceived/10)+Math.floor(s.metrics.confidence/20)+(s.departments.some(d=>d.id==='sales'&&d.active)?5:0));finance.subscribers+=gained;entries=[{label:'Customer acquisition campaign',amount:-CUSTOMER_COST,category:'expense'}];message=gained+' customers subscribed to hypothetical savings.';break;}
    case 'pricing':finance.plan=c.plan;message='Predictive Savings Monetisation pricing revised.';break;
    case 'acquire':{const a=ACQUISITIONS[c.target];finance.acquisitions=[...finance.acquisitions,c.target];entries=[{label:'Acquisition: '+a.name,amount:-a.price,category:'investing'}];delta={prestige:5,confidence:3,bureaucracy:4};message=a.name+' acquired. Integration is not anticipated.';break;}
  }
  return {finance,entries,delta,message};
}
export function forecastSavingsPerCustomer(s:GameState){return 80+s.metrics.perceived*2+s.metrics.buzzwords;}
// Fictional account servicing, assurance and contract administration costs.
export function customerServicingCost(s:GameState):number{
 const base=s.finance.plan==='conservative'?14:s.finance.plan==='standard'?20:28;
 const multiplier=s.campaign.difficulty==='relaxed'?.85:s.campaign.difficulty==='ruthless'?1.2:1;
 return Math.round(s.finance.subscribers*base*multiplier);
}
export function runFinance(s:GameState,random:()=>number){
  const f=s.finance,plan=PLANS[f.plan],entries:FinanceEntry[]=[],delta:Delta={},reports:string[]=[];
  const add=(label:string,amount:number,category:CashCategory)=>{if(amount)entries.push({label,amount,category});};
  const subscription=f.subscribers*plan.subscription;
  const invoice=Math.round(f.subscribers*forecastSavingsPerCustomer(s)*plan.rate);
  const interest=Math.ceil(f.debt*.002);
  add('Subscription revenue',subscription,'revenue');add('Predictive savings invoices',invoice,'revenue');add('Credit facility interest',-interest,'expense');add('Subscriber account servicing',-customerServicingCost(s),'expense');
  let churn=0;
  if(f.subscribers>0){
    const risk=Math.max(0,(s.metrics.regulation-35)/300)+(s.metrics.confidence<40?.08:0)+plan.risk*.025;
    churn=Math.min(f.subscribers,Math.floor(f.subscribers*risk*random()));
    if(churn)reports.push(churn+' customers cancelled after requesting evidence of savings.');
    delta.regulation=plan.risk;
    if(churn>0)delta.confidence=-Math.min(4,churn);
  }
  for(const id of f.acquisitions){
    const a=ACQUISITIONS[id];add(a.name+' trading receipts',a.revenue,'revenue');add(a.name+' operating expenses',-a.expense,'expense');
    if(random()<a.risk){delta.actual=(delta.actual??0)+4;reports.push(a.name+' accidentally delivered measurable value.');}
  }
  return {finance:{...f,subscribers:f.subscribers-churn,lastInvoice:invoice,lastSubscription:subscription,lastInterest:interest,lastChurn:churn},entries,delta,reports};
}
export function closeFinanceDay(s:GameState):FinanceState{
  const f=s.finance;
  const target=Math.max(0,Math.min(100,Math.round(s.metrics.confidence*.6+s.metrics.perceived*.4-s.metrics.regulation*.15-f.debt/5000)));
  const sentiment=Math.max(0,Math.min(100,Math.round(f.sentiment*.6+target*.4)));
  // Private-company indicative price in integer pence, not a tradable public share until campaign listing.
  const change=(sentiment-50)/1000+(s.metrics.perceived-s.metrics.actual)/2500;
  const sharePrice=Math.max(1,Math.min(10000000,Math.round(f.sharePrice*(1+change))));
  let next={...f,sentiment,sharePrice,market:[...f.market,{day:s.day,price:sharePrice,sentiment,cash:s.cash}].slice(-120)};
  if(s.day-f.periodStart+1>=QUARTER_DAYS){
    const report={...f.period,startDay:f.periodStart,endDay:s.day,openingCash:f.openingCash,closingCash:s.cash,profit:f.period.revenue-f.period.expenses,debt:f.debt,sharePrice,subscribers:f.subscribers};
    next={...next,reports:[...f.reports,report].slice(-40),period:emptyTotals(),periodStart:s.day+1,openingCash:s.cash};
  }
  return next;
}
export function validFinance(value:unknown):value is FinanceState{
  const integer=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
  const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const totals=(x:unknown)=>obj(x)&&integer(x.revenue)&&integer(x.expenses)&&integer(x.financing,-Number.MAX_SAFE_INTEGER)&&integer(x.investing,-Number.MAX_SAFE_INTEGER,0);
  if(!obj(value))return false;
  const f=value;
  if(!integer(f.debt,0,DEBT_LIMIT)||!integer(f.subscribers,0,MAX_CUSTOMERS)||typeof f.plan!=='string'||!Object.hasOwn(PLANS,f.plan)||!Array.isArray(f.acquisitions)||new Set(f.acquisitions).size!==f.acquisitions.length||!f.acquisitions.every(x=>ACQUISITION_IDS.includes(x))||!integer(f.sentiment,0,100)||!integer(f.sharePrice,1,10000000)||!integer(f.trackedFromDay,1)||!integer(f.periodStart,Number(f.trackedFromDay))||!integer(f.openingCash,-Number.MAX_SAFE_INTEGER)||!totals(f.period)||!totals(f.lifetime)||!['lastInvoice','lastSubscription','lastInterest','lastChurn'].every(k=>integer(f[k]))||!Array.isArray(f.market)||f.market.length>120||!Array.isArray(f.reports)||f.reports.length>40)return false;
  return f.market.every(m=>obj(m)&&integer(m.day,1)&&integer(m.price,1,10000000)&&integer(m.sentiment,0,100)&&integer(m.cash,-Number.MAX_SAFE_INTEGER))&&f.reports.every(r=>obj(r)&&totals(r)&&integer(r.startDay,1)&&integer(r.endDay,Number(r.startDay))&&integer(r.openingCash,-Number.MAX_SAFE_INTEGER)&&integer(r.closingCash,-Number.MAX_SAFE_INTEGER)&&integer(r.profit,-Number.MAX_SAFE_INTEGER)&&r.profit===Number(r.revenue)-Number(r.expenses)&&Number(r.closingCash)===Number(r.openingCash)+Number(r.profit)+Number(r.financing)+Number(r.investing)&&integer(r.debt,0,DEBT_LIMIT)&&integer(r.sharePrice,1,10000000)&&integer(r.subscribers,0,MAX_CUSTOMERS));
}
