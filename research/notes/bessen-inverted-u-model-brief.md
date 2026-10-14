# Bessen's inverted-U model, and a brief for a dynamic version with cohorts

## What this note is for

This note sets out how James Bessen's model produces the rise and fall of employment in an industry as its productivity grows, and what the model leaves out. It draws on two versions of the work:

- a short 2018 paper, "AI and Jobs: The Role of Demand", which has the simplest statement of the model
- a fuller 2019 paper, "Automation and Jobs: When Technology Boosts Employment", which has the data, the estimating equations and the fitted parameters

It ends with a brief for the build side. We want:

- a **dynamic model that runs over time**, not an equilibrium snapshot
- **several industries linked by supply chains**, so we can see how a generic efficiency-improving technology feeds through intermediate supply as well as final demand (see `io-network-extension.md`)
- to use the model to explore the points in Schneider & Vipond's paper about **what happens to different cohorts and demographic groups** when technology changes an industry, as simply and illustratively as we can.

On naming: the curve is an **inverted U**. Employment in the industry rises for decades and then falls. The earlier project's journal calls it U-shaped (see `gm-ai-planner-2025-sources.md`).

Page numbers are the PDF pages in the text copies in `sources/`. The printed page numbers are one lower in all three papers. Pages marked "2019" are from the 2019 paper, and pages in the Schneider & Vipond section are from that paper. All other pages are from the 2018 paper.

## The pattern Bessen explains

- US textiles, steel and car manufacturing all had decades of strong employment growth during very rapid productivity growth, followed by decline. These industries spent more decades growing employment than losing it (PDF p.3).
- Scale of the decline: in 1958 US broadwoven textiles employed over 300,000 production workers and primary steel over 500,000. By 2011 the figures were 16,000 and 100,000 (PDF p.3).
- Scale of the price fall: from 1810 to 2011, real GDP per head rose about thirtyfold, but output per hour in cotton textiles rose over eight-hundredfold, and inflation-adjusted prices fell by about three orders of magnitude. Steel was similar: output per hour rose over 100 times from 1860 to 2011 (PDF p.7).
- In the 19th century, labour productivity in cotton textiles rose nearly 30-fold, but consumption of cotton cloth rose 100-fold. That's how employment grew while the labour needed per yard fell (PDF p.6).
- Bessen argues the standard explanations don't fit. Faster productivity growth (Baumol) can't explain the rise, because textiles and steel had faster productivity growth than agriculture yet grew in employment. Income elasticity (Engel's law) can't explain why cloth behaved like a luxury in the 19th century and a necessity later (PDF p.5–7). His answer is that the **price elasticity of demand falls as prices fall** (PDF p.8).
- Figure 1 (PDF p.26), read by eye, so approximate: textile wage earners peak at around 450,000–460,000 in the 1920s–30s and fall to about 20,000 by the late 2000s. Iron and steel wage earners peak at about 600,000 in the mid-1950s and fall to about 100,000. Car production workers rise from 1910 to a plateau of 600,000–800,000 from about 1950 to 2007, with no clear fall yet by then. In each case the model's predicted line tracks the actual numbers closely over long periods.
- Figure 2 (PDF p.27), also read by eye: manufacturing's share of the US labour force rises from about 3% in 1810 to 20–25% between about 1900 and 1960, then falls to about 8% by the 2010s.

## The model, step by step

All of this is from PDF pages 9–13 unless stated otherwise. Bessen's example good is cloth, set against a "composite good" that stands for the rest of the economy. The cloth industry is assumed to be a small part of the economy, and the economy is closed to trade.

### Production and price

- Output is q = A · L, where L is labour in the industry and A is technical efficiency (labour productivity). Rising A is **labour-augmenting** technical change: workers become more productive, but machines don't fully replace them. Bessen (2016) argues that full replacement is rare (PDF p.9).
- Markets are competitive, so the price is the wage divided by productivity: **(1) p = w / A**, where w is the wage.
- The market clears, so demand equals output: D(p) = A · L, which gives **(2) L = D(p) / A**.

### The key result

Taking logs and differentiating with income held constant (PDF p.10):

- d ln L / d ln A = ε − 1, where ε = −d ln D / d ln p is the price elasticity of demand.
- If demand is **elastic (ε > 1)**, higher productivity *raises* employment, because cheaper output increases demand by proportionally more than the labour needed per unit falls. If demand is **inelastic (ε < 1)**, higher productivity cuts jobs.

The rest of the model explains why ε starts above 1 and falls below it as prices fall.

### Demand comes from a distribution of uses

Following Dupuit (1844):

- A consumer has many uses for cloth, each with a value v. Clothing is worth a lot; curtains are a luxury. Let f(v) be the amount of cloth needed by the uses worth v. In effect it's a density over values.
- The consumer buys cloth for every use worth more than the price. So demand is D(p) = the integral of f(z) from p to infinity = **1 − F(p)**, where F is the cumulative distribution. Demand is normalised so that the most a consumer can ever want is 1 (PDF p.10–11).
- The value the consumer gets from cloth is U(p) = the integral of z · f(z) from p to infinity. This equals spending, p · D(p), plus the usual net consumer surplus, the integral of D(z) from p to infinity (PDF p.11).
- Intuition: at high prices most uses are priced out, which is the upper tail of the distribution. Each price cut then brings many new uses into the market, so demand is elastic. At low prices nearly all uses are already met, which is the lower tail. Further price cuts add little, so demand is inelastic (PDF p.8).

### Adding income and leisure

- Total utility is U(v) + G(x, 1 − l), where x is the composite good, l is the share of time spent working, 1 − l is leisure and G is concave. The budget constraint is w · l ≥ x + p · D(v) (PDF p.11–12).
- The first-order conditions give a cut-off value: the consumer buys cloth for every use worth more than v̂ = G_l · p / w = G_l / A, where G_l is the marginal value of leisure. In words, a use is worth buying if it's worth more than the hours of work the cloth costs, valued at the worth of leisure.
- Bessen sets G_l = w^α, which gives **(3) v̂ = w^α / A = w^(α−1) · p, and D = 1 − F(v̂)**. The parameter α controls how the value of leisure changes with income. If α = 0, the value of leisure is constant and only A matters. A backward-bending labour supply curve would mean α < 0 (PDF p.12).
- The 2019 version reaches the same form without the leisure choice, and finds that α is close to 0 in the data (see the 2019 section below).

### Elasticities

These are on PDF p.12.

- The price elasticity, holding wages constant, is ε = p · f(v̂) / (1 − F(v̂)) · w^(α−1). This is the same as **ε = v̂ · f(v̂) / (1 − F(v̂))**, the cut-off value times the "hazard rate" of the preference distribution.
- The income (wage) elasticity, holding price constant, is **ρ = (1 − α) · ε**. If α = 0, the price and income elasticities are equal.

### When the inverted U happens

These conditions are on PDF p.13, with proofs on p.20–22.

- Employment traces an inverted U as prices fall if ε > 1 at high prices and ε < 1 at low prices. The necessary condition is that ε rises with price over a significant range.
- Proposition 1: if the density f has a single peak, ε rises with price at all prices below the peak.
- Proposition 2: if the distribution is normal, lognormal, exponential or uniform, there is a threshold price p\* with ε < 1 below it and ε > 1 above it. The inverted U appears whenever the price starts above p\* and productivity growth pushes it below.
- Bessen's reading is that this is an industry life cycle. A young industry has high prices and lots of unmet demand, so price cuts bring sharp rises in demand. A mature industry has satisfied demand, so further price cuts bring only an "anemic" increase.
- In the appendix the wage is set to 1, so ε(p) = p · f(p) / (1 − F(p)), and the slope is dε/dp = ε · (f′/f + f/(1 − F) + 1/p). A sufficient condition for ε to rise with price is f′/f + f/(1 − F) ≥ 0 (PDF p.20).

### Elasticity formulas for common distributions

These are from the appendix (PDF p.20–22), with the wage set to 1. The thresholds p\* where ε = 1 are my own derivations, not in the paper.

- **Exponential**, f(p) = λ · e^(−λp): ε(p) = λp, so p\* = 1/λ.
- **Uniform** on (0, b): ε(p) = p / (b − p), so p\* = b/2.
- **Normal**, mean μ and standard deviation σ: ε(p) = (p/σ) · φ(x) / (1 − Φ(x)), where x = (p − μ)/σ, and φ and Φ are the standard normal density and cumulative distribution. Find p\* numerically.
- **Lognormal** (what Bessen uses with data): ε(p) = φ(x) / (σ · (1 − Φ(x))), where x = (ln p − μ)/σ. So p\* = exp(μ + σ · x\*), where x\* solves φ(x\*) / (1 − Φ(x\*)) = σ. The left-hand side, the inverse Mills ratio, rises steadily with x, so there's exactly one solution.

### A worked example

This is my own derivation from the paper's equations, useful as a check for the build. Take the exponential distribution, set the wage to 1 and use normalised demand:

- The price is p = 1/A, demand is D = e^(−λ/A), employment is L = e^(−λ/A) / A, and the elasticity is ε = λ/A.
- Employment peaks where ε = 1, which is A = λ. Peak employment is e^(−1)/λ.
- While A < λ, demand is elastic and employment rises. Above λ it falls, eventually like 1/A, as demand approaches its ceiling of 1, the point where every use is met.
- If productivity grows at a constant rate g, so A(t) = A0 · e^(gt), employment peaks at time t\* = ln(λ / A0) / g. That gives the inverted U over time.

### What drives employment growth over time

The 2019 paper calculates employment as L = N · D / ((1 + m) · A · h) (2019 PDF p.32), where:

- N is population and D is demand per head
- m is import penetration, meaning net imports divided by domestic production
- A is output per worker-hour and h is hours worked per worker per year

Taking growth rates gives the following. This is my own derivation, with the income parameter α set to 0, which is what the data support (see below).

- **g_L = g_N + (ε_A − 1) · g_A − g_h − g_m**, where g_N, g_A and g_h are the growth rates of population, productivity and hours per worker, and g_m is the growth rate of (1 + m).
- ε_A is the elasticity of demand with respect to productivity. In the simple model it's the price elasticity ε. In the 2019 version it's ε · (1 + d ln s / d ln A), where s is labour's share of output (2019 PDF p.18).
- With other things held constant, productivity growth adds jobs while ε_A > 1 and removes them once ε_A < 1. Bessen's point that faster technical change creates jobs faster in the elastic phase is the (ε_A − 1) · g_A term (PDF p.16). In the 2019 paper's words, "the rate of productivity growth determines the pace of employment change, but the elasticity of demand determines the sign" (2019 PDF p.33, repeated on p.37).
- **Population and hours delay the peak.** When population grows or hours fall, employment doesn't peak at ε_A = 1. It keeps rising until ε_A has fallen to 1 − (g_N − g_h − g_m) / g_A. Suppose population grows 2% a year, hours per worker fall 0.5% a year and productivity grows 3% a year. Then the peak comes when the elasticity has fallen to about 0.17, well below 1.
- If α isn't 0, add a wage term, −α · ε · g_w, where g_w is wage growth.

## The fuller 2019 version, and how it's fitted to data

All pages in this section are from the 2019 paper (`sources/bessen-2019-automation-and-jobs.pdf`). This is the version prepared for the April 2019 Economic Policy Panel; it was later published in Economic Policy 34(100). I haven't checked whether the published text differs.

### What changes in the model

- **Capital and labour's share.** Output comes from a constant-returns production function with capital, Y = Y(L, K; t) (p.25). With s as labour's share of output, the price is p = w / (s · A), so s · A = w / p, the wage divided by the price (p.16, p.18, p.26). The 2018 model is the special case s = 1.
- **The elasticity that matters.** Whether jobs rise or fall depends on the elasticity of demand with respect to productivity: ε_A = ε · (1 + d ln s / d ln A) (p.18). If labour's share doesn't change with productivity, this equals the price elasticity.
- **Any technology that raises output per worker counts.** The 2019 version covers task automation, labour-augmenting change and change that raises the productivity of all inputs alike (p.13).
- **No leisure choice.** Utility is U(v̂) + G(x), with the budget constraint w ≥ x + p · D(v̂). The cut-off becomes v̂ ≈ (p/w) · w^α = w^α / (s · A). Here G(x) = x^α/α, or ln x when α = 0, and α lies between 0 and 1 (p.24, p.30). The parameter α now sets how fast extra spending on everything else loses value as people get richer.
- **α ≈ 0 in the data.** Bessen can't find an α significantly different from 0 (p.32), so demand depends only on w/p = s · A. The cut-off is then simply the price measured in hours of wages: a use is worth buying if it's worth more than the time it takes to earn the price.
- **Each moment is still an equilibrium.** In Bessen's words: "I do not specify the savings function and the dynamic growth path of capital. Equations (6) and (7) will hold at each point in time" (p.26).

### Data

- **Physical quantities, not values:** yards of cotton (and later synthetic) cloth, short tons of raw steel, and numbers of cars and trucks. Consumption per head is production plus net imports, divided by population (p.15). Quality improvements aren't measured (p.16).
- **Employment, wages and prices:** employment is wage earners, or production workers from 1958. Wages are manufacturing production workers' compensation. Prices are for standard commodities: cotton sheeting and steel rails. There is no usable price series for cars. Because price data are thin, w/p is calculated as labour's share times productivity (p.16).
- **Productivity:** labour productivity is output per production worker-hour (p.17). It grew 2.9% a year in cotton textiles (1820–1995), 2.4% in steel (1860–1982) and 1.4% in cars (1910–2007).
- **Small samples:** before 1958 most series exist only at ten-year intervals (p.15), so the samples are small: 52 observations for cotton, 35 for steel and 61 for cars (p.49).
- **Sources:** these are listed on p.41–43. They are mainly Lebergott (1966) and Historical Statistics of the United States for the early years, the NBER-CES Manufacturing Industry Database from 1958, BLS employment and hours series, Ward's Automotive Yearbook, and Feenstra's and Schott's import data. Some, such as Ward's, are paid products, so rebuilding the series would take real work.

### Step 1: a flexible test of whether the elasticity fell

- Log demand per head is regressed on a quadratic in ln(w/p), measured as ln(s · A), plus a quadratic in ln w, where w is real GDP per head (p.19). The R-squared values are 0.979 for cotton, 0.974 for steel and 0.934 for cars.
- The squared productivity term is negative and significant in all three industries, so demand is concave in productivity: the elasticity falls as productivity rises (p.20).
- Elasticities with respect to productivity (Table 1, p.49):

  | Industry | Early year | Flexible fit | Lognormal model | 1950 or 1951 | Flexible fit | Lognormal model |
  |---|---|---|---|---|---|---|
  | Cotton | 1820 | 1.3 | 1.7 | 1950 | 0.2 | 0.2 |
  | Steel | 1870 | 2.2 | 2.9 | 1950 | −1.2 | 0.4 |
  | Cars | 1910 | 2.4 | 4.4 | 1951 | 0.4 | 1.0 |

  The flexible-fit values are all significantly above 1 in the early years and below 1 by about 1950. Steel's negative value shows the quadratic fitting badly at that end (p.21). The lognormal model is the one in step 2.
- Labour's share hardly changes with productivity in cotton (coefficient 0.016) or steel (0.066), but it falls in cars (−0.348) (Table 1, p.49). The text on p.21 says the small positive estimates are for "textiles and autos"; given the table, that looks like a slip for textiles and steel.

### Step 2: the lognormal demand curve

- With a lognormal distribution of uses, demand per head is D = γ · (1 − Φ((−ln(s · A) + α · ln w − μ) / σ)) (equation 12, p.30). Equation 13 is the same with ln(p/w) in place of −ln(s · A).
  - γ is the ceiling on demand per head.
  - μ and σ set where the distribution of uses sits and how spread out it is.
  - With α = 0 this simplifies to D = γ · Φ((ln(s · A) + μ) / σ). Demand rises in an S-shape with the log of what an hour's wage buys.
- The model is fitted by non-linear least squares on log demand (p.31). The preferred estimates, with α = 0, are in Table 2, column 1 (p.50):

  | Product and years | μ | σ | γ | R-squared |
  |---|---|---|---|---|
  | Cotton cloth, 1820–1995 | −0.24 | 1.43 | 134.6 | 0.993 |
  | Raw steel, 1860–1982 | 5.04 | 0.83 | 0.66 | 0.981 |
  | Cars and trucks, 1910–2007 | 7.31 | 0.30 | 59.4 | 0.977 |

- **Units.** Judging by Figure 3 (p.10–11), γ for cotton is in yards per head and γ for steel in tons per head. Both match the levels where the figure's curves flatten out. γ = 59.4 for cars can't be vehicles per head, since Figure 3 shows sales of up to about 0.07 per head, so it's probably per 1,000 people. The paper doesn't say.
- The textile and steel samples stop in 1995 and 1982. After that, imports of goods made from textiles and steel, such as clothing, make the consumption measure unreliable (p.31).

### Step 3: from demand to employment

- Predicted employment = (demand per head × population) / (1 + import penetration) × 1 / (output per worker-hour × hours per worker per year) (p.32). Import penetration is net imports divided by domestic production (p.31). These are the predicted lines in Figure 1 (p.6).
- The predictions track actual employment over long periods. The exceptions are drops in the Great Depression, extra car jobs in the Second World War, and actual employment falling below the prediction once trade breaks the consumption measure (p.32).

### When employment peaks under the lognormal curve

This is my own derivation from equation 12, with α = 0 and labour's share, population, hours and imports held constant.

- Let z = (ln(s · A) + μ) / σ. Then the elasticity with respect to productivity is ε_A = φ(z) / (σ · Φ(z)), where φ is the standard normal density.
- Employment peaks where φ(z\*) / Φ(z\*) = σ. At that point demand per head has reached the share Φ(z\*) of its ceiling.
- So the spread of uses, σ, decides how early the peak comes. With Bessen's estimates, employment would peak when demand reached about 19% of its ceiling for cotton (σ = 1.43), 48% for steel (σ = 0.83) and 83% for cars (σ = 0.30). Widely spread uses mean the elasticity drops below 1 early. Tightly bunched uses mean jobs keep growing until the market is nearly saturated.
- These figures aren't predictions of the actual peaks. Population growth and shorter hours push the peak later (see the growth formula above). In the 19th-century US, where population grew fast, they pushed it much later.

### How sure to be

- **These are working papers.** The 2018 paper hasn't been peer reviewed (2018 PDF p.1). The 2019 paper was published, but I've read only the conference version.
- **The two versions report different numbers.** The 2018 paper reports R-squared values of "0.982 or higher" and price elasticities at the ends of each sample (2018 PDF p.14):
  - **cotton:** 2.13 in 1810, 0.02 in 1995
  - **steel:** 3.49 in 1860, 0.16 in 1982
  - **cars:** 6.77 in 1910, 0.15 in 2007

  The 2019 paper reports elasticities with respect to productivity for particular years, as above. The years and measures differ, so the numbers aren't directly comparable.
- **The employment fit isn't a separate test.** Productivity is measured as output divided by employment and hours, and output is consumption net of imports. So, by my algebra, predicted employment works out as actual employment × (predicted demand ÷ actual demand). Figure 1's close employment fit is therefore the demand fit seen another way.
- **The demand fit is weaker evidence than it looks.** All the series trend strongly over two centuries, so high R-squared values are easy to get. Bessen reports that augmented Dickey-Fuller tests "could not reject the null hypothesis of no co-integration" (p.19). As I read it, that result doesn't rule out a spurious relationship between trending series, which is the opposite of the reassurance it's offered as. This is my reading, and it's worth checking with someone who does time-series econometrics.
- **The strongest evidence** is that the same saturating shape appears in three industries at very different dates.
- **Other caveats.** The extreme elasticities depend partly on the lognormal shape. Quality improvements aren't measured, so "true" demand and productivity are understated (p.16).
- **Cars.** Car employment hadn't clearly turned down by 2007, so the cars case shows the rise and a plateau more than the full inverted U. That fits with its narrow spread of uses (σ = 0.30).

## What the model leaves out

These are the limits of the model as a partial model. Most are stated or implied in the paper; where something is my reading, I say so.

1. **One small industry, nothing else.** The industry is assumed to be a small part of a closed economy (PDF p.9). The model says nothing about where displaced workers go. Bessen says jobs lost in an industry are lost "not necessarily in the economy as a whole", and leaves effects across the whole economy to other papers (PDF p.4, p.15). The 2019 paper adds two points. Moves between industries don't show up in manufacturing as a whole: textile employment fell for decades while steel and car employment grew (2019 PDF p.14). And the total effect on jobs depends on spillovers, effects on downstream producers and economy-wide effects that the model leaves out (2019 PDF p.37).
2. **Wages are set outside the industry and prices follow costs exactly.** Markets are competitive with zero profits, so every productivity gain reaches consumers as a lower price. The 2018 version has no capital (p = w/A). The 2019 version adds capital and lets labour's share of output vary. But it still assumes competition and zero profits, and it takes labour's share from the data rather than explaining it (2019 PDF p.13–14, p.25). My inference: if AI's productivity gains are kept as profit rather than passed on in lower prices, the demand channel that creates jobs in the elastic phase is weaker.
3. **People still do the work.** The 2018 version treats technology as making workers more productive. The 2019 version covers any technology that raises output per worker, including task automation (2019 PDF p.13). Either way, the industry still employs people. If AI fully replaces workers in a job, demand stops mattering for that job, because there's no demand for the people (PDF p.16, p.19).
4. **One kind of worker.** L is a single number, with no skills, ages, sexes, places or job types. So the model can show how many jobs there are but not who holds them, who loses them or who gets the new ones. Bessen himself notes that AI will eliminate jobs in some occupations while creating them in others, and that retraining and moving workers, "sometimes in new locations, might be highly disruptive" even if total employment stays high (PDF p.18). He also notes that computer automation's effects differed across skill groups (footnote 5, PDF p.18).
5. **Fixed preferences, no substitutes.** The distribution of uses doesn't change, so there are no new products or uses unless the distribution is redrawn. The model assumes no close substitutes, or substitutes whose prices hardly change (footnote 4, PDF p.11). It also ignores the business cycle, and trade only enters through import penetration in the empirical step (PDF p.14). Everyone is assumed to have the same demand (2019 PDF p.5). Bessen checks the early substitutes (wool and linen, iron rails, horse-drawn vehicles) and argues they were quickly overtaken. He accepts that the distribution could shift as income inequality changes, or as new materials take uses away, as aluminium may have done from steel since the 1970s. He also accepts that the model ignores the timing of purchases of durable goods such as cars (2019 PDF p.28–29).
6. **Each year is an equilibrium.** This is the most important gap for us. Time enters only through the paths of productivity, wages and population, which are set from outside the model. Each year the market clears and employment jumps to whatever demand requires. There are no hiring or firing flows, no adjustment costs, no lags and no expectations, and nothing that happened last year affects this year. A fall in employment costs nobody anything in the model. The 2019 paper says as much: its equations "will hold at each point in time", and it doesn't model how capital grows (2019 PDF p.26).
7. **A one-parameter income effect.** All the ways income affects demand are carried by α (PDF p.12).
8. **Short horizon for AI.** Bessen limits the AI application to the next 10 to 20 years for two reasons. First, markets that are elastic now, such as financial and health services, may become saturated if AI cuts costs quickly. Second, AI may later fully replace many more occupations (PDF p.19).

## What Bessen says about AI

- What matters is how demand responds. AI creates jobs in an industry if it serves large unmet needs among people with diverse preferences and uses (the upper tail), and destroys them in markets that are already satisfied (PDF p.15).
- The pace of change alone doesn't decide the outcome. If demand is elastic and AI doesn't fully replace people, faster technical change means faster job growth (PDF p.15–16).
- Most automation has been partial. Of the 271 detailed occupations in the 1950 US census, only one, elevator operators, disappeared mainly because of automation (PDF p.16–17).
- Earlier computer automation and AI haven't obviously cost jobs. For example, the boom in electronic discovery of legal documents came with more paralegal jobs (PDF p.17–18).
- AI might create wholly new products that meet unmet needs, which is hard to predict. Past forecasts of technological unemployment have reliably failed to anticipate new sources of demand (PDF p.18).
- Elasticities of demand change slowly, so an industry's elasticity in 10 or 20 years is likely to be close to today's. A forecast needs estimates of both productivity growth and current elasticities (2019 PDF p.33–34).
- The limited evidence so far suggests new technologies cut jobs in some industries and are neutral or positive in others (2019 PDF p.34–35).
- So the main near-term effect may be a reallocation of jobs between industries, occupations and regions rather than mass unemployment. That can still be highly disruptive: workers need new skills, may have to move, and may face spells of unemployment (2019 PDF p.35–36).
- Bessen cites a Dutch study (Bessen et al. 2019). Few workers leave firms that automate, but those who are displaced suffer long unemployment and income losses. The safety net, early retirement and self-employment don't make up those losses (2019 PDF p.34, p.36).
- This is the bridge to Schneider & Vipond. Bessen's own conclusion is that the policy problem is transitions, not mass unemployment, and transitions are exactly what a cohort model can explore.

## What we want from the build

### A dynamic model, not an equilibrium snapshot

Bessen's employment path is a sequence of equilibria: it moves over time only because productivity does. We want a model whose state carries over from one period to the next, so that the path matters. Who is employed this year should depend on who was employed last year, and adjustment should take time and fall on particular people.

These are dynamic elements the build could add. They're my suggestions, so pick only as many as the illustration needs:

- **Gradual diffusion of the technology.** Productivity follows an S-curve, with the old and new techniques working side by side for a long time. Schneider & Vipond stress that diffusion is drawn out and that "obsolete" techniques persist for decades, as sail did alongside steam and water power in US manufacturing until the end of the 19th century (Schneider & Vipond PDF p.16, p.27).
- **Demand that adjusts with a lag.** Demand moves part of the way towards its new level each period, rather than all at once.
- **Employment that changes through flows.** Use Bessen's labour demand as the target each period, and reach it through hiring and separations rather than jumps.
- **A workforce made of stocks of people by group.** New cohorts enter, older workers retire, and displaced workers go somewhere: another sector, unemployment or out of the labour force.

### Cohorts and demographic groups, following Schneider & Vipond

The central claim is on Schneider & Vipond PDF p.21: "While several papers find that new jobs were generated to replace those lost to new labour-saving technologies, access to these new employment opportunities was stratified by gender, age, education, and geographical location. Incumbents whose skills were rendered obsolete by new technologies may have had a limited ability to take up the new employment opportunities."

Historical cases that could anchor an illustration (PDF p.20, p.22):

- **British bootmaking:** about 150,000 jobs were lost as the industry mechanised and 142,000 were created, but the workers who lost the old jobs didn't move into the new ones (Vipond 2023). Total employment barely changed, but almost all the adjustment fell on incumbents.
- **Hand spinning in Britain:** this employed up to 20% of women and children in the late 18th century. It was eliminated with little reinstatement, and the job losses lasted at least into the 1830s (Schneider 2023). Humphries & Schneider (2021) argue it drove hundreds of thousands of women out of paid work and helped create the male-breadwinner family.
- **US telephone operators:** automated switching in the early 20th century pushed incumbent operators out of the labour market or into lower-paid jobs (Feigenbaum & Gross 2020).

The groups Schneider & Vipond name are gender, age, education and location (PDF p.21); class, race, age and location (PDF p.28); and women, people of different religious and ethnic backgrounds, and locations (PDF p.26).

Mechanisms from Schneider & Vipond that a model could represent:

- **Skills that lose their value.** Skills tied to the old technique depreciate, and new jobs need different skills. Predicting which skills will be needed is very hard (PDF p.10, p.27).
- **Unequal routes back into work.** How easily displaced workers find new jobs differs by age, sex, education and place, and displaced incumbents often end up out of work or in worse-paid jobs (PDF p.20–21).
- **Long-term scarring.** Job loss can harm individuals and families over the long term and pass to the next generation (PDF p.26, p.28).
- **Concentration in places.** Job losses cluster in places, and disadvantage there persists (PDF p.19, p.26, p.28).
- **Stranded early adopters.** People who invest in skills for one new technology can be stranded when a later technology takes over (PDF p.27). A cohort that trains for the first wave can lose out in the second.
- **Resistance.** Workers and politics can slow adoption, as when strong unions held off longshoremen's layoffs under containerisation for decades (PDF p.17–18, p.25). This one is optional.
- **Retraining isn't a full answer.** Retraining can't fully solve displacement if new technology destroys demand for some skills while creating demand for others (PDF p.27). A model could compare retraining with other responses.

How sure to be: Schneider & Vipond is a review and research-agenda paper, not new evidence. Its claim about unequal access rests on a handful of case studies, which the authors acknowledge (PDF p.28). On effects across generations they say "there is, as yet, no research which focuses on this aspect" (PDF p.28). So the cohort mechanisms in the model will be illustrative assumptions, not calibrated facts. The copy in `sources/` is the May 2023 LSE version; the journal quotes the later CESifo version.

### A possible minimal structure

This is a suggestion, not something from either paper. The industry side is now a small network of industries: see `io-network-extension.md` for the network, prices and how the model's accounts add up.

- **Industries** form a small input-output network, and each industry's labour demand comes from the network model. In an industry where the technology is spreading, there are **two kinds of job**: old-technique and new-technique jobs, with the new share following the diffusion curve. The **outside option** is the rest-of-economy industry, plus not working.
- **Workers in groups**, defined by cohort (year of entry or birth) and one or two attributes, such as sex or region.
- **Each period:**
  1. The oldest workers retire and a new cohort enters.
  2. Old-technique jobs shrink and their workers separate from the industry.
  3. New-technique jobs are filled.
  4. Displaced workers move to the outside option.

  Who fills the new jobs depends on a matching probability that differs by group. For example, entrants may be much more likely to get them than incumbents. How easily displaced workers get re-employed outside, and at what wage penalty, also differs by group.
- **Outputs:**
  - each industry's employment path. The industry where the technology spreads should show the inverted U, and other industries gain or lose jobs through the network.
  - employment and earnings over time by cohort and group
  - the share of new jobs that go to incumbents rather than entrants
  - the cumulative earnings each displaced cohort loses
- **Scenarios to compare:**
  - **Growth with displacement.** Displacement during the elastic, growing phase versus the saturated, shrinking phase. The bootmaking case suggests incumbents can lose out even while the industry holds or grows its total employment.
  - **Faster technical change.** Bessen says faster change creates jobs faster in the elastic phase. With cohorts, it could also displace incumbents faster. The model can show both at once.
  - **Where in the chain.** The same efficiency gain upstream, in the hub industry, or downstream.
  - **Fast versus slow diffusion.**
  - **Access for incumbents.** High versus low access to new jobs, as a stand-in for retraining or other support.

### Decisions so far

The user decided these on 13 October 2026:

1. **Several industries.** Use the smallest number that forms an input-output structure with supply chains, so we can see how technology feeds through intermediate supply as well as final demand. See `io-network-extension.md`. Bessen notes that textiles shrank for decades while steel and cars grew (2019 PDF p.14), so a network can also show workers moving from mature industries to young ones.
2. **Abstract for now**, but designed so that UK supply-use or input-output tables can be dropped in later.
3. **A generic efficiency-improving technology**, not AI specifically.
4. **Worker groups: age cohorts and region.** Region opens up spatial economic questions: industries cluster in particular places, and Schneider & Vipond stress that job losses concentrate in places (PDF p.19, p.26, p.28). A suggested regional layout for the five industries is in `io-network-extension.md`.
5. **Start fresh with the five-industry network** in `io-network-extension.md`. The earlier GVA flows model is a source of related ideas, not a base to build on (see `gva-flows-model-lessons.md`).

**Update, 14 October 2026:** the first build now starts from a smaller two-sector model, set out in `two-sector-model-plan.md`. The five-industry network, regions and age cohorts become later steps.

## Sources

- `sources/bessen-2018-ai-and-jobs.pdf`: James Bessen, "AI and Jobs: The Role of Demand", NBER Working Paper 24235, January 2018. Pages cited are PDF pages in the text copy `bessen-2018-ai-and-jobs.pdf.txt`. The equations were read from the PDF itself (pages 9–13 and 20–22) because the text copy garbles them, and the figures from PDF pages 26–27.
- `sources/schneider-vipond-past-and-future-of-work.pdf`: Benjamin Schneider and Hillary Vipond, "The Past and Future of Work: How History Can Inform the Age of Automation", LSE Economic History Working Paper 354, May 2023. Pages cited are PDF pages in `schneider-vipond-past-and-future-of-work.pdf.txt`. A later version is CESifo Working Paper 10766 (November 2023).
- `sources/bessen-2019-automation-and-jobs.pdf`: James Bessen, "Automation and Jobs: When Technology Boosts Employment", paper for the 69th Economic Policy Panel, April 2019 (file dated March 2019), downloaded from <https://www.economic-policy.org/wp-content/uploads/2019/03/997_Automation-and-Jobs.pdf>. Pages cited are PDF pages in `bessen-2019-automation-and-jobs.pdf.txt`. The equations, figures and tables were checked against the PDF itself. PDF page 44 is blank. The published version is Economic Policy 34(100), 589–626, 2019: <https://ideas.repec.org/a/oup/ecpoli/v34y2019i100p589-626..html>.
