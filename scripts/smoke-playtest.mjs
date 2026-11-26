import {chromium,devices} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const url=pathToFileURL(resolve('playtest','Corporate Simulator 2026.html')).href;
await mkdir('playtest/screenshots',{recursive:true});
async function navigate(page,id){
 const select=page.locator('#workspace-jump');
 if(await select.isVisible())await select.selectOption(id);
 else await page.locator('a[data-route="'+id+'"]').click();
}
const browser=await chromium.launch();
try{
 for(const [name,settings] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],defaultBrowserType:undefined}]]){
  const context=await browser.newContext({...settings,offline:true});
  try{
   const page=await context.newPage(),errors=[],network=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
   await page.goto(url);
   await page.getByRole('button',{name:'Play now',exact:true}).click();
   await page.getByTestId('cash').waitFor();
   assert.equal(await page.getByTestId('cash').innerText(),'£75,000');
   await page.screenshot({path:'playtest/screenshots/'+name+'-overview.png'});
   await page.getByRole('button',{name:/Practise bed-led leadership/}).click();
   await navigate(page,'achievements');
   const panel=page.getByRole('region',{name:'Achievement framework'});
   assert.equal(await panel.getByTestId('achievement-current').innerText(),'1/74');
   await page.reload();
   await panel.getByTestId('achievement-current').waitFor();
   assert.equal(await panel.getByTestId('achievement-current').innerText(),'1/74');
   await navigate(page,'intelligence');
   await page.getByRole('region',{name:'Strategic intelligence'}).scrollIntoViewIfNeeded();
   await page.screenshot({path:'playtest/screenshots/'+name+'-intelligence.png'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
   assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
   console.log('PORTABLE_PLAYTEST_PASS',name);
  }finally{await context.close();}
 }
}finally{await browser.close();}
