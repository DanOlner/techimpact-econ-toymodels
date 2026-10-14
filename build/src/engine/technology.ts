// The technology plug-in: (type, job, technology) → output per worker. Spec "Technology in the
// first build". Swapping this module swaps the model of how skill and technology interact.

import type { Economy, Job, Technology, WorkerType } from "./types";

/** Output per worker of a type in a job, given its base output and the technology. */
export function techOutput(type: WorkerType, job: Job, firmId: string | null, baseOutput: number, tech: Technology): number {
  if (tech.kind === "none" || firmId === null || !tech.adopters.includes(firmId)) return baseOutput;
  switch (tech.kind) {
    case "productivity":
      return job.technique === "old" ? baseOutput * tech.A : baseOutput;
    case "augment":
      return job.technique === "old" && type.matched ? baseOutput * (1 + tech.g) : baseOutput;
    case "automate":
      return job.technique === "machine" ? tech.Am * (type.mindsMachines ? 1 : 0) : baseOutput;
  }
}

/** The economy with the technology applied. Population and attraction terms are the base year's. */
export function applyTechnology(econ: Economy, tech: Technology): Economy {
  const types = econ.types.map((t) => ({
    ...t,
    output: econ.jobs.map((job, j) => techOutput(t, job, job.firm >= 0 ? econ.firms[job.firm]!.id : null, t.output[j] as number, tech)),
  }));
  return { ...econ, types };
}
