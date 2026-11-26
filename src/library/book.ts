import {sectionsA} from './sections-a';
import {sectionsB} from './sections-b';
import {escapeHtml,renderChapter} from './format';
export const BOOK_TITLE='The Art of Doing Nothing™';
export const BOOK_SUBTITLE='How I Revolutionised Productivity Without Leaving My Bed';
export const BOOK_TAGLINE='From Burnout to Bed-Led Leadership';
export const BOOK_SECTIONS=[...sectionsA,...sectionsB];
export const BOOK_READING_KEY='nothing-sim:library-position';
export function sectionIndex(id:string|null){const i=BOOK_SECTIONS.findIndex(s=>s.id===id);return i<0?0:i;}
export function readPosition(){try{return sectionIndex(localStorage.getItem(BOOK_READING_KEY));}catch{return 0;}}
export function savePosition(index:number){try{localStorage.setItem(BOOK_READING_KEY,BOOK_SECTIONS[index]?.id??BOOK_SECTIONS[0].id);}catch{/* optional local bookmark */}}
export function offlineEdition(cover:string){
 const nav=BOOK_SECTIONS.map(s=>'<li><a href="#'+s.id+'">'+escapeHtml(s.title)+'</a></li>').join('');
 const pages=BOOK_SECTIONS.map((s,i)=>'<section id="'+s.id+'">'+renderChapter(s.text)+'<nav aria-label="Chapter navigation">'+(i?'<a href="#'+BOOK_SECTIONS[i-1].id+'">Previous</a> ':'')+'<a href="#contents">Contents</a>'+(i+1<BOOK_SECTIONS.length?' <a href="#'+BOOK_SECTIONS[i+1].id+'">Next</a>':'')+'</nav></section>').join('');
 const safeCover=/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(cover)?'<img src="'+cover+'" width="120" height="180" alt="Book cover">':'';
 const css='*{box-sizing:border-box}body{margin:0;background:#faf6ed;color:#14263d;font:clamp(17px,2.3vw,20px)/1.7 Georgia,serif}header{text-align:center;background:#14263d;color:#f4e9ce;padding:2rem 1rem}main{max-width:790px;margin:auto;padding:1rem}section{border-top:2px solid #b28b43;margin-top:2rem;padding-top:1rem}a{color:#15486c}blockquote{border-left:3px solid #b28b43;padding-left:1rem;margin-left:0}.table-scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:420px;font-size:.85em}td,th{padding:.5rem;border:1px solid #c9bdab;text-align:left;vertical-align:top}th{background:#e9dfcb}nav{margin:1rem 0}h1,h2,h3,h4{line-height:1.25}@media print{header{background:white;color:black}section{break-before:page}nav{display:none}body{font-size:12pt}}';
 return '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+BOOK_TITLE+'</title><style>'+css+'</style></head><body><header>'+safeCover+'<h1>'+BOOK_TITLE+'</h1><p>'+BOOK_SUBTITLE+'</p><p>'+BOOK_TAGLINE+'</p><p>The Founder of NOTHING™</p></header><main><nav id="contents" aria-label="Table of contents"><h2>Contents</h2><ol>'+nav+'</ol></nav>'+pages+'</main></body></html>';
}
