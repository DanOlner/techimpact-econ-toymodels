# Anthropic's "economic primitives" report: what it measures, where it fits our theory, and what it means for modelling tasks and skills

## What this note is for

The user asked for two things:

1. a run-through of Anthropic's Economic Index report of January 2026, "Economic Primitives", which measures how Claude is used for tasks and with what skills
2. where the report fits the theory in our other notes, where it doesn't, and what new ideas it brings

Two things to bear in mind throughout:

- we'll need to decide how the model matches tasks, work, skills and output
- treating productivity as a sum of separate, "atomic" tasks has serious critics

I read the whole report (55 pages) from the PDF. Pages cited are PDF pages, which match the printed page numbers. I also used Anthropic's November 2025 productivity study, which the report builds on, and its March 2026 follow-up report. I read both of those through a tool that summarises rather than copying pages.

A later section, "Chat versus agentic work", answers a follow-up question: whether the report separates chat from Claude Code-style agentic work, and what that does to task success.

A note on independence: this is Anthropic's report about its own product, with Claude doing the measuring, and I'm an Anthropic model. I've treated it like any other source and set out the critiques in full.

## The report in brief

### Data and method

- **Authors and date.** Ruth Appel, Maxim Massenkoff and Peter McCrory (lead authors), with Miles McCain, Ryan Heller, Tyler Neylon and Alex Tamkin. Published 15 January 2026 (p.1).
- **Samples.**
  - 1 million Claude.ai conversations, from the Free, Pro and Max plans.
  - 1 million records of first-party API traffic, which is mostly businesses. An API record is a single prompt and response, sometimes from the middle of a longer session (p.17, p.26).
  - Both come from 13 to 20 November 2025, just before Opus 4.5 came out (p.2, p.17 footnote 1).
- **How it's measured.** Claude (Sonnet 4.5) reads each anonymised transcript and answers set questions about it (p.18 footnote 7, p.19). Results are kept only for groups of at least 15 conversations from at least 5 accounts (p.36 footnote 1).
- **Tasks.** Conversations are matched to task statements in O\*NET, the US occupational database, as in earlier reports. Over 3,000 distinct work tasks appear (p.2).

### The measures

The report calls its measures "primitives": "simple, foundational measures of the ways that Claude is used, which we generate by asking Claude to answer specific questions about the anonymized transcripts" (p.19). There are five new ones, plus the earlier measure of collaboration patterns. The questions are summarised from Table 2.1 (p.20).

| Measure | What Claude is asked | Answer |
|---|---|---|
| Collaboration pattern (from earlier reports) | Which interaction mode the conversation shows. "Directive" and "feedback loop" count as automation; "validation", "task iteration" and "learning" count as augmentation (p.10, p.18 footnote 5) | One of five modes |
| Task complexity: human time | Hours a competent professional would need without AI, assuming they have the skills, the context and the tools | Hours |
| Task complexity: time with AI | Minutes the user spent, including reading, iterating and, where directly relevant, implementing outside the chat | Minutes |
| Task complexity: multitasking | Whether the user worked on several tasks | Yes or no |
| Skills: could the user do it alone? | Whether the user could have done the task without Claude, even with more time | Yes or no |
| Skills: human education | Years of formal education needed to understand the user's prompts | 0 to 20 |
| Skills: AI education | Years needed to understand Claude's responses | 0 to 20 |
| Use case | Work, coursework or personal use | One of three |
| AI autonomy | How much autonomy Claude had to make decisions | 1 (none) to 5 (extreme) |
| Task success | Whether Claude completed the user's task successfully | Yes or no |

Two derived measures matter later:

- **Speedup** is human time without AI divided by time with AI. Cutting a one-hour task to ten minutes is a speedup of 6 (p.38).
- **Autonomy is a separate dial from automation.** "Translate this paragraph into French" is directive, so it counts as automation, but it needs little decision-making from Claude, so its autonomy is low (p.19).

### How well the measures are checked

- **The aim is direction, not precision.** "Multiple simple primitives, even if somewhat noisy and not perfectly accurate by themselves, can together provide important signals" (p.22). "None of the measures should be taken as exact or definitive" (p.23).
- **Checks against people.** For Claude.ai, the classifiers were compared with a human researcher's ratings on a small set of transcripts whose users had given feedback. For the API, they were checked against internal and synthetic data (p.22). The report doesn't give agreement rates.
- **Checks against outside data.**
  - **Education.** Across 576 occupations, the education measure explains 28% of the variation in the share of workers with a degree (R² = 0.282, Figure 2.1, p.24). The figure plots averages for 20 bins, which makes the fit look much tighter than that.
  - **Time.** In the November 2025 study, Claude's time estimates for 1,000 software tasks with tracked completion times correlated with the actual times at 0.44 to 0.46. The developers' own estimates correlated at 0.50 to 0.67. Claude's estimates were compressed, overestimating short tasks.

### Headline findings

**How Claude is used** (chapter 1):

- **Concentrated on a few tasks.** The ten most common tasks account for 24% of Claude.ai conversations and 32% of API records. "Modifying software to correct errors" alone is 6% of Claude.ai use and one in ten API records (p.5–7).
- **Computing dominates.** Computer and mathematical tasks are 34% of Claude.ai use, down from a peak of 40% in March 2025, and 46% of API use (p.7).
- **Augmentation is back ahead on Claude.ai,** at 52% of conversations against 45% automation, reversing August 2025. Directive use fell from 39% to 32% (p.5, p.9). API traffic is 75% automation (p.10).
- **Purposes.** Claude.ai use is 46% work, 19% coursework and 35% personal. API use is 74% work (p.26).

**The primitives** (chapter 2; Figure 2.2, p.25; p.26):

- **The average Claude.ai task:**
  - takes 3.1 hours of a professional's time without AI, against 15.4 minutes with it (roughly 12 times faster)
  - could have been done by the user alone 88% of the time
  - needs 12.2 years of education to understand both the prompts and the responses
  - scores 3.4 out of 5 for autonomy
  - succeeds 67% of the time
- **API tasks are shorter and succeed less often.** They take 1.7 hours without AI against 3.1, and 5 minutes with AI against 15. They succeed 49% of the time against 67%.

**Geography** (chapters 1 and 3):

- **Across countries,** usage per head rises with GDP per head, with an elasticity of about 0.7 (p.28, p.31).
- **Across US states,** usage follows the mix of occupations. States with more computer and mathematical workers use Claude more, and this explains about 60% of the variation between states (R² = 0.61, p.13–14).
  - The text reads the slope as 0.36% more usage for each 1% more tech workers. But the fitted line in Figure 1.7 regresses the log of usage on the share in percentage points. On my reading, each extra percentage point of tech workers goes with about 0.36 log points, roughly 43%, more usage per head.
- **Convergence.**
  - **US states:** usage became more even between August and November 2025, with the Gini coefficient falling from 0.37 to 0.32. A simple model in which each state closes a fixed share of its log gap each quarter gives parity in 2 to 5 years. That would be "roughly 10x faster" than 20th-century technologies spread. The authors stress this rests on three months of data (p.6, p.12, p.15–17).
  - **Countries:** there's no convergence across countries (p.6).
- **Richer countries** use Claude more for personal use and less for coursework, and more collaboratively (p.29–30, p.35). The text says work use is also higher in richer countries, but in Figure 3.2 that link is weak and not significant (r = 0.14, p = 0.13).
- **"How humans prompt is how Claude responds."** The education levels of prompts and responses correlate at r = 0.925 across countries and 0.928 across states (p.34). Claude responds in a sophisticated way mostly when the prompts are sophisticated (p.35).

**Tasks and productivity** (chapter 4):

- **More complex tasks are sped up more, but succeed less often.**
  - **Speed.** On Claude.ai, prompts needing 12 years of education get a speedup of about 9, and those needing 16 years about 12. API speedups are higher throughout (p.38–39).
  - **Success.** It falls from about 70% for tasks below high-school level to 66% at college level (p.39).
  - **Automation.** The share of use that's automation doesn't vary with education (p.40).
- **Task horizons.** On the API, success falls from about 60% for tasks under an hour to about 45% for tasks of 5 hours or more. The fitted line crosses 50% at 3.5 hours; METR's benchmark gives 2 hours for Sonnet 4.5. On Claude.ai, success falls far more slowly, and the fitted line would reach 50% at about 19 hours. That may be because conversation lets users correct course. Users choose which tasks to bring, so observed success overstates capability across all tasks (p.41–42).
- **Effective AI coverage.**
  - **Definition:** the share of a worker's time-weighted tasks that Claude can do successfully. Task time shares come from the earlier productivity study, task frequencies from O\*NET and success rates from the primitives (p.43).
  - **Plain task coverage is up:** 49% of occupations now have AI use on at least a quarter of their tasks, up from 36% in the first report (p.43).
  - **Effective coverage tells a different story:**
    - **Data entry keyers** have only 2 of 9 tasks covered. But one is the task they spend most time on, so their effective coverage is among the highest.
    - **Radiologists and medical transcriptionists** rise for the same reason.
    - **Microbiologists** fall. Claude covers half their tasks, but not hands-on lab work, which takes most of their time (p.44–45).
  - **The report's own warning:** "even 90% task coverage does not necessarily indicate large job impacts" (p.43).
- **What's left of jobs.**
  - **Claude covers the more educated tasks.** A model trained on task descriptions predicts that tasks seen in Claude use need 14.4 years of education on average. All tasks, weighted by employment, need 13.2 (p.45–46).
  - **Most jobs deskill.** Removing the covered tasks lowers the education level of what remains for technical writers, travel agents and several teaching jobs (p.46–47).
  - **A few upskill.** Real estate managers lose record-keeping and keep negotiation and board work (p.47).
  - **What it implies.** The report reads its education measure as Autor & Thompson's "expertise". On that reading, wages could fall and employment rise in jobs that deskill, and the reverse in jobs that upskill. The report accepts that education isn't the same as expertise: an electrician's wiring task is expert work but rates as low-education (p.47).
- **Productivity.**
  - **Baseline.** The report adds up task speedups with Hulten's theorem, weighting each occupation by its share of the US wage bill. That gives 1.8 percentage points a year of extra US labour productivity growth over a decade, from both the Claude.ai and API data (p.48).
  - **Adjusted for success,** the figure falls to 1.2 points (Claude.ai) and 1.0 (API) (p.48).
  - **Tasks as complements or substitutes.** The report combines tasks within an occupation with a constant elasticity of substitution, σ.
    - With σ = 0.5 (complements), the figure is 0.7–0.9 points, or 0.6–0.8 after adjusting for success.
    - With σ = 1.5 (substitutes), it's 2.2–2.6 points (p.50–51).
- **The fine print** (p.52–53, footnotes 6–9):
  - **Unobserved tasks** are assumed to gain nothing.
  - **Rare tasks** are left out: those seen fewer than about 200 times in the million conversations. That threshold was chosen "because it replicates our previous results". With no threshold, the same method gives about 5 percentage points a year.
  - **The success adjustment** multiplies each task's log time saving by its success rate. This assumes people use AI only on the parts of a task where it works.
  - **Across occupations,** gains are added with fixed wage-bill weights in every version. That's exact only if occupations combine with an elasticity of 1. Otherwise it's a first-order approximation, which can be well off for shocks this large (Baqaee & Farhi 2019).

### What the report says it can't tell us

- **Selection.** Users bring the tasks they expect Claude to handle (p.42).
- **Noisy classifiers.** The measures are directional only (p.22–23).
- **Use isn't displacement.** Effective coverage doesn't show whether a conversation replaces paid work. When a conversation maps to a teacher's lecturing task, it's "less clear how this translates to reduced lecture time on the job" (p.45).
- **Diffusion.** The diffusion estimate rests on three months of data (p.17).
- **Correlation, not cause.** The primitives aren't causes: income and education may stand in for other conditions (p.32).
- **The November 2025 productivity study adds more limits.**
  - It can't count time spent outside the conversation, such as checking Claude's work.
  - "Real jobs are more complex than an O\*NET task list."
  - Past randomised trials found smaller savings: "56%, 40%, 26%, 14% and even negative".
  - The estimate is an exercise, not a prediction.

### What came after

- **March 2026, "Learning curves".**
  - **Experienced users succeed more.** Users with six months or more of experience have about 10% higher success rates without controls, and 3–4 percentage points higher with them.
  - **They bring harder tasks:** roughly one more year of education needed for each extra year of use.
  - **The authors' caveats.** Early adopters chose themselves, and users who stay may be those for whom Claude works. They frame the result as a possible skill-biased channel.
  - I read this report through a summarising tool.
- **June 2026, "Cadences".** This report:
  - adds conversations from Cowork, Anthropic's folder-based agent, alongside chat
  - links usage to a survey of about 9,700 users
  - compares Claude Code with chat on autonomy

  See the next section.

## Chat versus agentic work: does the report separate them?

The user asked whether the report separates simple chat from Claude Code-style agentic work, where Claude works through files in a folder, as in this project. And if it does, what difference that makes to task success.

### Short answer

- **The January report doesn't separate them.** It never mentions Claude Code, agents or agentic use. Its two samples are Claude.ai chat conversations and first-party API records (p.17 footnote 1).
- **Anthropic's separate analyses of Claude Code don't compare success with chat.** I found four. They compare automation, autonomy and how often people step in. The only success measure comes from Anthropic's own internal use, tracked over time.
- **Outside studies of agentic coding** show a wide gap between "the agent says it's done" and "the work is usable". How success is defined changes the answer more than anything else.

### Where Claude Code traffic would sit in the January data

- **How Claude Code is accessed.** It needs a Pro, Max, Team, Enterprise or Console (API) account, or runs through Amazon Bedrock, Google Cloud or Microsoft Foundry (Claude Code documentation).
- **The report doesn't say which sample, if either, includes it.** My reading:
  - **Subscription use** is probably not in the Claude.ai sample. The report describes that sample as "conversations", and the June 2026 report treats Claude Code as a separate product from chat. Team and Enterprise accounts aren't in the January Claude.ai sample at all, since it covers "Free, Pro and Max".
  - **API-key use** would be in the API sample, but in pieces. Each API record is a single prompt and response, "in some instances ... mid-session". API requests arrive "with no metadata linking them to prior exchanges" (p.17, p.26). An agentic session of dozens of steps would appear as unconnected fragments, each judged for success on its own.
  - **Use through cloud providers** is in neither sample, since both cover only Anthropic's own traffic.
  - **Cowork**, Anthropic's folder-based agent for non-coding work, launched as a research preview on 12 January 2026, after the November sample was taken (news coverage).
- **So the API results aren't agentic results.** The API's lower success (49% against 67% for Claude.ai) and shorter horizon (3.5 hours against about 19) describe single exchanges taken out of context. For one step of an agent's work, "did Claude complete the user's task" is the wrong question. A step can do its job while the task isn't finished, or look finished while the task fails later. So the bias could run either way (my reading).

### What Anthropic has published separately on Claude Code

| Source | What it covers | Main findings | Success measured? |
|---|---|---|---|
| "AI's impact on software development", April 2025 | 500,000 coding interactions from April 2025, half Claude Code and half Claude.ai (Free and Pro plans) | Automation was 79% on Claude Code against 49% on Claude.ai. Directive use was 43.8% against 27.5%, and feedback loops 35.8% against 21.3%. Startup work was 32.9% of Claude Code conversations, and enterprise work 23.8% | No. "We only studied what developers delegate to AI—not how they ultimately use AI outputs, the quality of the resulting code, or whether these interactions effectively improved productivity" |
| "How AI is transforming work at Anthropic", December 2025 | Anthropic's own staff: a survey of 132 people, 53 interviews and 200,000 internal Claude Code transcripts | Between February and August 2025, the most consecutive actions without human input rose from 9.8 to 21.2, and human turns per transcript fell from 6.2 to 4.1. Staff said 27% of Claude-assisted work wouldn't have been done otherwise. More than half said they can fully delegate only 0–20% of their work | Not in the transcript analysis |
| "Measuring AI agent autonomy in practice", February 2026 | Claude Code sessions from September 2025 to February 2026, and about a million public API tool calls | The longest turns (99.9th percentile) grew from under 25 to over 45 minutes. Full auto-approval rises from about 20% of sessions for new users to over 40% for very experienced ones, but experienced users also interrupt more often (about 9% of turns against 5%). On complex tasks, Claude stops to ask for clarification more than twice as often as people interrupt it. Software engineering is nearly half of API tool calls | Only for internal use: success on the hardest tasks doubled between August and December, and human interventions per session fell from 5.4 to 3.3, as judged by Claude. None for the public API |
| "Cadences", June 2026 | Chat and Cowork conversations from April to June 2026, compared with Claude Code | Autonomy is higher on Claude Code for 26 of 31 types of output: for scripts and code snippets, by 0.53 points on the 1–5 scale. The median blog post takes 13 rounds of back-and-forth in chat or Cowork, but a single prompt in Claude Code. 54% of Claude Code sessions use Opus, against 10% of chat and Cowork | No |

### What difference it makes to task success

- **I could find no like-for-like comparison.**
- **Interaction structure changes measured success.** In the January report, multi-turn chat succeeds more often than single API exchanges (67% against 49%), and holds up on far longer tasks (p.26, p.41–42).
- **Agentic work moves the checking.** In chat, a person checks each step. An agent checks its own work against files, errors and tests, and the person reviews at the end or steps in. The June 2026 figures show the difference: 13 rounds of back-and-forth for a blog post in chat or Cowork, against a single prompt in Claude Code.
- **"Success" splits into levels, and agentic coding shows big gaps between them:**
  1. **The agent says it's finished.** This is closest to the report's measure.
  2. **Automatic tests pass.**
     - **METR, August 2025.** Agents built on Claude 3.7 Sonnet passed the maintainers' tests on 38% of 18 real tasks, but none of the passing solutions could be merged as they stood. Fixing them would take about a third of the time the original work took.
     - **METR, March 2026.** Maintainers reviewed 296 agent-written changes that had already passed SWE-bench Verified's automatic grader. Roughly half would not have been merged, and merge rates ran about 24 points below the grader's scores.
  3. **The work is accepted.**
     - **Claude Code in open source.** Of 567 Claude Code pull requests in 157 open-source projects, 83.8% were merged, and 54.9% of those were merged without changes (Watanabe et al.).
     - **Coding agents in general.** Across 456,000 pull requests written by five coding agents, including Claude Code, agents' requests were accepted less often than people's (Li, Zhang & Hassan).
  4. **The work holds up over time.** Projects adopting Cursor, an AI coding editor, saw a large but short-lived rise in development speed. They also saw a lasting rise in static-analysis warnings and code complexity, which later slowed development (He et al.).
  5. **It saves time overall.**
     - **METR's 2025 trial** found experienced developers 19% slower with early-2025 tools.
     - **Its 2026 follow-up,** with agents such as Claude Code and Codex now in use, estimated 18% faster for returning developers and 4% faster for new ones. The confidence intervals include no effect at all.
     - **METR judges that data unreliable.** Developers who didn't want to work without AI declined to take part. And time per task couldn't be measured for developers running several agents at once.
- **Running agents in parallel breaks time per task.** When one person runs several agents, the time a task takes no longer measures the human time it uses. The report's speedups are built on time per task. For agentic work the better measure is output per hour of human attention, which is the looms-per-weaver question again.

### What it means for our model

- **Mode is a dimension of the task.** Chat, one-shot automation and agentic work each need their own speedup, success rate and failure cost. Don't carry the report's API figures over to agentic work.
- **Some failure costs arrive later.** Agentic work moves review, rework and maintenance until after the event, as the Cursor study shows. In a dynamic model, a stock of hidden defects that raises future labour per unit would capture this. This is my suggestion.
- **Supervision is the scarce input.** Agentic work can be modelled by how many agents one person can direct and review, which is a span of control.
  - That span rises with experience: experienced Claude Code users approve fewer steps one by one and step in selectively.
  - It's a skill learned by doing, so it differs by cohort.
- **Agentic work outside coding is barely measured.**
  - Work like this project's, where Claude Code writes research notes in a folder, isn't coding, so Anthropic's coding analyses don't cover it.
  - On my reading, the January report would either miss it or see it in fragments.
  - The June 2026 report includes Cowork, but counts it together with chat.

## Where it fits our theory so far

| Our theory | What the report adds | What it leaves out |
|---|---|---|
| Bessen: productivity growth A, and the demand elasticity ε that decides whether jobs rise or fall (`bessen-inverted-u-model-brief.md`) | Rough, task-level estimates of how far AI could raise A, and for which occupations. Its country pattern also fits Bessen's distribution of uses. Places that adopt early use AI for "specific, high-value applications", and use spreads to casual and personal purposes as adoption matures (p.3, p.30). In Bessen's 2019 terms, demand depends on the price in hours of wages, and a subscription costs far fewer hours in a rich country (my inference). | Demand entirely. The 1.8 points assume time saved becomes output. The report itself says impacts depend on "whether increased productivity at a certain task may increase the demand for it" (p.54). That's Bessen's ε − 1. |
| Input-output network and Hulten's theorem (`io-network-extension.md`) | The same first-order logic: gains weighted by size, here by occupations' share of the wage bill | Everything Hulten leaves out: price pass-through, which products get cheaper, network amplification, and the second-order effects that depend on elasticities |
| Schneider & Vipond: who gets the new jobs | Skill gradients in use and success. Its earlier automation and augmentation data fed the "Canaries" paper on young workers (p.19, p.24) | Flows of people between jobs, ages, and who is displaced |
| Regions as worker groups | Usage by place follows the occupation mix, as the earlier GM project assumed when it mapped exposure through industry and occupation | Whether usage means productive adoption, and where gains are booked and received (`gva-flows-model-lessons.md`) |
| Diffusion over time | A partial-adjustment rule: each state closes part of its gap each quarter. That's the same form we suggested for demand | Usage per head isn't adoption by firms |
| Exposure and complementarity in the GM project | Measures from actual use rather than from O\*NET abilities. Coverage comes first, and the mode of use is defined only within covered tasks. That matches the earlier journal's point that a job that isn't exposed can't be complemented or substituted | The same problem as the earlier project's LLM scores: the measuring instrument is a language model, checked only for direction |
| The "streetlight" theme (GVA and PhD notes) | A new light: what happens inside conversations | What happens afterwards: whether the code ran, the letter was sent, or the work was paid for |

## What's new: ideas our notes don't have yet

1. **Reliability is separate from speed, and falls with task length.**
   - **A new dimension.** Our notes treat a technology as a productivity number. The report adds a success rate that falls with task length, and an "effective task horizon" that depends on how people work with the AI: 3.5 hours one-shot against roughly 19 hours in conversation (p.41–42).
   - **What that means.** Human involvement is partly a reliability technology. Augmentation is how users get acceptable output on long tasks.
   - **A historical parallel, on my reading.**
     - **Lowell, 1842.** Textile firms moved weavers from two looms each to three. The change had been unprofitable before then and depended on on-the-job learning. It also changed who was hired. The firms went from mostly literate young women from New England farms, who stayed only briefly, to local workers, including Irish and illiterate workers, who stayed longer (Bessen 2003).
     - **The wider 19th century.** Much of the growth in weaving output per hour came from better workers rather than from inventions: "better workers spent less time monitoring the looms" (Bessen 2012).
     - **The link.** The number of machines one person can mind is an old version of "how much autonomy to give the AI".
2. **Autonomy is the agentic-AI dial.**
   - **Why it matters.** Autonomy decides how much one person can supervise, which is a question of span of control and of who handles which problems.
   - **The theory.** Garicano's knowledge hierarchies are the framework for this. In Ide & Talamas's version with AI:
     - autonomous AI mainly benefits the most knowledgeable people
     - AI that only assists (non-autonomous AI) mainly benefits the least knowledgeable
   - **For the model.** This makes the report's autonomy measure a parameter, not just a description.
3. **AI covers the more educated tasks.**
   - **A reversal of the 20th century.** Computers took over routine, middle-skill tasks. Here the tasks AI takes are the more educated ones. That looks more like 19th-century factories taking work from skilled artisans (Goldin & Katz 1998; Katz & Margo 2014), which is the user's power-loom framing.
   - **Autor & Thompson add the labour-market consequence.**
     - When automation removes a job's expert tasks, wages fall but less expert workers can enter, so employment can rise.
     - When it removes the inexpert tasks, wages rise but fewer people qualify.
   - **The link to Schneider & Vipond.** This is a mechanism for their pattern. As in bootmaking, about as many jobs can be created as lost while going to different people, because the requirements changed.
4. **Two kinds of skill can move in opposite directions.**
   - **What the report and Canaries find.** By the report's measure, AI deskills jobs. The Canaries paper finds the losses fall on 22- to 25-year-olds in the most exposed occupations: a 13% relative fall in employment in the August 2025 version, widening to a 19% gap by the August 2026 revision.
   - **The authors' suggested explanation.** AI substitutes for codified knowledge, which new graduates bring, more than for tacit knowledge, "the idiosyncratic tips and tricks that accumulate with experience".
   - **What follows.** "Deskilling" by years of schooling can be biased towards experience at the same time. The skill dimension chosen decides the story.
   - **Tacit skill across generations.** If entry-level tasks are automated, novices lose the work they learned tacit skills on.
     - Ide (2025) models this with overlapping generations: automation of entry-level work can raise output now and lower growth later.
     - The earlier project's journal flagged the same worry, via an FT piece on on-the-job learning.
5. **Whether AI levels skills or widens gaps is open.**
   - **Levelling.** Trials of narrow tasks mostly find the least skilled gain most:
     - customer support: 14% more issues resolved on average, and about 34% more for novices
     - consultants: the below-average gained most inside the "frontier" of tasks AI does well, but answers were less often correct outside it
     - legal work, from the earlier project's sources
   - **Widening.** Kenyan entrepreneurs given an AI mentor: high performers gained just over 15% and low performers did about 8% worse (Otis et al.).
   - **The report's own evidence leans towards widening:**
     - the 0.925 match between prompts and responses
     - the March 2026 finding on experienced users
   - **A caution on the 0.925.** It's two judgements by the same model of the same conversation, and a reply naturally mirrors its prompt. So on its own it's weak evidence that skill and AI complement each other (my reading).
   - **For the model.** The journal's point that some workers can use augmenting technology and others can't is this parameter: the skill gradient of augmentation.
6. **Which tasks matter, weighted by time.** Effective coverage shows that the time-intensive core of a job matters more than the number of tasks covered. In a model, that's the task time shares.
7. **Much use isn't paid work: 35% personal and 19% coursework.**
   - **Self-service.** Gershuny argued in 1978 that households were increasingly buying goods to provide services for themselves, rather than buying the services. AI could do the same for travel planning, letters, tutoring or legal questions (my inference). Final demand for some consumer and business services could then fall even as their use rises, and the shift wouldn't show in GDP.
   - **Learning.** Coursework is human capital forming for future cohorts, as the report itself says (p.21).
8. **Tasks graduate from chat to automation.**
   - **The report's expectation.** Tasks "that prove automatable may graduate from interactive chat to API deployment" (p.54).
   - **Read as a sequence,** augmentation is the learning phase before automation.
   - **For the cohort model,** workers who learn to do a task with AI may be building the process that later automates it. That's a twist on Schneider & Vipond's stranded early adopters.
9. **Bottlenecks change the timing.**
   - **Gans & Goldfarb** (cited p.51) treat tasks as quality complements. Partial automation can then raise labour income by making the remaining bottleneck tasks more valuable.
   - **Bundles.** Automation also tends to come in bundles, so a job can hold up and then go quickly.

## Critiques of the task-based approach, and how far the report meets them

What the task approach is good for: it links a technology to specific work, and explains why middle-skill jobs hollowed out under computers. In Acemoglu & Restrepo's version, it also lets new tasks appear as old ones go. The report's data wouldn't exist without it. The critiques fall into eight groups.

1. **Tasks are complements, not separate pieces.**
   - **The sources.**
     - **Kremer** treats quality as multiplying across tasks, in his O-ring theory.
     - **Baumol, and Aghion, Jones & Jones,** argue that growth is held back by what is essential and hard to improve.
     - **Gans & Goldfarb** find that linear exposure indices overstate displacement when tasks are complements.
     - **Hampole et al.** find that two things matter: the average exposure of an occupation's tasks, and how concentrated it is. Concentrated exposure lets workers move their effort to other tasks.
   - **A simple way to see it** is Amdahl's law from computing. If half a job's time goes on tasks AI doesn't touch, and tasks can't substitute for each other, the job can at most get twice as fast, however fast the rest becomes.
   - **The report** answers this partly, with its σ exercise. But σ is assumed, not measured, and the answers range from 0.6 to 2.6 points a year depending on σ. Its choice matters about as much as all the measurement put together.
2. **The task list is a snapshot of today's way of working.**
   - **New work.** Most of today's US jobs are in kinds of work that didn't exist in 1940 (Autor, Chin, Salomons & Seegmiller).
   - **Reorganisation.** Large gains from a general-purpose technology come from redesigning work around it:
     - electrification paid off once factories were redesigned (David 1990)
     - computers paid off with new workplace organisation (Bresnahan, Brynjolfsson & Hitt 2002)
     - measured productivity can dip before it rises, as firms invest in redesign (Brynjolfsson, Rock & Syverson 2021)
   - **The earlier journal** makes the same point with the shipping container and Haynes's "black box".
   - **The report** doesn't meet this. It maps conversations onto existing O\*NET tasks, so new tasks can't appear. Humlum & Vestergaard's Danish data show AI creating new ones: AI oversight and integration.
3. **Much work isn't in any task list.**
   - **What's missing.**
     - **Tacit knowledge.** "We know more than we can tell" (Polanyi's paradox; Autor 2014).
     - **Coordination,** including the "articulation work" that holds tasks together.
     - **"Invisible work"** (Star & Strauss 1999).
     - **Accountability:** who signs off, and who is liable.
   - **An example the user flagged.** The earlier journal quotes Narayanan's point that few people could split their own job into tasks whose automation would automate the whole job.
   - **The report** acknowledges this (the November study's "real jobs are more complex" line) but doesn't measure it.
   - **A related point.** Microsoft's study separates the user's goal from what the AI does in a conversation (Tomlinson et al.). The AI's activity isn't necessarily the worker's task, as the report's own teacher example shows.
4. **Time saved isn't output gained.**
   - **What's missing from the timing.** Checking, rework and integration outside the chat aren't counted, and saved time may not go into more output.
   - **The evidence is far below the report's task-level figures:**
     - METR's randomised trial found experienced developers were 19% slower with AI on their own projects, though they expected to be 24% faster.
     - In Denmark, chatbots saved about 3% of work time on average and had no detectable effect on earnings or recorded hours. The first version of the study ruled out effects above 1%. The later version ruled out effects above 2%, two years after ChatGPT's launch.
     - A US survey found users saving 5.4% of their work hours, which is 1.4% of all workers' hours (Bick, Blandin & Deming).
   - **Reconciling the gap.** Part of it is that only some tasks use AI. Part is that the report's speedups are estimated by Claude, not measured.
   - **The report** adjusts for success, but says nothing about whether saved time is put to use.
5. **Who judges success, and on what evidence.**
   - **The judge is Claude.** It decides from the transcript whether it succeeded, not from what happened afterwards.
   - **Known biases.** Language models used as judges tend to favour their own output (Panickssery et al. 2024). Users also bring the tasks they expect to work.
   - **The report** acknowledges the selection problem. Its human check of the judgements was small.
6. **Skill isn't years of schooling needed to read the text.**
   - **What the measure misses.** Expertise in Autor & Thompson's sense is different, as the report's electrician example shows. Tacit, manual and interpersonal skills are invisible to it.
   - **An uneven comparison.** "Human time" is for "a competent professional", while time with AI is the actual user's. Sometimes the user isn't that professional, as in the 12% of conversations where they couldn't have done the task alone. Then the speedup compares unlike things.
   - **New demand counted as savings.** For tasks nobody would otherwise have paid for, the "saving" is really new consumption. These are Bessen's uses that become affordable when the price falls, not labour saved.
7. **Adding up: Hulten's theorem and demand.**
   - **What the theorem gives.** It's a first-order result for an efficient economy. It gives the aggregate productivity gain but says nothing about employment, reallocation or demand. Second-order effects depend on elasticities and the network (Baqaee & Farhi 2019).
   - **The inputs decide the answer.** Acemoglu applied the same theorem to smaller task-level inputs and got no more than 0.66% extra total factor productivity over ten years. The threshold sensitivity, 1.8 points against about 5, shows how much depends on which tasks count.
   - **For us,** this is where our model adds most.
8. **Use isn't adoption, and adoption isn't impact.**
   - **The argument.** Narayanan & Kapoor's "AI as Normal Technology", which the earlier journal met through O'Reilly, distinguishes methods, applications and adoption. They expect adoption to run at the pace of organisations.
   - **What "10x faster" measures.** The report's figure is usage per head converging across states over three months. It isn't firms reorganising.

The unit of analysis has always mattered:

- **Whole occupations.** Frey & Osborne put 47% of US jobs at high risk of automation.
- **Tasks within jobs.** Arntz, Gregory & Zierahn put 9% of jobs at risk across OECD countries.

## Modelling how tasks, work, skills and output are matched

### The chain from task to person

1. **Task:** AI changes the time a task takes (speedup) and how often it works (success).
2. **Job or product:** tasks combine, with some substitutability σ, into the labour needed per unit of output, and the job's time is spread across tasks.
3. **Price:** savings pass down the supply chain, fully or partly (`io-network-extension.md`, `gva-flows-model-lessons.md`).
4. **Demand:** Bessen curves decide how much more is bought (`bessen-inverted-u-model-brief.md`).
5. **Hours by task:** output × labour per unit × each task's time share.
6. **People:** hours on each task are filled by worker types according to matching rules, giving employment and earnings by skill, cohort and (later) region.

The report measures link 1, and jumps from there straight to aggregate output with Hulten's theorem. Our model is about links 2 to 6.

### Design choices, and what each rules out

**A. The unit: a job made of a few tasks, combined with an elasticity σ.**

- **Labour per unit after AI.** This is the standard cost formula for this kind of combination. Labour per unit of output = labour per unit before × [Σ_k θ_k · S_k^(σ−1)]^(1/(1−σ)). Here θ_k is the share of the job's time spent on task k before AI, and S_k is the effective speedup on task k.
- **New time shares.** θ′_k = θ_k · S_k^(σ−1) / Σ_j θ_j · S_j^(σ−1).
- **Special cases:**
  - **σ → 0, strict complements.** Labour per unit becomes Σ_k θ_k / S_k times its old value. That's Amdahl's law.
  - **σ = 1.** The job's speedup is the time-weighted geometric mean of the task speedups, which is the report's baseline. Time shares don't change.
  - **σ > 1.** Workers specialise in the tasks AI speeds up most.
- **Worked example** (my calculation). Two tasks take half the job's time each, and AI makes one of them 12 times faster. The speedups in the table are for the job as a whole. The last column shows the sped-up task's new share of the job's time.

  | σ | Job speedup | Most it can reach as AI gets faster | Sped-up task's new share of time |
  |---|---|---|---|
  | near 0 | 1.8 | 2 | 8% |
  | 0.5 | 2.4 | 4 | 22% |
  | 1 | 3.5 | no limit | 50% |
  | 2 | 6.5 | no limit | 92% |

- **Whether jobs "deskill" depends on σ.**
  - **Below 1,** time moves towards the tasks AI doesn't help with, and the job comes to look like them. The report's task-removal exercise is the extreme case.
  - **At 1,** the job's mix of tasks doesn't change.
  - **Above 1,** the job shifts towards the AI-assisted tasks.
  - **So** the report's deskilling result holds only if tasks are complements.
- **What it rules out.** One σ treats every pair of tasks as equally substitutable. If that matters, nest the tasks in groups. This is the PhD note's dependency point again, applied to tasks rather than products.
- **Reorganisation.** It could later be represented as an investment that raises σ or shrinks a bottleneck task, with a cost up front. That would produce the dip-then-rise of the productivity J-curve. This is my suggestion.

**B. Turning the report's measures into parameters: how failure is costed.**

- **Illustrative figures** (my calculations). Take the report's average speedup of about 12 and success rate of 67%.
  - **The report's method** scales the log gain by the success rate, assuming AI is used only where it works (p.53 footnote 8). The effective speedup is 12^0.67, about 5.3.
  - **If a failure wastes the attempt** and the task is then done unaided, time per task is T/12 + 0.33 · T, where T is the time the task takes unaided. The effective speedup is then about 2.4.
  - **Add checking time** outside the chat of 10% of the unaided time, and the effective speedup falls to about 1.9.
  - **METR's trial** shows the effective figure can even fall below 1.
- **It also changes which tasks gain most.** Take the report's figures for tasks needing 12 and 16 years of education: speedups of 9 and 12, success roughly 70% and 66%.
  - **The report's method** keeps the gradient: about 4.7 against 5.2.
  - **The wasted-attempt model** erases it: about 2.4 for both.
- **The point.** The same measurements give anything from about 5 down to 2, depending on the failure model alone. So make the failure model explicit, and a scenario switch. The right failure model also differs between chat and agentic work (see "Chat versus agentic work").

**C. What a skill is: at least two dimensions.**

- **Level.** Expertise or schooling. This decides which tasks a worker can do, and possibly how much augmentation helps.
- **Kind.** Codified against tacit, experience-based knowledge, and old-technique against new-technique skill. This is Schneider & Vipond's obsolete skills and the hand-loom weaver's craft.
  - **Partly specific to tasks.** Workers move more easily between jobs with similar tasks, and task-specific skill accounts for up to 52% of individual wage growth (Gathmann & Schönberg 2010).
- **Learned by doing.** Skill on a new technique grows with time spent on it, at rates that can differ by group:
  - At Lowell, literate weavers learned faster, but local workers stayed longer (Bessen 2003).
  - Experienced AI users succeed more (March 2026 report).
- **A minimal version.** Two levels × two kinds gives four worker types, alongside the cohorts already planned. Age stands in for experience.

**D. What a technology does to a task: three effects to keep apart.**

1. **Automate.** The task is done without the worker, at some cost and success rate, perhaps with people checking. This is Acemoglu & Restrepo's displacement. The power loom automated the weaving motion but still needed minders.
2. **Augment, levelling.** Output rises most for the less skilled; see the trials under "Whether AI levels skills" above. The report's "could the user do it alone" measure is a direct sign of AI letting people work above their level. Users couldn't have done the task alone in 12% of conversations, and in 18% of software conversations.
3. **Augment, skill-biased.** Output rises most for the more skilled. The evidence is the report's prompt matching, experienced users, Otis et al., and Ide & Talamas for autonomous AI.

- **The skill gradient.** One parameter, running from levelling to skill-biased, covers effects 2 and 3. The journal's binary pairs are its two ends.
- **New tasks to add.** Checking and integration work created by the technology. How many AI agents, or looms, one person can mind depends on autonomy and reliability. This is Acemoglu & Restrepo's reinstatement.

**E. How workers are matched to tasks.**

- **Start simple.** Each worker type has a productivity on each task, in a small table. Each task has a minimum level, and firms fill task hours from the types that qualify.
  - **Under Autor & Thompson,** deskilling lowers the minimum so more groups qualify, and upskilling raises it.
  - **The Schneider & Vipond access gap enters here.** Entrants may meet a new minimum that incumbents with old-technique skills don't.
- **Moves between jobs and industries** follow group-specific hiring chances, as in the cohort brief. These chances can fall with the task distance between the old job and the new one.
- **Learning.** Time on a technique raises skill. If entry-level tasks are automated, novices lose the work they learned tacit skills on (Ide 2025).
- **Avoid optimising every assignment every period.** The PhD lessons apply: agent ordering bias, oscillation, and signals muddied by rivals. Use simple rules and test them.

**F. Output: quantity first, quality later.** Bessen didn't measure quality, the trials show AI changes it, and in an O-ring set-up quality multiplies across tasks. Treat quality as a later step.

**G. A minimal version for the journal's two-sector start.**

The user's journal (`dan_journal.md`) proposes starting smaller than the five-industry network:

- two sectors: a design firm and a manufacturing firm
- two firms in each sector, or four in all, so demand can shift between products
- no geography
- enough worker types to separate skills matched to tasks, automation against augmentation, and who can use augmenting technology

A task layout that would fit (my suggestion):

- **Design:**
  - codifiable drafting and specification: higher education, high AI applicability
  - client judgement and coordination: the bottleneck, with low applicability
- **Manufacturing:**
  - production, the power-loom case: automation that lets workers with less specific skill run the process
  - set-up and quality control
- **Supply and demand.** Design sells to manufacturing, and perhaps to final demand. Manufacturing sells to consumers on a Bessen curve.
- **Firms.** One firm in each sector adopts and one doesn't, so customers and workers can move between them. This echoes the IMF point in the earlier project: workers can lose out if their employer doesn't invest.
- **Workers.** Two levels × two kinds, in cohorts.
- **Scenarios to compare:**
  - automation against levelling augmentation against skill-biased augmentation
  - low σ against high σ
  - elastic demand against saturated demand

The same task layer works unchanged in the five-industry network later.

## How sure to be

- **The report.** I read it in full from the PDF, and the numbers are from its text. One exception: the semi-log reading of Figure 1.7's slope is mine, from the figure.
  - **What its measures are.** They're Claude's judgements, which the authors claim are right only in direction.
  - **The outside checks are modest:** R² of 0.28 for education, and time estimates that correlate with actual times a little less well than developers' own estimates.
- **Other Anthropic material.** I read the November 2025 study and the March 2026 report only through a summarising tool, so treat their exact numbers as approximate.
- **The wider literature.** These details come from abstracts and summaries. The exception is the Humlum & Vestergaard abstract, which I read directly.
- **Figures that changed between versions:**
  - **Canaries:** 13% in August 2025, about 16% in later 2025 versions, and a 19% gap in the August 2026 revision. The codified-against-tacit explanation reached me through a search summary.
  - **The Danish bound on effects:** 1% in May 2025, and 2% in the later version.
- **Disputes.** The Canaries finding has been challenged on interest rates and timing. In February 2026 the authors replied that AI-exposed jobs are less exposed to interest rates, and that the effect became significant only after 2024.
- **My own derivations,** to check: the σ table, the failure-costing figures and the semi-log reading of Figure 1.7. The task formula is the standard cost formula for this kind of combination.
- **My inferences:**
  - the loom-minding parallel
  - the Bessen reading of the country pattern
  - self-service demand
  - the chat-to-automation sequence for cohorts
  - σ deciding whether jobs deskill
  - reorganisation as raising σ
- **The chat-versus-agentic section.**
  - **Where Claude Code sits** in the January samples is my inference, from the sample descriptions and Claude Code's account types. The report doesn't say.
  - **Anthropic's Claude Code posts** I read through a summarising tool.
  - **The agentic-coding studies** come from METR's posts and from abstracts. The AIDev paper's acceptance rates for each agent aren't in its abstract, so I haven't quoted any.
  - **Cowork's description** comes from news coverage.
  - **How the studies compare.** They measure different things (tests, merges, project speed and time per task) in different samples. So they show how much the definition of success matters, not one agreed success rate.
- **Data for later.** The report's data are on Hugging Face under CC-BY. They could set task speedups, success rates and time shares in a later, data-based model.

## Sources

**The report and related Anthropic material**

- Anthropic, "The Anthropic Economic Index report: Economic Primitives", by Ruth Appel, Maxim Massenkoff, Peter McCrory, Miles McCain, Ryan Heller, Tyler Neylon and Alex Tamkin, 15 January 2026.
  - Web summary: <https://www.anthropic.com/research/anthropic-economic-index-january-2026-report>
  - Full report (PDF, 55 pages): <https://www-cdn.anthropic.com/096d94c1a91c6480806d8f24b2344c7e2a4bc666.pdf>. Pages cited are PDF pages, which match the printed page numbers.
- Anthropic, "Estimating AI productivity gains from Claude conversations", 25 November 2025: <https://www.anthropic.com/research/estimating-productivity-gains>. Read through a summarising tool.
- Anthropic, "Anthropic Economic Index report: Learning curves", 24 March 2026: <https://www.anthropic.com/research/economic-index-march-2026-report>. Read through a summarising tool.
- Anthropic Economic Index data on Hugging Face, with data under CC-BY and code under MIT: <https://huggingface.co/datasets/Anthropic/EconomicIndex>. The README lists the releases: <https://huggingface.co/datasets/Anthropic/EconomicIndex/blob/main/README.md>

**Chat versus agentic work**

- **Anthropic posts:**
  - "Anthropic Economic Index: AI's impact on software development", 28 April 2025: <https://www.anthropic.com/research/impact-software-development>
  - "How AI is transforming work at Anthropic", 2 December 2025: <https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic>
  - "Measuring AI agent autonomy in practice", 18 February 2026: <https://www.anthropic.com/research/measuring-agent-autonomy>
  - "Anthropic Economic Index report: Cadences", 26 June 2026: <https://www.anthropic.com/research/economic-index-june-2026-report>
  - All four were read through a summarising tool.
- **Claude Code documentation,** "Advanced setup", for account types: <https://code.claude.com/docs/en/setup>
- **Cowork:** news coverage of the January 2026 launch, for example <https://www.unite.ai/anthropic-brings-claude-code-power-to-everyone-with-cowork>
- **METR:**
  - "Research Update: Algorithmic vs. Holistic Evaluation", 12 August 2025: <https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons>
  - "Many SWE-bench-passing PRs would not be merged into main", 10 March 2026: <https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/>
  - "We are Changing our Developer Productivity Experiment Design", 24 February 2026: <https://metr.org/blog/2026-02-24-uplift-update/>
- **Watanabe, Li, Kashiwa, Reid, Iida & Hassan,** "On the Use of Agentic Coding: An Empirical Study of Pull Requests on GitHub", arXiv 2509.14745: <https://arxiv.org/abs/2509.14745>
- **Li, Zhang & Hassan (2025),** "The Rise of AI Teammates in Software Engineering (SE) 3.0: How Autonomous Coding Agents Are Reshaping Software Engineering", arXiv 2507.15003: <https://arxiv.org/abs/2507.15003>
- **He, Miller, Agarwal, Kästner & Vasilescu,** "Speed at the Cost of Quality: How Cursor AI Increases Short-Term Velocity and Long-Term Complexity in Open-Source Projects", MSR 2026, arXiv 2511.04427: <https://arxiv.org/abs/2511.04427>

**Tasks, skills and labour markets**

- **Autor & Thompson (2025),** "Expertise", NBER Working Paper 33941; Journal of the European Economic Association 23(4), 1203–1271: <https://www.nber.org/papers/w33941>
- **Gans & Goldfarb (2026),** "O-Ring Automation", NBER Working Paper 34639: <https://ideas.repec.org/p/nbr/nberwo/34639.html>
- **Hampole, Papanikolaou, Schmidt & Seegmiller (2025),** "Artificial Intelligence and the Labor Market", NBER Working Paper 33509: <https://ideas.repec.org/p/nbr/nberwo/33509.html>
- **Brynjolfsson, Chandar & Chen,** "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence" (first version August 2025, revised August 2026): <https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/>
  - The authors' reply on interest rates and timing, 9 February 2026: <https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers>
- **Ide (2025; latest version June 2026),** "Automation, AI, and the Intergenerational Transmission of Knowledge", arXiv 2507.16078: <https://arxiv.org/abs/2507.16078>
- **Ide & Talamas,** "Artificial Intelligence in the Knowledge Economy", CEPR Discussion Paper 19135: <https://ideas.repec.org/p/cpr/ceprdp/19135.html>
- **Garicano (2000),** "Hierarchies and the Organization of Knowledge in Production", Journal of Political Economy 108(5). Cited from memory.
- **Gathmann & Schönberg (2010),** "How General Is Human Capital? A Task-Based Approach", Journal of Labor Economics 28(1), 1–49: <https://iab.de/en/publications/publication/?id=247000>
- **Brynjolfsson, Li & Raymond (2025),** "Generative AI at Work", Quarterly Journal of Economics. Working-paper version: <https://ideas.repec.org/p/arx/papers/2304.11771.html>
- **Dell'Acqua et al. (2023),** "Navigating the Jagged Technological Frontier", Harvard Business School working paper. From search summaries; not read.
- **Otis, Clarke, Delecourt, Holtz & Koning,** "The Uneven Impact of Generative AI on Entrepreneurial Performance" (2024; Management Science 2026): <https://www.hks.harvard.edu/centers/cid/publications/uneven-impact-generative-ai-entrepreneurial-performance>
- **Humlum & Vestergaard (2025),** "Large Language Models, Small Labor Market Effects", Becker Friedman Institute Working Paper 2025-56, May 2025. Abstract and introduction read: <https://bfi.uchicago.edu/wp-content/uploads/2025/04/BFI_WP_2025-56-3.pdf>
  - Later version, NBER Working Paper 33777, retitled "Still Waters, Rapid Currents: Early Labor Market Transformation under Generative AI": <https://ideas.repec.org/p/nbr/nberwo/33777.html>
- **METR (2025),** "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", arXiv 2507.09089: <https://arxiv.org/abs/2507.09089>
- **Bick, Blandin & Deming,** "The Rapid Adoption of Generative AI", NBER Working Paper 32966: <https://www.nber.org/system/files/working_papers/w32966/w32966.pdf>. Figures from search summaries.
- **Tomlinson, Jaffe, Wang, Counts & Suri (2025),** "Working with AI: Measuring the Applicability of Generative AI to Occupations", arXiv 2507.07935: <https://arxiv.org/abs/2507.07935>
- **Autor, Chin, Salomons & Seegmiller (2024),** "New Frontiers: The Origins and Content of New Work, 1940–2018", Quarterly Journal of Economics, August 2024. From search results.
- **Frey & Osborne (2017),** Technological Forecasting and Social Change 114. Cited from memory.
- **Arntz, Gregory & Zierahn (2016),** OECD Social, Employment and Migration Working Paper 189. Cited from memory.
- **Autor (2014),** "Polanyi's Paradox and the Shape of Employment Growth", NBER Working Paper 20485. Cited from memory.
- **Star & Strauss (1999),** "Layers of Silence, Arenas of Voice: The Ecology of Visible and Invisible Work", Computer Supported Cooperative Work 8. Cited from memory.
- **Panickssery, Bowman & Feng (2024),** "LLM Evaluators Recognize and Favor Their Own Generations", NeurIPS 2024: <https://arxiv.org/abs/2404.13076>

**Productivity and aggregation**

- **Acemoglu (2025),** "The Simple Macroeconomics of AI", Economic Policy 40(121), 13–58: <https://ideas.repec.org/a/oup/ecpoli/v40y2025i121p13-58..html>
- **Baqaee & Farhi (2019),** "The Macroeconomic Impact of Microeconomic Shocks: Beyond Hulten's Theorem", Econometrica 87(4), 1155–1203; NBER Working Paper 23145: <https://nber.org/papers/w23145>
- **Aghion, Jones & Jones (2017),** "Artificial Intelligence and Economic Growth", NBER Working Paper 23928: <https://www.nber.org/papers/w23928>
- **Kremer (1993),** "The O-Ring Theory of Economic Development", Quarterly Journal of Economics 108(3). Cited from memory.
- **David (1990),** "The Dynamo and the Computer", American Economic Review 80(2). Cited from memory.
- **Bresnahan, Brynjolfsson & Hitt (2002),** Quarterly Journal of Economics 117(1). Cited from memory.
- **Brynjolfsson, Rock & Syverson (2021),** "The Productivity J-Curve", American Economic Journal: Macroeconomics 13(1). Cited from memory.
- **Narayanan & Kapoor (2025),** "AI as Normal Technology", Knight First Amendment Institute: <https://knightcolumbia.org/content/ai-as-normal-technology>

**History**

- **Bessen (2003),** "Technology and Learning by Factory Workers: The Stretch-Out at Lowell, 1842", Journal of Economic History 63(1), 33–64: <https://ideas.repec.org/a/cup/jechis/v63y2003i01p33-64_00.html>
- **Bessen (2012),** "More Machines, Better Machines…or Better Workers?", Journal of Economic History 72(1), 44–74: <https://ideas.repec.org/a/cup/jechis/v72y2012i01p44-74_00.html>
- **Goldin & Katz (1998),** "The Origins of Technology-Skill Complementarity", Quarterly Journal of Economics 113(3), 693–732: <https://ideas.repec.org/a/oup/qjecon/v113y1998i3p693-732..html>
- **Katz & Margo (2014),** "Technical Change and the Relative Demand for Skilled Labor: The United States in Historical Perspective", in Human Capital in History: The American Record (NBER and University of Chicago Press), 15–57. From search summaries.
- **Gershuny (1978),** After Industrial Society? The Emerging Self-Service Economy, Macmillan. From catalogue records and search summaries; not read.

**Our notes**

- `bessen-inverted-u-model-brief.md`
- `io-network-extension.md`
- `gva-flows-model-lessons.md`
- `phd-thesis-spatial-agents-lessons.md`
- `gm-ai-planner-2025-tidied.md`
- `gm-ai-planner-2025-sources.md`
- the user's `dan_journal.md`
