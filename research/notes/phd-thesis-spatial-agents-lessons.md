# What the PhD thesis offers these model sketches: agents, core and periphery, and agglomeration

The user's 2013 Geography PhD (University of Leeds) built an agent-based model of spatial economics from first principles. It compared that model with Krugman's core-periphery model. The thesis has since been rebuilt (by October 2026) as 42 interactive models in seven groups, A to G: <https://danolner.github.io/phd_live/>. There is a clean Java reference implementation with 55 tests and a JavaScript site with 142 tests.

This note pulls out what's useful for this project under three headings the user asked for, plus other points that stood out:

1. the difficulties of moving to disaggregated economic agents
2. Krugman's core-periphery idea
3. geographical and agglomeration forces, to be added one at a time

The note is based on the repository's `THESIS_DIGEST.md`, `CODE_ANATOMY.md` and `BUILD_LOG.md`. I read these through a tool that summarises rather than copying them, so quotes are short and some detail may be lost. I haven't read the thesis PDF itself. Model IDs (A1, E3 and so on) refer to the rebuilt catalogue.

## What the thesis is about

- **The question.** How do changing "space costs" reshape economic geography, and how do the resulting patterns feed back into those costs? Space costs are the cost of moving goods and people, plus the costs and benefits of being close to others.
- **Why agent-based models.** They look well suited to spatial economics, because they can handle costs that differ by location and need no single market-clearing auction. Yet they had barely been applied to it, and the thesis asks why.
- **The method.** Build the framework from scratch and treat "the development process itself as the evidence": every obstacle met is a finding. At the same time, take Krugman's model apart and compare the two.
- **The "transmission belt".** This is the thesis's name for the link from production efficiency through prices and demand to consumers' welfare. It's the same chain this project's model is built around: efficiency → price → demand → output → jobs. In the thesis, the belt runs with increasing returns and love of variety. In our model, it runs with Bessen's saturating demand and an input-output network.
- **What the thesis left out.** It lists as limitations that it has no labour-force dynamics, migration or population growth, and no technological change, innovation or learning. Those are exactly what this project adds.

## 1. Difficulties in moving to disaggregated agents

### The "dependency" problem

The thesis's main methodological point is that choosing one functional form constrains the others. The consequences cascade, and agent-based modelling goes wrong when it assumes it can escape this.

- **A utility function can switch off whole kinds of behaviour.** With Cobb–Douglas preferences, the price of one good doesn't affect demand for the other, and each sector has an elasticity of exactly 1. So a price-setting firm has no lever on demand, and no reason to move location (A2).
- **The same trap applies to Bessen.** This is my inference. With an elasticity fixed at 1, productivity growth would never change an industry's employment, because the employment response is ε − 1. With a constant-elasticity CES aggregator, the elasticity never changes, so there can be no inverted U. Bessen makes the same complaint about the automation literature's constant-elasticity aggregators (Bessen 2019, PDF p.11 footnote 2). His distribution of uses is a deliberate choice that lets the elasticity fall as markets saturate.
- **Combining Krugman with Bessen has to be designed.** Krugman's mechanism needs CES love of variety, and Bessen's needs a falling elasticity. One way to combine them, my suggestion: Bessen-style demand for each industry's overall output, and CES choice between varieties within the industry. Whatever is chosen, write down what each functional choice rules out.
- **Other dependencies the thesis found.**
  - Instant market clearing removes firms' dynamic decisions.
  - Letting stocks run out changes everything downstream: demand is rationed, firms must manage inventory, and prices respond to expected rather than realised demand.

### Describe the function, not the person

- **Two kinds of mapping.** The default in agent-based modelling is descriptive mapping: one agent per person, one firm object per real firm. The thesis argues for functional mapping. A few agents, or a single shared utility function, can stand for large populations, and a production function only has to do its job of linking inputs to output.
- **This project already does that.** Three of its choices are functional mappings:
  - Bessen's distribution of uses (one equation standing for many consumers)
  - age-cohort-by-region groups rather than individual workers
  - prices measured in hours of work
- The thesis would count all of these as strengths, not compromises.

### Traps the thesis fell into or found

- **Agents can't read their own signals in a crowd** (D2). A lone firm easily finds the best location. With a competitor whose moves also change its demand, "my revenue went up" stops meaning "my move was good". This matters if we ever model firms adopting a technology one by one, since each adopter's results are muddied by rivals adopting too. Caution: the rebuilds couldn't reproduce D2's direction. The thesis said stronger love of variety made the problem harder, but both rebuilds found the opposite. The build log records this as unresolved.
- **No stable competition with firm-set markups** (E2). When firms set their own markups, the result was either implicit collusion that squeezed people until they couldn't buy, or runaway prices. People had "no exogenous alternative and therefore no sanction". So if we ever give individual firms their own markups, the model needs an explicit force for competition, such as entry or customers switching. Our aggregate pass-through rule avoids the problem deliberately.
- **Fixed costs can deadlock rational agents** (F3). Krugman's production function, labour = α + β · output, gives negative output below the fixed cost α. Rational agents then refuse to work, while agents that search blindly stumble into production. The thesis's smooth increasing returns, output = m · labour + v · labour², avoid this.
- **Price adjustment oscillates without damping** (E1). Targeting a stock level alone gives a perfectly stable oscillation. Adding the first and second differences of stock damps it. How often prices update matters too: in the original code, per purchase rather than per day, so 300 updates per firm per day. So do starting values: an initial price of 3 diverged while the thesis's range of 0.1–1.5 converged. Our lagged pass-through and demand adjustment should be tested for oscillation in the same way.
- **The order in which agents act biases results** (F2). With random ordering each day, the gap between an agent's actions varies, so anything comparing this period with last gets the wrong denominator. The fix was to let all people act, then all firms.
- **Emergence isn't explanation** (F1, E4). Random exchange of money "grows" severe inequality, but that explains nothing about real inequality, and the thesis dropped money for that reason. E4 instead locates its regime change in the algebra of the consumer's demand function. That's the role of the first-order derivations in this project's notes.

### Lessons from rebuilding it

- **A figure's label is not the variable behind it.** Three results that seemed not to reproduce (E5, E6, E8) were one measurement error: the published "efficiency ratio" plotted total output, not output per unit of input.
- **Measure over windows, not single points.** Processes that never settle need averages or ranges over a window, not snapshots. One run that "settles at 0.299" in fact kept oscillating.
- **Use the median for thresholds.** For thresholds estimated from noisy finite populations, the median is better than the maximum, which picks the luckiest draw.
- **Test stochastic results by claim.** Test them within the ranges the claims are made in, for example "symmetry breaks with ρ between 0.70 and 0.80", rather than requiring bit-for-bit agreement.
- **Precompute long parameter sweeps.** Ship them as data rather than running them live.
- **Index space for neighbour lookups.** A spatial index raised speed nearly tenfold.
- **Avoid global state.** It was the biggest obstacle to rebuilding the original code. Scenarios defined in configuration rather than by editing code were "a real improvement". The earlier GVA flows project reached the same conclusion, with scenarios stored as data.

### What this means for us

Stay with groups, meaning industries and age-cohort-by-region workforces, and aggregate rules at first. Bring in individual agents only where a specific question needs them, one at a time. Write down for each functional choice what it rules out.

## 2. Krugman's core-periphery idea

### The essential point

Two identical regions can end up as a manufacturing core and an agricultural periphery. Nothing about either region needs to differ at the start. A small chance difference is enough, amplified by self-reinforcing forces over time. Which region becomes the core is down to history.

### The set-up

Krugman's 1991 model, in the standard form of Fujita, Krugman & Venables (1999):

- **Two regions.** Farm workers can't move and are split evenly. Manufacturing workers can move.
- **Consumers** spend a fixed share μ of income on manufactures and the rest on food (Cobb–Douglas).
- **Manufactures come in many varieties.** Each firm makes one variety with increasing returns (a fixed cost).
- **Consumers love variety.** With CES utility over varieties, U = (Σ_i c_i^ρ)^(1/ρ), the elasticity of substitution is σ = 1/(1 − ρ). Variety matters because the price index G = n^(1/(1−σ)) · p falls as the number of varieties n rises (σ > 1). So a region with more varieties is cheaper to live in.
- **Trade costs are "iceberg" costs.** To deliver one unit, T > 1 units must be shipped. Food is traded freely.

### The forces

- **The home-market effect (backward linkage).** Firms prefer the bigger market, because it saves on shipping to most customers.
- **The price-index effect (forward linkage).** Workers prefer the region with more varieties, which has a lower price index and so higher real wages. Their arrival makes the market bigger still.
- **Dispersion forces.** Farm workers' immobile demand pulls firms back towards the periphery, and firms crowded into one market compete more fiercely.

### The results

- **High trade costs:** only the even spread is stable.
- **Below a "break point":** the even spread becomes unstable. Any small difference grows through cumulative causation until all manufacturing sits in one region.
- **Between the break point and a higher "sustain point":** both the even spread and the core-periphery pattern are stable. This is hysteresis: where the economy ends up depends on its history. Plotting the stable patterns against trade costs gives the "tomahawk" diagram (thesis model G1).
- **The "black hole".** If the share of spending on manufactures is too high relative to how easily varieties substitute for each other, agglomeration wins at any trade cost. The "no black hole" condition rules this out. As I recall it from Fujita, Krugman & Venables, it is ρ > μ.

### Equations for the short-run equilibrium

These are the standard textbook form (Fujita, Krugman & Venables 1999, ch. 5) as I recall it. Check them against the book, or against the thesis rebuild's Core Model (G1), before building. For each region r, given the share λ_r of manufacturing workers in region r:

- **Income:** Y_r = μ · λ_r · w_r + (1 − μ) / 2, with the farm wage as numeraire.
- **Price index of manufactures:** G_r = [Σ_s λ_s · (w_s · T_sr)^(1−σ)]^(1/(1−σ)).
- **Manufacturing wage:** w_r = [Σ_s Y_s · T_rs^(1−σ) · G_s^(σ−1)]^(1/σ).
- **Real wage:** ω_r = w_r · G_r^(−μ).
- **Solving:** guess the wages, compute incomes and price indices, recompute wages, and repeat until they settle. This is also the thesis's method.
- **Migration:** workers move towards the region with the higher real wage, for example at a rate proportional to (ω_1 − ω_2) · λ · (1 − λ).
- **Break and sustain points:** there are closed forms in the book, but they can also be found numerically by testing the stability of the even spread and of full agglomeration as T varies. That's what the thesis's G1 does.

### How the thesis complicated the story

- **Two forces in one parameter.** Krugman's model folds economies of scale and love of variety into one parameter. Its firms are implicit, markets clear instantly, and regions have no inside.
- **The agent version shows more:**
  - **Without space.** Production can tip to one efficient producer with no space at all. Nudging ρ from 0.73 to 0.80 is enough, and the rebuild found the break at ρ = 0.764 (E3). In the thesis's words: "You do not need space for a catastrophic production shift."
  - **From either side.** Symmetry can break from either side of a boundary in (love of variety, distance cost) space (E5).
  - **How many centres.** Distance costs select "the number and spacing of production centres" (E7).
  - **Inside regions.** Regions develop internal structure that Krugman's model can't show (E6).
  - **Settlement.** Settlement forms around a producer that becomes efficient without being assigned in advance (E8).
- **The black hole without a counterforce.** If nothing pushes people and firms apart, everything collapses to a single point: "space deletes itself" (B3).

### The dispersion force decides the answer

Bohr, Mestieri & Robert-Nicoud (2024, PDF p.3 footnote 3) summarise how the result about trade costs depends on what holds activity apart:

- **Krugman (1991):** the immobile demand comes from farming, whose output is traded freely. Regional disparities arise only when trade costs are low.
- **Helpman (1998):** the immobile demand comes from housing, which can't be traded. Disparities arise only when trade costs are high, and falling trade costs bring convergence.
- **Krugman & Venables (1995):** farming has decreasing returns. Disparities arise at intermediate trade costs.
- **Venables (1996):** input-output links between upstream and downstream firms are themselves a force for agglomeration, strongest at intermediate trade costs. Lowering trade costs from high to intermediate brings divergence; lowering them further can bring convergence.
- **Puga (1999):** regional inequality follows a bell-shaped curve as economies develop.

This is the thesis's dependency point again, at the level of a whole literature: the dispersion force you pick decides when a core forms.

### A bridge to Bessen

- **Bohr, Mestieri & Robert-Nicoud (2024).** They combine Krugman's set-up with demand-driven structural change. As labour productivity rises, the share of spending on the increasing-returns sector rises. That strengthens agglomeration until regional disparities emerge, without any fall in trade costs. They also show that structural change and spatial concentration reinforce each other.
- **My inference for this project.** Under Bessen, an industry's share of spending rises while its demand is elastic and falls once it saturates. In Krugman's terms, the industry's pull towards agglomeration would then rise and later fall. So regional concentration could follow the industry life cycle, with a core forming and then weakening.

### For our model

- **First model: fixed locations.** In the first model, tradable industries have fixed locations (see `io-network-extension.md`).
- **Later: endogenous location.** A later, explicit step could let them choose their location using Krugman's forces, starting from three identical regions, to watch a core emerge.
- **A ready check.** The thesis rebuild's Core Model, with its tomahawk diagram, can be used to check that step.

## 3. Geographical and agglomeration forces

These are the forces that could come into play. The aim is to add them one at a time, so that each dynamic is clear.

| Force | What it does | Where it comes from |
|---|---|---|
| Distance costs for goods | Raise prices with distance, so local suppliers are favoured. Lower costs first concentrate activity in Krugman's model. | Thesis (price plus delivery cost × distance); Krugman's iceberg costs |
| Commuting time | A commute uses time from a fixed day. The thesis's commuting form has a hard limit: the cost becomes infinite as the commute approaches the whole day (commutes over half a day were barred). Commuting is not like shipping goods, which only gets expensive. | Thesis (§4.3.3, §4.6.1) |
| Love of variety | Pulls people and firms towards places with many varieties. With strong love of variety, people settled near the expensive firm and bought the cheap good from afar. "Changing tastes alone, with no cost change at all, redraws the map." | Thesis (C7); Krugman |
| Increasing returns | Concentrate production, and can tip regimes suddenly | Thesis (E3, E7); Krugman |
| Home-market effect and input-output links | Firms move towards large markets and towards their suppliers and customers | Krugman; Venables (1996) |
| Density, congestion and land costs | A force for dispersion. At high density costs, the thesis's spatial equilibrium "stops being utility equilibrium" and becomes path-dependent. | Thesis (density cost, C8); Helpman (housing) |
| Immobile local demand | A force for dispersion: farm workers, housing, and local services tied to population | Krugman; Helpman; foundational economy (see `gva-flows-model-lessons.md`) |
| Real incomes against distance costs | In the thesis's density-cost world, a higher real wage concentrates people, whether it comes from higher pay or cheaper goods. Cheaper transport and commuting disperse them. "Cheaper transport disperses; a higher real wage concentrates." | Thesis (C3) |
| Sorting | Richer people buy proximity when costs aren't spatial, and buy distance when they are | Thesis (von Thünen rings without landlords, C6) |
| Productivity gains from density (agglomeration economies) | Productivity rises with local density. The elasticity is typically 0.04–0.10 as measured, and about 0.02–0.03 after correcting for the sorting of more productive workers into dense places. | Combes & Gobillon; Combes, Duranton, Gobillon, Puga & Roux (2012) |
| First and second nature | First nature is what a place has itself, such as resources or position. Second nature is what other people's choices create. Krugman shows second nature can create differences from nothing. | Thesis glossary; Krugman |
| Path dependence and multiple equilibria | History decides which equilibrium is reached | Krugman's tomahawk; thesis (C8, E5, E8) |
| A black hole | Without a dispersion force, everything collapses to one place | Thesis (B3); Krugman's "no black hole" condition |

### A possible order for adding them

This is my suggestion, with one force per step, each with a pattern to look for:

0. **Fixed locations (the current plan).** Regions differ only in their mix of industries. Bessen's life cycle alone should make a region rise and decline with its tradable industry, with no change to any regional parameter. This is the thesis's C7 point in another form: a shift in demand redraws the map. Deindustrialised textile towns are the historical example.
1. **Workers move.** Commuting and migration respond to differences in real income, at rates that differ by cohort (Schneider & Vipond's frictions).
2. **Trade costs between regions.** Prices differ by region, and local market size starts to matter.
3. **An explicit dispersion force.** Housing or congestion costs, and immobile local demand.
4. **Increasing returns and love of variety in tradable industries, with location left to the model.** A core can now emerge from identical regions. Check this step against Krugman's tomahawk (thesis G1).
5. **Input-output links as a force for agglomeration.** Upstream and downstream industries are pulled together (Venables).
6. **Productivity gains from density.** Productivity rises with regional scale or density. This ties technology to place, and links to the Kaldor–Verdoorn feedback in `gva-flows-model-lessons.md`.

## Other points that stand out

- **Frictions are what overturn the thesis's welfare result.** In E7, moves to more efficient production "never make any individual Person worse off". But the thesis's agents move freely and at no cost, and have no skills or ages. Schneider & Vipond's frictions are exactly what can overturn that result. This framing suits our cohort model: show the thesis's result first, then add frictions and show who loses.
- **Prices in time.** The thesis dropped money and had people buy goods directly with time. That matches Bessen's price measured in hours of wages and the "labour embodied" measure in `io-network-extension.md`. Three sources point to the same choice of units.
- **Noisy adoption.** Firms in the thesis are weak optimisers whose behaviour is hidden by averaging: "Firms are weak optimisers, and averaging hides that" (D1). An S-curve of technology diffusion is an average over a noisy process like this. If the model later represents adoption firm by firm, expect noise and possible lock-in.
- **Markups and increasing returns.** With increasing returns, one firm's markup changes absolute prices for everyone, not just relative prices (E2). So market power and economies of scale interact. That matters for whether efficiency gains reach consumers (see the pass-through evidence in `gva-flows-model-lessons.md`).
- **The streetlight effect.** The thesis argues agent-based modelling suffers from it worse than traditional economics, yet is less aware of it. The earlier GVA flows project used the same image for official statistics. That's a shared theme: what each method can easily see shapes what it reports.

## Questions for the user

1. **Fixed locations first?** Keep industry locations fixed in the first model (step 0), with Krugman-style endogenous location as an explicit later step? I'd recommend this, so the Bessen and cohort dynamics are clear before agglomeration forces arrive.
2. **Discrete regions?** Keep discrete regions (three for now) rather than continuous space? Continuous space is where the thesis found regions developing internal structure. But discrete regions are easier to read, and match UK regional data (ITL regions) later. I'd recommend staying discrete.

## How sure to be

- **Second-hand detail.** The thesis material comes from summaries of the digest, code anatomy and build log, not from the thesis itself. The rebuild corrected some published claims (E8's measure, E1's "settling", F3's threshold). One result, D2's direction, still doesn't reproduce.
- **Krugman's equations.** These are written from memory of the standard textbook form and should be checked against Fujita, Krugman & Venables (1999), or the thesis rebuild's Core Model, before use. I've given no closed forms for the break and sustain points; computing them numerically avoids the need.
- **Trade-cost results.** How these depend on the dispersion force is taken from Bohr, Mestieri & Robert-Nicoud (2024), and checked against search results for Venables (1996), Puga (1999) and Helpman (1998). I haven't read those three papers themselves.
- **Agglomeration elasticities.** These figures come from search summaries of Combes & Gobillon's work. They're broadly consistent with each other, but I haven't checked them against the original papers.
- **My inferences.** These are marked as mine: the Bessen and Krugman combination, the industry life cycle driving regional concentration, and the order of steps.

## Sources

- **The user's repository:** <https://github.com/DanOlner/phd_live>, read on 13 October 2026: `THESIS_DIGEST.md`, `CODE_ANATOMY.md` and `BUILD_LOG.md`, with the published site at <https://danolner.github.io/phd_live/>. The original 2013 thesis PDF is in the repository's `Thesis_on_github` folder (not read).
- **Bohr, Mestieri & Robert-Nicoud (2024):** "Economic Geography and Structural Change", arXiv 2412.03755: <https://arxiv.org/abs/2412.03755>. PDF pages 1–6 read.
- **Venables (1996):** "Equilibrium Locations of Vertically Linked Industries", International Economic Review 37(2), 341–359: <https://ideas.repec.org/a/ier/iecrev/v37y1996i2p341-59.html>
- **Puga (1999):** "The Rise and Fall of Regional Inequalities", European Economic Review 43(2), 303–334: <https://ideas.repec.org/a/eee/eecrev/v43y1999i2p303-334.html>
- **Helpman (1998):** "The Size of Regions", in Pines, Sadka & Zilcha (eds), Topics in Public Economics. Cited via Bohr, Mestieri & Robert-Nicoud (2024) and search summaries; not read.
- **Krugman (1991):** "Increasing Returns and Economic Geography", Journal of Political Economy 99(3). **Krugman & Venables (1995):** "Globalization and the Inequality of Nations", Quarterly Journal of Economics. **Fujita, Krugman & Venables (1999):** The Spatial Economy, MIT Press. Cited from memory and via the sources above; not read here.
- **Combes & Gobillon:** "The Empirics of Agglomeration Economies", CEPR Discussion Paper 10174 (summary at <https://causalclaims.trfetzer.com/paper/DP10174.html>).
- **Combes, Duranton, Gobillon, Puga & Roux (2012):** "The Productivity Advantages of Large Cities: Distinguishing Agglomeration From Firm Selection", Econometrica: <https://www.econometricsociety.org/publications/econometrica/2012/11/01/productivity-advantages-large-cities-distinguishing>
- **Bessen (2019):** cited for the constant-elasticity point; see `sources/bessen-2019-automation-and-jobs.pdf`, PDF p.11.
