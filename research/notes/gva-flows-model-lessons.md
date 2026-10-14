# What this project can use from the GVA flows model (modelling_demand)

The user's earlier project, in the `modelling_demand` repository, built a stylised model of "what we see of GVA at the surface versus what's going on in the plumbing". This note pulls out what's useful for this project: the model's design, the research behind it, and lessons on method.

It's based on the research notes in `research/notes`, the build worklog in `build/plan_docs` and the published model. I read all of these through a tool that summarises pages rather than copying them, so details may have been lost and quotes are short. I haven't read the code.

## What the earlier project is

- **Origin.** It started on 3 October 2026 from Webber & Huaccha (2024), "Rethinking productivity", in the Journal of Post Keynesian Economics. That paper argues that GVA per worker mixes demand and market power with physical efficiency, through the identity GVA = (S − C) × Q: price minus bought-in cost per unit, times quantity sold.
- **Recommendation.** The research notes found eleven things that paper's two-dimensional firm view misses, and recommended a "flow-network" model. This is a stock-flow-consistent economy of places, producers, households, owners, government and the rest of the world, in which each producer's (S, C, Q) rectangle is one node.
- **What was built.** Model spec v1 was built between 3 and 12 October 2026 as "Where GVA is made, booked and received". It is published at <https://danolner.github.io/modelling_demand/>.
- **Status.** According to the build worklog:
  - all nine acceptance tests pass, with accounting identities holding to within one part in a billion of GDP
  - all eight experiments have been run
  - about 100 unit tests and 23 browser tests pass
  - no open issues are recorded

## Why it matters here

On 13 October 2026 the user decided to start fresh with the five-industry network in `io-network-extension.md`. The earlier project is a source of related ideas, not a base to build on.

v1 is still close to what our brief describes. It's a multi-place input-output model with supply chains, a business-services hub, commuting between places, ownership of firms, and lenses that compare official statistics with true flows. So its design choices, lenses and tests are worth borrowing. Its gaps show what our model has to do differently: technology that spreads over time, demand that responds to price and saturates (Bessen), workers grouped by age cohort and region, and adjustment over time.

## The v1 model in brief

### Places and people

- **Places.** There are four: a core city, a manufacturing town, a rural area, and the rest of the world. Population is 1.8 million, with the city's share calibrated in the base year (it comes out at 0.286).
- **Labour force.** Each place has its own working-age share and participation rate. One representative household account per place.

### Producers and costs

- **Seventeen domestic producers, plus three in the rest of the world.**
  - **City:** a gadget brand (head office and intellectual property) and business and financial services.
  - **Town:** components and capital goods, and food processing.
  - **Rural area:** agriculture.
  - **In each place:** retail, utilities, public services (health, education, care) and housing.
  - **Rest of the world:** general imports and energy, contract assembly, and an offshore IP-holding subsidiary.
- **Firms and ownership.** The producers belong to nine firms. Each firm has ownership shares held by residents of each place and by overseas owners. Overseas shares run from 0.20 to 0.75 for the larger firms, set with the fact that 58.8% of UK quoted shares were held overseas at the end of 2024.
- **Costs.** Each producer has a cost structure per £1 of output: bought-in inputs by supplier, wages, depreciation and net profit, plus a wage per job. Jobs per unit of output are wage share ÷ wage per job.
- **Supply chains.** The structure includes:
  - a food chain: agriculture → food processing → retail in each place
  - a gadget chain: components and overseas assembly → city brand
  - a business-services hub that sells to every producer

### Prices

- **Market producers** price with a markup on prime cost: p_j = (1 + μ_j) · (Σ_i a_ij · p_i + ω_j · ℓ_j). Here a_ij are the input coefficients, ω_j the wage per job and ℓ_j the jobs per unit of output. The markups are set so that every base-year price is 1.
- **Public services** are priced at cost.
- **Some prices are fixed:** the gadget brand, housing and the rest of the world.
- Prices are solved to convergence within each period, so there are no lags.

### Demand

- **Essentials:** households buy fixed quantities per resident of housing, utilities and everyday basics.
- **Consumption.** Total spending follows a Godley–Lavoie rule: C = α1 · YD + α2 · M(t−1), with α1 = 0.9 and α2 = 0.1. Here YD is disposable income and M(t−1) is last period's money holdings.
- **Discretionary spending** (consumption minus essentials) splits by fixed shares: 3% on gadgets and the rest on local retail.
- **Other demand:**
  - government buys a fixed amount of public services per resident
  - investment equals depreciation
  - exports have a fixed mix and fixed quantities
- **Nothing responds to prices.**
- **Output** comes from the Leontief system x = A · x + f, where f is final demand.

### Incomes, commuting and stocks

- **Income flows.** GVA splits into wages, depreciation and profit. Profit is taxed at 25%, and dividends go to owners by ownership share. Households pay an income tax, with the rate calibrated to 0.263, and receive benefits.
- **Commuting.** A matrix allocates jobs in each workplace to residents of each place. It's set in the base year by a rule (local jobs filled first) and then held fixed.
- **Unemployment** in a place is its labour force minus its employed residents. There's no labour-supply constraint.
- **Money stocks** for households, firms, government and the rest of the world are updated each period, and must sum to zero.
- **Wealth** is reported as money plus capitalised housing and equity.

### Calibration

The base year is a steady state. Three unknowns are solved to hit three targets:

- exports, for a zero current account
- the income tax rate, for 5% unemployment
- the city's population share, for 15% of city jobs held by in-commuters

The results: GDP £52.2bn, GNI £47.0bn, GDP per resident £29,004. Disposable income per resident is £22,929 in the city, £14,229 in the town and £13,698 in the rural area.

### Lenses (reporting views)

There are eleven. The ones that matter most here:

- **Workplace GVA by place**, under three ways of recording multi-place firms' profits: where they arise, at the head office, or apportioned by wage bill. The last is the ONS method for finance and insurance.
- **Value capture per final product**, by place. In the base year, the gadget's value splits 67.7% to the city, 11.3% to the town and 21.0% to the rest of the world.
- **Whole-chain productivity.** Chain workers per unit of final product, λ_k = Σ_j ℓ_j · L_jk, using the Leontief inverse L and including overseas labour. This is the same "labour embodied" quantity as in `io-network-extension.md`, where it turns Bessen's price-in-hours into a network quantity.
- **Household measures by place:** disposable income, residual income after essentials, and wealth.
- **Measurement views:** nominal GVA, real GVA at base-year prices, and real GVA deflated with sector price indices (the ONS method).
- **Local retention:** the share of a place's GVA that becomes income for its residents. In the base year this is 0.546 in the city, 0.667 in the town and 0.672 in the rural area.
- **A "streetlight" toggle** between official and true views.

### Scenarios, experiments and tests

- **Scenario system.** Any parameter can be changed from any period, and scenarios are stored as data. Among the switches is one for technology: changing input coefficients and jobs per unit of output.
- **Eight experiments:**
  1. moving intellectual property offshore ("Cupertino")
  2. a supermarket squeezing its suppliers
  3. austerity in public services
  4. an overseas takeover
  5. city rents rising 30%
  6. an export slump
  7. local procurement on the Preston model
  8. public-service "efficiency"
- **Nine acceptance tests** have exact expected values. They include a two-producer economy small enough to solve by hand, and a "freeze consumption" mode that isolates first-round effects.

## Ideas to borrow, and where our model differs

| Our need | How v1 handles it | Idea for our fresh model |
|---|---|---|
| Several industries in a supply network | 17 producers with chains and a business-services hub | The five-industry network has the same ingredients in miniature: a chain, a hub and final demand at several levels |
| Region | Three places plus the rest of the world, with commuting and ownership matrices | Borrow the split between workplace and residence, and profits flowing to owners elsewhere. Add mobility: v1's commuting is fixed after the base year and there's no migration |
| Generic efficiency-improving technology | A switch for input coefficients and jobs per unit of output | The same kind of change, but spreading over time (S-curves) rather than happening in one go |
| Bessen demand that responds to price and saturates | Not present: essentials are fixed quantities, and discretionary spending splits by fixed shares | Bessen curves for household goods, with the rest of spending as a residual |
| Gains passed on to prices | Proportional markup pricing, solved instantly; some prices fixed | Partial and lagged pass-through, so savings move down the chain over time |
| Workers by age cohort and region | One household per place, homogeneous workers | A cohort-by-region workforce, hiring and separation flows, and re-employment that differs by group |
| A labour market that adjusts | None: unemployment is labour force minus jobs, with no supply constraint | Participation, re-employment and mobility. Without them, unemployment swings are large: 9.3% after austerity and 13.1% after the export slump in v1 |
| Dynamics | 40 annual periods; only money stocks evolve | Lags, diffusion and cohort flows; capital and productivity feedback later |
| Official versus true views | Eleven lenses and the streetlight toggle | Borrow the most relevant: labour embodied across the whole chain, value capture by place, workplace GVA against residents' income, and nominal against real GVA. They show how technology effects look at the surface compared with the plumbing |

Three features of v1 bear directly on technology:

- **Fixed essentials are already saturated Bessen goods.** v1 treats essentials as fixed quantities, which is the same as the saturated end of a Bessen curve, where the elasticity is near zero. So v1 already contains the inelastic phase. Adding Bessen curves, with gadgets and other discretionary goods in the elastic phase, would supply the rising phase.
- **Experiment 8 is Bessen's zero-elasticity case.** It cuts public-service jobs per unit by 10% while government demand stays fixed. The result is pure job loss: GDP −2.4% and unemployment 9.0% at year 40. Measured real GVA per public-service job rises 11.1% under the output-indicator convention but only 0.95% under the input convention. So the efficiency gain looks very different at the surface depending on the measurement convention.
- **Fixed-price producers keep their gains.** An efficiency gain at a producer with a fixed price, such as the gadget brand, can't lower its price. It raises the margin instead, which shows up as higher GVA per job in the city and as dividends that are 65% overseas-owned for that firm. Consumers see no price fall, so there's no boost to demand. This is my inference from the model's structure, not an experiment it ran.

## Research findings that bear on our theory questions

These come from the earlier project's notes; the confidence levels are theirs where they gave them.

### Pass-through and market power

These decide whether efficiency gains reach consumers.

- **Cost changes pass through only partly.** Belgian manufacturers pass through about 60% of their own cost changes, and put a weight of about 0.4 on competitors' prices. Small firms pass on costs fully; large ones don't (Amiti, Itskhoki & Konings 2019).
- **Prices are stickier downwards.** In a Bank of England survey of 693 firms, 33.9% kept their price unchanged after a cost fall, against 12.3% after a cost rise. The median firm changes its price about once a year (Greenslade & Parker).
- **Markups have risen.** US aggregate markups rose from 21% above marginal cost in 1980 to 61% by the mid-2010s (De Loecker, Eeckhout & Unger 2020). UK average markups rose about 10% since 1997, mostly at the top of the distribution (Competition and Markets Authority 2024).
- **Implication for us (my reading):** Bessen assumes full pass-through. If efficiency savings stay as margin instead, the demand channel that creates jobs in the elastic phase is weaker. The gains then flow to owners, and through the ownership matrix possibly to another place or abroad.

### Measured versus physical productivity

- **Efficient plants charge less.** In US plants making physically identical goods, physical productivity and price correlate at −0.54 (Foster, Haltiwanger & Syverson). Revenue-based productivity therefore understates efficiency gains that are passed on as lower prices.
- **Demand varies far more than efficiency.** Across plants, demand varies about five times as much as physical efficiency. And a firm's "appeal" and product range explain at least four-fifths of the variation in firm sales (Hottman, Redding & Weinstein 2016).
- **Deflation decides what shows.** How prices are deflated decides which effects appear in "real" GVA. Volume effects show fully. Price shifts along a supply chain show in firm and regional figures, which use national industry price indices, but mostly not in national totals.

### Demand-led productivity and dynamics

- **Kaldor–Verdoorn.** Productivity growth rises with output growth, with a conventional coefficient of about 0.5 (range 0.3–1.0). Which way the causation runs is disputed. This would be a feedback for us: elastic demand → faster output growth → faster productivity growth.
- **Labour hoarding.** When hiring and firing happen at different speeds, firms hoard labour and measured productivity moves with the cycle. In the Mark-0 model, the ratio of the two speeds decides whether the economy is stable.
- **Hysteresis.** Temporary shocks can cause permanent output losses (Cerra, Fatás & Saxena 2023; Blanchard, Cerutti & Summers 2015). This fits Schneider & Vipond's scarring of cohorts.
- **Wage-led demand.** The UK comes out wage-led in Onaran & Galanis' estimates, though the result depends on method (medium confidence). If efficiency gains go to profits rather than wages or prices, wage-led demand weakens.

### Where jobs go, by sector and place

- **Foundational economy.** It accounts for about 40% of UK jobs and about 30% of household spending, and public services are about 20% of GDP. Baumol's "cost disease" means employment shifts towards services with slow productivity growth. In our model this is the likely landing place for workers displaced by efficiency gains elsewhere, and its demand is tied to local population.
- **Local multipliers.** In US cities, each extra manufacturing job creates about 1.6 local non-tradable jobs, each skilled tradable job about 2.5, and each unskilled tradable job about 1 (Moretti 2010). This is a guide to how technology-driven job changes in a place's tradable industries spread locally.
- **Economic base logic.** Tradable sectors bring income into a place, foundational sectors recirculate it, and leakages drain it: imports, profits to outside owners, and commuters spending at home.

### Where gains are recorded and who receives them

- **Transfer prices only move GVA around.** Prices between stages of a chain move GVA between firms and places without changing the chain total. Buyer power and pass-through decide who captures a saving. This is the "smile curve" and the supermarket squeeze.
- **Recorded is not received.** Regional GVA is recorded at the workplace and household income at residence. The ONS apportions multi-region profits by wage bill (checked only for finance and insurance), and intellectual property can book output far from where the work is done.
- **Productivity and pay.** Mean UK pay tracked productivity from 1981 to 2019, but median pay fell about 25 percentage points behind (Teichgraeber & Van Reenen). In Italy from 1999 to 2007, only about 60% of productivity growth reached real wages (Garbellini & Wirkierman, medium confidence).

### Data for a regional version later

- **ONS interregional trade:** first estimates came out in 2025, covering 2019–2020 for the 12 ITL1 regions and nations, as official statistics in development. Total interregional trade was £1,350bn in 2020, and London supplied 28% of it.
- **Devolved tables:** Scotland and Wales publish their own input-output tables.
- **Not yet read:** a UK multi-regional input-output dataset (12 regions × 105 sectors, 2017–2022) and a multi-regional social accounting matrix from Strathclyde. The earlier notes flagged both but didn't read them.
- **Biggest gap:** trade in services between regions is the largest data gap (ESCoE 2018).

## Lessons on method

- **Exact tests.** Acceptance tests with exact expected values, plus accounting identities checked every period, caught design problems early. They include stock-flow consistency (all money stocks sum to zero) and a hand-solvable two-producer economy. Worth copying.
- **Steady base year.** A base year that is a steady state, calibrated to a few targets, makes any scenario's effect easy to read.
- **Freeze consumption.** The "freeze consumption" mode separates first-round effects from feedback through demand. For us, freezing demand would show an efficiency gain's pure job effect with no demand response, which is Bessen's zero-elasticity case.
- **Units.** Volumes are measured in "base-year pounds" (all base prices equal 1), with separate display prices for physical units. This lets Bessen's physical-quantity demand curves sit alongside value-based input-output tables.
- **Scenarios as data.** Scenarios stored as data, with a scenario editor, let experiments be added without new code.
- **Technology.** v1 has a TypeScript engine, browser views in Svelte, and unit and browser tests. It builds to a single self-contained HTML file of about 200 kB.

## Decisions

The user decided on 13 October 2026:

1. **Start fresh** rather than extending the v1 engine.
2. **Keep the smaller five-industry network** from `io-network-extension.md` rather than v1's 17-producer, three-place network.

**Update, 14 October 2026:** the first build now starts smaller still, with the two-sector model in `two-sector-model-plan.md`. The five-industry network is a later step.

The earlier project is a source of related ideas, such as the lenses, tests, units and the separation of workplace from residence. It isn't a base to build on.

## How sure to be

- **Second-hand detail.** Everything here comes from summaries of the earlier project's notes and build worklog, made by a fetching tool, not from the files word for word. Exact wording and minor details may differ.
- **Figures.** The numbers are as reported in those notes. The earlier notes give their own confidence levels, which I've kept. They flagged as weaker: Kalecki's pricing (from secondary sources), dairy margins (from trade press), and the effect of wages on productivity (low confidence).
- **My inferences.** The points marked as my inference are mine and haven't been checked against the code or run in the model: the fixed-price producer keeping its gain, and pass-through limiting Bessen's demand channel.

## Sources

The user's repository, <https://github.com/DanOlner/modelling_demand>, read on 13 October 2026.

- Research notes: <https://github.com/DanOlner/modelling_demand/tree/master/research/notes>. These were read: `model-spec-v1.md`, `interrogating-the-2d-model.md`, `flows-and-value-added.md`, `where-gva-is-recorded.md`, `supply-chains-buyer-power-and-gva.md`, `revenue-vs-physical-productivity.md`, `measuring-gva-and-productivity.md`, `demand-led-productivity-dynamics.md`, `productivity-incomes-and-wealth.md`, `foundational-economy-and-sector-linkages.md`, `data-streetlight-effect.md`, `firm-pricing-and-firm-demand.md`, `agent-based-firm-demand-models.md`, `webber-huaccha-2024-rethinking-productivity.md` and `worklog.md`.
- Build worklog: <https://github.com/DanOlner/modelling_demand/blob/master/build/plan_docs/build-worklog.md>
- Published model: <https://danolner.github.io/modelling_demand/>
- The studies above are cited as the earlier notes cite them. Their URLs are in those notes. Webber & Huaccha (2024) is in the Journal of Post Keynesian Economics 47(1), 55–83, doi:10.1080/01603477.2023.2221667.
