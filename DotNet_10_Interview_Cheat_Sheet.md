# .NET 10 Interview Cheat Sheet

A consolidated interview reference for **.NET 10 platform-specific** questions: the release model, runtime and JIT changes, **C# 14**, the SDK and tooling, BCL additions, **ASP.NET Core 10**, and **EF Core 10**. Answers go one level below the marketing bullet — interviewers reward *why the change exists* and *what it costs*, not the feature list.

> Version note: .NET 10 shipped in **November 2025** as an **LTS** release with **C# 14** and the `net10.0` target framework. Everything below is written against the GA behavior, not previews.

---

## Content

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Platform and Release Model](#platform-and-release-model)
   - [.NET 10 at a Glance](#p1-net-10-at-a-glance)
   - [Support Policy and the Upgrade Clock](#p2-support-policy-and-the-upgrade-clock)
   - [Target Frameworks and Multi-Targeting](#p3-target-frameworks-and-multi-targeting)
   - [Runtime Flavors: CoreCLR, Native AOT, Mono/WASM](#p4-runtime-flavors-coreclr-native-aot-monowasm)
3. [Runtime and Performance](#runtime-and-performance)
   - [Escape Analysis and Stack Allocation](#r1-escape-analysis-and-stack-allocation)
   - [Devirtualization and De-Abstraction](#r2-devirtualization-and-de-abstraction)
   - [Inlining, Code Layout, and Loop Inversion](#r3-inlining-code-layout-and-loop-inversion)
   - [Garbage Collection: DATAS and Write Barriers](#r4-garbage-collection-datas-and-write-barriers)
   - [Tiered Compilation, OSR, and Dynamic PGO](#r5-tiered-compilation-osr-and-dynamic-pgo)
   - [Hardware Intrinsics and AVX10.2](#r6-hardware-intrinsics-and-avx102)
4. [C# 14 Language Features](#c-14-language-features)
   - [Extension Members](#l1-extension-members)
   - [The field Keyword](#l2-the-field-keyword)
   - [Null-Conditional Assignment](#l3-null-conditional-assignment)
   - [Implicit Span Conversions](#l4-implicit-span-conversions)
   - [Simple Lambda Parameters with Modifiers](#l5-simple-lambda-parameters-with-modifiers)
   - [nameof with Unbound Generics](#l6-nameof-with-unbound-generics)
   - [Partial Constructors, Partial Events, Compound Assignment](#l7-partial-constructors-partial-events-compound-assignment)
5. [SDK, Tooling, and Build](#sdk-tooling-and-build)
   - [File-Based Apps](#t1-file-based-apps)
   - [CLI Changes and Completions](#t2-cli-changes-and-completions)
   - [Publishing, Trimming, and Containers](#t3-publishing-trimming-and-containers)
6. [Libraries and BCL Additions](#libraries-and-bcl-additions)
   - [System.Text.Json Strict Mode](#b1-systemtextjson-strict-mode)
   - [Post-Quantum Cryptography](#b2-post-quantum-cryptography)
   - [Strings, Collections, Globalization, ZIP](#b3-strings-collections-globalization-zip)
   - [Diagnostics and Telemetry](#b4-diagnostics-and-telemetry)
7. [ASP.NET Core 10](#aspnet-core-10)
   - [Built-In Minimal API Validation](#a1-built-in-minimal-api-validation)
   - [OpenAPI 3.1, YAML, and XML Comments](#a2-openapi-31-yaml-and-xml-comments)
   - [Server-Sent Events](#a3-server-sent-events)
   - [Blazor State Persistence and Asset Preloading](#a4-blazor-state-persistence-and-asset-preloading)
   - [Passkeys and Auth Metrics](#a5-passkeys-and-auth-metrics)
   - [Hosting and Throughput Changes](#a6-hosting-and-throughput-changes)
8. [EF Core 10](#ef-core-10)
   - [Named Query Filters](#e1-named-query-filters)
   - [LeftJoin and RightJoin](#e2-leftjoin-and-rightjoin)
   - [ExecuteUpdateAsync with Ordinary Lambdas](#e3-executeupdateasync-with-ordinary-lambdas)
   - [Complex Types and JSON Columns](#e4-complex-types-and-json-columns)
9. [Junior (0–2 Years)](#junior-0-2-years)
   - [What is .NET 10 and how does it relate to .NET Framework?](#j1-what-is-net-10-and-how-does-it-relate-to-net-framework)
   - [What does LTS mean and why does it matter?](#j2-what-does-lts-mean-and-why-does-it-matter)
   - [What is a target framework moniker?](#j3-what-is-a-target-framework-moniker)
   - [How do you upgrade a project to .NET 10?](#j4-how-do-you-upgrade-a-project-to-net-10)
   - [What is the field keyword for?](#j5-what-is-the-field-keyword-for)
   - [What are extension members?](#j6-what-are-extension-members)
   - [What is dotnet run app.cs?](#j7-what-is-dotnet-run-appcs)
   - [How do you validate a Minimal API request in .NET 10?](#j8-how-do-you-validate-a-minimal-api-request-in-net-10)
   - [What is the difference between the JIT and Native AOT?](#j9-what-is-the-difference-between-the-jit-and-native-aot)
   - [Where do runtime settings come from?](#j10-where-do-runtime-settings-come-from)
10. [Mid (2–5 Years)](#mid-2-5-years)
    - [Which .NET 10 changes speed up code you did not touch?](#m1-which-net-10-changes-speed-up-code-you-did-not-touch)
    - [When do extension members replace extension methods?](#m2-when-do-extension-members-replace-extension-methods)
    - [How do you harden JSON deserialization?](#m3-how-do-you-harden-json-deserialization)
    - [How does built-in validation compare to FluentValidation?](#m4-how-does-built-in-validation-compare-to-fluentvalidation)
    - [When would you choose Server-Sent Events over SignalR?](#m5-when-would-you-choose-server-sent-events-over-signalr)
    - [What broke when OpenAPI moved to 3.1?](#m6-what-broke-when-openapi-moved-to-31)
    - [How do you make a service Native AOT compatible?](#m7-how-do-you-make-a-service-native-aot-compatible)
    - [How do you use named query filters for multitenancy plus soft delete?](#m8-how-do-you-use-named-query-filters-for-multitenancy-plus-soft-delete)
    - [How do you benchmark a .NET 10 upgrade honestly?](#m9-how-do-you-benchmark-a-net-10-upgrade-honestly)
    - [What is the migration risk of file-based apps?](#m10-what-is-the-migration-risk-of-file-based-apps)
11. [Senior (5+ Years)](#senior-5-years)
    - [Explain escape analysis and why it is not a guarantee](#s1-explain-escape-analysis-and-why-it-is-not-a-guarantee)
    - [How does DATAS change capacity planning?](#s2-how-does-datas-change-capacity-planning)
    - [How do you roll out an LTS upgrade across many services?](#s3-how-do-you-roll-out-an-lts-upgrade-across-many-services)
    - [How do you design for crypto agility and PQC?](#s4-how-do-you-design-for-crypto-agility-and-pqc)
    - [How do extension members affect API and binary compatibility?](#s5-how-do-extension-members-affect-api-and-binary-compatibility)
    - [How do you diagnose a regression that only appears on .NET 10?](#s6-how-do-you-diagnose-a-regression-that-only-appears-on-net-10)
    - [How do you architect Blazor state across prerender and reconnect?](#s7-how-do-you-architect-blazor-state-across-prerender-and-reconnect)
    - [What is your policy on source generators in .NET 10?](#s8-what-is-your-policy-on-source-generators-in-net-10)
    - [How do you decide between EF Core 10 features and raw SQL?](#s9-how-do-you-decide-between-ef-core-10-features-and-raw-sql)
    - [What does a .NET 10 production readiness review look like?](#s10-what-does-a-net-10-production-readiness-review-look-like)
12. [Migration Playbook](#migration-playbook)
13. [Rapid Answers](#rapid-answers)
14. [Quick Interview Checklist](#quick-interview-checklist)
15. [Glossary](#glossary)

---

## How to Use This Guide

[↑ Content](#content)

- **Junior:** Know what .NET 10 *is* — LTS cadence, TFMs, SDK vs runtime, and the handful of C# 14 features you will actually type.
- **Mid:** Explain which changes are free (runtime/JIT) versus which require code changes, and pick correctly between new built-ins and existing libraries.
- **Senior:** Own the upgrade as an engineering program — rollout, measurement, compatibility, security posture, and the cost of adopting each new feature.

Answer live questions in this shape:

1. **What changed** in one sentence.
2. **Why the platform changed it** — the problem it removes.
3. **What it costs** — a limitation, a breaking change, or a case where it does not apply.
4. **Whether you would adopt it**, and on what evidence.

The weakest .NET 10 answer is a memorized feature list. The strongest one distinguishes *"I get this for free by retargeting"* from *"this needs a rewrite,"* because that distinction is the actual planning question.

---

## Platform and Release Model

### P1. .NET 10 at a Glance

[↑ Content](#content)

| Fact | Value |
|------|-------|
| Release | November 2025 |
| Support track | **LTS** — three years, to November 2028 |
| Language | **C# 14** (default `LangVersion` for `net10.0`) |
| TFM | `net10.0`, plus OS-specific variants like `net10.0-windows`, `net10.0-android` |
| Companion releases | ASP.NET Core 10, EF Core 10, Blazor, MAUI, all versioned in lockstep |

The release cadence is fixed: a new major version every November, alternating **LTS** (even numbers, 36 months) and **STS** (odd numbers, 18 months). This is a *calendar* commitment, not a feature commitment — features ship when ready and slip to the next November if not.

**Deeper understanding**

The single-version-number scheme (runtime, SDK, ASP.NET Core, EF Core all at 10.x) is deliberate. It means "we run .NET 10" is an unambiguous statement about your whole stack, which is what makes fleet-wide upgrade policy tractable.

---

### P2. Support Policy and the Upgrade Clock

[↑ Content](#content)

Two dates drive every upgrade conversation:

| Version | Track | End of support |
|---------|-------|----------------|
| .NET 8 | LTS | November 2026 |
| .NET 9 | STS | May 2026 (already ended) |
| .NET 10 | LTS | November 2028 |

Support means **security patches**. After the end date you keep running, but unpatched — which fails most compliance regimes, not just good taste.

**Deeper understanding**

- Patch versions (10.0.x) ship monthly on Patch Tuesday and are **required**, not optional; the servicing policy only supports the latest patch.
- Staying on the LTS train means one upgrade every two years. Staying current means one every year. Pick one deliberately — the expensive pattern is drifting until you are forced to jump two majors under time pressure.
- **Interview line:** "The LTS/STS choice is a staffing decision, not a technical one. LTS buys you fewer upgrades at the cost of a bigger jump each time."

---

### P3. Target Frameworks and Multi-Targeting

[↑ Content](#content)

```xml
<PropertyGroup>
  <TargetFramework>net10.0</TargetFramework>
  <LangVersion>14.0</LangVersion>
  <Nullable>enable</Nullable>
  <ImplicitUsings>enable</ImplicitUsings>
  <InvariantGlobalization>true</InvariantGlobalization>
</PropertyGroup>
```

Libraries often multi-target so they can serve consumers on older runtimes:

```xml
<TargetFrameworks>net10.0;net8.0;netstandard2.0</TargetFrameworks>
```

| Concept | Meaning |
|---------|---------|
| **TFM** | The API surface you compile against (`net10.0`) |
| **`netstandard2.0`** | Lowest common denominator; still needed for .NET Framework consumers |
| **Roll-forward** | A `net8.0` app can run on the .NET 10 runtime; the reverse is not true |
| **`LangVersion`** | Language features are mostly separable from the runtime — but not entirely |

**Deeper understanding**

Some C# 14 features need runtime or library support that only exists on `net10.0` (for example, implicit span conversions rely on newer framework surface). Setting `LangVersion=14.0` on an older TFM gives you *most* of the language, and a compile error on the rest. Multi-targeting plus `#if NET10_0_OR_GREATER` is the honest way to handle it.

---

### P4. Runtime Flavors: CoreCLR, Native AOT, Mono/WASM

[↑ Content](#content)

| Flavor | How code runs | Best for | Main cost |
|--------|---------------|----------|-----------|
| **CoreCLR + JIT** | IL compiled at runtime, re-optimized with profile data | Long-running servers | Startup latency, memory floor |
| **Native AOT** | Compiled to a native binary ahead of time | CLI tools, serverless, short-lived containers | No JIT, restricted reflection, no runtime codegen |
| **Mono / WASM** | Interpreter or AOT to WebAssembly | Blazor WebAssembly, mobile | Throughput, download size |

**Deeper understanding**

The JIT wins on *steady-state throughput* precisely because it can observe the running program: tiering promotes hot methods, and dynamic PGO specializes them against real call patterns. Native AOT wins on *time-to-first-request* and memory, because there is no compilation work and no JIT data structures.

The decision rule: if the process lives for minutes or hours, JIT. If it lives for milliseconds or is billed per invocation, evaluate AOT.

---

## Runtime and Performance

### R1. Escape Analysis and Stack Allocation

[↑ Content](#content)

**Escape analysis** asks one question about each allocation: *can any reference to this object outlive the method?* If the JIT can prove it cannot, the object is placed on the stack instead of the heap.

.NET 9 introduced limited escape analysis. .NET 10 extends stack allocation to:

- **Small arrays of value types** (fixed, known length, non-escaping)
- **Small arrays of reference types**
- **Delegates and closures** that do not escape
- More cases involving spans and inlined helpers

```csharp
static int Sum()
{
    // .NET 10 can allocate this on the stack: fixed size, never escapes.
    int[] values = [1, 2, 3, 4];
    var total = 0;
    foreach (var v in values) total += v;
    return total;
}
```

**Deeper understanding**

Stack allocation is cheap twice over: allocation is a pointer bump, and deallocation is free when the frame pops. The bigger win is *indirect* — the object never enters a GC generation, so it never contributes to a collection.

Why it is not a guarantee:

| Blocker | Reason |
|---------|--------|
| Object returned or stored in a field | It escapes by definition |
| Passed to a method the JIT cannot see through | Unknown callee, must assume escape |
| Non-constant or large size | Stack space is bounded |
| Inlining did not happen | Escape analysis runs after inlining; no inline, no visibility |

The practical takeaway for interviews: **this is an optimization, not a contract.** Write allocation-light code where it matters and let the JIT remove what it can. Never design correctness around it.

---

### R2. Devirtualization and De-Abstraction

[↑ Content](#content)

A virtual or interface call blocks inlining, because the JIT does not know the target body. **Devirtualization** resolves the call to a concrete method so it can be inlined and optimized.

.NET 10 adds notable cases:

- **Array interface method devirtualization** — calling `IEnumerable<T>`, `IList<T>`, or `ICollection<T>` members on something the JIT knows is an array now resolves to the array implementation.
- **Array enumeration de-abstraction** — `foreach` over an array typed as an interface can collapse to an index loop with no enumerator allocation.

```csharp
static int Count(IEnumerable<int> source)
{
    // If the JIT sees (via inlining/PGO) that source is int[],
    // the enumerator is devirtualized and often stack-allocated or removed.
    var n = 0;
    foreach (var _ in source) n++;
    return n;
}
```

**Deeper understanding**

Devirtualization is the enabling step, not the payoff. The payoff is the chain it unlocks: devirtualize → inline → constant-fold → eliminate bounds checks → stack-allocate. This is why the .NET team calls it *de-abstraction*: the goal is that idiomatic, interface-heavy C# costs roughly what hand-written loops cost.

**Interview line:** "The point of the .NET 10 JIT work is that you should not have to un-abstract your code to make it fast."

---

### R3. Inlining, Code Layout, and Loop Inversion

[↑ Content](#content)

| Change | What it does |
|--------|--------------|
| **Profile-driven inlining** | The inliner consults profile data, so hot call sites get a larger inlining budget and cold ones get less |
| **Improved code layout** | Blocks are reordered so hot paths are contiguous; cold paths (throw helpers, error handling) move out of line |
| **Improved loop inversion** | More loops are rewritten into a bottom-tested form, removing a branch per iteration |
| **Better struct argument codegen** | Fewer copies and stack spills when passing structs |

**Deeper understanding**

Code layout matters because of the instruction cache and the branch predictor, not instruction count. Pushing rarely-taken blocks away from the hot path means more of the loop body fits in cache lines that are actually used.

These optimizations require **profile data** to be at their best, which is why they interact directly with tiered compilation and dynamic PGO ([R5](#r5-tiered-compilation-osr-and-dynamic-pgo)). A short-lived process may never reach tier 1 and may never see them.

---

### R4. Garbage Collection: DATAS and Write Barriers

[↑ Content](#content)

The .NET **garbage collector** is a tracing, generational, compacting collector. You allocate with `new`; you almost never free. The GC starts from **roots** (locals, statics, CPU registers, GC handles), follows object references, and reclaims anything unreachable. The **generational hypothesis** is the design bet: most objects die young, so collecting a small nursery frequently is cheaper than scanning the whole heap.

| Heap / generation | Role |
|-------------------|------|
| **Gen0** | Nursery. Collected often. Cheap when survival is low |
| **Gen1** | Buffer between nursery and old generation |
| **Gen2** | Long-lived data. Expensive; usually collected in the background |
| **LOH** | Large Object Heap — objects ≥ 85,000 bytes; not compacted by default |
| **POH** | Pinned Object Heap — keeps pins off the compacting small-object heap |

Two modes:

- **Workstation GC** — one heap, one collecting thread (plus background). Default for client apps. Lower memory, longer pauses under allocation pressure.
- **Server GC** — one heap per core, parallel collection. Default for ASP.NET. Historically sized by **core count**, not by how much live data the process actually holds.

A **write barrier** is the tax that makes generational collection correct. If an old object starts pointing at a young one, a gen0 collection that only scanned gen0 would miss that reference and collect a live object. The JIT therefore inserts a barrier on every reference-field store so the GC can mark a **card** (and, with regions, a more precise dirty bit) and know which old-gen areas to re-scan. Barriers run on the mutator path; they are not free.

**.NET 10 GC updates**

.NET 10 is the first **LTS** that ships **DATAS** (Dynamic Adaptation To Application Sizes) as the default Server GC policy. DATAS itself arrived as opt-in in .NET 8 and became default in .NET 9; most fleets will feel it for the first time on this upgrade. The other headline is **Arm64 write barriers** catching up with x64, plus JIT work that **elides barriers** when it can prove a store cannot hit the heap.

**DATAS** sizes the heap to **live data size (LDS)** — roughly the old-generation occupancy after fragmentation — rather than to core count. It is a hybrid of the two classic modes: it starts with one heap (like workstation), grows toward core count under allocation pressure (like server), and shrinks again when the workload lightens.

| Before DATAS | With DATAS |
|--------------|------------|
| Server GC allocated heaps per core | Heap count and size adapt to live data |
| A small service on a 64-core host reserved a large heap | Heap grows and shrinks with the workload |
| Same app, different machines → wildly different heaps | Similar heaps for similar live data, regardless of core count |
| Container memory limits were easy to blow | Far better density in containers |

How it keeps a bound without collapsing throughput:

1. **BCD** (Budget Computed via DATAS) caps the gen0 allocation budget as a function of LDS — the heap cannot grow unbounded relative to long-lived data.
2. Within that cap, DATAS targets a **TCP** (Throughput Cost Percentage) of **2%** by default — GC pause time plus time allocating threads spend waiting. A lighter workload gets a smaller gen0 budget so memory comes back; a heavier one is allowed to spend up to the BCD.
3. Heap count is adjusted automatically. Setting `GCHeapCount` yourself **disables DATAS**, because a fixed heap count is the opposite of adapting.

```bash
DOTNET_GCDynamicAdaptationMode=1   # enable (default on Server GC)
DOTNET_GCDynamicAdaptationMode=0   # disable, restore classic server GC sizing
# Optional: raise the TCP target if you want more memory / fewer GCs
# GCDTargetTCP=5
```

**Arm64 write barriers.** On x64 the runtime has long used a **WriteBarrierManager**: many specialized `JIT_WriteBarrier` implementations, with the GC copying the right one over the global helper as GC state changes. .NET 10 brings that design to Arm64 — about ten variants, including more precise **region** marking (bit or byte in the card table) instead of one universal helper. The default is more precise about which regions are dirty, so collections scan less. Microsoft's benchmarks report **GC pause improvements from 8% to over 20%** on Arm64, at a slight cost to barrier throughput. That is the number that matters for Graviton/Ampere fleets.

**Barrier elision.** Independently of Arm64, .NET 10 requires **return buffers for structs to live on the stack**. Previously a callee writing a struct that contains references had to emit write barriers in case the hidden return buffer pointed at the heap. Stack is not GC-tracked, so those barriers disappear. The win shows up in code that returns medium structs with references through several layers without inlining.

**Deeper understanding**

DATAS is unlike most GC features: it is **not** a free throughput win. It trades some allocation throughput and more frequent ephemeral GCs for a heap that tracks live data. That is the right trade for bursty services in containers — the memory you give back can be used by other pods, and capacity planning stops depending on which SKU the process landed on. It is the wrong trade when you have a dedicated host, a large steady heap, and no use for freed memory.

When DATAS is a poor fit (turn it off and measure):

| Situation | Why |
|-----------|-----|
| Dedicated host, maximize peak RPS | You will not use the memory DATAS frees |
| Startup latency is the SLO | DATAS starts at one heap and ramps; classic Server GC starts at full heap count |
| Zero tolerance for throughput loss | Default TCP is 2%; classic Server GC may sit lower |
| Workload is almost all gen2 (temporary LOH traffic) | DATAS is tuned around ephemeral GCs |

If DATAS is close but not quite: raise `GCDTargetTCP` before disabling it. Do not set `GCHeapCount` and expect DATAS to still adapt.

The write-barrier work is the opposite kind of change: **pauses get cheaper** because collections scan more precisely, and some mutator stores stop paying a barrier at all. Combined with [escape analysis](#r1-escape-analysis-and-stack-allocation), fewer objects ever enter a generation, so DATAS has less to manage.

**Interview line:** "The GC still collects generations; .NET 10 changes *how big the heap is allowed to be* (DATAS on LTS) and *how cheap it is to keep generational tracking correct* (Arm64 barriers and stack return buffers)."

**Related concepts:** [Escape Analysis](#r1-escape-analysis-and-stack-allocation) reduces the work DATAS has to manage in the first place. [S2](#s2-how-does-datas-change-capacity-planning) is the capacity-planning follow-up.

---

### R5. Tiered Compilation, OSR, and Dynamic PGO

[↑ Content](#content)

```text
 Method first called
        │
        ▼
   Tier 0  ── fast to compile, minimal optimization, instrumented
        │        │
        │        └── counts call frequency, records types at call sites
        │
   (hot: ~30 calls, or OSR for long-running loops)
        │
        ▼
   Tier 1  ── fully optimized, guided by the collected profile
```

| Mechanism | Problem it solves |
|-----------|-------------------|
| **Tier 0** | Startup — most methods run once, so optimizing them is wasted work |
| **OSR** (On-Stack Replacement) | A method stuck in a long loop would never be re-entered; OSR swaps the optimized body in mid-execution |
| **Dynamic PGO** | Tier 1 needs to know which types and branches are hot; instrumentation at tier 0 supplies it |
| **Guarded devirtualization** | Emits `if (type == Foo) { inlined fast path } else { virtual call }` based on observed types |

**Deeper understanding**

This is the mechanism behind almost every .NET 10 performance headline. Practical consequences:

- **Benchmarks must warm up.** A cold measurement measures tier 0, not your application.
- **Startup-sensitive workloads** may benefit from ReadyToRun (precompiled tier-0 replacement) or Native AOT.
- **Profile-guided decisions are per-process.** Two identical pods can end up with different optimized code if their traffic mix differs.

---

### R6. Hardware Intrinsics and AVX10.2

[↑ Content](#content)

.NET 10 adds `System.Runtime.Intrinsics.X86.Avx10v2`. Because AVX10.2 hardware was not yet available at release, JIT support is **disabled by default**.

```csharp
if (Vector512.IsHardwareAccelerated)
{
    // width-agnostic vectorized path
}
```

**Deeper understanding**

Write vectorized code against `Vector<T>`, `Vector128/256/512<T>`, or — better — against `System.Numerics.Tensors.TensorPrimitives` and the vectorized BCL methods (`SearchValues<T>`, `MemoryExtensions`). Hand-written intrinsics tie you to one ISA and one hardware generation; the width-agnostic APIs let the runtime pick the best implementation on each machine.

**Interview line:** "The correct answer to 'should we use AVX intrinsics' is usually 'first check whether the BCL already vectorized it for us.'"

---

## C# 14 Language Features

### L1. Extension Members

[↑ Content](#content)

The headline C# 14 feature. Extension **methods** have existed since C# 3; C# 14 generalizes them to extension **properties**, **static members**, and **operators**, via an `extension` block that declares the receiver once.

```csharp
public static class SequenceExtensions
{
    // Instance-style members: receiver is named
    extension<T>(IEnumerable<T> source)
    {
        public bool IsEmpty => !source.Any();

        public IEnumerable<T> WhereNotNull() => source.Where(x => x is not null);
    }

    // Static-style members: receiver type only, no name
    extension<T>(IEnumerable<T>)
    {
        public static IEnumerable<T> Empty => [];
    }
}

// Usage
if (orders.IsEmpty) { }
var none = IEnumerable<Order>.Empty;
```

The classic `this`-parameter syntax still works and still compiles to the same thing; the new form is additive, not a replacement.

**Deeper understanding**

| Capability | Supported? |
|------------|------------|
| Extension properties | Yes (computed only) |
| Static extension members | Yes |
| Extension operators | Yes |
| Extension **fields** | **No** — there is no place to store state |
| Auto-implemented extension properties | **No** — they would need a backing field |
| Overriding an existing member | **No** — the type's own member always wins |

The no-fields rule is the one interviewers probe. Extensions are compiled as static methods on a static class; there is no per-instance storage to attach. If you need state, you need a wrapper type or a `ConditionalWeakTable`, and you should ask whether you actually want an extension at all.

---

### L2. The `field` Keyword

[↑ Content](#content)

`field` refers to the compiler-synthesized backing field of an auto-property, so you can add logic to one accessor without hand-writing the field and both accessors.

```csharp
// Before C# 14
private string _message = "";
public string Message
{
    get => _message;
    set => _message = value ?? throw new ArgumentNullException(nameof(value));
}

// C# 14
public string Message
{
    get;
    set => field = value ?? throw new ArgumentNullException(nameof(value));
}
```

**Deeper understanding**

- It is a **contextual keyword**. If you already have a variable named `field` in scope inside an accessor, the property's backing field wins — this is a documented breaking change. Rename the local, or use `@field` for the identifier.
- It works for validation, normalization, lazy initialization, and change notification (`INotifyPropertyChanged`), which is where the boilerplate savings compound.
- It does **not** change semantics: you still get exactly one backing field, and the property is still a property.

**Interview line:** "`field` closes the gap on the auto-property evolution path — you no longer pay a five-line refactor to add one null check."

---

### L3. Null-Conditional Assignment

[↑ Content](#content)

`?.` and `?[]` may now appear on the **left** of an assignment or compound assignment. The right-hand side is evaluated only when the receiver is non-null.

```csharp
// Before
if (customer is not null)
{
    customer.Order = GetCurrentOrder();
}

// C# 14
customer?.Order = GetCurrentOrder();
customer?.Balance += 10;
lookup?["key"] = value;
```

**Deeper understanding**

The short-circuit covers the whole statement: if `customer` is null, `GetCurrentOrder()` **never runs**. That is the subtle part interviewers check — it is not sugar for "assign to a null-safe target," it is sugar for the entire guarded block, side effects included.

Not supported: `??=` with a null-conditional receiver, and increment/decrement (`customer?.Count++`).

---

### L4. Implicit Span Conversions

[↑ Content](#content)

C# 14 recognizes first-class implicit conversions between `T[]`, `Span<T>`, and `ReadOnlySpan<T>`, and treats them as standard conversions during overload resolution, generic inference, and extension method lookup.

```csharp
void Process(ReadOnlySpan<byte> data) { }

byte[] buffer = new byte[128];
Process(buffer);            // implicit array → ReadOnlySpan<byte>

Span<byte> span = buffer;
Process(span);              // implicit Span<T> → ReadOnlySpan<T>
```

**Deeper understanding**

Previously these conversions were special-cased and did not participate uniformly in the language rules, so span-based overloads often lost to array-based ones and library authors had to write duplicate APIs. Making them standard conversions means span overloads are chosen naturally — which is what actually pushes allocation-free code into everyday call sites.

This is the clearest example of a **language feature that exists to unlock a runtime performance improvement**, and a good thing to name when asked "how do C# 14 and .NET 10 relate?"

---

### L5. Simple Lambda Parameters with Modifiers

[↑ Content](#content)

Lambda parameters can now carry `ref`, `out`, `in`, `scoped`, and `ref readonly` **without** repeating the type.

```csharp
delegate bool TryParse<T>(string text, out T result);

// Before: a modifier forced you to spell out every parameter type
TryParse<int> before = (string text, out int result) => int.TryParse(text, out result);

// C# 14: modifiers without types
TryParse<int> after = (text, out result) => int.TryParse(text, out result);
```

`params` still requires an explicit type. Small feature, but it removes friction from `TryParse`-shaped delegates and `ref struct` interop.

---

### L6. `nameof` with Unbound Generics

[↑ Content](#content)

```csharp
var name = nameof(List<>);            // "List"
var dict = nameof(Dictionary<,>);     // "Dictionary"
```

Useful in diagnostics, source generators, and logging where you want the type's name without inventing a dummy type argument. Previously you had to write `nameof(List<int>)` and hope nobody wondered why `int` was there.

---

### L7. Partial Constructors, Partial Events, Compound Assignment

[↑ Content](#content)

| Feature | Purpose |
|---------|---------|
| **Partial constructors** | A source generator supplies the body while the developer declares the signature |
| **Partial events** | Same split for events |
| **User-defined compound assignment** | Declare `operator +=` directly, so `x += y` mutates in place instead of allocating a new instance |

```csharp
public struct BigCounter
{
    public long Value;

    // Mutates in place — no new instance for x += y
    public void operator +=(long other) => Value += other;
}
```

**Deeper understanding**

Partial members are infrastructure for the **source generator** ecosystem: generators can now fill in constructors and events, not just methods and properties. User-defined compound assignment is a performance feature for large value types and buffer-like types where the old "compute a new value and assign it" pattern copied more than necessary.

---

## SDK, Tooling, and Build

### T1. File-Based Apps

[↑ Content](#content)

.NET 10 can build, run, and publish a single `.cs` file with no project file.

```csharp
#!/usr/bin/env dotnet
#:sdk Microsoft.NET.Sdk.Web
#:package Humanizer@2.14.1
#:property PublishAot=false

var builder = WebApplication.CreateBuilder();
var app = builder.Build();
app.MapGet("/", () => "Hello from a single file");
app.Run();
```

```bash
dotnet run app.cs          # build and run
dotnet app.cs              # shorthand
dotnet publish app.cs      # native AOT by default
dotnet project convert app.cs   # graduate to a real project
```

| Directive | Purpose |
|-----------|---------|
| `#:sdk` | Choose the SDK (`Microsoft.NET.Sdk.Web`, etc.) |
| `#:package` | Reference a NuGet package |
| `#:project` | Reference a project on disk |
| `#:property` | Set an MSBuild property |
| `#:include` | Pull in another source file |

**Deeper understanding**

The target audience is scripts, learning, prototypes, and small tools — the space where people reach for Python or a shell script because `dotnet new console` felt heavy. Notable behaviors:

- **Native AOT is on by default for publish**, which is why `#:property PublishAot=false` exists for reflection-heavy packages.
- Shebang support means a `.cs` file can be a cross-platform executable script.
- Launch settings live in a flat `[AppName].run.json` next to the source.
- `dotnet project convert` is the escape hatch, and the answer to "isn't this a dead end?"

**Interview line:** "It lowers the floor for starting, without lowering the ceiling — one command converts it to a normal project."

---

### T2. CLI Changes and Completions

[↑ Content](#content)

```bash
dotnet completions script powershell   # also bash, zsh, fish, nushell
dotnet package add Serilog             # noun-first verb structure
dotnet tool exec <tool>                # run a tool without installing it
```

- `dotnet` commands are interactive by default in terminals (credential prompts, etc.); pass `--interactive false` in CI.
- MSBuild task authoring supports out-of-process execution, with the caveat that Host Objects are not yet supported there.

Small stuff, but "how does your CI pin and restore tools?" is a fair follow-up, and `dotnet tool exec` plus a committed `dotnet-tools.json` is the modern answer.

---

### T3. Publishing, Trimming, and Containers

[↑ Content](#content)

| Mode | Command | Trade-off |
|------|---------|-----------|
| Framework-dependent | `dotnet publish` | Smallest artifact, requires runtime installed |
| Self-contained | `-p:SelfContained=true` | No runtime dependency, larger |
| ReadyToRun | `-p:PublishReadyToRun=true` | Faster startup, still JIT-capable, bigger binary |
| Trimmed | `-p:PublishTrimmed=true` | Smaller, breaks unguarded reflection |
| Native AOT | `-p:PublishAot=true` | Fastest start, lowest memory, most restrictions |
| Container | `dotnet publish /t:PublishContainer` | Image built by the SDK, no Dockerfile |

**Deeper understanding**

Trimming and AOT fail in the same way: the linker cannot see reflection-driven code paths, so types get removed and you find out at runtime. Mitigations, in order of preference:

1. Use **source generators** instead of runtime reflection (JSON, regex, logging, DI registration, configuration binding, validation).
2. Honor the `IL2xxx` / `IL3xxx` analyzer warnings — treat them as errors in CI rather than suppressing.
3. Use `DynamicDependency` / `RequiresUnreferencedCode` annotations only where the first two are impossible.

---

## Libraries and BCL Additions

### B1. System.Text.Json Strict Mode

[↑ Content](#content)

.NET 10 adds `JsonSerializerOptions.Strict`, a read-only preset alongside `Default` and `Web`:

```csharp
var options = JsonSerializerOptions.Strict;
var dto = JsonSerializer.Deserialize<OrderDto>(payload, options);
```

| Strict turns on | Effect |
|-----------------|--------|
| `JsonUnmappedMemberHandling.Disallow` | Unknown properties throw instead of being ignored |
| `AllowDuplicateProperties = false` | Duplicate JSON keys throw |
| Case-sensitive binding | `orderid` no longer binds to `OrderId` |
| `RespectNullableAnnotations` | `null` for a non-nullable reference property throws |
| `RespectRequiredConstructorParameters` | Missing required constructor parameters throw |

Also new: `AllowDuplicateProperties` as a standalone option, and `PipeReader` support for streaming deserialization (`JsonSerializer.DeserializeAsync(PipeReader, ...)`), which ASP.NET Core 10 uses in MVC and Minimal APIs.

**Deeper understanding**

Duplicate-key handling is a real attack surface, not a purity concern. If a validating proxy reads the *first* occurrence of a key and your service reads the *last*, an attacker can make the two components disagree about the same request. `Strict` closes that class of parser-differential bug.

Compatibility runs one direction: something serialized with `Default` can be read with `Strict`, but not the reverse. `Strict` does **not** cover payload size or nesting depth — set `MaxDepth` and enforce request limits at the HTTP layer separately.

**Interview line:** "`Strict` adds no new validation logic; it turns on protections that already existed but were off for backward compatibility."

---

### B2. Post-Quantum Cryptography

[↑ Content](#content)

.NET 10 ships the three FIPS-standardized PQC algorithms:

| Type | Standard | Purpose | Status |
|------|----------|---------|--------|
| `MLKem` | FIPS 203 | Key encapsulation | **Stable** (some methods experimental) |
| `MLDsa` | FIPS 204 | Lattice-based signatures | `[Experimental]` `SYSLIB5006` |
| `SlhDsa` | FIPS 205 | Hash-based signatures | `[Experimental]` `SYSLIB5006` |
| `CompositeMLDsa` | Draft | Classical + PQ hybrid signatures | `[Experimental]` `SYSLIB5006` |

```csharp
using var kem = MLKem.GenerateKey(MLKemAlgorithm.MLKem768);
byte[] publicKey = kem.ExportSubjectPublicKeyInfo();
```

These types deliberately do **not** derive from `AsymmetricAlgorithm`. Instead of "construct then import," you use static factory methods to generate or import a key.

Availability depends on the platform crypto stack: **OpenSSL 3.5+** or a Windows build with CNG PQC support. Check `MLKem.IsSupported` before use.

**Deeper understanding**

The threat model is *harvest now, decrypt later* — an adversary records traffic today and decrypts it once quantum hardware exists. That makes PQC urgent for long-lived confidentiality (archives, health records, key exchange) and far less urgent for short-lived signatures.

Because three of the four APIs are experimental, the senior answer is about **crypto agility**, not adoption: put algorithm selection behind an abstraction, keep key material out of your domain code, and be ready to swap. See [S4](#s4-how-do-you-design-for-crypto-agility-and-pqc).

---

### B3. Strings, Collections, Globalization, ZIP

[↑ Content](#content)

| Area | Addition |
|------|----------|
| Strings | Normalization APIs over `ReadOnlySpan<char>`; UTF-8 hex conversion on `Convert` with no intermediate string |
| Comparison | **Numeric ordering** for string comparison — `"item2"` sorts before `"item10"`, and `"02"` equals `"2"` |
| Collections | More `TryAdd` / `TryGetValue` overloads on `OrderedDictionary<TKey, TValue>` |
| Date/time | `ISOWeek` overloads for `DateOnly`; a single-parameter `TimeSpan.FromMilliseconds(long)` overload, because optional parameters break inside LINQ expression trees |
| ZIP | Async ZIP APIs, plus large performance and memory improvements in `ZipArchive`; faster `GZipStream` over concatenated streams |
| Numerics | Left-handed matrix transforms; further `Tensor` / `TensorPrimitives` work |
| Options | AOT-safe `ValidationContext` constructor |

**Deeper understanding**

Numeric ordering is the one that changes behavior people can see. Opt in per comparison:

```csharp
var comparer = StringComparer.Create(CultureInfo.CurrentCulture, CompareOptions.NumericOrdering);

var files = new[] { "item10", "item2", "item1" };
Array.Sort(files, comparer);   // item1, item2, item10
```

It is **opt-in** for good reason: switching sort order silently would break persisted indexes, pagination cursors, and golden-file tests. Use it for user-facing lists; never for anything that a database or another system also sorts. Note that `NumericOrdering` is not valid for the index-based operations — `IndexOf`, `LastIndexOf`, `StartsWith`, `EndsWith` — because "where does this substring start" has no numeric meaning.

The async ZIP APIs matter for the same reason all async I/O does — a synchronous `ZipArchive` write on a request thread is a thread-pool starvation source under load.

---

### B4. Diagnostics and Telemetry

[↑ Content](#content)

| Addition | Why it matters |
|----------|----------------|
| Telemetry **schema URLs** on `ActivitySource` and `Meter` | Consumers can version and validate emitted semantics |
| Out-of-process trace support for `Activity` **events and links** | Richer traces from EventPipe/dotnet-trace without in-process collectors |
| **Rate-limited trace sampling** | Bound telemetry cost under traffic spikes instead of dropping randomly |

**Deeper understanding**

Sampling policy is an SRE decision with a production cost. Head-based sampling at a fixed percentage is cheap but loses rare failures; rate limiting bounds spend while keeping representation during spikes. Pair either with **tail-based sampling** in the collector for errors and slow requests, so the traces you keep are the ones you would have gone looking for.

Standard tooling to name in interviews: `dotnet-counters`, `dotnet-trace`, `dotnet-dump`, `dotnet-gcdump`, and OpenTelemetry via `Microsoft.Extensions.Diagnostics`.

---

## ASP.NET Core 10

### A1. Built-In Minimal API Validation

[↑ Content](#content)

Minimal APIs finally validate `DataAnnotations` attributes without an endpoint filter of your own.

```csharp
builder.Services.AddValidation();

app.MapPost("/users", (CreateUserRequest request) => TypedResults.Created($"/users/{request.Email}"));

public record CreateUserRequest(
    [property: Required, MinLength(3)] string Name,
    [property: Required, EmailAddress] string Email,
    [property: Range(18, 120)] int Age);
```

Failing requests return **400** with a `ProblemDetails` payload **before** the handler runs.

| Detail | Behavior |
|--------|----------|
| What is validated | Request body, query parameters, headers, route parameters |
| How | A **source generator** emits the validation logic — no runtime reflection, AOT-friendly |
| Custom rules | Custom `ValidationAttribute` or `IValidatableObject` |
| Response shape | Customizable via `IProblemDetailsService` |
| Package | APIs live in `Microsoft.Extensions.Validation` (usable outside ASP.NET Core) |

**Deeper understanding**

The trap: **the request type must be `public`.** The source generator only sees public types, so a DTO declared as an internal record next to the endpoint silently gets no validation. That is a great "have you actually used it?" interview question.

For records, note the `[property: ...]` prefix — without it the attribute lands on the constructor parameter, not the generated property.

Scope: DataAnnotations handles shape validation well. Cross-field rules, async checks (uniqueness), and rich conditional logic still belong in FluentValidation or the domain layer. See [M4](#m4-how-does-built-in-validation-compare-to-fluentvalidation).

---

### A2. OpenAPI 3.1, YAML, and XML Comments

[↑ Content](#content)

```csharp
builder.Services.AddOpenApi();

app.MapOpenApi();                    // /openapi/v1.json
app.MapOpenApi("/openapi/v1.yaml");  // YAML output
```

| Change | Impact |
|--------|--------|
| **OpenAPI 3.1** is the default | Full JSON Schema 2020-12 alignment |
| Nullable representation changed | `nullable: true` becomes `type: [ "string", "null" ]` — **breaking** for older tooling |
| YAML output | Cleaner diffs, multi-line descriptions |
| XML doc comments | Compiled into the document by a source generator, no runtime XML file |
| `Microsoft.OpenApi` 2.0 | New object model; custom transformers may need updating |
| `IOpenApiDocumentProvider` in DI | Generate the document at build time or in tests |
| Transformers | Document, operation, schema, and endpoint-specific transformers |

**Deeper understanding**

Two failure modes to raise before anyone else does:

1. **Client generators.** Some codegen tools still assume 3.0. Verify your generator supports 3.1, or pin the document version.
2. **Contract tests.** If you diff the OpenAPI document in CI, the 3.0→3.1 upgrade produces a large one-time diff. Regenerate the baseline deliberately and review it, rather than rubber-stamping it.

---

### A3. Server-Sent Events

[↑ Content](#content)

```csharp
app.MapGet("/stream", (CancellationToken ct) =>
    TypedResults.ServerSentEvents(GetUpdatesAsync(ct), eventType: "priceUpdate"));

static async IAsyncEnumerable<PriceUpdate> GetUpdatesAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        yield return await ReadNextAsync(ct);
    }
}
```

Events are modeled as `SseItem<T>` with an optional event type, id, and payload. Supported in both Minimal APIs and controllers.

**Deeper understanding**

| | SSE | WebSockets | SignalR |
|---|---|---|---|
| Direction | Server → client only | Bidirectional | Bidirectional |
| Transport | Plain HTTP | Upgrade handshake | Negotiates the best available |
| Reconnect | Built into the browser `EventSource` | Manual | Built in |
| Proxy friendliness | High (it is just HTTP) | Sometimes blocked | Falls back |
| Client | `EventSource`, no library | WebSocket API | SignalR client |

Choose SSE when the flow is genuinely one-directional — notifications, progress, log tails, token streaming from an LLM. Choose SignalR when you need groups, RPC-style calls back to the server, or transport fallback. Do not pick WebSockets just because they are more capable; you pay for the capability in operational complexity.

Watch out: each SSE stream holds a connection and a response for its lifetime. Cap concurrent streams and always honor the `CancellationToken`.

---

### A4. Blazor State Persistence and Asset Preloading

[↑ Content](#content)

Declarative state persistence removes the manual `PersistentComponentState` serialization dance:

```csharp
@code {
    [PersistentState]
    public List<Product>? Products { get; set; }

    protected override async Task OnInitializedAsync()
        => Products ??= await Catalog.GetProductsAsync();
}
```

State now survives **prerendering → interactive**, **enhanced navigation**, and — for Blazor Server — **circuit eviction and reconnection**.

Other notable Blazor 10 changes:

| Change | Benefit |
|--------|---------|
| WebAssembly framework asset **preloading** | Browser fetches `.wasm`/`.js` earlier, cutting time to interactive |
| Boot configuration inlined | One fewer round trip on startup |
| `NavigationManager.NotFound()` and `NotFoundPage` on the router | Real 404 semantics, even after streaming has started |
| Improved form validation | Nested-object and collection validation in `EditForm` |
| `HttpClient` response streaming on by default | Lower memory for large responses |
| Circuit state persistence | Users resume after a long disconnect |
| Hot Reload for WebAssembly | Faster inner loop |
| `OwningComponentBase` implements `IAsyncDisposable` | Correct async cleanup of scoped services |

**Deeper understanding**

`[PersistentState]` exists because prerendering fundamentally runs your initialization **twice** — once on the server to produce HTML, once again when the component becomes interactive. Without persistence you get a duplicated database call and a visible flicker as data is refetched. The attribute makes the server hand its result to the client.

The design question it raises: persisted state is **serialized and sent to the client**. Never mark secrets, tokens, or internal identifiers with `[PersistentState]`.

---

### A5. Passkeys and Auth Metrics

[↑ Content](#content)

ASP.NET Core Identity supports **WebAuthn / FIDO2 passkeys** out of the box: register a passkey, sign in with platform authenticators (Windows Hello, Touch ID, phone), no password.

New built-in metrics cover authentication and authorization:

- Sign-ins, sign-outs, challenges, forbids
- Authorization decisions
- Identity-specific counters (user creation, password checks, two-factor)

Also: `AddCookie` no longer issues a **login redirect for known API endpoints** — API calls get `401`/`403` instead of a `302` to a login page, which was a perennial source of confusing client behavior.

**Deeper understanding**

Passkeys are phishing-resistant because the credential is **bound to the origin** and the private key never leaves the authenticator — there is no shared secret to intercept, replay, or leak in a breach. The migration reality is that you run passwords and passkeys side by side for a long time, and your account-recovery flow becomes the weakest link. Say that part out loud in an interview; it is the answer most candidates skip.

Auth metrics matter because "logins are failing" was previously invisible without custom logging. Now it is a dashboard and an alert.

---

### A6. Hosting and Throughput Changes

[↑ Content](#content)

| Change | Why |
|--------|-----|
| **Automatic eviction from the memory pool** | Kestrel's pooled buffers are released back after traffic spikes instead of pinning peak memory forever |
| `PipeReader`-based JSON deserialization in MVC and Minimal APIs | Fewer copies on the request path |
| New **JSON Patch** implementation on `System.Text.Json` | Drops the `Newtonsoft.Json` dependency for `JsonPatchDocument` |
| Empty form values treated as `null` for nullable value types | Sane HTML form binding |
| Customizable HTTP.sys security descriptors | Windows-hosted scenarios |
| `.localhost` TLD support | Local multi-app development |
| Suppressible exception-handler diagnostics | Less log noise from handled exceptions |
| Better testing support for top-level statements | `WebApplicationFactory` works without a public `Program` workaround |

**Deeper understanding**

Memory pool eviction is the one to explain. Kestrel pools buffers to avoid per-request allocation, but the pool historically grew to peak demand and stayed there — so a service that saw one traffic spike held that memory for the life of the process, which looked exactly like a leak in container dashboards. Automatic eviction returns the memory when demand drops. Pair it with DATAS ([R4](#r4-garbage-collection-datas-and-write-barriers)) and the whole "our pods never give memory back" complaint largely disappears.

---

## EF Core 10

### E1. Named Query Filters

[↑ Content](#content)

EF supported exactly **one** global query filter per entity type, which forced you to `&&` soft delete and multitenancy into one lambda — and then made it impossible to disable just one of them.

```csharp
modelBuilder.Entity<Blog>()
    .HasQueryFilter("SoftDeletionFilter", b => !b.IsDeleted)
    .HasQueryFilter("TenantFilter", b => b.TenantId == _tenantId);

// Admin view: include deleted rows, but stay inside the tenant
var all = await context.Blogs
    .IgnoreQueryFilters(["SoftDeletionFilter"])
    .ToListAsync();
```

**Deeper understanding**

Before this, `IgnoreQueryFilters()` was all-or-nothing — asking for deleted rows also dropped your tenant isolation, which is a data-leak bug waiting to happen. Named filters make the dangerous operation explicit and narrow.

Guardrail worth mentioning: filters are baked into the compiled model, so a tenant id captured in the lambda must come from a scoped service the context resolves per request, never from a captured static.

---

### E2. LeftJoin and RightJoin

[↑ Content](#content)

```csharp
// EF Core 10
var rows = await context.Products
    .LeftJoin(
        context.Categories,
        p => p.CategoryId,
        c => c.Id,
        (p, c) => new { p.Name, Category = c != null ? c.Name : null })
    .ToListAsync();
```

Previously this required `GroupJoin` + `SelectMany` + `DefaultIfEmpty`, which most people copy-pasted without fully understanding.

**Deeper understanding**

- Method syntax only — LINQ **query syntax** still needs `DefaultIfEmpty()`.
- The right-side projection must handle `null`, because that is the entire point of an outer join.
- The generated SQL is a plain `LEFT JOIN` / `RIGHT JOIN`, which is far easier to read in a query plan than the old translation.

---

### E3. ExecuteUpdateAsync with Ordinary Lambdas

[↑ Content](#content)

```csharp
await context.Blogs
    .Where(b => b.IsActive)
    .ExecuteUpdateAsync(setters =>
    {
        setters.SetProperty(b => b.Views, b => b.Views + 1);
        if (renaming)
        {
            setters.SetProperty(b => b.Name, newName);
        }
    });
```

The setters argument is no longer an expression tree, so you can build updates with ordinary control flow instead of composing `Expression` objects by hand.

**Deeper understanding**

`ExecuteUpdate`/`ExecuteDelete` bypass the change tracker: one SQL statement, no entities loaded, no `SaveChanges`. Consequences to state before the interviewer does:

- Tracked entities in the context become **stale** — the in-memory copies do not see the update.
- Interceptors and `SaveChanges`-based auditing **do not run**.
- Optimistic concurrency tokens are **not checked** unless you put them in the `Where` clause yourself.

Use it for bulk maintenance and counters. Do not use it as the default write path for domain logic.

---

### E4. Complex Types and JSON Columns

[↑ Content](#content)

EF Core 10 expands complex types (value objects without identity) and can map them into **JSON columns**:

```csharp
modelBuilder.Entity<Blog>()
    .ComplexProperty(b => b.Metadata, m => m.ToJson());

// Query into the JSON document
var popular = await context.Blogs
    .Where(b => b.Metadata.ViewCount > 1000)
    .ToListAsync();

// Bulk update inside the JSON document
await context.Blogs.ExecuteUpdateAsync(s =>
    s.SetProperty(b => b.Metadata.ViewCount, b => b.Metadata.ViewCount + 1));
```

Also in EF Core 10: structs as complex types, the native `json` type on SQL Server 2025 / Azure SQL, vector search support, improved collection-parameter translation, and Cosmos DB full-text and hybrid search.

**Deeper understanding**

JSON columns are right for **document-shaped satellite data** you read with its parent: settings, metadata, snapshots of external payloads. They are wrong for anything you filter or join across at scale — indexing a JSON path helps, but it is not a substitute for a normalized column with a real index. The question to ask is "will anyone query this independently of its owner?" If yes, it is a table.

**Related concepts:** the EF Core sheet's [high-performance DAL guidance](./EF_Core_Interview_Cheat_Sheet.md#s10-how-do-you-design-a-high-performance-data-access-layer-using-ef-core) still applies unchanged.

---

## Junior (0-2 Years)

### J1. What is .NET 10 and how does it relate to .NET Framework?

[↑ Content](#content)

**.NET 10** is the current version of the modern, cross-platform, open-source .NET — the line that started as .NET Core and dropped the "Core" at version 5. **.NET Framework 4.8.1** is the legacy Windows-only implementation, which is still supported but receives no new features.

| | .NET 10 | .NET Framework 4.8.1 |
|---|---|---|
| Platforms | Windows, Linux, macOS | Windows only |
| Deployment | Side-by-side, self-contained, or AOT | Machine-wide, in-place |
| Development | Open source, GitHub | Closed, servicing only |
| Future | Yearly releases | Security fixes only |

**Deeper understanding**

They are separate products, not versions of one product. Migration is a port, not an upgrade: WCF server, WebForms, and AppDomains have no direct equivalent. `netstandard2.0` libraries are the bridge that lets shared code target both during a transition.

---

### J2. What does LTS mean and why does it matter?

[↑ Content](#content)

**LTS** (Long Term Support) means **three years** of patches; **STS** (Standard Term Support) means **eighteen months**. .NET 10 is LTS, supported through **November 2028**.

It matters because support means **security patches**. Running an unsupported runtime means known CVEs stay unpatched, which fails audits and, more concretely, gets you breached.

**Deeper understanding**

Most organizations adopt an LTS-only policy: one upgrade every two years, from LTS to LTS. Teams that ship continuously often ride every release, because a yearly one-version jump is smaller than a biennial two-version jump. Both are defensible. What is not defensible is having no policy.

---

### J3. What is a target framework moniker?

[↑ Content](#content)

The **TFM** in your project file declares which API surface you compile against.

```xml
<TargetFramework>net10.0</TargetFramework>
```

| TFM | Meaning |
|-----|---------|
| `net10.0` | Cross-platform .NET 10 |
| `net10.0-windows` | .NET 10 plus Windows-only APIs |
| `netstandard2.0` | Shared surface for older consumers, including .NET Framework |

**Deeper understanding**

A `net8.0` app **can** run on the .NET 10 runtime via roll-forward, but a `net10.0` app cannot run on the .NET 8 runtime. TFM sets the compile-time contract; the installed runtime sets what actually executes. Multi-targeting with `<TargetFrameworks>` lets one library serve several.

---

### J4. How do you upgrade a project to .NET 10?

[↑ Content](#content)

1. Install the .NET 10 SDK; confirm with `dotnet --info`.
2. Bump `<TargetFramework>` to `net10.0`.
3. Update `Microsoft.*` package references to 10.x.
4. Build and read every warning — especially obsoletions and analyzer messages.
5. Run the test suite.
6. Review the official **breaking changes** list for your workloads.
7. Deploy to a canary and compare latency, memory, and error rate against the old version.

**Deeper understanding**

The `dotnet-upgrade-assistant` tool automates steps 2–3 and flags known issues. Most .NET-to-.NET upgrades are uneventful; the friction is usually third-party packages that have not shipped a `net10.0` build, and behavior changes in ASP.NET Core rather than in the runtime.

---

### J5. What is the `field` keyword for?

[↑ Content](#content)

It lets you add logic to one accessor of an auto-property without declaring the backing field yourself.

```csharp
public string Name
{
    get;
    set => field = value?.Trim() ?? "";
}
```

**Deeper understanding**

The compiler still synthesizes exactly one backing field; you just get to name it `field`. Common uses: validation, trimming/normalization, lazy initialization, and `INotifyPropertyChanged`. The gotcha is that `field` is contextual — a local variable named `field` inside an accessor is now shadowed, which is a documented breaking change.

---

### J6. What are extension members?

[↑ Content](#content)

C# 14 generalizes extension methods so you can also add **properties**, **static members**, and **operators** to a type you do not own, using an `extension` block.

```csharp
public static class StringExtensions
{
    extension(string text)
    {
        public bool IsBlank => string.IsNullOrWhiteSpace(text);
    }
}

if (input.IsBlank) { }
```

**Deeper understanding**

You cannot add **fields**, so no auto-implemented extension properties — there is nowhere to store state. And you cannot override a real member of the type; the type's own member always wins. Old-style `this`-parameter extension methods still work and interoperate with the new syntax.

---

### J7. What is `dotnet run app.cs`?

[↑ Content](#content)

.NET 10's **file-based apps**: run a single `.cs` file directly, with no `.csproj`.

```csharp
#:package Spectre.Console@0.49.1

Console.WriteLine("No project file required.");
```

```bash
dotnet run app.cs
```

**Deeper understanding**

Directives (`#:package`, `#:sdk`, `#:property`, `#:project`, `#:include`) put the project configuration in the file itself. It is aimed at scripts, prototypes, and learning; `dotnet project convert app.cs` turns it into a normal project when it outgrows one file. Publishing uses Native AOT by default.

---

### J8. How do you validate a Minimal API request in .NET 10?

[↑ Content](#content)

```csharp
builder.Services.AddValidation();

app.MapPost("/orders", (CreateOrder order) => TypedResults.Ok());

public record CreateOrder([property: Required, Range(1, 100)] int Quantity);
```

Invalid requests get a **400** with `ProblemDetails` and the handler never runs.

**Deeper understanding**

The validation code is emitted by a **source generator**, so it works under Native AOT and costs nothing at startup. Two things trip people up: the DTO must be `public`, and on records you need the `[property: ...]` target so the attribute reaches the generated property rather than the constructor parameter.

---

### J9. What is the difference between the JIT and Native AOT?

[↑ Content](#content)

| | JIT | Native AOT |
|---|---|---|
| When code is compiled | At runtime, on first call | At publish time |
| Startup | Slower — compilation happens live | Very fast |
| Peak throughput | Higher — re-optimizes using real profile data | Slightly lower |
| Memory | Higher floor | Lower |
| Reflection / `Reflection.Emit` | Full support | Restricted / unsupported |
| Deployment | Needs runtime or self-contained bundle | Single native executable |

**Deeper understanding**

The JIT's advantage is information: it sees which types actually flow through a call site and specializes accordingly. AOT gives that up in exchange for starting instantly. Long-lived services want the JIT; CLI tools and short-lived serverless functions often want AOT.

---

### J10. Where do runtime settings come from?

[↑ Content](#content)

| Source | Example |
|--------|---------|
| Project properties | `<ServerGarbageCollector>true</ServerGarbageCollector>` |
| `runtimeconfig.json` | Generated at build; `System.GC.Server`, `System.GC.Concurrent` |
| Environment variables | `DOTNET_GCDynamicAdaptationMode`, `DOTNET_TieredPGO` |
| Configuration (app-level) | `appsettings.json`, environment variables, user secrets, Key Vault |

**Deeper understanding**

Keep runtime knobs (GC mode, tiering) separate from application configuration (`IConfiguration`). Runtime knobs belong in the project file or the container definition so they are versioned with the deployment; application settings belong in the configuration pipeline so they can vary per environment.

---

## Mid (2-5 Years)

### M1. Which .NET 10 changes speed up code you did not touch?

[↑ Content](#content)

Retargeting to `net10.0` and redeploying gets you, with no code change:

| Change | Effect |
|--------|--------|
| Extended escape analysis and stack allocation | Fewer heap allocations for small arrays, delegates, closures |
| Array interface devirtualization and enumeration de-abstraction | Interface-typed array loops approach direct-loop cost |
| Profile-driven inlining and better code layout | Broad, small throughput gains |
| Arm64 write-barrier improvements | 8–20% lower GC pauses on Arm64 |
| DATAS tuning | Lower and more adaptive memory footprint |
| Kestrel memory pool eviction | Memory returned after traffic spikes |
| Faster `ZipArchive`, `GZipStream`, JSON paths | Workload-specific wins |

What requires code changes: C# 14 syntax, `JsonSerializerOptions.Strict`, `AddValidation()`, SSE endpoints, `[PersistentState]`, passkeys, and all EF Core 10 features.

**Deeper understanding**

That split is the whole planning conversation. The free tier justifies the upgrade on its own; the opt-in tier is a backlog you prioritize afterward. Presenting it this way — rather than as one undifferentiated feature list — is what a senior answer sounds like.

---

### M2. When do extension members replace extension methods?

[↑ Content](#content)

Reach for extension **members** when the thing you are adding is conceptually a property, a static factory, or an operator:

```csharp
extension(HttpResponseMessage response)
{
    public bool IsRateLimited => (int)response.StatusCode == 429;
}
```

Keep plain extension **methods** when the operation takes arguments, does real work, or might throw — a property that performs I/O or throws violates every expectation a caller has.

**Deeper understanding**

Constraints to name: no extension fields, no auto-implemented extension properties, no overriding an existing member, and the receiver must be resolvable statically. Also worth saying: extension members are **compile-time** dispatch. If the type later adds a real member with the same name, that member wins and your callers silently change behavior on recompile — a genuine versioning hazard for public libraries.

---

### M3. How do you harden JSON deserialization?

[↑ Content](#content)

```csharp
var options = new JsonSerializerOptions(JsonSerializerOptions.Strict)
{
    MaxDepth = 32
};
```

Layered defense:

1. **`JsonSerializerOptions.Strict`** — rejects duplicate keys, unmapped members, case mismatches, and null/required violations.
2. **`MaxDepth`** — bounds recursive payloads.
3. **Request size limits** at the HTTP layer — `Strict` does nothing about a 500 MB body.
4. **Source-generated contexts** (`JsonSerializerContext`) — faster, AOT-safe, and they constrain what can be deserialized.
5. **Never deserialize into polymorphic types you do not control** — the classic gadget-chain attack.

**Deeper understanding**

Duplicate-property rejection deserves its own sentence in the interview: when a gateway validates the first occurrence of a key and the service reads the last, the two components disagree about the same bytes. That is a parser-differential vulnerability, and it is exactly the class of bug `Strict` was added to close.

`Strict` is read-compatible with `Default` in one direction only, so you can tighten a consumer without changing producers.

---

### M4. How does built-in validation compare to FluentValidation?

[↑ Content](#content)

| | Built-in (`AddValidation`) | FluentValidation |
|---|---|---|
| Rule style | Attributes on the DTO | Fluent validator classes |
| Cross-field rules | `IValidatableObject`, awkward | Natural |
| Async rules (uniqueness) | Not supported | Supported |
| Dependency injection in rules | Limited | First class |
| AOT / trimming | Source-generated, AOT-safe | Reflection-based, needs care |
| Setup cost | One line | Registration plus a class per DTO |
| Testability | Test through the endpoint | Validators unit-test directly |

**Deeper understanding**

They compose. Use built-in DataAnnotations for **shape** validation at the boundary — required, length, range, format — because it is free, declarative, and returns consistent `ProblemDetails`. Use FluentValidation or domain invariants for **business rules**, which need dependencies, async calls, and real tests.

The anti-pattern is putting business rules in attributes: you end up with a `ValidationAttribute` doing a database call through a service locator, which is untestable and runs at the wrong layer.

---

### M5. When would you choose Server-Sent Events over SignalR?

[↑ Content](#content)

Choose **SSE** when: the flow is server-to-client only, the client is a browser (`EventSource` is built in), you want plain HTTP that proxies and CDNs already understand, and you do not need groups or RPC.

Choose **SignalR** when: you need client-to-server calls, group broadcast, connection management, transport fallback, or a scale-out backplane.

```csharp
app.MapGet("/notifications", (INotifier notifier, CancellationToken ct) =>
    TypedResults.ServerSentEvents(notifier.StreamAsync(ct), eventType: "notification"));
```

**Deeper understanding**

Operational cost is what actually decides it. Every SSE stream pins a connection and a response object for its lifetime, so a thousand subscribers is a thousand open responses. Bound it: cap concurrent streams per user, set an idle timeout, honor the `CancellationToken` on every yield, and make sure your load balancer's idle timeout is longer than your heartbeat interval — otherwise clients reconnect in a loop and you have built a self-inflicted retry storm.

SSE has become the default for streaming LLM tokens, which makes this a very current interview question.

---

### M6. What broke when OpenAPI moved to 3.1?

[↑ Content](#content)

| Change | Consequence |
|--------|-------------|
| Nullable representation | `nullable: true` → `type: ["string","null"]`; older tooling may not parse it |
| JSON Schema 2020-12 alignment | Some keyword semantics changed |
| `Microsoft.OpenApi` 2.0 object model | Custom document/operation transformers may need rewriting |
| XML comments now source-generated | No runtime XML file, but generation happens at build |

**Deeper understanding**

Mitigation order: check that your client generator supports 3.1; if it does not, either pin the emitted document version or generate clients from a converted 3.0 document during the transition. Regenerate contract-test baselines as one reviewed commit rather than letting a giant diff ride along with a feature change.

The lesson generalizes: **spec version upgrades break consumers, not producers.** Inventory who consumes your OpenAPI document before you upgrade.

---

### M7. How do you make a service Native AOT compatible?

[↑ Content](#content)

1. Enable the analyzers and treat their warnings as errors:

```xml
<PublishAot>true</PublishAot>
<IsAotCompatible>true</IsAotCompatible>
<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
```

2. Replace reflection with **source generators**: `JsonSerializerContext`, `[LoggerMessage]`, `[GeneratedRegex]`, source-generated configuration binding, source-generated validation.
3. Remove `Reflection.Emit`, dynamic proxy libraries, and runtime assembly scanning (many DI auto-registration and AutoMapper-style setups).
4. Prefer Minimal APIs; the AOT web template exists for a reason.
5. Test the **published** binary — AOT problems appear at runtime in the native output, never in a debug build.

**Deeper understanding**

The honest trade-off: AOT wins startup and memory, loses peak throughput and a lot of ecosystem convenience. It is right for CLI tools, sidecars, functions, and scale-to-zero workloads. For a long-running API that is already warm, the JIT plus dynamic PGO is usually faster, and the AOT constraints buy you nothing.

If your goal is only faster startup, try **ReadyToRun** first — far fewer restrictions.

---

### M8. How do you use named query filters for multitenancy plus soft delete?

[↑ Content](#content)

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext tenant)
    : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>()
            .HasQueryFilter("SoftDelete", o => !o.IsDeleted)
            .HasQueryFilter("Tenant", o => o.TenantId == tenant.Id);
    }
}

// Admin restore screen: show deleted orders, still scoped to the tenant
var deleted = await context.Orders
    .IgnoreQueryFilters(["SoftDelete"])
    .Where(o => o.IsDeleted)
    .ToListAsync();
```

**Deeper understanding**

Before EF Core 10 the two rules had to share one lambda, so `IgnoreQueryFilters()` disabled both — meaning the admin screen above would have silently returned **other tenants' data**. Named filters turn a data-leak footgun into a targeted, reviewable call.

Two rules to state: filters must be applied to every entity that carries a tenant id (write a convention loop, do not do it by hand), and the tenant value must be resolved per scope. A tenant id captured from a static or a singleton is baked into the model and will serve the wrong tenant.

---

### M9. How do you benchmark a .NET 10 upgrade honestly?

[↑ Content](#content)

1. **Same hardware, same data, same load shape.** A cloud instance-type difference will dwarf the runtime difference.
2. **Warm up.** Cold measurements measure tier 0, not your steady state.
3. **Measure percentiles, not averages** — p50, p95, p99. GC changes move tails, and tails are what users feel.
4. **Track memory properly**: working set, GC pause time, allocation rate, and gen2 collection count — not just RSS.
5. **Use BenchmarkDotNet for micro, load tests for macro.** A micro-benchmark that shows 30% never means the service got 30% faster.
6. **Change one variable.** Upgrading the runtime and adopting five features in one release makes attribution impossible.

**Deeper understanding**

Expect the biggest wins where allocations and GC dominate, and on Arm64. Expect near-nothing where you are bound on database or network latency — which describes most business services. Saying that plainly is a strength: the credible engineer sets expectations before the measurement, not after.

---

### M10. What is the migration risk of file-based apps?

[↑ Content](#content)

They are excellent for scripts, samples, and prototypes. The risks when they leak into production:

| Risk | Mitigation |
|------|-----------|
| No project file to hold analyzers, warning levels, CI config | Convert before it ships |
| Dependency versions pinned in a comment-like directive | Convert; use central package management |
| Native AOT default surprises reflection-based packages | `#:property PublishAot=false` |
| Limited multi-file support | Convert once it exceeds one file |
| Weaker IDE and debugging support than projects | Convert |

```bash
dotnet project convert tool.cs
```

**Deeper understanding**

The healthy policy: file-based apps are allowed anywhere a bash or Python script would be allowed, and must be converted the moment something is deployed or depended upon. The conversion is one command, so there is no reason to tolerate drift.

---

## Senior (5+ Years)

### S1. Explain escape analysis and why it is not a guarantee

[↑ Content](#content)

Escape analysis is a dataflow analysis that determines whether a reference to an allocation can be observed after the allocating method returns. If not, the allocation can move to the stack.

.NET 10 broadened it to small value-type arrays, small reference-type arrays, delegates, and closures.

**Why it cannot be relied upon:**

| Condition | Effect |
|-----------|--------|
| The allocation is returned or stored in a field | Escapes |
| It is passed to a callee the JIT did not inline | Must assume escape |
| Size is not a small constant | Stack budget |
| The method never reaches tier 1 | Optimization never applies |
| A future runtime changes the heuristics | Behavior shifts silently |

**Deeper understanding**

The correct engineering posture: treat escape analysis as a tax refund, not income. Structure genuinely hot paths so they do not allocate in the first place — `Span<T>`, `stackalloc`, pooled buffers, `ArrayPool<T>`, struct enumerators — and let the JIT clean up the incidental allocations in the other 95% of the code.

Verification, if it matters: inspect disassembly (`DOTNET_JitDisasm`), or measure with BenchmarkDotNet's `MemoryDiagnoser` and watch the allocation column go to zero. Never assert it from source alone.

---

### S2. How does DATAS change capacity planning?

[↑ Content](#content)

Classic server GC sized the heap by **core count**, so a small service on a large host reserved a large heap and never gave it back. DATAS sizes the heap by **live data**, adapting heap count and size to actual demand.

| Planning question | Before | With DATAS |
|-------------------|--------|------------|
| Container memory limit | Set generously or risk OOM kills | Can be set closer to real working set |
| Pod density | Low — each pod hoarded memory | Higher |
| Memory graph shape | Sawtooth to a high plateau | Tracks live data, shrinks when idle |
| Throughput | Slightly higher | Slightly lower under some loads |

**Deeper understanding**

Combine three .NET 10-era behaviors and the classic "our .NET pods never release memory" complaint mostly resolves: DATAS shrinking the heap, Kestrel evicting pooled buffers, and escape analysis removing allocations entirely.

When to turn DATAS **off**: a dedicated host with a large steady heap where you are optimizing raw throughput and memory is not scarce. Set `DOTNET_GCDynamicAdaptationMode=0` and measure both throughput and p99 pause before and after — do not do it on intuition.

Always set container memory limits explicitly. The GC reads the cgroup limit; an unlimited container makes the GC think it owns the node.

---

### S3. How do you roll out an LTS upgrade across many services?

[↑ Content](#content)

```text
Phase 1  Inventory      Services, TFMs, third-party packages, runtime images
Phase 2  Pathfinder     Upgrade one low-risk, well-monitored service end to end
Phase 3  Platform       Base images, shared libraries, templates, CI runners
Phase 4  Waves          Group by risk; keep old and new in prod simultaneously
Phase 5  Enforcement    CI check fails builds on unsupported TFMs
```

| Decision | Position |
|----------|----------|
| Retarget and adopt features together? | **No.** Retarget first, feature-adopt later |
| Big bang or waves? | Waves, with a canary in each |
| Shared libraries | Multi-target so both old and new consumers work during the transition |
| Rollback | Keep the previous image deployable for the whole wave |
| Deadline | Anchor to the **old** version's end-of-support date, minus a quarter |

**Deeper understanding**

The failure mode is not technical, it is scheduling: teams defer because the upgrade delivers no visible feature, and then three majors accumulate. Two things that work — make the base image upgrade a platform-team deliverable so product teams inherit it, and put a **hard CI gate** on unsupported TFMs with a date attached.

Measure the pathfinder service carefully and publish the numbers. A concrete "p99 dropped 12%, memory dropped 20%" does more to move an organization than any amount of policy.

---

### S4. How do you design for crypto agility and PQC?

[↑ Content](#content)

.NET 10 ships ML-KEM (stable), ML-DSA, SLH-DSA, and Composite ML-DSA (all `[Experimental]`, `SYSLIB5006`).

**Crypto agility principles:**

1. **Never hard-code an algorithm at the call site.** Route through an abstraction that resolves the algorithm from configuration and key metadata.
2. **Version your ciphertexts and signatures.** Store an algorithm identifier alongside the bytes so you can decrypt old data after rotating.
3. **Support two algorithms simultaneously** during migration — verify with either, sign with the new one.
4. **Separate key management from key use.** Keys come from a KMS/HSM; application code should not know how they are stored.
5. **Inventory first.** You cannot migrate crypto you have not found. Catalog TLS termination, JWT signing, data at rest, and signed artifacts.

**Deeper understanding**

Prioritize by threat model, not by novelty. *Harvest now, decrypt later* threatens **long-lived confidentiality** — archives, health and financial records, key exchange for data retained for years. Signatures on short-lived tokens are far less urgent, because a signature forged in 2035 on a token that expired in 2026 is worthless.

Practical stance for .NET 10: ML-KEM is stable enough to prototype hybrid key exchange. The signature types are experimental, so do not put them on a production critical path — invest in the abstraction now so the swap is a configuration change later.

---

### S5. How do extension members affect API and binary compatibility?

[↑ Content](#content)

| Concern | Detail |
|---------|--------|
| **Member shadowing** | If the underlying type later adds a real member with the same name, it wins and your extension becomes unreachable — callers silently change behavior on recompile |
| **Source vs binary** | Extensions compile to static calls, so adding one is source-compatible but consumers must recompile to see it |
| **Ambiguity** | Two extension members with the same name in two imported namespaces is a compile error at the call site, in *consumer* code |
| **Discoverability** | Extension properties look like real members in IntelliSense, which makes shadowing harder to notice |

**Deeper understanding**

For a public library, extension members are a **stronger commitment than they look**. The guidance I would give a team:

- Put extensions in a dedicated, explicitly imported namespace rather than the type's own namespace, so consumers opt in.
- Do not add extension members to types you expect to evolve — especially not to interfaces you also own, where a default interface member would be the right tool.
- Name defensively: `IsRateLimited` on `HttpResponseMessage` is a plausible future BCL member; `AcmeIsRateLimited` is ugly but safe. Pick per how likely the collision is.
- Never let an extension property throw or perform I/O. Callers treat properties as free.

---

### S6. How do you diagnose a regression that only appears on .NET 10?

[↑ Content](#content)

```text
1. Reproduce      Same input, same load, both runtimes, one variable changed
2. Classify       Throughput? Latency tail? Memory? Correctness?
3. Bisect config  Tiering, PGO, DATAS, ReadyToRun — toggle one at a time
4. Profile        dotnet-trace / dotnet-counters on both, compare
5. Isolate        Extract the hot path into a BenchmarkDotNet micro-benchmark
6. Report         File on dotnet/runtime with a minimal repro
```

Useful switches while bisecting:

```bash
DOTNET_TieredPGO=0                 # is dynamic PGO involved?
DOTNET_TieredCompilation=0         # always fully optimized; changes startup
DOTNET_GCDynamicAdaptationMode=0   # is DATAS involved?
DOTNET_ReadyToRun=0                # force JIT over precompiled code
```

**Deeper understanding**

Check the **breaking changes documentation** first. Most "runtime regressions" turn out to be intentional behavior changes in ASP.NET Core, `System.Text.Json`, or globalization — and a behavior change looks identical to a bug from inside your service.

For correctness differences specifically, suspect: culture and `InvariantGlobalization`, JSON serialization defaults, and floating-point formatting. For memory, suspect DATAS interacting with a container limit you never set.

Keep the old version deployable. A regression you can roll back from is an incident; one you cannot is an outage.

---

### S7. How do you architect Blazor state across prerender and reconnect?

[↑ Content](#content)

The core problem: with prerendering, component initialization runs **twice** — once server-side to emit HTML, again when the component becomes interactive. Naively that means duplicated queries and a visible flicker.

```csharp
@code {
    [PersistentState]
    public DashboardData? Data { get; set; }

    protected override async Task OnInitializedAsync()
        => Data ??= await Service.LoadAsync();   // the ??= is the whole trick
}
```

.NET 10 extends persistence to **enhanced navigation** and, for Blazor Server, to **circuit eviction and reconnection**.

| State kind | Where it belongs |
|------------|------------------|
| View data needed immediately on render | `[PersistentState]` |
| Secrets, tokens, internal ids | **Never** persisted — it is serialized to the client |
| Large datasets | Refetch; do not inflate the payload |
| Cross-session state | Server-side store keyed by user |
| Ephemeral UI state | Component fields |

**Deeper understanding**

Two design consequences worth stating unprompted. First, persisted state is **serialized and sent to the client**, so it is part of your attack surface and your payload budget; `[PersistentState]` on a large object model trades a database round trip for a bigger HTML document, which is not always a win. Second, circuit persistence changes the reconnect story from "your work is gone" to "your work resumes," which means you must now think about how *stale* the restored state may be — restore the shape of the UI, then revalidate the data.

---

### S8. What is your policy on source generators in .NET 10?

[↑ Content](#content)

Source generators moved from a nice optimization to the **default mechanism** for what used to be runtime reflection:

| Concern | Generator |
|---------|-----------|
| JSON | `JsonSerializerContext` |
| Logging | `[LoggerMessage]` |
| Regex | `[GeneratedRegex]` |
| Validation | `AddValidation()` in ASP.NET Core 10 |
| Configuration binding | Source-generated binder |
| OpenAPI XML comments | Build-time generator |
| COM / interop | `[LibraryImport]`, `[GeneratedComInterface]` |

C# 14's **partial constructors and partial events** exist largely to give generators more surface to fill in.

**Deeper understanding**

The policy I would set: **prefer a source generator over reflection wherever one exists**, because you get startup time, throughput, trimming safety, and compile-time errors instead of runtime ones — the same four benefits every time.

The costs to acknowledge: build time grows, generated code can be hard to debug (turn on `EmitCompilerGeneratedFiles` so you can read it), and generators are a compile-time dependency you now have to keep current. For *writing* your own, the bar should be high — incremental generators are subtle, and a badly written one degrades every build in the solution.

---

### S9. How do you decide between EF Core 10 features and raw SQL?

[↑ Content](#content)

| Situation | Choice |
|-----------|--------|
| Standard CRUD, domain writes | EF Core with change tracking |
| Read models, list screens | `AsNoTracking` + projection to DTO |
| Outer joins | `LeftJoin` / `RightJoin` (EF Core 10) |
| Bulk counter or flag updates | `ExecuteUpdateAsync` / `ExecuteDeleteAsync` |
| Multitenancy + soft delete | Named query filters |
| Document-shaped satellite data | Complex type mapped `ToJson()` |
| Reporting: CTEs, window functions, pivots | Raw SQL or a view |
| Measured hot path where translation is poor | Raw SQL, with the measurement in the commit message |

**Deeper understanding**

EF Core 10 narrows the raw-SQL gap considerably — outer joins and bulk updates were two of the most common reasons to drop out of LINQ. What has not changed is the decision rule: **stay in EF until you have a measurement that says otherwise**, then drop to SQL for that one query and leave the rest alone.

The costs of `ExecuteUpdate` deserve explicit mention in any senior answer: it skips the change tracker, so tracked entities go stale, `SaveChanges` interceptors and audit logic never fire, and concurrency tokens are not checked unless you put them in the `Where` clause yourself.

---

### S10. What does a .NET 10 production readiness review look like?

[↑ Content](#content)

**Platform**

- [ ] `net10.0`, latest patch, pinned base image digest
- [ ] Runtime settings versioned with the deployment, not ambient
- [ ] Container memory and CPU limits set explicitly

**Performance**

- [ ] Load-tested with warm-up; p50/p95/p99 recorded as a baseline
- [ ] GC mode chosen deliberately (DATAS on unless proven otherwise)
- [ ] Allocation hot paths profiled, not guessed

**Security**

- [ ] `JsonSerializerOptions.Strict` (or equivalent) at every deserialization boundary
- [ ] `MaxDepth` and request size limits configured
- [ ] Crypto behind an agile abstraction; algorithm identifiers stored with data
- [ ] Auth metrics dashboarded and alerting
- [ ] No secrets in persisted Blazor state

**Correctness**

- [ ] Breaking-changes list reviewed for every workload in use
- [ ] OpenAPI 3.1 consumers verified
- [ ] Validation covers body, query, headers, and route — with **public** DTOs

**Operability**

- [ ] Traces, metrics, and logs emitted with a sampling policy that survives a spike
- [ ] Slow-query and slow-request logging on
- [ ] Previous version still deployable for rollback

**Interview closer:** ".NET 10 gives you a large free performance tier just by retargeting, and a menu of opt-in features that each carry a cost. The engineering skill is separating those two lists and sequencing them — retarget, measure, then adopt what the measurement justifies."

---

## Migration Playbook

[↑ Content](#content)

```text
Step 1  Install SDK, verify with dotnet --info
Step 2  Bump TargetFramework to net10.0
Step 3  Update Microsoft.* packages to 10.x; check third-party support
Step 4  Build; read every new warning (obsoletions, analyzers, trim/AOT)
Step 5  Run tests; review the official breaking changes for your workloads
Step 6  Canary deploy; compare p50/p95/p99, memory, GC pauses, error rate
Step 7  Roll out in waves, previous version kept deployable
Step 8  Only now: adopt opt-in features, one per release
```

| Common friction | Fix |
|-----------------|-----|
| A package has no `net10.0` build | Usually still works via `net8.0` compatibility; check for a preview or replace it |
| OpenAPI consumers break | Verify 3.1 support in the client generator; regenerate baselines deliberately |
| A local named `field` in a property accessor | Rename, or use `@field` |
| Sort order changed | You opted into `CompareOptions.NumericOrdering` somewhere; audit persisted orderings |
| Memory graph looks different | Expected — DATAS plus memory pool eviction; re-baseline the alert thresholds |

---

## Rapid Answers

[↑ Content](#content)

| Question | One-line answer |
|----------|-----------------|
| Is .NET 10 LTS? | Yes — three years, to November 2028 |
| Which C# version? | C# 14, default for `net10.0` |
| Headline C# 14 feature? | Extension members — properties, static members, and operators |
| What does `field` do? | Refers to an auto-property's synthesized backing field |
| Biggest free performance win? | Extended escape analysis and stack allocation, plus array devirtualization |
| What is DATAS? | GC mode that sizes the heap to live data rather than core count; default since .NET 9 |
| Arm64 GC improvement? | New write-barrier implementation, 8–20% better pauses |
| What is `dotnet run app.cs`? | File-based apps — run a single `.cs` file with no project |
| New JSON safety feature? | `JsonSerializerOptions.Strict` |
| Minimal API validation? | `builder.Services.AddValidation()` with DataAnnotations, source-generated |
| OpenAPI version? | 3.1 by default, with YAML output |
| SSE API? | `TypedResults.ServerSentEvents` |
| Blazor state? | `[PersistentState]` across prerender, navigation, and reconnect |
| Identity addition? | WebAuthn/FIDO2 passkeys plus auth metrics |
| PQC algorithms? | ML-KEM (stable), ML-DSA, SLH-DSA (experimental) |
| EF Core 10 filters? | Named query filters, disable individually by name |
| EF Core 10 joins? | `LeftJoin` and `RightJoin`, method syntax only |

---

## Quick Interview Checklist

[↑ Content](#content)

**Platform**

- [ ] LTS/STS cadence and support dates
- [ ] TFMs, multi-targeting, roll-forward
- [ ] CoreCLR vs Native AOT vs Mono/WASM

**Runtime**

- [ ] Escape analysis and what blocks it
- [ ] Devirtualization → inlining → de-abstraction chain
- [ ] DATAS and Arm64 write barriers
- [ ] Tiering, OSR, dynamic PGO

**Language**

- [ ] Extension members, and the no-fields rule
- [ ] `field` keyword and its shadowing gotcha
- [ ] Null-conditional assignment short-circuits the RHS
- [ ] Implicit span conversions and why they exist

**Tooling**

- [ ] File-based apps and `dotnet project convert`
- [ ] Trimming/AOT analyzers and source generators

**Libraries**

- [ ] `JsonSerializerOptions.Strict` and what it prevents
- [ ] PQC types, and which are experimental
- [ ] Numeric string ordering is opt-in

**Web**

- [ ] `AddValidation()` — and the public-DTO trap
- [ ] OpenAPI 3.1 nullable representation change
- [ ] SSE vs SignalR trade-offs
- [ ] `[PersistentState]` and prerender double-initialization
- [ ] Passkeys and auth metrics

**Data**

- [ ] Named query filters and the `IgnoreQueryFilters` leak they fix
- [ ] `LeftJoin` / `RightJoin`
- [ ] `ExecuteUpdateAsync` bypasses the change tracker

---

## Glossary

[↑ Content](#content)

| Term | Short definition |
|------|------------------|
| **LTS / STS** | Long Term Support (3 years) vs Standard Term Support (18 months) |
| **TFM** | Target Framework Moniker — the API surface you compile against |
| **CoreCLR** | The default runtime with JIT compilation |
| **Native AOT** | Ahead-of-time compilation to a native executable, no JIT |
| **Tiered compilation** | Compile quickly first, re-optimize hot methods later |
| **OSR** | On-Stack Replacement — swap in optimized code while a method is running |
| **Dynamic PGO** | Profile-guided optimization using data collected at runtime |
| **Escape analysis** | Proving an allocation cannot outlive its method, enabling stack allocation |
| **Devirtualization** | Resolving a virtual/interface call to a concrete target so it can be inlined |
| **De-abstraction** | Removing the cost of abstraction (interfaces, enumerators, lambdas) via JIT optimization |
| **DATAS** | GC mode that adapts heap size to live data rather than core count |
| **Write barrier** | JIT-inserted code that informs the GC about cross-generational references |
| **Trimming** | Removing unreferenced IL to shrink output; breaks unguarded reflection |
| **Source generator** | Compile-time code generation replacing runtime reflection |
| **File-based app** | A single `.cs` file run without a project via `dotnet run app.cs` |
| **Extension member** | C# 14 extension property, static member, or operator declared in an `extension` block |
| **`field` keyword** | Reference to an auto-property's compiler-synthesized backing field |
| **PQC** | Post-quantum cryptography — ML-KEM, ML-DSA, SLH-DSA |
| **SSE** | Server-Sent Events — one-way server-to-client streaming over plain HTTP |
| **Passkey** | WebAuthn/FIDO2 credential bound to an origin; phishing-resistant, passwordless |
| **Named query filter** | EF Core 10 global filter with a name, disableable individually |

---

*Lector-style study sheet for .NET 10 platform interviews. Study path: platform and release model → runtime changes you get for free → C# 14 → the opt-in framework features → junior/mid/senior scenarios. Practice by upgrading one real service, measuring p99 and memory before and after, and being able to say precisely which improvement came from which change.*
