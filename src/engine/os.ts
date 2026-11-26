import type {OSState,OSProfile,OSCommand,GameState,Delta,OSDiagnostic} from './types';
export const FIRST_LICENCE=1200,RESTART_LICENCE=2500,DIAGNOSTIC_FEE=75,COMPLIANCE_FEE=200;
export const OS_PROFILES:Record<OSProfile,{name:string;tokens:number;processes:number;effect:Delta}>={
  efficiency:{name:'Efficiency (under review)',tokens:6000,processes:12,effect:{perceived:1}},
  enterprise:{name:'Enterprise orchestration',tokens:24000,processes:48,effect:{perceived:2,buzzwords:1}},
  maximum:{name:'Maximum strategic compute',tokens:96000,processes:192,effect:{perceived:4,buzzwords:3,regulation:2}}
};
export const initialOS=():OSState=>({power:'offline',profile:'enterprise',licence:'unissued',boots:0,shutdowns:0,licenceSpend:0,totalTokens:0,lastTokens:0,totalInferenceCost:0,avoidedTokens:0,zeroTokenShutdowns:0,diagnostics:[],history:[]});
export const bootFee=(os:OSState)=>os.boots===0?FIRST_LICENCE:RESTART_LICENCE;
export const inferenceFee=(tokens:number)=>Math.ceil(tokens/1000)*2;
export function projectedTokens(os:OSState){return os.power==='online'?OS_PROFILES[os.profile].tokens:0;}
export function osEligibility(s:GameState,c:OSCommand):string|null{
  const o=s.os;
  if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
  if(c.operation==='boot')return o.power==='online'?'System already online':s.cash<bootFee(o)?'Insufficient liquidity for enterprise licence':null;
  if(o.power!=='online')return 'System offline';
  if(c.operation==='shutdown')return null;
  if(c.operation==='profile')return !Object.hasOwn(OS_PROFILES,c.profile)?'Unknown profile':o.profile===c.profile?'Profile already selected':null;
  if(c.operation==='diagnose')return s.cash<DIAGNOSTIC_FEE?'Insufficient liquidity':null;
  if(c.operation==='compliance-review')return s.cash<COMPLIANCE_FEE?'Insufficient liquidity':null;
  return 'Unknown operation';
}
function append(o:OSState,day:number,message:string){return [...o.history,'Day '+day+': '+message].slice(-100);}
export function changeOS(s:GameState,c:OSCommand):{os:OSState;cost:number;delta:Delta;message:string}|null{
  if(osEligibility(s,c))return null;
  const o={...s.os};let cost=0,delta:Delta={},message='';
  switch(c.operation){
    case 'boot':cost=bootFee(o);o.power='online';o.licence='active';o.boots++;o.licenceSpend+=cost;message='Enterprise licence activated. NOTHING™ OS online.';delta={prestige:2,perceived:2};break;
    case 'shutdown':o.power='offline';o.licence='expired';o.shutdowns++;o.zeroTokenShutdowns++;o.lastTokens=0;message='Strategic shutdown complete. Active token demand reduced by 100%.';delta={actual:-2,prestige:3,confidence:1};break;
    case 'profile':o.profile=c.profile;message='Compute profile set to '+OS_PROFILES[c.profile].name+'.';break;
    case 'diagnose':{
      cost=DIAGNOSTIC_FEE;
      const report:OSDiagnostic={day:s.day,tokens:projectedTokens(o),processes:OS_PROFILES[o.profile].processes,exposure:s.metrics.regulation,findings:['Licence validation: active.','Process inventory: '+OS_PROFILES[o.profile].processes+' strategically idle processes.','Output verification: '+s.metrics.actual+'/100 actual productivity.',s.metrics.regulation>=50?'Elevated regulatory exposure: governance review recommended.':'No further compliance alignment required at this time.']};
      o.diagnostics=[...o.diagnostics,report].slice(-40);message='Diagnostic report generated. No remediation has been initiated.';delta={perceived:1,bureaucracy:1};break;
    }
    case 'compliance-review':cost=COMPLIANCE_FEE;message='Enterprise compliance attestation recorded.';delta={regulation:-5,bureaucracy:2,perceived:1};break;
  }
  o.history=append(o,s.day,message);
  return {os:o,cost,delta,message};
}
export function runOS(o:OSState){
  const tokens=projectedTokens(o),cost=inferenceFee(tokens);
  return {os:{...o,lastTokens:tokens,totalTokens:o.totalTokens+tokens,totalInferenceCost:o.totalInferenceCost+cost,avoidedTokens:o.avoidedTokens+(o.power==='offline'&&o.boots>0?OS_PROFILES[o.profile].tokens:0)},cost,delta:o.power==='online'?OS_PROFILES[o.profile].effect:{}};
}
export function validOS(v:unknown):v is OSState{
  const int=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
  const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
  if(!obj(v)||!['offline','online'].includes(String(v.power))||typeof v.profile!=='string'||!Object.hasOwn(OS_PROFILES,v.profile)||!['unissued','active','expired'].includes(String(v.licence))||!['boots','shutdowns','licenceSpend','totalTokens','lastTokens','totalInferenceCost','avoidedTokens','zeroTokenShutdowns'].every(k=>int(v[k]))||!Array.isArray(v.history)||v.history.length>100||!v.history.every(x=>typeof x==='string')||!Array.isArray(v.diagnostics)||v.diagnostics.length>40)return false;
  const boots=Number(v.boots),shutdowns=Number(v.shutdowns);
  if(v.power==='online'?(v.licence!=='active'||boots!==shutdowns+1):(v.lastTokens!==0||boots!==shutdowns||v.licence!==(boots===0?'unissued':'expired')))return false;
  if(v.zeroTokenShutdowns!==shutdowns||v.licenceSpend!==(boots===0?0:FIRST_LICENCE+(boots-1)*RESTART_LICENCE)||Number(v.lastTokens)>Number(v.totalTokens))return false;
  return v.diagnostics.every(d=>obj(d)&&int(d.day,1)&&int(d.tokens)&&int(d.processes)&&int(d.exposure,0,100)&&Array.isArray(d.findings)&&d.findings.every(x=>typeof x==='string'));
}
