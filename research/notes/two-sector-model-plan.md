# A first model: two sectors, Bessen demand and unequal access to new jobs

## What this note is for

The user's journal (`dan_journal.md`, entry headed 13.10.25) sketches a smaller starting model than the five-industry network in `io-network-extension.md`. On 14 October 2026 the user decided to start the build from a version of that sketch and add complexity step by step.

This note does three things:

1. turns the sketch into a plan the build side can work from
2. works through the simplest cases by hand, so we know what to expect and have targets to test the build against
3. sets out what may not work, what may need a rethink, and simple additions, drawing on the earlier notes.

Later on 14 October 2026 it was updated with the user's answers to the questions it first raised (see "Decisions, 14 October 2026").

The design choices are my suggestions unless a source is given. Derivations marked as mine should be checked.

**For the build side:** start with `two-sector-first-build-spec.md`. It pins down what this note leaves open for a first test model: the scope, the equations, a base year that fits together, default values, and tests with expected values. This note gives the design and the reasons for it.

### How it relates to earlier decisions

- **Set aside for now.** On 13 October 2026 we decided to start with the five-industry network and to group workers by age cohort and region (`bessen-inverted-u-model-brief.md`, `io-network-extension.md`). Both are now later steps.
- **Kept:**
  - a generic efficiency-improving technology
  - abstract first
  - the network as an input, so the same model can later run five industries or UK tables
  - a fresh start rather than an extension of the GVA flows model
- **Carried over later.** The components below are meant to carry over unchanged to the five-industry network, regions and cohorts.

### Decisions, 14 October 2026

The user answered the questions this note first raised:

1. **Both setups.** Test both the brand ("Cupertino") preset and the business-service preset (see "Firms and the supply chain").
2. **Everything else (X) is in.** It's the third good that closes the model.
3. **People can come and go,** through a rest of world that works alongside X. The aim is to see what kinds of skill are attracted, and what their arrival does (see "People coming and going: the rest of the world").
4. **CES is fine for the split between firms,** because technology should show up in prices.
   - **It does here.** Technology changes output per worker, so unit costs, so prices. The CES rule only turns price differences into purchase shares.
   - **One exception and one change:** see "Firms and the supply chain".
5. **No profits to start.** Prices are at cost. Pass-through and owners come later.

## What the model should show

The journal asks two questions. As model outputs:

1. **When do the gains outweigh the losses?** For which combinations of technology size, skill match, where demand sits on its curve, and position in the supply chain:
   - does employment in the sector using the technology rise? This is Bessen's question.
   - is every type of worker better off, once cheaper goods are counted? This is Schneider & Vipond's question.

   These are different questions with different answers (see "What to expect"), so the model should report them separately.
2. **Where do the gains go, and who works where?** When a technology appears, how is the gain split between:
   - consumers, through lower prices
   - workers who can use the technology, through higher pay
   - incumbents whose skills lose value, through lower pay
   - owners, through profits (a later step)

   And who ends up working where. In particular, what share of the jobs using the new technology go to incumbents rather than to other workers (Schneider & Vipond PDF p.21).

## The model at a glance

- **Two sectors.** Manufacturing (M) and design (D), with **two firms each** (M1, M2, D1, D2).
- **"Everything else" (X).** An activity with no firms, which anyone can work in and which takes whatever households don't spend on M and D. This is an addition to the journal's sketch, agreed on 14 October. "Needs a rethink" explains why the model can't close without it.
- **Six worker types,** each a representative group: three home sectors (M, D or none), each split by whether its workers can use the new technology.
- **Households are the worker types.** They spend all their income: on M and D products following Bessen's distribution of uses, and the rest on X.
- **Firms** buy inputs from the other sector, split their purchases between that sector's two firms by price, pay their workers and sell at cost.
- **Technology** appears from outside the model, in one firm or more, as augmentation or automation. It changes what each worker type can produce.
- **No geography.** Everyone can see and take every job, and buy every product.
- **Closed for goods and money.** Every payment is someone's income, and all income is spent. The number of firms is fixed.
- **People can arrive and leave** through a rest of world. If that's switched off, the population is fixed, as in the journal's sketch.
- **Equilibria first, then frictions.** The model runs first as a sequence of equilibria, as Bessen's own model does, then with frictions so that the path matters.

## The parts

### Firms and the supply chain

- **Production.** Each firm makes one product. Its output is the sum of what its workers each produce. Each unit also needs a fixed amount of the other sector's product: a_DM units of design per unit of manufacturing, and a_MD units of manufactured goods per unit of design.
- **Who sells to whom is an input.** The journal's "Cupertino design vs Chinese build", and design as a business service, put different sectors in front of consumers. Both presets are to be tested (decided 14 October 2026):
  - **Brand ("Cupertino"):** D firms sell the finished product to households and buy manufacturing from M firms as contract work. M sells mostly to D.
  - **Business service:** M firms sell to households and buy design from D firms. D sells mostly to M.
- **The two-way loop.** A saving in either sector is multiplied by 1 / (1 − a_DM · a_MD) as it goes round the loop. Keep a_DM · a_MD well below 1.
- **Splitting purchases between two firms.** Every buyer splits its purchases from a sector between that sector's two firms with CES shares, using one elasticity of substitution, σ_w.
  - **Technology isn't inside the CES.** It's in the table of what each worker type produces (see "Workers"). That table sets each firm's unit cost and so its price, and the CES rule turns price differences into purchase shares. So a firm that adopts gains share through its price, by an amount set by σ_w.
  - **The exception: while the technology's users are scarce, it shows up in pay, not price.** In the scarce regime (see "Augmenting with a partial match"), the matched earn a premium and the price doesn't move, so the split doesn't respond either. The technology reaches prices, and so the split, only once its users are the marginal producers.
  - **CES is homothetic.** The split for given prices is the same however much is bought. That's fine for splitting between two suppliers. Scale enters elsewhere: through Bessen demand, which saturates, and in Stage B through what each firm's workforce can make.
  - **The change to make: count physical units.** Apply Bessen demand to the units bought from both firms added together, because Bessen's own data are physical quantities such as yards of cloth and tons of steel (`bessen-inverted-u-model-brief.md`). Use the average price paid per unit as the sector's price.
    - **Not the CES quantity index.** Don't feed Bessen demand the CES quantity index. It isn't physical units, and it would blur measured productivity.
    - **The share rule doesn't change.** CES quantity shares are the same as the shares a logit gives when each use goes to one firm or the other.
  - **What CES still hides:** differences other than price, such as quality or reliability, and any change in how closely the two products substitute as their technologies diverge. Quality is a later step.
  - **The combination.** Bessen demand for each sector, with CES between the varieties within it, is the combination suggested in `phd-thesis-spatial-agents-lessons.md`.
  - **Not between sectors.** CES suits the split between firms but not the split between sectors. Its constant elasticity rules out the inverted U (Bessen 2019 PDF p.11 footnote 2, as noted in the PhD note).
  - **σ_w is a key parameter.** If it's low, buyers stay loyal to a firm that doesn't adopt; if it's high, that firm loses most of its market.
- **Prices and pay.**
  - Firms sell at cost and make no profit in the first version.
  - Each firm pays a rate per unit of output (a piece rate), the same for every worker, so a worker's pay is the piece rate times what they produce. This is what competitive pay comes to when workers differ in productivity.
  - For a firm with no bought-in inputs, the price is the piece rate, which is Bessen's p = w / A.

### Households: demand and closure

- **Bessen demand for M and D.** Each product has a lognormal distribution of uses, as in Bessen's fitted model. His income parameter α is set to 0, which his data support (`bessen-inverted-u-model-brief.md`).
  - **Utility** is the value of all the uses bought, plus ln x, where x is the amount of X consumed.
  - **Which uses are bought.** A use is bought if its value is more than the price times the value of a unit of X at the margin. With the log form, that cut-off is P / x, where P is the sector's price: the average price paid per unit across its two firms.
  - **Solving for x.** x is income minus spending on M and D. It's solved for each type, and there's always exactly one solution.
  - **Exact, not approximate.** Bessen's own form approximates x by the wage, which only holds for a small industry.
  - **Income matters.** Each type's demand depends on its own income, so who gains feeds back into what's bought.
- **Setting each product's curve.** The two-number method in `io-network-extension.md` (current elasticity and current saturation) carries over, with P / x in place of p / w.
- **"Binary elasticities".** In Bessen's model the elasticity isn't a parameter: it depends on where a product sits on its curve. So I'd make the journal's binary choice a choice of starting point (my calculation):
  - **Young:** demand at 10% of its ceiling, elasticity 2.
  - **Mature:** demand at 80% of its ceiling, elasticity 0.4.
  - **One curve:** both imply a lognormal spread (σ) of about 0.875, so they're the same curve at two points.
- **Everything else (X).** X is the numeraire, with price 1. Each type has its own output rate in X, which is also its pay there. X does three jobs:
  1. It takes the spending beyond M and D, as Bessen's composite good does.
  2. It's where workers go when M and D need fewer of them. In Bessen's terms it's the rest of the economy; in `gva-flows-model-lessons.md`, the foundational economy.
  3. It puts a floor under each type's pay.
     - **The floor.** While some of a type work in X, their pay elsewhere can't fall below their X pay, so a sector's price falls one-for-one with productivity. This holds exactly only when θ is large (see "Workers"). With a smaller θ the floor is soft, because some people stay in lower-paid jobs for reasons the model doesn't see.
     - **Bessen inside a closed model.** That's how Bessen's result, with the wage set outside the industry, holds inside a closed model.
     - **Lewis in miniature.** It's Lewis's (1954) "unlimited supplies of labour": demand for a type can grow without raising its pay until all of that type has left X.

### Workers

- **Six types,** each a representative group:

  | Type | Home sector | Can use the new technology? |
  |---|---|---|
  | M matched | Manufacturing | Yes |
  | M unmatched | Manufacturing | No |
  | D matched | Design | Yes |
  | D unmatched | Design | No |
  | G matched | None (general) | Yes |
  | G unmatched | None (general) | No |

  Matching is set for each technology. These six types assume one technology at a time; with more than one, a type can be matched for one and not another.
- **A home sector means a premium.** Incumbents produce more in their home sector's existing technique than other types do, so they earn a premium, r, over their pay in X. That's the hand-loom weaver's craft.
- **General workers are the pool** that new jobs can draw on: the women, children and migrants who took power-loom jobs, or today's graduates who start their careers using AI.
- **Output rates form a table:** what each type produces in each job (a firm and a technique), and in X. This is the journal's "existing skill level matched to tasks with given productivity". Technology works by changing entries in this table.
- **Outside options can differ by type.** A group with a low X rate has nowhere good to go. That's Schneider & Vipond's stratification by sex, age and place in its simplest form. Hand spinning is the example: the women it employed had little other paid work to go to (Schneider & Vipond PDF p.20, p.22).
- **Who works where: Roy sorting with a spread.** In Roy's (1951) model, people take the job where their skills pay most.
  - **The rule.** Here each type spreads across jobs by a logit rule. The share of a type in each job is proportional to the pay there raised to a power θ, times a fixed attraction for that job. This is the form used in quantitative Roy models such as Hsieh, Hurst, Jones & Klenow (2019).
  - **What θ does.** If θ is large, everyone of a type takes the best-paid job. If it's small, people stay put for reasons the model doesn't see, such as attachment, place or autonomy.
  - **Gradients, not knife-edges.** It turns the binary types into gradients and avoids the knife-edge results that strict sorting gives.
  - **Access as a parameter.** It makes access a parameter, in Schneider & Vipond's sense.
  - **Two readings.** A type's spread can be read either as how many of its people work where, or as how each person splits their time. The second covers the journal's "giving more of their time to them".
  - **Hand-loom weavers.** The attraction term is how the model can let hand-loom weavers stay in the trade while earning less than in factories (see "Historical patterns to reproduce").
- **Everyone works in the first version.** "Job loss" means moving, usually to X and often for less pay. Unemployment comes with frictions (see "From snapshot to path").

### People coming and going: the rest of the world

Decided on 14 October 2026: people can arrive from and leave for a rest of world. It works alongside X. X is where spending and work go inside the economy; the rest of the world is where people come from and go to. Goods and money stay closed. The design is my suggestion.

- **Pay elsewhere.** Each type has a level of pay it could get elsewhere, set as data. Setting it to the type's average base-year pay here means nobody moves in the base year.
- **Who moves.** A type flows in when its average pay here is above its pay elsewhere, and out when it's below.
  - **In Stage A,** each type's population is its base-year size times (pay here ÷ pay elsewhere) raised to a power ψ_s.
    - ψ_s = 0 is the journal's fixed population.
    - A large ψ_s means free movement, which holds the type's pay at its level elsewhere.
  - **In Stage B,** part of each type's gap closes each period, at a speed that differs by type. Who can move is stratified too, for example by age and family ties, as with jobs.
  - **Pay or real income.** Comparing pay is the first version. Comparing real income, counting cheaper goods here, is a switch. It would make cheap goods a draw for every type.
- **New entrants and retirement, optionally.** The same boundary can carry turnover between generations.
  - **Retirement:** a share of each type retires each year, about 2.5% for a 40-year working life.
  - **Entrants** arrive to replace them. Their mix of types is either fixed or chosen by a logit on pay, like the choice of job.
  - That extends "what kinds of skill are attracted" from migration to training.
- **Arrivals are tagged.** People who arrive behave like natives of the same type, but the tag lets reports separate them. The tag can also give them a different outside option. That's for Schneider & Vipond's point that new technologies can affect the earnings of people from different religious and ethnic backgrounds differently (PDF p.26).
- **Arrivals are consumers too.** They spend their pay here, so more people means more demand. That delays Bessen's peak, as population growth did in the 19th-century US (`bessen-inverted-u-model-brief.md`). So a boom that draws people in feeds itself.
- **Whether the technology has reached the rest of the world** is a scenario switch. If it hasn't, displaced craft workers can leave for places where their skill still pays. If it has, they can't.
- **What to look for:**
  - **Which skills are attracted.** Types with a premium: matched workers under augmentation, and minders under automation if minding is scarce.
  - **Who leaves.** Incumbents whose premium has gone, if their skill still pays elsewhere.
  - **What arrivals do.** Matched arrivals move the economy from the scarce regime towards the plentiful one (see "Augmenting with a partial match").
    - The premium shrinks, prices start to fall, demand responds and unmatched incumbents are displaced.
    - So the speed at which matched people arrive sets how long the premium lasts and when consumers start to gain.
  - **Who holds the new jobs:** incumbents, other local workers or arrivals.
- **History.**
  - **Lowell.** The mills' workforce shifted from New England farm women to local workers, including Irish workers, as the work changed (Bessen 2003, in `anthropic-economic-index-primitives.md`).
  - **Skills arriving with people.** Schneider & Vipond count the skills of technology adopters among the contributors to innovation, citing among others Hornung (2014) on Huguenot immigrants in Prussia (PDF p.15). As I recall that paper, Prussian towns that took in skilled Huguenot refugees had more productive textile works more than a century later. Skills that arrive with people can bring a technology with them.

### Technology: one plug-in for augmenting and automating

- **One component.** It takes a worker type, a job and the technology's level, and returns an output rate. Swapping the component swaps the model of how skill and technology interact. This is the plug-in point the journal asks for.
  - **Out of the black box.** It also keeps technology out of a single multiplier in a production function: the black box in Haynes's productivity primer, quoted in `gm-ai-planner-2025-tidied.md`. The two-task step opens the box further.
- **Augmenting.** Matched workers in the adopting firm produce (1 + g · c) times as much as before, where g is the size of the gain and c is the match. In the binary version c is 1 for matched types and 0 for unmatched; later it can take any value between.
  - **Levelling or skill-biased.** If c rises or falls with the size of a type's premium, the effect runs from levelling, where the less skilled gain most, to skill-biased, where the more skilled gain most. The evidence for both is in `anthropic-economic-index-primitives.md`.
  - **Opening a sector to outsiders.** Levelling can raise general workers' output in design towards designers'. The incumbents' premium then shrinks even if they're matched. This is Autor & Thompson's point about expertise (same note).
- **Automating (the power loom).** A new technique in the adopting firm, making the same product as the old one.
  - **Output per worker** is A_m · m_s: the machine's output per minder, times the type's ability to mind machines. That ability is unrelated to the old craft premium.
  - **The old technique stays available,** so it carries on until it no longer pays.
  - **Two versions:**
    - **Pure deskilling:** every type minds machines equally well.
    - **A new skill:** only matched types can mind machines.
- **How it arrives.**
  - **Timing:** a path over time, stored as data. It can be a one-off step, an S-curve or steady growth.
  - **Which firms adopt** is a scenario choice: one firm in a sector (adopter against non-adopter), both firms, or one in each sector.
  - **Natural pairing:** automation in M and AI-style augmentation in D, though either can go anywhere.
- **It's free in the first version.** Nobody pays for the technology, so nobody earns a return on it (see "Needs a rethink").
- **Strict automation needs a second task.** In a one-task job, automating and augmenting differ only in how output depends on skill. A machine that does a task with nobody minding it needs another task left for people, or labour per unit falls to zero. That's the two-task step under "Simple additions worth considering".

### Solving a period

- **The unknowns** are the four firms' piece rates. X's price is fixed at 1.
- **Given the piece rates,** the model works out:
  - prices, through the supply chain and the CES split
  - pay for each type in each job
  - how each type spreads across jobs
  - incomes and household demand
  - orders between firms
- **Then the piece rates adjust.** Each rises where a firm's orders exceed what its workers produce, and falls where they fall short. Repeat until every market clears. Spending on X should then equal what X's workers produce, by Walras' law, which is a check.
- **People.** If the rest of world is switched on, each type's population is solved in an outer loop around the piece rates.
- **Coupling.** This is where demand, prices and labour meet, so the tight coupling sits here by design. Keep each component's inputs and outputs narrow, so that any one can be swapped without changing the solver.

### From snapshot to path

- **Stage A: a sequence of equilibria.**
  - Solve each period at that period's technology level, as Bessen's own model does.
  - It's cheap enough to sweep parameters and draw regime maps.
  - Periods are years.
- **Stage B: frictions.** Who works where becomes a state that carries over from one period to the next.
  - **Prices clear first.** Each period, prices clear the goods markets for what the current workforce produces, and pay follows. If clearing a market would need a price below the cost of bought-in inputs, the firm produces less and idles workers.
  - **Then people move.** A share κ_s of each type moves towards where it would choose to be. κ_s differs by type, so Schneider & Vipond's unequal access becomes a matter of speed.
  - **People also arrive and leave,** closing part of each type's gap with the rest of the world.
  - **Unemployment.** People who move, or are idled, spend time unemployed. Unemployment then rises with the pace of reallocation, which is Lilien's (1982) "sectoral shifts" idea.
  - **A test.** With the technology held fixed, Stage B should settle at the Stage A equilibrium.
  - **Stability.** Check for oscillation, and update all types at once rather than one after another (PhD lessons E1 and F2).

### Starting values

These are placeholders to sweep, not calibrated values. The full defaults, and a recipe for a base year that fits together, are in `two-sector-first-build-spec.md`. In brief:

- **Sector sizes come first.** Household spending shares and input coefficients are set for each preset, and the population follows from them.
- **Pay:** incumbents get a premium of r = 0.5 in their home sector, and X pays everyone 1.
- **Base year:** all prices are 1. The attraction terms are set so that each type's spread across jobs matches the base-year shares.
- **Demand:** the young or mature curve for each sector, by scenario.
- **σ_w, θ and κ:** no sources; start in the middle of a plausible range (for example, σ_w = 4, θ = 5 and κ = 0.2 a year) and sweep.
- **Rest of world:** pay elsewhere equal to each type's base-year pay here. ψ_s = 0 (a fixed population) at first, then sweep.
- **Technology:** g = 1 (a doubling) for augmenting; A_m from 2 to 10 for automating.

### What to report

- **Every period:**
  - prices and output
  - employment by firm, technique and type
  - pay by type
  - unemployment (Stage B)
- **Population** by type, with arrivals and departures. Report outcomes per head as well as in total, since totals alone mislead when the population changes.
- **Real income by type:** pay plus the gain from cheaper goods, measured as an equivalent variation from the utility function.
- **A gains ledger.** For any change, split each type's change in real income into a price part (as consumers) and a pay part (as earners). Summed over types, it gives the aggregate gain.
- **Who holds the new jobs:** the shares of jobs on the new technique held by incumbents, by other local workers and by arrivals.
- **Measured against physical productivity.** For each firm, report output per worker and value added per worker.
  - **Value added tracks pay.** With prices at cost, value added per worker is average pay, so it rises only if workers keep the gain, not if prices fall.
  - **The gap** between the two measures is the gain passed to buyers.
  - **The link.** This is Webber & Huaccha's point, and the finding that more efficient plants charge less (`gva-flows-model-lessons.md`), seen from inside the model.

## What to expect: simple cases worked by hand

These are my derivations for the simplest settings: one sector plus X, a fixed population, and workers who move freely between jobs (large θ). They're targets for the first tests, and they answer some of the journal's questions directly.

### Bessen alone: how much productivity it takes

Take one worker type, with pay held by X, so the price falls one-for-one with productivity. Using Bessen's lognormal demand with the young curve (10% of the ceiling, elasticity 2):

- **Doubling productivity** raises the sector's employment by about 56%.
- **The peak** comes when productivity is about 2.8 times its starting level. Employment is then about 63% above where it started, and demand is at about 45% of its ceiling.
- **Back to the start.** Employment returns to its starting level when productivity is about 8.9 times its starting level, with demand at about 89% of its ceiling.
- **The mature curve** (80% of the ceiling, elasticity 0.4): doubling productivity cuts employment by about 41%.
- **Timing.** Cotton's labour productivity grew 2.9% a year from 1820 to 1995 (Bessen 2019 PDF p.17).
  - **At cotton's rate,** the young sector would peak after about 35 years and be back to its starting employment after about 75.
  - **A technology that doubled productivity every five years** would take about 7 years and 16 years.

Three things follow:

- **A bigger gain isn't safer for jobs.** From a given starting point, the change in employment first rises and then falls with the size of the gain. A big enough gain takes even a young sector past its peak.
- **A one-off jump shows one step along the curve, not the inverted U.** The U needs productivity that keeps rising, or a sweep across productivity levels.
- **In a closed model, the U on its own harms nobody.** With one type of worker who can move freely, people leaving the sector earn the same in X, and everyone gains from the cheaper product.
  - **Where harm comes from.** The harm Schneider & Vipond describe comes from elsewhere: skills that pay only in one place, a mismatch with the new technology, poor outside options, and frictions.
  - **So** the U and the harm are separate dimensions, and the regime maps should show them separately.

### Augmenting with a partial match

Take two types, each producing 1 unit in the sector and earning 1 in X. A share h of the N workers are matched, and augmentation raises their output to 1 + g. Q(p) is demand at price p, and the price starts at 1.

There are three regimes, depending on whether the matched workers alone could meet demand:

| Regime | When | Price | Who gains | Sector jobs |
|---|---|---|---|---|
| Matched are scarce | h · N · (1 + g) ≤ Q(1) | No change | Matched workers, as a premium of g | Fall by h · N · g, with output unchanged |
| In between | Q(1) < h · N · (1 + g) ≤ Q(1/(1 + g)) | Falls partly | Shared between matched workers and consumers; all unmatched workers leave | Up or down, depending on demand |
| Matched are plentiful | h · N · (1 + g) > Q(1/(1 + g)) | Falls by the full gain | Consumers | Bessen's rule: rise if demand is elastic, fall if not |

What this shows:

- **The price falls only once the technology reaches the marginal producer.** While unmatched workers are still needed, their costs set the price and the matched earn a rent.
  - This is the logic of Salter's (1960) vintage model, in which the oldest technique still in use sets the price.
  - So Bessen's demand channel switches on only once use of the technology is wide.
- **Wider matching amplifies whichever way demand points.** It passes more of the gain into prices, which means more jobs in a young market and fewer in a mature one.
- **It's the "race between education and technology" inside Bessen's model.** The skill premium lasts while matched workers are scarce relative to demand (Schneider & Vipond PDF p.11–12, citing Tinbergen and Goldin & Katz).
- **Arrivals or training move the regime.** If matched people can arrive or train, the premium in the scarce regime draws them in. That continues until the economy reaches the in-between or plentiful regime and the price falls (see "People coming and going").
- **Two of Schneider & Vipond's three paradigms appear as regimes of one model** (PDF p.11–12):
  - skill-biased change, while the matched are scarce
  - displacement and reinstatement, under automation
  - The routine-biased paradigm needs tasks, which come with the two-task step.
- **Nobody loses in this simplest case,** because the unmatched move to X at the same pay. Losses need a premium to lose.

### Adding a premium: the incumbents' loss

Now give the sector's incumbents a premium r: they produce 1 + r in the sector's existing technique, against 1 for general workers.

- **One price fall, two effects.** The fall in price that lets demand grow (Bessen) is also what cuts the unmatched incumbents' pay. They leave once the piece rate times (1 + r) falls below their pay in X.
  - So growth with displacement, as in British bootmaking (Schneider & Vipond PDF p.20), is the normal case in a young market where matching is incomplete.
- **Others being augmented displaces you.** Unmatched incumbents lose even though their own productivity hasn't changed.
- **Concentrated losses outweigh spread-out gains.**
  - **The loss.** An unmatched incumbent with r = 1, earning twice their X pay, who ends up in X loses half their pay.
  - **The gain.** If the product is 10% of their spending and its price halves, their gain as a consumer is roughly 5–10% of income, depending on the elasticity (my rough calculation).
  - **So** in this setting, "no type loses" needs every incumbent with a premium to be matched, or small premiums, or compensation.

### Automating: the power loom

Add a machine technique whose minders produce A_m, with matched general workers able to mind machines:

- **The price falls towards the machine cost.** Incumbent craft workers' pay falls with it. They stay until it drops below their X pay plus whatever holds them to the trade.
- **The new jobs go to general workers.** They earn their X pay, so they gain only as consumers.
- **Sector employment can rise while every incumbent leaves.** That's the bootmaking pattern again.
- **Pure deskilling still costs incumbents their premium,** even if they can mind machines as well as anyone: their old skill no longer counts.
- **If minding skill is scarce,** minders earn a rent, as in the scarce regime above.

### Design upstream: why AI in a business service is different

In the business-service preset, design is sold mainly to manufacturers, so design's own efficiency gains move final prices very little.

- **The rule.** By the standard Hicks–Marshall rule for derived demand, a 1% fall in design's price raises the amount of design bought by s · ε_M + (1 − s) · σ_DM percent, where:
  - s is design's share of manufacturing's costs
  - ε_M is the price elasticity of demand for manufactured goods
  - σ_DM measures how readily manufacturers use more design in place of other inputs: more variants, more iterations, more design in each product
- **With fixed input coefficients** (σ_DM = 0), this is the s · ε_M of `io-network-extension.md`. With s = 0.1, design jobs almost certainly fall.
- **With σ_DM a little above 1,** design jobs can rise even when consumer demand is inelastic (my calculation, for a design sector that buys no inputs).
- **So** whether AI-augmented design creates design jobs may depend less on consumers than on how much more design firms want per product when it gets cheaper. Fixed coefficients rule that out by construction.

## Historical patterns to reproduce

The model doesn't need to match these closely, but it should be able to produce each one, from a scenario that explains why:

- **The inverted U** over long productivity growth, in cotton, steel and cars (`bessen-inverted-u-model-brief.md`).
- **Bootmaking.** About 150,000 jobs were lost and 142,000 created, but the incumbents didn't move into the new ones (Schneider & Vipond PDF p.20).
- **Hand-loom weavers.**
  - **What happened.** They earned roughly twice as much as factory workers in 1806 and 25% less by 1820, yet still outnumbered factory workers until 1833 (Acemoglu & Johnson 2024, read through a summary).
  - **Why they stayed.** The summary gives two reasons: they resisted factory work for its conditions and lack of autonomy, and factories didn't grow fast enough to absorb them.
  - **What the model needs.** Pure Roy sorting, with factory jobs open to all, would have them gone by 1820. So the model needs the attraction term, limited access to the new jobs, or slow movement to match this.
- **Telephone operators.** Automatic switching pushed incumbent operators out of the labour market or into lower-paid jobs (Feigenbaum & Gross 2020, in Schneider & Vipond PDF p.20).
- **Sail to steam.** Deskilling and new demand for skill happened at the same time: able seamen were replaced by unskilled workers, engineers were newly needed, and pay on steamships averaged 40% more (Chin et al. 2006, in Schneider & Vipond PDF p.21).
- **Lowell's workforce.** Who did the work changed as the work changed, partly through arrivals (see "People coming and going").
- **Gains for customer industries.** Productivity growth cuts employment in the industry where it happens, but customer industries gain (Autor & Salomons, in `io-network-extension.md`).

## Regime maps to run

Each map sweeps two parameters and is coloured by an outcome. The hand-worked boundaries are drawn on where we have them.

1. **Size of gain against starting point on the demand curve** → change in the adopting sector's employment. Expect Bessen's hump.
2. **Size of gain against matched share** → price fall, pay premium and regime. Expect the boundaries in the augmenting table.
3. **Premium against matched share** → real income of unmatched incumbents, the type most likely to lose. Where does it stay positive?
4. **Design's cost share against σ_DM,** in both presets → design employment under AI in design. Expect the Hicks–Marshall boundary.
5. **σ_w against one firm adopting** → pay and jobs at the firm that doesn't adopt. This tests the IMF's point that workers can lose out if their employer doesn't invest (`gm-ai-planner-2025-tidied.md`).
6. **Speed of the technology against speed of movement, κ** (Stage B) → unemployment and cumulative lost pay, by type.
7. **How readily matched people arrive (ψ) against size of gain** → how long the premium lasts, the price fall, displacement of unmatched incumbents, and population. Run it both with and without the technology abroad.

For every scenario, show the gains ledger as stacked bars: each type's change in real income, split into its price and pay parts.

## Build order and tests

Add one thing at a time, each with a check, as both earlier projects did. The scope of a first test model, and tests with expected values and tolerances, are in `two-sector-first-build-spec.md`.

1. **One sector, X and one worker type.**
   - With the sector small and θ large, employment should follow Bessen's ε − 1 rule and the numbers in "Bessen alone".
   - With demand frozen, employment should fall in proportion to productivity. That's the "freeze consumption" check from the GVA project.
2. **Two worker types, augmenting and automating.** Check the three regimes and their boundaries.
3. **The second sector and the two-way supply chain.**
   - With fixed coefficients and no profits, prices should equal the piece rates built up through the supply chain: p′ = ω′ · B, where ω holds the piece rates and B is the Leontief inverse. This is the labour-embodied result in `io-network-extension.md`, with piece rates in place of w · l.
   - Every period, spending should equal income, output should equal final plus intermediate use, and each type's spread should add up to its size. Hold these to within one part in a billion, as in the GVA project.
4. **Two firms per sector.** Identical firms with no difference in technology should split each market 50:50.
5. **Six worker types.** This is the journal's target model.
6. **Rest of world for people, in Stage A.**
   - With ψ = 0, results should match the fixed-population model exactly.
   - With pay elsewhere set to base-year pay, nobody should move in the base year.
   - With free movement, each type's pay should stay at its level elsewhere.
7. **Stage B frictions,** including arrivals and departures. With the technology held fixed, the model should settle at the Stage A equilibrium, without oscillating, from a range of starting points.

The optional steps come after this, each as a module (see "Simple additions worth considering").

## Components and what can be swapped

| Component | Takes | Gives | First version | Later swaps |
|---|---|---|---|---|
| Skill and technology | worker type, job, technology level | output rate | augmenting; automating | two tasks; costing failed AI work; learning by doing |
| Technology path | period | technology level by firm | step; S-curve; steady growth | firms choose whether to adopt |
| Household demand | prices, incomes | quantities by type, x, utility | Bessen lognormal plus ln x, on physical units | fixed quantities (no response); CES (shows no U); uses either product can meet |
| Closure | income not spent on M and D | where it goes | X absorbs it | leisure; saving |
| Purchase split | firms' prices in a sector | shares | CES with σ_w | gradual switching |
| Pricing | unit costs | prices | at cost | markup; partial pass-through |
| Labour allocation | pay by type and job | each type's spread | logit equilibrium (θ) | gradual movement (κ); unemployment while moving |
| Population | each type's pay here and elsewhere | arrivals and departures by type | fixed (switched off); then the Stage A response (ψ) | flows (Stage B); retirement, and entrants' choice of type |
| Scenarios | stored data | parameters and paths | stored as data | |
| Reports | model state | the outputs above | gains ledger; who holds the new jobs; measured against physical productivity | |

Storing scenarios as data follows both earlier projects (`gva-flows-model-lessons.md`, `phd-thesis-spatial-agents-lessons.md`).

## What may not work, may need a rethink, or could use a simple addition

### Needs a rethink

1. **Two goods can't close the model on their own.**
   - **The problem.** Suppose M and D are both Bessen goods and there's nothing else to buy. Then as both near saturation, extra income has nowhere to go.
   - **The outcome would depend on an assumption:**
     - more leisure
     - unspent income, which cuts demand and so creates unemployment
     - prices falling without end

     The answer would come from that choice, not from Bessen or Schneider & Vipond.
   - **Other fixes fall short.** Making one sector the residual stops it from showing an inverted U. And when both sectors shrink, displaced workers need somewhere to go.
   - **Hence X.** It costs little: no firms, and one output rate per type.
   - **The other closures make good later experiments.** "Where does the gain go once wants are met?" is a question in its own right. It sets Keynes's grandchildren against Bessen's "depth of human wants" (Bessen 2019 PDF p.38, in `io-network-extension.md`).
   - **Decided:** X is in (14 October 2026).
2. **In a closed, fully employed model, "job losses" are moves.**
   - With flexible pay and X always open, nobody is unemployed in the first version.
   - So the headline outcomes need to be pay and real income by type, not just jobs. That matches the history: telephone operators were pushed out of the labour market or into lower-paid jobs (Schneider & Vipond PDF p.20).
   - Unemployment needs frictions, a floor on pay, or a shortfall in demand.
3. **A fixed population removed the main historical channel.**
   - **Who took the new jobs.** In bootmaking, incumbents didn't move into the new jobs; other people did.
   - **What a fixed population allows.** Those other people can only be existing workers elsewhere: the general types.
   - **Decided:** people can come and go through a rest of world (14 October 2026; see "People coming and going").
     - It covers migration and, optionally, turnover between generations, in which incumbents retire and entrants train for the new technique.
     - Adjustment by turnover takes decades, which is Schneider & Vipond's point about effects across generations (PDF p.28).
4. **The power loom wasn't simply deskilling, and the sources disagree.**
   - **Deskilling:** Goldin & Katz (1998) argue that the innovations of the First Industrial Revolution may have been deskilling (Schneider & Vipond PDF p.21).
   - **Not deskilling:** Bessen (2011) uses data on individual weavers. He finds that mechanisation removed some tasks but raised the returns to skill on the rest, and that weavers learned a lot on the job (Schneider & Vipond PDF p.21; the paper's abstract).
   - **Learning and hiring:** at Lowell, moving weavers from two looms to three depended on learning, and changed who was hired (Bessen 2003, in `anthropic-economic-index-primitives.md`).
   - **So** the automating technology should have its own skill, minding machines, learned on the job, rather than one anybody has. That's also the agentic-AI question of how many agents one person can supervise.
5. **The assumptions partly decide where the gains go.**
   - **Only two places.** Because the technology is free and prices are at cost, gains can only go to consumers or into workers' pay.
   - **What's needed.** Asking the journal's question properly needs a cost for the technology, or a markup, and someone who receives it. In a closed model that has to be a household: the worker types, by shares, or a separate owner type.
   - **How.** Use a pass-through parameter rather than markups set by firms, which the PhD found unstable (E2).
   - **For AI,** the technology is mostly rented from a few providers, so who receives that rent is a live question.
   - **Decided:** no profits to start (14 October 2026). This comes after the core works.
6. **A technology that simply appears, once, shows one step along the curve, not the U** (see "Bessen alone").

### May not work as hoped

1. **Bessen's demand channel may not switch on.**
   - While unmatched workers or non-adopting firms are still the marginal producers, prices don't fall, and the gain is a rent. With uneven adoption, the growing phase may be delayed or muted.
   - **AI adds a twist.** Much use is "freelance" inside workplaces (`gm-ai-planner-2025-tidied.md`). If salaried workers take the time saved as slack, or firms keep it as margin, prices don't move and neither does demand.
2. **Design's own gains may hardly move final prices.** Upstream, the effective elasticity is small unless firms buy more design per product, and fixed coefficients rule that out. I'd add σ_DM, a single parameter, early.
3. **Firms are only labels until Stage B.**
   - With free movement and prices at cost, firms make no decisions and workers aren't attached to them. So whether a firm adopts matters only through the CES split.
   - Stories about firms, such as the non-adopter's workers losing out, need workers to be attached to firms, which comes with Stage B.
4. **Binary types with strict sorting give knife-edge results.**
   - Results jump between corners as one type becomes indifferent, and sweeps show steps.
   - The logit spread fixes this; keep strict sorting only as a test.
   - θ will matter a lot and has no obvious source, so sweep it.
5. **Bessen's goods have no substitutes.**
   - A cheaper design product can't take uses from manufactured goods; it can only draw spending away from X, through income.
   - If shifts in demand between sectors matter, add uses that either product can meet. Bessen discusses aluminium taking uses from steel (2019 PDF p.28–29).
6. **The solver may struggle.** The two-way loop, income effects and the CES split make a fixed point. It should be well behaved with logit sorting, but:
   - damp the updates
   - check from several starting points (in the PhD, starting values decided whether prices converged, E1)
   - guard against piece rates turning negative when input costs exceed a price
7. **Intermediate demand has no saturation of its own.** It inherits saturation from final demand. That's correct, but it means a sector that sells only to firms shows a U only through its customers.
8. **Free movement and X don't mix well.**
   - **The problem.** X takes anyone at a fixed rate. So if a type's pay elsewhere is below its X pay and movement is free, arrivals never stop.
   - **When it bites.** Setting pay elsewhere to base-year pay avoids this at the start. But a scenario that raises pay here and not elsewhere, such as growth in X's productivity, can set it off.
   - **The fix.** Keep ψ finite, or add a cost that rises with population, such as housing. That's the dispersion force in `phd-thesis-spatial-agents-lessons.md`.

### Simple additions worth considering

Each is a single parameter or switch, listed roughly in the order I'd add them:

1. **Turnover between generations,** through the rest of world (see "People coming and going").
2. **Design intensity,** σ_DM (see above).
3. **Learning by doing.**
   - Output on the new technique rises with time spent on it, faster for some types (Bessen 2003; Anthropic's March 2026 finding that experienced users succeed more often, in `anthropic-economic-index-primitives.md`).
   - It gives early adopters a rising premium, and strands them if a second technology arrives (Schneider & Vipond PDF p.27).
4. **A floor on pay,** such as a benefit or minimum wage. Where the market would push a piece rate below it, firms cut output and workers are unemployed until they move. With Stage B, this gives unemployment as well as pay cuts.
5. **Two tasks per job** (`anthropic-economic-index-primitives.md`, design choice A).
   - One task suits AI and the other is a bottleneck, combined with an elasticity σ.
   - This gives strict automation, Amdahl limits on speed-ups, and an answer to whether jobs deskill.
6. **Slow growth in X's productivity.** It raises pay across the economy. That's Baumol's cost disease, and the income channel that Bessen's data run on. With people free to arrive, see "Free movement and X don't mix well" first.
7. **Pass-through and owners** (see "Needs a rethink").
8. **Switches for what may be particular to AI,** keeping the technology generic:
   - **Speed.** Effective task speed-ups are about 2 to 5, depending on how failed work is costed (`anthropic-economic-index-primitives.md`). If gains on that scale reached a whole sector's output within a few years, a young sector would reach or pass its peak (2.8 times, in "Bessen alone") in that time. Cotton took decades.
   - **Self-service.** The technology could also raise households' own output in X, as with do-it-yourself design. That can cut market demand for design even as its use rises (Gershuny 1978, in the same note).
   - **Who it reaches.** AI covers the more educated tasks, so the incumbents with premiums at risk are graduates rather than craft workers. The matched may be the young (the "Canaries" paper, same note).
   - **Rented technology.** The rent goes to a provider (see "Needs a rethink").
   - **Working from abroad.** AI makes it easier to do design work remotely, so skills could be "attracted" without people moving. That's trade in services, and the pay would be spent elsewhere, so it would open the money side of the model. A later variant.

## Defaults to check

These are defaults I've chosen for the rest of world. Each is a switch:

1. **People compare pay, not real income,** when deciding whether to move.
2. **The technology doesn't reach the rest of the world** in the first runs. Reaching it at the same time, or later, is a scenario.
3. **Migration is the default.** Turnover between generations is optional.

## How sure to be

- **Bessen's formulas** are as in `bessen-inverted-u-model-brief.md`, checked there against the PDFs.
- **The hand-worked cases** are my derivations, for the simplest settings.
  - The full model should match them in the limits set out in the tests, and only roughly otherwise.
  - The Bessen numbers assume his setting: a wage fixed outside the industry, and a small sector.
- **The Hicks–Marshall rule** is standard textbook theory. Applying it to design is my reading.
- **CES quantity shares equal logit shares** is a standard result.
- **The hand-loom weaver figures** come from a summary of Acemoglu & Johnson (2024) on MIT's Stone Center site, which I read through a summarising tool. I haven't read the paper itself.
- **Whether mechanisation deskilled** is disputed (see "Needs a rethink").
- **Hornung (2014)** is described from memory, via Schneider & Vipond's citation. I haven't read it.
- **Roy, Lewis, Salter, Lilien, Hicks and Hsieh et al.** are cited from memory as standard references. The model uses only their best-known ideas.
- **The design choices** are mine, including the rest-of-world mechanism.

## Sources

**Our notes**

- `dan_journal.md` (the entry headed 13.10.25)
- `bessen-inverted-u-model-brief.md`
- `io-network-extension.md`
- `gva-flows-model-lessons.md`
- `phd-thesis-spatial-agents-lessons.md`
- `anthropic-economic-index-primitives.md`
- `gm-ai-planner-2025-tidied.md`

**Documents in `sources/`**

- `bessen-2019-automation-and-jobs.pdf`: PDF p.17 (productivity growth rates), read in the text copy. PDF pages 11, 28–29 and 38 are cited through the notes above.
- `schneider-vipond-past-and-future-of-work.pdf`, read in the text copy:
  - PDF p.11–12: the three paradigms, and the race between education and technology
  - PDF p.15: the skills of technology adopters, citing Hornung (2014)
  - PDF p.20: bootmaking, telephone operators and hand spinning
  - PDF p.21: unequal access to new jobs; Goldin & Katz (1998); Bessen (2011); sail to steam
  - PDF p.22: hand spinning and the male-breadwinner family
  - PDF p.26: effects on women, on people from different religious and ethnic backgrounds, and on places
  - PDF p.27: skills stranded by later technologies; retraining
  - PDF p.28: effects across generations

**Web**

- MIT Stone Center on Inequality and Shaping the Future of Work, "Research Insight: What can the early industrial revolution teach us about technology and work in the age of AI?": <https://shapingwork.mit.edu/research/research-insight-what-can-the-early-industrial-revolution-teach-us-about-technology-and-work-in-the-age-of-ai/>
  - It summarises Acemoglu & Johnson (2024), "Learning From Ricardo and Thompson: Machinery and Labor in the Early Industrial Revolution and in the Age of Artificial Intelligence", Annual Review of Economics.
  - I read it through a summarising tool. The PDF version, <https://shapingwork.mit.edu/wp-content/uploads/2026/05/Stone-Center-Research-Insight_Industrial-Revolution-and-AI.pdf>, couldn't be read.
- Bessen (2011), "Was Mechanization De-Skilling? The Origins of Task-Biased Technical Change", Research on Innovation Working Paper 1101: <https://ideas.repec.org/p/roi/wpaper/1101.html>. Abstract only.

**Cited from memory**

- Roy (1951), "Some Thoughts on the Distribution of Earnings", Oxford Economic Papers 3(2).
- Lewis (1954), "Economic Development with Unlimited Supplies of Labour", The Manchester School 22(2).
- Salter (1960), Productivity and Technical Change, Cambridge University Press.
- Hicks (1932), The Theory of Wages, Macmillan. For the derived-demand formula, see also Hamermesh (1993), Labor Demand, Princeton University Press.
- Lilien (1982), "Sectoral Shifts and Cyclical Unemployment", Journal of Political Economy 90(4).
- Hsieh, Hurst, Jones & Klenow (2019), "The Allocation of Talent and U.S. Economic Growth", Econometrica 87(5).
- Hornung (2014), "Immigration and the Diffusion of Technology: The Huguenot Diaspora in Prussia", American Economic Review 104(1). The reference is from Schneider & Vipond's bibliography; the finding is from memory.

**Cited through Schneider & Vipond:** Goldin & Katz (1998); Vipond (2023); Feigenbaum & Gross (2020); Schneider (2023); Humphries & Schneider (2021); Chin et al. (2006).
