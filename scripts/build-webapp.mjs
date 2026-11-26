import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {join} from 'node:path';
const dist='dist';
await mkdir(join(dist,'icons'),{recursive:true});
// Original geometric N. logo; create standards-compatible PNGs without extra dependencies.
function crc32(bytes){let n=0xffffffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);}
function icon(size){
 const head=Buffer.alloc(13);head.writeUInt32BE(size,0);head.writeUInt32BE(size,4);head[8]=8;head[9]=2;
 const raw=Buffer.alloc((size*3+1)*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;
  const border=u>.14&&u<.86&&v>.14&&v<.86&&(u<.155||u>.845||v<.155||v>.845);
  const n=v>.30&&v<.70&&((u>.30&&u<.365)||(u>.57&&u<.635)||(u>.33&&u<.60&&Math.abs(u-(.34+(v-.30)*.625))<.045));
  const dot=u>.685&&u<.75&&v>.64&&v<.70;
  const color=border||n||dot?[214,181,118]:[20,38,61];
  const offset=y*(size*3+1)+1+x*3;raw[offset]=color[0];raw[offset+1]=color[1];raw[offset+2]=color[2];
 }
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
for(const size of [192,512])await writeFile(join(dist,'icons','icon-'+size+'.png'),icon(size));
const manifest={id:'./',name:'Corporate Simulator 2026™',short_name:'NOTHING™',description:'The Pursuit of Strategic Nothingness',start_url:'./',scope:'./',display:'standalone',background_color:'#14263d',theme_color:'#14263d',lang:'en-GB',icons:[192,512].map(size=>({src:'./icons/icon-'+size+'.png',sizes:size+'x'+size,type:'image/png',purpose:'any maskable'}))};
await writeFile(join(dist,'manifest.webmanifest'),JSON.stringify(manifest,null,2));
// Preserve software, reserved-rights and third-party runtime notices in distribution.
const noticeParts=await Promise.all(['LICENSE','RIGHTS.md',...['react','react-dom','scheduler'].map(name=>'node_modules/'+name+'/LICENSE')].map(async path=>'=== '+path+' ===\n'+await readFile(path,'utf8')));
await writeFile(join(dist,'LICENSES.txt'),noticeParts.join('\n\n'));
const assets=(await readdir(join(dist,'assets'))).sort().map(x=>'assets/'+x);
const files=['index.html','LICENSES.txt','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',...assets];
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(join(dist,f)));
// Header changes must invalidate the cached application shell as well as asset changes.
hash.update(await readFile(join(dist,'_headers')));
const cache='nothing-sim-app-v2-'+hash.digest('hex').slice(0,16);
const sw=`const CACHE=${JSON.stringify(cache)};
const FILES=${JSON.stringify(files.map(f=>f==='index.html'?'':f))};
const absolute=p=>new URL(p,self.registration.scope).href;
const SHELL=absolute('');
// Navigation requests use redirect: manual. Never replay a followed redirect.
const navigationResponse=response=>response.redirected?new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers}):response;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 await c.addAll(FILES.filter(f=>f!=='').map(f=>new Request(absolute(f),{cache:'reload'})));
 const shell=await fetch(SHELL,{cache:'reload'});
 if(!shell.ok)throw Error('Application shell unavailable');
 await c.put(SHELL,navigationResponse(shell));
 // Replace the previous broken navigation handler, even with an old tab open.
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('nothing-sim-app-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&[absolute(''),absolute('index.html')].includes(url.origin+url.pathname)){
  event.respondWith(caches.open(CACHE).then(c=>c.match(SHELL)).catch(()=>undefined).then(r=>r?navigationResponse(r):fetch(request)));return;
 }
 if(FILES.some(f=>absolute(f)===url.href))event.respondWith(caches.open(CACHE).then(c=>c.match(request)).catch(()=>undefined).then(r=>r||fetch(request)));
});
`;
await writeFile(join(dist,'sw.js'),sw);
console.log('Installable web app:',files.length,'cached files;',cache);
