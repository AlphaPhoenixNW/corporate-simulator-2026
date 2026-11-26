import type {CampaignState,GameState,GameOptions,Difficulty,Scenario,DepartmentId,CampaignCommand,Metrics} from './types';
export const DIFFICULTIES:Record<Difficulty,{name:string;description:string;cashMultiplier:number;overhead:number;actualLimit:number;regulatoryPressure:number}>={
 relaxed:{name:'Executive protection',description:'More capital, lower overhead and greater tolerance for actual productivity.',cashMultiplier:1.5,overhead:.85,actualLimit:85,regulatoryPressure:0},
 standard:{name:'Corporate standard',description:'The original strategic nothingness rules.',cashMultiplier:1,overhead:1,actualLimit:70,regulatoryPressure:0},
 ruthless:{name:'Shareholder absolutism',description:'Less starting capital, higher overhead and tighter usefulness limits.',cashMultiplier:.7,overhead:1.2,actualLimit:55,regulatoryPressure:1}
};
export const SCENARIOS:Record<Scenario,{name:string;description:string;unlock:number;cash:number;metrics:Partial<Metrics>}>={
 founder:{name:'Bedroom founder',description:'Build a multinational from an empty roadmap.',unlock:1,cash:75000,metrics:{}},
 'board-crisis':{name:'Hostile board',description:'Recover shareholder confidence under immediate executive pressure.',unlock:3,cash:65000,metrics:{confidence:28,prestige:35,perceived:35}},
 'compliance-crisis':{name:'Regulatory intervention',description:'Begin with elevated exposure and a governance backlog.',unlock:5,cash:90000,metrics:{regulation:65,bureaucracy:40,confidence:45}}
};
export const STAGES=[
 {name:'Bedroom Startup',description:'Create the appearance of an organisation.',grant:0,overhead:0,capacity:2},
 {name:'Seed-Funded Nothingness',description:'Convert investor faith into capital and unlock Marketing and Sales.',grant:15000,overhead:150,capacity:2},
 {name:'Venture Capital Darling',description:'Expand the governance structure and unlock Legal and Corporate Strategy.',grant:20000,overhead:400,capacity:3},
 {name:'Enterprise Transformation Partner',description:'Certify enterprise programmes and unlock Digital Transformation.',grant:28000,overhead:750,capacity:3},
 {name:'Multinational Corporation',description:'Scale customer subscriptions and unlock AI and Agentic Innovation.',grant:40000,overhead:1200,capacity:4},
 {name:'Publicly Listed Organisation',description:'List the simulated shares and face heightened market scrutiny.',grant:48000,overhead:1800,capacity:4},
 {name:'Systemically Important Nothingness Provider',description:'Become indispensable without measurable delivery.',grant:55000,overhead:2400,capacity:4}
] as const;
export const DEPARTMENT_STAGE:Record<DepartmentId,number>={hr:1,finance:1,engineering:1,marketing:2,sales:2,legal:3,strategy:3,digital:4,ai:5,executive:1};
export function initialCampaign(options:GameOptions={}):CampaignState{
 return {mode:options.mode??'campaign',difficulty:options.difficulty??'standard',scenario:options.scenario??'founder',stage:1,enteredDay:1,history:[{stage:1,day:1}]};
}
export function dailyCapacity(s:GameState){return s.campaign.mode==='sandbox'?2:STAGES[s.campaign.stage-1].capacity;}
export function actualLimit(s:GameState){return DIFFICULTIES[s.campaign.difficulty].actualLimit;}
export function departmentStageReady(s:GameState,id:DepartmentId){return s.campaign.mode==='sandbox'||s.campaign.stage>=DEPARTMENT_STAGE[id];}
export function isListed(s:GameState){return s.campaign.mode==='campaign'&&s.campaign.stage>=6;}
export function campaignOverhead(s:GameState){return s.campaign.mode==='sandbox'?0:STAGES[s.campaign.stage-1].overhead;}
export interface Gate {label:string;current:number;target:number;direction:'min'|'max'}
export function campaignGates(s:GameState):Gate[]{
 const m=s.metrics,f=s.finance,stage=s.campaign.stage,active=s.departments.filter(d=>d.active).length,certified=s.programmes.filter(p=>p.status==='complete').length;
 const min=(label:string,current:number,target:number):Gate=>({label,current,target,direction:'min'});
 const max=(label:string,current:number,target:number):Gate=>({label,current,target,direction:'max'});
 const base=[min('Shareholder confidence',m.confidence,[45,50,55,60,65,70,80][stage-1]),min('Perceived productivity',m.perceived,[30,40,50,55,65,75,85][stage-1]),max('Actual productivity',m.actual,[35,35,30,30,25,25,20][stage-1]),min('Cash (£)',s.cash,[10000,12000,18000,25000,35000,50000,75000][stage-1]),min('Working days in stage',s.day-s.campaign.enteredDay,[2,3,4,5,6,7,8][stage-1])];
 switch(stage){
  case 1:return base;
  case 2:return [...base,min('Active departments',active,4),min('Subscribers',f.subscribers,20)];
  case 3:return [...base,min('Active departments',active,5),min('Commissioned programmes',s.programmes.length,1)];
  case 4:return [...base,min('Active departments',active,6),min('Certified programmes',certified,1),min('Subscribers',f.subscribers,40)];
  case 5:return [...base,min('Active departments',active,8),min('Subscribers',f.subscribers,80),min('Acquisitions',f.acquisitions.length,1)];
  case 6:return [...base,min('Closed profitable quarters',f.reports.filter(r=>r.profit>0).length,1),min('Agent workflows',s.agents.totalRuns,3),min('Subscribers',f.subscribers,100),max('Regulatory exposure',m.regulation,60)];
  default:return [...base,min('Active departments',active,10),min('Certified programmes',certified,2),min('Subscribers',f.subscribers,120),min('Executive compensation (£)',s.compensation,5000),max('Regulatory exposure',m.regulation,50),min('Competent employee containment',s.boss.phase==='contained'?1:0,1)];
 }
}
export function gateMet(g:Gate){return g.direction==='min'?g.current>=g.target:g.current<=g.target;}
export function campaignEligibility(s:GameState,c:CampaignCommand):string|null{
 if(s.campaign.mode!=='campaign')return 'Sandbox has no campaign certification';
 if(s.ending||s.pendingEvent||s.capacity<1)return 'Executive attention unavailable';
 if(c.operation==='advance'&&s.campaign.stage>=7)return 'Final stage reached';
 if(c.operation==='certify'&&s.campaign.stage!==7)return 'Final stage not reached';
 if(!campaignGates(s).every(gateMet))return 'Stage requirements not satisfied';
 return null;
}
export function advanceCampaign(s:GameState):CampaignState{
 const stage=s.campaign.stage+1;
 return {...s.campaign,stage,enteredDay:s.day,history:[...s.campaign.history,{stage,day:s.day}]};
}
export function validCampaign(v:unknown,day:number):v is CampaignState{
 if(!v||typeof v!=='object')return false;
 const c=v as CampaignState;
 return ['campaign','sandbox'].includes(c.mode)&&Object.hasOwn(DIFFICULTIES,c.difficulty)&&Object.hasOwn(SCENARIOS,c.scenario)&&Number.isInteger(c.stage)&&c.stage>=1&&c.stage<=7&&Number.isInteger(c.enteredDay)&&c.enteredDay>=1&&c.enteredDay<=day&&Array.isArray(c.history)&&c.history.length===c.stage&&c.history.every((h,i)=>h&&h.stage===i+1&&Number.isInteger(h.day)&&h.day>=1&&h.day<=day&&(i===0||h.day>=c.history[i-1].day))&&c.history.at(-1)?.day===c.enteredDay&&(c.mode!=='sandbox'||c.stage===1);
}
export function unlockedScenarios(highestStage:number):Scenario[]{return (Object.keys(SCENARIOS) as Scenario[]).filter(id=>highestStage>=SCENARIOS[id].unlock);}
