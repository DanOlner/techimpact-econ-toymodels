# Journal: building model sketches for ideas on the economic effect of technology (and how technologies differ)

**Dan-drafted document, human only.**

Entry at the top is the newest.

## Can we see how u-shaped demand could come about? How does it interact with demographics? 13.10.25

Two papers I think have complementary ideas worth testing together - let's see what model we can sketch to get at the picture. There's:

- Bessen 2018, "AI and jobs: the role of demand" and his 'inverted U pattern' - tech increases efficiency; it's cheaper so demand goes up enough that it actually increases employment; until the market saturates, and then the job losses begin. What's key to me here is the role of demand - something so often overlooked in productivity analyses (see https://github.com/DanOlner/modelling_demand and the Webber / Huaccha 2024 paper; [Claude Code summary](https://github.com/DanOlner/modelling_demand/blob/master/research/notes/webber-huaccha-2024-rethinking-productivity.md)).
- Schneider and Vipond 2023, "The past and future of work", a more historical take that contains this gem:

> While several papers find that new jobs were generated to replace those lost to new labour-saving technologies, access to these new employment opportunities was stratified by gender, age, education, and geographical location. Incumbents whose skills were rendered obsolete by new technologies may have had a limited ability to take up the new employment opportunities. [20]



With Claude, we've gathered model ideas across both of those papers, and then also pulled in any relevant tidbits from the modelling demand project and my PhD - throwing that in because of the regional and agglomeration angles.

So - a tonne of material to iterate on. But I want to start as simply as possible. Claude's suggestion of 5 sectors - let's simplify even further. This is where I'd like to try and start:

- Two sectors only, so we can get basic supply chain / value chain analysis. Those can be a manufacturing firm and a design firm (yes yes those wouldn't always be so separate, but I'm thinking of e.g. Cupertino design vs Chinese build). 

  - Two firms per sector for testing tech application differences? Probably we need at least four to be able to do the simplest exploration of demand shifts between products.

  - Have the manufacturing firm pay for the design work, and the design firm pay for the manufacturing output, deciding split of purchase based on price. It may be simple CES works here, or we may need something better able to capture different output levels.

- Representative worker/consumer agent minimal count for the dynamic. Let's lay out the dynamic I'm after before that. Enough agents to separate:

  - Existing skill level matched to tasks with given productivity.

  - Different skill dynamics to test:

    - Generic tech skill argument all the way from the Luddites: the "hand weaving vs power loom" framing where less skilled workers can produce more with machines, and skill level of hand loom workers can't keep up with output, so they lose that work. Note, that doesn't rule out a demand-led boom (first part of U-shape) meaning more power loom jobs.

    - That's the 'automate' of 'augment vs automate'. So we need an 'augment' option: tech available to workers that increases their output.

  - But coming back to 'existing skill level matched to tasks...' - S&V dynamics also need the automate/augment (especially augment) to interact differently depending on person skill type or level. Some workers are able to use an augment-potential tech to boost output; others don't have the skillset. That doesn't need to be so binary - keep open - but we can test with binary pairs for each type.

- A lot of questions about substitution/elasticity levels between products and workers, but again let's try and keep binary for now but open to gradients later. Stick to no geography - people have access to / visibility of all potential jobs and goods.

- This doesn't need to be  a partial model - keep it closed, except that we are fixing the number of firms. No entry/exit (of people either) 



Let's try and picture the dynamic/s I think might be present here, and what we're looking for.

- A new tech is introduced. We can test more than one type: the classic automate and some version of augment, with a match/non-match against existing agent skill.

- We have the two sectors, so e.g. if someone gets less work in the more productive place, they may end up working in the less productive firm (or giving more of their time to them). An interesting dynamic there: both the design and some labour output becomes cheaper, initially.

- While the concept of the U-shaped curve and its demand-led dynamic is easy enough to understand conceptually, I can't see in my mind entirely clearly that it would happen so easily. What I need to see that is to see the tradeoffs here, and how we're in different regimes for different parameter properties of the model. E.g. --> 

  - Is there a level at which tech productivity is high enough and tech / skill level match strong enough that job losses don't outweigh productivity gains?

  - In a closed model like this, how exactly are pure tech gains - exogenously inserted in this case, the tech just 'appears' - spread across extra firm output, worker wages and thus worker consumption, and who works where? Again, what are the different regimes if we search parameter space?
  
OK I'll stop there for now and see what Claude thinks about the above simplified plan, which is quite complex enough.

Oh, one more note for Claude reading this: design this as modular and object-oriented as possible, so that e.g. we can come back and plug in a different skill/tech interaction model. Though bearing in mind for this kind of simple model, tight coupling isn't always a bad thing or avoidable.
