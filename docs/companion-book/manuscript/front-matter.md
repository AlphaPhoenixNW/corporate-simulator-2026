# A Word From the Founder

I was horizontal when I first understood the burden of leadership. I remember the position because it was the only part of the evening that went exactly to plan. The duvet had reached a satisfactory height. The room required no decisions. Somewhere beyond the edge of the bed, an authenticated Git operation stood between a fully verified piece of software and the beginning of a release procedure.

People often ask what I felt in that instant. I felt the temperature difference between the underside of the duvet and the air I would have to enter. This was unusually clear information. Many executives spend years trying to obtain such a direct reading of the operating environment. I obtained mine by moving one hand a short distance beyond the seam.

I had been taught to regard the last outstanding task as a test of character. Finishing would prove I was the kind of person who finished things. I remember thinking that my character had enjoyed unlimited access to my evenings for several years and had submitted remarkably little evidence of what it was doing with them. I brought my hand back under the duvet and resolved to review the matter at a more senior level.

The decision itself took very little time. Developing a language in which it could be described as a decision took longer. This book represents that investment.

I have written it for the leader who has done everything necessary up to the point where something is required of them. You may recognise this point in your own career. A team has performed admirably. A set of instructions exists. Somebody has said, with entirely good intentions, that it should only take a minute. At that moment, I want you to consider the full weight of the word *only*. It has been used to admit an extraordinary number of minutes into places where those minutes had no right to be.

I cannot promise that the method will save you time. Consider how much of this book remains. I can promise that by the end you will have a vocabulary for the time you decide to spend in precisely the manner in which you were already spending it. As leadership investments go, I consider this exceptionally well aligned.

# Introduction | One Remaining Operation

I founded NOTHING™ to make software that delivered zero meaningful business outcomes. The specification was unusually testable. Run the application. Observe the startup sequence, three finite internal stages and a confirmation of operational neutrality. Observe a clean exit. Any meaningful business outcome would have represented scope creep.

I still wanted to release it. There is a particular pride in making even an absurdly small program reliable. When an application deliberately promises nothing, the least you can do is ensure that it does so correctly. We verified the text it printed. We checked that it could repeat the performance without leaving work behind. We verified source packaging and ran hosted checks on Linux, macOS and Windows in the private development repository. The software was more punctual about ending than most meetings I have attended.

The part of the project I had mentally marked as *distribution* contained a different problem. Git history in the original repository held private information, so we cleaned the current source and prepared a separate bundle with one new root commit under my GitHub noreply identity. The empty private destination would not accept an initial branch via the available API, and the execution workspace lacked authenticated Git access for the first push. The bundle could be handed to an authorised operator. The destination could then be verified. Public availability would still require its own owner decision.

I make that sequence clear because it is possible to tell a shorter story in which I simply forgot to press a button. That version lacks the operating context in which I made history. It also leaves me dangerously close to the kind of fool who presses a button before checking what will become public.

I use four words differently in this book, so I will define them while we still trust one another.

| Word | Meaning in this book |
| --- | --- |
| Work | An effort somebody can describe, assign and, when the effort is useful, verify |
| Output | An artefact or event produced by that effort, such as a test log or an executable |
| Outcome | A change in the world somebody would have reason to care about |
| Intervention | An act for which the leader has decided to leave their current state, physically or otherwise |

The passing tests were output. The compiled evidence around them was work. The availability of a public release would have been an outcome. Remaining in bed was an intervention only in the sense that I made a decision about it. This left me with a concept I found difficult to resist. If I could preserve the state of the world and still provide a detailed account of what I had done, there was an entire management discipline waiting to be written down.

The chapters start with the incident and build outwards. Posture will become a management model. A five-hour schedule will become a workweek. I will take a stakeholder apology, write thought leadership about it and then construct an organisation capable of financing all that activity with no expectation of a return. At each step I will try to give you something concrete to work with. I feel strongly about the quality of the materials.

You may discover an instance where a lesson is genuinely useful. In that event, please treat it as an incidental reading experience. I have budgeted for a small amount of variance.
