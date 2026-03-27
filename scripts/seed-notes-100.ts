import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const NOTES_DIR = path.join(process.cwd(), "notes");

const NOTES: { title: string; cat: string; body: string; links?: string[] }[] = [
  // ── PHILOSOPHY ──────────────────────────────────────────────────────────────
  {
    title: "Plato's Allegory of the Cave",
    cat: "Philosophy",
    body: `## Shadows on the Wall

Prisoners chained in a cave see only shadows cast by objects behind them. They mistake shadows for reality. When one escapes and sees the sun, he is blinded — then enlightened. Returning to tell the others, they reject him.

**The allegory maps to:**
- The cave = ordinary experience / unexamined life
- The shadows = appearances, media, consensus reality
- The sun = the Form of the Good / ultimate truth
- The prisoner's return = the philosopher's obligation to educate

### The uncomfortable inversion
Most people are confident about reality precisely because they've never questioned its foundations. Epistemic comfort is a warning sign, not a virtue.

> "The measure of a man is what he does with power." — Plato`,
    links: ["The Examined Life", "Epistemic Humility", "Simulation Theory"],
  },
  {
    title: "Nietzsche's Will to Power",
    cat: "Philosophy",
    body: `## Beyond Self-Preservation

Nietzsche rejected Schopenhauer's will to survive as the fundamental drive. The deeper drive: **will to power** — not domination over others, but self-overcoming, growth, the discharge of strength.

The healthy organism doesn't merely persist — it expands, creates, masters its own resistances.

### Misreadings
The Nazis distorted this into racial domination. Nietzsche explicitly rejected nationalism and anti-semitism. His "power" is aesthetic and creative, not political.

### Application
Ask not "how do I survive this?" but "how do I grow through this?" The obstacle is the workout, not the enemy.`,
    links: ["Amor Fati", "Antifragility", "Hormesis"],
  },
  {
    title: "Kant's Categorical Imperative",
    cat: "Philosophy",
    body: `## The Universal Law Test

Kant's supreme principle of morality: *Act only according to that maxim by which you can at the same time will that it should become a universal law.*

**Practical test:** Before acting, ask: what if everyone did this? If universalizing the action produces a contradiction, it's impermissible.

### Examples
- Lying to get what you want → if everyone lied, promises would be meaningless → self-defeating → impermissible
- Helping others in need → universalizable → permissible

### The deeper point
Morality isn't about consequences (utilitarian) or virtue (Aristotle) — it's about rational consistency. Treating persons as ends, never merely as means.`,
    links: ["Effective Altruism", "The Veil of Ignorance"],
  },
  {
    title: "Determinism vs Free Will",
    cat: "Philosophy",
    body: `## The Central Tension

If every event — including every thought and decision — is the result of prior causes governed by physical law, is free will an illusion?

**Three positions:**
1. **Hard determinism** — free will doesn't exist; all actions are causally necessitated
2. **Libertarian free will** — genuine freedom exists; determinism is false
3. **Compatibilism** — free will and determinism are compatible; "free" means uncoerced, not uncaused

### The practical stake
If determinism is true, punishment for crime seems irrational (you couldn't have done otherwise). Yet moral responsibility feels real.

Compatibilism is the dominant view in analytic philosophy: you acted freely if you acted from your own desires without external coercion — regardless of whether those desires were themselves determined.`,
    links: ["The Hard Problem of Consciousness", "Amor Fati", "Epistemic Humility"],
  },
  {
    title: "The Hard Problem of Consciousness",
    cat: "Philosophy",
    body: `## Why Is There Something It's Like to Be You?

David Chalmers distinguished the **easy problems** of consciousness (explaining attention, memory, learning — mechanistic) from the **hard problem**: why does any of this feel like anything at all?

We can explain every functional aspect of vision — photons, retinal cells, visual cortex processing — but not *why* there's a subjective experience of redness.

### Proposed solutions
- **Physicalism** — consciousness is entirely physical; the "hard problem" will dissolve with better neuroscience
- **Dualism** — mind and matter are distinct substances
- **Panpsychism** — consciousness is fundamental, present at all levels of reality
- **Illusionism** — the intuition that consciousness is mysterious is itself an illusion

### Why it matters for AI
A system that passes every behavioral test might have zero inner experience. The hard problem is precisely why we can't know.`,
    links: ["Simulation Theory", "Intelligence Explosion", "Determinism vs Free Will"],
  },
  {
    title: "Existentialism and Bad Faith",
    cat: "Philosophy",
    body: `## Sartre on Self-Deception

Sartre's central claim: *existence precedes essence*. There is no pre-given human nature or purpose. We are "condemned to be free" — radically responsible for what we make of ourselves.

**Bad faith** (*mauvaise foi*): the self-deception of pretending you have no choice. "I had to do it." "That's just who I am." "Society made me this way."

The waiter who performs "waiter-ness" so perfectly he's forgotten he could walk out — that's bad faith. He's playing a role instead of choosing it.

### The anxiety of freedom
Genuine freedom is terrifying. Bad faith is a refuge from that terror. Authenticity requires sitting with the discomfort that nothing is fixed.`,
    links: ["Amor Fati", "The Examined Life", "Radical Acceptance"],
  },
  {
    title: "Absurdism",
    cat: "Philosophy",
    body: `## Camus and the Confrontation

The absurd arises from the collision between human need for meaning and the universe's silence. We demand clarity; reality offers none.

**Three responses:**
1. **Physical suicide** — Camus rejects: avoidance, not resolution
2. **Philosophical suicide** — leap of faith (Kierkegaard); Camus rejects: evasion
3. **Revolt** — live *in spite of* meaninglessness, with full awareness

> "One must imagine Sisyphus happy."

The boulder is pointless. The struggle is everything. Camus's answer is not optimism but defiance — finding joy in the task itself.`,
    links: ["Amor Fati", "Memento Mori", "Existentialism and Bad Faith"],
  },
  {
    title: "Stoic Dichotomy of Control",
    cat: "Philosophy",
    body: `## Epictetus's Fundamental Distinction

*Some things are in our control and others not.*

In our control: opinion, motivation, desire, aversion — our inner life.
Not in our control: body, reputation, property, political office — everything external.

### The liberating implication
Suffering arises from trying to control what you can't. The Stoic practice: *continuously redirect attention to the internal*.

Did someone insult you? The insult is external. Your interpretation and response are internal. You control the second, not the first.

### Modern translation
This is essentially the CBT insight: it's not events that disturb us, but our judgments about events. The Stoics arrived there 2000 years before cognitive therapy.`,
    links: ["Amor Fati", "Radical Acceptance", "Memento Mori"],
  },
  {
    title: "The Paradox of Tolerance",
    cat: "Philosophy",
    body: `## Popper's Counterintuitive Claim

Karl Popper (1945): *If a society is tolerant without limit, its tolerance will be seized or destroyed by the intolerant.*

Therefore, to maintain a tolerant society, we must reserve the right to be intolerant of intolerance.

### The tension
This sounds paradoxical — using intolerance to defend tolerance. But the logic is coherent: tolerance is a social contract. Those who reject the contract (movements committed to destroying tolerance itself) have forfeited its protections.

### Where the line is
Popper was careful: suppress intolerant *actions* and *advocacy of violence*, not merely intolerant *ideas*. Counter bad speech with more speech; suppress only what threatens the foundation.`,
    links: ["Kant's Categorical Imperative", "Effective Altruism"],
  },
  {
    title: "Simulation Theory",
    cat: "Philosophy",
    body: `## Bostrom's Trilemma

Nick Bostrom (2003): at least one of these must be true:
1. Almost all civilizations go extinct before reaching technological maturity
2. Almost no mature civilizations run ancestor simulations
3. We are almost certainly living in a computer simulation

If civilizations survive and have the compute, the number of simulated minds would vastly outnumber biological ones — so any random mind is almost certainly simulated.

### Philosophical stakes
If true: the "physics" we observe could be arbitrary. The "universe" has an author. Free will questions become more complex.

Elon Musk: "The odds we're in base reality is one in billions." Nick Bostrom remains agnostic but takes it seriously.`,
    links: ["The Hard Problem of Consciousness", "Intelligence Explosion", "Plato's Allegory of the Cave"],
  },
  {
    title: "Buddhist Impermanence",
    cat: "Philosophy",
    body: `## Anicca: Everything Flows

The Buddha's teaching on impermanence (*anicca*) is one of the three marks of existence: all conditioned phenomena arise, persist briefly, and pass away.

Suffering (*dukkha*) arises largely from clinging — trying to hold fixed what is inherently transient. A relationship, a feeling of success, a healthy body. They change. Resistance to that change is the source of pain.

### The practice
Not passive resignation but *clear seeing*: notice the arising and passing of sensations, thoughts, emotions in real time. In doing so, the grip loosens.

This maps onto modern psychology: emotional regulation improves when you label emotions ("this is anxiety") rather than fusing with them ("I am anxious").`,
    links: ["Radical Acceptance", "Memento Mori", "The Ship of Theseus"],
  },
  {
    title: "The Hedonic Treadmill",
    cat: "Philosophy",
    body: `## Adaptation to Good and Bad

Hedonic adaptation: humans return to a baseline level of happiness after major positive or negative events. Lottery winners return to near their prior happiness. Accident victims recover to near their prior happiness.

### Implications
- Chasing external goods for lasting happiness is a structural error
- The anticipation of acquisition is often more pleasurable than the acquisition itself
- Gratitude practices work by *disrupting* adaptation — consciously noticing what you'd otherwise take for granted

### The research nuance
Adaptation is not complete or universal. Chronic pain adapts less than expected. Social relationships adapt *upward* — lasting happiness is often found in deepening connection.`,
    links: ["Ikigai", "Memento Mori", "Gratitude Practice"],
  },
  {
    title: "Effective Altruism",
    cat: "Philosophy",
    body: `## Doing the Most Good

EA asks: given that I want to help others, how do I do *the most* good with my time and resources?

**Key moves:**
- Cause impartiality — the geography of suffering is morally irrelevant
- Scale × tractability × neglectedness — prioritize causes that are big, solvable, and underworked
- Earning to give — sometimes maximizing income to donate is more impactful than direct work

### Criticisms
- Ignores justice and structural change in favor of palliative interventions
- Expected value calculations can justify extreme actions (the "galaxy-brained" problem)
- Overly technocratic; misses the relational and community dimensions of ethics

### The lasting insight
Most people give to charities based on emotional resonance, not impact. Even modest attention to effectiveness multiplies good done.`,
    links: ["Kant's Categorical Imperative", "The Veil of Ignorance", "Second-Order Thinking"],
  },
  {
    title: "Hume's Problem of Induction",
    cat: "Philosophy",
    body: `## Can We Trust the Future?

David Hume: we assume the future will resemble the past because it has so far. But this assumption is itself based on past experience — a circular argument.

*The sun has risen every day* doesn't logically guarantee it will rise tomorrow. We *believe* it will because of habit and custom, not rational justification.

### The philosophical fallout
Hume concluded that reason alone can't establish causal connections or justify inductive inference. We operate on habit and psychology, not pure reason.

Kant called this his "Copernican revolution" in philosophy — it woke him from "dogmatic slumber" and led him to argue that the mind actively structures experience.`,
    links: ["Epistemic Humility", "Determinism vs Free Will"],
  },
  {
    title: "Epistemic Humility",
    cat: "Philosophy",
    body: `## Knowing What You Don't Know

Socrates claimed his only wisdom was knowing his own ignorance. The Dunning-Kruger effect is its psychological instantiation: competence correlates inversely with confidence at low levels of knowledge.

**Calibration**: epistemic humility isn't weak beliefs — it's *accurate* beliefs, held with appropriate confidence.

### Practices
- Steel-manning: argue for the position you disagree with as well as its proponents would
- Confidence intervals: attach explicit probability to beliefs
- Track record review: periodically check your past predictions

### The social dimension
Epistemic humility in groups prevents groupthink. Psychological safety — the ability to say "I think we're wrong" — is the strongest predictor of high-performing teams (Google's Project Aristotle).`,
    links: ["The Examined Life", "Hume's Problem of Induction", "Cognitive Biases as Epistemology"],
  },
  {
    title: "Cognitive Biases as Epistemology",
    cat: "Philosophy",
    body: `## The Architecture of Systematic Error

Kahneman and Tversky catalogued ways human reasoning reliably deviates from rationality:

- **Availability heuristic** — probability estimated by ease of recall
- **Anchoring** — first numbers warp subsequent judgment
- **Confirmation bias** — seeking evidence that confirms priors
- **Sunk cost fallacy** — past investment distorts future decisions
- **Scope insensitivity** — willingness to pay to save 2,000 birds ≈ to save 200,000 birds

### The epistemological upshot
Biases aren't character flaws — they're features of our cognitive architecture. System 1 (fast, intuitive) is efficient but error-prone. System 2 (slow, deliberate) corrects but is lazy.

Knowing the catalogue doesn't immunize you — but it provides vocabulary for recognizing errors.`,
    links: ["Epistemic Humility", "Second-Order Thinking", "The Filter Bubble"],
  },
  {
    title: "The Veil of Ignorance",
    cat: "Philosophy",
    body: `## Rawls's Thought Experiment

To determine just social principles, Rawls asks: what rules would you choose if you didn't know your place in society — your class, race, abilities, sex, generation?

Behind the "veil of ignorance," rational agents would choose:
1. Maximum basic liberties for all
2. Social inequalities only if they benefit the worst-off members of society (the *difference principle*)

### Why it's powerful
It operationalizes impartiality. You can't rig the rules in your own favor if you don't know who you are.

### Criticisms
Nozick: individuals have rights that override utilitarian redistribution. Communitarians: the "unencumbered self" is a fiction — identity is constitutively social.`,
    links: ["Kant's Categorical Imperative", "Effective Altruism"],
  },
  {
    title: "Personal Identity Over Time",
    cat: "Philosophy",
    body: `## Who Is the Same Person?

Locke: personal identity is continuity of *consciousness* — memory links present self to past self.

Hume: there is no stable self, only a "bundle" of perceptions with no unifying subject.

Parfit: personal identity isn't what matters. What matters is psychological continuity and connectedness — and this admits of degrees.

### The branching problem
If you're teleported (disassembled, replicated elsewhere), is the resulting person you? What if two copies are made?

Parfit's radical conclusion: we should care less about personal identity (whether it's "really me") and more about what we value — relationships, projects, experiences — which don't require a fixed self to matter.`,
    links: ["The Ship of Theseus", "Buddhist Impermanence", "Determinism vs Free Will"],
  },
  {
    title: "Pascal's Wager",
    cat: "Philosophy",
    body: `## Betting on God

Pascal: even if the probability of God's existence is tiny, the expected value of belief is infinite (eternal life) vs. finite cost (some earthly pleasures). Therefore, rational agents should believe.

**The standard objections:**
- Which God? The wager doesn't specify — you could bet on the wrong deity
- You can't simply choose to believe — belief isn't voluntary in the relevant sense
- Infinite expected values break expected utility theory (Pascal's mugging)

### What survives the critique
The wager is a useful exhibit in decision theory under extreme uncertainty. Its logic — asymmetric stakes justify disproportionate caution — applies more cleanly to existential risk (AI safety, biosecurity) where the downside is irreversible.`,
    links: ["Epistemic Humility", "Intelligence Explosion", "The Hard Problem of Consciousness"],
  },
  {
    title: "The Experience Machine",
    cat: "Philosophy",
    body: `## Nozick's Challenge to Hedonism

If a machine could give you any experience you desired — indistinguishable from reality — would you plug in permanently?

Most people say no. This intuition challenges hedonism (the view that only pleasure/pain matters), because the machine maximizes pleasure.

**Why do we refuse?**
- We want to *actually do* things, not merely seem to
- We care about being a certain kind of person
- We want contact with a deeper reality

### The anti-hedonist implication
Well-being includes more than subjective experience: achievement, authentic relationships, knowledge of reality. The machine test shows we implicitly believe this.`,
    links: ["The Hedonic Treadmill", "Ikigai", "Buddhist Impermanence"],
  },
  {
    title: "Wittgenstein's Language Games",
    cat: "Philosophy",
    body: `## Meaning as Use

The early Wittgenstein (*Tractatus*) held that language pictures facts. The later Wittgenstein (*Philosophical Investigations*) repudiated this: meaning is not a picture but a *use* within a form of life.

Words are like tools — a hammer, a saw, a gauge. Asking "what does a tool do?" has no single answer. Same for words.

**Language games** are the overlapping practices within which words get meaning: giving orders, describing, reporting, speculating, acting in a play.

### The therapeutic upshot
Many philosophical puzzles arise from taking words out of their native context. "What is time?" confuses us because we've extracted the word from the settings where it does work. Philosophy becomes therapy: dissolving pseudo-problems rather than solving them.`,
    links: ["Epistemic Humility", "The Hard Problem of Consciousness"],
  },
  {
    title: "The Fermi Paradox as Philosophy",
    cat: "Philosophy",
    body: `## Where Is Everybody?

The galaxy is ~13 billion years old. Even at sub-light speeds, a civilization could colonize it in ~10 million years — a cosmological eyeblink. Yet we detect no signs of intelligence.

**Proposed resolutions:**
- **The Great Filter** — some step is catastrophically unlikely (abiogenesis, multicellularity, technological civilization, or — worst case — *still ahead of us*)
- **Zoo hypothesis** — they're here, watching, not interfering
- **Rare Earth** — complex life requires implausibly specific conditions

### Why it's philosophical
The Fermi Paradox forces an existential question: is intelligent life structurally self-terminating? If the filter is ahead of us, it implicates AI, biotech, climate — the very technologies we're building now.`,
    links: ["Intelligence Explosion", "Pascal's Wager", "Simulation Theory"],
  },
  {
    title: "McTaggart's A-Series and B-Series",
    cat: "Philosophy",
    body: `## Two Ways of Ordering Time

J.M.E. McTaggart (1908) distinguished:

**A-series**: past, present, future — events have *tensed* properties that flow. What was future becomes present, then past.

**B-series**: earlier-than, simultaneous-with, later-than — fixed relations between events. July 4, 1776 is always earlier than December 7, 1941. No flow.

### The argument
McTaggart argued the A-series is essential to time (change requires tense) but also contradictory (every event is past, present, and future — three incompatible properties). Therefore time is unreal.

### The live debate
Most physicists favor B-series (the block universe — spacetime as a static four-dimensional object). Most humans experience A-series. Reconciling them is still open.`,
    links: ["Determinism vs Free Will", "Buddhist Impermanence"],
  },

  // ── TECHNOLOGY ──────────────────────────────────────────────────────────────
  {
    title: "Moore's Law and Its Limits",
    cat: "Technology",
    body: `## The Doubling That Bent History

Gordon Moore (1965): the number of transistors on a chip doubles roughly every two years, with costs halving. For 50 years, this held.

Now it's slowing. Physical limits (quantum tunneling below ~2nm), economic limits (fab costs), and thermal limits are all pressing simultaneously.

**What comes next:**
- 3D chip stacking (vertical integration)
- Specialized silicon (GPUs, TPUs, NPUs)
- Neuromorphic and analog computing
- Quantum processors for specific problems

### The strategic implication
The era of "rising tide lifts all boats" (general compute gets cheaper) is ending. Competitive advantage shifts to architectural innovation and software efficiency.`,
    links: ["Intelligence Explosion", "Jevons Paradox", "Quantum Computing Basics"],
  },
  {
    title: "The Network Effect",
    cat: "Technology",
    body: `## Value That Compounds With Users

A product exhibits a network effect when its value increases as more people use it. Metcalfe's Law formalizes this: network value scales with n² (the number of possible connections).

**Types:**
- *Direct*: same-side (fax machines, phones — more users → more valuable for each user)
- *Indirect/cross-side*: platforms (more drivers → better for riders; more riders → better for drivers)
- *Data*: more users → better ML models → better product

### The moat
Network effects create winner-take-most dynamics. Once a network reaches critical mass, competing requires not just a better product but simultaneous acquisition of enough users to make it valuable — a near-impossible bar.`,
    links: ["Metcalfe's Law", "The Long Tail Economy", "Platform Thinking"],
  },
  {
    title: "Conway's Law",
    cat: "Technology",
    body: `## Organizations Build Their Mirror

Melvin Conway (1968): *Organizations which design systems are constrained to produce designs which are copies of the communication structures of those organizations.*

A company with four teams will build software with four modules — whether or not that's the optimal architecture.

### The inverse (strategic)
If Conway's Law is true, you can intentionally design your org structure to produce the architecture you want. Amazon's two-pizza teams and API mandate is Conway's Law used offensively.

### Implications for remote teams
Asynchronous, geographically distributed teams produce more modular, API-first architectures — because tight coupling requires tight communication bandwidth that remote teams lack.`,
    links: ["The Unix Philosophy", "API Design as Product Design", "Software Entropy and Technical Debt"],
  },
  {
    title: "The Innovator's Dilemma",
    cat: "Technology",
    body: `## Why Good Companies Fail

Clayton Christensen: well-managed companies fail precisely *because* they listen to their customers and invest in high-margin improvements — leaving them vulnerable to low-end disruption.

**Sustaining vs. disruptive innovation:**
- Sustaining: makes existing products better for existing customers
- Disruptive: initially worse on mainstream metrics, but better on other dimensions (cost, simplicity, accessibility)

### Classic examples
- Minicomputers → PCs
- Film photography → digital
- Taxis → rideshare

### The structural trap
Incumbents can't cannibalize their own margins. The rational decision at every step leads to eventual loss. The solution: create an autonomous unit with its own P&L to pursue disruption.`,
    links: ["The Network Effect", "First Principles Thinking in Engineering", "Second-Order Thinking"],
  },
  {
    title: "Open Source as Philosophy",
    cat: "Technology",
    body: `## Code as Commons

Richard Stallman's GPL established the idea that software freedom is a moral right, not a business model. Linus Torvalds's Linux proved it could produce world-class infrastructure.

**The cathedral vs. the bazaar** (Eric Raymond): proprietary development is a cathedral — planned, hierarchical. Open source is a bazaar — chaotic, parallel, self-organizing. The bazaar wins on reliability.

### Why it matters beyond software
Open source demonstrated that complex, high-quality goods can be produced without monetary incentives through reputation, intrinsic motivation, and network effects.

It's a proof of concept for gift economies at scale — and a template for open science, open hardware, and open AI.`,
    links: ["The Network Effect", "Conway's Law", "The Unix Philosophy"],
  },
  {
    title: "Quantum Computing Basics",
    cat: "Technology",
    body: `## Superposition and Entanglement

Classical bits are 0 or 1. Quantum bits (qubits) can be in superposition — a probabilistic combination — until measured.

**Entanglement**: two qubits can be correlated such that measuring one instantly determines the other, regardless of distance.

**Why this matters:**
- Certain problems (integer factorization, molecular simulation, optimization) scale exponentially on classical hardware
- Quantum algorithms (Shor's, Grover's) offer polynomial or quadratic speedups

### Where we are
NISQ era: ~1000 qubits but high error rates. Fault-tolerant quantum computing likely requires millions of physical qubits per logical qubit. Timeline: 10-20 years to practical quantum advantage at scale.

Current threat: RSA encryption becomes vulnerable when Shor's algorithm runs on large enough hardware.`,
    links: ["Moore's Law and Its Limits", "Zero-Knowledge Proofs", "Intelligence Explosion"],
  },
  {
    title: "Software Entropy and Technical Debt",
    cat: "Technology",
    body: `## Systems Rot Without Tending

Ward Cunningham coined "technical debt" in 1992: quick-and-dirty code is a loan — it enables speed now but accrues interest in future maintenance costs.

**Entropy in practice:**
- Implicit coupling grows as codebase ages
- Documentation drifts from implementation
- Dependencies accumulate security vulnerabilities
- Abstractions leak

### The compounding danger
Unlike financial debt, technical debt is invisible to non-technical stakeholders. Engineers who understand it often lack the standing to prioritize repayment. Systems become unmaintainable before leadership acknowledges the problem.

### The discipline
Regular refactoring, architectural reviews, dependency audits, and "leaving the campsite cleaner than you found it" as a daily practice — not a dedicated sprint.`,
    links: ["Conway's Law", "The Unix Philosophy", "First Principles Thinking in Engineering"],
  },
  {
    title: "The CAP Theorem",
    cat: "Technology",
    body: `## Distributed Systems Cannot Have Everything

Eric Brewer (2000): in a distributed data store, you can guarantee at most two of three properties:

- **Consistency** — every read receives the most recent write
- **Availability** — every request receives a response (not necessarily the latest data)
- **Partition tolerance** — the system continues operating despite network failures

Since partitions are inevitable in real networks, every distributed system must choose: CP or AP.

**Examples:**
- Banks choose CP (correctness over availability)
- DNS chooses AP (availability over immediate consistency)
- Cassandra, DynamoDB: AP with eventual consistency

### The design lesson
There's no universal "best" choice. The right tradeoff depends on your failure modes and business requirements.`,
    links: ["Software Entropy and Technical Debt", "The Unix Philosophy"],
  },
  {
    title: "The Long Tail Economy",
    cat: "Technology",
    body: `## Beyond the Blockbuster

Chris Anderson (2004): digital distribution collapses the economics of shelf space. The "long tail" — millions of niche products each selling small quantities — becomes accessible and profitable in aggregate.

**Pre-internet:** radio plays top 40. Bookstores stock bestsellers. Blockbuster stocks hits.

**Post-internet:** Spotify surfaces obscure 1970s Zambian funk. Amazon sells books with 3 reviews. YouTube hosts content for every conceivable niche.

### The strategic implication
Platforms that aggregate the long tail capture more total value than those competing only for hits. The long tail also democratizes creation: the barrier to reaching a viable audience collapsed.`,
    links: ["The Network Effect", "Metcalfe's Law", "The Innovator's Dilemma"],
  },
  {
    title: "Metcalfe's Law",
    cat: "Technology",
    body: `## n² Value From n Users

Robert Metcalfe: the value of a telecommunications network is proportional to the square of the number of connected users.

2 phones: 1 possible connection. 5 phones: 10. 100 phones: 4,950.

**In practice, the law overstates value** — not all connections are equally valuable. Reed's Law (group-forming networks) scales even faster (2^n), but again in theory.

### The strategic point
Even a sublinear relationship (n log n, n^1.5) implies massive value concentration. First-mover advantage in network markets compounds dramatically — which is why Facebook could spend billions on Instagram and WhatsApp to prevent rival networks from reaching critical mass.`,
    links: ["The Network Effect", "The Long Tail Economy"],
  },
  {
    title: "Emergence in Complex Systems",
    cat: "Technology",
    body: `## The Whole Exceeds the Parts

Emergence: properties of a system that arise from interactions of components but cannot be predicted from the components alone.

- Wetness from H₂O molecules
- Ant colony intelligence from individual ants with no global awareness
- Consciousness from neurons
- Traffic jams from independently rational drivers

### The engineering challenge
You can't unit-test emergent behavior. A system can pass every component test and still fail catastrophically at scale due to interaction effects.

### The design principle
For resilient complex systems: allow local adaptation, maintain loose coupling, avoid single points of control, expect the unexpected. Systems that are tightly controlled often become brittle; systems with distributed agency can adapt.`,
    links: ["The Network Effect", "Antifragility", "Intelligence Explosion"],
  },
  {
    title: "First Principles Thinking in Engineering",
    cat: "Technology",
    body: `## Reasoning From Foundations

Aristotle's first principles: the basic propositions from which everything else is derived, themselves unprovable from anything more fundamental.

In engineering: instead of starting from existing solutions ("everyone uses X"), decompose the problem to its physical/logical foundations and rebuild.

**Elon Musk on rockets:** "A rocket is made of aluminum, steel, copper, titanium. Why does a rocket cost $65M? Well, what's the spot price of those materials on the London Metals Exchange? Turns out it's only $2M. So clearly the industry has some inefficiency."

### When to apply
First-principles is expensive (computationally and time-wise). Use it when:
- Existing solutions are locked by convention, not physics
- The problem is novel enough that analogy misleads`,
    links: ["The Innovator's Dilemma", "Conway's Law", "Software Entropy and Technical Debt"],
  },
  {
    title: "Zero-Knowledge Proofs",
    cat: "Technology",
    body: `## Proving Without Revealing

A zero-knowledge proof allows one party (the prover) to prove to another (the verifier) that a statement is true — without revealing *why* it's true or any information beyond the fact of truth.

**Classic example:** proving you know a secret path through a cave without revealing the path.

**Real applications:**
- Age verification without revealing birthdate
- Financial compliance without revealing transaction details
- Password authentication without transmitting the password
- Blockchain privacy (zk-SNARKs in Zcash, zkEVMs)

### The cryptographic revolution
ZK proofs are enabling a new architecture: verifiable computation. You can prove a computation was done correctly without re-running it. This has implications for AI model auditing, private data computation, and scalable blockchains.`,
    links: ["Quantum Computing Basics", "Blockchain Beyond Crypto"],
  },
  {
    title: "Attention Mechanisms in Transformers",
    cat: "Technology",
    body: `## The Architecture Behind GPT

The transformer (Vaswani et al., 2017) replaced recurrent networks with **self-attention**: for each token in a sequence, compute how much every other token should influence its representation.

**Why it works:**
- Captures long-range dependencies in a single step (vs. RNNs which forget over distance)
- Massively parallelizable (vs. sequential RNN processing)
- Scales predictably with data and compute

### The intuition
Attention is a learned, dynamic reweighting. For the word "bank" in "river bank" vs. "bank account," the model learns to attend to different context words.

### The scaling hypothesis
Kaplan et al. (2020) showed loss decreases as a power law with model size, data, and compute. This empirical regularity enabled the race to GPT-4, Claude, Gemini.`,
    links: ["Intelligence Explosion", "Moore's Law and Its Limits", "Emergence in Complex Systems"],
  },
  {
    title: "The Unix Philosophy",
    cat: "Technology",
    body: `## Small, Sharp Tools

Doug McIlroy's formulation:
1. Write programs that do one thing and do it well
2. Write programs that work together
3. Write programs that handle text streams, because that is a universal interface

### Why it endures
Unix tools (grep, sed, awk, sort, cut) composed via pipes have outlasted dozens of "integrated" alternatives. The interface contract (stdin/stdout text) enables combinatorial utility.

### The design principle generalized
Decompose into small, composable units with clear interfaces. Resist the temptation to build monolithic systems that "do everything." The cost of integration is lower than the cost of bloat.

This maps onto: microservices, functional programming, API-first design, single-responsibility principle.`,
    links: ["Conway's Law", "API Design as Product Design", "Software Entropy and Technical Debt"],
  },
  {
    title: "Reinforcement Learning Intuition",
    cat: "Technology",
    body: `## Learning by Doing

RL: an agent takes actions in an environment, receives rewards, and learns a policy that maximizes cumulative reward. No labeled training data — only feedback.

**Key tension:** exploration vs. exploitation. Exploit known good actions → miss potentially better ones. Explore too much → sacrifice current reward.

**Breakthroughs:**
- AlphaGo: RL + self-play → superhuman Go in weeks
- ChatGPT's RLHF: human preference feedback shapes language model outputs
- Robotics: sim-to-real transfer

### The deep connection
RL is the formal framework behind most theories of biological learning (dopamine = reward signal). The brain may be running something like temporal-difference learning at the synaptic level.`,
    links: ["Intelligence Explosion", "Attention Mechanisms in Transformers", "Emergence in Complex Systems"],
  },
  {
    title: "API Design as Product Design",
    cat: "Technology",
    body: `## Interfaces Are Products

An API is a product whose users are developers. The principles of good UX apply:
- Principle of least surprise (behavior matches expectation)
- Progressive disclosure (simple default, complexity available)
- Fail loudly and clearly (error messages that diagnose, not just report)
- Consistency (similar things look similar)

### The Stripe insight
Stripe's success is often attributed to its API. While competitors had similar pricing, Stripe had an API developers could integrate in hours. Developer experience became competitive moat.

### The Conway connection
Your API reflects your org chart. If internal teams can't agree on data models, the API will expose the disagreement. API design forces organizational clarity.`,
    links: ["Conway's Law", "The Unix Philosophy", "The Network Effect"],
  },
  {
    title: "Human-Computer Interaction Principles",
    cat: "Technology",
    body: `## Designing for Human Minds

Fitts's Law: time to acquire a target is a function of distance and size. Larger, closer targets are faster to click. Every UI decision is an implicit tax on attention.

**Hick's Law**: decision time increases logarithmically with the number of choices. More options = slower decisions = more errors.

**Don Norman's design principles:**
- Affordances (what actions does the object suggest?)
- Feedback (what happened when I acted?)
- Mapping (how do controls relate to outcomes?)
- Constraints (what can't I do?)

### The meta-principle
Good interfaces disappear. The user thinks about their goal, not the interface. When you're aware of the tool, the tool has failed.`,
    links: ["Bicycles for the Mind", "Attention Is the New Scarcity", "Deep Work"],
  },
  {
    title: "Blockchain Beyond Crypto",
    cat: "Technology",
    body: `## Trustless Coordination

A blockchain is an append-only, distributed ledger where consensus replaces central authority. No single party controls the record.

**What this enables beyond currency:**
- Smart contracts: self-executing code with enforceable logic
- Supply chain provenance: immutable record of custody
- Digital ownership: NFTs (even if current applications are speculative)
- DAOs: organizations governed by code and token voting

### The honest assessment
Most blockchain applications don't require blockchains — a regular database is cheaper, faster, and more efficient when trust between parties exists. The value is specific: eliminating a trusted intermediary when none is available or desirable.`,
    links: ["Zero-Knowledge Proofs", "Emergence in Complex Systems", "The Network Effect"],
  },
  {
    title: "Digital Twins",
    cat: "Technology",
    body: `## Mirror Worlds

A digital twin is a real-time virtual replica of a physical object, system, or process — continuously updated with sensor data.

**Applications:**
- Manufacturing: simulate a factory floor; test changes before implementing
- Urban planning: model city traffic, energy, water systems
- Healthcare: personalized organ models for surgical planning
- Infrastructure: predict bridge or turbine failures before they occur

### The convergence
Digital twins + AI → predictive systems that can optimize complex physical systems continuously. GE's jet engines transmit real-time telemetry; algorithms adjust maintenance schedules before failure occurs.

### The long horizon
Full-city and ultimately full-earth digital twins could enable scenario modeling for climate intervention, pandemic response, resource allocation.`,
    links: ["Emergence in Complex Systems", "Moore's Law and Its Limits"],
  },
  {
    title: "The Semantic Web",
    cat: "Technology",
    body: `## Data That Understands Itself

Tim Berners-Lee's vision (2001): a web where data has meaning computers can process, not just humans. Pages would include machine-readable metadata — enabling AI to reason across information.

**Technologies:** RDF (data relationships), OWL (ontologies), SPARQL (queries).

### Why it underdelivered
Requires participation from content creators who saw no immediate incentive. Adding structured markup is work. The standards are complex.

### What succeeded instead
Knowledge graphs (Google, Facebook) achieved semantic-web goals via centralization — giant proprietary graphs rather than a federated web. Schema.org is a pragmatic partial win.

### What's emerging
LLMs may achieve the semantic web's goal via a different path: understanding unstructured text semantically without requiring structured markup.`,
    links: ["The Unix Philosophy", "Attention Mechanisms in Transformers"],
  },
  {
    title: "The MapReduce Paradigm",
    cat: "Technology",
    body: `## Parallelism for the Masses

Google's MapReduce (2004): a programming model for processing large datasets across commodity hardware clusters.

**Map phase**: apply a function to each record in parallel across machines.
**Reduce phase**: aggregate the mapped results.

Example: word count across a trillion documents. Map each document to (word, 1) pairs. Reduce by summing counts per word.

### The impact
MapReduce (and Hadoop, its open-source implementation) democratized large-scale data processing. Datacenters of cheap machines replaced expensive specialized hardware.

### What came after
Spark improved on MapReduce by keeping intermediate results in memory (10-100x faster for iterative algorithms). The paradigm lives on in distributed ML training.`,
    links: ["Emergence in Complex Systems", "Moore's Law and Its Limits"],
  },
  {
    title: "Ambient Computing",
    cat: "Technology",
    body: `## Computing That Disappears

Mark Weiser's vision (1991): the most profound technologies are those that disappear — woven into everyday life until indistinguishable from it.

**Trajectory:**
- Mainframe era: one computer per institution
- PC era: one computer per person
- Mobile era: always-on computers in pockets
- Ambient era: computers everywhere, invisible

**Current instantiations:** smart speakers, wearables, embedded sensors, edge compute.

### The dark side
Ambient computing = ambient surveillance. Every surface collecting data, every interaction logged. The architecture enables convenience and control simultaneously.

### The design challenge
As compute becomes invisible, the critical decisions shift from "can we build it?" to "should we build it?" — and those questions are political, not technical.`,
    links: ["Attention Is the New Scarcity", "Human-Computer Interaction Principles", "The Filter Bubble"],
  },

  // ── LONGEVITY ────────────────────────────────────────────────────────────────
  {
    title: "NAD+ and Cellular Energy",
    cat: "Longevity",
    body: `## The Coenzyme That Powers Life

NAD+ (nicotinamide adenine dinucleotide) is a coenzyme in every cell, essential for:
- Glycolysis and the citric acid cycle (energy production)
- DNA repair (PARP enzymes consume NAD+)
- Sirtuin activation (longevity-associated deacetylases)

**The aging problem:** NAD+ levels decline 50%+ between ages 20 and 80. Lower NAD+ → impaired mitochondria → accelerated aging across multiple hallmarks.

**Precursors:**
- NR (nicotinamide riboside) and NMN (nicotinamide mononucleotide) raise NAD+ in human trials
- Exercise raises NAD+ via AMPK pathway
- Fasting raises NAD+ via caloric restriction signaling

### The evidence gap
Animal studies are compelling. Human longevity trials are nascent. The field moves fast.`,
    links: ["Hallmarks of Aging", "Rapamycin and mTOR", "Autophagy and Fasting"],
  },
  {
    title: "Autophagy and Fasting",
    cat: "Longevity",
    body: `## Cellular Self-Cleaning

Autophagy (Greek: "self-eating"): cells degrade and recycle damaged proteins, organelles, and pathogens. Yoshinori Ohsumi won the 2016 Nobel Prize in Physiology for elucidating its mechanisms.

**Why it matters for longevity:**
- Removes misfolded proteins (accumulation drives Alzheimer's, Parkinson's)
- Clears damaged mitochondria (mitophagy)
- Counters cellular senescence
- Activated by caloric restriction, fasting, and exercise

**How to activate:**
- 16-24 hour fasting: meaningful autophagy induction
- Exercise: especially endurance exercise
- mTOR inhibition (rapamycin, low protein intake): removes brake on autophagy

### The nuance
Autophagy must be balanced — too little (aging, cancer) or too much (cell death) are both problematic.`,
    links: ["Rapamycin and mTOR", "Hallmarks of Aging", "Time-Restricted Eating", "NAD+ and Cellular Energy"],
  },
  {
    title: "The Centenarian Mindset",
    cat: "Longevity",
    body: `## Thinking Backwards From 100

Peter Attia's framework: rather than optimizing for not dying early, ask what physical and cognitive capacities you want at 100 and work backwards.

"The Centenarian Olympics": the ability to get up off the floor unassisted, carry a bag of groceries up stairs, play with grandchildren, travel, be mentally sharp.

**The backward-engineering:**
- Those activities require: balance, grip strength, VO2 max, leg power, cognitive reserve
- Which require: Zone 2 training, resistance training, sleep, social connection — starting decades earlier

### The mindset shift
Most people plan health reactively. The centenarian mindset is 20-30 years of deliberate investment. Muscle built at 40 is still serving you at 90. Muscle not built is gone.`,
    links: ["Zona 2 Training", "Muscle as Longevity Organ", "The 5 Vectors of Recovery", "Hallmarks of Aging"],
  },
  {
    title: "Blue Zones Diet Patterns",
    cat: "Longevity",
    body: `## Eating Like the Longest-Lived Populations

Dan Buettner's research identified five regions with exceptional longevity (Okinawa, Sardinia, Nicoya, Ikaria, Loma Linda).

**Common dietary patterns:**
- Predominantly plant-based (not strictly vegetarian)
- Legumes as primary protein source (beans, lentils, tofu)
- Minimal processed food
- Moderate caloric intake — Okinawan *hara hachi bu* (eat to 80% full)
- Low sugar
- Moderate alcohol (mostly red wine in Mediterranean zones)

### What's probably not causal
The Blue Zones research is observational — confounded by community, purpose, movement, stress. Diet is likely important but inseparable from the full lifestyle context.`,
    links: ["The Centenarian Mindset", "Hallmarks of Aging", "The 5 Vectors of Recovery"],
  },
  {
    title: "Cardiovascular Health Metrics",
    cat: "Longevity",
    body: `## Beyond Cholesterol

Standard lipid panels are insufficient. More predictive markers:

- **ApoB**: the protein on LDL and VLDL particles — direct measure of atherogenic particles. A better predictor of cardiovascular events than LDL-C.
- **Lp(a)**: lipoprotein(a) — genetically determined, highly atherogenic, unresponsive to most interventions. Should be measured once.
- **hs-CRP**: high-sensitivity C-reactive protein — marker of systemic inflammation; independent predictor.
- **HbA1c + fasting insulin**: metabolic health markers tightly coupled to cardiovascular risk.
- **Blood pressure**: systolic >120 begins to increase risk; >130 is now classified as hypertension.

### The actionable insight
Know your ApoB. If elevated, statins + lifestyle reduce it effectively. Lp(a) cannot be lowered by current approved therapies (RNA therapeutics in trials).`,
    links: ["Hallmarks of Aging", "Zona 2 Training", "The Role of Inflammation in Aging"],
  },
  {
    title: "Grip Strength as Longevity Marker",
    cat: "Longevity",
    body: `## The Most Predictive Simple Test

Numerous prospective studies show grip strength is one of the strongest predictors of all-cause mortality, cardiovascular disease, and cognitive decline.

A 2015 Lancet study of 140,000 people across 17 countries found grip strength was more predictive of cardiovascular death than systolic blood pressure.

**Why it's predictive:**
Grip strength is a proxy for overall musculoskeletal fitness, which reflects: exercise habits, protein metabolism, neuromuscular health, metabolic health.

**Targets (rough benchmarks):**
- Men: >40-45 kg for middle age
- Women: >25-30 kg

**Improving it:**
Deadlifts, farmer's carries, pull-ups, hanging. Specific grip training: thick bar holds, towel pull-ups.`,
    links: ["Muscle as Longevity Organ", "The Centenarian Mindset", "Zona 2 Training"],
  },
  {
    title: "VO2 Max and Lifespan",
    cat: "Longevity",
    body: `## The Most Powerful Longevity Biomarker

VO2 max is the maximum rate of oxygen consumption during exercise. It's the best single predictor of longevity.

**The data:** each 1 MET (metabolic equivalent) increase in VO2 max = ~13% reduction in all-cause mortality. Moving from low to above-average fitness reduces mortality more than quitting smoking.

**Norms by age (mL/kg/min):**
- Elite male cyclist, 30s: ~80
- Active male, 40s: ~45
- Average male, 40s: ~35
- Low fitness: <25

**Improving VO2 max:**
Zone 2 builds the aerobic base; Zone 5 (VO2 max intervals — 4-5 min at maximal effort) actually raises the ceiling. Both are required.`,
    links: ["Zona 2 Training", "The Centenarian Mindset", "Cardiovascular Health Metrics"],
  },
  {
    title: "Cold Exposure Protocols",
    cat: "Longevity",
    body: `## Deliberate Cold as Hormetic Stressor

Regular cold exposure (cold showers, ice baths, cold plunges) activates several adaptive pathways:

- **Brown adipose tissue activation**: cold thermogenesis burns calories, improves metabolic health
- **Norepinephrine release**: 2-3 minute cold exposure raises norepinephrine 200-300% — sustained for hours
- **PGC-1α and mitochondrial biogenesis**: similar to exercise
- **Mood and alertness**: the norepinephrine surge has significant anti-depressant and pro-focus effects

**Protocol (Huberman / Attia):**
- 2-3 sessions/week
- 2-5 minutes at ~10-15°C (50-60°F)
- Total ~11 min/week shows meaningful benefit in Susanna Søberg's research

### Timing
Avoid immediately post-resistance training (may blunt hypertrophy). Post-cardio or standalone is fine.`,
    links: ["Hormesis", "Hallmarks of Aging", "Heat Shock Proteins and Sauna"],
  },
  {
    title: "Heat Shock Proteins and Sauna",
    cat: "Longevity",
    body: `## Thermal Stress and Cellular Repair

Heat shock proteins (HSPs) are molecular chaperones induced by thermal stress. They:
- Refold misfolded proteins
- Prevent protein aggregation (relevant to neurodegeneration)
- Activate autophagy
- Upregulate antioxidant defenses

**Sauna data (Finnish cohort studies, Dr. Jari Laukkanen):**
- 4-7 sauna sessions/week vs. 1/week: 40% reduction in all-cause mortality
- Dose-dependent reduction in sudden cardiac death, Alzheimer's, all-cause dementia

**Protocol:**
- 80-100°C
- 20 minute sessions
- 2-4 sessions/week for meaningful benefit

### The mechanism
Heat is a hormetic stressor (see Hormesis). The body's response to controlled thermal stress produces lasting adaptations.`,
    links: ["Hormesis", "Cold Exposure Protocols", "Hallmarks of Aging", "Autophagy and Fasting"],
  },
  {
    title: "The Microbiome and Longevity",
    cat: "Longevity",
    body: `## The Other Genome

The gut microbiome — ~38 trillion microorganisms — produces metabolites, modulates immunity, synthesizes neurotransmitters, and influences gene expression. It's now considered a quasi-organ.

**Longevity connections:**
- Centenarians show distinctly diverse microbiomes rich in *Akkermansia muciniphila* and *Christensenellaceae*
- Short-chain fatty acids (from fiber fermentation) reduce systemic inflammation
- Leaky gut → endotoxin translocation → inflammaging

**What shifts the microbiome:**
- Dietary fiber is the strongest positive lever
- Fermented foods (yogurt, kefir, kimchi, sauerkraut) — shown in Stanford RCT to increase diversity
- Antibiotics: significant disruption, slow recovery

### The frontier
Fecal microbiome transplants from young to old mice show rejuvenating effects. Human trials are early.`,
    links: ["Hallmarks of Aging", "Blue Zones Diet Patterns", "The Role of Inflammation in Aging"],
  },
  {
    title: "Senolytics: Clearing Zombie Cells",
    cat: "Longevity",
    body: `## Eliminating Senescent Cells

Senescent cells — cells that stopped dividing but resist apoptosis — accumulate with age. They secrete the SASP (senescence-associated secretory phenotype): inflammatory cytokines that damage surrounding tissue.

**What senolytics do:** selectively clear senescent cells.

**Compounds in trials:**
- Dasatinib + Quercetin (D+Q): the most studied combination; clears senescent cells in humans; early trials show improved physical function
- Fisetin: flavonoid found in strawberries; strong senolytic activity in rodents
- Navitoclax: potent but thrombocytopenia risk

**Animal data:** senolytic-treated mice show improved healthspan across multiple organs, reversed cardiac dysfunction, improved cognitive function.

**Human status:** Phase I/II trials ongoing. The field is 5-10 years from clinical clarity.`,
    links: ["Hallmarks of Aging", "Rapamycin and mTOR", "The Role of Inflammation in Aging"],
  },
  {
    title: "Epigenetic Clocks",
    cat: "Longevity",
    body: `## Measuring Biological Age

Steve Horvath (2013) showed that DNA methylation patterns at specific CpG sites predict chronological age with high accuracy — the "epigenetic clock."

More importantly: biological age (epigenetic) can diverge from chronological age. People with younger biological ages have better outcomes.

**Current clocks:**
- Horvath clock: highly accurate, multi-tissue
- PhenoAge (Levine): predicts morbidity better
- GrimAge: best predictor of lifespan and disease
- DunedinPACE: measures *rate* of aging, not age

**What accelerates epigenetic aging:**
- Smoking, obesity, chronic stress, poor sleep, sedentary lifestyle

**What reverses it (emerging evidence):**
- Exercise, caloric restriction, rapamycin, sleep, certain supplements (NMN, resveratrol — debated)`,
    links: ["Hallmarks of Aging", "Rapamycin and mTOR", "Sleep as the Master Regulator"],
  },
  {
    title: "Protein and mTOR Balance",
    cat: "Longevity",
    body: `## The Anabolic Dilemma

mTOR is activated by amino acids, especially leucine. mTOR activation drives muscle protein synthesis — critical for maintaining muscle mass with age. But chronic mTOR activation also accelerates cellular aging.

**The tension:**
- Under-eat protein → lose muscle → frailty, metabolic decline
- Over-eat protein → chronic mTOR → accelerated cellular aging
- Suppress mTOR (rapamycin) → autophagy, longevity — but impairs anabolism

**Resolution strategies:**
- **Protein cycling**: periods of high intake (to build) alternating with lower intake (to clear)
- **Time-restricted eating**: mTOR suppressed during fasting periods, activated during feeding windows
- **Exercise**: maximizes muscle protein synthesis per gram of protein, allowing less total protein for same anabolic effect

The target: ~1.6g protein per kg of body weight per day, clustered around resistance training.`,
    links: ["Rapamycin and mTOR", "Autophagy and Fasting", "Muscle as Longevity Organ", "Time-Restricted Eating"],
  },
  {
    title: "The Role of Inflammation in Aging",
    cat: "Longevity",
    body: `## Inflammaging

Chronic, low-grade, sterile inflammation is both a cause and consequence of aging — hence "inflammaging" (Franceschi, 2000).

**Sources:**
- Senescent cells secreting SASP
- Gut barrier dysfunction (leaky gut → endotoxemia)
- Visceral adipose tissue (metabolically active, pro-inflammatory)
- Declining sex hormones
- Microbial dysbiosis

**What elevated inflammation predicts:**
- Cardiovascular disease, cancer, neurodegeneration, metabolic syndrome

**Anti-inflammatory interventions:**
- Exercise (acute inflammation that leads to chronic anti-inflammation)
- Omega-3 fatty acids (EPA/DHA)
- Adequate sleep
- Maintaining healthy weight
- Senolytics (clearing SASP-secreting cells)
- Mediterranean diet pattern`,
    links: ["Hallmarks of Aging", "Senolytics: Clearing Zombie Cells", "The Microbiome and Longevity"],
  },
  {
    title: "Cognitive Reserve and Brain Health",
    cat: "Longevity",
    body: `## Building a Buffer Against Decline

Cognitive reserve: the brain's resilience to damage. People with high cognitive reserve show less clinical impairment despite equivalent levels of Alzheimer's pathology.

**What builds reserve:**
- Education (especially challenging, active learning)
- Bilingualism (delays dementia onset ~4-5 years on average)
- Cognitively demanding occupations
- Rich social networks
- Musical training

**The mechanisms:**
- More synaptic connections → more redundancy
- Greater neuroplasticity → faster rerouting around damage
- Larger hippocampal volume

**Modifiable risk factors for dementia (Lancet 2024 report):**
14 risk factors account for ~45% of dementia cases. The top modifiable ones: hearing loss, hypertension, obesity, smoking, depression, physical inactivity, social isolation.`,
    links: ["Sleep as the Master Regulator", "Hallmarks of Aging", "Social Isolation as Risk Factor"],
  },
  {
    title: "Social Isolation as Risk Factor",
    cat: "Longevity",
    body: `## Loneliness Kills

Julianne Holt-Lunstad's meta-analysis (2015, 148 studies, 300,000+ participants): social isolation increases mortality risk by 29%, loneliness by 26%, living alone by 32%. Comparable to smoking 15 cigarettes/day.

**Mechanisms:**
- HPA axis dysregulation → chronic cortisol elevation
- Increased systemic inflammation (via NF-κB signaling)
- Poorer health behaviors (less likely to seek care, exercise, eat well)
- Reduced parasympathetic tone (heart rate variability declines)

### The epidemic
US Surgeon General (2023) declared loneliness a public health epidemic. Average number of close friends has declined since 1990.

### Countermeasures
Depth matters more than breadth. 3-5 close relationships with real reciprocity protect more than 50 acquaintances. In-person contact is more protective than digital.`,
    links: ["The 5 Vectors of Recovery", "Hallmarks of Aging", "Cognitive Reserve and Brain Health"],
  },
  {
    title: "Circadian Biology",
    cat: "Longevity",
    body: `## The Master Clock

Every cell has a clock gene network (CLOCK, BMAL1, PER, CRY) running on a ~24-hour cycle. The suprachiasmatic nucleus (SCN) in the hypothalamus synchronizes them to light/dark signals.

**Circadian disruption accelerates aging:**
- Shift workers: higher rates of cancer, metabolic syndrome, cardiovascular disease
- Even mild circadian misalignment (social jetlag — sleeping later on weekends) correlates with worse metabolic markers

**Light is the primary zeitgeber (time-cue):**
- Morning sunlight (ideally within 30-60 min of waking) sets the cortisol pulse and anchors the clock
- Evening blue light delays melatonin onset, delays sleep

**Meal timing:**
Eating later in the circadian day (post-sunset) impairs glucose metabolism even with identical calories. This is partly why time-restricted eating shows metabolic benefits.`,
    links: ["Sleep as the Master Regulator", "Time-Restricted Eating", "Hallmarks of Aging"],
  },
  {
    title: "Time-Restricted Eating",
    cat: "Longevity",
    body: `## Compressing the Eating Window

TRE: eat all calories within a 6-12 hour window, fast the remainder. Independently of calorie restriction, TRE improves multiple metabolic markers in animal and human studies.

**Proposed mechanisms:**
- Circadian alignment: eating is synchronized with daytime metabolic activity
- Extended fasting induces autophagy, improves insulin sensitivity
- Reduced late-night eating when metabolism is least efficient

**The evidence (humans):**
- 8-10 hour windows: modest improvements in blood pressure, blood glucose, body composition
- Strong effects in metabolic syndrome patients
- Satchidananda Panda's work shows benefits even without calorie restriction

### Caveats
Most human TRE studies are short-term. Long-term compliance and effects are less clear. Muscle-protein synthesis may require spreading protein intake across the day.`,
    links: ["Autophagy and Fasting", "Circadian Biology", "Protein and mTOR Balance"],
  },
  {
    title: "Muscle as Longevity Organ",
    cat: "Longevity",
    body: `## Rethinking Skeletal Muscle

Muscle is not merely locomotion tissue — it's a metabolic and endocrine organ.

**What muscle does beyond movement:**
- Primary site of glucose disposal (insulin sensitivity)
- Secretes myokines (IL-6, irisin, BDNF precursors) during contraction that act on brain, liver, fat
- Acts as amino acid reservoir during illness and trauma
- Determines resting metabolic rate (more muscle → higher RMR)

**The survival advantage:**
Sarcopenia (muscle loss with age) predicts mortality independently of other factors. In critical illness, muscle mass is the buffer — patients with more muscle survive infections and surgeries that kill the sarcopenic.

**Building it:**
Progressive resistance training, 3-4x/week. Adequate protein (~1.6g/kg/day). Compound movements (squat, deadlift, press, pull).`,
    links: ["The Centenarian Mindset", "Grip Strength as Longevity Marker", "Protein and mTOR Balance", "Zona 2 Training"],
  },
  {
    title: "Metformin as Longevity Drug",
    cat: "Longevity",
    body: `## The Diabetes Drug That May Extend Life

Metformin (biguanide, derived from French lilac) is the most-prescribed diabetes drug. Observational data suggests diabetics on metformin outlive non-diabetic controls — a striking finding.

**Mechanisms relevant to aging:**
- Activates AMPK (cellular energy sensor, autophagy inducer)
- Inhibits complex I of the mitochondrial electron transport chain
- Reduces hepatic glucose output
- Mild mTOR inhibition
- Anti-inflammatory effects

**The TAME trial:** Targeting Aging with Metformin — the first FDA-approved trial to test metformin's effect on aging itself (not just disease).

### Caveats
May blunt adaptations to exercise — impairs mitochondrial biogenesis in some studies. Timing relative to workouts may matter. Not approved for non-diabetics outside trials.`,
    links: ["Rapamycin and mTOR", "Hallmarks of Aging", "NAD+ and Cellular Energy"],
  },
  {
    title: "Stress Inoculation for Resilience",
    cat: "Longevity",
    body: `## Growing Stronger Through Managed Adversity

Stress inoculation: controlled exposure to stressors builds resilience to future stress — physiologically and psychologically.

**The biological mechanism:**
Glucocorticoids (cortisol) in acute, controlled doses activate neuroprotective mechanisms. Chronic, uncontrolled stress produces the opposite — hippocampal atrophy, immune suppression, inflammation.

**Protocols:**
- Cold exposure (sympathetic nervous system training)
- Breath holds (hypoxic stress)
- High-intensity exercise intervals
- Deliberate social discomfort (public speaking, difficult conversations)
- Psychological: cognitive reappraisal of stress as enhancing (Crum et al., 2013 — believing stress is helpful changes its physiological profile)

### The frontier
Post-traumatic growth is real but requires adequate recovery. The inoculation model suggests we should systematically seek manageable adversity — not avoid all stress.`,
    links: ["Hormesis", "Cold Exposure Protocols", "Antifragility"],
  },
  {
    title: "Red Light Therapy",
    cat: "Longevity",
    body: `## Photobiomodulation

Red and near-infrared light (630-850nm) penetrates tissue and is absorbed by cytochrome c oxidase (Complex IV in mitochondria), enhancing ATP production.

**Proposed effects:**
- Increased mitochondrial efficiency
- Reduced inflammation
- Accelerated wound healing
- Neuroprotection (early Parkinson's and TBI research)
- Skin collagen stimulation

**The evidence base:**
Strong for wound healing and skin. Promising but early for systemic and neurological applications.

### Practical considerations
Low-level laser therapy (LLLT) vs. LED panels — both used clinically. Dose (joules/cm²), wavelength, and tissue penetration all matter.

**Honest assessment:** promising and low-risk at appropriate doses, but the longevity claims outpace current human evidence.`,
    links: ["Hallmarks of Aging", "NAD+ and Cellular Energy"],
  },
  {
    title: "The Importance of Leg Strength",
    cat: "Longevity",
    body: `## The Foundation of Functional Capacity

The legs contain the largest muscle groups in the body. Leg strength and power decline faster with age than upper body strength — and the consequences are outsized.

**What leg strength predicts:**
- Falls (leading cause of injury-related death in elderly)
- Independence and activities of daily living
- Cardiovascular health (leg muscle as major glucose disposal site)
- Brain health (exercise-induced BDNF is largely driven by leg work)

**The "sit-to-stand" test:**
Sit cross-legged on the floor and stand without using hands, knees, or forearms. Score out of 10. Each point lost correlates with ~21% higher all-cause mortality (Brito et al., 2012).

**Training it:**
Squats, leg press, split squats, step-ups, hip hinges. Progressive overload. Do not skip legs.`,
    links: ["The Centenarian Mindset", "Muscle as Longevity Organ", "Grip Strength as Longevity Marker"],
  },

  // ── LIVING WELL ──────────────────────────────────────────────────────────────
  {
    title: "Essentialism",
    cat: "Living Well",
    body: `## The Disciplined Pursuit of Less

Greg McKeown's core thesis: the Essentialist doesn't just do less — they make the highest possible contribution toward the things that really matter by eliminating everything that doesn't.

**The non-essentialist trap:** saying yes to everything because each request seems reasonable in isolation, without considering the aggregate cost to focused capacity.

**The key questions:**
- What is the one thing that, if done, makes everything else easier or unnecessary?
- Is this activity in the top 10%? If not, the answer is no.

### The paradox
Doing less actually produces more — because focused effort on the right things produces disproportionate results. The problem is that most people optimize locally (is this a good use of the next hour?) without optimizing globally.`,
    links: ["Deep Work", "The Art of Saying No", "Systems Over Goals"],
  },
  {
    title: "The Art of Saying No",
    cat: "Living Well",
    body: `## Protecting Your Attention Capital

Every yes is a no to something else. Most people treat yes as the default and justify each individual commitment in isolation — without accounting for the cumulative effect on bandwidth.

**Warren Buffett:** "The difference between successful people and really successful people is that really successful people say no to almost everything."

**The techniques:**
- The pre-mortem no: before agreeing, imagine six months from now regretting the commitment
- The 90% rule: if it's not a "hell yes," it's a no
- Soft declines: "I can't give this the attention it deserves right now"
- Separating the ask from the answer: take time to respond; urgency is often manufactured

### The relational fear
Saying no feels like rejection, conflict, disappointing people. Reframe: saying no to the wrong things is saying yes to the people who matter most.`,
    links: ["Essentialism", "Deep Work", "Attention Is the New Scarcity"],
  },
  {
    title: "Flow State",
    cat: "Living Well",
    body: `## Optimal Experience

Mihaly Csikszentmihalyi's decades-long research: flow is the state in which people are most alive — absorbed in an activity to the point of losing self-consciousness and time.

**Conditions for flow:**
- Clear goals with immediate feedback
- Challenge slightly exceeds current skill
- No distractions or fear of failure

**Why it matters:**
Flow is both intrinsically enjoyable and highly productive. Athletes, surgeons, musicians, and programmers at their best describe identical phenomenology.

### Flow vs. leisure
Passive leisure (TV, scrolling) doesn't produce flow. Active leisure (music, sports, crafts) does. The paradox: we choose the passive because it's easier — but flow activities are what actually restore and satisfy.`,
    links: ["Deep Work", "Attention Is the New Scarcity", "Boredom as Creative Input"],
  },
  {
    title: "The Power of Defaults",
    cat: "Living Well",
    body: `## Architecture of Choice

Behavioral economists (Thaler, Sunstein) showed that defaults have outsized influence on decisions. Opt-in vs. opt-out organ donation produces dramatically different rates. 401(k) auto-enrollment radically increases retirement savings.

**The insight:** most people don't actively choose — they accept defaults.

**Designing your own defaults:**
- Default exercise time in the calendar
- Default phone on silent / notifications off
- Default healthy food available (kitchen architecture)
- Default sleep time (the alarm for *going to bed*)
- Default response to social invitations (no, unless compelling)

### Why this beats willpower
Willpower is depleted. Environments are persistent. Designing your defaults removes the decision from the willpower budget entirely.`,
    links: ["The Zeigarnik Effect", "Digital Minimalism", "Systems Over Goals"],
  },
  {
    title: "Journaling for Clarity",
    cat: "Living Well",
    body: `## Writing as Thinking

Writing is not recording thought — it is thinking. The act of articulating forces clarity that internal rumination doesn't.

**What journaling does:**
- Closes open loops (Zeigarnik effect)
- Creates distance from emotion (labeling reduces amygdala activation — Lieberman et al.)
- Surfaces patterns invisible day-to-day
- Documents growth (past entries reveal how much has changed)

**James Pennebaker's research:** 15 minutes of expressive writing about difficult experiences for 3-4 days shows lasting improvements in immune function, mental health, and physical health.

### The formats
- Morning Pages (Julia Cameron): 3 pages of uncensored stream-of-consciousness
- Evening review: what happened, how I showed up, what I'll do differently
- Decision log: for significant choices, record the reasoning at the time`,
    links: ["The Examined Life", "The Zeigarnik Effect", "Weekly Review Practice"],
  },
  {
    title: "Digital Minimalism",
    cat: "Living Well",
    body: `## Intentional Technology Use

Cal Newport's framework: a philosophy of technology use where you focus your online time on a small number of carefully selected activities that strongly support things you value, and then happily miss out on everything else.

**The 30-day detox protocol:**
- Remove all optional technology for 30 days
- After 30 days, reintroduce only what adds deep value
- Redesign use with intentional constraints

**The deeper point:**
Most people haven't chosen their technology habits — they've accepted defaults designed by engagement-maximizing algorithms. Digital minimalism is reclaiming the choice.

**What's lost, what's gained:**
- Lost: FOMO, passive entertainment, low-grade dopamine hits
- Gained: boredom (which generates creativity), sustained attention, presence`,
    links: ["Deep Work", "Attention Is the New Scarcity", "Boredom as Creative Input", "The Power of Defaults"],
  },
  {
    title: "Nature Therapy",
    cat: "Living Well",
    body: `## Shinrin-yoku: Forest Bathing

The Japanese practice of *shinrin-yoku* (forest bathing) — spending time in forest environments with mindful attention — has been studied extensively since the 1980s.

**Documented effects (meta-analyses):**
- Reduced cortisol (14-16% reduction vs. urban walks)
- Lower heart rate and blood pressure
- Improved NK (natural killer) cell activity — anti-cancer immune function — for up to 30 days after a 3-day forest trip
- Reduced anxiety, depression, fatigue

**Proposed mechanisms:**
- Phytoncides (antimicrobial volatile compounds from trees) directly affect immune function
- Fractal visual patterns reduce stress
- Reduced cognitive load vs. urban environments (Attention Restoration Theory)

### The dose
Even 20 minutes in a park shows measurable cortisol reduction. 2 hours of nature exposure per week is associated with good health outcomes.`,
    links: ["The 5 Vectors of Recovery", "Stress Inoculation for Resilience"],
  },
  {
    title: "The Compound Effect",
    cat: "Living Well",
    body: `## Small Choices × Time = Destiny

Darren Hardy's central thesis: the compound effect is the strategy of reaping huge rewards from small, seemingly insignificant actions.

1% better each day: (1.01)^365 = 37x. 1% worse each day: (0.99)^365 = 0.03x.

**The problem:** compound effects are invisible in the short term. Eating one cookie doesn't make you fat. Reading 10 pages doesn't make you smart. Missing one workout doesn't make you weak. The behavior-consequence gap makes feedback loops slow and easy to ignore.

### The implication
Design systems around daily behaviors, not distant outcomes. The question is not "will this make me successful?" but "am I consistently doing the things that, compounded, produce success?"

Track inputs, not outputs.`,
    links: ["Systems Over Goals", "Deliberate Practice", "The Power of Defaults"],
  },
  {
    title: "Gratitude Practice",
    cat: "Living Well",
    body: `## Rewiring the Default Mode

Gratitude practice is among the highest-evidence positive psychology interventions. Martin Seligman's "three good things" exercise (write 3 things that went well and why, each evening for one week) showed lasting mood improvements at one-month follow-up.

**Mechanisms:**
- Counteracts hedonic adaptation (forces attention to what's being taken for granted)
- Shifts attention from deficit (what's missing) to abundance (what's present)
- Activates reward circuitry without external reward

### Avoiding it becoming rote
- Specificity matters (not "I'm grateful for my family" but "I'm grateful for the text my sister sent this morning")
- Negative visualization (imagine losing what you have) deepens appreciation
- Expressed gratitude (writing to people) is more effective than private reflection`,
    links: ["The Hedonic Treadmill", "The Examined Life", "Journaling for Clarity"],
  },
  {
    title: "Boredom as Creative Input",
    cat: "Living Well",
    body: `## The Productive Void

The default mode network (DMN) — active during rest and mind-wandering — is associated with creative insight, self-reflection, perspective-taking, and future planning.

When every idle moment is filled with stimulation (phone, podcast, music), the DMN never activates. Boredom is the entry condition for the mind's most sophisticated processing.

**The empirical support:**
- Sandi Mann's research: subjects given a boring task (copying phone numbers) showed significantly more creative performance on subsequent tasks vs. controls
- Most "eureka moments" occur in the shower, on walks, or upon waking — low-stimulation states

### The practice
Protect empty time. Walk without earbuds. Sit without a phone. Let the queue of unprocessed thoughts surface.`,
    links: ["Deep Work", "Flow State", "Digital Minimalism"],
  },
  {
    title: "The Feynman Technique",
    cat: "Living Well",
    body: `## Learning by Teaching

Richard Feynman's method for deep understanding:
1. Choose a concept
2. Explain it as if to a child (simply, without jargon)
3. Identify gaps and return to the source material
4. Simplify and use analogies until the explanation is clear to a layperson

### Why it works
Writing or speaking forces retrieval (more effective than re-reading). The constraint of simple language reveals what you actually understand vs. what you're pattern-matching from vocabulary.

> "If you can't explain it simply, you don't understand it well enough."

### Application
Use it for any domain you're trying to master: write 500 words explaining a concept to a hypothetical non-expert. The gaps will announce themselves immediately.`,
    links: ["The Examined Life", "Epistemic Humility", "Deliberate Practice"],
  },
  {
    title: "Slow Living Movement",
    cat: "Living Well",
    body: `## Against the Tyranny of Speed

The slow movement (Carlo Petrini's Slow Food, 1989 → spread to cities, work, medicine, parenting) is a cultural revolt against the notion that faster is always better.

**The central insight:**
Speed is often the wrong optimization target. A slow meal shared with people you love produces more wellbeing than a fast meal consumed alone. Slow medicine (longer appointments) produces better diagnoses and patient outcomes.

**The practice:**
- Batch cooking: reduce daily decision fatigue
- Single-tasking: resist context-switching
- Slow travel: fewer places, longer, deeper
- Analog practices: physical books, handwriting, manual crafts

### The paradox
Slowing down in some domains frees attention for what actually matters — and often produces higher quality output in professional domains too.`,
    links: ["Essentialism", "Attention Is the New Scarcity", "Flow State"],
  },
  {
    title: "Financial Independence as Freedom",
    cat: "Living Well",
    body: `## F-You Money and Optionality

Financial independence (FI): having sufficient passive income or assets to cover expenses without requiring employment. The FIRE movement (Financial Independence, Retire Early) operationalized this for non-wealthy people.

**The formula:** FI Number = Annual Expenses × 25 (the 4% rule — sustainable withdrawal rate)

**Why it matters beyond "not working":**
FI creates *optionality* — the freedom to choose work by meaning rather than necessity. This changes the psychology of work profoundly.

Nassim Taleb: "F-you money" — enough financial security to walk away from any situation that compromises your values.

### The practical steps
High savings rate (40-70%) matters more than investment returns. The enemy: lifestyle inflation. The lever: reduce expenses, not just increase income.`,
    links: ["The Barbell Strategy in Life", "Essentialism", "Antifragility"],
  },
  {
    title: "The Barbell Strategy in Life",
    cat: "Living Well",
    body: `## Extremes Over the Middle

Nassim Taleb's barbell strategy: combine extreme risk-aversion in some areas with extreme risk-taking in others. Avoid the middle — moderate risk everywhere.

**In finance:** 90% treasury bills (very safe) + 10% venture bets (very risky) outperforms 100% in "moderate risk" assets over time, with lower ruin risk.

**In life:**
- Career: stable income source + aggressive side bets on passion projects
- Health: very conservative on irreversible decisions (surgery), experimental on reversible ones
- Time: core commitments ruthlessly protected + slack for unexpected opportunities

### The logic
Moderate risks everywhere exposes you to ruin from correlated failures. Extreme safety in one domain creates the foundation to take concentrated, convex bets in another.`,
    links: ["Antifragility", "Financial Independence as Freedom", "Essentialism"],
  },
  {
    title: "Managing Energy Not Time",
    cat: "Living Well",
    body: `## The Performance Equation

Tony Schwartz and Jim Loehr (*The Power of Full Engagement*): performance is not primarily a function of time but of energy — physical, emotional, mental, and spiritual.

**The four dimensions:**
1. Physical: the foundation — sleep, movement, nutrition, recovery
2. Emotional: quality of interpersonal connection, managing negative emotions
3. Mental: focus, cognitive flexibility, realistic optimism
4. Spiritual (purpose): values-aligned activity generates energy; misalignment drains it

**The oscillation principle:**
High performance requires alternating engagement and recovery — like a muscle. Sustained effort without recovery produces chronic fatigue, not discipline.

### The reframe
Ask not "how can I fit more in?" but "how can I bring full energy to fewer things?" Tired effort is rarely effective.`,
    links: ["The 5 Vectors of Recovery", "Flow State", "Zona 2 Training"],
  },
  {
    title: "The Art of Rest",
    cat: "Living Well",
    body: `## Active vs. Passive Recovery

Alex Soojung-Kim Pang (*Rest*): rest is not the absence of work — it's a distinct activity with its own skill and productivity.

**The science:**
- Top performers in creative fields work 4-5 focused hours/day, not 8-10
- The default mode network during rest processes and consolidates the work done during focus
- Many creative breakthroughs come in rest (Darwin's daily walks, Newton's country retreat, Einstein's sailing)

**Forms of restorative rest:**
- Sleep (primary)
- Physical activity (paradoxically restorative)
- Nature exposure
- Daydreaming / mind-wandering
- Social connection with trusted people
- Absorptive creative hobbies (not passive consumption)

### What doesn't count
Scrolling, passive TV, checking email — these consume attentional resources without restoring them.`,
    links: ["Sleep as the Master Regulator", "Boredom as Creative Input", "Managing Energy Not Time"],
  },
  {
    title: "Deliberate Practice",
    cat: "Living Well",
    body: `## The Architecture of Expertise

Anders Ericsson's research demolished the talent myth: expertise in virtually any domain results from deliberate practice — specific, focused, feedback-rich practice at the edge of current ability.

**Key characteristics:**
- Targets specific weaknesses, not strengths
- Requires full concentration (not mindless repetition)
- Immediate, high-quality feedback
- Just beyond current comfort zone
- Guided by a coach or mentor where possible

**The 10,000-hour heuristic (Gladwell's reduction):**
Ericsson's actual finding was subtler: it's the *quality* of practice that matters, not the hours. Deliberate practice hours (not total hours) predict expertise.

### Application
Identify the specific sub-skill that's your bottleneck. Design exercises that isolate and stress it. Get feedback. Repeat.`,
    links: ["Flow State", "The Compound Effect", "Deep Work"],
  },
  {
    title: "Ownership Mindset",
    cat: "Living Well",
    body: `## Radical Responsibility

Jocko Willink's *Extreme Ownership*: the leader (or individual) must own everything in their domain. There are no bad teams, only bad leaders. There are no external causes of failure, only internal responses to circumstances.

**The mental move:**
Shift from "this happened to me" to "what is my part in this, and what will I do about it?"

This is not victim-blaming — it's an internal locus of control as a performance strategy. Research consistently shows internal locus of control predicts better health, career, and life outcomes.

### The Stoic parallel
The Stoic dichotomy of control applied: you don't control outcomes, but you control effort, response, and preparation.

### The limit
Ownership mindset must be paired with structural awareness — some circumstances are genuinely beyond individual control, and pretending otherwise is its own form of unrealism.`,
    links: ["Stoic Dichotomy of Control", "Amor Fati", "Epistemic Humility"],
  },
  {
    title: "Systems Over Goals",
    cat: "Living Well",
    body: `## Scott Adams's Insight

Goals are a strange construct: before you achieve them, you're in a perpetual state of failure. After you achieve them, you need a new goal. The goal-oriented mind is rarely satisfied.

**Systems alternative:** instead of "I want to run a marathon," build a system of daily movement. Instead of "I want to write a book," build a system of daily writing. The goal gives direction; the system produces results.

**James Clear (*Atomic Habits*):** you don't rise to the level of your goals; you fall to the level of your systems.

### Why systems win
- Goals end; systems continue
- Systems produce habits; habits run on autopilot
- Systems build identity; identity sustains behavior
- A good system produces the goal as a byproduct, plus everything else`,
    links: ["The Compound Effect", "The Power of Defaults", "Deliberate Practice"],
  },
  {
    title: "Radical Acceptance",
    cat: "Living Well",
    body: `## Tara Brach on Resistance and Pain

Radical acceptance: fully accepting what is, in this moment, without judgment or struggle — not as resignation but as the foundation for skillful response.

Marsha Linehan (DBT): *pain is inevitable, suffering is optional*. Suffering = pain × resistance. Accepting pain reduces the resistance multiplier.

**The Buddhist root:**
The second arrow: if you're hit by an arrow, that's pain. Beating yourself up about being hit is the second arrow — self-inflicted on top of unavoidable pain.

### Not passivity
Acceptance is not approval. You can accept a difficult reality and still work to change it. In fact, non-acceptance (denial, avoidance) typically prevents effective action. Seeing clearly is the prerequisite for changing skillfully.`,
    links: ["Buddhist Impermanence", "Stoic Dichotomy of Control", "Amor Fati"],
  },
  {
    title: "Play as Adult Practice",
    cat: "Living Well",
    body: `## Why Adults Need to Play

Stuart Brown's research: play is not frivolous. Adults who don't play — who have never played as children — show higher rates of depression, violence, and interpersonal dysfunction.

**What play is:**
- Intrinsically motivated (not for outcome)
- Voluntary
- Element of make-believe
- Non-consequential (safe to fail)

**Why it matters:**
Play activates neuroplasticity. Playful adults learn faster, recover from stress better, and are more creative. Humor (a form of play) correlates with intelligence and resilience.

**Forms of adult play:**
Improvisational activities (jazz, improv theater, pick-up sports), games, building/making things, exploring without a goal.

### The cultural block
Adults are trained to justify activity by productivity. Play has no justification other than itself — which is precisely what makes it valuable.`,
    links: ["Flow State", "Boredom as Creative Input", "Slow Living Movement"],
  },
  {
    title: "Solitude as a Skill",
    cat: "Living Well",
    body: `## The Capacity to Be Alone With Yourself

William Deresiewicz (*Solitude and Leadership*): solitude is the source of genuine thought. The busy, connected, stimulated mind can receive and transmit but cannot generate.

**Sherry Turkle's finding:** people increasingly can't tolerate being alone with their thoughts — smartphones are a constant escape from solitude.

**What solitude enables:**
- Processing unresolved experiences
- Access to your own values and preferences (distinct from social influence)
- Creative synthesis
- Equanimity (not requiring external validation)

### The practice
Deliberate solitude is not isolation — it's regular, protected time without social input. 20 minutes of walking without a phone. A weekly half-day without obligations. A yearly retreat.`,
    links: ["Deep Work", "Boredom as Creative Input", "Journaling for Clarity"],
  },
  {
    title: "Weekly Review Practice",
    cat: "Living Well",
    body: `## The Cadence of Intentional Living

David Allen's GTD weekly review: a regular audit of all commitments, projects, and captures. But beyond productivity, it's a practice of intentional living.

**The full review structure:**
- Clear all inboxes (physical, digital, mental)
- Review all active projects: are they moving?
- Review calendar: what's coming, what needs preparation?
- Review someday/maybe list: does anything become active?
- Set weekly priorities: what are the 3 outcomes that would make this week a win?
- Reflect: what went well, what would I do differently?

**The compounding effect:**
52 weekly reviews per year = 52 deliberate checkpoints where drift is caught and corrected. Without the review, you can spend months busy on the wrong things.`,
    links: ["The Examined Life", "Systems Over Goals", "Journaling for Clarity", "The Zeigarnik Effect"],
  },
  {
    title: "The Midnight Library Mindset",
    cat: "Living Well",
    body: `## Making Peace With Unlived Lives

Matt Haig's novel imagines a library where every book contains a different life you could have lived if you'd made different choices. The protagonist discovers: no other life is simply better. Every path has its regrets.

**The regret-minimization problem:**
Jeff Bezos imagined himself at 80 looking back: "I knew that if I failed I wouldn't regret that. But I knew the one thing I might regret is not ever having tried."

**Bronnie Ware's research (nurse to the dying):**
Top regrets: lived others' expectations, worked too hard, didn't express feelings, didn't stay in touch with friends, didn't let themselves be happier.

### The practical takeaway
Regrets of inaction outlast regrets of action. The Midnight Library mindset: commit fully to the life you're in, while choosing it with open eyes.`,
    links: ["Memento Mori", "Ikigai", "The Examined Life"],
  },
];

async function main() {
  await fs.mkdir(NOTES_DIR, { recursive: true });

  // Build category map
  const cats = await prisma.category.findMany();
  const catMap = Object.fromEntries(cats.map((c) => [c.name, c.id]));

  // Build title → id map for links
  const titleToId: Record<string, string> = {};

  // Also include existing notes for cross-links
  const existing = await prisma.note.findMany({ select: { id: true, title: true } });
  for (const n of existing) titleToId[n.title] = n.id;

  console.log(`Creating ${NOTES.length} notes…`);

  for (const n of NOTES) {
    const categoryId = catMap[n.cat] ?? null;
    const note = await prisma.note.create({
      data: { title: n.title, body: n.body, categoryId },
    });
    titleToId[n.title] = note.id;

    const catName = cats.find((c) => c.id === categoryId)?.name ?? "";
    const fm = `---\nid: ${note.id}\ntitle: "${n.title.replace(/"/g, '\\"')}"\ncategory: "${catName}"\n---\n\n`;
    await fs.writeFile(path.join(NOTES_DIR, `${note.id}.md`), fm + n.body, "utf-8");
  }

  console.log("Creating links…");
  let linkCount = 0;
  for (const n of NOTES) {
    if (!n.links) continue;
    const fromId = titleToId[n.title];
    if (!fromId) continue;
    for (const target of n.links) {
      const toId = titleToId[target];
      if (!toId) { console.warn(`  ⚠ not found: "${target}"`); continue; }
      await prisma.link.upsert({
        where: { fromId_toId: { fromId, toId } },
        create: { fromId, toId },
        update: {},
      });
      linkCount++;
    }
  }

  console.log(`✓ ${NOTES.length} notes, ${linkCount} links`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
