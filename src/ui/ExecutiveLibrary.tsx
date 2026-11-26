import {useEffect,useRef,useState} from 'react';
import cover from '../../docs/companion-book/cover-thumbnail.webp?inline';
import {BOOK_SECTIONS,BOOK_TITLE,BOOK_SUBTITLE,BOOK_TAGLINE,readPosition,savePosition,offlineEdition} from '../library/book';
import {renderChapter} from '../library/format';
export function ExecutiveLibrary({onBack,returnLabel}:{onBack:()=>void;returnLabel:string}){
 const [index,setIndex]=useState(readPosition),[contents,setContents]=useState(false),[large,setLarge]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),reading=useRef<HTMLElement>(null);
 const section=BOOK_SECTIONS[index];
 useEffect(()=>{savePosition(index);},[index]);
 useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo(0,0);},[]);
 const select=(i:number)=>{setIndex(Math.max(0,Math.min(BOOK_SECTIONS.length-1,i)));setContents(false);requestAnimationFrame(()=>{reading.current?.focus({preventScroll:true});reading.current?.scrollIntoView({block:'start'});});};
 const download=()=>{const url=URL.createObjectURL(new Blob([offlineEdition(cover)],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='The Art of Doing Nothing - Companion Edition.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <main className={'library-screen'+(large?' library-large':'')} aria-label="Executive Library">
 <div className="library-top"><button className="secondary" onClick={onBack}>← {returnLabel}</button><span>NOTHING™ EXECUTIVE LEADERSHIP INSTITUTE</span></div>
 <header className="library-cover"><img src={cover} alt="Cover of The Art of Doing Nothing, depicting the founder reclining in bed" width={120} height={180}/><div><p className="eyebrow">OFFICIAL GAME COMPANION</p><h1 ref={heading} tabIndex={-1}>{BOOK_TITLE}</h1><p>{BOOK_SUBTITLE}</p><p className="library-tagline">{BOOK_TAGLINE}</p><small>The Founder of NOTHING™ · 12 chapters · 6 appendices</small></div></header>
 <div className="library-tools"><button onClick={()=>setContents(v=>!v)} aria-expanded={contents}>Table of contents</button><button className="secondary" onClick={download}>Download complete book</button><button className="secondary" aria-pressed={large} onClick={()=>setLarge(v=>!v)}>{large?'Standard text':'Larger text'}</button></div>
 {contents&&<nav className="library-contents" aria-label="Book contents"><ol>{BOOK_SECTIONS.map((s,i)=><li key={s.id}><button className="secondary" aria-current={i===index?'page':undefined} onClick={()=>select(i)}>{s.title}</button></li>)}</ol></nav>}
 <div className="library-location"><label htmlFor="book-section">Reading section</label><select id="book-section" value={index} onChange={e=>select(Number(e.target.value))}>{BOOK_SECTIONS.map((s,i)=><option key={s.id} value={i}>{s.title}</option>)}</select><span aria-live="polite">{index+1} of {BOOK_SECTIONS.length} sections · saved locally</span><progress max={BOOK_SECTIONS.length} value={index+1} aria-label="Reading progress"/></div>
 <article ref={reading} tabIndex={-1} className="library-prose" aria-label={section.title} dangerouslySetInnerHTML={{__html:renderChapter(section.text)}}/>
 <nav className="library-pagination" aria-label="Reading navigation"><button className="secondary" disabled={index===0} onClick={()=>select(index-1)}>Previous section</button><button disabled={index===BOOK_SECTIONS.length-1} onClick={()=>select(index+1)}>Next section</button></nav>
 <footer>Management satire · Fictional publisher · Reading does not consume executive capacity.</footer>
 </main>;
}
