import {describe,it,expect} from 'vitest';
import {BOOK_SECTIONS,BOOK_TITLE,sectionIndex,offlineEdition} from '../../src/library/book';
import {renderChapter} from '../../src/library/format';
describe('companion book edition',()=>{
 it('includes the complete ordered manuscript without private source links',()=>{
  expect(BOOK_SECTIONS).toHaveLength(22);
  expect(BOOK_SECTIONS.filter(s=>/^\d\d-/.test(s.id))).toHaveLength(12);
  expect(BOOK_SECTIONS.filter(s=>s.id.startsWith('appendix-'))).toHaveLength(6);
  expect(new Set(BOOK_SECTIONS.map(s=>s.id)).size).toBe(22);
  expect(BOOK_SECTIONS[0].text).toContain('earlier project incident');
  expect(BOOK_SECTIONS[1].text).toContain('Introduction');
  for(const s of BOOK_SECTIONS){expect(s.text.length).toBeGreaterThan(100);expect(s.text).not.toMatch(/\]\([^)]*\)|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);}
 });
 it('resolves a reading bookmark safely',()=>{
  expect(sectionIndex(null)).toBe(0);expect(sectionIndex('invalid')).toBe(0);
  expect(sectionIndex('10-the-bed-led-organisation')).toBe(11);
  expect(sectionIndex('appendix-f-frequently-asked-questions')).toBe(21);
 });
 it('renders escaped source, headings, quotations and readable table markup',()=>{
  const result=renderChapter('# Heading\n\n<script>alert(1)</script> **bold** *italic*\n\n> Quote\n\n| A | B |\n| --- | --- |\n| C | D |');
  expect(result).toContain('<h2>Heading</h2>');
  expect(result).toContain('&lt;script&gt;');expect(result).not.toContain('<script>');
  expect(result).toContain('<strong>bold</strong>');expect(result).toContain('<em>italic</em>');
  expect(result).toContain('<blockquote>Quote</blockquote>');expect(result).toContain('<th scope="col">A</th>');expect(result).toContain('<td>D</td>');
 });
 it('builds a self-contained full offline edition with internal navigation and no executable script',()=>{
  const html=offlineEdition('data:image/webp;base64,AAAA');
  expect(html).toContain(BOOK_TITLE);expect(html).toContain('data:image/webp;base64,AAAA');
  for(const s of BOOK_SECTIONS){expect(html).toContain('id="'+s.id+'"');expect(html).toContain('href="#'+s.id+'"');}
  expect(html).not.toMatch(/<script\b|https?:\/\/|\.\.\/\.\.\/docs/);
  expect(offlineEdition('" onerror="alert(1)')).not.toContain('onerror=');
 });
});
