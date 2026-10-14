# Bessen demand in an input-output network: how efficiency gains travel through supply chains

This note extends the brief in `bessen-inverted-u-model-brief.md` from one industry to a small network of industries that sell to each other as well as to consumers. It covers the theory the build needs, a suggested minimal network, how to make it dynamic, and how to keep it ready for UK input-output tables.

## Decisions this note works from

The user made these decisions on 13 October 2026:

- **Several industries.** Use the smallest number that still forms an input-output structure with supply chains, so we can see how technology feeds through intermediate supply as well as final consumer demand.
- **Abstract for now.** The model should be designed so that UK supply-use or input-output tables can be dropped in later.
- **Generic technology.** The first model is framed around a generic efficiency-improving technology, not AI specifically.
- **Worker groups:** age cohorts and region.
- **Start fresh with the five-industry network below.** The earlier project's GVA flows model is a source of related ideas, not a base to build on (see `gva-flows-model-lessons.md`).

**Update, 14 October 2026:** the first build now starts from a smaller two-sector model, set out in `two-sector-model-plan.md`. This network is a later step, and that model is designed to grow into it.

## The core idea

Prices travel down supply chains and quantities travel up them.

1. An efficiency gain in one industry lowers its costs.
2. Competition passes the saving on to its customers, then to their customers, and finally to consumers.
3. Consumers respond according to Bessen-style demand curves for final products.
4. The change in final demand travels back up the chain as orders.

Whether a particular industry gains or loses jobs depends on three things:

- how much of the final price of the products it feeds into comes from its own work
- how elastic consumer demand is for those products
- whether the efficiency gain saves labour or saves intermediate inputs

Evidence and theory that support this picture:

- **Acemoglu, Akcigit & Kerr:** in their model, supply-side shocks such as productivity changes travel downstream to customer industries, and demand-side shocks travel upstream to supplier industries. They find a pattern broadly in line with that in US data.
- **Autor & Salomons:** across countries, productivity growth cuts employment in the industry where it happens, but those losses are reversed by gains in customer industries and by increases in aggregate demand. The fall in labour's share of income in the advancing industry is not made up elsewhere.
- **McNerney and colleagues:** efficiency gains compound as they pass along production chains. Industries at the end of longer chains therefore see faster price falls, and countries with longer chains faster GDP growth.

I've read summaries and abstracts of these three papers, not the full texts.

## The standard input-output machinery

For n industries:

- **Output and final demand.** x is the vector of gross output and f the vector of final demand.
- **Technical coefficients.** A is the matrix of technical coefficients: a_ij is the amount of industry i's output needed to make one unit of industry j's output.
- **Leontief inverse.** B = (I − A)^(−1) is the Leontief inverse. B_ij is the total output of i needed, directly and through the whole chain, for one unit of final demand for j.
- **Quantities.** x = A · x + f, so **x = B · f**.
- **Labour.** l_j is the hours (or workers) needed per unit of output in industry j, and employment is L_j = l_j · x_j.
- **Prices.** With competitive prices, each industry's price covers its inputs, its labour and any other value added: p_j = Σ_i p_i · a_ij + w · l_j + π_j. Here π_j is other value added per unit, such as profit, capital costs and taxes. In matrix form, **p′ = (w · l′ + π′) · B**.
- **Pure-labour case.** If π = 0, then p′ = w · l′ · B. So p_k / w = λ_k, where λ′ = l′ · B gives the hours of labour embodied in one unit of product k, counting every stage of its supply chain.

This links directly to Bessen. In his 2019 version, demand depends only on the price measured in hours of wages (p/w). In a network, that is the total labour embodied in the product. An efficiency gain anywhere upstream lowers λ_k for every product downstream of it.

## Attaching Bessen demand

- **Final products get demand curves.** Each final product k gets its own Bessen demand curve for demand per head. In the lognormal form with α = 0 (2019 paper, equation 13): f_k / N = γ_k · Φ((μ_k − ln(p_k / w)) / σ_k).
- **Intermediate demand is derived.** Intermediate goods have no preference distribution of their own: their demand comes from final demand through B. So an intermediate industry inherits its demand response from the final products it feeds. Bessen's textiles and steel are intermediate goods, which is why imports of clothing and steel-using goods broke his consumption measure (2019 paper, PDF p.7 footnote 1, p.31).
- **A practical way to set each final product's curve.** This is my suggestion. Use two intuitive numbers:
  - the current price elasticity, ε_k0
  - the current saturation, sat_k0: current demand per head as a share of the ceiling γ_k

  Then:
  - z_k0 = Φ^(−1)(sat_k0)
  - σ_k = φ(z_k0) / (Φ(z_k0) · ε_k0)
  - γ_k = (current demand per head) / sat_k0
  - μ_k = σ_k · z_k0 + ln(p_k0 / w_0)

  With UK tables, current demand and prices come from the tables, with base-year prices set to 1. Elasticities and saturation do not: they have to come from other estimates or be set as scenarios.

## Who gains and who loses: a first-order guide

This is my own derivation from the standard Leontief price and quantity models with Bessen demand, so it's worth checking. It assumes a pure-labour economy, competitive prices and prices measured in wage units. A labour-saving gain in industry j cuts l_j by a small fraction δ.

1. **Prices.** The price of each final product k falls by θ_jk · δ in proportional terms. Here θ_jk = w · l_j · B_jk / p_k is the share of k's price that is industry j's labour, counting every route through the supply chain. For each product, these shares add up to 1 across industries.
2. **Final demand.** Demand for k rises by ε_k · θ_jk · δ in proportional terms, where ε_k is k's price elasticity.
3. **Output.** Output of industry i rises by Σ_k ω_ik · ε_k · θ_jk · δ in proportional terms. Here ω_ik = B_ik · f_k / x_i is the share of i's output that ends up, directly or indirectly, in final product k. For each industry, these shares add up to 1 across products.
4. **Employment.** Every industry other than j gains jobs, because the efficiency gain only lowers their customers' prices. Industry j's own employment changes by (E_j − 1) · δ in proportional terms, where **E_j = Σ_k ω_jk · θ_jk · ε_k** is j's effective elasticity.

What this means:

- **Bessen's model is a special case.** It's the case with one product, where ω = θ = 1, so E_j is just the price elasticity.
- **Upstream industries are more likely to lose jobs from their own gains.** In a network, θ_jk is usually well below 1 for an upstream industry, because its labour is a small part of the final price. Its own efficiency gains barely move final prices, so its effective elasticity is small. For example, if j's labour is 10% of the price of the only product it feeds, final demand would need an elasticity above 10 for j's employment to grow.
- **Customers and the rest of the network gain.** This fits Autor & Salomons' finding that own-industry losses are offset by gains in customer industries and in aggregate demand.

Other kinds of efficiency gain work differently. These are the directions only:

- **Input-saving gains.** Industry j needs less of input i per unit, so a_ij falls. Industry j's price falls by the cost it saves, which raises demand for j and everything downstream. But supplier i loses the saved sales directly, so i's employment can fall.
- **Uniform gains.** All of j's inputs, labour and intermediate, fall by the same proportion, as in total factor productivity. Its price falls by more than its labour share alone would give. Its suppliers face both effects: fewer inputs per unit, but more units.

For the economy as a whole, Hulten's theorem (as set out in Carvalho & Tahbaz-Salehi's primer) says that, to a first approximation, the gain in total output from an efficiency gain in one industry is proportional to that industry's total sales, including sales to other industries, relative to GDP. So efficiency in an industry that sells to many others counts for more than its own value added suggests.

## Making it dynamic

In the standard model, price and quantity changes pass through the whole network at once. These are suggestions for making the passage visible over time:

- **Diffusion.** The improving industry's coefficients (l_j, and column j of A for input-saving or uniform gains) follow an S-curve over time.
- **Price pass-through with a lag.** Each industry sets this period's price from last period's input prices: p_t′ = p_(t−1)′ · A_t + w_t · l_t′ (+ π_t′). With fixed coefficients this settles to the standard prices, but a saving moves one link down the chain each period. It reaches consumers after as many periods as the chain has links, so you can watch it travel. A variant would pass on only part of a saving each period.
- **Demand adjustment.** Final demand moves part of the way towards its Bessen level each period.
- **Quantities.** Output meets current demand (x_t = B_t · f_t). Order or stock lags could be added if wanted.
- **Labour.** Hiring and separations happen by industry and worker group, as in the cohort brief. Displaced workers move to the outside option, with chances and wage penalties that differ by group.
- **Capital, later.** Leontief & Duchin (1986) used a dynamic input-output model, including investment in capital goods, to study the effect of computer automation on US employment from 1963 to 2000. A dynamic input-output model with capital stocks is an option for later, not needed now.

## Closing the model: the rest of the economy

Bessen assumes his industry is a small part of the economy. A composite good takes up the rest of spending, and its productivity sets the wage (2019 paper, PDF p.25–26). In a network where every industry is modelled, the accounts have to add up.

My suggested closure:

- **A rest-of-economy industry.** Include one in the network. Households spend on it whatever is left after buying the Bessen goods, so its demand is not a Bessen curve.
- **Spending equals income.** In a pure-labour economy, the value of final demand equals total wages. So if households spend all their income, labour demand equals labour supply automatically. Full employment holds in the static version by construction.
- **Frictions create unemployment.** In the dynamic version, delays in moving between industries create unemployment. The accounts still need to stay consistent, with spending equal to income.
- **The residual stands in for new goods.** As the Bessen goods saturate, spending shifts to the rest-of-economy good. That stands in for new goods, which is Bessen's point that Keynes underestimated "the depth of human wants" (2019 paper, PDF p.38).

## A minimal abstract network

This was my suggestion, and the user chose it on 13 October 2026, to be built fresh. It has five industries, the smallest set I can see that includes a chain, a hub that supplies everyone, and final demand at more than one level:

1. **Materials (upstream).** Sells mostly to other industries, with little final demand.
2. **Manufacturing (midstream).** Buys materials and business services; sells to consumers and to consumer services.
3. **Business services (hub).** Sells to every industry, plus a little final demand. This hub matters later, because many AI-exposed activities, such as legal, accounting and advertising work, are business services sold to other industries.
4. **Consumer services (downstream).** Buys manufactured goods and business services; sells almost everything to consumers.
5. **Rest of economy.** Closes the model as above, and trades a little with all the others.

Which industries sell to which. Rows are sellers and columns are buyers; the build chooses the numbers. To keep the model well behaved, keep each column's total intermediate inputs well below 1.

| Seller ↓ / buyer → | Materials | Manufacturing | Business services | Consumer services | Rest of economy | Final demand |
|---|---|---|---|---|---|---|
| Materials | small | large | none | small | small | small |
| Manufacturing | none | small | small | medium | small | large |
| Business services | small | medium | small | medium | small | small |
| Consumer services | none | none | none | none | small | large |
| Rest of economy | small | small | small | small | small | the remainder of spending |

The suggested technology scenarios are a generic efficiency gain diffusing in one industry at a time: first materials (upstream), then business services (the hub), then consumer services (downstream).

- **Default: labour-saving.** This matches Bessen's measure of productivity (output per worker-hour), and the network effects are easiest to read.
- **Variants:** input-saving and uniform gains, to compare.

Outputs to show:

- price paths travelling down the chain
- final demand for each product
- output and employment by industry
- flows of workers between industries and groups

### Adding regions

Region is now one of the worker groups, so the industries need locations. This is my suggestion, borrowing the earlier project's city, town and rural places (see `gva-flows-model-lessons.md`):

- **Three regions:** a city, an industrial town and a rural area.
- **Tradable industries sit in one region each and sell across regions:** business services in the city, manufacturing in the town and materials in the rural area.
- **Local industries sit in every region:** consumer services and the rest of the economy, each serving its own region's residents.
- **Nine nodes in all.** That gives nine industry-region nodes: three tradable, plus two local industries in each of three regions.
- **Who buys from whom.** Local industries buy from the tradable industries wherever those are, and from local suppliers in their own region.
- **How effects spread.** An efficiency gain in a tradable industry changes jobs mainly in its own region at first. The effects then spread to other regions through supply chains, and within regions through local spending. This follows economic base logic: tradable industries bring income into a region and local services recirculate it (see the local multipliers in `gva-flows-model-lessons.md`).
- **Mobility.** By default, workers live and work in the same region. Commuting and migration between regions are options whose rates differ by cohort. Schneider & Vipond's point that job loss concentrates in places is about exactly these frictions.
- **Later spatial forces.** For the forces that could be added later, one at a time (trade costs, housing and congestion, Krugman's core-periphery dynamics, input-output links as an agglomeration force, productivity gains from density), see `phd-thesis-spatial-agents-lessons.md`.
- **UK data later.** The ONS publishes only national input-output tables. A regional version would need the ONS interregional trade estimates and the Scottish and Welsh tables listed in `gva-flows-model-lessons.md`.

## Designing for UK tables later

This is what the ONS publishes, as of 13 October 2026. All of these are under the Open Government Licence v3.0.

- **Input-output analytical tables.**
  - **Coverage and content:** 105 products or industries at basic prices. They come in product-by-product and industry-by-industry versions, with domestic and imported use shown separately. They include coefficient matrices, Leontief inverses, and "type 1" effects and multipliers, which count direct and supply-chain effects but not effects through household incomes.
  - **Latest edition:** released 11 December 2025, with files named for 2023 (`iot2023product.xlsx`, `iot2023industry.xlsx`). The dataset pages still say the latest tables are for 2022, so check the reference year inside the file.
  - **Earlier editions:** each edition stands alone, with no revised back series. Product-by-product tables go back to 1984 for selected years; industry-by-industry tables only to 2016.
  - **Assumptions:** the tables assume fixed coefficients, stable prices and unlimited capacity.
- **Supply and use tables** for 1997 to 2023, consistent with the 2025 Blue Book, released 31 October 2025 (`supublicationtablesbb25.xlsx`).
- **Employment multipliers and effects:** full-time-equivalent employment per £ million of output, and type 1 employment effects and multipliers, for 105 industries.
  - **Latest year:** 2020, released 31 March 2025.
  - **Status:** official statistics in development.
  - **How they're built:** from the Business Register and Employment Survey, the Annual Population Survey and the industry-by-industry tables.
  - **Year mismatch:** the latest employment figures are three years older than the latest tables.

What this means for the abstract model:

- **Make the network an input.** Keep the number of industries, the coefficient matrix A, the labour coefficients l, final demand and the value-added rows as inputs. Then the 105-industry tables, or an aggregation of them, can replace the five-industry abstract one. Include a mapping for grouping 105 industries into fewer.
- **Prefer the industry-by-industry tables.** The ONS employment figures are by industry, and the employment multipliers are built from the industry-by-industry tables.
- **Keep domestic and imported inputs separate.** Imports are a leak in the chain. Demand for imported inputs creates no domestic jobs, and efficiency gains abroad arrive as cheaper imports.
- **Treat money as quantities in the base year.** The tables are in £ million, not physical units. Setting base-year prices to 1 makes values into quantities. Tracking change over time needs price indices or tables in previous years' prices.
- **Not all value added is wages.** Value added includes compensation of employees, gross operating surplus, and taxes less subsidies on production. So use the general price model with π, not the pure-labour shortcut.
- **Only household demand gets Bessen curves.** Final demand has several columns: households, non-profit institutions, government, investment, changes in inventories and exports. Hold the others on paths set outside the model, at least at first.
- **Elasticities and saturation don't come from the tables.** They have to come from other estimates or be set as scenarios. Bessen himself says forecasting needs estimates of current demand elasticities as well as productivity growth (2019 paper, PDF p.33–34).
- **Coefficients are fixed except where the technology changes them.** Technology change in the model is a change in coefficients, which suits the tables. But there's no substitution between inputs when relative prices change.

## How sure to be

- **Direction of travel:** that prices travel down chains and quantities up is standard input-output theory, and Acemoglu, Akcigit & Kerr's evidence supports it.
- **Network-wide results:** Autor & Salomons' result that own-industry job losses are offset elsewhere comes from cross-country industry data. McNerney and colleagues' result about chain length comes from long-run price and output data. I've read only the summaries.
- **The "who gains and who loses" formulas** are my own first-order derivation and should be checked.
- **The five-industry network and the dynamic features** are my suggestions.
- **The ONS details** come from the dataset pages and the quality report for the input-output tables, read on 13 October 2026.

## Sources

- `notes/bessen-inverted-u-model-brief.md`, and the Bessen papers in `sources/`: `bessen-2018-ai-and-jobs.pdf` and `bessen-2019-automation-and-jobs.pdf`, cited by PDF page.
- **Acemoglu, Akcigit & Kerr**, "Networks and the Macroeconomy: An Empirical Exploration", NBER Working Paper 21344 (2015), later in NBER Macroeconomics Annual: <https://www.nber.org/papers/w21344>
- **Autor & Salomons**, "Is Automation Labor-Displacing? Productivity Growth, Employment, and the Labor Share", NBER Working Paper 24871 (2018), and Brookings Papers on Economic Activity, Spring 2018: <https://www.nber.org/papers/w24871>, <https://www.brookings.edu/bpea-articles/is-automation-labor-displacing-productivity-growth-employment-and-the-labor-share/>
- **McNerney, Savoie, Caravelli, Carvalho & Farmer**, "How production networks amplify economic growth", PNAS 119(1), e2106031118: <https://arxiv.org/abs/1810.07774>
- **Carvalho & Tahbaz-Salehi**, "Production Networks: A Primer", Annual Review of Economics (2019): <https://www.kellogg.northwestern.edu/faculty/alirezat/ProductionNetworksPrimer.pdf>
- **Leontief & Duchin**, The Future Impact of Automation on Workers, Oxford University Press (1986). Library record: <https://ci.nii.ac.jp/ncid/BA00103641>
- **ONS**, UK input-output analytical tables, product by product: <https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/datasets/ukinputoutputanalyticaltablesdetailed>
- **ONS**, UK input-output analytical tables, industry by industry: <https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/datasets/ukinputoutputanalyticaltablesindustrybyindustry>
- **ONS**, input-output analytical tables quality and methodology information: <https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/methodologies/inputoutputanalyticaltablesqmi>
- **ONS**, input-output supply and use tables: <https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/datasets/inputoutputsupplyandusetables>
- **ONS**, employment multipliers and effects in the UK (2020): <https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/datasets/employmentmultipliersandeffectsintheuk2020>, with release page <https://www.ons.gov.uk/releases/employmentmultipliersandeffectsintheuk>
