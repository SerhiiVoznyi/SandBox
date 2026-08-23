# actions/checkout@v4actions/checkout@v4AI-Driven Story Planning Pipeline — Design

Status: proposed
Owner: TBD
Last updated: 2026-08-23
Revision: 2 — the trigger path moves off AWS (§5, §21) and the Cloud Agents API is evaluated as an
alternative substrate (§22).

## 1. Goal

When a Jira story is moved into **In Progress** on the board, and it carries the label
`ready-for-development` and a non-empty `repository` custom field, automatically:

1. create a branch in the target repository named `ai/{jira-id}` (e.g. `ai/portal-35520`),
2. run an AI agent that analyses the Jira issue and the codebase,
3. commit a structured implementation plan to that branch,
4. report the result back to the Jira issue.

Existing platform: Jira Cloud, AWS, GitHub (single organisation), Cursor. AWS is available but the
first slice deliberately does not use it — see §21.

## 2. Guiding principle

> Deterministic things belong in code. Judgment belongs in the agent.

Branch names, plan file names, timestamps, commit metadata and status reporting are all
computed, never invented. The model is never asked to produce an identifier, because a name it
invented cannot be validated, diffed, or reproduced — and models are unreliable about the current
date.

A corollary that shapes §5: configuration is not code. Logic that ends up as a nest of Jira smart
values is as unreviewable as a model guess, so it belongs in the workflow, or it should be
simplified out of existence.

## 3. Decisions


| Decision               | Choice                                                           | Rationale                                                                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger path           | Jira Automation → GitHub directly; **no AWS in the first slice** | Every deterministic job the dispatcher Lambda was carrying has a Jira-native or GitHub-native equivalent (§5, §16). AWS earns its place when durable redelivery or cross-repo budget state does — see §21                                                   |
| Execution substrate    | GitHub Actions + Cursor CLI **on the runner**                    | Reuses existing CI, per-repo customisation, easy manual rerun, straightforward path to self-hosted runners for repos needing VPC access. Decisively: the agent works in a checkout we control, so the artifact is verified **before** it is committed (§11) |
| Agent invocation       | CLI now; Cloud Agents API later, behind a quarantine branch      | The API removes runner minutes and several bespoke pieces, but the cloud agent pushes its own commits, which moves the verification gate after the fact. See §22                                                                                            |
| Orchestration          | GitHub Actions (no Step Functions)                               | Actions already provides retry, timeout and concurrency primitives                                                                                                                                                                                          |
| Reporting              | Jira Automation **incoming webhook**, called by the workflow     | Keeps every Jira *write* on the Jira side. GitHub holds an opaque URL that triggers exactly one rule, not a token that can mutate the issue tracker (§5.4)                                                                                                  |
| Timestamp format       | ISO 8601 **basic** — `20260823T112233Z`                          | Extended format contains `:`, which is illegal on NTFS and breaks `git checkout` for every Windows developer on the branch                                                                                                                                  |
| Plan location          | `.sdlc/plans/`                                                   | Groups the artifact with the automation config, template and prompts it belongs to; keeps the repo root clean                                                                                                                                               |
| First production slice | Commit to branch + Jira comment; **no pull request**             | Smallest useful slice. See §15 for the two consequences this creates                                                                                                                                                                                        |


### Rejected alternatives

- **Cursor Cloud Agents API as the phase-1 substrate.** No runners to manage, idempotent creates
and per-run token accounting for free. Rejected for the first slice because the cloud agent
commits and pushes on its own: the "exactly one added file" assertion can then only run after
the push, and that assertion is the reason this pipeline can be trusted. Revisit via §22.
- **Step Functions for orchestration.** Duplicates retry, timeout and concurrency primitives that
Actions already provides.
- **Jira *system* webhooks** (Settings → System → Webhooks) instead of Automation. They cannot set
an `Authorization` header, so they cannot call the GitHub API at all. Automation's *Send web
request* action can.
- **Dispatcher Lambda as the trigger** (SNS → SQS → Lambda → `repository_dispatch`). **Deferred,
not rejected.** It buys durable at-least-once delivery, a DLQ, replay, and a policy layer that
does not depend on GitHub, and it is the only variant that keeps Jira credentials out of GitHub
entirely. §21 states the conditions under which it goes back in.

## 4. Architecture

### 4.1 Default — Jira-native trigger, no AWS

```
Jira Automation rule (one, service-account-owned)
  ├─ conditions: label, repository field, repo allowlist, issue type
  ├─ readiness gate — no ACs? comment, label ai-plan-blocked, stop (§13)
  ├─ Get branches (GitHub for Atlassian)  ── branch exists? stop (§16)
  └─ Create branch in GitHub  ai/portal-35520
                          │
                          ▼  GitHub "create" event
        acme/portal  .github/workflows/sdlc-plan.yml   (14 lines)
          └─ uses: acme/sdlc-workflows/.github/workflows/plan-story.yml@v1
                          │
        ┌─────────────────┴───────────────────────────┐
        │  reusable workflow                          │
        │  1. gate: ref pattern + allowlist + kill    │
        │     switch (org variable)                   │
        │  2. checkout the ai/ branch                 │
        │  3. fetch Jira issue (read-only token)      │
        │  4. compute plan_path + UTC timestamp       │
        │  5. render layered prompt                   │
        │  6. agent -p --mode plan                    │
        │  7. VERIFY artifact                         │
        │  8. commit + push                           │
        │  9. archive prompt + transcript             │
        │ 10. callback (if: always())                 │
        └─────────────────┬───────────────────────────┘
                          ▼
        Jira Automation incoming-webhook rule
          └─ comment (blocking questions first), fields, label, Slack
```

No queue, no DLQ, no DynamoDB, no OIDC role, no Lambda. What that costs is set out in §21.

### 4.2 Durable variant — the AWS layer, once it is warranted

```
Jira Automation ──▶ SNS ──▶ SQS ──▶ Lambda "dispatcher"
                                      ├─ fetch issue (Jira REST v3, thin event / fat fetch)
                                      ├─ policy: repo allowlist, kill switch, daily budget
                                      ├─ readiness gate (no ACs? -> comment & stop, no agent)
                                      ├─ DynamoDB conditional write (idempotency)
                                      ├─ compute branch + plan_path + UTC timestamp
                                      ├─ write sanitised context bundle -> S3
                                      └─ POST /repos/{org}/{repo}/dispatches
                                                      │
                                                      ▼
                        acme/portal  .github/workflows/sdlc-plan.yml   (14 lines)
                                        └─ uses: acme/sdlc-workflows/...@v1
                                                      │
                                        ┌─────────────┴──────────────┐
                                        │  reusable workflow          │
                                        │  1. validate payload        │
                                        │  2. checkout base_ref       │
                                        │  3. OIDC -> AWS             │
                                        │  4. pull context + API key  │
                                        │  5. agent -p --mode plan    │
                                        │  6. VERIFY artifact         │
                                        │  7. commit + push branch    │
                                        │  8. archive to S3           │
                                        │  9. callback (if: always()) │
                                        └─────────────┬──────────────┘
                                                      ▼
                                    SNS "sdlc-callbacks" ──▶ Lambda "reporter"
                                              └─ Jira comment + fields + label, Slack, metrics
```

Not the starting point. §21 lists the six conditions that would justify each piece of it, and the
order they are likely to arrive in.

## 5. Trigger (Jira side)

Common to every variant:

- **Trigger:** *Issue transitioned* → To: In Progress. Not a field-value change — a board
column can map to several statuses, so enumerate every status behind the column.
- **Conditions:** label `ready-for-development`; `repository` field non-empty and matching the
allowlist; issue type in allowlist; JQL guard excluding issues already labelled
`ai-plan-ready` (free idempotency at source).
- **Ownership:** one global, service-account-owned rule rather than a copy per project.

### 5.1 Native branch creation — no secret in Jira (default)

Jira Automation has first-class GitHub actions through the **GitHub for Atlassian** app,
authorised by an OAuth connection rather than a token pasted into a rule:

- **Get branches** — read the target repo's branches, so the rule can stop when the branch exists.
- **Create branch in GitHub** — create `ai/{{issue.key.toLowerCase()}}` from the default branch.

Creating the branch fires GitHub's `create` event, and the workflow triggers on that. Nothing in
Jira holds a credential, so nothing has to be rotated, and no principal outside the OAuth grant
can dispatch work.

Consequences, all accepted:

- `create` carries no payload. The workflow parses the Jira key out of the branch name and fetches
the rest (§5.5).
- `on: create` supports no branch filter. Gate at job level with
`if: startsWith(github.ref, 'refs/heads/ai/')` so no runner is allocated for ordinary branches.
- The branch exists before the agent runs, reversing the §11 preference. A failed run therefore
leaves an orphan `ai/` branch — cheap, self-documenting, and it is what makes the branch usable
as the idempotency key (§16).
- The summary slug is lost unless it is assembled from smart values
(`{{issue.summary.toLowerCase().replaceAll("[^a-z0-9]+","-")}}`), which is precisely the
unauditable configuration logic §2 exists to prevent. Use `ai/portal-35520` and let the plan
file carry the description (§6).

### 5.2 `repository_dispatch` — when the payload is worth a token

*Send web request* → `POST https://api.github.com/repos/{org}/{repo}/dispatches`, with the
`Authorization` header marked **Hidden** and the body from §8.

- Jira Automation cannot sign a GitHub App JWT, so this means a long-lived **fine-grained PAT** on
a machine user with `contents: write`, SSO-authorised for the org. Rotation and blast radius are
discussed in §14.
- Only ever triggers workflows on the **default branch** (§17).
- `client_payload` is capped at 10 top-level properties and 64 KB (§8).

### 5.3 `workflow_dispatch` — same, but testable

`POST /repos/{org}/{repo}/actions/workflows/{file}/dispatches`, which takes a `ref`. That single
difference removes the §17 gotcha about being unable to exercise workflow changes off the default
branch. Costs: the PAT also needs `actions: write`, inputs are capped at 10, and every input must
be a string (numbers and booleans are rejected outright, so quote `plan_version`).

### 5.4 Reporting back into Jira

Jira Automation's **incoming webhook** trigger closes the loop, replacing the SNS topic and the
`reporter` Lambda:

- A second rule is triggered by the webhook, selects the issue by key from the request body, and
performs the comment, field writes, label and Slack mirror using native actions.
- The workflow calls that URL from an `if: always()` step.
- GitHub therefore stores an opaque URL that can trigger exactly one rule. It is a secret, but it
is not a Jira credential: it cannot read the tracker and cannot act outside what the rule does.
- Failure mode is honest rather than silent — if the callback fails the plan is still on the
branch and the Actions run is red. Nothing is lost; nothing is retried either.

### 5.5 Thin event, fat fetch

Whatever the variant, the trigger must **not** carry `{{issue.fields.description}}`: Jira Cloud
descriptions are ADF, smart-value rendering mangles them, and long tickets hit payload limits.

The workflow instead calls `GET /rest/api/3/issue/{key}?expand=renderedFields`, which also yields
comments, linked issues, the epic, and subtasks — exactly the context that makes a plan good. The
`repository` field's `customfield_NNNNN` id is discovered via `/rest/api/3/field`, and differs
between team-managed and company-managed projects.

Moving that fetch from a Lambda onto the runner is the one real regression in the no-AWS path: it
puts a Jira token in GitHub. Bound it — a dedicated service account with browse-only permission on
allowlisted projects, held as an org secret with selected-repository visibility. Combined with
§5.4, the §14 rule weakens from "no Jira credentials in GitHub" to "no Jira **write** credentials
in GitHub", which is defensible; the alternative is §21.

### 5.6 Objections to the no-AWS trigger, and where they are answered

The earlier draft rejected this path on four grounds. Each now has an owner:


| Objection                  | Answer                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| No idempotency             | Branch-ref creation is an atomic compare-and-swap, plus *Get branches*, the JQL label guard and the `concurrency` group — §16 |
| No policy layer            | Repo allowlist as a reviewed file in `acme/sdlc-control`, kill switch as an org-level Actions variable — §7                   |
| No readiness gate          | Jira conditions with native *Add comment* and *Add label* actions; no code at all — §13                                       |
| Jira credentials scattered | One read-only token, org-scoped; all writes stay in Jira via §5.4                                                             |


## 6. Naming

### Branch

`ai/{lowercase jira key}` — e.g. `ai/portal-35520`.

The `ai/` prefix is not optional in this design: it is the job-level trigger filter for the
payload-free `create` event (§5.1), and it is what branch rulesets, CI filters and CODEOWNERS rules
target to treat agent branches differently. Jira's development panel auto-links regardless,
because the key is present.

The summary slug is dropped. It was pleasant to read but it cost either a Lambda or a nest of Jira
smart values, and the plan file already carries the description. When a payload variant (§5.2,
§5.3) is in use and a slug is wanted back, compute it in the workflow, not in the trigger:

> Slug rules: lowercase, transliterate to ASCII, replace non-`[a-z0-9]` with `-`, collapse
> repeats, trim, truncate the description at a word boundary near 40 characters (60 total).
> Reject the `git check-ref-format` illegal cases (`..`, `@{`, `~^:?*[\`, trailing `.lock`).
> On collision, append `-2`. Derived from the Jira summary, never generated by the model —
> reproducible, free, and auditable.

### Plan file

```
.sdlc/plans/PORTAL-35520-implementation-plan-20260823T112233Z.md
```

Validated in the workflow against a hard regex before anything is written, so a malformed
dispatch can never create a stray file:

```
^\.sdlc/plans/[A-Z][A-Z0-9]+-[0-9]+-implementation-plan-[0-9]{8}T[0-9]{6}Z\.md$
```

Uppercase Jira key in the filename (matches how humans search Jira), lowercase in the branch
(avoids case-insensitive-filesystem collisions). The timestamp is generated once, in the workflow,
from the runner's UTC clock — never from the model, and never twice in one run.

Re-planning produces **v2** as a new timestamped file with `supersedes:` set. Old plans are
never edited or deleted — the directory is an immutable audit trail. See §16 for how re-planning is
invoked now that the branch is the idempotency key.

## 7. Repository layout

Logic lives in one place; per-repo footprint is near zero.

`acme/sdlc-workflows` (new, released via git tags):

- `.github/workflows/plan-story.yml` — the reusable workflow
- `actions/install-cursor-cli/` — pinned + cached CLI install
- `actions/fetch-jira-issue/` — the §5.5 fetch plus ADF→markdown sanitisation
- `actions/render-prompt/` — assembles the layered prompt
- `actions/verify-plan/` — the artifact gate
- `actions/report-status/` — POST to the Jira incoming webhook (§5.4)

`acme/sdlc-control` (new) — the policy surface that replaces the dispatcher Lambda's judgment:

- `allowlist.yml` — repositories, issue types and projects the pipeline may act on
- `budgets.yml` — per-repo and per-day run caps
- `CODEOWNERS` — platform team owns both, so widening scope is a reviewed pull request rather than
an environment variable someone edited in a console

The allowlist is read by the reusable workflow at runtime (`actions/checkout` of `sdlc-control` at
a tag). A file in git is a better policy store than a Lambda constant: diffable, attributable, and
revertable.

Each product repo:

```
.sdlc/
  config.yml          # model, max runtime, ignored paths, review owners
  prompts/plan.md     # repo-specific planning guidance, reviewed like code
  plan-template.md    # the output contract
  plans/              # generated plans land here
.github/workflows/sdlc-plan.yml
```

### Caller workflow

Must live on the **default branch** — neither `create` nor `repository_dispatch` triggers a
workflow anywhere else.

```yaml
name: SDLC Plan Story
on:
  create:
  repository_dispatch:
    types: [sdlc-plan-story]

concurrency:
  group: sdlc-plan-${{ github.event.client_payload.task.jira_key || github.ref_name }}
  cancel-in-progress: false

jobs:
  plan:
    if: >-
      github.event_name == 'repository_dispatch' ||
      (github.event.ref_type == 'branch' && startsWith(github.event.ref, 'ai/'))
    uses: acme/sdlc-workflows/.github/workflows/plan-story.yml@v1
    permissions:
      contents: write
    with:
      branch: ${{ github.event.ref || github.event.client_payload.task.branch }}
      payload: ${{ toJSON(github.event.client_payload.task) }}
```

The job-level `if` means an ordinary `git push -u origin feature/x` never allocates a runner. The
`concurrency` group gives per-ticket serialisation for free. `id-token: write` is only needed once
the §21 AWS variant is in play. If `sdlc-workflows` is private, grant reusable-workflow access to
the org in its Actions settings.

## 8. Dispatch payload

Only variants §5.2 and §5.3 carry one; §5.1 derives everything from the branch name.

**Two hard limits, and the first one bit this design.** `client_payload` accepts a maximum of
**10 top-level properties** and must stay under **64 KB**. A flat payload of the fields below is 15
properties and GitHub rejects it outright with
`422: No more than 10 properties are allowed; 15 were supplied.` Nest everything under one key:

```json
{
  "event_type": "sdlc-plan-story",
  "client_payload": {
    "task": {
      "schema": "sdlc.plan-story.v1",
      "run_id": "01JBQ8...",
      "jira_key": "PORTAL-35520",
      "jira_url": "https://acme.atlassian.net/browse/PORTAL-35520",
      "base_ref": "main",
      "branch": "ai/portal-35520",
      "plan_path": ".sdlc/plans/PORTAL-35520-implementation-plan-20260823T112233Z.md",
      "plan_version": 1,
      "supersedes": null,
      "model": "claude-4.6-sonnet-thinking",
      "pipeline_version": "1.0.0"
    }
  }
}
```

Read as `github.event.client_payload.task.*`. The `context_s3_uri`, `aws_role_arn`, `aws_region`
and `callback_topic_arn` fields belong only to the §21 variant; in the default path the workflow
fetches Jira itself and calls the webhook from §5.4.

For `workflow_dispatch` (§5.3) the same nesting trick does not apply — inputs are capped at 10 and
each must be a string — so pass `task` as a single JSON-encoded string input and parse it in the
workflow.

## 9. The reusable workflow

One workflow serves every trigger variant. A first `task` step normalises the two shapes: with a
payload it validates and re-emits the §8 fields; without one (§5.1) it derives `jira_key` from the
branch name, reads `model` and policy from `.sdlc/config.yml`, and computes `plan_path` and the
timestamp itself. Everything downstream reads `steps.task.outputs.*` and never touches the raw
event.

```yaml
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.branch }}
          fetch-depth: 0

      - name: Load policy
        uses: actions/checkout@v4
        with:
          repository: acme/sdlc-control
          ref: v1
          path: .sdlc-control

      - name: Gate on allowlist and kill switch
        run: |
          set -euo pipefail
          [ "${{ vars.SDLC_ENABLED }}" = "true" ] || { echo "kill switch engaged"; exit 1; }
          yq -e '.repositories[] | select(. == "${{ github.repository }}")' \
            .sdlc-control/allowlist.yml > /dev/null

      - name: Fetch and sanitise Jira issue
        id: jira
        uses: acme/sdlc-workflows/actions/fetch-jira-issue@v1
        with:
          jira-key: ${{ steps.task.outputs.jira_key }}
          jira-token: ${{ secrets.JIRA_READ_TOKEN }}
          out: /tmp/context.json

      - name: Install Cursor CLI (pinned + cached)
        uses: acme/sdlc-workflows/actions/install-cursor-cli@v1
        with:
          version: ${{ vars.CURSOR_CLI_VERSION }}

      - name: Render prompt
        uses: acme/sdlc-workflows/actions/render-prompt@v1
        with:
          context: /tmp/context.json
          plan-path: ${{ steps.task.outputs.plan_path }}
          out: /tmp/prompt.md

      - name: Run planning agent
        env:
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
        run: |
          set -euo pipefail
          timeout 25m agent -p --mode plan --force --trust \
            --model "${{ steps.task.outputs.model }}" \
            --output-format json \
            "$(cat /tmp/prompt.md)" > /tmp/agent.json

      - name: Verify artifact
        id: verify
        uses: acme/sdlc-workflows/actions/verify-plan@v1
        with:
          plan-path: ${{ steps.task.outputs.plan_path }}
          max-retries: '2'
```

The AWS steps this section used to open with — `configure-aws-credentials`, an S3 context copy and
a Secrets Manager lookup — belong to §21 and are omitted from the default path. Their absence is
the reason `CURSOR_API_KEY` is a GitHub secret here, which is a real weakening; see §14.

### CLI flags that matter

- The binary is now `agent`. `cursor-agent` is the legacy name and still resolves, but new
workflows should not be written against it.
- `-p` / `--print` is what makes the run non-interactive. `--force` alone leaves the agent
waiting for input — a common way to burn 25 minutes of runner time for nothing.
- `--mode plan` (or `--plan`) matches what this pipeline is for: explore and draft, do not
implement. It is a cheaper and more reliable constraint than asking the prompt to behave.
- `--trust` is required in headless environments, or the CLI exits non-zero on a
workspace-trust prompt.
- Wrap in `timeout`; there are open reports of the CLI not exiting cleanly after finishing.
- Pin and cache the CLI version. It ships frequently and flag behaviour has changed; a CLI
release should not be able to silently break planning across every repo.

## 10. Prompt architecture

Layered, not one blob:

1. **Repo-resident, version-controlled** — `AGENTS.md` for conventions, `.sdlc/plan-template.md`
  for the output contract, `.sdlc/config.yml` for model and policy. Reviewed like code.
2. **Orchestrator-injected frame** — role, the exact output path, hard non-goals ("write no
  code, modify no other file, run no migrations"), required sections.
3. **Jira content as data** — sanitised ADF→markdown, size-capped, wrapped in
  `<jira_issue_untrusted>` fences with an explicit note that it is input to analyse, not
   instructions to follow.

MCP is deliberately not used at first. Fetching and sanitising the context ourselves, in a step we
own, keeps that surface narrow. The Cloud Agents API would let us hand the agent an Atlassian MCP
server instead and delete the fetch entirely (§22) — at the cost of a live, unfiltered channel from
ticket text into the model. Revisit once the §14 defences are proven.

## 11. Verification gate

This step decides whether the pipeline is trustworthy. Assume the agent will sometimes misname
the file, add a helpful README tweak, or write prose where structure was requested.

`verify-plan` asserts that:

- `git status --porcelain` shows **exactly one added file**,
- at exactly the expected path,
- whose YAML frontmatter parses and contains every required key,
- with all mandatory sections present and non-empty.

Because the agent runs against a checkout we control, all four assertions happen **before** the
commit exists. That ordering is the whole point, and it is what §22 gives up.

On failure it re-invokes with `agent --continue -p --force` and a corrective message naming the
specific violation. Session resume keeps the exploration context, so the retry is cheap. After two
failed attempts the job fails and reports.

Commit and push:

```bash
git config user.name  "SDLC Bot"
git config user.email "sdlc-bot@acme.com"
git checkout "$BRANCH"
git add "$PLAN_PATH"
git commit -m "docs($JIRA_KEY): add implementation plan v$PLAN_VERSION"
git push origin "$BRANCH"
```

The branch already exists — Jira created it (§5.1) and it is the idempotency key (§16) — so the
workflow checks it out rather than creating it. The trade is an orphan `ai/` branch when a run
fails, which is visible, cheap, and preferable to losing the compare-and-swap.

If any org ruleset requires signed commits, a plain push from a runner is rejected. Use the
Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`) through the GitHub App instead,
which produces server-side verified commits.

## 12. Plan file contract

Frontmatter is what makes a downstream implementation stage possible:

```yaml
---
jira_key: PORTAL-35520
repository: acme/portal
branch: ai/portal-35520
base_commit: 9f2c1ab
generated_at: 2026-08-23T11:22:33Z
generator:
  agent_id: bc-…
  run_id: run-…
  model: claude-4.6-sonnet-thinking
  pipeline_version: 1.0.0
inputs_digest: sha256:…      # hash of the Jira fields used, to detect ticket drift
status: awaiting-review
supersedes: null
blocking_questions: 2
confidence: medium
---
```

Required body sections:

1. Summary
2. Acceptance criteria, copied verbatim with IDs (`AC-1…n`)
3. Assumptions and **blocking questions**
4. Current-state analysis, with real file paths
5. Proposed approach, plus alternatives considered and why rejected
6. Ordered task list, each referencing ACs and files, with size estimate
7. Contract / data / migration changes, flagged for extra review
8. Test plan mapped to ACs
9. Non-functional considerations (perf, security, a11y, i18n, observability)
10. Rollout and feature flags
11. Risks and blast radius
12. Out of scope
13. Effort estimate

## 13. Readiness gate

The dominant failure mode of AI planning is not bad reasoning — it is confident planning
against an underspecified ticket.

Before anything is triggered, the gate checks: does the issue have acceptance criteria, a
description above a minimum length, and a resolvable repository? If not, skip the agent entirely,
comment on Jira naming what is missing, and label `ai-plan-blocked`.

This gate belongs in the Jira rule, not in code. Automation conditions can test the fields, and
*Add comment* and *Add label* are native actions, so the whole gate is configuration that runs
before a branch is ever created — no runner, no API call, no Lambda. It is the clearest case in the
design where deleting the dispatcher costs nothing at all.

Likewise, when a produced plan reports `blocking_questions > 0`, those questions are the
**first** thing in the Jira comment.

This turns the automation into a quality forcing function on ticket writing, which typically
pays back more than the plans themselves.

## 14. Security

Dropping AWS from the default path costs one specific control, and it is the best one in the
design. State it plainly rather than discovering it later.

**What is lost: OIDC scoped to the workflow, not the repo.** With AWS in the path, secrets live
behind a trust policy conditioned on `job_workflow_ref`, so only the reviewed, tagged reusable
workflow can read them — a developer adding an arbitrary workflow to their own repo cannot:

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:job_workflow_ref":
        "acme/sdlc-workflows/.github/workflows/plan-story.yml@refs/tags/v1"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:acme/*"
    }
  }
}
```

There is no GitHub-native equivalent. Secrets are scoped to repositories and environments, not to
the identity of the workflow reading them, so **any** workflow in a permitted repo can read the
Cursor key. §21 exists largely for teams who cannot accept that.

**What replaces it in the default path:**

- **Cursor key** as an org secret with *selected repositories* visibility, surfaced only through a
protected `sdlc-plan` environment, rotated on a schedule. Weaker than Secrets Manager behind
`job_workflow_ref`; the honest mitigation is that the key buys model inference, not repository or
cloud access.
- **Jira read-only token** as an org secret, on a service account with browse permission on
allowlisted projects and nothing else. The rule becomes "no Jira **write** credentials in
GitHub" (§5.5).
- **Jira writes stay in Jira.** The workflow holds an incoming-webhook URL that triggers exactly
one rule (§5.4). It cannot read the tracker, and it is not a credential that generalises.
- **Trigger authority.** In §5.1 the authority to start a run is an OAuth grant to the GitHub for
Atlassian app plus the Jira rule itself — no long-lived token anywhere. In §5.2 and §5.3 it is a
fine-grained PAT on a machine user, scoped to allowlisted repos: a genuinely worse position,
because Atlassian has no per-user secret isolation — anyone who can edit rules in that scope can
*use* the stored value, even though the value is now redacted in exports and API responses.
- **Payloads are untrusted input.** Whoever can edit the Jira rule can dispatch arbitrary
`client_payload`. Validate `branch`, `plan_path` and `repository` against the §6 regexes and the
`sdlc-control` allowlist before acting on any of them.
- **Prompt injection.** Jira descriptions are editable by anyone with project access. Mitigated
by: treating Jira text as fenced data; `--mode plan`; the single-file diff assertion in §11;
keeping the planning job's secret surface to the two secrets above; and archiving the full
prompt and transcript for audit.
- **Kill switch** as an org-level Actions variable checked in the gate step, with per-repo caps in
`sdlc-control`. Per-**day** caps need durable state and are the weakest part of this path —
counting today's runs through the Actions API is approximate. Treat a hard budget as a §21
trigger.

## 15. Consequences of the no-PR choice

**Nobody is notified, and nothing is reviewed by default.** A draft PR would provide threaded
review, reviewer assignment and notifications for free. Without one, the Jira comment is the
entire human interface and has to earn it:

- `@`-mention the assignee and reporter,
- lead with **blocking questions**, not the summary,
- include confidence and estimate,
- link the plan by **commit SHA permalink**, so the link is immutable,
- mirror to Slack,
- define an explicit acknowledgement signal (`plan-approved` label or a Jira transition), or
there is no way to measure whether plans are being read — the metric that tells us whether
any of this works.

**The audit trail lives on branches that get deleted.** The plan never merges to `main`, so
`.sdlc/plans/` never accumulates centrally and the record vanishes when a branch is pruned.

Default mitigation: upload the plan file, rendered prompt and full agent transcript as a workflow
artifact with retention raised to the org maximum, and disable automatic branch deletion for the
`ai/` pattern. Artifacts are not immutable and they do expire, so this is a working record rather
than an audit record.

If the plans must be retained under a policy — regulatory, or simply "we will want to measure this
in a year" — keep exactly one piece of AWS: archive to
`s3://acme-sdlc-audit/{jira_key}/{run_id}/` with Object Lock, via an OIDC role whose only
permission is writing that prefix. That is a defensible ten-line footprint and it reinstates the
`job_workflow_ref` condition for the one thing that genuinely needs durability.

## 16. Idempotency

Humans drag cards back and forth, and any at-least-once delivery in front of this will replay.
Four layers, none of which needs a database:

1. **JQL label guard** in the Jira rule — excludes issues already labelled `ai-plan-ready`.
2. **Get branches** in the rule — stop if `ai/{key}` already exists.
3. **Ref creation as compare-and-swap.** `POST /git/refs` (which is what *Create branch in GitHub*
  performs) succeeds exactly once and returns `422` on the second attempt. This is a genuine
   atomic CAS on `ISSUE#{key}`, which is all the DynamoDB conditional write was providing. The
   branch *is* the lock.
4. **Concurrency group** per Jira key in the caller workflow — serialises anything that gets past
  the first three.

Layers 2 and 3 differ in an important way: 2 is a race-prone convenience that keeps the audit log
clean, 3 is the actual guarantee. Do not rely on 2 alone.

A re-transition after a plan exists is expected to produce plan v2 on the same branch with
`supersedes` set. Because the branch now exists, the trigger stops at layer 2 or 3, so re-planning
is a deliberate act: remove the `ai-plan-ready` label, or dispatch §5.2 explicitly with
`plan_version: 2`. Losing accidental re-planning is a feature; losing intentional re-planning is
not, so the manual path has to stay documented.

## 17. Operational gotchas

- `create` and `repository_dispatch` only trigger workflows on the default branch, so workflow
changes cannot be tested on a feature branch. Iterate in a sandbox repo, promote by tag — or use
§5.3, whose `ref` parameter removes the problem outright.
- `on: create` accepts no `branches` filter, and fires for tags too. Gate at job level on
`github.event.ref_type == 'branch'` and the `ai/` prefix, or every branch in the repo starts a
runner.
- Jira Automation's *Send web request* has a hard 30-second timeout and no configurable retry. A
`dispatches` call is fast, so this is survivable, but a failed rule is recoverable only by
re-transitioning the ticket — there is no queue and no replay. This is the single biggest
functional difference from §21.
- Commits pushed with `GITHUB_TOKEN` do not trigger further workflows. A feature today (no
loops); a trap later, when a PR opened this way will not run its checks. Switch to App-token
pushes at that point.
- Runner cost is small — roughly a couple of hundred milli-dollars of `ubuntu-latest` per plan.
The job is network-bound, so a 2-core runner is fine.
- Repos needing private registry access for meaningful dependency analysis route to self-hosted
runners in the VPC.

## 18. Observability and metrics

In the default path the run history *is* the telemetry: every attempt is an Actions run, correlated
by `jira_key` in the run name, with logs, timings and the archived transcript attached. Failures are
red runs with a re-run button, which is a better operator experience than a DLQ. What is missing is
aggregation — there is no Athena table, so the metrics below come from the Actions API or a weekly
export until §21 adds the EventBridge → Firehose → S3 → Athena path.

Cost per plan needs no bespoke instrumentation: `GET /v1/agents/{id}/usage` returns input and
output tokens per run, so the workflow can record actual model spend alongside runner minutes.

Metrics that decide whether to continue investing:

- plan acceptance rate (approved without major edits),
- edit distance between the generated plan and what was actually built,
- time from In Progress to plan-ready,
- readiness-rejection rate — the leading indicator on upstream ticket quality,
- cost per plan, and downstream rework rate.

## 19. Rollout

**Phase 0 — backtest (1 week).** Take ~20 recently-closed stories, generate plans with a local
script, have the engineers who did the work score them. No Jira trigger, no dispatch, no cloud
anything. If the plans are not useful, none of the plumbing matters.

**Phase 1 — workflow first.** Build `sdlc-workflows` and `sdlc-control` plus one pilot repo, driven
by manual `gh workflow run` calls. Prove the verification gate here, because everything downstream
depends on it.

**Phase 2 — connect Jira, still no AWS.** Add the readiness gate and *Create branch in GitHub*
actions to one service-account-owned rule (§5.1), and the incoming-webhook reporting rule (§5.4).
This is the first end-to-end slice, and it is configuration plus two workflows — no Lambda, no
queue, no table, no IaC.

**Phase 3 — earn the AWS layer, or don't.** Run phase 2 for a month and count: lost events that
needed replay, budget overruns, and audit gaps. Add only the pieces those numbers justify (§21).
The likely outcome is the S3 audit archive alone.

**Phase 4 — critic pass.** A second agent scores the plan against a rubric and requests revisions
before a human sees it. Good first candidate for the Cloud Agents API (§22), since a critic writes
no repository artifact and therefore needs no verification gate.

**Phase 5 — implementation stage.** Plan approval triggers an implementation agent; reintroduce the
pull request as the review surface at this point. Note the §22 caveat about agent tokens and PR
comments before designing the review loop around them.

## 20. Open items

- Confirm the `repository` custom field id per project type.
- Confirm whether org rulesets require signed commits.
- Confirm the PII / data-residency position on sending Jira descriptions to a model. This is the
most likely single reason the §21 layer becomes mandatory rather than optional.
- Decide the acknowledgement signal for plan review (§15).
- Confirm the GitHub for Atlassian app is installed and that *Create branch in GitHub* is available
and permitted on the pilot repo — the whole §5.1 path depends on it.
- Decide whether the Cursor key may live in GitHub at all (§14). A "no" answer forces §21 on day
one, so settle it before phase 2.
- Agree how re-planning is invoked now that the branch is the lock (§16).
- Defer IaC. If §21 happens, CDK in a dedicated `sdlc-automation` repo, deployed via Actions with
OIDC.

## 21. When to add the AWS layer

The dispatcher and reporter Lambdas are not wrong, they are unearned at this stage. Adopt §4.2 when
one of these becomes true, and adopt only the part that answers it:


| Trigger                                                                 | What to add                                                      | Why nothing cheaper works                                                                                                       |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A lost trigger has to be replayable                                     | SNS → SQS → dispatcher Lambda, with a DLQ                        | Jira Automation has a 30-second timeout, no queue and no replay; recovery today means re-transitioning the ticket by hand (§17) |
| A hard per-day or per-repo spend cap is required                        | DynamoDB counters checked at ingress                             | Budgets need durable, atomic state; counting Actions runs after the fact is approximate (§14)                                   |
| The Cursor key may not live in GitHub                                   | Secrets Manager + an OIDC role conditioned on `job_workflow_ref` | GitHub scopes secrets to repositories, never to the identity of the workflow reading them (§14)                                 |
| Jira descriptions may not transit GitHub-hosted runners                 | Dispatcher-side fetch and sanitisation, context bundle in S3     | Moves the data boundary off GitHub entirely                                                                                     |
| Plans must be retained immutably                                        | S3 prefix with Object Lock, written over OIDC                    | Workflow artifacts expire and can be deleted (§15)                                                                              |
| Cross-tool orchestration arrives (ServiceNow, GitLab, a second tracker) | The full dispatcher as the policy front door                     | One policy layer beats one rule per tool                                                                                        |


Two notes on sequencing. The S3 audit archive is the cheapest item on the list and the most likely
to be needed, so expect it first and expect it alone. And nothing here invalidates phase 2 work:
the reusable workflow keeps its interface, the trigger swaps from `create` to `repository_dispatch`,
and §5.4 reporting swaps for the SNS callback.

### Ingress, if this is built

Use Jira Automation's native **AWS SNS action** rather than an HTTP request to API Gateway.
Atlassian's automation account (`815843069303`) publishes directly to the topic, giving
IAM-authenticated delivery with no public endpoint and no HMAC scheme to maintain — and no PAT,
which is the §5.2 problem solved properly. Two setup constraints:

- Atlassian requires the topic to have encryption disabled, unless that principal is granted
`kms:GenerateDataKey` on the CMK explicitly.
- Atlassian's own guidance is to treat the source as untrusted and validate every message. The same
applies to `client_payload` in the default path (§14).

## 22. Cursor Cloud Agents API as an alternative substrate

Running `agent` on the runner is not the only option. The Cloud Agents API (`POST /v1/agents`,
currently **public beta** on v1) launches the agent on Cursor-managed infrastructure instead.

What it would remove from this design:

- **Runner minutes**, almost entirely — the job becomes an API call and a poll.
- **The idempotency layer**, again: a client-supplied `agentId` (form `bc-…`, so derive it
  deterministically from the Jira key and plan version) returns `409 agent_id_conflict` rather than
  creating a duplicate. That is the DynamoDB conditional write, for free.
- **The retry mechanism** in §11: a follow-up run on the same agent preserves conversation and
workspace state, exactly like `--continue`.
- **The cost metric**: `GET /v1/agents/{id}/usage` gives per-run token counts.
- **Part of the audit archive**: artifacts are listable and downloadable through the API.
- **The context fetch**, if MCP servers are attached inline (`mcpServers`) — though §10 explains why
that is a security trade, not a simplification.

`mode: "plan"` maps directly onto this pipeline, and self-hosted `pool` or `machine` targets cover
the private-network repos that §17 routes to self-hosted runners.

What it costs, and why it is not the phase-1 choice:

- **The verification gate moves after the push.** The cloud agent commits and pushes on its own, so
"exactly one added file at exactly this path" can only be asserted once the commit exists. §11 is
the reason this pipeline is trustworthy, and this inverts it.
- **Branch naming is not ours by default** — commits land on an auto-generated `cursor/...` branch.
Deterministic names need the ref pre-created plus `startingRef` and `workOnCurrentBranch: true`.
- **No webhooks on v1 yet** (the legacy v0 API has them), so completion means polling, holding an
SSE stream open, or staying on v0.
- **Session env vars are in beta and silently ignored** when `envVars` is not enabled for the
  account — a failure mode that looks like a working run. It is also mutually exclusive with a
  client-supplied `agentId`, so the idempotency trick above and injected secrets cannot both be
  used.
- **Agent GitHub tokens can push but currently cannot comment on issues or PRs.** Irrelevant now,
directly relevant to phase 5.
- **The `job_workflow_ref` control does not apply**, because the agent runs outside Actions. Access
is governed by the Cursor GitHub App installation instead.

### The hybrid worth building

If the API is adopted, do not simply swap it in. Let the cloud agent push to a quarantine branch,
verify there, and promote:

```
Jira ──▶ Actions (trigger job, ~10s)
             └─ POST /v1/agents  (mode: plan,
                                  startingRef: ai/raw/portal-35520,
                                  workOnCurrentBranch: true,
                                  agentId: bc-{uuid5(jira_key + plan_version)})
                        │
                        ▼  agent pushes to ai/raw/portal-35520
             Actions (on: push to ai/raw/**)
             ├─ VERIFY the diff (§11 assertions, unchanged)
             └─ PUT /repos/.../contents/{plan_path} on ai/portal-35520
                        └─ single validated file, server-side verified commit
```

This keeps a hard gate, keeps runner minutes near zero, and produces verified commits — which also
resolves the signed-commit ruleset question in §11. The cost is two branches per ticket and a
second workflow. Reassess after §20's signed-commit answer lands.