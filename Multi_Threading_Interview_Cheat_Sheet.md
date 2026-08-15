# .NET 10 Multithreading Interview Cheat Sheet

A consolidated interview reference for **multithreading, concurrency, parallelism, and asynchronous programming** in **C# 14 / .NET 10**. It emphasizes the mechanism behind each API, the trade-offs, and the failure modes interviewers expect you to recognize.

> Version note: C# 14 ships with .NET 10, but it adds no concurrency primitive of its own. The modern `System.Threading.Lock` integration was introduced in C# 13 / .NET 9 and remains the recommended in-process mutual-exclusion mechanism in .NET 10.

---

## Content

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Core Mental Models](#core-mental-models)
   - [Concurrency, Parallelism, Asynchrony](#c1-concurrency-parallelism-and-asynchrony)
   - [Process, Thread, ThreadPool, Task](#c2-process-thread-threadpool-and-task)
   - [CPU-Bound vs I/O-Bound](#c3-cpu-bound-vs-io-bound)
   - [Shared Mutable State](#c4-shared-mutable-state)
   - [Atomicity, Visibility, Ordering](#c5-atomicity-visibility-and-ordering)
   - [The .NET Memory Model](#c6-the-net-memory-model)
3. [Synchronization and Coordination](#synchronization-and-coordination)
   - [`Lock` and `lock`](#s1-systemthreadinglock-and-lock)
   - [`Monitor`](#s2-monitor)
   - [`Interlocked`, `Volatile`, and `volatile`](#s3-interlocked-volatile-and-volatile)
   - [Semaphores and Mutexes](#s4-semaphores-and-mutexes)
   - [Reader/Writer Locks](#s5-readerwriterlockslim)
   - [Events, Barrier, CountdownEvent](#s6-events-barrier-and-countdownevent)
   - [Spin Primitives](#s7-spin-primitives)
   - [Primitive Selection](#s8-primitive-selection)
4. [Tasks, Async, and Parallelism](#tasks-async-and-parallelism)
   - [`Task` and `Task.Run`](#t1-task-and-taskrun)
   - [`async` / `await`](#t2-async-and-await)
   - [`WhenAll` and `WhenAny`](#t3-taskwhenall-and-taskwhenany)
   - [Cancellation](#t4-cooperative-cancellation)
   - [Exceptions](#t5-task-exceptions)
   - [`ValueTask`](#t6-valuetask)
   - [Parallel Loops and PLINQ](#t7-parallel-loops-and-plinq)
   - [Bounded Concurrency](#t8-bounded-concurrency)
   - [`TaskCompletionSource`](#t9-taskcompletionsource)
   - [SynchronizationContext and ConfigureAwait](#t10-synchronizationcontext-and-configureawait)
5. [Collections, Channels, and Safer Designs](#collections-channels-and-safer-designs)
6. [Junior Interview Questions](#junior-interview-questions)
7. [Mid-Level Interview Questions](#mid-level-interview-questions)
8. [Senior Interview Questions](#senior-interview-questions)
9. [Failure Modes and Diagnostics](#failure-modes-and-diagnostics)
10. [Common Anti-Patterns](#common-anti-patterns)
11. [Rapid Interview Answers](#rapid-interview-answers)
12. [Self-Check Checklist](#self-check-checklist)
13. [Glossary](#glossary)

---

## How to Use This Guide

[↑ Content](#content)

- **Junior:** Explain threads, tasks, races, `lock`, cancellation, and CPU-bound vs I/O-bound work.
- **Mid:** Choose primitives, compose tasks, bound concurrency, and diagnose deadlocks or starvation.
- **Senior:** Explain memory ordering, safe publication, scheduling, contention, diagnostics, and architecture that minimizes shared state.

Answer interview questions in this order:

1. **Define** the concept in one sentence.
2. **Explain the mechanism** that makes it work.
3. **Name a trade-off or failure mode.**
4. **Give a short production example.**

The best multithreading answer is often not “add a lock.” First ask whether ownership, immutability, partitioning, or message passing can remove shared mutable state.

---

## Core Mental Models

### C1. Concurrency, Parallelism, and Asynchrony

[↑ Content](#content)

| Concept | Definition | Mechanism that makes it work | .NET 10 example |
|---|---|---|---|
| **Concurrency** | A *structural* property: several logical operations are in flight during overlapping time windows, not necessarily at the same instant | A scheduler interleaves whichever operations are ready to run; progress comes from switching, so a single core is enough | Kestrel serving thousands of connections on 8 cores |
| **Parallelism** | An *execution* property: several operations run at the same instant on different cores | Work is split into independent chunks; each chunk gets a thread that the OS places on its own core | `Parallel.For` over image tiles |
| **Asynchrony** | A *control-flow* property: the caller regains control before the operation finishes and resumes later through a continuation | The compiler rewrites the method into a state machine; the completion source (IOCP/epoll, timer, `TaskCompletionSource`) drives the next step when the result arrives | `await stream.ReadAsync(buffer, ct)` |
| **Multithreading** | An *implementation* choice: one process runs several OS threads | Each thread owns a stack and register context; the OS scheduler time-slices them across available cores | ThreadPool workers draining the work queue |

The same program can use all four, and each solves a different problem:

```csharp
// Asynchrony: the calling thread is released while the OS completes the read.
await using FileStream file = File.OpenRead(path);
int read = await file.ReadAsync(buffer, ct);

// Concurrency: three operations overlap in time; one thread can serve all three.
Task<User> user = LoadUserAsync(id, ct);
Task<Order[]> orders = LoadOrdersAsync(id, ct);
Task<Offer[]> offers = LoadOffersAsync(id, ct);
await Task.WhenAll(user, orders, offers);

// Parallelism: pure CPU work split across cores.
Parallel.For(0, tiles.Length, i => tiles[i] = Sharpen(tiles[i]));
```

They are related, not interchangeable:

- Async I/O may use **no thread** while the device or OS is handling the request.
- Concurrent operations may take turns on **one core**.
- Parallel CPU work requires multiple threads and available cores.
- Adding threads does not make inherently sequential work faster.

**Interview line:** `async` is about non-blocking coordination; parallelism is about simultaneous execution.

---

### C2. Process, Thread, ThreadPool, and Task

[↑ Content](#content)

| Abstraction | Definition | Who schedules it | What it costs | Choose it when |
|---|---|---|---|---|
| **Process** | An isolated address space with its own memory, handles, and runtime instance | The OS | Highest: separate memory and startup; communication requires IPC or the network | You need fault or security isolation, or independent deployment and restart |
| **Thread** | An OS-scheduled execution path with a private stack and register context | The OS scheduler; you control creation and lifetime | About 1 MB of reserved stack on Windows by default, plus kernel bookkeeping; every context switch discards warm CPU state | A long-lived blocking loop, a dedicated pump, or a specific apartment state or priority |
| **ThreadPool** | A runtime-managed set of reusable workers with one global queue plus a local queue per worker | The runtime; workers beyond `ThreadPool.MinThreads` (default `Environment.ProcessorCount`) are injected gradually | Almost nothing per work item, but the pool is a shared finite resource that every library competes for | Short CPU work, continuations, and timer callbacks |
| **Task** | A *promise object* holding the eventual completion state, result, exception, and cancellation of an operation | Nobody by itself: it is state plus a continuation list; a `TaskScheduler` is involved only when there is a delegate to run | One small heap allocation, avoidable with `ValueTask` on hot paths | You need to compose, await, or propagate the outcome of any operation |

```csharp
// Dedicated thread: a long blocking loop that must not occupy a pool worker.
Thread pump = new(DrainDeviceQueue) { IsBackground = true, Name = "device-pump" };
pump.Start();

// ThreadPool: short CPU work; the pool owns the thread and reuses it afterwards.
int checksum = await Task.Run(() => ComputeChecksum(block), ct);

// Tasks that never touch a thread: already complete, or completed by someone else.
ValueTask<int> cached = ValueTask.FromResult(42);
TaskCompletionSource<Message> tcs = new(TaskCreationOptions.RunContinuationsAsynchronously);
```

A `Task` is **not a thread**. It may represent:

- CPU work running on a ThreadPool thread
- asynchronous I/O with no thread blocked
- an already-completed result
- an externally completed operation via `TaskCompletionSource`

Prefer tasks and higher-level APIs. Create `Thread` directly only when you need a dedicated long-running thread, priority/affinity-like control, a specific apartment state, or isolation from ThreadPool scheduling.

.NET 10 made the pool more forgiving: when a worker is about to block, its local queue is flushed to the global queue so other workers can steal that work. This removes one class of self-inflicted stall, but it does not make sync-over-async safe — a captured `SynchronizationContext` still deadlocks, and blocked workers still consume the pool.

---

### C3. CPU-Bound vs I/O-Bound

[↑ Content](#content)

| Work | Definition | How to recognize it | Preferred pattern | Cost of misclassifying |
|---|---|---|---|---|
| **I/O-bound** | Elapsed time is dominated by waiting for a device or remote peer, while the CPU has nothing to do | A thread performing it would sit in a wait state; a faster CPU barely changes latency | Call the naturally async API and `await` it; scale by raising concurrency, never by adding threads | Wrapping a *synchronous* I/O call in `Task.Run` parks one worker per outstanding request and leads to ThreadPool starvation |
| **CPU-bound** | Elapsed time is dominated by executing instructions, so the work scales with core count | A profiler shows the method on-CPU; wall time drops when cores are added | Run it directly; use `Task.Run` only to keep a caller responsive (typically UI); use `Parallel`/PLINQ once each chunk is large enough to pay for scheduling | `await` cannot make computation cheaper; awaiting it on the UI thread still freezes the window |
| **Mixed** | Async I/O followed by non-trivial computation over the result | Both a network wait and a measurable post-processing step appear in the trace | Await the I/O, then parallelize only the CPU stage that measurement proved expensive | Parallelizing the whole pipeline multiplies open connections, sockets, and peak memory for no CPU gain |

```csharp
// I/O-bound: no extra worker thread is needed while waiting.
var json = await httpClient.GetStringAsync(uri, cancellationToken);

// CPU-bound: useful in a UI app; usually unnecessary in ASP.NET Core request code.
var digest = await Task.Run(
    () => ComputeDigest(data, cancellationToken),
    cancellationToken);
```

`Task.Run` around an async I/O method consumes a worker only to begin work that was already non-blocking. It adds scheduling overhead and does not improve scalability.

---

### C4. Shared Mutable State

[↑ Content](#content)

A race exists when correctness depends on unpredictable timing between concurrent accesses and at least one access mutates state.

```csharp
private int _count;

public void UnsafeIncrement()
{
    _count++; // read → add → write; not one atomic operation
}
```

Two threads can both read `10`, both compute `11`, and both write `11`. One update is lost.

Naming the *kind* of race is what separates a confident answer from “add a lock”:

| Race | Definition | Concrete failure | Fix |
|---|---|---|---|
| **Lost update** | Two read-modify-write sequences interleave, so the later write is based on a stale read | Two `_count++` calls on 10 produce 11 instead of 12 | `Interlocked.Increment`, or one lock around the whole update |
| **Check-then-act** | A decision is taken on state that another thread changes before the action runs | `if (!dict.ContainsKey(k)) dict.Add(k, v)` throws or overwrites | An atomic API such as `TryAdd`/`GetOrAdd`, or a lock spanning both steps |
| **Torn read or write** | A value wider than the platform's atomic unit, or a multi-field struct, is observed half-updated | A `struct Range(int Lo, int Hi)` is read with the old `Lo` and the new `Hi` | Publish an immutable object by reference, or lock both fields together |
| **Unsafe publication** | A reference becomes visible before the object it points to is fully initialized | A reader sees a non-null instance whose fields still hold defaults | `Volatile.Write`, `Interlocked.Exchange`, a lock, or `Lazy<T>` |
| **Broken invariant** | Every field is individually thread-safe, but the relationship between them is not | `Balance` is updated atomically while `LastTransactionId` is still the previous one | One lock, or one immutable snapshot covering the whole invariant |

Safer designs, in preferred order — earlier entries remove the problem, later entries only manage it:

| # | Strategy | Definition | .NET 10 example | Trade-off |
|---|---|---|---|---|
| 1 | **Locality** | State lives inside one operation and never escapes it | A local accumulator inside a method; no field is touched | Only works when nothing must outlive the call |
| 2 | **Immutability** | Values never change after construction, so readers cannot observe a transition | `record` or `ImmutableArray<T>` shared freely across threads | Every update allocates a new instance |
| 3 | **Ownership** | Exactly one component may mutate the state; everyone else sends it messages | A single-reader `Channel<T>` in front of a `BackgroundService` | Adds a hop and a queue you must bound |
| 4 | **Partitioning** | State is split so that no two workers touch the same slice | Per-worker buckets merged once at the end | Requires a partitioning key and a merge step |
| 5 | **Atomics and concurrent collections** | Individual operations are indivisible and correctly ordered | `Interlocked.Add`, `ConcurrentDictionary<K,V>` | Atomic per operation only, never per workflow |
| 6 | **Locking** | Mutual exclusion around the smallest coherent invariant | `lock` over a private `System.Threading.Lock` | Contention, and deadlock risk once locks nest |

```csharp
// 2. Immutable: any number of threads may read this snapshot without a lock.
public sealed record PricingRules(decimal Vat, ImmutableArray<string> ExemptSkus);

// 4. Partitioning: no shared counter on the hot path, one merge at the end.
long total = source
    .AsParallel()
    .Aggregate(0L, (subtotal, item) => subtotal + item.Bytes, (a, b) => a + b, x => x);

// 5. Atomic: correct for one independent value, not for a multi-field invariant.
Interlocked.Add(ref _bytesWritten, count);
```

---

### C5. Atomicity, Visibility, and Ordering

[↑ Content](#content)

Thread safety requires more than “the value fits in one machine word.”

| Property | Definition | Question to ask | Symptom when it is missing | Provided by |
|---|---|---|---|---|
| **Atomicity** | An operation is observed as indivisible: no thread can see a state between its start and its end | Can another thread observe a partial operation? | Lost updates and torn values | `Interlocked.*`, `lock`, swapping one immutable reference |
| **Visibility** | A write made by one thread becomes observable to another at a defined point instead of “eventually, maybe” | When does another thread observe the write? | A reader loops forever on a value cached in a register or in the core's store buffer | `Volatile.Read`/`Volatile.Write`, `volatile`, lock exit and entry, `Interlocked` |
| **Ordering** | Operations become visible to other threads in an order that program logic can rely on | Can compiler or CPU reordering expose an invalid sequence? | A reader sees the “ready” flag before the data that flag advertises | Acquire/release semantics from the same primitives, or a full fence |

`Interlocked.Increment` provides an atomic read-modify-write operation and appropriate memory ordering:

```csharp
private int _count;

public int Increment() => Interlocked.Increment(ref _count);
```

Visibility is the property that fails silently in Debug and breaks in Release. The JIT is allowed to hoist a non-volatile read out of a loop, because within a single thread nothing changes it:

```csharp
private bool _stop;                                   // may be read once and cached
public void Run() { while (!_stop) DoWork(); }        // can loop forever
public void Stop() => _stop = true;

// Correct: an acquire load each iteration, paired with a release store.
private bool _stopFlag;
public void RunSafely() { while (!Volatile.Read(ref _stopFlag)) DoWork(); }
public void RequestStop() => Volatile.Write(ref _stopFlag, true);
```

In real code, use a `CancellationToken` instead of a hand-rolled flag: it carries the correct ordering, composes with async APIs, and supports callbacks and linked sources.

Atomic fields do not automatically make a multi-field invariant atomic. If `Balance` and `LastTransactionId` must change together, protect the whole transition or publish one immutable snapshot.

---

### C6. The .NET Memory Model

[↑ Content](#content)

Each thread may observe cached values, and compilers/CPUs may reorder operations when single-threaded behavior is unchanged. Synchronization creates **happens-before** relationships that publish earlier writes to later readers.

Common publication boundaries:

| Boundary | Ordering edge it creates | What that guarantees in practice |
|---|---|---|
| Exiting and entering the same `lock` | Exit is a release, entry is an acquire | Everything written inside the critical section is visible to the next thread that enters it |
| Any `Interlocked` operation | Full barrier around an atomic read-modify-write | The value is updated indivisibly and surrounding writes are not reordered across it |
| `Volatile.Write` then `Volatile.Read` of the same field | Release store paired with an acquire load | A reader that observes the new reference also observes everything written before the store |
| `Thread.Start` and `Thread.Join` | Start publishes the caller's prior writes to the new thread; join publishes the thread's writes to the joiner | Setup before `Start` and results after `Join` need no extra synchronization |
| Task completion and `await` | Completion happens-before the continuation | Values computed inside the task are safe to read after the await, on any thread |
| Add and take on a concurrent collection or `Channel<T>` | The producer's add happens-before the consumer's take of that item | The consumer sees a fully constructed item without its own lock |

```csharp
private Config _config = Config.Empty;

public Config Current => Volatile.Read(ref _config);

public void Replace(Config next)
{
    ArgumentNullException.ThrowIfNull(next);
    Volatile.Write(ref _config, next); // publish fully constructed immutable object
}
```

C# 14's `field` keyword expresses the same pattern without an explicit backing field, since `field` is an ordinary variable that can be passed by `ref`:

```csharp
public Config Current
{
    get => Volatile.Read(ref field);
    set => Volatile.Write(ref field, value ?? throw new ArgumentNullException(nameof(value)));
} = Config.Empty;
```

`volatile`/`Volatile` controls visibility and ordering for an individual location; it does **not** turn compound operations such as `x++` into atomic operations.

Test on the hardware you deploy to. x64 is strongly ordered and hides many missing-barrier bugs, while ARM64 (Graviton, Ampere, Apple silicon) reorders far more aggressively, so code that passes on an x64 developer machine can fail on an ARM64 server. Reason from the memory model, not from what happens to pass locally.

---

## Synchronization and Coordination

### S1. `System.Threading.Lock` and `lock`

[↑ Content](#content)

For new .NET 10 code, use a private dedicated `System.Threading.Lock` for synchronous mutual exclusion:

```csharp
private readonly Lock _gate = new();
private decimal _balance;

public void Credit(decimal amount)
{
    lock (_gate)
    {
        _balance += amount;
    }
}
```

With a `Lock` target, the C# compiler uses `EnterScope()` and guaranteed disposal. For other reference objects, `lock` uses `Monitor.Enter/Exit` with `try/finally`.

Rules:

- Lock a private dedicated object, never `this`, a `Type`, or an interned string.
- Keep the critical section short.
- Do not perform slow I/O or callbacks while holding a lock.
- Use one documented lock order when multiple locks are necessary.
- `lock` is reentrant for the owning thread.
- You cannot `await` inside a `lock` statement; ownership belongs to a thread, while continuation may resume elsewhere.

---

### S2. `Monitor`

[↑ Content](#content)

`Monitor` is the lower-level mechanism behind object-based `lock`. It also provides condition waiting:

```csharp
private readonly object _gate = new();
private readonly Queue<Job> _jobs = new();

public Job Take()
{
    lock (_gate)
    {
        while (_jobs.Count == 0)
            Monitor.Wait(_gate); // releases gate, waits, then reacquires it

        return _jobs.Dequeue();
    }
}

public void Add(Job job)
{
    lock (_gate)
    {
        _jobs.Enqueue(job);
        Monitor.Pulse(_gate);
    }
}
```

Always check the condition in a `while`, not `if`: another waiter can consume the state before this thread reacquires the monitor. Prefer `Channel<T>` or `BlockingCollection<T>` for most producer/consumer code.

---

### S3. `Interlocked`, `Volatile`, and `volatile`

[↑ Content](#content)

| Tool | Use | Limitation |
|---|---|---|
| `Interlocked` | Atomic increment, exchange, compare-and-swap | Best for one/few independent values |
| `Volatile.Read/Write` | Ordered visible read/write | No compound atomicity |
| `volatile` field | Language shorthand for supported field types | Easy to overestimate |

Compare-and-swap enables lock-free state transitions:

```csharp
private int _state = (int)State.Created;

public bool TryStart() =>
    Interlocked.CompareExchange(
        ref _state,
        (int)State.Running,
        (int)State.Created) == (int)State.Created;
```

Lock-free does not mean wait-free, simpler, or always faster. Under contention, retry loops can waste CPU and suffer ABA-like design problems.

---

### S4. Semaphores and Mutexes

[↑ Content](#content)

| Primitive | Scope | Purpose |
|---|---|---|
| `SemaphoreSlim` | One process | Limit concurrent access; supports `WaitAsync` |
| `Semaphore` | Kernel-backed | Cross-process capable, heavier |
| `Mutex` | Kernel-backed, one owner | Cross-process mutual exclusion |

```csharp
private readonly SemaphoreSlim _slots = new(initialCount: 8);

public async Task<Response> SendAsync(Request request, CancellationToken ct)
{
    await _slots.WaitAsync(ct);
    try
    {
        return await SendCoreAsync(request, ct);
    }
    finally
    {
        _slots.Release();
    }
}
```

`SemaphoreSlim(1, 1)` is commonly used as an async-compatible gate. It is not thread-affine, so ownership discipline is your responsibility: release exactly once only after successful acquisition.

---

### S5. `ReaderWriterLockSlim`

[↑ Content](#content)

Allows concurrent readers and exclusive writers. It can help when reads are frequent, long enough to amortize overhead, and writes are rare.

```csharp
private readonly ReaderWriterLockSlim _rw = new();
private readonly Dictionary<int, Item> _items = [];

public Item? Get(int id)
{
    _rw.EnterReadLock();
    try { return _items.GetValueOrDefault(id); }
    finally { _rw.ExitReadLock(); }
}
```

Do not assume it beats a simple lock. Short critical sections, frequent writes, or low contention often make `Lock` faster and easier. Measure representative workloads.

---

### S6. Events, Barrier, and CountdownEvent

[↑ Content](#content)

| Primitive | Meaning |
|---|---|
| `ManualResetEventSlim` | Gate stays open until reset |
| `AutoResetEvent` | Releases one waiter per signal, then resets |
| `CountdownEvent` | Opens after N signals |
| `Barrier` | Participants meet at repeated phases |

These are mainly synchronous thread-coordination tools. Blocking a ThreadPool worker while waiting reduces scalability. In task-based code, prefer task completion, `WhenAll`, channels, or async-friendly primitives.

---

### S7. Spin Primitives

[↑ Content](#content)

`SpinWait`, `SpinLock`, and `ManualResetEventSlim` may spin briefly before yielding/blocking. Spinning can avoid a kernel transition when waits are extremely short, but it burns CPU and degrades badly under oversubscription.

Use only after measurement. Never spin around I/O, an unbounded condition, or on a single-core assumption. General application code should prefer `Lock`, `Interlocked`, or task-based coordination.

---

### S8. Primitive Selection

[↑ Content](#content)

| Need | Usually choose |
|---|---|
| Exclusive synchronous access | `lock` over private `Lock` |
| Atomic counter/reference swap | `Interlocked` |
| Publish immutable snapshot | `Volatile.Read/Write` or `Interlocked.Exchange` |
| Async mutual exclusion | `SemaphoreSlim(1, 1)` |
| Limit concurrency to N | `SemaphoreSlim(N)` or bounded channel |
| Producer/consumer stream | `Channel<T>` |
| Shared keyed state | `ConcurrentDictionary<TKey,TValue>` |
| Cross-process exclusivity | Named `Mutex` |
| Wait for many tasks | `Task.WhenAll` |
| Repeated phase rendezvous | `Barrier` |

Choose based on semantics first, benchmark second. A “faster” primitive with the wrong ownership or fairness behavior is incorrect.

---

## Tasks, Async, and Parallelism

### T1. `Task` and `Task.Run`

[↑ Content](#content)

`Task` represents completion and carries result, exception, and cancellation state. `Task.Run` queues a delegate to the ThreadPool.

```csharp
public Task<Report> BuildAsync(Input input, CancellationToken ct) =>
    Task.Run(() => BuildReport(input, ct), ct);
```

Use `Task.Run` for CPU-bound work when offloading is part of the API's intent (especially UI code). ASP.NET Core already runs request code on ThreadPool threads; wrapping CPU work in `Task.Run` usually just moves it to another worker and does not create capacity.

For long-running blocking work, consider a dedicated service/thread or redesign around async I/O rather than occupying ThreadPool workers.

---

### T2. `async` and `await`

[↑ Content](#content)

An async method runs synchronously until an incomplete await. It then registers a continuation and returns a task. Awaiting does not block the current thread.

```csharp
public async Task<string> LoadAsync(Uri uri, CancellationToken ct)
{
    using var response = await _http.GetAsync(uri, ct);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync(ct);
}
```

Important:

- `async` does not imply a new thread.
- Avoid `async void` except event handlers; callers cannot await or reliably observe exceptions.
- Return the task directly when no post-await logic or exception scope is required.
- “Async all the way” avoids blocking and context deadlocks.

---

### T3. `Task.WhenAll` and `Task.WhenAny`

[↑ Content](#content)

Start independent operations before awaiting them:

```csharp
Task<User> userTask = LoadUserAsync(id, ct);
Task<Order[]> ordersTask = LoadOrdersAsync(id, ct);

await Task.WhenAll(userTask, ordersTask);
return new Dashboard(await userTask, await ordersTask);
```

`WhenAll` provides concurrency, not automatically parallel threads. It completes when all inputs finish and faults if any fault. `WhenAny` completes when one input completes; the returned inner task must still be awaited to observe its result or exception.

Do not launch an unbounded task per item. `WhenAll` over 100,000 network calls can exhaust sockets, memory, rate limits, or downstream capacity.

---

### T4. Cooperative Cancellation

[↑ Content](#content)

Cancellation is a request, not forced termination:

```csharp
public async Task ProcessAsync(CancellationToken ct)
{
    foreach (var item in _items)
    {
        ct.ThrowIfCancellationRequested();
        await ProcessItemAsync(item, ct);
    }
}
```

Guidelines:

- Accept `CancellationToken` as the last parameter.
- Pass it through to every operation that supports it.
- Check it periodically in CPU loops.
- Throw `OperationCanceledException` with the matching token.
- After an irreversible commit, either finish consistently or define compensation; cancellation must not corrupt invariants.
- Dispose linked/token sources that you create.

---

### T5. Task Exceptions

[↑ Content](#content)

Await rethrows the operation's exception at the await point. Tasks retain all exceptions; blocking APIs and some aggregate operations expose `AggregateException`.

```csharp
try
{
    await Task.WhenAll(tasks);
}
catch
{
    foreach (Task task in tasks.Where(t => t.IsFaulted))
        Log(task.Exception!);
    throw;
}
```

Always observe fire-and-forget failures through a supervised background queue/service. Assigning a task to `_` does not make its errors safe.

---

### T6. `ValueTask`

[↑ Content](#content)

`ValueTask<T>` can avoid allocating a `Task<T>` when operations often complete synchronously. It is an optimization for measured hot paths, not a default return type.

Rules:

- Usually await it exactly once.
- Do not casually store it, await it multiple times, or combine it repeatedly.
- Convert with `.AsTask()` when task semantics are required (possibly allocating).
- Public APIs should prefer `Task<T>` unless profiling proves value.

---

### T7. Parallel Loops and PLINQ

[↑ Content](#content)

Use data parallelism for independent, sufficiently expensive CPU work:

```csharp
ParallelOptions options = new()
{
    MaxDegreeOfParallelism = Environment.ProcessorCount,
    CancellationToken = ct
};

Parallel.ForEach(images, options, image => Transform(image));
```

`Parallel.ForEachAsync` supports async delegates and bounded degree:

```csharp
await Parallel.ForEachAsync(
    urls,
    new ParallelOptions { MaxDegreeOfParallelism = 16, CancellationToken = ct },
    async (url, token) => await DownloadAsync(url, token));
```

PLINQ (`source.AsParallel()`) partitions a query. Ordering, merge cost, delegate cost, and shared writes can erase gains. Use `.AsOrdered()` only when required because ordering adds overhead.

---

### T8. Bounded Concurrency

[↑ Content](#content)

Bound concurrency to protect your process and dependencies:

```csharp
public static async Task<TResult[]> SelectBoundedAsync<T, TResult>(
    IEnumerable<T> source,
    int degree,
    Func<T, CancellationToken, Task<TResult>> selector,
    CancellationToken ct)
{
    using var gate = new SemaphoreSlim(degree);

    var tasks = source.Select(async item =>
    {
        await gate.WaitAsync(ct);
        try { return await selector(item, ct); }
        finally { gate.Release(); }
    });

    return await Task.WhenAll(tasks);
}
```

For an unbounded or streaming input, a bounded `Channel<T>` is better because it also supplies backpressure instead of creating all task objects up front.

---

### T9. `TaskCompletionSource`

[↑ Content](#content)

Bridges callback/event completion into a task:

```csharp
var tcs = new TaskCompletionSource<Message>(
    TaskCreationOptions.RunContinuationsAsynchronously);

void OnMessage(Message message) => tcs.TrySetResult(message);
```

Use `TrySet...` when completion can race. `RunContinuationsAsynchronously` prevents consumer continuations from executing inline inside the producer's lock/callback, reducing reentrancy and latency surprises.

---

### T10. `SynchronizationContext` and `ConfigureAwait`

[↑ Content](#content)

UI frameworks use a `SynchronizationContext` to marshal continuations back to the UI thread. Classic ASP.NET also had a context; ASP.NET Core normally does not.

```csharp
// Library code that does not need the caller's context:
var bytes = await stream.ReadAsync(buffer, ct).ConfigureAwait(false);
```

Blocking the UI thread with `.Result` while the async continuation needs that same thread creates a deadlock. Await instead.

Use `ConfigureAwait(false)` consistently in reusable libraries when continuation affinity is unnecessary. It is not a general performance incantation and does not make unsafe code thread-safe.

---

## Collections, Channels, and Safer Designs

[↑ Content](#content)

### Concurrent collections

| Type | Best fit |
|---|---|
| `ConcurrentDictionary<TKey,TValue>` | Shared key/value state and atomic per-key operations |
| `ConcurrentQueue<T>` | Multi-producer/multi-consumer FIFO |
| `ConcurrentStack<T>` | Concurrent LIFO |
| `ConcurrentBag<T>` | Unordered, thread-locality-friendly accumulation |
| `BlockingCollection<T>` | Blocking producer/consumer over a concurrent collection |

Compound logic still needs care:

```csharp
// Factory may run more than once; only one produced value is stored.
var value = cache.GetOrAdd(key, static k => ExpensiveCreate(k));
```

If creation must happen once, store `Lazy<T>` or `Task<T>` as the dictionary value and decide how failures/eviction work.

### Channels and backpressure

```csharp
Channel<Job> channel = Channel.CreateBounded<Job>(
    new BoundedChannelOptions(100)
    {
        FullMode = BoundedChannelFullMode.Wait,
        SingleReader = true
    });

await channel.Writer.WriteAsync(job, ct);

await foreach (Job next in channel.Reader.ReadAllAsync(ct))
    await HandleAsync(next, ct);
```

A bounded channel makes overload behavior explicit: producers wait or a configured item is dropped; callers using `TryWrite` can also fail or retry when it returns `false`. This is often safer than a shared queue plus manual signaling.

### Immutability, partitioning, and ownership

- Immutable records can be shared without locks.
- Per-worker accumulators avoid a lock on every item; merge once at the end.
- Actor/message-loop designs serialize access through one owner.
- `ThreadLocal<T>` and `Parallel.For` local state reduce contention, but values require disposal/merging.
- `AsyncLocal<T>` flows logical call context across awaits; it is not ordinary thread-local storage and can create hidden coupling.

---

## Junior Interview Questions

### J1. What is a race condition?

[↑ Content](#content)

A race condition occurs when a result depends on nondeterministic interleaving of concurrent operations. Prevent it by removing shared mutation or by synchronizing the entire invariant—not merely individual reads and writes.

### J2. What is the difference between a thread and a task?

[↑ Content](#content)

A thread is an OS-scheduled execution resource. A task is a composable representation of completion that may use a thread, asynchronous I/O, or no scheduling at all.

### J3. Does `async` create a new thread?

[↑ Content](#content)

No. An async method runs on its current thread until an incomplete await, registers a continuation, and returns. `Task.Run` explicitly queues CPU work to the ThreadPool.

### J4. What does `lock` guarantee?

[↑ Content](#content)

Only one thread at a time can execute a critical section for the same lock instance. Enter/exit also establishes memory-ordering guarantees so protected writes become visible.

### J5. Why is `counter++` not thread-safe?

[↑ Content](#content)

It consists of a read, increment, and write. Interleaving loses updates. Use `Interlocked.Increment` for a standalone counter or a lock when the counter belongs to a larger invariant.

### J6. How do you stop work safely?

[↑ Content](#content)

Use cooperative `CancellationToken`, propagate it, and leave state consistent. Do not kill threads arbitrarily.

### J7. `Thread.Sleep` vs `Task.Delay`?

[↑ Content](#content)

`Thread.Sleep` blocks the current thread. `Task.Delay` returns a task completed by a timer and frees the thread while waiting. Use `Task.Delay` in async flows.

### J8. Foreground vs background thread?

[↑ Content](#content)

Foreground threads keep the process alive; background threads do not. ThreadPool threads are background threads. Graceful shutdown still requires cancellation and awaiting workers—do not rely on process termination.

---

## Mid-Level Interview Questions

### M1. Why can `.Result` or `.Wait()` deadlock?

[↑ Content](#content)

The caller blocks a context thread; the awaited continuation is queued back to that same context, which cannot run. Even without a context, blocking wastes ThreadPool threads and can cause starvation. Use `await`.

### M2. How do you implement an async lock?

[↑ Content](#content)

Use `SemaphoreSlim(1, 1)` with `WaitAsync` and `Release` in `finally`, or a well-tested wrapper. Do not `await` while holding `lock`/`Monitor`.

### M3. When is `ConcurrentDictionary` insufficient?

[↑ Content](#content)

Its individual methods are thread-safe, but a sequence such as “check A, update B, remove C” is not one transaction. Use atomic dictionary APIs, store an immutable aggregate and swap it, or lock the multi-step invariant.

### M4. How do `WhenAll` exceptions work?

[↑ Content](#content)

The returned task records all child failures. Await throws one exception, while the task's `Exception` contains the aggregate. Inspect children/aggregate when every failure matters, and never abandon unobserved tasks.

### M5. How do you limit outgoing request concurrency?

[↑ Content](#content)

Use `SemaphoreSlim`, `Parallel.ForEachAsync`, or a bounded channel. Choose a limit from downstream capacity and latency measurements, propagate cancellation, and define retry/backpressure policy.

### M6. `lock` vs `SemaphoreSlim`?

[↑ Content](#content)

Use `lock` for short synchronous exclusive sections; it is simpler and ownership is thread-bound. Use `SemaphoreSlim` for async waiting or N permits. A semaphore does not enforce owner release.

### M7. When would you use `Parallel.ForEachAsync`?

[↑ Content](#content)

For many independent items when explicit maximum concurrency is useful. For pure CPU work, keep degree near available cores. For async I/O, tune against external capacity—not core count.

### M8. What is thread safety?

[↑ Content](#content)

Code is thread-safe when it preserves its documented invariants under all permitted concurrent calls. “Uses a concurrent collection” or “each field is atomic” is not sufficient proof.

---

## Senior Interview Questions

### SR1. Explain safe publication.

[↑ Content](#content)

Safe publication ensures another thread cannot observe a partially initialized or stale object. Publish an immutable fully constructed object through a lock, volatile write/read pair, interlocked exchange, task completion, or a thread-safe collection.

### SR2. Is double-checked locking safe?

[↑ Content](#content)

It can be correct with proper volatile publication, but `Lazy<T>` or static initialization is clearer and harder to break:

```csharp
private static readonly Lazy<Service> InstanceFactory =
    new(() => new Service(), LazyThreadSafetyMode.ExecutionAndPublication);

public static Service Instance => InstanceFactory.Value;
```

Static type initialization is thread-safe. Prefer it when initialization needs no runtime parameter.

### SR3. Deadlock, livelock, and starvation?

[↑ Content](#content)

| Failure | Meaning |
|---|---|
| **Deadlock** | Participants wait forever in a dependency cycle |
| **Livelock** | Participants run but repeatedly yield/retry without progress |
| **Starvation** | One operation is continually denied resources |

Prevent lock deadlocks with fixed ordering, small lock scope, no external callbacks under locks, and timeouts/cancellation where semantics allow.

### SR4. What causes ThreadPool starvation?

[↑ Content](#content)

Many pool workers block on sync I/O, locks, task waits, or long work; queued work and continuations cannot run until the pool injects threads. Symptoms include rising queue length and latency while CPU may remain below saturation.

Fix the blocking source, use async I/O, bound concurrency, and move truly dedicated blocking loops away from the pool. Raising minimum threads can mask symptoms but does not repair the design.

### SR5. What is false sharing?

[↑ Content](#content)

Independent hot fields on the same cache line are written by different cores, causing cache-line invalidation traffic. It appears as poor scaling without logical contention. Diagnose with measurement; mitigate by partitioning data or careful padding/layout only in proven hot paths.

### SR6. Lock-free vs wait-free?

[↑ Content](#content)

- **Lock-free:** system-wide progress is guaranteed; an individual operation may starve.
- **Wait-free:** every operation completes within bounded steps.
- **Obstruction-free:** progress occurs when running in isolation.

Most application code should prefer simple locks. Lock-free algorithms are difficult to prove, can allocate/retry heavily, and may need ABA and reclamation strategies.

### SR7. How do you design a high-throughput pipeline?

[↑ Content](#content)

Use bounded stages connected by channels, explicit ownership, controlled parallelism per stage, cancellation, completion propagation, and metrics. Backpressure prevents fast producers from exhausting memory when consumers slow down.

```text
Ingress → bounded channel → parse workers
        → bounded channel → business workers
        → bounded channel → batched output
```

### SR8. How do ASP.NET Core concurrency rules differ from UI apps?

[↑ Content](#content)

ASP.NET Core normally has no request `SynchronizationContext`, so continuations need not return to the original thread. Request-scoped services may still be non-thread-safe: starting parallel operations that share one `DbContext`, stream, or mutable scope is unsafe. UI apps require thread affinity for controls.

### SR9. How do you test concurrent code?

[↑ Content](#content)

Separate pure state transitions from scheduling, inject clocks/queues, use barriers or task completions to force interleavings, apply timeouts, repeat stress tests, and assert invariants rather than timing. `Thread.Sleep`-based tests are slow and nondeterministic.

### SR10. How do you choose between optimistic and pessimistic coordination?

[↑ Content](#content)

Use optimistic compare-and-swap/versioning when conflicts are rare and retries are cheap. Use exclusive locking when conflicts are common or transitions span complex invariants. Measure retry rate, contention, tail latency, and fairness—not only average throughput.

---

## Failure Modes and Diagnostics

[↑ Content](#content)

| Symptom | Likely causes | Evidence to collect |
|---|---|---|
| Requests slow, CPU low | ThreadPool starvation, blocked I/O | ThreadPool queue/thread counters, stacks |
| CPU near 100%, throughput flat | Oversubscription, spin/retry, expensive work | CPU trace, thread count, hot methods |
| Operations never complete | Deadlock, lost signal, abandoned task | Parallel stacks, dump, wait chains |
| Memory continually grows | Unbounded queue/tasks, retained `AsyncLocal` | Heap dump, queue depth, allocation trace |
| Rare wrong results | Data race, unsafe publication | Invariant logs, stress test, forced interleavings |
| Poor multicore scaling | Lock contention, false sharing | Contention events, CPU/cache profiling |

Useful .NET tools:

- `dotnet-counters` — ThreadPool thread count, queue length, CPU, exceptions
- `dotnet-trace` / PerfView — scheduling, contention, CPU, runtime events
- `dotnet-stack` — live managed stacks
- `dotnet-dump` — offline dumps and lock/wait inspection
- Visual Studio Parallel Stacks / Tasks — grouped thread and task views
- BenchmarkDotNet — controlled throughput/allocation benchmarks

Diagnose with evidence. Adding locks, retries, delays, or ThreadPool threads before identifying the wait graph often changes timing without fixing correctness.

---

## Common Anti-Patterns

[↑ Content](#content)

| Anti-pattern | Why it fails | Better direction |
|---|---|---|
| `lock(this)`, strings, or public objects | External code can share the lock | Private `Lock` instance |
| `await` under synchronous lock | Thread-bound ownership conflicts with continuation | Async gate or redesign |
| `.Result`, `.Wait()`, `.GetAwaiter().GetResult()` | Deadlock/starvation risk | Async all the way |
| `Task.Run` around async I/O | Extra scheduling, no scalability gain | Await native async API |
| `async void` outside events | No composable completion/error channel | Return `Task` |
| Unbounded `WhenAll` | Resource and downstream exhaustion | Bound concurrency/backpressure |
| Fire-and-forget request task | Scope disposed; exceptions lost | Hosted background queue/service |
| Locking each field separately | Multi-field invariant can tear | One coherent lock/snapshot |
| Assuming concurrent collection makes workflow atomic | Only individual operations are atomic | Atomic API or external coordination |
| Holding a lock across I/O/callback | Long contention and reentrancy/deadlock | Copy state, release, then call |
| Using `volatile` for `x++` | Visibility is not compound atomicity | `Interlocked` |
| Parallelizing tiny work | Scheduling/merge cost dominates | Keep sequential; benchmark |
| Cancellation swallowed as success | Callers cannot distinguish cancellation | Propagate matching cancellation |
| Sleeping to coordinate | Timing-dependent and blocks threads | Signals, tasks, channels |

---

## Rapid Interview Answers

[↑ Content](#content)

- **Task vs thread:** Task models completion; thread is an execution resource.
- **Async vs parallel:** Async avoids blocking while waiting; parallel uses simultaneous execution.
- **Best modern lock:** Private `System.Threading.Lock` with `lock` for synchronous critical sections.
- **Can `await` be inside `lock`?** No; use an async-compatible design such as `SemaphoreSlim`.
- **Atomic increment:** `Interlocked.Increment`.
- **Safe cancellation:** Cooperative `CancellationToken`, propagated end to end.
- **Producer/consumer:** Prefer bounded `Channel<T>` for async pipelines.
- **Protect a dictionary:** `ConcurrentDictionary` for atomic per-key operations; lock larger invariants.
- **Avoid context deadlock:** Do not block on tasks; await them.
- **ThreadPool starvation:** Workers are blocked, so queued continuations/work wait.
- **Parallel CPU degree:** Start near processor count and measure.
- **Parallel I/O degree:** Bound according to downstream/resource capacity.
- **Safest shared state:** No shared mutable state—immutability, ownership, partitioning.
- **`volatile` vs `Interlocked`:** Visibility/order vs atomic read-modify-write.
- **`WhenAll`:** Concurrently wait for all already-started tasks; bound large workloads.

---

## Self-Check Checklist

[↑ Content](#content)

**Foundations**

- [ ] Explain concurrency, parallelism, asynchrony, and multithreading
- [ ] Explain why a task is not a thread
- [ ] Distinguish CPU-bound and I/O-bound work
- [ ] Identify a race and the invariant being violated
- [ ] Explain atomicity, visibility, ordering, and happens-before

**Synchronization**

- [ ] Use private `System.Threading.Lock` correctly
- [ ] Explain `Monitor.Wait` releasing and reacquiring the monitor
- [ ] Choose between `Interlocked`, `Volatile`, lock, and semaphore
- [ ] Explain why `await` cannot occur in `lock`
- [ ] Recognize when cross-process `Mutex` is required
- [ ] Explain why reader/writer locks require benchmarking

**Tasks and async**

- [ ] Explain the async state-machine flow
- [ ] Use `WhenAll`, `WhenAny`, and cancellation correctly
- [ ] Explain sync-over-async deadlock and starvation
- [ ] Bound concurrency and apply backpressure
- [ ] Know when `ValueTask` is justified
- [ ] Explain context capture and `ConfigureAwait`

**Architecture and diagnostics**

- [ ] Prefer immutability, ownership, and channels over shared state
- [ ] Explain deadlock, livelock, starvation, and false sharing
- [ ] Diagnose ThreadPool starvation from counters and stacks
- [ ] Avoid sharing non-thread-safe scoped services across parallel work
- [ ] Test invariants with controlled interleavings rather than sleeps
- [ ] Measure contention, throughput, allocations, and tail latency

---

## Glossary

[↑ Content](#content)

| Term | Short definition |
|---|---|
| **Atomic operation** | Operation observed as indivisible |
| **Backpressure** | Consumers limit producers so queued work stays bounded |
| **Cancellation** | Cooperative request to stop work |
| **Contention** | Multiple participants compete for one resource |
| **Critical section** | Code that must execute with controlled concurrency |
| **Deadlock** | Cyclic waiting with no possible progress |
| **False sharing** | Independent writes contend on one hardware cache line |
| **Happens-before** | Ordering relation that guarantees visibility of prior writes |
| **Livelock** | Active participants repeatedly react but make no progress |
| **Lock-free** | At least one operation always makes system-wide progress |
| **Parallelism** | Work executes simultaneously |
| **Race condition** | Correctness depends on unpredictable interleaving |
| **Safe publication** | Making initialized state visible with correct ordering |
| **Starvation** | Work is indefinitely denied execution/resources |
| **SynchronizationContext** | Policy for scheduling continuations to an environment |
| **Thread affinity** | Requirement that code/resource be accessed by one thread |
| **ThreadPool** | Runtime-managed reusable worker-thread pool |
| **Wait-free** | Every operation completes in bounded steps |

---

*Study path: mental models → synchronization semantics → task composition → bounded pipelines → failure diagnosis. Practice by deliberately reproducing a lost update, a lock-order deadlock, sync-over-async blocking, and ThreadPool starvation—then fix each with the smallest correct design.*
