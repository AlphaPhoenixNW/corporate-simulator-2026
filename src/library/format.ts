// Text-only Markdown subset used by the companion manuscript. All source markup is escaped before formatting.
export const escapeHtml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const inline=(s:string)=>escapeHtml(s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
export function renderChapter(source:string){
 const lines=source.trim().split(/\r?\n/);let out='',i=0;
 const cells=(l:string)=>l.trim().slice(1,-1).split('|').map(c=>inline(c.trim()));
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
