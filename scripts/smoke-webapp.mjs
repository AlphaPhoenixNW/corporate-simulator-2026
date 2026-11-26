import {chromium,devices} from '@playwright/test';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const url='http://127.0.0.1:4174/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4174','--strictPort'],{stdio:'inherit'});
async function navigate(page,id){
 const mobile=page.locator('#workspace-jump');
 const desktop=page.locator('a[data-route="'+id+'"]');
 const visible=await mobile.isVisible()?await mobile.locator('option[value="'+id+'"]').count()>0:await desktop.count()>0;
 if(!visible)await page.getByRole('button',{name:/^Show all workspaces/}).click();
 if(await mobile.isVisible())await mobile.selectOption(id);
 else await desktop.click();
}
let browser;
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(url)).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 assert.equal(ready,true,'Production preview did not start');
 browser=await chromium.launch();
 for(const [name,settings] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],defaultBrowserType:undefined}]]){
  const context=await browser.newContext(settings);
  try{
   const page=await context.newPage();await page.goto(url);
   await page.getByRole('heading',{name:'Corporate Simulator 2026™'}).waitFor();
   const manifest=await page.evaluate(async()=>await(await fetch('./manifest.webmanifest')).json());
   assert.equal(manifest.display,'standalone');assert.equal(manifest.icons.length,2);
   await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.screenshot({path:'playtest/screenshots/'+name+'-title.png'});
   await page.getByRole('button',{name:'Play now',exact:true}).click();
   await page.getByRole('button',{name:/Practise bed-led leadership/}).click();
   await context.setOffline(true);await page.reload();
   await navigate(page,'achievements');
   const award=page.getByTestId('achievement-current');await award.waitFor();assert.equal(await award.innerText(),'1/74');
   await page.locator('details.workspace-settings > summary').click();
   await page.getByRole('button',{name:'Title screen and backups'}).click();
   await page.getByRole('button',{name:'Continue simulation'}).click();
   assert.equal(await award.innerText(),'1/74');
   console.log('WEBAPP_OFFLINE_PASS',name);
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();server.kill();}
