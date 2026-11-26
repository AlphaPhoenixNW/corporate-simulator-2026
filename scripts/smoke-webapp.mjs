import {chromium,devices} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const url='http://127.0.0.1:4174/';
// Emulate Pages' extensionless HTML redirect, SPA fallback and static MIME types.
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=createServer(async(req,res)=>{
 try{
  const requested=new URL(req.url,url);
  if(requested.pathname==='/index.html'){res.writeHead(308,{Location:'/'+requested.search});res.end();return;}
  const pathname=requested.pathname==='/'||requested.pathname==='/recover'?'index.html':decodeURIComponent(requested.pathname.slice(1));
  const file=resolve(root,pathname);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(4174,'127.0.0.1',ok);});
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
 const redirect=await fetch(url+'index.html',{redirect:'manual'});
 assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/');
 browser=await chromium.launch();
 for(const [name,settings] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],defaultBrowserType:undefined}]]){
  const context=await browser.newContext(settings);
  try{
   let page=await context.newPage();await page.goto(url+'?utm_source=regression');
   await page.getByRole('heading',{name:'Corporate Simulator 2026™'}).waitFor();
   const manifest=await page.evaluate(async()=>await(await fetch('./manifest.webmanifest')).json());
   assert.equal(manifest.display,'standalone');assert.equal(manifest.icons.length,2);
   await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   assert.equal(await page.evaluate(async()=>{const r=await caches.match(new URL('./',location.href).href);return r?.redirected??null;}),false,'The cached shell must not be a redirected response');
   await page.screenshot({path:'playtest/screenshots/'+name+'-title.png'});
   await page.getByRole('button',{name:'Play now',exact:true}).click();
   await page.getByRole('button',{name:/Practise bed-led leadership/}).click();
   // Reopen in a fresh tab, retaining browser-local saves, with a referral query.
   await page.close();page=await context.newPage();await page.goto(url+'?utm_source=return-visit');
   await page.getByRole('button',{name:'Continue simulation'}).click();
   assert.equal(await page.getByTestId('day').innerText(),'001');
   assert.match(await page.locator('.compact-kpis').innerText(),/1\/2/);
   // Simulate a legacy/redirected cache entry and verify navigation sanitises it.
   await page.evaluate(async()=>{
    const key=new URL('./',location.href).href;
    const name=(await caches.keys()).find(k=>k.startsWith('nothing-sim-app-v2-'));
    if(!name)throw Error('Expected updated cache');
    const redirected=await fetch('./index.html',{cache:'reload'});
    if(!redirected.redirected)throw Error('Expected hosting redirect');
    await (await caches.open(name)).put(key,redirected);
   });
   await page.reload();
   await page.getByTestId('day').waitFor();
   await context.setOffline(true);await page.goto(url+'?utm_source=offline-reopen');
   await page.getByRole('button',{name:'Executive Library',exact:true}).click();
   const reader=page.getByRole('main',{name:'Executive Library'});
   await reader.getByLabel('Reading section').selectOption('11');
   assert.equal(await reader.getByRole('article').getAttribute('aria-label'),'Chapter 10 | The Bed-Led Organisation™');
   await reader.getByRole('button',{name:/Return to simulation/}).click();
   await navigate(page,'achievements');
   const award=page.getByTestId('achievement-current');await award.waitFor();assert.equal(await award.innerText(),'1/74');
   await page.locator('details.workspace-settings > summary').click();
   await page.getByRole('button',{name:'Title screen and backups'}).click();
   await page.getByRole('button',{name:'Continue simulation'}).click();
   assert.equal(await award.innerText(),'1/74');
   console.log('WEBAPP_RETURN_NAVIGATION_PASS',name);console.log('WEBAPP_OFFLINE_PASS',name);
  }finally{await context.close();}
 }
}finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok));}
