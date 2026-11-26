import {describe,it,expect} from 'vitest';
import {AMBIENT_STEP,AMBIENT_DURATION,AMBIENT_CHORDS,ambientFrame} from '../../src/ui/ambience';
describe('low-fatigue ambient score',()=>{
 it('provides a varied harmonic cycle longer than two minutes, without adjacent repeats',()=>{
  expect(AMBIENT_CHORDS.length*AMBIENT_STEP).toBeGreaterThanOrEqual(120);
  expect(new Set(AMBIENT_CHORDS.map(c=>c.join(','))).size).toBe(AMBIENT_CHORDS.length);
  for(let i=0;i<AMBIENT_CHORDS.length;i++)expect(ambientFrame(i)).not.toEqual(ambientFrame(i+1));
  expect(ambientFrame(AMBIENT_CHORDS.length)).toEqual(ambientFrame(0));
 });
 it('uses restrained, overlapping sustained voices rather than short repetitive melody notes',()=>{
  expect(AMBIENT_DURATION).toBeGreaterThan(AMBIENT_STEP);
  for(let i=0;i<AMBIENT_CHORDS.length;i++){
   const voices=ambientFrame(i);
   expect(voices).toHaveLength(5);
   expect(voices.reduce((sum,v)=>sum+v.level,0)).toBeLessThan(.2);
   for(const v of voices){
    expect(v.midi).toBeGreaterThanOrEqual(40);expect(v.midi).toBeLessThanOrEqual(72);
    expect(v.attack).toBeGreaterThanOrEqual(1);expect(v.release).toBeGreaterThanOrEqual(3);
    expect(v.attack+v.release).toBeLessThan(AMBIENT_DURATION);
   }
  }
 });
});
