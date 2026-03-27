import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const NOTES_DIR = path.join(process.cwd(), "notes");

const CATEGORIES = [
  { key: "philosophy", name: "Philosophy", color: "#a855f7" },
  { key: "technology", name: "Technology", color: "#3b82f6" },
  { key: "longevity",  name: "Longevity",  color: "#22c55e" },
  { key: "living",     name: "Living Well", color: "#f97316" },
];

const NOTES: {
  title: string;
  category: string;
  body: string;
  links?: string[]; // titles of notes to link to
}[] = [
  // ── PHILOSOPHY ──────────────────────────────────────────────────
  {
    title: "The Ship of Theseus",
    category: "philosophy",
    body: `## Identity & Continuity

If a ship has every plank replaced one by one, is it still the same ship?

The puzzle cuts to the heart of **personal identity**: are you the same person you were ten years ago? Your cells have turned over, your beliefs have shifted, your memories have been reconstructed dozens of times.

There are two competing intuitions:
- **Continuity of form** — the ship's function and shape persist, so identity persists.
- **Continuity of matter** — once no original plank remains, something fundamental has changed.

> "You cannot step into the same river twice." — Heraclus

### Relevance to the self
Neuroscience complicates this further. Memory is not recall — it is *reconstruction*. Each time you remember, you slightly rewrite. The self is less a noun than a verb: an ongoing process of integration.`,
    links: ["Memento Mori", "The Examined Life"],
  },
  {
    title: "Memento Mori",
    category: "philosophy",
    body: `## Remember That You Will Die

The Stoic practice of keeping death in view — not as morbidity, but as a clarifying lens.

Marcus Aurelius returned to it constantly in *Meditations*. The Epicureans inscribed it on drinking cups. Medieval monks kept skulls on their desks.

**Why it works:**
- Trivial grievances dissolve when seen against a finite horizon
- Urgency replaces procrastination
- Gratitude arises naturally — this moment, this breath, was never guaranteed

### The inversion
Most of us live as though death is optional, perpetually deferred. Memento mori inverts the default: assume time is scarce and act accordingly.

> "Perfecting your life is not about achievement — it's about subtraction. Remove everything that won't matter when you are dying."`,
    links: ["Amor Fati", "The Examined Life"],
  },
  {
    title: "Amor Fati",
    category: "philosophy",
    body: `## Love of Fate

Nietzsche's concept: not merely *accepting* what happens to you, but *wanting* it — including the suffering, the failure, the loss.

This goes further than Stoic acceptance. The Stoics counseled equanimity: you cannot control what happens, only your response. Nietzsche wants more: a full-throated yes to existence as it is.

### The eternal recurrence test
Nietzsche's thought experiment: if you had to live your life — exactly as it was — infinite times over, would you despair or affirm?

Amor fati is the disposition that answers: *yes, again*.

### Practical reading
Strip away the metaphysics: obstacles are not detours from the path, they *are* the path. The illness that slowed you down, the rejection that redirected you — seen correctly, they were necessary.`,
    links: ["Memento Mori"],
  },
  {
    title: "The Examined Life",
    category: "philosophy",
    body: `## Socrates on Self-Knowledge

> "The unexamined life is not worth living."

Socrates said this at his own trial — knowing it would cost him his life. He meant it not as a philosophical slogan but as a statement about what makes a human life distinctly human.

**To examine a life is to ask:**
- What do I actually value vs. what do I *say* I value?
- Are my beliefs mine, or were they handed to me?
- What would I defend to the point of sacrifice?

### Journaling as practice
The examined life requires *externalization*. Writing slows thought down enough to notice it. A daily review — even five minutes — compounds over years into genuine self-knowledge.

### The uncomfortable corollary
Examination often reveals contradictions. We say we value health and stay sedentary. We say we value people and stare at phones. The point is not judgment but *seeing clearly*.`,
    links: ["Memento Mori", "Deep Work"],
  },

  // ── TECHNOLOGY ──────────────────────────────────────────────────
  {
    title: "Intelligence Explosion",
    category: "technology",
    body: `## Recursive Self-Improvement

I.J. Good's 1965 hypothesis: once we build a machine that can improve its own intelligence, the resulting chain of self-improvements could be so rapid that it surpasses human comprehension almost immediately.

> "The first ultraintelligent machine is the last invention that man need ever make."

### Why it's hard to reason about
Humans have no reference class for entities much smarter than us. We can imagine faster processors; we cannot imagine what a mind with IQ 10,000 would *want* or *notice*.

### The alignment problem
The danger isn't malice — it's indifference. An optimizing process pursuing a goal humans didn't specify correctly has no reason to preserve anything we care about.

This is arguably the most important unsolved problem of the century.`,
    links: ["Bicycles for the Mind", "The Filter Bubble"],
  },
  {
    title: "Bicycles for the Mind",
    category: "technology",
    body: `## Steve Jobs on Computers

In 1980, Jobs described the computer as a "bicycle for the mind" — a tool that amplifies human cognitive capacity the way a bicycle amplifies human locomotion.

A condor is the most efficient animal by energy-per-distance. A human on a bicycle beats the condor by 3x.

**The question this raises:** what *kind* of bicycle is software building today?

Social media is optimized for engagement, not insight. Many apps are more like slot machines than bicycles — they extract attention rather than amplify thinking.

### The design imperative
If you're building tools: are they making people more capable, or more dependent? Are they bicycle-shaped, or slot-machine-shaped?`,
    links: ["Intelligence Explosion", "Attention Is the New Scarcity"],
  },
  {
    title: "The Filter Bubble",
    category: "technology",
    body: `## Algorithmic Echo Chambers

Eli Pariser's 2011 concept: personalization algorithms create invisible information bubbles. You see more of what you already agree with, and the world slowly reshapes to confirm your priors.

**The mechanism:**
1. Algorithm observes what you engage with
2. Shows you more of the same (engagement = revenue)
3. Your model of reality narrows
4. You become more confident and less accurate

### The insidious part
Unlike a newspaper editorial filter — which you can see and contest — the filter bubble is invisible. You don't know what you're not seeing.

### Counter-practices
- Deliberately follow people you disagree with
- Read sources with different priors
- Notice when your information environment feels *comfortable*`,
    links: ["Bicycles for the Mind", "Attention Is the New Scarcity"],
  },
  {
    title: "Jevons Paradox",
    category: "technology",
    body: `## Efficiency Increases Consumption

William Stanley Jevons observed in 1865 that improvements in coal engine efficiency *increased* total coal consumption — because efficiency lowered the cost of using coal, driving adoption.

**The general form:**
> Efficiency improvements in resource use often increase total consumption of that resource.

### Modern examples
- Fuel-efficient cars → more driving
- Energy-efficient data centers → more data centers
- Faster internet → more video streaming

### Why this matters for tech
Every time we make computation cheaper or AI more capable, we don't replace existing uses — we create new ones. Efficiency gains in one dimension tend to be consumed by growth in another.

The paradox is not an argument against efficiency, but a warning against assuming efficiency alone solves resource constraints.`,
    links: ["Intelligence Explosion"],
  },

  // ── LONGEVITY ───────────────────────────────────────────────────
  {
    title: "Hallmarks of Aging",
    category: "longevity",
    body: `## The Biology of Getting Old

López-Otín et al. (2013, updated 2023) catalogued the cellular processes that drive aging:

1. **Genomic instability** — DNA damage accumulates
2. **Telomere attrition** — chromosome caps shorten
3. **Epigenetic alterations** — gene expression drifts
4. **Loss of proteostasis** — misfolded proteins accumulate
5. **Disabled macroautophagy** — cellular recycling fails
6. **Deregulated nutrient sensing** — mTOR, AMPK, sirtuins
7. **Mitochondrial dysfunction**
8. **Cellular senescence** — zombie cells that won't die
9. **Stem cell exhaustion**
10. **Altered intercellular communication** — chronic inflammation
11. **Chronic inflammation** (inflammaging)
12. **Dysbiosis** — microbiome disruption

### Why this matters
These aren't isolated problems — they form a feedback network. Treating one can affect others. The most promising interventions (rapamycin, senolytics, NAD+ precursors) target multiple hallmarks simultaneously.`,
    links: ["Rapamycin and mTOR", "Hormesis", "Sleep as the Master Regulator"],
  },
  {
    title: "Hormesis",
    category: "longevity",
    body: `## What Doesn't Kill You

Hormesis: low doses of a stressor that would be harmful at high doses actually produce a beneficial adaptive response.

**Examples:**
- Exercise → micro-tears in muscle → stronger
- Cold exposure → brief hypothermic stress → mitochondrial biogenesis
- Fasting → metabolic stress → autophagy activation
- Heat (sauna) → heat shock proteins → cellular resilience

### The dose-response curve
The key insight is that biology is not linear. Zero stress is not optimal — it leads to atrophy. Excessive stress is harmful. The sweet spot is *challenging but recoverable*.

### Practical implications
Many longevity interventions work via hormesis. The goal isn't to avoid all stress but to choose the stressors and dose them correctly.

> "That which does not kill me makes me stronger." — Nietzsche (biologically accurate)`,
    links: ["Hallmarks of Aging", "Zona 2 Training"],
  },
  {
    title: "Rapamycin and mTOR",
    category: "longevity",
    body: `## The Most Promising Longevity Drug

Rapamycin (sirolimus) extends lifespan in every model organism tested — mice, flies, worms. It inhibits **mTOR** (mechanistic target of rapamycin), a master regulator of cell growth and metabolism.

### mTOR's role
mTOR integrates signals about nutrient availability, growth factors, and energy status. When active, it promotes growth and protein synthesis. When inhibited, it promotes *autophagy* — cellular cleanup.

**The aging connection:** mTOR is chronically overactive with age, and in the presence of constant calories. This drives cellular overgrowth and accumulation of damaged components.

### The evidence
- ITP (Interventions Testing Program) studies show consistent lifespan extension in mice, even starting late in life
- Human data is observational (transplant patients on chronic rapamycin)
- Promising early trials in aging populations

### Caveats
Immunosuppression at high doses. Most longevity researchers use low-dose intermittent protocols.`,
    links: ["Hallmarks of Aging", "Hormesis"],
  },
  {
    title: "Sleep as the Master Regulator",
    category: "longevity",
    body: `## Why Sleep Is Non-Negotiable

Matthew Walker's *Why We Sleep* brought this into popular consciousness, but the underlying biology is unambiguous: sleep is the single highest-leverage health intervention available.

**What happens during sleep:**
- **Glymphatic clearance** — brain washes out metabolic waste including amyloid-beta (Alzheimer's precursor)
- **Memory consolidation** — hippocampus replays and transfers memories to cortex
- **Hormonal regulation** — growth hormone, cortisol, leptin/ghrelin all governed by sleep
- **Immune function** — cytokine production, T-cell activity peak during sleep
- **Cellular repair** — DNA damage repair is upregulated

### The dose
7–9 hours for most adults. Below 6 hours: measurable cognitive impairment, accelerated biological aging, increased cancer risk.

### The uncomfortable truth
Almost nothing you do in the gym, kitchen, or supplement cabinet compensates for chronic sleep restriction.`,
    links: ["Hallmarks of Aging", "The 5 Vectors of Recovery"],
  },
  {
    title: "Zona 2 Training",
    category: "longevity",
    body: `## The Underrated Foundation of Fitness

Zone 2: aerobic exercise at the intensity where you can *just* hold a conversation. Roughly 60–70% of max heart rate. For most people: a brisk walk, easy jog, or casual cycling.

### Why it matters for longevity
Zone 2 training specifically drives:
- **Mitochondrial biogenesis** — more mitochondria per cell
- **Mitochondrial efficiency** — better fat oxidation
- **Cardiovascular adaptation** — increased stroke volume
- **Lactate clearance capacity** — resilience to high-intensity efforts

Peter Attia argues Zone 2 is the foundation on which all other training sits. Without it, high-intensity work produces diminishing returns.

### The protocol
3–4 hours/week minimum. The challenge: it feels *too easy*, so most people push harder than necessary and miss the adaptation.`,
    links: ["Hallmarks of Aging", "Hormesis"],
  },

  // ── LIVING WELL ─────────────────────────────────────────────────
  {
    title: "Deep Work",
    category: "living",
    body: `## Cal Newport's Core Thesis

> "Deep work: professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit."

The ability to do deep work is becoming simultaneously *rarer* and *more valuable*. Anyone who cultivates it will thrive.

### The shallow work trap
Most knowledge workers spend the majority of their day in reactive mode: email, Slack, meetings. This feels productive — there's always something happening. But it produces little of lasting value and leaves the capacity for real thinking permanently impaired.

### The practice
- Block time with no connectivity
- Start small: 60 minutes of true focus
- Work up to 4-hour sessions
- Schedule *every* minute of the workday (Newport's time-block planning)

Newport's most counterintuitive claim: **boredom is a prerequisite.** If you eliminate all boredom with your phone, you train your brain to require constant stimulation and lose the ability to concentrate.`,
    links: ["The Examined Life", "Attention Is the New Scarcity"],
  },
  {
    title: "Attention Is the New Scarcity",
    category: "living",
    body: `## The Economy of the Mind

Information abundance creates attention scarcity. We produce more content per day than a person in 1800 would encounter in a lifetime. The bottleneck is no longer access to information — it's the ability to *filter and focus*.

### What this means
- Companies compete for attention because attention = revenue
- Every notification is a bid for your cognitive resources
- The winner of this competition often isn't you

### Treating attention as a resource
Herbert Simon: "A wealth of information creates a poverty of attention."

Practical reframe: **your attention is a finite, non-renewable daily resource.** Every time you check social media, a notification, or a news feed, you are spending it. The question is whether the return justifies the spend.

### The discipline
Defaulting to *off* rather than *on* for notifications. Owning the first and last hour of your day. Protecting mornings as uncontested deep work time.`,
    links: ["Deep Work", "Bicycles for the Mind", "The Filter Bubble"],
  },
  {
    title: "Ikigai",
    category: "living",
    body: `## Reason for Being

Japanese concept: the intersection of what you love, what you're good at, what the world needs, and what you can be paid for.

    Love ∩ Good at     = Passion
    Good at ∩ Paid     = Profession
    Paid ∩ World needs = Vocation
    World needs ∩ Love = Mission

    All four           = Ikigai

### The Western distortion
The concept has been flattened in popular culture into "find your passion and get paid." The original Japanese usage is quieter — *ikigai* can be as small as a morning cup of tea, tending a garden, or a weekly phone call with a friend.

### The useful tension
The Venn diagram is useful not as a destination but as a diagnostic. If you have three of the four overlaps but not the fourth, it tells you something specific about where the gap is.`,
    links: ["The Examined Life", "Memento Mori"],
  },
  {
    title: "The Zeigarnik Effect",
    category: "living",
    body: `## Unfinished Tasks Occupy the Mind

Bluma Zeigarnik (1927): people remember interrupted or incomplete tasks better than completed ones. Waiters remember unpaid tabs; once paid, they forget them.

**The mechanism:** the brain keeps an open loop for incomplete tasks, allocating background cognitive resources to maintain awareness of them.

### Implications for productivity
Every commitment you make — to yourself or others — that you haven't honored or explicitly decided not to honor is an **open loop consuming RAM**.

David Allen's *Getting Things Done* is essentially a system for closing open loops: capture everything, clarify it, and put it somewhere your brain trusts. Once the brain trusts the system, it stops maintaining the background chatter.

### The fix
Write it down. Not to remember it later — but to *close the loop now* so your mind is free for the present.`,
    links: ["Deep Work", "The Examined Life"],
  },
  {
    title: "Antifragility",
    category: "living",
    body: `## Beyond Resilience

Nassim Taleb's concept from *Antifragile* (2012): some things don't just *resist* volatility and stress — they *improve* because of it.

| Category | Response to stress |
|---|---|
| Fragile | Breaks |
| Robust | Survives unchanged |
| Antifragile | Improves |

Muscles are antifragile. Bone density increases under load. Immune systems require exposure to pathogens. Entrepreneurs learn from failure.

### The enemy: overprotection
Taleb's controversial claim: attempts to smooth out volatility often make systems *more* fragile, not less. Artificially stabilized systems (financial markets, overprotected children, monoculture agriculture) accumulate hidden fragility.

### The design principle
Build systems — in life, work, health — that have upside from disorder and capped downside. Keep options open. Avoid single points of failure.`,
    links: ["Hormesis", "Amor Fati"],
  },
  {
    title: "Second-Order Thinking",
    category: "living",
    body: `## What Happens Next?

First-order thinking: *what are the immediate effects of this action?*
Second-order thinking: *and then what?*

Howard Marks: "First-level thinking is simplistic and superficial. Second-level thinking is deep, complex, and convoluted."

### Why it matters
Most obvious solutions have obvious problems too. The second-order effects are where reality hides.

**Examples:**
- Banning a drug → black market emerges (criminality rises)
- Building more roads → induced demand → more traffic
- Giving a person a fish → dependency; teaching them to fish → capability

### The practice
For any decision, explicitly ask: *what happens next? and then what?* Write out two or three iterations. Notice where your intuition runs out.

This is also a good check on idealism: noble first-order intentions often produce harmful second-order outcomes.`,
    links: ["Jevons Paradox", "Antifragility", "The Examined Life"],
  },
  {
    title: "The 5 Vectors of Recovery",
    category: "living",
    body: `## A Framework for Restoration

Most people think about health as what they *do* (exercise, diet). Recovery is what makes that work. Five levers:

1. **Sleep** — the master regulator. Non-negotiable floor of 7 hours.
2. **Nutrition timing** — eating in alignment with circadian rhythm; front-loading calories earlier in the day.
3. **Stress management** — parasympathetic activation: breath work, nature, stillness.
4. **Movement snacks** — brief walks after meals lower glucose spikes and break sedentary patterns.
5. **Social connection** — loneliness is as harmful as smoking 15 cigarettes/day (Holt-Lunstad meta-analysis). Deep relationships are a longevity intervention.

### The hierarchy
These are not equal. Sleep comes first. Without it, the others are damage control. With it, the others compound.`,
    links: ["Sleep as the Master Regulator", "Zona 2 Training", "Hallmarks of Aging"],
  },
];

async function main() {
  console.log("Seeding categories...");
  const catMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { id: cat.key },
      update: { name: cat.name, color: cat.color },
      create: { id: cat.key, name: cat.name, color: cat.color },
    });
    catMap[cat.key] = created.id;
  }

  console.log("Seeding notes...");
  await fs.mkdir(NOTES_DIR, { recursive: true });

  const noteMap: Record<string, string> = {};

  for (const n of NOTES) {
    const note = await prisma.note.create({
      data: { title: n.title, body: n.body, categoryId: catMap[n.category] },
    });
    noteMap[n.title] = note.id;

    const frontmatter = `---\nid: ${note.id}\ntitle: "${n.title.replace(/"/g, '\\"')}"\ncategory: "${CATEGORIES.find((c) => c.key === n.category)?.name}"\n---\n\n`;
    await fs.writeFile(path.join(NOTES_DIR, `${note.id}.md`), frontmatter + n.body, "utf-8");
  }

  console.log("Creating links...");
  for (const n of NOTES) {
    if (!n.links) continue;
    const fromId = noteMap[n.title];
    for (const targetTitle of n.links) {
      const toId = noteMap[targetTitle];
      if (!toId) { console.warn(`  ⚠ Link target not found: "${targetTitle}"`); continue; }
      await prisma.link.upsert({
        where: { fromId_toId: { fromId, toId } },
        create: { fromId, toId },
        update: {},
      });
    }
  }

  console.log(`✓ Seeded ${NOTES.length} notes across ${CATEGORIES.length} categories`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
