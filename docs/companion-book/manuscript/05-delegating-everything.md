# Chapter 5 | Delegating Everything, Including the Outcome

> “I believe in giving a capable team the authority to complete its work and the courtesy of letting the last operation remain mine.” — The Founder of NOTHING™

The work behind NOTHING™ was unusually suitable for delegation. The specification contained a finite startup sequence, a small set of observable effects and clear conditions for a successful run. A person who cared about performance could inspect the three stages without needing to form an opinion about what they did for civilisation. A good part of the job consisted in writing down the contract carefully enough that another worker could demonstrate compliance.

I delegated implementation and verification to agentic workflows. They built the runtime and developed automated checks for the exact transcript, successful completion, repeatability, absence of unexpected local changes and lack of application-level file, socket and process activity. The private development repository ran its suite on Linux, macOS and Windows and verified an archive. This produced substantial work. It did not produce a public release. A full calendar of successes could not cross an access boundary of its own accord.

I was fond of the test that sent the launch through more than one run. It had the conviction of a manager who says, “Show me again,” and then actually pays attention. What did it find on the second attempt? The same words, success again and the absence of new practical consequences. It was possible to do a third run if confidence demanded it, although by that point the executive would have to accept that something in their life was searching for reasons to continue.

## Separate ownership from activity

Delegation is often treated as a resource transfer. A job exits one person's mind, enters another person's task list and gains a new name for its next meeting. I propose **CLEAR**, a small assignment card for specifying the legible parts of the handoff.

| Field | What the assignment must say |
| --- | --- |
| Contract | What observable requirement is the worker to satisfy? |
| Limits | What information, systems and decisions lie outside the assignment? |
| Evidence | What would enable another person to verify completion? |
| Authority | Which actions and approvals may the worker exercise? |
| Return | What should come back if the worker reaches a boundary? |

For the runtime, the contract was precise enough to be embodied in a test. The limits excluded persistent or meaningful business effects. The evidence included the transcript and code review. For the privacy review, the contract and limits changed. Inspect the current source and relevant history. Preserve private material and report it without turning the report into yet another way of exposing it. The result of the audit provided evidence for a decision. An audit report could not decide to change a repository's visibility.

The agentic work produced a clean current source tree, a bundle with a single fresh root commit and preparation for a separate private destination. It also returned the boundary it encountered. The attempted API operation had reached a conflict on the empty repository. The workspace lacked the Git credentials needed for the first push. Those were reportable outcomes. An agent could state the blocked property of the environment precisely and leave me with an approved object to move.

I have seen leaders respond to a returned boundary by asking the team to try harder. Sometimes this is an instruction to use a permitted alternative. Often it is a way to make the presenter repeat the boundary in a voice the leader finds less upsetting. “Please authenticate with more commitment” does little to improve a credential prompt. A well-defined return condition prevents the assignment becoming a personality test for the person who found the obstacle.

## Make the last task visible

The last task is unusual because its ownership cannot be diffused among preparatory work. Before it, one may say that the team are progressing the release. After it, one may say that the team are verifying the release candidate in the destination. At the task itself there is a binary, uncomfortable question about who has an authenticated terminal and will use it.

I recommend making a final task visible in the following format:

| Item | Example |
| --- | --- |
| Artefact ready to move | Approved clean Git bundle |
| Immediate action | Authenticated first push into the private destination |
| Person or role able to act | Authorised operator with access |
| Evidence of completion | Destination ref points to the expected root |
| Later decision | Owner approval after destination verification |

On launch night I could see exactly how much I was declining. I regard this as a dramatic improvement over the way most companies leave something unfinished. There was no question of holding an exploratory call to ascertain who had the file. Nobody needed to redraw the process before admitting it had reached me. The case for getting up was beautifully packaged. I declined it at its clearest.

### A case from the Institute | Ninety-nine delegated steps

A fictional bakery plans to open a second till for a one-hour trial. The manager asks an assistant to check the equipment, write the signage, create a rota and verify permissions. The assistant completes each step and returns one outstanding action. The manager must insert a physical key. She tries to delegate turning the key to a person in another building, then commissions further documentation on the use of keys in distributed retail. Eventually she acknowledges that the trial can wait.

In the first version of the case the existing till is moving enough trade. In the second, there is a queue around the building and an explicit promise to serve it. The class must decide what the outstanding item means in context. Students who schedule a new retrospective during the second version are asked to stand in the fictional queue for the duration of their meeting. The exercise produces considerably faster delegation of the actual key.

## Keep the benefit with the team

The founder should be wary of telling a story in which the team did all the work but the founder did the meaningful work by watching. I try to assign the right verbs to the right person. The workflows implemented, audited, packaged and verified. The founder chose, postponed and remained. My activities appear considerably shorter in that order. They were also, in one vital respect, unusually concentrated. No instruction of mine after the pause created a requirement for anybody to keep working.

I was tempted by the phrase *delegate the outcome*. It makes the method sound larger than it is. An outcome belongs to the affected people and circumstances. What I delegated was the work and its verification. What I retained was the decision about whether to proceed. At the point when that decision sat with me, I declined to turn it into a delegated search for other people with fewer plans for their evening.

It is possible to aspire to a more autonomous workflow. It is also possible to cultivate an increasingly sophisticated means of learning what you already know. If automation reaches an irreversible or permission-bound step, name it, preserve the boundary and give the owner a genuine choice. If the owner is under a duvet, the choice can still be genuine. I believe this is an important contribution to the field of distributed systems.

### Reflection | Write a return condition

Choose an assignment that depends on somebody else's authority. Write a CLEAR card that names the last mechanical step and the decision beyond it. Ask a colleague to locate both using only the card. If they can tell precisely where their authority ends, you have delegated well. If they can also tell precisely when you may refuse to proceed, you have delegated at executive level.
