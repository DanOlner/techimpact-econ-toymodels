# First build spec: the two-sector model

## What this note is for

- **For the build side.** `two-sector-model-plan.md` sets out the design and the reasons for it. This note pins down what the plan leaves open, so that a first test model can be built from it:
  - the scope
  - the equations
  - a base year that fits together
  - default values
  - tests with expected values
- **It's meant to iterate.** If something here doesn't work, or a test fails, record what happened and send it back to research.
  - Don't tune parameters to force a match: the expected values are my derivations and could be wrong.
- **No data files are needed.** The first model is abstract.
- **The format is the build side's choice.** A first test model needs no interface: tables, a few charts and a test report are enough.

## Scope of the first test model

- **Build steps 1 and 2** from the plan's build order:
  1. one sector, X and one worker type
  2. the same sector with four worker types (incumbents and general workers, each matched or unmatched), and a technology that augments or automates
- **Stage A only.** Each technology level is solved as an equilibrium on its own. Time only labels the levels.
- **Build so the next steps slot in.** Steps 3 to 5 add a second sector, two firms in each sector and six worker types. Keep these as inputs rather than fixing them in the structure:
  - the number of sectors
  - the number of firms in each sector
  - the worker types
  - each type's choice of jobs
- **Out of scope:** see "Not yet" below.

## Symbols

| Symbol | Meaning | Default |
|---|---|---|
| s | a worker type | |
| j | a job: a firm and technique, or X | |
| N_s | number of people of type s | total population normalised to 1 |
| A_{s,j} | output per worker of type s in job j | set by the base year |
| b_{s,j} | attraction of job j for type s, apart from pay | set by the base year |
| θ | how sharply people sort by pay | 5; 200 for tests |
| ω_f | piece rate: firm f's pay per unit of output | 1 minus input costs, in the base year |
| p_f | firm f's price | 1 in the base year |
| P_k | sector k's price: the average price paid per unit | 1 in the base year |
| σ_w | elasticity of substitution between a sector's two firms | 4 |
| a_DM | design used per unit of manufacturing | by preset |
| a_MD | manufactured goods used per unit of design | by preset |
| y_s | average pay per head of type s | |
| x_s | X consumed per head by type s | |
| γ_k | ceiling on sector k's demand per head | from two numbers |
| μ_k | log-location of sector k's distribution of uses | from two numbers |
| σ_k | log-spread of sector k's distribution of uses | from two numbers |
| r | incumbents' premium in their home sector | 0.5 |
| g | gain from augmentation | 1 |
| c_s | match: 1 if type s can use the augmenting technology, else 0 | |
| A_m | machine output per minder | 1 to 10 |
| m_s | ability to mind machines: 1 or 0 | |
| Φ, φ, Φ^(−1) | the standard normal distribution function, density and inverse | |

## Equations

### Households

There's one household per type. Its income is the type's average pay per head, y_s.

- **Cut-off for sector k:** v̂_{k,s} = P_k / x_s.
- **Demand per head, in physical units:** d_{k,s} = γ_k · Φ((μ_k − ln v̂_{k,s}) / σ_k).
- **X per head:** x_s = y_s − Σ_k P_k · d_{k,s}.
  - Solve for x_s by bisection between 0 and y_s.
  - There's exactly one solution, because the right-hand side falls as x_s rises.
- **Final demand for sector k:** the sum over types of N_s · d_{k,s}.
- **Utility per head,** for real income:
  - U_s = Σ_k γ_k · exp(μ_k + σ_k²/2) · Φ((μ_k + σ_k² − ln v̂_{k,s}) / σ_k) + ln x_s.
  - The first term is the value of the uses bought: the standard partial expectation of a lognormal.
- **Price elasticity, holding x fixed:** ε = φ(z) / (σ_k · Φ(z)), where z = (μ_k − ln v̂) / σ_k.

### Setting a demand curve from two numbers

This is the method in `io-network-extension.md`, with P / x in place of p / w. Take the base-year saturation S (the share of the ceiling bought), the base-year elasticity ε₀ and the base-year cut-off v̂₀ = P₀ / x₀. Then:

- z₀ = Φ^(−1)(S)
- σ = φ(z₀) / (ε₀ · S)
- μ = σ · z₀ + ln v̂₀
- γ = (base-year demand per head) / S

The two curves:

- **Young:** S = 0.1 and ε₀ = 2, giving σ ≈ 0.8775 and z₀ ≈ −1.2816.
- **Mature:** S = 0.8 and ε₀ = 0.4, giving σ ≈ 0.8749 and z₀ ≈ 0.8416.

**With more than one type,** incomes differ. Calibrate on the population-average x₀, then rescale γ so that base-year spending on the sector is exactly its target share.

### Firms, prices and quantities

- **Splitting between a sector's firms** (step 4 onwards):
  - Firm f's share of its sector's units is p_f^(−σ_w) divided by the sum of p^(−σ_w) over the sector's firms.
  - With one firm in a sector, the share is 1.
- **Sector price:** P_k is the sum of share × price over the sector's firms.
- **Firm prices:**
  - **M firm:** p_f = ω_f + a_DM · P_D.
  - **D firm:** p_f = ω_f + a_MD · P_M.
  - **Steps 1 and 2:** there are no bought-in inputs, so p = ω.
  - **Two sectors:** given the piece rates, solve this loop by iteration. It converges because a_DM · a_MD < 1.
- **Output needed:**
  - Q_M = (final demand for M) + a_MD · Q_D
  - Q_D = (final demand for D) + a_DM · Q_M
  - Each firm makes its share of its sector's units.
- **Techniques.** Both techniques in a firm sell at the firm's price and pay its piece rate. They differ only in output per worker.

### Workers

- **Pay in a job:**
  - **In firm f:** w_{s,j} = ω_f · A_{s,j}.
  - **In X:** w_{s,X} = A_{s,X}.
- **Who works where.** The share of type s in job j is b_{s,j} · w_{s,j}^θ, divided by the same quantity summed over every job in the type's choice set.
  - **Jobs a type can't do.** A type that can't do a job (zero output) has it left out of its choice set.
  - **Large θ.** Compute the shares in logs, with the log-sum-exp method, or large θ will overflow.
- **Income:** y_s is the sum over jobs of (share of s in j) × w_{s,j}.
- **Units supplied to firm f:** the sum, over types and the firm's techniques, of N_s × (share of s in j) × A_{s,j}.

### Solving

- **Unknowns:** one piece rate per firm.
- **Excess demand** for each firm is the number of units it's asked for minus the number its workers make. Supply rises and demand falls as the piece rate rises.
- **Steps 1 and 2** have one firm, so one unknown. Use bisection, which stays robust at large θ, where the function is steep.
- **Steps 3 to 5** have four unknowns. Use a standard root-finder on the logs of the piece rates, starting from the base year, and check it from other starting points.
- **Converge tightly,** to within one part in 10¹², so that the accounting checks hold to one part in a billion.

### Real income and the gains ledger

- **Change in real income** (the equivalent variation) for type s: the change in income that, at base-year prices, would give the type its current utility. Find it by bisection on income.
- **The ledger** splits that change in two:
  - **The pay part** is the change in y_s.
  - **The price part** is the change in real income minus the pay part.

## The base year

### Steps 1 and 2: one sector

- **Pay and prices.** X pays everyone 1. The sector's price and piece rate are 1. General workers produce 1 in the sector, so they earn 1 there too. Incumbents produce 1 + r.
- **Size.** The sector's share of household spending is:
  - **0.1%** for the tests that need Bessen's setting of a small industry
  - **10%** to see what closing the model changes
- **Step 1: one type.**
  - **Base-year share:** the type's share in the sector equals the spending share, because pay is 1 everywhere.
  - **Attraction:** set b_M / b_X to share / (1 − share).
- **Step 2: four types.** Each test below sets out its own types.
  - **General workers** split between the sector and X by attraction terms, which set their share in the sector.
  - **Incumbents** start in the sector.
    - **At large θ,** give them equal attraction terms: their premium then keeps them all in the sector.
    - **At θ = 5,** calibrate the attraction terms so that 90% start there.
  - **Matched and unmatched** types are identical until a technology arrives.

### Steps 3 to 5: a recipe that fits together

The population shares in the plan's first draft (20% manufacturing incumbents and 10% design incumbents) don't fit sectors of the sizes the defaults imply. The sectors would be too small for every incumbent to work at home at a premium. This recipe sets the sectors first and derives the population from them, so the base year fits by construction.

1. **Prices** are all 1. Piece rates are ω = 1 − a_DM for M firms and 1 − a_MD for D firms.
2. **Pay.** X pays everyone 1. General workers earn 1 in either sector, as the marginal producers. Incumbents earn 1 + r at home.
3. **Output per worker** is pay divided by the piece rate. For example, a general worker in M produces 1 / (1 − a_DM).
4. **Sector sizes.**
   - **Output.** Take household spending shares from the preset and solve for output, using the input coefficients.
   - **Scaling.** Everything scales with total income, so set total income to make the population add up to 1.
5. **Workforce.** Incumbents make up 75% of each sector's headcount, and general workers 25%.
6. **Population.** Size each incumbent type so that 90% of it works at home in the base year and 10% in X. General workers make up the rest.
7. **Choice sets.**
   - **Incumbents** choose between their home sector's firms and X. This is a simplification to revisit.
   - **General workers** choose among all four firms and X.
   - **Machine techniques.** Either group can work a machine technique where a firm has adopted one, if they can mind machines.
8. **Attraction terms.** Back them out from the base-year shares, at base-year pay and the θ you'll run. Recalibrate if θ changes.
9. **Matched and unmatched.** Split every type 50:50. The halves are identical until a technology arrives.
10. **New-technique jobs** don't exist in the base year. Give each type the same attraction to a firm's new technique as to its old one.

### Defaults for the two presets

| | Business service | Brand ("Cupertino") |
|---|---|---|
| Sells mainly to households | M | D |
| Household spending on M | 20% | 2% |
| Household spending on D | 2% | 20% |
| a_DM: design per unit of M | 0.15 | 0.02 |
| a_MD: manufactured goods per unit of D | 0.05 | 0.6 |

The brand preset needs its own coefficients, because most of a branded product's cost is the manufacturing bought in. The plan's first draft gave one set for both presets.

Check values, from my calculation with the recipe:

| | Business service | Brand |
|---|---|---|
| Headcount in M | 13.3% | 10.7% |
| Headcount in D | 3.7% | 6.3% |
| Headcount in X | 83.0% | 83.0% |
| Manufacturing incumbents, share of people | 11.1% | 9.0% |
| Design incumbents, share of people | 3.1% | 5.2% |
| Income per head | 1.064 | 1.064 |

## Technology in the first build

- **Augmenting.** In the adopting firm, matched types' output per worker is multiplied by 1 + g · c_s. The default is g = 1.
- **Automating.** The adopting firm gets a second technique, where output per worker is A_m · m_s.
  - **Default:** matched general workers can mind machines (m = 1) and nobody else can (m = 0).
  - **Pure deskilling:** m = 1 for every type.
- **Levels.**
  - **A run** in Stage A is a list of technology levels, such as g or A_m from 1 to 10.
  - **Each level** is solved on its own, from the base year's population and attraction terms.

## Tests and expected values

The expected values are my derivations, for Bessen's setting: a small sector (0.1% of spending) and θ = 200.

- **Tolerance:** allow about 1 percentage point either way.
- **Checking θ:** if results at θ = 100 and θ = 200 differ by more than that, θ isn't yet large enough.

### Step 1

1. **The base year solves back to itself.**
   - Start the solver with the piece rate 20% too high, then 20% too low. Both runs should return a price of 1 and the base-year shares.
   - Do the same for each base year in step 2.
2. **Accounting.** Each of these should hold to within one part in a billion:
   - spending equals income
   - X's output equals the X consumed
   - each type's shares add up to 1
3. **Frozen demand.** Hold final demand at its base-year level. Employment should fall as 1 / A: by 50% when productivity doubles.
4. **Bessen's numbers.** Sweep the sector's productivity, A, from 1 to 10.

   | Curve | Productivity | Change in sector employment | Demand as a share of the ceiling |
   |---|---|---|---|
   | Young | 2 | +55.7% | 31.1% |
   | Young | 2.77 (the peak) | +63.2% | 45.1% |
   | Young | 8.86 | 0% (back to the start) | 88.6% |
   | Mature | 2 | −40.7% | 94.9% |

   Along the sweep, the slope of log employment against log productivity should equal ε − 1, with ε from the formula above.
5. **The closed-model effect (not a test).**
   - Repeat the sweep with the sector at 10% of spending, and compare.
   - The differences come from x moving with spending on the sector.
   - Report them: they show how much closing the model changes Bessen's result.

### Step 2

6. **Augmenting with no premium.**
   - **Setup:** two types, matched and unmatched. Each produces 1 in the sector and 1 in X, and both have the same base-year share in the sector. Use the young curve and g = 1.
   - **The key quantity:** write the number of matched people as a multiple, η, of the sector's base-year employment.
   - **Expected results:**

     | η | Regime | Price | Matched workers' pay | Sector employment | Unmatched workers in the sector |
     |---|---|---|---|---|---|
     | 0.4 | scarce | about 1 | about 2 | −40%, output unchanged | some stay |
     | 1 | in between | about 0.680 | about 1.36 | unchanged: all matched | none |
     | 2 | plentiful | about 0.5 | about 1 | +55.7% | none |

   - **Regime boundaries:** the regime should switch at η = 0.5 and at η ≈ 1.56.
7. **Augmenting with a premium.**
   - **Setup:** incumbents (r = 0.5, half of them matched) are the sector's whole base-year workforce. General workers produce 1 in the sector and in X, and can't use the technology.
   - **What to do:** sweep g from 0 to 5.
   - **Check:** unmatched incumbents earn the piece rate × 1.5, so they should leave the sector as the piece rate falls below 1 / 1.5 ≈ 0.667.
8. **Automating: the hand-loom case.**
   - **Setup:** incumbents (r = 1) are the sector's whole base-year workforce and can't mind machines. Matched general workers can. A_m = 8/3.
   - **Expected results:**
     - **Price.** It should fall to about 3/8 = 0.375, set by general minders earning their X pay.
     - **Incumbents' pay** in the old technique should fall from 2 to about 0.75, from twice their X pay to a quarter less. That's the pattern of the hand-loom weavers (see the plan, "Historical patterns to reproduce").
     - **Incumbents leave.** At θ = 200 they should leave the old technique.
     - **Sector output** should rise by a factor of about 4.35, which is Bessen's young curve at a price of 0.375.
9. **Pure deskilling.**
   - **Setup:** as in test 8, but incumbents can mind machines too.
   - **Expected result:** incumbents' pay on the machines should be about 1, the same as in X. Their premium is gone even though they can use the technology.
10. **No technology, no difference.** Matched and unmatched types of the same kind should get identical results.

### Steps 3 to 5, for later

11. **Prices through the chain.** With one firm per sector, prices should equal the piece rates built up through the supply chain: p′ = ω′ · B, where B is the Leontief inverse (`io-network-extension.md`).
12. **Identical firms** should split each market 50:50.
13. **Both presets** should reproduce the check values above.

## What the first test model should produce

- **A test report:** for each test, the expected and actual values, and pass or fail.
- **Tables,** with one row per technology level for each scenario:
  - prices and output
  - employment by type and job
  - pay by type
  - the change in real income by type, with the ledger's pay and price parts
- **Charts:**
  1. sector employment against productivity, for the young and mature curves, with the expected points from test 4 marked
  2. augmenting: price, matched workers' pay and sector employment against η
  3. automating: incumbents' pay, and employment on each technique, against A_m
- **Who holds the jobs:**
  - **For automation,** the share of machine jobs held by each type.
  - **For augmentation,** the share of the adopting firm's jobs held by each type, before and after.

## Scenarios as data

A scenario needs the fields below. Storing scenarios as data follows both earlier projects.

- **The setup:** one sector (steps 1 and 2), or one of the two presets.
- **For each sector:** its curve (young or mature) and its share of household spending.
- **The input coefficients.**
- **The worker types:**
  - how many of each, or the recipe's settings: the incumbents' share of the workforce, the share working at home, and the premium r
  - which types are matched, and which can mind machines
- **θ and σ_w.**
- **The technology:**
  - whether it augments or automates
  - which firms adopt it
  - the levels to sweep

## Not yet

These are in the plan but out of scope for the first test model. Leave room for them in the structure:

- **Stage B:** gradual movement, unemployment and idled workers
- **The rest of the world,** for people
- **Design intensity (σ_DM),** two tasks per job, and learning by doing
- **Profits,** owners and pass-through
- **A floor on pay**

## Things to report back to research

- **Failed tests,** with the numbers. The expected values may be wrong.
- **θ:** how large it has to be for the tests to pass.
- **The solver:** whether it converges reliably from cold starts.
- **Ambiguities:** anything in the plan or this note that turned out to be unclear.

## How sure to be

- **The equations** follow the plan and `bessen-inverted-u-model-brief.md`. The lognormal partial expectation and the logit form are standard.
- **The expected values** are my calculations, in Bessen's setting.
  - Test 7's threshold is a formula, not a result for a particular case.
  - Test 8's link to the hand-loom figures is an illustration, not a calibration.
- **The defaults and the recipe** are my choices. The check values follow from them by my arithmetic.

## Sources

- `two-sector-model-plan.md`, for the design and the reasons for it
- `bessen-inverted-u-model-brief.md`, for Bessen's demand model and the lognormal elasticity
- `io-network-extension.md`, for the two-number calibration and the Leontief inverse
- The hand-loom figures in test 8 come from the plan's sources: Acemoglu & Johnson (2024), through MIT's Stone Center summary.
