// Original ambient score. Slow, voice-led harmony rather than a repeating hook.
// All timings are seconds; no samples, external assets or simulation RNG.
export const AMBIENT_STEP=8;
export const AMBIENT_DURATION=11;
export const AMBIENT_CHORDS=[
 [48,55,59,62,64], // Cmaj9
 [45,52,55,59,64], // Am9
 [41,53,57,60,64], // Fmaj7
 [43,55,57,60,64], // G6sus
 [52,55,59,62,67], // Em7
 [45,52,59,60,64], // Amadd9
 [41,48,57,60,67], // Fadd9
 [48,55,59,62,67], // Cmaj9
 [50,53,57,60,64], // Dm9
 [43,50,57,60,64], // G6sus
 [45,52,55,60,67], // Am7
 [41,48,57,62,64], // Fmaj13
 [52,55,59,62,64], // Em7
 [50,53,57,62,65], // Dm
 [43,55,59,62,69], // Gadd9
 [48,55,59,64,67], // Cmaj7
] as const;
export interface AmbientVoice {midi:number;level:number;type:'sine'|'triangle';delay:number;attack:number;release:number}
export function ambientFrame(position:number):AmbientVoice[]{
 const chord=AMBIENT_CHORDS[((Math.trunc(position)%AMBIENT_CHORDS.length)+AMBIENT_CHORDS.length)%AMBIENT_CHORDS.length];
 // Restrained bass and warm sustained voices. No percussive lead or rhythmic ostinato.
 return chord.map((midi,i)=>({midi,level:[.065,.043,.034,.025,.019][i],type:i===1?'triangle':'sine',delay:i*.12,attack:1.3+i*.23,release:3.1+i*.12}));
}
