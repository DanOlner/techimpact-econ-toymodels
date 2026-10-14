// Who works where: a logit (Roy sorting with a spread) over each type's choice set.
// Spec "Workers". Shares are computed in logs with log-sum-exp, so large θ doesn't overflow.

import type { Job, WorkerType } from "./types";

/** Pay per worker of a type in each job, given firm piece rates. NaN where the job isn't open. */
export function payByJob(type: WorkerType, jobs: Job[], omega: number[]): number[] {
  return jobs.map((job, j) => {
    const a = type.output[j] as number;
    if (!(a > 0) || type.logAttr[j] === -Infinity) return NaN;
    return job.firm < 0 ? a : (omega[job.firm] as number) * a;
  });
}

/** Shares of a type across jobs: b · w^θ, normalised, over the jobs in its choice set. */
export function logitShares(type: WorkerType, pay: number[], theta: number): number[] {
  const logW = pay.map((w, j) => (Number.isNaN(w) ? -Infinity : (type.logAttr[j] as number) + theta * Math.log(w)));
  const max = Math.max(...logW);
  if (max === -Infinity) throw new Error(`Type ${type.id} has no job it can do`);
  const e = logW.map((l) => (l === -Infinity ? 0 : Math.exp(l - max)));
  const total = e.reduce((s, v) => s + v, 0);
  return e.map((v) => v / total);
}

/** Back out log attraction terms that give the target shares at the given pay and θ. */
export function backOutLogAttr(targetShares: number[], pay: number[], theta: number): number[] {
  return targetShares.map((s, j) => {
    const w = pay[j] as number;
    if (!(s > 0) || Number.isNaN(w)) return -Infinity;
    return Math.log(s) - theta * Math.log(w);
  });
}
