import type { Action, CorporateEvent } from './types';
export const ACTIONS: Action[] = [
  {id:'alignment',label:'Schedule alignment workshop',detail:'Replace productive hours with consensus.',cost:600,effect:{perceived:9,actual:-7,meetings:9,bureaucracy:4,morale:-3}},
  {id:'statement',label:'Issue strategic announcement',detail:'Deliver a confident narrative without a deliverable.',cost:250,effect:{confidence:7,prestige:4,perceived:5,buzzwords:8,regulation:2}},
  {id:'consultants',label:'Commission consultancy review',detail:'Purchase a recommendation to purchase more recommendations.',cost:2200,effect:{bureaucracy:12,incompetence:5,actual:-10,perceived:12,prestige:3,morale:-2}},
  {id:'rest',label:'Practise bed-led leadership',detail:'Protect the executive from operational interference.',cost:0,effect:{prestige:2,actual:-3,morale:4,confidence:-3,meetings:-3}},
  {id:'bonus',label:'Approve executive bonus',detail:'Reward an exemplary absence of outcomes.',cost:1800,effect:{compensation:1800,prestige:8,morale:-5,confidence:-4,regulation:4}},
  {id:'audit',label:'Initiate governance review',detail:'Reduce regulatory exposure through additional process.',cost:900,effect:{regulation:-12,bureaucracy:5,actual:-4,perceived:3,meetings:3}},
  {id:'wellbeing',label:'Fund employee wellbeing',detail:'Improve morale at the dangerous risk of renewed competence.',cost:800,effect:{morale:12,actual:4,confidence:2}}
];
export const EVENTS: CorporateEvent[] = [
  {id:'functional-product',title:'An engineer has shipped something',description:'A customer reports that an internal prototype actually works. This was not in the strategic plan.',choices:[
    {id:'committee',label:'Establish a product readiness committee',detail:'Delay launch; increase governance.',effect:{cash:-900,actual:-10,bureaucracy:9,perceived:5}},
    {id:'launch',label:'Accept the revenue',detail:'Gain £4,000, at the risk of measurable usefulness.',effect:{cash:4000,actual:14,confidence:5},delayed:{days:2,effect:{actual:9},message:'Customers have started using the product.'}}
  ]},
  {id:'consultant',title:'Consultants recommend more consultants',description:'The initial review recommends an independent review of the initial review.',choices:[
    {id:'approve',label:'Approve phase two',detail:'Purchase strategic reassurance.',effect:{cash:-2500,perceived:12,bureaucracy:8,prestige:5}},
    {id:'decline',label:'Decline the recommendation',detail:'Save money but undermine the transformation narrative.',effect:{confidence:-5,bureaucracy:-4,actual:6}}
  ]},
  {id:'viral',title:'A thought leader goes viral',description:'A post containing the phrase “outcomes are a mindset” has accumulated 40,000 impressions.',choices:[
    {id:'amplify',label:'Amplify the thought leadership',detail:'Increase confidence, buzzwords and scrutiny.',effect:{cash:-500,confidence:9,buzzwords:12,prestige:5,regulation:3}},
    {id:'ignore',label:'Let the moment pass',detail:'Avoid further scrutiny.',effect:{regulation:-4,prestige:-2,morale:3}}
  ]},
  {id:'shareholder',title:'A shareholder asks what we sell',description:'Investor relations requests a clear answer before the next quarterly call.',choices:[
    {id:'savings',label:'Announce Predictive Savings Monetisation™',detail:'Invoice for resources customers might otherwise have consumed.',effect:{cash:3000,confidence:6,buzzwords:5},delayed:{days:3,effect:{regulation:10},message:'A regulator requests evidence of hypothetical savings.'}},
    {id:'clarify',label:'Explain our current business model',detail:'Reduce exposure at the expense of confidence.',effect:{confidence:-10,regulation:-8,actual:4}}
  ]}
];
