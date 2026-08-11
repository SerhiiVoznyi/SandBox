# EF / EF Core Interview Cheat Sheet

A consolidated interview reference for **Entity Framework** and **EF Core**. Answers include enough depth to explain *why* things work that way — not only definitions. Code examples use **C# / .NET** and modern EF Core conventions.

---

## Content

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Key Concepts](#key-concepts)
   - [ORM Mental Model](#kc1-orm-mental-model)
   - [Unit of Work and Identity Map](#kc2-unit-of-work-and-identity-map)
   - [Entity State Machine](#kc3-entity-state-machine)
   - [IQueryable and Deferred Execution](#kc4-iqueryable-and-deferred-execution)
   - [Model Building Pipeline](#kc5-model-building-pipeline)
   - [Provider Model](#kc6-provider-model)
   - [Tracking vs Projection](#kc7-tracking-vs-projection)
   - [Cascade Delete and Relationship Fixup](#kc8-cascade-delete-and-relationship-fixup)
3. [Algorithms and Internals in EF Core](#algorithms-and-internals-in-ef-core)
   - [Change Detection Algorithms](#a1-change-detection-algorithms)
   - [Identity Resolution](#a2-identity-resolution)
   - [Query Translation Pipeline](#a3-query-translation-pipeline)
   - [Materialization](#a4-materialization)
   - [SaveChanges Command Batching](#a5-savechanges-command-batching)
   - [Graph Traversal on Attach/Update](#a6-graph-traversal-on-attachupdate)
   - [Migration Diff Algorithm](#a7-migration-diff-algorithm)
   - [Compiled Queries and Model Caching](#a8-compiled-queries-and-model-caching)
   - [Value Generation Strategies](#a9-value-generation-strategies)
   - [Connection Resiliency / Retry](#a10-connection-resiliency--retry)
4. [Junior (0–2 Years)](#junior-0-2-years)
   - [What is Entity Framework (EF)?](#j1-what-is-entity-framework-ef)
   - [EF vs ADO.NET](#j2-what-is-the-difference-between-ef-and-adonet)
   - [EF Core vs EF 6](#j3-what-is-ef-core-and-how-is-it-different-from-ef-6)
   - [DbContext](#j4-what-is-dbcontext-in-ef-core)
   - [Entities and Relationships](#j5-how-do-you-define-entities-and-relationships-in-ef-core)
   - [DbSet and DbContext](#j6-what-are-dbset-and-dbcontext-used-for)
   - [Add / Attach / Update / Remove](#j7-explain-add-addasync-attach-update-remove-and-when-to-use-each)
   - [Change Tracking](#j8-what-is-change-tracking-in-ef-core)
   - [Migrations](#j9-what-are-migrations-in-ef-core-how-do-you-create-and-apply-migrations)
   - [Common Exceptions](#j10-what-are-common-ef-core-exceptions-and-how-do-you-handle-them)
5. [Mid (2–5 Years)](#mid-2-5-years)
   - [AsNoTracking vs AsTracking](#m1-what-is-the-difference-between-asnotracking-and-astracking)
   - [Eager / Lazy / Explicit Loading](#m2-what-is-eager-loading-lazy-loading-and-explicit-loading)
   - [Optimizing LINQ](#m3-how-do-you-optimize-complex-linq-queries-in-ef-core)
   - [Include and ThenInclude](#m4-what-is-include-and-theninclude-when-would-you-use-them)
   - [First / Single Variants](#m5-what-is-the-difference-between-first-firstordefault-single-and-singleordefault)
   - [Relationship Mapping](#m6-how-do-you-implement-one-to-many-many-to-many-and-one-to-one-relationships)
   - [Fluent API vs Data Annotations](#m7-what-is-fluent-api-and-how-is-it-different-from-data-annotations)
   - [Client vs Server Evaluation](#m8-what-is-the-difference-between-client-side-and-server-side-evaluation)
   - [Pagination](#m9-how-do-you-implement-pagination-in-ef-core)
   - [DbContext Lifetime](#m10-what-is-the-dbcontext-lifetime-and-which-lifetime-would-you-use-in-aspnet-core-apps)
6. [Senior (5+ Years)](#senior-5-years)
   - [LINQ to SQL Translation](#s1-how-does-ef-core-translate-linq-queries-to-sql)
   - [Performance and N+1](#s2-how-do-you-optimize-ef-core-performance-and-avoid-n1-problems)
   - [Query Splitting](#s3-what-is-query-splitting-and-when-should-you-use-it)
   - [Global Query Filters](#s4-what-are-global-query-filters-and-how-do-they-work)
   - [Soft Delete](#s5-how-do-you-implement-soft-delete-using-ef-core)
   - [Concurrency](#s6-how-do-you-handle-concurrency-conflicts-in-ef-core)
   - [Value Converter and Comparer](#s7-what-is-value-converter-and-value-comparer-when-do-you-use-them)
   - [Raw SQL](#s8-when-should-you-use-raw-sql-in-ef-core-and-what-are-the-trade-offs)
   - [Interceptors](#s9-how-do-you-intercept-queries-or-save-changes-using-interceptors)
   - [High-Performance DAL Design](#s10-how-do-you-design-a-high-performance-data-access-layer-using-ef-core)
7. [Quick Interview Checklist](#quick-interview-checklist)
8. [Glossary](#glossary)

---

## How to Use This Guide

[↑ Content](#content)

- **Junior:** Master vocabulary and the state machine — what EF is, how entities map, how you save changes, migrations.
- **Mid:** Compare loading strategies, query operators, relationship modeling, DI lifetime, and when SQL stays on the server.
- **Senior:** Explain internals: translation pipeline, N+1, concurrency tokens, filters, interceptors, and DAL architecture.
- **Algorithms section:** Use it to answer “how does EF Core work under the hood?” — interviewers love this layer.

When answering live: **one-sentence definition → one mechanism → one trade-off/example**.

---

## Key Concepts

### KC1. ORM Mental Model

[↑ Content](#content)

An **ORM** bridges two different worlds:

| Object world (CLR) | Relational world (SQL) |
|--------------------|------------------------|
| Classes, references, collections | Tables, FKs, join tables |
| Inheritance, encapsulation | Rows and columns |
| Identity by object reference | Identity by primary key |
| In-memory graph | Set-based queries |

EF Core’s job is to:

1. **Map** types ↔ tables/columns
2. **Translate** LINQ ↔ SQL
3. **Track** object changes ↔ `INSERT`/`UPDATE`/`DELETE`
4. **Materialize** result rows ↔ object graphs

**Impedance mismatch** is why many interview topics exist (loading strategies, N+1, client evaluation, converters).

---

### KC2. Unit of Work and Identity Map

[↑ Content](#content)

`DbContext` implements two classic patterns:

| Pattern | Meaning in EF Core |
|---------|-------------------|
| **Unit of Work** | Collect changes in memory; commit once with `SaveChanges` (usually one transaction) |
| **Identity Map** | Within one context, the same PK maps to **one CLR instance** |

Why it matters:

- Updating `order.Status` and later querying the same `Order` returns the **same object** (when tracked)
- Prevents conflicting in-memory copies of one row
- Explains bugs when people keep a long-lived context or share one across threads

```csharp
var a = await db.Orders.FirstAsync(o => o.Id == 1);
var b = await db.Orders.FirstAsync(o => o.Id == 1);
ReferenceEquals(a, b); // true — identity map
```

---

### KC3. Entity State Machine

[↑ Content](#content)

Every tracked entity has a state. `SaveChanges` reads states and emits SQL.

```text
                 Attach / query
   Detached ─────────────────────► Unchanged
       ▲                              │
       │                              │ property change / Entry.IsModified
       │                              ▼
       │                           Modified ──SaveChanges──► Unchanged
       │
       │  Add                         Remove
       └────────► Added ────────────► Deleted ──SaveChanges──► Detached
```

| State | SQL on SaveChanges |
|-------|--------------------|
| `Added` | `INSERT` |
| `Modified` | `UPDATE` |
| `Deleted` | `DELETE` |
| `Unchanged` | none |
| `Detached` | not considered |

**Understanding tip:** “What SQL will run?” ⇒ “What states are in the change tracker?”

---

### KC4. IQueryable and Deferred Execution

[↑ Content](#content)

`DbSet<T>` is `IQueryable<T>`. Building a query does **not** hit the database until enumeration/execution:

`ToListAsync`, `FirstAsync`, `CountAsync`, `foreach`, etc.

```csharp
IQueryable<Order> q = db.Orders.Where(o => o.IsActive); // no SQL yet
q = q.OrderBy(o => o.Id);                               // still no SQL
var page = await q.Skip(20).Take(10).ToListAsync();     // SQL executes here
```

Implications:

- Compose filters in services/repositories safely **before** execution
- Don’t enumerate early (`ToList`) then filter in memory unless intentional
- Multiple enumerations = multiple round-trips

---

### KC5. Model Building Pipeline

[↑ Content](#content)

On first use of a context type, EF builds an `IModel`:

1. Discover entity types (`DbSet<>`, `OnModelCreating`, configuration classes)
2. Apply **conventions**
3. Apply **data annotations**
4. Apply **Fluent API** (wins over annotations)
5. Finalize model (keys, FKs, indexes, filters, value converters)
6. Cache compiled model for the app lifetime (or use precompiled model)

This model drives migrations **and** runtime SQL generation. Wrong Fluent config = wrong schema and wrong queries.

---

### KC6. Provider Model

[↑ Content](#content)

EF Core is database-agnostic at the API layer. **Providers** supply:

- SQL dialect generation (SQL Server, PostgreSQL, SQLite, …)
- Type mappings (`datetime2`, `jsonb`, …)
- Migrations scaffolding specifics
- Optional features (sequences, temporal tables, Hi-Lo)

```csharp
options.UseSqlServer(cs);
options.UseNpgsql(cs);
options.UseSqlite(cs);
```

Same LINQ can produce different SQL per provider — always verify on the target engine.

---

### KC7. Tracking vs Projection

[↑ Content](#content)

| Approach | Returns | Tracking | Best for |
|----------|---------|----------|----------|
| Entity query | `Order`, graphs | Usually yes | Load → mutate → save |
| Projection | DTO / anonymous | No | Reads, APIs, lists |
| `AsNoTracking` entities | Entities | No | Read-only entity shapes |

**Rule of thumb:** If you won’t call `SaveChanges` on the result, prefer projection or no-tracking.

---

### KC8. Cascade Delete and Relationship Fixup

[↑ Content](#content)

- **Cascade delete:** Deleting a principal can delete/clear dependents (configured as `Cascade`, `ClientCascade`, `SetNull`, `Restrict`).
- **Relationship fixup:** When tracking a graph, EF keeps navigations and FK properties synchronized (set `Customer` ⇒ set `CustomerId`, fix collections).

Interview trap: cascade in the **model** vs cascade **in the database**. They should align; otherwise runtime behavior and DB constraints disagree.

---

## Algorithms and Internals in EF Core

These are the “algorithms” and core procedures EF Core actually runs. Naming them in interviews shows senior depth.

### A1. Change Detection Algorithms

[↑ Content](#content)

EF Core detects property changes using two main strategies:

| Strategy | How it works | Cost |
|----------|--------------|------|
| **Snapshot tracking** (default) | On attach/query, store original values; on detect, compare current vs original | Extra memory for snapshots |
| **Notification tracking** | Entity implements `INotifyPropertyChanged` / `INotifyPropertyChanging` | Cheaper detect, requires special entities |

`DetectChanges` walks tracked entries and:

1. Compares scalar properties (using type converters / value comparers when configured)
2. Marks modified properties
3. Fixes up relationships (FK ↔ navigations)
4. Can orphan/delete dependents based on cascade rules

When does detect run?

- Automatically before `SaveChanges`
- Often on query if local tracker must stay consistent
- Manually: `db.ChangeTracker.DetectChanges()`

```csharp
// Skip automatic detect on hot paths only if you know states are already correct
db.ChangeTracker.AutoDetectChangesEnabled = false;
```

**Interview line:** Default change detection is a **snapshot-diff algorithm** over the identity map.

---

### A2. Identity Resolution

[↑ Content](#content)

When materializing rows, EF resolves entities by **primary key** into the identity map:

```text
for each result row:
  key = extract PK
  if tracker contains key:
      reuse existing instance (optionally overwrite/ignore DB values)
  else:
      create instance, snapshot, add to tracker
```

Also used when stitching split queries / Includes so the same parent isn’t duplicated in memory.

`AsNoTracking()` skips the map (unless `AsNoTrackingWithIdentityResolution()` — resolves duplicates **without** full tracking).

---

### A3. Query Translation Pipeline

[↑ Content](#content)

LINQ → SQL is a multi-phase compiler-like pipeline:

```text
LINQ expression tree
        │
        ▼
 Query compilation / caching (shape + model)
        │
        ▼
 Expression → relational operators
 (projection, filter, join, sort, group, include)
        │
        ▼
 Provider SQL generator
        │
        ▼
 Parameterized DbCommand
```

Important algorithmic ideas:

- **Expression tree visiting** — rewrite CLR expressions into relational algebra
- **Query caching** — identical query shapes reuse compiled plans (parameters vary)
- **Server vs client boundary** — untranslatable nodes either fail or force client eval after a cutoff

Debugging tool: `query.ToQueryString()` or EF logging to see the final SQL.

---

### A4. Materialization

[↑ Content](#content)

**Materialization** maps `DbDataReader` rows to CLR objects:

1. Read ordinal columns
2. Convert DB types → CLR (converters, nullability)
3. Construct entity or DTO
4. Set properties / backing fields
5. Run identity resolution (if tracking)
6. Wire navigations for Includes
7. Optional interceptors (`IMaterializationInterceptor`)

For projections, EF generates leaner readers — one reason DTO queries are faster.

---

### A5. SaveChanges Command Batching

[↑ Content](#content)

`SaveChanges` roughly:

1. `DetectChanges`
2. Topologically order operations (respect FKs: insert parents before children; delete children before parents)
3. Generate commands (`INSERT`/`UPDATE`/`DELETE`)
4. **Batch** multiple commands into fewer round-trips (provider-dependent)
5. Execute inside a transaction (by default when needed)
6. Accept changes: states → `Unchanged`, refresh store-generated values

```text
Added Customer, Added Order, Modified Product
        │
        ▼
 topological sort by FK dependencies
        │
        ▼
 batch commands → fewer network round-trips
```

This is why inserting a graph with navigations “just works” if relationships are configured correctly.

---

### A6. Graph Traversal on Attach/Update

[↑ Content](#content)

`Add`, `Attach`, `Update`, `Remove` walk **object graphs** (navigations):

| API | Graph heuristic |
|-----|-----------------|
| `Add` | Reachable entities with unset keys → `Added`; existing keys may be treated differently by version |
| `Attach` | Reachable entities → `Unchanged` |
| `Update` | Reachable entities with keys → `Modified` |
| `Remove` | Marks deleted (cascade rules may expand) |

Algorithmically: **graph reachability traversal** (like DFS/BFS over navigations) + state assignment by key presence.

**Trap:** `Update(disconnectedGraph)` can mark more entities modified than you intend — prefer explicit property marking for partial updates.

---

### A7. Migration Diff Algorithm

[↑ Content](#content)

`dotnet ef migrations add`:

1. Build **current model** from code
2. Build **last snapshot model** from `*ModelSnapshot.cs`
3. Run a **model differ** (tables/columns/keys/indexes/FKs/annotations)
4. Emit `Up`/`Down` operations
5. Update snapshot

```text
Code model  ──diff──►  Migration operations  ──SQL──►  Database
   ▲                         │
   └──── ModelSnapshot ◄─────┘
```

Understanding tip: migrations compare **models**, not live DB vs code (unless you scaffold from DB). Drift happens if someone changes the DB manually.

---

### A8. Compiled Queries and Model Caching

[↑ Content](#content)

Two caches matter for performance:

| Cache | What it avoids |
|-------|----------------|
| **Model cache** | Rebuilding the full EF model per context instance |
| **Query compilation cache** | Re-translating the same LINQ shape repeatedly |

**Compiled queries** lock a delegate for hot paths:

```csharp
private static readonly Func<AppDbContext, int, Order?> GetById =
    EF.CompileQuery((AppDbContext db, int id) =>
        db.Orders.AsNoTracking().FirstOrDefault(o => o.Id == id));

var order = GetById(db, 42);
```

Async: `EF.CompileAsyncQuery(...)`.

Also: **compiled models** (`dotnet ef dbcontext optimize`) skip runtime model building startup cost in large apps.

---

### A9. Value Generation Strategies

[↑ Content](#content)

How keys/values get generated — algorithm choice affects insert batching and round-trips:

| Strategy | Idea | Notes |
|----------|------|-------|
| **Identity / serial** | DB generates on INSERT | May need leftover values retrieved |
| **GUID** | Client-generated | Good for disconnected inserts; index fragmentation on random GUIDs |
| **Hi-Lo** | Reserve blocks of IDs from DB | Fewer round-trips for many inserts |
| **Sequences** | DB sequence objects | Common on PostgreSQL / SQL Server |

This is why `AddAsync` exists: some generators need async DB access before the insert command is fully built.

---

### A10. Connection Resiliency / Retry

[↑ Content](#content)

Transient failure handling uses a **retry algorithm** (exponential backoff) around executions:

```csharp
options.UseSqlServer(cs, sql =>
    sql.EnableRetryOnFailure(
        maxRetryCount: 5,
        maxRetryDelay: TimeSpan.FromSeconds(10),
        errorNumbersToAdd: null));
```

Caveats:

- Retries need idempotent-enough operations or EF’s execution strategy wrapping user transactions
- Manual transactions often require `IExecutionStrategy.ExecuteAsync` to be retry-safe

---

## Junior (0–2 Years)

### J1. What is Entity Framework (EF)?

[↑ Content](#content)

**Entity Framework** is Microsoft’s **ORM** for .NET. It maps C# classes (entities) to database tables and lets you query and persist data with LINQ instead of hand-writing most SQL.

| | |
|---|---|
| **Idea** | Work with objects; EF generates SQL and tracks changes |
| **Use when** | CRUD apps, domain models over relational DBs |
| **Not for** | Every high-throughput path — sometimes raw SQL / Dapper wins |

**Deeper understanding**

EF is not “magic SQL.” It is a stack:

- **LINQ provider** (query translation)
- **Change tracker** (unit of work)
- **Materializer** (rows → objects)
- **ADO.NET provider** underneath (real network I/O)

EF Core is the modern, cross-platform successor used in current .NET apps.

**Related concepts:** [ORM Mental Model](#kc1-orm-mental-model), [Provider Model](#kc6-provider-model)

---

### J2. What is the difference between EF and ADO.NET?

[↑ Content](#content)

| | **ADO.NET** | **EF / EF Core** |
|---|---|---|
| Abstraction | Low-level: connections, commands, readers | High-level ORM |
| SQL | You write SQL (or stored procs) | Mostly LINQ → SQL |
| Mapping | Manual (`DataReader` → objects) | Automatic entity mapping |
| Change tracking | None (unless you build it) | Built-in |
| Control | Maximum | Less control, more productivity |
| Transactions | Explicit `DbTransaction` | Usually via `SaveChanges` / `Database.BeginTransaction` |

**Deeper understanding**

EF Core still uses ADO.NET types (`DbConnection`, `DbCommand`) internally. Choosing EF does not remove ADO.NET — it automates the repetitive parts.

Typical split in production systems:

- EF Core for domain CRUD and consistency
- Dapper/ADO.NET for heavy reports or bulk copy

**Interview line:** ADO.NET is the plumbing; EF sits on top of ADO.NET providers and trades some control for productivity.

---

### J3. What is EF Core and how is it different from EF 6?

[↑ Content](#content)

**EF Core** is a rewrite of EF for modern .NET: lighter, modular, and cross-platform.

| Aspect | EF 6 | EF Core |
|--------|------|---------|
| Platforms | Windows / .NET Framework primarily | .NET Core / .NET 5+ (cross-platform) |
| Architecture | Heavier, older stack | Lightweight, extensible (interceptors, plugins) |
| Features | Mature classic set | Faster iteration; nearly full parity for common apps |
| Performance | Solid | Stronger query pipeline, batching, no-tracking options |
| Future | Maintenance mode | Active development |

**Deeper understanding**

Notable EF Core capabilities interviewers expect you to know exist:

- Global query filters
- Batching on `SaveChanges`
- `AsSplitQuery`
- Many-to-many without explicit join entity (skip navigations)
- Compiled models / compiled queries
- Interceptors

**Interview line:** Prefer EF Core for new work; EF 6 only for legacy .NET Framework apps not migrating yet.

---

### J4. What is DbContext in EF Core?

[↑ Content](#content)

`DbContext` is the **unit of work and session** with the database. It:

- Exposes `DbSet<T>` properties for entity sets
- Owns the **change tracker** (identity map + states)
- Translates LINQ to SQL
- Persists changes via `SaveChanges` / `SaveChangesAsync`
- Configures the model in `OnModelCreating`

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

**Deeper understanding**

| Concern | Guidance |
|---------|----------|
| Lifetime | Short — per HTTP request or per business operation |
| Thread safety | **Not thread-safe** |
| `Database` facade | Connections, transactions, `Migrate()`, raw SQL |
| Multiple contexts | Useful for bounded contexts / read vs write |

Treat it as short-lived. A long-lived context grows memory (tracker), serves stale data, and risks concurrency bugs.

**Related concepts:** [Unit of Work and Identity Map](#kc2-unit-of-work-and-identity-map)

---

### J5. How do you define entities and relationships in EF Core?

[↑ Content](#content)

**Entities** are POCOs. Relationships use navigation properties and/or foreign keys. Configuration layers (later wins):

1. **Conventions**
2. **Data Annotations**
3. **Fluent API**

```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public ICollection<Order> Orders { get; set; } = [];
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
```

EF infers one-to-many: `Customer.Orders` ↔ `Order.Customer` / `CustomerId`.

**Deeper understanding**

| Term | Meaning |
|------|---------|
| **Principal** | The “one” / parent side |
| **Dependent** | Holds the FK |
| **Required relationship** | Dependent must have principal (non-nullable FK) |
| **Optional relationship** | FK nullable |
| **Shadow property** | Column mapped but not declared on CLR type (`modelBuilder ... Property<int>("CustomerId")`) |
| **Backing field** | EF reads/writes field instead of property (DDD-friendly) |

Owned types (`OwnsOne` / `OwnsMany`) map value objects into the owner’s table or separate tables without independent identity.

---

### J6. What are DbSet and DbContext used for?

[↑ Content](#content)

| Type | Role |
|------|------|
| **DbContext** | Session + change tracker + `SaveChanges` |
| **DbSet&lt;T&gt;** | Entry point to query and mutate entities of type `T` |

```csharp
var active = await db.Orders
    .Where(o => o.IsActive)
    .ToListAsync();

db.Orders.Add(new Order { CustomerId = 1 });
await db.SaveChangesAsync();
```

**Deeper understanding**

`DbSet<T>` is both:

- `IQueryable<T>` for composing queries
- an API for `Add`/`Remove`/local view (`db.Orders.Local`)

`Local` is the in-memory tracked view — useful for validating graphs before save without hitting the DB.

**Related concepts:** [IQueryable and Deferred Execution](#kc4-iqueryable-and-deferred-execution)

---

### J7. Explain Add(), AddAsync(), Attach(), Update(), Remove() and when to use each

[↑ Content](#content)

| Method | Effect | Typical use |
|--------|--------|-------------|
| **Add / AddAsync** | Mark entity `Added` | Insert new row |
| **Attach** | Mark as `Unchanged` | Start tracking an existing entity without marking modified |
| **Update** | Mark entity `Modified` | Disconnected full update |
| **Remove** | Mark `Deleted` | Delete row |

```csharp
db.Orders.Add(newOrder);           // INSERT
db.Orders.Attach(existing);        // tracked as Unchanged
db.Entry(existing).Property(x => x.Status).IsModified = true; // partial update
db.Orders.Update(disconnected);    // all mapped properties Modified
db.Orders.Remove(order);           // DELETE
await db.SaveChangesAsync();
```

**Deeper understanding**

- These APIs traverse **graphs** via navigations ([Graph Traversal](#a6-graph-traversal-on-attachupdate)).
- Prefer: query tracked entity → mutate properties → `SaveChanges` for connected scenarios.
- Prefer: `Attach` + mark specific properties for partial disconnected updates.
- `AddAsync` is for value generators that must talk to the DB asynchronously (e.g. some Hi-Lo); otherwise `Add` is enough.
- Setting `EntityState` via `db.Entry(entity).State = ...` is the low-level equivalent.

---

### J8. What is change tracking in EF Core?

[↑ Content](#content)

**Change tracking** means EF keeps metadata (and usually snapshots) for loaded/attached entities and computes the SQL needed on save.

| State | Meaning |
|-------|---------|
| `Added` | Will INSERT |
| `Unchanged` | No DB write |
| `Modified` | Will UPDATE |
| `Deleted` | Will DELETE |
| `Detached` | Not tracked |

**Deeper understanding**

Tracked entity metadata includes:

- Current values
- Original values (for concurrency and UPDATE WHERE clauses)
- Property modified flags
- Relationship snapshots

Costs:

- Memory grows with tracked entity count
- `DetectChanges` CPU cost on large graphs

Use `AsNoTracking()` for read-only queries. Clear tracker only with care (`ChangeTracker.Clear()` in EF Core 5+) — usually better to dispose the context.

**Related algorithms:** [Change Detection](#a1-change-detection-algorithms), [Identity Resolution](#a2-identity-resolution)

---

### J9. What are migrations in EF Core? How do you create and apply migrations?

[↑ Content](#content)

**Migrations** version the database schema from your model (code-first).

```bash
dotnet ef migrations add AddOrdersTable
dotnet ef database update
dotnet ef migrations script -o migrate.sql
dotnet ef migrations remove   # only if not applied / not shared yet
```

Common workflow:

1. Change entities / Fluent config
2. Add migration → generates `Up`/`Down` + updates snapshot
3. Review generated operations/SQL
4. Apply in each environment via CI/CD (`database update` or idempotent SQL script)

**Deeper understanding**

| Artifact | Role |
|----------|------|
| `Migrations/*.cs` | Timed operations (`Up`/`Down`) |
| `*ModelSnapshot.cs` | Last known full model for next diff |
| `__EFMigrationsHistory` | Table of applied migrations in DB |

`EnsureCreated()` creates schema from the model **without** migration history — demos/tests only, not production.

Team tip: never edit an already-applied migration on shared branches; add a new one.

**Related algorithms:** [Migration Diff Algorithm](#a7-migration-diff-algorithm)

---

### J10. What are common EF Core exceptions, and how do you handle them?

[↑ Content](#content)

| Exception | Typical cause | Handling |
|-----------|---------------|----------|
| `DbUpdateException` | Constraint/FK/unique violation | Map to 400/409; log provider error |
| `DbUpdateConcurrencyException` | Concurrency token mismatch | Reload, merge, retry |
| `InvalidOperationException` | Tracking conflicts, bad LINQ translation, multiple `Single` | Fix query/model |
| Provider `SqlException` / Npgsql etc. | Deadlock, timeout, login | Retry policy / backoff |

```csharp
try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException)
{
    // reload / apply conflict policy
}
catch (DbUpdateException ex)
{
    // inspect ex.InnerException for provider message
}
```

**Deeper understanding**

Also configure:

- `CommandTimeout` for long reports
- `EnableRetryOnFailure` for transient network/deadlocks ([Retry algorithm](#a10-connection-resiliency--retry))
- Validation before save (unique checks) to avoid round-trips when cheap

Don’t catch broadly and ignore — persistence exceptions usually mean data rules were violated.

---

## Mid (2–5 Years)

### M1. What is the difference between AsNoTracking() and AsTracking()?

[↑ Content](#content)

| | **AsNoTracking** | **AsTracking** |
|---|---|---|
| Tracking | Off | On (default for `DbSet`) |
| Performance | Faster, less memory | Needed for updates |
| Identity map | Off by default | Same key → same instance |
| Use | Read-only APIs, reports | Load → mutate → save |

```csharp
var list = await db.Orders.AsNoTracking().ToListAsync();

// Deduplicate graph without tracking cost:
var graph = await db.Customers
    .AsNoTrackingWithIdentityResolution()
    .Include(c => c.Orders)
    .ToListAsync();
```

**Deeper understanding**

Global default:

```csharp
options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
```

If default is no-tracking, use `.AsTracking()` for update paths.

No-tracking entities can still be attached later, but you lose original values unless you set them — important for concurrency tokens.

---

### M2. What is Eager Loading, Lazy Loading, and Explicit Loading?

[↑ Content](#content)

| Strategy | How | Pros / cons |
|----------|-----|-------------|
| **Eager** | `Include` / `ThenInclude` | Predictable queries; risk of cartesian explosion |
| **Lazy** | Navigation access triggers load | Convenient; classic N+1 |
| **Explicit** | `Entry(...).Collection/Reference.Load` | Controlled extra queries |

```csharp
// Eager
var order = await db.Orders
    .Include(o => o.Items)
    .FirstAsync(o => o.Id == id);

// Explicit
await db.Entry(order).Collection(o => o.Items).LoadAsync();
await db.Entry(order).Reference(o => o.Customer).LoadAsync();
```

**Deeper understanding**

Lazy loading requires:

- Proxies (`UseLazyLoadingProxies`) **or** `ILazyLoader` injection
- Navigations `virtual` (for proxies)

In web APIs, lazy loading is often disabled: serialization can accidentally trigger hundreds of queries.

**Interview preference:** Eager or explicit for predictable performance; projection often beats both for reads.

---

### M3. How do you optimize complex LINQ queries in EF Core?

[↑ Content](#content)

Practical checklist:

1. **Project early** — `Select` DTOs instead of full graphs
2. **Filter in DB** — `Where` before materialization
3. **Avoid N+1** — `Include`, split query, or batched IDs
4. **AsNoTracking** for reads
5. **Inspect SQL** — `ToQueryString()`, logging, MiniProfiler, Application Insights
6. **Indexes** — match filter/join/order columns
7. **Split queries** when multiple collections explode rows
8. **Compiled queries** for hot paths
9. Avoid client-evaluated methods over large sets
10. Prefer keyset pagination for deep pages

```csharp
var dto = await db.Orders
    .AsNoTracking()
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderListItem(o.Id, o.Total, o.Status))
    .ToListAsync();
```

**Deeper understanding**

Ask for every slow endpoint:

- How many round-trips?
- How many rows returned?
- Are we selecting unused columns/navigations?
- Is work done in SQL or in CLR?

**Related algorithms:** [Query Translation](#a3-query-translation-pipeline), [Compiled Queries](#a8-compiled-queries-and-model-caching)

---

### M4. What is Include() and ThenInclude()? When would you use them?

[↑ Content](#content)

- **`Include`** — eager-load a navigation from the root
- **`ThenInclude`** — continue into a nested navigation

```csharp
var customers = await db.Customers
    .Include(c => c.Orders)
        .ThenInclude(o => o.Items)
    .ToListAsync();
```

**Deeper understanding**

Filtered includes (EF Core 5+):

```csharp
.Include(c => c.Orders.Where(o => o.IsActive))
```

`Include` loads full entities. If the UI needs 3 fields, projection is usually better:

```csharp
.Select(c => new {
    c.Id,
    c.Name,
    Orders = c.Orders.Select(o => new { o.Id, o.Total })
})
```

Use Includes when you truly need tracked graphs or many entity behaviors; use projections for API reads.

---

### M5. What is the difference between First(), FirstOrDefault(), Single() and SingleOrDefault()?

[↑ Content](#content)

| Method | 0 rows | 1 row | 2+ rows |
|--------|--------|-------|---------|
| **First** | throws | returns | returns first |
| **FirstOrDefault** | default | returns | returns first |
| **Single** | throws | returns | throws |
| **SingleOrDefault** | default | returns | throws |

**Deeper understanding**

| Intent | Prefer |
|--------|--------|
| “Give me any/ top row with ordering” | `First*` + `OrderBy` |
| “This must be unique” | `Single*` (by key / unique index) |
| “By primary key” | `Find` / `FindAsync` (checks tracker first) |

`FindAsync(id)` is special: it returns tracked instance without SQL if already present — different algorithm from `FirstAsync`.

Async variants: `FirstAsync`, `SingleOrDefaultAsync`, etc. Prefer async in ASP.NET.

---

### M6. How do you implement one-to-many, many-to-many and one-to-one relationships?

[↑ Content](#content)

| Relationship | Pattern |
|--------------|---------|
| **One-to-many** | Parent collection + child FK + reference |
| **One-to-one** | Unique FK on dependent; Fluent config recommended |
| **Many-to-many** | Skip navigations (EF Core 5+) or explicit join entity |

```csharp
// One-to-many
modelBuilder.Entity<Order>()
    .HasOne(o => o.Customer)
    .WithMany(c => c.Orders)
    .HasForeignKey(o => o.CustomerId)
    .OnDelete(DeleteBehavior.Cascade);

// Many-to-many (skip navigations)
modelBuilder.Entity<Post>()
    .HasMany(p => p.Tags)
    .WithMany(t => t.Posts);

// Many-to-many with payload (join entity)
modelBuilder.Entity<PostTag>()
    .HasKey(x => new { x.PostId, x.TagId });

// One-to-one
modelBuilder.Entity<User>()
    .HasOne(u => u.Profile)
    .WithOne(p => p.User)
    .HasForeignKey<Profile>(p => p.UserId);
```

**Deeper understanding**

Choose delete behavior deliberately:

| `DeleteBehavior` | Effect |
|------------------|--------|
| `Cascade` | DB/server cascade deletes dependents |
| `ClientCascade` | EF deletes tracked dependents |
| `Restrict` / `NoAction` | Prevent delete if children exist |
| `SetNull` | Clear FK on dependent |

For many-to-many with extra fields (`JoinedAt`), always use an explicit join entity.

**Related concepts:** [Cascade Delete and Relationship Fixup](#kc8-cascade-delete-and-relationship-fixup)

---

### M7. What is Fluent API and how is it different from Data Annotations?

[↑ Content](#content)

| | **Data Annotations** | **Fluent API** |
|---|---|---|
| Where | Attributes on types | `OnModelCreating` / `IEntityTypeConfiguration` |
| Power | Limited | Full control |
| Domain purity | Pollutes entities with persistence | Mapping stays outside |
| Precedence | Overridden by Fluent | Wins |

```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.CustomerId);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
```

**Deeper understanding**

Fluent-only (or much better in Fluent) examples:

- Composite keys
- Composite indexes / filtered indexes
- Table splitting, TPH/TPT/TPC inheritance mapping
- Precision (`HasPrecision(18, 2)`)
- Global filters
- Exact delete behaviors and FK names

**Interview preference:** Conventions + Fluent configurations per aggregate; annotations sparingly.

---

### M8. What is the difference between client-side and server-side evaluation?

[↑ Content](#content)

- **Server-side:** expression translates to SQL; DB does the work
- **Client-side:** CLR runs LINQ-to-Objects after data is fetched

EF Core 3+ is strict: untranslatable expressions in the server-evaluated part usually **throw**, rather than silently downloading a whole table.

```csharp
// Risky / often fails translation
db.Orders.Where(o => ToDomainStatus(o.Status) == "Open");

// Better: translate-friendly predicate, map after
var rows = await db.Orders
    .Where(o => o.Status == "O")
    .AsNoTracking()
    .ToListAsync();

var mapped = rows.Select(ToDomain);
```

**Deeper understanding**

Patterns that often break translation:

- Custom methods without EF translations
- Some `DateTime` culture-specific operations
- Client-only .NET APIs on filtered columns

`EF.Functions.Like`, `EF.Functions.DateDiffDay`, etc. exist specifically to keep work server-side.

Always confirm with SQL logs.

**Related algorithms:** [Query Translation Pipeline](#a3-query-translation-pipeline)

---

### M9. How do you implement pagination in EF Core?

[↑ Content](#content)

Standard **offset pagination**: filter → order → `Skip` / `Take`. Always `OrderBy` before `Skip`.

```csharp
async Task<(List<OrderListItem> Items, int Total)> GetPageAsync(
    AppDbContext db, int page, int pageSize)
{
    var query = db.Orders.AsNoTracking().Where(o => o.IsActive);

    var total = await query.CountAsync();

    var items = await query
        .OrderByDescending(o => o.Id)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new OrderListItem(o.Id, o.Total))
        .ToListAsync();

    return (items, total);
}
```

**Deeper understanding**

| Style | SQL idea | Scales? |
|-------|----------|---------|
| Offset (`SKIP/TAKE`) | `OFFSET n ROWS FETCH NEXT` | Poor on deep pages |
| **Keyset / seek** | `WHERE Id < @last ORDER BY Id DESC TAKE n` | Good |

```csharp
// Keyset pagination
var items = await db.Orders.AsNoTracking()
    .Where(o => o.IsActive && o.Id < lastSeenId)
    .OrderByDescending(o => o.Id)
    .Take(pageSize)
    .ToListAsync();
```

Total `CountAsync` can be expensive — cache totals or show “next page” without exact counts when product allows.

---

### M10. What is the DbContext lifetime and which lifetime would you use in ASP.NET Core apps?

[↑ Content](#content)

| Lifetime | Verdict for DbContext |
|----------|------------------------|
| **Singleton** | ❌ Unsafe — not thread-safe; shared tracker |
| **Scoped** | ✅ Default — one per HTTP request |
| **Transient** | Rarely useful; multiple instances confuse tracking |

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
// Scoped by default

builder.Services.AddDbContextPool<AppDbContext>(...); // pooled reset instances
builder.Services.AddPooledDbContextFactory<AppDbContext>(...);
```

**Deeper understanding**

| Host | Pattern |
|------|---------|
| ASP.NET Core MVC/API | Scoped `DbContext` |
| Blazor Server | `IDbContextFactory<T>` per operation (circuit is long-lived) |
| Background `HostedService` | Create scope / factory per iteration — do not inject scoped context into singleton |
| Parallel queries | Separate contexts — one context isn’t concurrent |

Pooling reuses instances after reset — faster, but don’t keep references to entities across reset boundaries.

---

## Senior (5+ Years)

### S1. How does EF Core translate LINQ queries to SQL?

[↑ Content](#content)

Pipeline (simplified):

1. Capture LINQ as an **expression tree**
2. Apply query filters / conventions from the model
3. Compile to relational command tree (joins, projections, predicates)
4. Provider generates SQL + parameters
5. Execute via ADO.NET; materialize CLR objects
6. Optionally attach to change tracker / identity map

**Deeper understanding**

What interviewers want to hear:

- Translation is **expression-tree compilation**, not string building from C# source text
- Query **shape** is cached; parameter values are not part of the cache key identity beyond placeholders
- Includes become joins or split queries depending on configuration
- Navigation access in projections can create joins automatically

```csharp
Console.WriteLine(db.Orders
    .Where(o => o.Total > 100)
    .OrderBy(o => o.Id)
    .Select(o => new { o.Id, o.Total })
    .ToQueryString());
```

**Related algorithms:** [Query Translation Pipeline](#a3-query-translation-pipeline), [Materialization](#a4-materialization)

---

### S2. How do you optimize EF Core performance and avoid N+1 problems?

[↑ Content](#content)

**N+1:** 1 query for parents + N queries for each parent’s children (lazy loading or per-item queries in loops).

Mitigations:

- Eager load (`Include`) or project needed fields
- `AsSplitQuery()` for heavy multi-collection graphs
- Batch by IDs: `Where(x => ids.Contains(x.ParentId))`
- Disable lazy loading in APIs
- `AsNoTracking` + projections
- Proper indexes
- Bulk extensions / raw SQL for massive writes
- Context pooling, compiled queries for hot paths

```csharp
// N+1 anti-pattern
foreach (var c in customers)
    _ = c.Orders.Count; // may hit DB each time if lazy

// Fix
var customers = await db.Customers.Include(c => c.Orders).ToListAsync();
```

**Deeper understanding**

Performance layers:

1. **Round-trips** (chatty ORM)
2. **SQL shape** (bad joins, SELECT *)
3. **Materialization/tracking overhead**
4. **Database physical design** (indexes, statistics)

Senior answer: measure first (SQL log + timings), then fix the dominant layer.

**Related algorithms:** [SaveChanges Batching](#a5-savechanges-command-batching), [Identity Resolution](#a2-identity-resolution)

---

### S3. What is query splitting and when should you use it?

[↑ Content](#content)

Multiple collection `Include`s in one SQL query can cause **cartesian explosion** (duplicate parent rows). **Split queries** execute separate SQL per collection and stitch results in memory via identity resolution.

```csharp
var blog = await db.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Contributors)
    .AsSplitQuery()
    .FirstAsync(b => b.Id == id);
```

| Use split when | Prefer single query when |
|----------------|--------------------------|
| Multiple collection includes | One collection / simple graph |
| Row explosion hurts memory/CPU | Extra round-trips dominate latency |
| Large collections | Strong need for one consistent DB snapshot |

```csharp
options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
```

**Deeper understanding**

Trade-off: more round-trips vs less data duplication. Under concurrent writes, split queries can theoretically see non-atomic snapshots across statements — usually acceptable for reads; use a transaction/snapshot isolation if you must be strict.

**Related algorithms:** [Identity Resolution](#a2-identity-resolution)

---

### S4. What are global query filters and how do they work?

[↑ Content](#content)

**Global query filters** are predicates automatically applied to LINQ queries for an entity type (including when reached via Includes).

```csharp
modelBuilder.Entity<Order>()
    .HasQueryFilter(o => !o.IsDeleted && o.TenantId == _tenant.Id);

var all = await db.Orders.IgnoreQueryFilters().ToListAsync();
```

Common uses: soft delete, multi-tenancy, soft “visibility” flags.

**Deeper understanding**

Caveats:

- Filters use captured expressions (careful with scoped tenant services — often configure via context instance fields)
- Required relationships to filtered entities can cause surprising missing data
- Always provide admin/bypass path (`IgnoreQueryFilters`) for tooling
- Filters apply to that entity type’s queries; understand inheritance interactions (TPH)

---

### S5. How do you implement soft delete using EF Core?

[↑ Content](#content)

Typical approach:

1. `IsDeleted` / `DeletedAt` on entities (interface `ISoftDelete`)
2. Global query filter excludes deleted rows
3. Interceptor or `SaveChanges` override converts `Delete` → update flag

```csharp
public override Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    foreach (var entry in ChangeTracker.Entries<ISoftDelete>())
    {
        if (entry.State == EntityState.Deleted)
        {
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedAt = DateTimeOffset.UtcNow;
        }
    }

    return base.SaveChangesAsync(ct);
}
```

**Deeper understanding**

- Unique indexes should be **filtered** (`WHERE IsDeleted = 0`) so deleted emails don’t block reuse
- Soft-deleted rows still occupy space — plan archival jobs
- Cascade soft-delete of children may need explicit domain logic; DB cascade still hard-deletes unless you intercept everything
- Prefer interceptor composition over huge `SaveChanges` overrides as the system grows

---

### S6. How do you handle concurrency conflicts in EF Core?

[↑ Content](#content)

Use a **concurrency token**. Updates include the original token in `WHERE`; 0 rows affected ⇒ conflict.

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];
}

try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    foreach (var entry in ex.Entries)
    {
        var dbValues = await entry.GetDatabaseValuesAsync();
        if (dbValues is null) { /* deleted by someone else */ continue; }

        // example: store wins for stock, client wins for name, etc.
        entry.OriginalValues.SetValues(dbValues);
    }
}
```

**Deeper understanding**

| Token style | Example |
|-------------|---------|
| DB rowversion | SQL Server `rowversion` |
| App xmin / version int | Manual increment |
| UpdatedAt timestamp | Weaker if low resolution |

Strategies after conflict:

- **Store wins** — discard client changes
- **Client wins** — overwrite store (force by refreshing original token)
- **Merge** — field-level resolution + retry

This is **optimistic concurrency** (no long locks). Pessimistic locking (`UPDLOCK`) is rare and usually raw SQL.

---

### S7. What is Value Converter and Value Comparer? When do you use them?

[↑ Content](#content)

| Concept | Role |
|---------|------|
| **Value Converter** | Maps CLR property ↔ DB column representation |
| **Value Comparer** | Equality/hash/snapshot rules for change detection |

```csharp
builder.Property(e => e.Tags)
    .HasConversion(
        v => string.Join(',', v),
        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
    .Metadata.SetValueComparer(
        new ValueComparer<List<string>>(
            (a, b) => a!.SequenceEqual(b!),
            v => v.Aggregate(0, (h, s) => HashCode.Combine(h, s.GetHashCode())),
            v => v.ToList()));
```

**Deeper understanding**

Use converters for:

- Enums ↔ strings
- Strongly typed IDs (`OrderId`)
- JSON columns
- Encrypted-at-rest fields (careful with querying!)

Without a comparer, mutating a list in place may **not** mark the property modified — snapshot still points to same reference with unnoticed content changes. The comparer provides:

1. Equals
2. Hash code
3. Snapshot clone function

**Related algorithms:** [Change Detection](#a1-change-detection-algorithms)

---

### S8. When should you use raw SQL in EF Core, and what are the trade-offs?

[↑ Content](#content)

**Use raw SQL when:**

- Complex reporting (CTEs, window functions) awkward in LINQ
- Existing stored procedures
- Bulk updates/deletes where ORM overhead dominates
- Vendor-specific hints / TVPs

APIs: `FromSqlInterpolated`, `ExecuteSqlInterpolated`, `SqlQuery<T>` (.NET 8+), or ADO.NET via `db.Database.GetDbConnection()`.

| Pros | Cons |
|------|------|
| Full SQL power | Weaker compile-time safety |
| Performance control | Duplicates knowledge vs LINQ model |
| Reuse proven SQL | Composition/tracking limitations |

```csharp
var year = 2026;
var rows = await db.Orders
    .FromSqlInterpolated($"SELECT * FROM Orders WHERE YEAR(CreatedAt) = {year}")
    .AsNoTracking()
    .ToListAsync();
```

**Deeper understanding**

- Prefer `FromSqlInterpolated` / parameters — never concatenate user input (SQL injection)
- `FromSql` results for entity types should return columns needed by the entity mapping
- Composing LINQ after `FromSql` is possible but provider-dependent; keep it simple
- For bulk: `ExecuteUpdate` / `ExecuteDelete` (EF Core 7+) often beat load-all-then-save

```csharp
await db.Orders
    .Where(o => o.IsActive == false)
    .ExecuteDeleteAsync();
```

---

### S9. How do you intercept queries or save changes using interceptors?

[↑ Content](#content)

**Interceptors** hook EF pipelines without scattering cross-cutting code.

| Interceptor | Use |
|-------------|-----|
| `ISaveChangesInterceptor` / `SaveChangesInterceptor` | Audit, soft delete, domain events/outbox |
| `DbCommandInterceptor` | Logging, annotate SQL, set session context |
| `IMaterializationInterceptor` | Hydration hooks |
| `IDbTransactionInterceptor` | Transaction diagnostics |

```csharp
public class AuditSaveInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData, InterceptionResult<int> result)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in eventData.Context!.ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified)
                entry.Entity.UpdatedAt = now;
        }

        return base.SavingChanges(eventData, result);
    }
}

options.AddInterceptors(new AuditSaveInterceptor());
```

**Deeper understanding**

Prefer interceptors when behavior must apply across many contexts/operations. Prefer domain services when rules are use-case specific.

`DbCommandInterceptor` can measure command duration and log slow SQL — excellent production observability hook.

---

### S10. How do you design a high-performance data access layer using EF Core?

[↑ Content](#content)

Architectural guidelines:

1. **Bounded contexts / focused DbContexts** — avoid one god-context
2. **Read/write split** — tracking for writes; no-tracking + projections for reads; optional read replica
3. **Explicit query services** — don’t bury every query behind a generic repository that returns `IQueryable` without discipline
4. **DTOs at the boundary** — don’t leak tracked graphs to APIs
5. **Indexes & SQL review** in Definition of Done
6. **Resilience** — retries, timeouts, short transactions
7. **Hot paths** — compiled queries, split queries, `ExecuteUpdate`, raw SQL/bulk where measured
8. **Transactions** — explicit only when needed; keep short to reduce lock time
9. **Caching** — reference data in app cache; never reuse tracked entities across requests
10. **Observability** — slow SQL logging, metrics per query type

**Deeper understanding — reference architecture**

```text
API / Application handlers
        │
        ├── Write path: DbContext (tracked) + domain validation + SaveChanges
        │
        └── Read path:  queries/projections (AsNoTracking) → DTOs
                 │
                 └── optional: cache / read replica connection string
```

**Interview closer:** EF Core is an excellent default DAL. High performance is measurement-driven — profile SQL and allocations before replacing the ORM.

---

## Quick Interview Checklist

[↑ Content](#content)

**Concepts**

- [ ] ORM impedance mismatch and why loading strategies exist
- [ ] DbContext = Unit of Work + Identity Map
- [ ] Entity state machine → SQL verbs
- [ ] Deferred execution of `IQueryable`

**Algorithms / internals**

- [ ] Snapshot change detection vs notification tracking
- [ ] Identity resolution when materializing
- [ ] LINQ expression translation + query cache
- [ ] SaveChanges topological ordering + batching
- [ ] Migration model-diff / snapshot workflow

**Practical**

- [ ] When to use `AsNoTracking` / projections
- [ ] Eager vs lazy vs explicit; how N+1 appears
- [ ] `Include` vs `Select`
- [ ] Migrations vs `EnsureCreated`
- [ ] Scoped DbContext / factories in Blazor & background services
- [ ] Concurrency tokens + conflict handling
- [ ] Global filters for soft delete / tenancy
- [ ] Split queries and raw SQL trade-offs
- [ ] Interceptors for audit / cross-cutting persistence

---

## Glossary

[↑ Content](#content)

| Term | Short definition |
|------|------------------|
| **Entity** | CLR object mapped to a table/row with identity |
| **Key** | Primary identity used by the identity map |
| **Shadow property** | DB-mapped property not declared on the CLR type |
| **Navigation** | Property pointing to related entity/collection |
| **Principal / Dependent** | Parent vs FK-holding side of a relationship |
| **Materialization** | Turning result-set rows into CLR objects |
| **Projection** | `Select` into DTO/anonymous shape |
| **Tracking** | Change tracker monitors entity for save |
| **Unit of Work** | Buffer changes; commit as one save/transaction |
| **Identity Map** | One tracked instance per key per context |
| **Cartesian explosion** | Join duplication from multiple collection includes |
| **Optimistic concurrency** | Detect conflicts with tokens, not long locks |
| **TPH / TPT / TPC** | Inheritance mapping strategies |
| **Owned type** | Value-object-like type owned by an entity |
| **Provider** | Database-specific EF plugin (SQL dialect/types) |

---

*Lector-style study sheet for EF / EF Core interviews. Study path: key concepts → junior Q&A → algorithms/internals → mid/senior scenarios. Practice by modeling a small domain, reviewing generated SQL, and deliberately reproducing N+1 and concurrency conflicts.*
