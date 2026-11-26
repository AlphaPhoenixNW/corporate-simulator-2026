import {readFile,readdir,mkdir,writeFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='docs/companion-book/manuscript';
const names=await readdir(dir);
const ordered=['MANUSCRIPT.md','front-matter.md',...names.filter(x=>/^\d\d-/.test(x)).sort(),'conclusion.md','acknowledgements.md',...names.filter(x=>/^appendix-/.test(x)).sort()];
assert.equal(ordered.length,22);
assert.equal(ordered.filter(x=>/^\d\d-/.test(x)).length,12);
assert.equal(ordered.filter(x=>/^appendix-/.test(x)).length,6);
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const inline=s=>esc(s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
function render(source){
 const lines=source.trim().split(/\r?\n/);let out='',i=0;
 const cells=l=>l.trim().slice(1,-1).split('|').map(c=>inline(c.trim()));
 while(i<lines.length){let line=lines[i].trim();if(!line){i++;continue;}
  const heading=line.match(/^(#{1,6})\s+(.+)$/);
  if(heading){const n=Math.min(6,heading[1].length+1);out+='<h'+n+'>'+inline(heading[2])+'</h'+n+'>';i++;continue;}
  if(line.startsWith('|')&&/^\|\s*[-:]+/.test(lines[i+1]??'')){
   out+='<div class="table-scroll" tabindex="0" role="region" aria-label="Book table"><table><thead><tr>'+cells(line).map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>';i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){out+='<tr>'+cells(lines[i++]).map(x=>'<td>'+x+'</td>').join('')+'</tr>';}out+='</tbody></table></div>';continue;
  }
  if(/^>\s?/.test(line)){let parts=[];while(i<lines.length&&/^>\s?/.test(lines[i]))parts.push(lines[i++].replace(/^>\s?/,''));out+='<blockquote>'+inline(parts.join(' '))+'</blockquote>';continue;}
  if(/^[-*]\s|^\d+\.\s/.test(line)){const numbered=/^\d+\.\s/.test(line),tag=numbered?'ol':'ul',pattern=numbered?/^\d+\.\s+/:/^[-*]\s+/;out+='<'+tag+'>';while(i<lines.length&&pattern.test(lines[i].trim()))out+='<li>'+inline(lines[i++].trim().replace(pattern,''))+'</li>';out+='</'+tag+'>';continue;}
  if(/^---+$/.test(line)){out+='<hr>';i++;continue;}
  let parts=[line];i++;while(i<lines.length&&lines[i].trim()&&!/^(#|>|\||[-*]\s|\d+\.\s|---+$)/.test(lines[i].trim()))parts.push(lines[i++].trim());
  out+='<p>'+parts.map(x=>inline(x.replace(/\\$/,''))).join(' ')+'</p>';
 }return out;
}
const sections=[];
for(const file of ordered){const source=await readFile(dir+'/'+file,'utf8');assert(source.length>100);const heading=source.match(/^# (.+)$/m)?.[1]??file;sections.push({id:file.replace(/\.md$/,''),heading,html:render(source)});}
const cover=await readFile('docs/companion-book/cover-thumbnail.webp');
assert.equal(cover.length,3340);
const nav=sections.map(s=>'<li><a href="#'+s.id+'">'+esc(s.heading)+'</a></li>').join('');
const pages=sections.map((s,i)=>'<section id="'+s.id+'" class="chapter">'+s.html+'<nav class="chapter-nav" aria-label="Chapter navigation">'+(i?'<a href="#'+sections[i-1].id+'">Previous section</a>':'')+'<a href="#contents">Contents</a>'+(i+1<sections.length?'<a href="#'+sections[i+1].id+'">Next section</a>':'')+'</nav></section>').join('');
const css=':root{color-scheme:light;--ink:#14263d;--gold:#98702c;--paper:#faf6ed}*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:var(--paper);color:var(--ink);font:clamp(17px,2.3vw,20px)/1.7 Georgia,serif}header{background:var(--ink);color:#f4e9ce;padding:2rem 1rem;text-align:center}header img{width:120px;height:180px;object-fit:contain;border:1px solid #d6b576}h1{font-size:clamp(1.9rem,6vw,3rem);line-height:1.15;margin:.7rem 0}h2,h3,h4{line-height:1.3}main{max-width:790px;margin:auto;padding:1rem 1.2rem}a{color:#15486c;text-decoration:underline;text-underline-offset:3px}a:focus-visible{outline:3px solid #98702c;outline-offset:3px}blockquote{border-left:3px solid var(--gold);margin:1.4rem 0;padding:.4rem 1rem;font-style:italic}.chapter{border-top:2px solid #bda16e;padding:1rem 0 2rem;scroll-margin-top:1rem}.table-scroll{overflow-x:auto;margin:1.4rem 0}table{border-collapse:collapse;font-size:.82em;min-width:420px;width:100%}th,td{border:1px solid #c9bdab;text-align:left;vertical-align:top;padding:.55rem}th{background:#e9dfcb}.chapter-nav{display:flex;flex-wrap:wrap;gap:1rem;font:600 .82rem system-ui;margin-top:2rem}.notice{font:normal .9rem/1.5 system-ui;background:#e9dfcb;padding:1rem;border-radius:5px}footer{text-align:center;font:normal .8rem system-ui;padding:2rem}@media print{header{background:white;color:black}nav,.chapter-nav{display:none}.chapter{break-before:page}body{font-size:12pt}main{max-width:none}}';
const html='<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Art of Doing Nothing | Private reading preview</title><style>'+css+'</style><body><header><img src="data:image/webp;base64,'+cover.toString('base64')+'" alt="Original book cover, showing the founder reclining in bed"><h1>The Art of Doing Nothing™</h1><p>From Burnout to Bed-Led Leadership</p><p>The Founder of NOTHING™</p></header><main><p class="notice">Private editorial reading preview. Management satire. Private source-document links are rendered as plain text. The original Markdown manuscript is retained in the repository.</p><nav id="contents" aria-label="Table of contents"><h2>Contents</h2><ol>'+nav+'</ol></nav>'+pages+'</main><footer>NOTHING™ Executive Leadership Institute · Fictional publisher</footer></body></html>';
assert.equal(sections.length,22);
assert(!html.includes('../../docs/incidents/'));
await mkdir('playtest',{recursive:true});
await writeFile('playtest/Executive Library.html',html);
try{await access('dist/Executive Library.html');throw Error('Private book must not be published in dist');}catch(e){if(e.code!=='ENOENT')throw e;}
console.log('PRIVATE_BOOK_PREVIEW',sections.length,'sections',Buffer.byteLength(html),'bytes');
