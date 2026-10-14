# Findings for research: first test model, steps 1 and 2

The spec asks for failed tests, how large θ has to be, solver behaviour and ambiguities. This note covers the build to 14 October 2026: one sector, tests 1 to 10, in Stage A. The values come from `src/checks/spec-tests.ts` and `src/checks/diagnostics.ts`. `npx tsx scripts/print-checks.ts` prints them again.

## Summary

- **Step 1 passes everything.**
  - Tests 1 to 4 pass, including every Bessen number, the ε − 1 slope and the θ check.
  - The accounting identities hold to about 10⁻¹² or better, over every solve.
- **Step 2 fails 12 checks.** They're all in tests 6, 8 and 9 (including their θ checks) and in test 6's first regime boundary.
- **All 12 are θ, not the expected values.**
  - As θ rises, every failing value converges to the spec's expected value (table below).
  - A Python check (`scripts/crosscheck-expected.py`) reproduces every hand-worked value from the spec's equations alone.
  - So the derivations look right. θ = 200 is too small for them in step 2.
- **The solver** converged in every one of about 750 solves, and from start values between 0.001 and 1,000 in every test scenario.

## Why θ = 200 isn't large enough in step 2

- **In step 1, people barely need to move.** The one worker type only has to shift from 0.10% to about 0.16% of people in the sector. A pay gap of ln(1.6)/200 ≈ 0.2% does that, so the floor set by X is nearly hard.
- **In step 2, whole types have to move.**
  - **Test 6, η = 2.** Matched workers start with the 0.1% base share, so their attraction ratio to the sector is about 1/999. To put 74% of them in the sector, their pay there has to beat X by exp((ln 999 + ln 2.8) / 200) − 1 ≈ 4%. That premium keeps the price at 0.52, not 0.5, and demand lower: employment rises 47.7%, against 55.7%.
  - **Tests 8 and 9.** Only 0.34% of matched general workers are needed as minders, and their attraction to machines equals their attraction to X (a default, below). So minders earn exp(ln 0.0034 / 200) ≈ 0.972 of their X pay, not 1. The price is then 0.3645, not 0.375.
- **The general point.** With logit sorting, the premium needed to move a share of a type is roughly ln(odds needed ÷ base-year odds) / θ. In a sector at 0.1% of spending, the base-year odds are about 1/1000, so θ has to be several times ln(1000) ≈ 7 before the floor is close to hard. The spec's θ check (θ = 100 against 200) catches this: it fails for tests 6 and 8.

| θ | Test 6, η = 0.4: employment | Test 6, η = 2: price | Test 6, η = 2: employment | Test 8: price | Test 8: output × | Test 9: incumbents' pay on machines |
|---|---|---|---|---|---|---|
| expected | −40% | 0.500 | +55.7% | 0.375 | 4.35 | 1.000 |
| 100 | −37.0% | 0.540 | +40.4% | 0.354 | 4.60 | 0.945 |
| 200 | −38.4% | 0.520 | +47.7% | 0.364 | 4.47 | 0.972 |
| 500 | −39.3% | 0.508 | +52.4% | 0.371 | 4.40 | 0.989 |
| 1,000 | −39.6% | 0.504 | +54.0% | 0.373 | 4.37 | 0.994 |
| 2,000 | −39.8% | 0.502 | +54.8% | 0.374 | 4.36 | 0.997 |
| 5,000 | −39.9% | 0.501 | +55.3% | 0.375 | 4.35 | 0.999 |
| 20,000 | −39.9% | 0.500 | +55.6% | 0.375 | 4.35 | 1.000 |

- **About θ = 2,000** brings every value within the spec's tolerance. The test 6 employment change at η = 2 is the slowest to converge.
- **I haven't changed θ in the tests.** They still run at the spec's θ = 200, so the failures stay visible.

## Questions for research

1. **θ for the step 2 tests.** Should they run at θ ≈ 2,000 or more? Or should the expected values be restated for θ = 200?
2. **θ for exploratory runs.** The plan's default is θ = 5. At that value, the floor is very soft in a small sector, and the regime boundaries will blur a lot. We've decided to map θ (see "How to read θ" below). Is there a plausible range to use, or should θ be set relative to the sector's size?
3. **Attraction to new jobs.** Should a type's attraction to a job that doesn't exist in the base year be set differently? See default 2 below. It decides whether minders earn above or below their X pay at finite θ.

## How to read θ, and options for later (agreed with the user, 14 October 2026)

The user asked whether the model should move away from near-Bertrand switching, where tiny pay gaps move everyone, towards something smoother. They prefer people switching to people splitting their work, for realism.

### Decided: keep the logit, read as individuals switching

- **The reading.** Each person switches cleanly to the job that suits them best. People differ in how much they like each job, for reasons the model doesn't see (place, colleagues, the work itself). Adding up those discrete switches gives exactly the logit shares the model uses. This is the standard micro-foundation, as in Hsieh, Hurst, Jones & Klenow (2019).
- **What θ means.** It's the inverse of how much people differ.
  - **At θ = 5,** one person's idiosyncratic taste for a job has a standard deviation of about 26% of pay, π/(√6 · θ) in log pay. A 10% pay gap changes a job's attraction by a factor of only 1.1⁵ ≈ 1.6.
  - **At θ = 200,** the spread is under 1%, and a 1% pay gap changes attraction by a factor of about 7.
  - **As θ → ∞,** this becomes the Bertrand-style knife-edge in the labour market.
- **The plan's other reading,** that shares are how each person splits their time, uses the same equations. It suits augmentation better than the hand-loom case. Either reading can be used in reports.
- **"Smoother" means a lower θ.** What's given up is sharpness, not the structure: regime boundaries blur, X's floor on pay softens, and the hand-worked limits move further away.
- **θ will be mapped, not fixed.** The regime maps (milestone 7) will run at several values, for a start θ = 5, 20 and 200, to show how far conclusions depend on how readily people move. This replaces a single default of θ = 5 for exploration. We'd still welcome research's view on a plausible range.

### The goods-market equivalent

- **σ_w is the same dial for buyers.** The CES split between a sector's firms uses the same formula, with price in place of pay. As σ_w → ∞, the cheaper firm takes the whole market.
- **It isn't active in steps 1 and 2,** which have one firm per sector.
- **It isn't Bertrand competition proper.** Prices are at cost by assumption, so the Bertrand outcome is imposed, not competed to. A high σ_w only makes market shares jump. Price competition proper needs the later step with markups or pass-through.

### Options for later, if one θ proves too blunt

1. **Nested choice: whether to switch, then where.**
   - **The problem.** At present θ does two jobs: how attached people are to their sector or trade, and how sharply they choose between similar jobs, such as the old technique and the machines in the same firm.
   - **The fix.** A two-level (nested) logit splits them. A low θ governs leaving the trade; a high θ governs choosing within it. Hand-loom weavers could then be attached to weaving, yet switch quickly between looms.
   - **It may also ease the small-sector problem** in "Why θ = 200 isn't large enough". Moving a whole type into a sector at 0.1% of spending would no longer need the same θ that governs choosing a technique.
   - **Worth considering if** the maps show that a single θ can't give both sticky attachment and fast switching between techniques.
2. **Slow rather than blurry: Stage B.** The plan's Stage B moves people part-way towards their preferred job each period, at a speed κ_s that can differ by type. People can then choose sharply (high θ) but adjust slowly. That matches the weavers who stayed for decades and then went, and keeps the switching the user prefers.

## First regime maps: how much θ matters (14 October 2026)

The three one-sector maps were run at θ = 5, 20 and 200. They're in the report, with data for every cell. These are the findings that bear on the θ questions:

- **Map 1 (Bessen's hump).** Its shape holds at every θ, but its height doesn't. On the young curve at A ≈ 2, employment rises 41% at θ = 5 and 54% at θ = 200.
- **Map 2 (augmenting, test 6's setup).** θ decides whether the gain reaches consumers.
  - **θ = 200:** the hand-worked regimes appear, with their boundaries close to the derivations.
  - **θ = 20:** the plentiful regime never appears for g ≤ 3 and η ≤ 3.
  - **θ = 5:** the price hardly falls (0.98 at g = 1, η = 2), and matched workers keep the gain as pay of about twice their X pay.
  - So the plan's default θ = 5 would largely switch off Bessen's demand channel for augmenting technology in a small sector.
- **Map 3 (premium against matched share, at 10% of spending).** Unmatched incumbents lose almost everywhere, at every θ. They gain only where their premium is tiny (r = 0.05), and then by at most a few per cent.

These make question 2 (a plausible range for θ) more pressing. Conclusions about who gains from augmenting technology depend heavily on it.

## Defaults chosen where the spec is silent

1. **Test 7: general workers and the sector.** They produce 1 in the sector, but with no base-year share there, a zero attraction term takes the sector out of their choice set. It doesn't bite in test 7, because the piece rate only falls.
2. **Test 8: general workers and the old technique.** They can't do the old technique (output 0). Their attraction to the machine technique equals their attraction to X.
   - **Why.** The spec's rule gives a new technique the same attraction as the old one. That would give them zero attraction, so they could never mind machines.
   - **Its effect.** It's this default that puts minders' pay below X pay at finite θ (see above).
3. **"Start 20% too high or low" with bisection.** The bracket search starts from the given piece rate and widens outwards by factors of 2.
4. **Calibrating γ with several types.** Rescaling γ moves each type's x, so γ is found by iteration until base-year spending hits its share to 10⁻¹⁵.
5. **Tolerance.** "About 1 percentage point" is read as 0.01 absolute on changes and shares, and 1% relative on levels: prices, pay, productivity and output factors.
6. **Regime labels.** The regime of test 6 is read from who works in the adopting firm:
   - scarce while unmatched workers make at least 1% of its units
   - plentiful once matched workers earn within 5% of their X pay
   - in between otherwise

   These thresholds are reporting conventions. The boundaries they give at θ = 200 are η = 0.52 against 0.5, and η = 1.545 against 1.56.

## Test 5: the closed-model effect (reported)

Moving the sector from 0.1% to 10% of spending, on the young curve:

| | 0.1% share | 10% share |
|---|---|---|
| Change in employment at A = 2 | +55.2% | +45.1% |
| Productivity at the peak | 2.77 | 2.95 |
| Change in employment at the peak | +62.7% | +53.2% |
| Productivity where employment is back to the start | 8.86 | 8.86 |
| Change in employment, mature curve, A = 2 | −40.7% | −40.4% |

- **Smaller rise, later peak.** Closing the model damps the rise and delays the peak a little. That's because x rises as spending on the cheaper sector changes, which raises the cut-off P/x.
- **Same point of return.** Employment returns to its start at the same productivity at both sizes. When sector employment is back at its base level, spending on the sector is too (pay is held at 1). So x is back at its base value, and the cut-off is as in Bessen's setting. That's an exact result, not a coincidence of these numbers.

## Ambiguities found

- **The new-technique attraction rule.** Recipe step 10 gives a new technique the same attraction as the old one. That doesn't work for types with no attraction to the old technique (default 2).
- **General workers in tests 7 and 8.** "Incumbents are the whole base-year workforce" leaves open whether general workers can enter the sector at all (defaults 1 and 2).
- **What "about" means for the test 6 boundaries.** Locating them needs a rule for reading the regime at finite θ (default 6).
