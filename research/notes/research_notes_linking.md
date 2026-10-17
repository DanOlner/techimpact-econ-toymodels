# Linking research notes with [[wikilinks]]

Written 12 October 2026, against Claude Code 2.1.289 and dual-project template 1.12. It asks three things: is linking Markdown notes with Obsidian-style `[[square brackets]]` already established for Claude Code, what are the options, and is there something to build?

## Short answer

- **Established: yes.** `[[wikilinks]]` are the usual way to link Markdown notes. Obsidian, Logseq, Foam, Basic Memory and others all use them. Since Andrej Karpathy's "LLM Knowledge Bases" post on 3 April 2026, "an LLM keeps an interlinked Markdown wiki" has become a named and widely copied pattern. Claude Code's own auto-memory already links its notes this way (see below).
- **Claude Code itself has no wikilink support.** Nothing in Claude Code resolves, autocompletes or checks `[[links]]`. Claude reads them as plain text and finds the target with Glob or Grep. At tens or low hundreds of notes that works.
- **There are plenty of tools, but none fit research as it stands.** Almost every tool reaches Claude through an MCP server, a skill, a plugin or a shell, and research's settings deny all four (`mcp__*`, `Skill`, `Bash`, and plugins and language servers aren't in its tool list). Research's tools are Read, Grep, Glob, Edit, Write, WebSearch and WebFetch.
- **Something to build: yes, but small.** The gap is a host-side link indexer, run from research's SessionStart hook in the same way as `convert-docs`. It would pair with a short linking convention in `research/CLAUDE.md`. The real open question is links *between* projects, because each research session is deliberately unable to read outside its own folder.

## What "linking" has to do

It helps to split the job into parts, because tools cover different parts:

| Part | Meaning | Can research's Claude do it today? |
|---|---|---|
| 1. Syntax | How a link is written: `[[topic-name]]`, `[[folder/topic]]`, `[[topic#Heading]]` | Yes, if told the convention |
| 2. Resolution | Finding the file a link points to | Yes, with Glob |
| 3. Backlinks | "What links here?" | Yes, with Grep, but it's one search per note, every time |
| 4. Health | Dangling links, orphan notes, name clashes, links broken by a rename | Only by hand, and it rarely notices |
| 5. Discovery | Suggesting links nobody wrote, by meaning (embeddings) or by an LLM reading pass | An LLM pass, yes; embeddings, no |
| 6. Viewing | A graph and backlinks pane for you | Not Claude's job; an editor does it |

"Semantic links" can mean two things here. The first is links whose *relationship* is stated: "this supports that", "this contradicts that". That's parts 1 to 4. The second is links *discovered* by similarity of meaning. That's part 5. The first is cheap, and the second is where most of the tooling effort goes.

## Where it's already done

### Claude Code's own auto-memory

The auto-memory instructions Claude Code gives Claude (seen in this session) say: link related memories with `[[name]]`, where `name` is the other memory's `name:` slug, and a link to a memory that doesn't exist yet is fine because it "marks something worth writing later". This project's memory folder, `~/.claude/projects/-home-dano-claude-testfolder/memory/`, has 15 such links across 7 files.

What that shows:

- Nothing resolves or checks the links. `[[dual-project-template]]` is cited 6 times, and no memory with that name exists in any project. No tool has flagged it.
- The links can't cross projects, because memory folders are per project.
- The public docs ([How Claude remembers your project](https://code.claude.com/docs/en/memory)) describe the `MEMORY.md` index and topic files, but don't mention wikilinks. The convention lives only in the prompt.
- The model is expected to handle wikilinks with no tooling at all. That's evidence the convention-only approach (option A below) works.

### The "LLM wiki" pattern

[Karpathy's post](https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an) and the follow-up gist describe three layers:

- `raw/`: sources that are never edited.
- `wiki/`: pages the LLM writes, with summaries, concept pages and links between them.
- A `CLAUDE.md` schema.

Two special files sit in the wiki. `index.md` is the catalogue and first stop, and `log.md` is an append-only log. There are three operations: **ingest** a source, **query** the wiki, and **lint** it for contradictions, orphans, gaps and stale claims. His single-topic wiki reached about 100 articles and 400,000 words with no embeddings or vector search, just index files and links. See also the [starmorph guide](https://blog.starmorph.com/blog/karpathy-llm-wiki-knowledge-base-guide) and [MindStudio's Obsidian + Claude Code walkthrough](https://www.mindstudio.ai/blog/how-to-build-llm-wiki-knowledge-base-obsidian-claude-code).

**This maps almost one-to-one onto the template already:**

| LLM wiki | Template |
|---|---|
| `raw/` | `research/sources/` (plus `convert-docs` copies) |
| `wiki/` | `research/notes/` |
| `CLAUDE.md` schema | `research/CLAUDE.md`, which research can now edit (1.11) |
| `index.md`, `log.md`, lint | **missing** |

### Obsidian

- Obsidian writes wikilinks by default. `[[folder/name]]` points into a folder, `[[name#Heading]]` to a heading and `[[name#^id]]` to a block. Links in frontmatter properties must be quoted: `related: "[[other-note]]"`. ([Internal links](https://obsidian.md/help/links), [Properties](https://obsidian.md/help/properties).)
- **[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)** comes from Obsidian's CEO (January 2026). It's a set of Agent Skills teaching Claude Obsidian Markdown (wikilinks, embeds, callouts, properties), Bases, JSON Canvas, the Obsidian CLI and web clipping. You install it by copying it into the vault's `.claude/` folder. It's widely used, but mostly it's a few Markdown files of instructions.
- **Obsidian CLI**, new in [1.12.4 (27 February 2026)](https://obsidian.md/changelog/2026-02-27-desktop-v1.12.4/): it drives a running Obsidian from the terminal, for scripts and agents with a shell.
- **[Smart Connections](https://docsearch.algolia.com/mcp/docs/repo/brianpetro/obsidian-smart-connections)** is an Obsidian plugin that makes local embeddings (bge-micro-v2 by default) and shows related notes. **[smart-connections-mcp](https://github.com/msdanyg/smart-connections-mcp)** exposes those embeddings to Claude as "notes similar to this one". This is the main ready-made answer to "discovery".
- Write-ups of people running Claude Code inside a vault: [Kenneth Reitz](https://kennethreitz.org/essays/2026-03-06-obsidian_vaults_and_claude_code), [az9713/claude-code-obsidian](https://github.com/az9713/claude-code-obsidian).

### Basic Memory

[Basic Memory](https://github.com/basicmachines-co/basic-memory) is an MCP server under AGPL-3.0. It keeps notes as plain Markdown, indexes them in SQLite, and adds optional local vector search with FastEmbed. Its format is the closest ready-made thing to typed semantic links:

```markdown
## Observations
- [finding] Mid-year estimates revised down for 2023
- [question] Does the revision affect the regional series?

## Relations
- contradicts [[ons-2022-baseline]]
- "is evidence for" [[migration-undercount]]
- [[population-methods]]          (a bare link counts as links_to)
```

Its tools include `build_context` (walks the graph from a `memory://` URL), `search_notes` and `write_note`. The server writes the files itself.

### Editors and language servers

- **[Foam](https://docsearch.algolia.com/mcp/docs/repo/foambubble/foam)** is a VS Code extension with wikilinks, autocomplete, a backlinks pane, a graph view, "placeholders" (dangling links shown differently) and orphan detection. It's the obvious viewer if you'd rather stay in VS Code than add Obsidian.
- **Marksman** is a Markdown language server. Claude Code plugins wrap it, for example [`marksman-lsp`](https://claudemarketplaces.com/plugins/kzmshx-claude-plugins/marksman-lsp), giving Claude go-to-definition, find-references, and diagnostics for broken `[[wiki-links]]`. That covers parts 2 to 4 for Claude, but it needs plugins and a running server.

**None of these is installed on this machine.** I checked for `obsidian`, `marksman`, `zk`, `basic-memory` and `uvx`, and found none; `rg` is present.

## How the options fit the research profile

| Option | Parts covered | Usable by research today? | Why |
|---|---|---|---|
| **A. Convention in `research/CLAUDE.md`** | 1–3 | **Yes** | Uses only Read, Grep, Glob and Edit |
| obsidian-skills | 1 | No as a skill (`Skill` is denied) | The useful part is short enough to write into CLAUDE.md, which is option A |
| **B. Obsidian or Foam as your viewer** | 3, 4, 6 for you | **Yes, on your side** | See the config folder risk below |
| Marksman LSP plugin | 2–4 for Claude | No | Plugins and language servers aren't in research's tool list, and it runs a program as you |
| Basic Memory MCP | 2–5 | No | `mcp__*` is denied; it's also a server running as you that writes files |
| Smart Connections MCP | 5 | No | `mcp__*` is denied; it also needs the Obsidian plugin |
| Obsidian CLI | 3, 4 | No | Needs a shell |
| Any of the above in the **build container** | 2–5 | Not research, but build | Build sees notes read-only at `/notes`, so it can index and report but not edit links. A build-side report is possible, but it puts a Claude-run step between research and its own index |
| **C. Host-side link indexer (to build)** | 2–4 | **Yes**, via a file research reads | See "What to build" |

## Security points specific to this setup

1. **A viewer's config folder inside `notes/`.** If you open `research/notes/` itself as an Obsidian vault, Obsidian keeps its config in `notes/.obsidian/`, and research can write there. That folder holds the list of enabled community plugins (`community-plugins.json`) and their code (`plugins/<id>/main.js`). Community plugins run with Obsidian's full access ([Plugin security](https://obsidian.md/help/plugin-security)). If that vault ever had Restricted mode off, a misled research agent could add code that runs as you the next time Obsidian opens. VS Code's `.vscode/` folder (settings, tasks) carries a similar risk if you open `notes/` as a VS Code folder. Fixes, in the same spirit as the CLAUDE.md guard:
   - Open **`research/`** as the vault or folder, not `notes/`. Then `.obsidian/` sits where research can't write: it may edit only `notes/**` and `CLAUDE.md`.
   - Add `Edit(/notes/**/.obsidian/**)` and `Edit(/notes/**/.vscode/**)` to research's deny list anyway, with `check.py` tests.
   - Gitignore `.obsidian/workspace*`, which changes every time you open the vault.

   I haven't tested any of this.
2. **Links don't bypass Read denies, and that should stay true.** A `[[link]]` is only text, so Claude follows it with the Read tool, which checks permissions. That's unlike `@path` imports (see `claude-md-imports-bypass-reads` in memory). Anything that *inlines* linked content into research's context at launch, such as a SessionStart hook that prints notes as `additionalContext`, would be an import by another name. An indexer should write a file that Claude then reads, not push content into the context.
3. **Symlinks.** `testfolder/research/notes/link.md` and `notes/linkdir` still point outside the project, left from the earlier read tests. Any indexer must refuse to follow symlinks, and must resolve link targets only inside the notes folder. Otherwise `[[link]]` or `[[../../build/x]]` becomes a way to read files outside it.
4. **Notes are untrusted text.** Research writes notes from web pages, and the build agent reads them with permission checks skipped. Link text and note descriptions can carry injected instructions like any other note content. An index should carry file names, paths and short capped descriptions, and nothing more. This matters most for cross-project links, where one project's notes would reach another project's agents.

## Links across folders

**Within one project** this is easy.

- `[[name]]` for a unique name. Obsidian resolves the shortest unambiguous path.
- `[[subfolder/name]]` when names clash.
- `[[report.pdf]]` or `[[report.pdf.txt]]` to point into `sources/`, with the extension, since they aren't `.md`.

The convention should say which form to use, and the indexer should report clashes.

**Across projects** is the hard part, and it's hard on purpose:

- Research has `blockReadsOutsideWorkingDirectories`, so Claude can't follow a link into another project.
- Memory folders are per project.
- Obsidian's link docs describe links within one vault only.

The choices:

1. **Qualified links as plain references.** For example, write `[[ai-econ-theory:notes/labour-share]]`. Claude records that the idea exists elsewhere, and you follow it. Cheap, and it keeps the boundary. The indexer can still check the target exists, because it runs on the host.
2. **A hub project.** A separate research project whose notes are mostly cross-references. It needs some way to see other projects' notes, so it pulls in one of the options below.
3. **A host-built "atlas".** The indexer reads the notes of projects you list in a config file and writes their names and one-line descriptions into each project, read-only. You choose which pairs of projects can see each other. This deliberately breaks the per-project boundary for titles only, so it should be opt-in.
4. **`--add-dir` on another project's `research/`.** I don't recommend it. It widens what research can read, and how the `Edit(/notes/**)` allow rule and `dontAsk` mode behave with a second directory would need testing first.

## What to build

In order, stopping wherever it's good enough.

**A. Convention only (no code).** Add a short "Links" section to `research/CLAUDE.md`, a paraphrase of the relevant part of obsidian-skills:

- One idea per note. Name files in lowercase with hyphens.
- Link with `[[file-name]]`, without `.md`. Use `[[folder/file-name]]` only when two names clash.
- Say in the sentence how the notes relate ("contradicts", "is evidence for", "extends"), or in Basic Memory's `- relation [[target]]` style under a `## Relations` heading. Pick one style.
- Before starting a new note, Grep `notes/` for an existing one on the idea. Check what links to a note before rewriting it.
- A link to a note that doesn't exist yet is fine; it's a to-do.

None of this uses an at sign, so research-gate won't refuse it.

**B. A viewer for you.** Obsidian with Restricted mode on, or Foam in VS Code, opened on `research/` (security point 1). This gives you the graph and backlinks without changing anything Claude can do.

**C. `link-index`, a host-side indexer.** This is the part that doesn't exist off the shelf for this setup. It would be a Python script using only the standard library, alongside `convert-docs`, run by research's SessionStart hook after it, or as a `convert-docs` subcommand. It would read `research/notes/` and write `research/index/links.md`: outside `notes/`, so research can read it but not edit it, and regenerated every session. Contents:

- Each note: title, the `description:` line if there is one, links out, and links in (backlinks).
- **Dangling links**: targets with no file.
- **Orphans**: notes nothing links to and that link to nothing.
- **Clashes**: two files with the same name.
- **Rejected links**: through symlinks or outside `notes/`.

That's Karpathy's `index.md` plus the mechanical half of his "lint", done by a script instead of by Claude. Claude then reads one file instead of grepping for every backlink. There's no external program to jail, unlike pandoc, but it still parses text research wrote. So: no symlink following, size caps, frontmatter parsed by hand rather than with a YAML library, and names written out as plain text. `check.py` tests would cover:

- a dangling link is reported;
- a symlinked note isn't read;
- research can't edit the index;
- an `@` or instruction text in a note name comes out inert.

Optional extras:

- A **PostToolUse** check in `research-gate` that, after research writes a note, says which of its links don't resolve, so Claude fixes or notes them straight away.
- A `log.md`-style record, which `--convos` partly covers already.

**D. Discovery (optional, later).** At this scale, an occasional "lint" session asking research's Claude to read the index and propose missing links is probably enough. Karpathy managed 400,000 words without embeddings. Embeddings, as in Smart Connections or Basic Memory, would mean a model on the host or in the container, which is a bigger change. They're worth it only if the LLM pass misses things.

**E. Cross-project links.** Start with qualified plain references (option 1 above), which need nothing but the convention plus the indexer's check. Decide on an atlas only once C has been used for a while.

## Questions for you

1. Does "across different folders" mean subfolders and `sources/` within one project, or across projects such as `ai-econ-theory` and the next one? The design differs a lot between the two.
2. Viewer: Obsidian or Foam in VS Code?
3. Relations: in prose ("this contradicts [[x]]"), or as a `## Relations` list Basic Memory could read later?

## Sources

- Claude Code docs, [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- VentureBeat, [Karpathy shares LLM knowledge base architecture](https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an); [starmorph guide](https://blog.starmorph.com/blog/karpathy-llm-wiki-knowledge-base-guide); [MindStudio walkthrough](https://www.mindstudio.ai/blog/how-to-build-llm-wiki-knowledge-base-obsidian-claude-code)
- Obsidian help: [Internal links](https://obsidian.md/help/links), [Properties](https://obsidian.md/help/properties), [Plugin security](https://obsidian.md/help/plugin-security); [1.12.4 changelog](https://obsidian.md/changelog/2026-02-27-desktop-v1.12.4/)
- [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)
- [Basic Memory](https://github.com/basicmachines-co/basic-memory)
- [Smart Connections](https://docsearch.algolia.com/mcp/docs/repo/brianpetro/obsidian-smart-connections), [smart-connections-mcp](https://github.com/msdanyg/smart-connections-mcp)
- [Foam](https://docsearch.algolia.com/mcp/docs/repo/foambubble/foam)
- [marksman-lsp plugin for Claude Code](https://claudemarketplaces.com/plugins/kzmshx-claude-plugins/marksman-lsp)
- [Kenneth Reitz, Obsidian vaults and Claude Code](https://kennethreitz.org/essays/2026-03-06-obsidian_vaults_and_claude_code); [az9713/claude-code-obsidian](https://github.com/az9713/claude-code-obsidian)
- Local checks on 12 October 2026: research settings in `~/claude/templates/dual-project/project/research/.claude/settings.json`, the wikilinks in this project's memory folder, and the symlinks in `testfolder/research/notes/`.
