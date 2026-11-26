# Chapter 1 | The Night Everything Changed

> “A final task acquires its true weight at the moment somebody asks you to stand up and do it.” — The Founder of NOTHING™

I had reached the stage of software development when everything looked complete to someone scrolling past it. The application could launch. The tests passed. The documentation had the calm precision of something written by people who had proved the sentences they were using. A person who ran the application got an enterprise startup, three stages, a final declaration of operational neutrality and the return of their command prompt. Nothing followed them out of the program. I thought this was a strong offer.

Then I tried to distribute it.

Release work has a way of escalating quietly. One moment you are looking at a satisfactory transcript. The next, you are considering whether an old commit contains information you would prefer to keep private. The contents of the current source tree and the history behind it are different bodies of material. Removing material from one does very little to the other. An enterprise audience would reasonably expect the founder of an outcome-neutral company to understand the difference before making anything public. My enterprise audience was imaginary, but I refused to give it cause for an imaginary privacy complaint.

We kept the original repository private. The current source was cleaned and verified. The migration bundle carried a single new root commit and used my GitHub noreply identity. I liked the word *root*. It suggested we had gone all the way down to the origin of the problem and started afresh. In reality, we had started afresh at a very precise boundary. To one side were the files we meant to distribute. To the other were previous events, still part of a real private history. We could retain both without confusing them. I briefly felt the rush of a man who has successfully organised something that is supposed to produce nothing.

## The first branch

The destination was empty. This was thematically excellent and operationally awkward. An attempt to create the first branch through the available GitHub API met HTTP 409. The number was admirably specific. It supplied the exact amount of reassurance you might expect from a conflict notice on a repository with nothing in it.

An ordinary Git push was the remaining route, but the workspace lacked authenticated access to perform it. The bundle itself remained sound. There was a branch to push, a destination to push to and a short sequence of instructions for somebody operating an authenticated terminal. We had arrived at a peculiar place in the project. Every object required for the handoff existed. Its energy of activation was a person.

I was in bed.

Here I must reconstruct the executive environment with care. The room was sufficiently comfortable that I had spent no time considering it an environment. The duvet was warm along both shoulders. The task would have been inconvenient in an extremely ordinary way. I could have got up. I could have opened a terminal in the right place, checked access and attempted the first push. After that, the destination would still have required verification and I would still have had a separate publication decision to make. The phrase *one remaining operation* was accurate as a description of the immediate bottleneck. It was a poor description of where the evening would end if I removed it.

Some readers will object that a push can be done quickly. I welcome the objection. It is the first sign that you have begun to understand how a small operation can recruit a willing executive. Once you are sitting at a terminal, the distance between running a command and spending another twenty minutes reviewing its consequence appears to shrink. It shrinks most dramatically at the point when your bedtime is already behind you. I would have checked the result. I would have waited for the destination checks. I would have formed an opinion about whether it made more sense to keep going. The first step might have been quick. I had no basis for making the same promise about the person I would become after taking it.

My body was already in the only position from which I could consider that chain of events dispassionately. I elected to stay there.

## The decision after the failure

The technical failure occurred before my decision. We tried the migration and hit two different access problems. My contribution was to decline the obvious escalation. I find it important to get the credit in that order. If I claimed I had designed the repository to reject the first branch, I would deprive the access boundary of its legitimate achievement. If I claimed the program was broken, I would deprive engineering of theirs. What remained available for executive credit was the judgement to leave a failed deployment in precisely the condition in which I found it.

By the rules of ordinary productivity, this was an anti-climax. According to the incident record, it was the inaugural critical case in our private satirical severity scheme. We called it **SEV-0: Critical Failure to Deliver Nothing**. There was no active service outage. There were no contracted customers to compensate. There was an extraordinary gulf between the engineering work performed and the public availability it produced. I believed a gulf of that quality deserved its own incident identifier.

I began to understand the situation through three gates. The first gate asked whether the product worked. The answer was yes. The second asked whether the intended distribution path was open. The answer was no. The third asked whether the owner would authorise and pursue the remaining operation that evening. I took responsibility for the answer to that question. Once the gates were separated, I could acknowledge success, failure and choice, all within a single paragraph. This was the first time I suspected that the field of leadership might be richer than the phrase *just finish it*.

I later found it useful to write the release state in three lines:

| Question | Finding |
| --- | --- |
| Can a person with an approved copy run it? | Yes. The runtime is verified. |
| Did the clean first push occur? | No. The intended destination remained empty. |
| Was a public release authorised or made? | No. Public availability was postponed indefinitely. |

It looked austere enough to frame. In fact, I considered briefly whether printing and framing it would constitute the most useful output of the entire project. I left that question with the simulated board.

## The option to remain

I have often heard courage described as the willingness to do a difficult thing. I wish to draw your attention to how much effort goes into deciding whether a thing deserves to become difficult. Had an actual user been relying on the service, the governing decision would have been different. Had we made a contractual promise, I would have had the inconvenience of a real obligation. Here, the promise was a product joke and the only person who could reopen the evening was me. I found myself unwilling to grant the smallest action in the plan automatic control over every action that could follow it.

That is how I remember our first launch. The engineering succeeded. The deployment failed. I learnt that it was possible to be accountable for the third sentence without rewriting the first two. The duvet, which had supported my thinking throughout, was unavailable for comment.

### Reflection | Find the point of escalation

Take a recent project and write its product, distribution and authority gates on three separate lines. Identify the exact action that turned a finished artefact into an evening you could no longer guarantee would end. Which person actually held the authority to postpone that action? If the answer was you, write what you decided in plain language. You will have ample opportunity to improve the wording later.
