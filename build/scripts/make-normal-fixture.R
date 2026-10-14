# Reference values for src/engine/normal.ts, from R's pnorm, dnorm and qnorm.
# Run: Rscript scripts/make-normal-fixture.R > tests/fixtures/normal-reference.json
xs <- c(-38, -30, -20, -12, -8.5, -6, -5, -4.2, -4, -3.3, -2.5, -1.96, -1.2816, -1, -0.6,
        -0.46875, -0.3, -1e-9, 0, 1e-9, 0.2, 0.46875, 0.5, 0.8416, 1, 1.6449, 2, 3, 4, 4.5,
        6, 8, 10)
ps <- c(1e-300, 1e-100, 1e-20, 1e-10, 1e-6, 1e-4, 0.001, 0.01, 0.02425, 0.025, 0.1, 0.2, 0.3,
        0.5, 0.7, 0.8, 0.9, 0.95, 0.97575, 0.99, 0.999, 0.999999)
f <- function(v) formatC(v, digits = 17, format = "g")
cat("{\n")
cat('  "cdf": [', paste0("[", f(xs), ", ", f(pnorm(xs)), "]", collapse = ", "), "],\n")
cat('  "pdf": [', paste0("[", f(xs), ", ", f(dnorm(xs)), "]", collapse = ", "), "],\n")
cat('  "inv": [', paste0("[", f(ps), ", ", f(qnorm(ps)), "]", collapse = ", "), "]\n")
cat("}\n")
