import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
const root=resolve('dist'),output=resolve('playtest');
let html=await readFile(resolve(root,'index.html'),'utf8');
// The portable file has no service worker, manifest or external icon files.
html=html.replace(/<link\b[^>]*rel="(?:manifest|apple-touch-icon)"[^>]*>/g,'');
const asset=async url=>{
 if(!/^\/?(?:\.\/)?assets\/[a-zA-Z0-9_.-]+$/.test(url))throw Error('Unexpected production asset: '+url);
 const path=resolve(root,url.replace(/^\//,''));
 if(!path.startsWith(root+sep))throw Error('Asset outside production directory');
 return readFile(path,'utf8');
};
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
const styles=[...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g)];
if(scripts.length!==1||styles.length!==1)throw Error('Expected one bundled script and stylesheet; inspect production assets before packaging');
for(const m of scripts){
 const js=await asset(m[1]);
 if(/<\/script/i.test(js))throw Error('Inline script terminator found; refusing unsafe packaging');
 html=html.replace(m[0],()=>'<script type="module">'+js+'</script>');
}
for(const m of styles){
 const css=await asset(m[1]);
 if(/<\/style/i.test(css))throw Error('Inline style terminator found; refusing unsafe packaging');
 html=html.replace(m[0],()=>'<style>'+css+'</style>');
}
if(/<link\b[^>]*rel="modulepreload"/i.test(html))throw Error('Unexpected split bundle; portable build must be self-contained');
await mkdir(output,{recursive:true});
await writeFile(resolve(output,'Corporate Simulator 2026.html'),html);
console.log('Portable playtest packaged:',Buffer.byteLength(html),'bytes');
