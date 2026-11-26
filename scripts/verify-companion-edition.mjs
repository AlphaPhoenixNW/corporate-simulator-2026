import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const sourceDir='docs/companion-book/manuscript';
const files=await readdir(sourceDir);
const order=['MANUSCRIPT','front-matter',...files.filter(f=>/^\d\d-/.test(f)).sort().map(f=>f.slice(0,-3)),'conclusion','acknowledgements',...files.filter(f=>/^appendix-/.test(f)).sort().map(f=>f.slice(0,-3))];
const load=async name=>{
 const source=await readFile('src/library/sections-'+name+'.ts','utf8');
 return JSON.parse(source.slice(source.indexOf(' = ')+3).trim().replace(/;$/,''));
};
const sections=[...await load('a'),...await load('b')];
assert.equal(sections.length,22);
assert.deepEqual(sections.map(s=>s.id),order);
for(const s of sections){
 let original=await readFile(sourceDir+'/'+s.id+'.md','utf8');
 if(s.id==='MANUSCRIPT'){
  original=original.replace(/This private manuscript is management satire\. The launch attempt and its disposition follow the \[incident record\]\([^)]+\)\./,'This companion edition is management satire. The launch attempt described in the book refers to an earlier project incident, not the current availability of Corporate Simulator 2026™.').replace(/\[Table of contents\]\(CONTENTS\.md\) links the authoritative sections of this manuscript, from the foreword through Appendix F\./,'Use the reader’s table of contents to navigate from the foreword through Appendix F.');
 }
 assert.equal(s.text,original,'Unexpected alteration: '+s.id);
 assert.equal(s.title,s.text.match(/^# (.+)$/m)?.[1]);
 assert(!/\]\([^)]*\)|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(s.text),'Unreviewed link or email: '+s.id);
}
console.log('COMPANION_EDITION_VERIFIED',sections.length,'sections; original prose preserved except approved publisher note/navigation wording');
