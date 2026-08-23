# AI-Driven Story Planning Pipeline — Design

Status: proposed
Owner: TBD
Last updated: 2026-08-23

## 1. Goal

When a Jira story is moved into **In Progress** on the board, and it carries the label
`ready-for-development` and a non-empty `repository` custom field, automatically:

1. create a branch in the target repository named `{jira-id}-{short-description}`
   (e.g. `portal-35520-extended-validation`),
2. run an AI agent that analyses the Jira issue and the codebase,
3. commit a structured implementation plan to that branch,
4. report the result back to the Jira issue.

Existing platform: Jira Cloud, AWS, GitHub (single organisation), Cursor.

## 2. Guiding principle

> Deterministic things belong in code. Judgment belongs in the agent.

Branch names, plan file names, timestamps, commit metadata and status reporting are all
computed by the orchestrator. The model is never asked to invent an identifier, because a
name it invented cannot be validated, diffed, or reproduced — and models are unreliable
about the current date.

## 3. Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Execution substrate | GitHub Actions + `cursor-agent` CLI, dispatched from AWS | Reuses existing CI, per-repo customisation, easy manual rerun, straightforward path to self-hosted runners for repos needing VPC access |
| Orchestration | GitHub Actions (no Step Functions) | Actions already provides retry, timeout and concurrency primitives; AWS stays a thin trigger/policy/reporting layer |
| Timestamp format | ISO 8601 **basic** — `20260823T112233Z` | Extended format contains `:`, which is illegal on NTFS and breaks `git checkout` for every Windows developer on the branch |
| Plan location | `.sdlc/plans/` | Groups the artifact with the automation config, template and prompts it belongs to; keeps the repo root clean |
| First production slice | Commit to branch + Jira comment; **no pull request** | Smallest useful slice. See §10 for the two consequences this creates |

### Rejected alternatives

- **Cursor Cloud Agents API driven by Step Functions.** No runners to manage and stronger
  central audit, but it duplicates orchestration the team already runs in Actions and makes
  private-network repo analysis harder.
- **Jira Automation posting `repository_dispatch` directly, no AWS.** Fastest to prototype,
  but no idempotency, no policy layer, no readiness gate, and Jira credentials scattered.
  Acceptable for a one-week spike only.

## 4. Architecture

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
                        acme/portal  .github/workflows/sdlc-plan.yml   (12 lines)
                                        └─ uses: acme/sdlc-workflows/...@v1
                                                      │
                                        ┌─────────────┴──────────────┐
                                        │  reusable workflow          │
                                        │  1. validate payload        │
                                        │  2. checkout base_ref       │
                                        │  3. OIDC -> AWS             │
                                        │  4. pull context + API key  │
                                        │  5. cursor-agent -p         │
                                        │  6. VERIFY artifact         │
                                        │  7. commit + push branch    │
                                        │  8. archive to S3           │
                                        │  9. callback (if: always()) │
                                        └─────────────┬──────────────┘
                                                      ▼
                                    SNS "sdlc-callbacks" ──▶ Lambda "reporter"
                                              └─ Jira comment + fields + label, Slack, metrics
```

## 5. Trigger (Jira side)

Use Jira Automation's native **AWS SNS action** rather than an HTTP request to API Gateway:
Atlassian's automation account (`815843069303`) publishes directly to the topic, giving
IAM-authenticated delivery with no public endpoint and no HMAC scheme to maintain.

Two setup constraints:

- Atlassian requires the topic to have encryption disabled, unless that principal is granted
  `kms:GenerateDataKey` on the CMK explicitly.
- Atlassian's own guidance is to treat the source as untrusted and validate every message.

Rule configuration:

- **Trigger:** *Issue transitioned* → To: In Progress. Not a field-value change — a board
  column can map to several statuses, so enumerate every status behind the column.
- **Conditions:** label `ready-for-development`; `repository` field non-empty and matching the
  allowlist; issue type in allowlist; JQL guard excluding issues already labelled
  `ai-plan-ready` (free idempotency at source).
- **Ownership:** one global, service-account-owned rule rather than a copy per project.

### Thin event, fat fetch

The SNS message carries only the issue key, transition id, actor and timestamp. It must **not**
carry `{{issue.fields.description}}`: Jira Cloud descriptions are ADF, smart-value rendering
mangles them, and long tickets hit payload limits.

The dispatcher instead calls `GET /rest/api/3/issue/{key}?expand=renderedFields`, which also
yields comments, linked issues, the epic, and subtasks — exactly the context that makes a plan
good. The `repository` field's `customfield_NNNNN` id is discovered via `/rest/api/3/field`, and
differs between team-managed and company-managed projects.

## 6. Naming

### Branch

`{lowercase jira key}-{slug(summary)}` — e.g. `portal-35520-extended-validation`.

Slug rules: lowercase, transliterate to ASCII, replace non-`[a-z0-9]` with `-`, collapse
repeats, trim, truncate the description at a word boundary near 40 characters (60 total).
Reject the `git check-ref-format` illegal cases (`..`, `@{`, `~^:?*[\`, trailing `.lock`).
On collision, append `-2`.

The slug is derived deterministically from the Jira summary rather than generated by the model:
reproducible, free, and auditable.

> Optional: prefix with `ai/` (`ai/portal-35520-...`) to enable branch rulesets, CI filters and
> CODEOWNERS rules that target agent branches specifically. Jira's development panel still
> auto-links either way, because the key is present.

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
(avoids case-insensitive-filesystem collisions). Timestamp is generated once, in the
dispatcher, against a single UTC clock.

Re-planning produces **v2** as a new timestamped file with `supersedes:` set. Old plans are
never edited or deleted — the directory is an immutable audit trail.

## 7. Repository layout

Logic lives in one place; per-repo footprint is near zero.

`acme/sdlc-workflows` (new, released via git tags):

- `.github/workflows/plan-story.yml` — the reusable workflow
- `actions/install-cursor-cli/` — pinned + cached CLI install
- `actions/render-prompt/` — assembles the layered prompt
- `actions/verify-plan/` — the artifact gate
- `actions/report-status/` — SNS callback

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

Must live on the **default branch** — `repository_dispatch` only ever triggers workflows there.

```yaml
name: SDLC Plan Story
on:
  repository_dispatch:
    types: [sdlc-plan-story]

concurrency:
  group: sdlc-plan-${{ github.event.client_payload.jira_key }}
  cancel-in-progress: false

jobs:
  plan:
    uses: acme/sdlc-workflows/.github/workflows/plan-story.yml@v1
    permissions:
      contents: write
      id-token: write
    with:
      payload: ${{ toJSON(github.event.client_payload) }}
```

The `concurrency` group gives per-ticket serialisation for free. If `sdlc-workflows` is private,
grant reusable-workflow access to the org in its Actions settings.

## 8. Dispatch payload

`client_payload` is size-capped, so it carries pointers rather than content.

```json
{
  "schema": "sdlc.plan-story.v1",
  "run_id": "01JBQ8...",
  "jira_key": "PORTAL-35520",
  "jira_url": "https://acme.atlassian.net/browse/PORTAL-35520",
  "base_ref": "main",
  "branch": "portal-35520-extended-validation",
  "plan_path": ".sdlc/plans/PORTAL-35520-implementation-plan-20260823T112233Z.md",
  "plan_version": 1,
  "supersedes": null,
  "model": "claude-4.6-sonnet-thinking",
  "context_s3_uri": "s3://acme-sdlc-context/PORTAL-35520/01JBQ8.../bundle.json",
  "aws_role_arn": "arn:aws:iam::111122223333:role/sdlc-gha-plan",
  "aws_region": "eu-west-1",
  "callback_topic_arn": "arn:aws:sns:eu-west-1:111122223333:sdlc-callbacks",
  "pipeline_version": "1.0.0"
}
```

## 9. The reusable workflow

```yaml
      - uses: actions/checkout@v4
        with:
          ref: ${{ steps.task.outputs.base_ref }}
          fetch-depth: 0

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ steps.task.outputs.aws_role_arn }}
          aws-region: ${{ steps.task.outputs.aws_region }}

      - name: Pull context bundle and Cursor key
        run: |
          set -euo pipefail
          aws s3 cp "${{ steps.task.outputs.context_s3_uri }}" /tmp/context.json
          KEY=$(aws secretsmanager get-secret-value --secret-id sdlc/cursor-api-key \
                  --query SecretString --output text)
          echo "::add-mask::$KEY"
          echo "CURSOR_API_KEY=$KEY" >> "$GITHUB_ENV"

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
        run: |
          set -euo pipefail
          timeout 25m cursor-agent -p --force --trust \
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

### CLI flags that matter

- `-p` / `--print` is what makes the run non-interactive. `--force` alone leaves the agent
  waiting for input — a common way to burn 25 minutes of runner time for nothing.
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

MCP is deliberately not used at first. Fetching context in the dispatcher keeps sanitisation
under our control and avoids widening the injection surface. Revisit once §12 defences are
proven.

## 11. Verification gate

This step decides whether the pipeline is trustworthy. Assume the agent will sometimes misname
the file, add a helpful README tweak, or write prose where structure was requested.

`verify-plan` asserts that:

- `git status --porcelain` shows **exactly one added file**,
- at exactly the expected path,
- whose YAML frontmatter parses and contains every required key,
- with all mandatory sections present and non-empty.

On failure it re-invokes with `cursor-agent --continue -p --force` and a corrective message
naming the specific violation. Session resume keeps the exploration context, so the retry is
cheap. After two failed attempts the job fails and reports.

Commit and push:

```bash
git config user.name  "SDLC Bot"
git config user.email "sdlc-bot@acme.com"
git checkout -b "$BRANCH" || git checkout "$BRANCH"
git add "$PLAN_PATH"
git commit -m "docs($JIRA_KEY): add implementation plan v$PLAN_VERSION"
git push -u origin "$BRANCH"
```

If any org ruleset requires signed commits, a plain push from a runner is rejected. Use the
Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`) through the GitHub App instead,
which produces server-side verified commits.

Creating the branch inside the workflow (rather than in the dispatcher) means a failed run
leaves no orphan branch behind.

## 12. Plan file contract

Frontmatter is what makes a downstream implementation stage possible:

```yaml
---
jira_key: PORTAL-35520
repository: acme/portal
branch: portal-35520-extended-validation
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

Before dispatching, the Lambda checks: does the issue have acceptance criteria, a description
above a minimum length, and a resolvable repository? If not, skip the agent entirely, comment
on Jira naming what is missing, and label `ai-plan-blocked`.

Likewise, when a produced plan reports `blocking_questions > 0`, those questions are the
**first** thing in the Jira comment.

This turns the automation into a quality forcing function on ticket writing, which typically
pays back more than the plans themselves.

## 14. Security

**OIDC scoped to the workflow, not the repo.** The strongest control on this path is a trust
policy conditioned on `job_workflow_ref`, so only the reviewed, tagged reusable workflow can
assume the role — a developer adding an arbitrary workflow to their own repo cannot.

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

The role's own permissions stay tiny: read one S3 prefix, read one secret, publish to one SNS
topic.

- **No Cursor key in GitHub.** Fetch it from Secrets Manager at runtime. One copy, one rotation
  point, never visible to anything not running the approved workflow.
- **No Jira credentials in GitHub.** The workflow reports via SNS; the `reporter` Lambda performs
  all Jira writes. No repo holds a token that can mutate the issue tracker.
- **GitHub App** for the dispatcher, with `contents: write` (required for `repository_dispatch`),
  installed only on allowlisted repos, minting short-lived installation tokens.
- **Prompt injection.** Jira descriptions are editable by anyone with project access. Mitigated
  by: treating Jira text as fenced data; the single-file diff assertion in §11; empty
  environment secrets on planning runs (the planner needs no credentials); and full prompt +
  transcript archived for audit.
- **Kill switch** in SSM checked at ingress, plus per-repo and per-day run caps in DynamoDB.

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
Mitigation: the workflow archives the plan file, rendered prompt and full agent transcript to
`s3://acme-sdlc-audit/{jira_key}/{run_id}/` with Object Lock. S3 is the durable record; the
in-repo copy is a working convenience for a later implementation stage. Disable automatic
branch deletion for the agent branch pattern.

## 16. Idempotency

SNS is at-least-once, and humans drag cards back and forth. Three layers:

1. JQL label guard in the Jira rule,
2. DynamoDB conditional write on `ISSUE#{key}` in the dispatcher,
3. `concurrency` group per Jira key in the caller workflow.

A re-transition after a plan exists produces plan v2 on the same branch with `supersedes` set —
never a duplicate run.

## 17. Operational gotchas

- `repository_dispatch` only triggers workflows on the default branch, so workflow changes
  cannot be tested on a feature branch. Iterate in a sandbox repo, promote by tag.
- Commits pushed with `GITHUB_TOKEN` do not trigger further workflows. A feature today (no
  loops); a trap later, when a PR opened this way will not run its checks. Switch to App-token
  pushes at that point.
- Runner cost is small — roughly a couple of hundred milli-dollars of `ubuntu-latest` per plan.
  The job is network-bound, so a 2-core runner is fine.
- Repos needing private registry access for meaningful dependency analysis route to self-hosted
  runners in the VPC.

## 18. Observability and metrics

Structured logs correlated on `jira_key` + `run_id`. CloudWatch alarms on DLQ depth, failure
rate, p95 duration and daily cost. Domain events to EventBridge → Firehose → S3 → Athena.

Metrics that decide whether to continue investing:

- plan acceptance rate (approved without major edits),
- edit distance between the generated plan and what was actually built,
- time from In Progress to plan-ready,
- readiness-rejection rate — the leading indicator on upstream ticket quality,
- cost per plan, and downstream rework rate.

## 19. Rollout

**Phase 0 — backtest (1 week).** Take ~20 recently-closed stories, generate plans with a local
script, have the engineers who did the work score them. No Jira trigger, no Lambda, no dispatch.
If the plans are not useful, none of the plumbing matters.

**Phase 1 — workflow first.** Build `sdlc-workflows` plus one pilot repo, driven by manual
`gh api` dispatch calls.

**Phase 2 — connect the trigger.** Add the dispatcher Lambda and Jira rule (least uncertainty,
so it goes last), then the reporter Lambda and readiness gate together.

**Phase 3 — critic pass.** A second agent scores the plan against a rubric and requests
revisions before a human sees it.

**Phase 4 — implementation stage.** Plan approval triggers an implementation agent; reintroduce
the pull request as the review surface at this point.

## 20. Open items

- Confirm the `repository` custom field id per project type.
- Confirm whether org rulesets require signed commits.
- Confirm the PII / data-residency position on sending Jira descriptions to a model.
- Decide the acknowledgement signal for plan review (§15).
- Choose IaC: CDK in a dedicated `sdlc-automation` repo, deployed via GitHub Actions with OIDC.
