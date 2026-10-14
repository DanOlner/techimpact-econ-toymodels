# Build plan: two-sector model, first test model

Written 14 October 2026. It turns `/notes/two-sector-first-build-spec.md` (the spec) into a build. Design reasons are in `/notes/two-sector-model-plan.md`.

## Scope

- **Spec steps 1 and 2, in Stage A.** That's one sector plus X, first with one worker type and then with four, with technology that augments or automates.
- **An engine for any number of sectors.** Sectors, firms per sector, techniques, worker types and choice sets are data. One sector is just the first scenario.
- **Preset base years, shown without a solve.** The base years of both presets (business service and brand) are built by the spec's recipe and shown in the first report, before the solver handles two sectors. Solving them is step 3.
- **Out of scope:** everything in the spec's "Not yet", and steps 3 to 5 beyond the static preset base years.

## Stack

- **Engine:** TypeScript with no runtime dependencies. It runs in both Node and the browser.
- **Tests:** Vitest.
- **Report page:** plain TypeScript, building the DOM and SVG charts directly, with no framework.
- **Build:** Vite, with `vite-plugin-singlefile`, builds one self-contained `docs/index.html`.
- **Live preview:** the page is served on `0.0.0.0:8000` while building.
- **Page checks:** Playwright 1.63.0, the version installed globally in the container, takes screenshots.
- **Cross-checks:** Python's standard library recomputes the expected values independently. It's used for checks only, not in the model.

## Layout

```
package.json, tsconfig.json, vite.config.ts
src/engine/
  normal.ts        Φ, φ, Φ⁻¹ (erfc to near machine precision; inverse refined by Newton steps)
  types.ts         Scenario, Economy, Solution types
  demand.ts        two-number curve calibration; household solve for x; demand, utility, elasticity
  technology.ts    plug-in: (type, job, level) → output per worker; augmenting, automating
  prices.ts        firm prices from piece rates (supply-chain loop), CES split, sector prices
  labour.ts        logit shares (log-sum-exp), pay, income, units supplied
  economy.ts       builds the economy from a scenario: jobs, choice sets, output table, attraction
  calibrate.ts     base years: step 1, step 2 test setups, preset recipe
  solve.ts         excess demand; bisection on log ω (one firm); n-dimensional solver later
  welfare.ts       equivalent variation by bisection; the gains ledger
  accounting.ts    identity checks
  sweep.ts         sweep any scenario setting by path: one dimension or a grid
  explain.ts       regime and marginal-producer classification; output labels and definitions
src/batch/         Node runner for parameter-space maps: grid → saved data → images
src/checks/        the spec's tests 1–10 and 13, as data: expected, actual, tolerance
src/report/        report page: test table, charts, scenario tables, preset base years
scenarios/         JSON scenario files
tests/             Vitest: runs src/checks, plus unit tests of each engine module
scripts/           serve and screenshot scripts; Python cross-check of expected values
docs/              built output only (index.html)
```

## Engine design

- **Jobs.** A job is either X or a (firm, technique) pair. Each firm has an "old" technique, and adopting firms can have a "machine" technique. Every job belongs to one firm, and every firm to one sector.
- **Output table.** A_{s,j} is the base output, changed by the technology plug-in at the run's level. A zero means the job isn't in the type's choice set.
- **Given piece rates ω (one per firm):**
  1. **Prices.** p_f = ω_f + Σ_k a_{k,sector(f)} · P_k, iterated to convergence (one sector: p = ω). Then the CES shares within each sector, and the sector price P_k as the share-weighted average.
  2. **Pay and sorting.** Pay is w_{s,j} = ω_f · A_{s,j}, or A_{s,X} in X. Shares come from logit on ln b + θ ln w, using log-sum-exp.
  3. **Households.** Income y_s, then x_s by bisection on [0, y_s], then demand d_{k,s}.
  4. **Units.** Required output comes from final demand plus intermediate use (Q = B · F), split to firms by CES share. Units supplied are summed over types and techniques.
  5. **Excess demand per firm:** required minus supplied.
- **Solver.**
  - **One firm:** bisection on ln ω, converging to a relative tolerance of 10⁻¹².
  - **The bracket** is searched outwards from a start value, widening by factors of 2. That's how the spec's "start 20% too high or low" is read.
  - **Two or more firms:** stubbed with an explicit error until step 3.
- **Calibration.**
  - **Demand curves** are set from (S, ε₀) at v̂₀ = P₀ / x̄₀.
  - **With more than one type,** γ is found by a one-dimensional solve so that base-year spending hits its share exactly, because rescaling γ moves x.
  - **Attraction terms** are backed out from the base-year shares at base-year pay and the run's θ.
- **Welfare.**
  - **Utility** follows the spec's formula.
  - **The equivalent variation** is the income that gives current utility at base-year prices, found by bisection.
  - **The ledger:** the pay part is Δy, and the price part is the equivalent variation minus Δy.
- **Accounting checks, every solve,** each to 10⁻⁹:
  - spending equals income
  - X's output equals the X consumed
  - each type's shares sum to 1
  - each firm's output equals the units demanded of it
- **Precision.** All values are 64-bit floats. Shares are kept in logs until the end.

### Hooks for later viewing and interaction

The model is built and tested first, and the viewing tools come later as a separate layer. These hooks go into the engine now, so that layer doesn't need changes to the core:

- **Switches for each mechanism.** They're scenario fields, so any mechanism can be turned off on its own:
  - freeze demand
  - hold x fixed (Bessen's setting)
  - strict sorting rather than the logit spread
  - premium on or off
  - income effects on or off
- **Explanatory outputs in every solution:**
  - the marginal producer: the job and type that set each firm's price
  - the regime: scarce, in between or plentiful
  - the demand elasticity and the share of the ceiling bought, by sector
  - each type's pay in each job against its pay in X
  - the ledger's parts
  - solver diagnostics: iterations, the bracket, the residual
- **Pure functions.** The engine has no global state, takes a scenario and returns a solution object. It can then run in Node scripts, in tests, and in a browser Web Worker.
- **Plain-data solutions.** Solution objects serialise to JSON, so batch runs can save them and pages can load them.
- **Parameter paths.** Any numeric scenario field can be swept by its path, such as `technology.g` or `types.matched.N`. One mechanism serves single sweeps, regime maps and the sensitivity ranking.
- **Text labels.** Every output field has a label, unit and short definition in one table, ready for hover definitions and plain-language explanations.

## Scenarios as data

Each scenario is a JSON file, in the spec's "Scenarios as data" fields:

- **Setup and sectors:** one sector or a preset; each sector's curve and spending share; the input coefficients.
- **Worker types,** given in one of two ways:
  - explicit: N, X output, home sector, premium, matched and minds-machines flags, and base-year shares
  - recipe settings, for the presets
- **θ and σ_w.**
- **Technology:**
  - its kind (augmenting, automating or none) and the adopting firms
  - its parameters: g, A_m, and the matched and minds-machines flags
- **The sweep:** which setting to vary and the values to run.

Each sweep value is solved on its own. If the swept setting changes the population (η), the base year is rebuilt for that value. Otherwise the base year's population and attraction terms are kept.

## Test setups

The spec leaves some of these open. Choices marked **(default)** are reported back to research.

| Test | Setup |
|---|---|
| 1 Base year solves back | Every base year in steps 1 and 2, solved from start values 1.2 and 0.8. Expect a price of 1 and the base-year shares to 10⁻⁹. |
| 2 Accounting | Checked at every solve in every test. |
| 3 Frozen demand | Step 1, final demand held at the base year, A = 2 and 4. Expect employment × A to be constant. |
| 4 Bessen's numbers | Step 1, 0.1% share, θ = 200, A from 1 to 10. Check the four table points and the ε − 1 slope (numerical derivative). Repeat at θ = 100 for the θ check. |
| 5 Closed-model effect | As test 4 at a 10% share. Reported, not tested. |
| 6 Augmenting, no premium | Population 1. Base-year sector employment L₀ = 0.1% of people. Matched N = η · L₀, unmatched the rest. Both have a 0.1% base share in the sector; g = 1. Sweep η from 0.1 to 3, including 0.4, 1 and 2, and locate the regime switches. |
| 7 Augmenting, premium | Incumbents (r = 0.5, half matched) sized to be the whole base-year workforce, with equal attraction terms. General workers produce 1 in the sector and X. **(default)** Their attraction to the sector is 0, so it's out of their choice set. That doesn't bite, because ω only falls here. Sweep g from 0 to 5. Check that unmatched incumbents leave as ω falls below 1/1.5. |
| 8 Hand-loom | Incumbents (r = 1) are the whole base-year workforce and can't mind machines. A_m = 8/3. **(default)** General workers can't do the old technique, and their attraction to the machine technique equals their attraction to X. Matched general workers can mind machines. Expect price 0.375, incumbents' pay 0.75, incumbents leaving, and output × 4.35. |
| 9 Pure deskilling | As test 8 with m = 1 for incumbents. Expect incumbents' pay on machines of about 1. |
| 10 No-technology symmetry | Matched and unmatched halves give identical results at technology level 0. |
| 13 Preset check values | The recipe's static base years: headcounts, incumbent shares and income per head, to the spec's rounding. |

- **Tolerance:** 1 percentage point, as the spec says, except where an exact identity is expected.
- **Records:** every check records its expected value, actual value, tolerance and pass or fail. Vitest asserts on the same records that the report shows, so the two can't disagree.

## Report page

1. **Test report:** a table of each test with expected, actual, tolerance and pass or fail.
2. **Chart 1:** sector employment against productivity, for the young and mature curves at a 0.1% share, with test 4's points marked and the 10% share overlaid.
3. **Chart 2:** augmenting. Price, matched workers' pay and sector employment against η, with the regime boundaries at 0.5 and 1.56.
4. **Chart 3:** automating. Incumbents' pay and employment on each technique against A_m, with and without pure deskilling.
5. **Scenario tables,** one row per level:
   - prices and output
   - employment by type and job
   - pay by type
   - equivalent variation with its pay and price parts
   - who holds the jobs (machine jobs by type; the adopting firm's jobs by type, before and after)
   - each table downloadable as CSV
6. **Preset base years:** for each preset, headcounts, flows between M and D, prices through the chain and incomes, against the spec's check values.

The `dataviz` skill is loaded before any chart code is written.

## Milestones

1. **Scaffold.**
   - packages and the Vite single-file build
   - `normal.ts`, with unit tests against values from Python and R
2. **Step 1.**
   - demand, labour, prices, solver, accounting and welfare for one sector and one type
   - tests 1 to 5, plus the Python cross-check
3. **Step 2.**
   - the technology plug-in, four types and the test setups above
   - tests 6 to 10
4. **Presets.**
   - recipe base years in `calibrate.ts`
   - test 13
5. **Report.**
   - the page, charts and tables, served on port 8000 and checked with Playwright screenshots
   - then built into `docs/index.html` for you to review and commit
6. **Findings for research.** `plan/findings-for-research.md` records:
   - failed tests, with the numbers
   - how large θ has to be
   - solver behaviour from cold starts
   - the defaults chosen above

7. **Parameter-space maps, run offline.**
   - **The runner.** A Node batch script solves a grid of scenarios, from a JSON map definition giving two parameter paths, their ranges and the outcomes to record.
   - **Saved results.** It saves every grid point (inputs, outcomes, regime, accounting residuals and solver diagnostics) as CSV and JSON under `maps/<name>/`.
   - **Images.** It draws static SVG images: a colour field for each outcome, with regime boundaries as contours and the hand-worked boundaries overlaid. The images are copied into `docs/` for the report.
   - **Not live.** Nothing runs in the browser. Grids can be refined and re-run offline, and the saved data can be reanalysed without re-solving.
   - **Points that don't converge** are marked on the map, not dropped.
   - **The first maps** are those possible with one sector, from the plan's "Regime maps to run":
     1. size of gain against the starting point on the demand curve → change in sector employment
     2. size of gain against matched share → price fall, matched pay premium and regime
     3. premium against matched share → unmatched incumbents' real income
   - **Later maps.** Maps 4 to 7 need later steps: a second sector with σ_DM, two firms, Stage B, and the rest of the world.
8. **Explorer, later.** A separate viewing layer on the tested engine:
   - sliders that re-solve one-sector scenarios live
   - a decomposition chart, adding one mechanism at a time from Bessen's own result
   - a sensitivity ranking of parameters for a chosen outcome
   - a plain-language panel generated from the explanatory outputs
   - gains-ledger bars, and who works where before and after
   - two scenarios side by side
   - hover definitions
   - the saved parameter-space maps, with points that open their equilibrium

   Its details will be planned once milestones 1 to 7 are done.

Each milestone ends with its tests passing, or with the failure written up rather than tuned away. As the spec asks, parameters aren't adjusted to force a match.

## Next, not now

Step 3 adds:

- the n-dimensional solver: Newton on ln ω with a numerical Jacobian, damping, and several start points
- the supply-chain price test (test 11)
- solved preset base years

Steps 4 and 5 then need only the CES split, which is already in `prices.ts`, plus scenario data.

## Build log

Newest entries go at the bottom. The **Results** subsections record what the model shows, not just what was built, so that observations aren't lost between sessions. Figures are from the scenarios in `scenarios/`, at θ = 200 unless stated.

### 14 October 2026: milestone 1, scaffold

- **Toolchain.**
  - TypeScript 7, Vite 8, `vite-plugin-singlefile` 2 and `tsx`.
  - Vitest 4 rather than 5, because Vitest 5 needs Node 22 and the container has Node 20.
  - `npm audit` flags three high-severity warnings, in `braces` via `micromatch` via `vite-plugin-singlefile`. They're build-time only and aren't in the published page. Left as they are.
- **`normal.ts`.**
  - Φ uses Cody's erfc. Φ⁻¹ starts from Acklam's approximation and is refined by two Halley steps.
  - Tested against R's `pnorm`, `dnorm` and `qnorm` (`scripts/make-normal-fixture.R`): agreement is about 10⁻¹⁴.
  - Far in the lower tail (x ≤ −12), rounding x/√2 gives a relative error of about x² times machine precision. The tolerance there scales with x²; probabilities that small never matter in this model.
- **Build.** The Vite single-file build works, and pages are checked with the container's Playwright 1.63.0 (`scripts/screenshot.mjs`, `scripts/shoot-sections.mjs`).

### 14 October 2026: milestones 2 and 3, steps 1 and 2

- **Built.** The engine modules in `src/engine/`, the five step-1 and step-2 scenarios in `scenarios/`, the checks as data in `src/checks/`, and an independent Python check of the expected values (`scripts/crosscheck-expected.py`).
- **Changes to the plan.**
  - Calibration lets several types share a `"balance"` or `"rest"` population size. Test 7's matched and unmatched incumbent halves need this.
  - The regime label is only computed when the technology augments.
  - Bug fixed: η = 1 was labelled "plentiful" because a NaN slipped into the matched-pay average from the empty machine job.
- **Results: step 1** passes everything.
  - Productivity 2 gives +55.2% against the spec's +55.7%; the gap is the soft floor at θ = 200.
  - The peak comes at 2.77 (+62.7%), and employment is back to its start at 8.86.
  - The mature curve gives −40.7%.
  - The ε − 1 slope rule holds within 0.006.
  - Frozen demand gives employment × A constant to about 10⁻¹².
- **Results: closing the model (test 5).** At 10% of spending on the young curve:
  - the rise at productivity 2 is +45.1% against +55.2%
  - the peak moves from 2.77 to 2.95, and is lower (+53.2% against +62.7%)
  - employment returns to its start at **exactly the same productivity, 8.86**, whatever the sector's size
  - **Why the return point doesn't move.** When sector employment is back at its base level, spending on the sector is too (pay is held at 1). So x is back at its base value, and the cut-off P/x is the same as in Bessen's setting. This is an exact property of this setup, not a coincidence.
- **Results: step 2** fails 12 checks, all in tests 6, 8 and 9.
  - **The cause is θ, not the expected values.** As θ rises, every failing value converges to the spec's, and all are within tolerance by about θ = 2,000.
  - **The mechanism.** With logit sorting, moving a share of a type needs a pay gap of about ln(odds needed ÷ base-year odds) / θ. A sector at 0.1% of spending has base-year odds of about 1/1000.
    - In step 1, the one type barely moves, so the gap is tiny.
    - In test 6, matched workers must move almost entirely into the sector, which needs a premium of about 4%.
    - In test 8, minders are needed in small numbers and are equally attracted to X, so they work for about 0.972 of their X pay.
  - **Full table and questions for research:** `plan/findings-for-research.md`.
- **Results: test 7.** Unmatched incumbents (r = 0.5) start leaving when the piece rate falls through 1/1.5, as the spec says. Half have left at g = 2.62, and all have gone by g = 5.
- **Results: test 10.** With no technology, matched and unmatched types give identical results to rounding, at θ = 5 and θ = 200.
- **Solver.** It converged in all of about 745 solves. From start values between 0.001 and 1,000, it reaches the same price within 10⁻¹³ in every test scenario, in at most 60 iterations.
- **Accounting identities** hold to about 10⁻¹² or better over every solve. The X balance is the loosest, at 1.2 × 10⁻¹².

### 14 October 2026: test-suite policy

- **Known findings.** The 12 step-2 failures are recorded in `src/checks/known-findings.ts`, with the value each failed with.
- **How the suite treats them.** It passes while each still fails with its recorded value (to 10⁻⁴). It fails if any of them changes, or if anything else breaks, so new bugs aren't hidden.
- **The report page still shows them as failures against the spec,** marked "Known finding".
- **When to remove them:** once research has answered the questions on θ.

### 14 October 2026: milestone 4, preset base years

- **Built.** `src/engine/presets.ts` builds both presets by the spec's recipe, with no solve. `scenarios/preset-*.json` hold the presets as data.
- **Results.**
  - **Test 13 passes:** both presets match every check value, and their identities hold. Prices built up through the chain, ω · B, come to 1; output equals final plus intermediate use; total pay equals income.
  - **The same totals in both presets.** Households spend 22% on M and D in both, and with no profits all of it is pay. So total sector headcount is the same, 17.0%, and income per head is the same, 1.0638.
  - **The brand preset's design piece rate is only 0.40,** because 60% of a branded product's cost is bought-in manufacturing. So its design workers produce 2.5 (general) to 3.75 (incumbents) units each, to earn pay of 1 and 1.5.
  - **Leontief inverses.** Business service: B = [[1.0076, 0.0504], [0.1511, 1.0076]]. Brand: B = [[1.0121, 0.6073], [0.0202, 1.0121]].

### 14 October 2026: milestone 5, report page

- **Built.** `src/report/` builds to `docs/index.html`, one self-contained file of about 63 kB. It computes the model in the browser in about 2 seconds. It has:
  - summary figures
  - the test report
  - the θ study and the cold-start results
  - charts 1 to 3
  - the preset base years
  - the scenario tables, each downloadable as CSV
- **Charts.** They're hand-written SVG, following the dataviz skill:
  - the palette's first three slots, validated in light and dark mode
  - a legend, hover and keyboard tooltips, and a table view on every chart
  - dark mode
  - a compact size for small multiples, so text stays legible
- **Checked** with Playwright screenshots of every section, in light and dark mode, with no console errors.
- **Served** with `npx vite preview` on port 8000.
- **Results: the hand-loom case** (scenario `step2-handloom`; incumbents with r = 1 earn 2 in the base year):
  - **Price and incumbents' pay fall from the first machine.** Minders set the price as soon as A_m > 1. At A_m = 1.5 the price is already 0.65, and incumbents still in the old technique earn 1.29, down from 2.
  - **Machines take over employment only above A_m ≈ 2.** Below that, incumbents working for their X pay of 1 (a price of 0.5) are still cheaper per unit than minders. 98% of incumbents are still in the old technique at A_m = 1.9, and almost none by A_m = 2.
  - **Pure deskilling doesn't help incumbents at all.** Their change in real income is the same whether or not they can mind machines: −49.9% of base income at A_m = 8/3, and −49.8% at A_m = 10.
    - **Why.** The machines pay minders their X pay, or slightly less at θ = 200, so being able to mind them gives incumbents nothing they can't get in X. Under deskilling only about 0.3% of incumbents take machine jobs.
    - **What it confirms.** The premium came from the old skill, and the new technique doesn't value it. This is the spec's test 9 point, now shown in real income as well as in pay.
  - **Cheaper goods barely offset the loss.** The price part of incumbents' real income is only +0.1% to +0.3% of base income across A_m = 1.5 to 10, because the sector is 0.1% of spending. The loss is almost all pay.
  - **Matched general workers, the minders, gain almost nothing:** about +0.1% to +0.3% of income, all as consumers. This is the plan's "the new jobs go to general workers, who gain only as consumers".
- **Results: augmenting (chart 2).** At θ = 200, the regime boundaries read from the model are η = 0.52 and 1.545, against the hand-worked 0.5 and 1.56. At θ = 2,000 the curves sit on the hand-worked points.
- **Next:**
  - milestone 6: send `plan/findings-for-research.md` to research
  - milestone 7: the offline regime maps, which waits for research's answer on θ, since θ = 5 will blur the regime boundaries heavily

### 14 October 2026: decision on how to read θ

- **Bertrand question.** The user asked whether the model has a Bertrand-style dynamic. It does, as a limit:
  - θ → ∞ for workers choosing jobs, with X acting as a perfectly elastic labour supply at its pay
  - σ_w → ∞ for buyers choosing firms, which is inactive until step 4
  - prices are at cost by assumption, so Bertrand's price outcome is imposed, not competed to
- **Decided.**
  - **Keep the logit,** read as individuals switching cleanly, with differing tastes. θ is then the inverse of how much people differ: at θ = 5, a taste spread of about 26% of pay; at θ = 200, under 1%.
  - **The time-splitting reading** stays available for reports.
  - **The regime maps will run at several θ** (start with 5, 20 and 200), rather than a single default of θ = 5.
- **Options noted for research, not built:**
  - a nested logit, to separate attachment to a trade (low θ) from the choice of technique within it (high θ)
  - Stage B's speed of movement κ, for slow but sharp switching
- **The θ for the step-2 tests is still research's call.** The known findings stay as they are.
- **Written into `plan/findings-for-research.md`,** section "How to read θ, and options for later".

### 14 October 2026: milestone 7, parameter-space maps (one sector)

- **Built.**
  - `src/batch/maps.ts`: three map definitions, each with its hand-worked boundaries.
  - `src/batch/run-maps.ts`: the runner.
  - `src/batch/heatmap-svg.ts`: static SVG panels at θ = 5, 20 and 200, sharing a colour scale.
  - `src/batch/colour.ts`: OKLab ramps from the palette. The regime map's ordinal blues pass the validator with `--ordinal`.
- **How to run.** `npx tsx src/batch/run-maps.ts [id]` writes `maps/<id>/grid.csv`, `meta.json` and the SVGs. It copies the images, CSV and metadata to `src/report/public/maps/`, which the build publishes as `docs/maps/`. The report has a "Regime maps" section.
- **Changes to the plan.**
  - Maps are defined in TypeScript, not JSON. Two of their axes are derived settings: a point on the demand curve, and the matched share of incumbents.
  - "Balance" population types can now carry weights (`balanceWeight`).
- **Runs.** About 12,100 solves (4,551, 4,797 and 2,790), 0 failures. The worst accounting gap is 8 × 10⁻¹². It takes about 25 s in all.
- **Size.** `docs/` is now about 4 MB, almost all of it the three CSVs.
- **Results: map 1, size of gain against starting point** (0.1% of spending, one type).
  - **The model's zero-change contour sits on Bessen's "back to the start" line at every θ.** The hump's shape doesn't depend on θ.
  - **Its height does.** On the young starting point at A ≈ 2, employment rises 41% at θ = 5 and 54% at θ = 200. On the mature starting point, it falls 39% either way.
  - **Why.** At low θ, people need a higher pay premium to move into the sector, so the price falls less than productivity rises. This corrects my first reading in chat, that map 1 barely depends on θ.
- **Results: map 2, size of gain against matched share** (test 6's setup). θ changes the picture completely.
  - **θ = 200.** The model follows both hand-worked boundaries closely. At g = 1 and η = 2: price 0.52 and premium 4%, which is plentiful.
  - **θ = 20.** The in-between regime appears, but plentiful never does in this range. At g = 1 and η = 2, the price is 0.70 and matched workers still earn 40% above their X pay.
  - **θ = 5.** Every cell reads as "scarce": some unmatched workers always stay. The gain stays with matched workers as pay, about double their X pay, and the price hardly falls (0.98 at g = 1, η = 2; 0.70 even at g = 3, η = 3).
  - **What this means.** How readily people move decides whether a technology's gain reaches consumers through prices at all. If matched people are attached to other work (low θ), Bessen's demand channel barely switches on. This is the plan's "may not work as hoped" point 1, now shown.
- **Results: map 3, premium against matched share** (test 7's setup at 10% of spending, g = 1).
  - **Unmatched incumbents lose almost everywhere,** by up to 29–32% of base income.
    - **At θ = 200** they lose in every cell.
    - **At θ = 5 and 20** they gain only where their premium is tiny (r = 0.05) and most incumbents are matched: at most +0.8% and +3.6%.
    - **Example:** at r = 0.5 and h = 0.5, unmatched incumbents lose about 18% while matched incumbents gain about 66–71%.
  - **What this means.** This is the plan's "concentrated losses outweigh spread-out gains", now mapped. Even with the sector at 10% of spending, cheaper goods don't make up for a lost premium unless the premium is very small.
  - **The loss grows with the matched share.** More matched incumbents means a bigger price fall, and so a bigger cut in unmatched incumbents' pay.
- **Next.**
  - **Maps 4 to 7** need later steps: σ_DM and a second sector, two firms, Stage B, and the rest of the world.
  - **Milestone 8, the explorer,** is planned once research has responded.
  - **Step 3**, the two-sector solver, is the next modelling step.

### 14 October 2026: site layout, one frozen page per stage

- **Requested by the user.** Each completed stage stays available on the site rather than being overwritten.
- **Layout.**
  - Each stage has its own folder, `docs/<stage id>/`.
  - `docs/index.html` is a landing page listing every stage.
  - Stages and their text are listed in `site-stages.json`.
- **Building.**
  - `npm run build` (`scripts/build-site.mjs`) builds the first stage that isn't frozen, and rewrites the landing page.
  - A frozen stage that's already published is refused unless `--force` is passed. Use that only to fix a broken page, and record it here.
  - A plain `vite build` now goes to `build-preview/` (gitignored), so it can't overwrite a stage.
- **What a stage page contains.** Each is the single self-contained page with its own copy of the engine, plus its maps. A frozen page keeps working however the code changes later.
- **Preview.** `npm run preview` serves all of `docs/` on port 8000 with Python's static server.
- **Stage 1** (steps 1–2, presets' base years, maps 1–3) is published at `docs/stage-1/` and frozen.
- **Stage 2** (two sectors and the supply chain) is listed as not yet published. It will build into `docs/stage-2/`.
