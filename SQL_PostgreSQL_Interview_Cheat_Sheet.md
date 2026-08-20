# SQL / PostgreSQL Interview Cheat Sheet

A consolidated interview reference for **relational databases**, **SQL**, and **PostgreSQL**. Answers go one level below definitions — interviewers reward *why the model works that way*, *what anomalies each isolation level allows*, and *what an index costs on writes*, not a memorized keyword list.

> Dialect note: concepts are **ANSI-relational** (following the American National Standards Institute SQL standard) where possible; syntax and behavior callouts are **PostgreSQL-first** (default isolation, MVCC, `ON CONFLICT`, `JSONB`, `EXPLAIN`, vacuum).

> New to databases? Read the [Abbreviations and Acronyms](#abbreviations-and-acronyms) table first. Every initialism used below (MVCC, WAL, ACID, GIN, and the rest) is expanded there and again at first use.

---

## Content

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Abbreviations and Acronyms](#abbreviations-and-acronyms)
3. [Relational Database Fundamentals](#relational-database-fundamentals)
   - [The Relational Model](#r1-the-relational-model)
   - [Keys](#r2-keys)
   - [Integrity Constraints](#r3-integrity-constraints)
   - [Normalization and Denormalization](#r4-normalization-and-denormalization)
   - [ER Modeling to Tables](#r5-er-modeling-to-tables)
   - [DDL, DML, DCL, TCL](#r6-ddl-dml-dcl-tcl)
   - [ACID Overview](#r7-acid-overview)
4. [Core SQL](#core-sql)
   - [SELECT Execution Mental Model](#q1-select-execution-mental-model)
   - [Joins](#q2-joins)
   - [Aggregates, GROUP BY, HAVING](#q3-aggregates-group-by-having)
   - [Subqueries and CTEs](#q4-subqueries-and-ctes)
   - [Set Operations](#q5-set-operations)
   - [Window Functions](#q6-window-functions)
   - [NULL Semantics](#q7-null-semantics)
   - [INSERT, UPDATE, DELETE, Upsert](#q8-insert-update-delete-upsert)
   - [Views and Materialized Views](#q9-views-and-materialized-views)
5. [Transactions and Concurrency](#transactions-and-concurrency)
   - [Transaction Lifecycle](#t1-transaction-lifecycle)
   - [Isolation Levels and Anomalies](#t2-isolation-levels-and-anomalies)
   - [PostgreSQL Isolation Reality](#t3-postgresql-isolation-reality)
   - [Locks and Row-Level Locking](#t4-locks-and-row-level-locking)
   - [Optimistic vs Pessimistic Concurrency](#t5-optimistic-vs-pessimistic-concurrency)
   - [Long Transactions and Connection Pools](#t6-long-transactions-and-connection-pools)
   - [Idempotency and Exactly-Once Illusions](#t7-idempotency-and-exactly-once-illusions)
6. [Indexing and Query Performance](#indexing-and-query-performance)
   - [Index Types in PostgreSQL](#i1-index-types-in-postgresql)
   - [Composite Indexes and Selectivity](#i2-composite-indexes-and-selectivity)
   - [EXPLAIN and EXPLAIN ANALYZE](#i3-explain-and-explain-analyze)
   - [Common Query Anti-Patterns](#i4-common-query-anti-patterns)
   - [Statistics, ANALYZE, Vacuum Basics](#i5-statistics-analyze-vacuum-basics)
7. [Schema Design and Constraints](#schema-design-and-constraints)
   - [PostgreSQL Types Interviewers Probe](#d1-postgresql-types-interviewers-probe)
   - [Constraints in Practice](#d2-constraints-in-practice)
   - [Partitioning Overview](#d3-partitioning-overview)
   - [Safe Schema Migrations](#d4-safe-schema-migrations)
8. [PostgreSQL-Specific Interview Hits](#postgresql-specific-interview-hits)
   - [MVCC and Vacuum](#p1-mvcc-and-vacuum)
   - [JSONB](#p2-jsonb)
   - [Sequences, Identity, and Gaps](#p3-sequences-identity-and-gaps)
   - [Connections, Prepared Statements, Observability](#p4-connections-prepared-statements-observability)
   - [Replication and HA One-Liners](#p5-replication-and-ha-one-liners)
9. [Junior (0–2 Years)](#junior-02-years)
   - [What is a relational database?](#j1-what-is-a-relational-database)
   - [Primary key vs foreign key](#j2-what-is-the-difference-between-a-primary-key-and-a-foreign-key)
   - [INNER JOIN vs LEFT JOIN](#j3-what-is-the-difference-between-inner-join-and-left-join)
   - [WHERE vs HAVING](#j4-where-vs-having)
   - [How does NULL work in SQL?](#j5-how-does-null-work-in-sql)
   - [What is a transaction?](#j6-what-is-a-transaction)
   - [Why do we use indexes?](#j7-why-do-we-use-indexes)
   - [DELETE vs TRUNCATE](#j8-delete-vs-truncate)
   - [What is normalization?](#j9-what-is-normalization)
   - [How does GROUP BY work?](#j10-how-does-group-by-work)
10. [Mid (2–5 Years)](#mid-25-years)
    - [Isolation levels and anomalies](#m1-explain-isolation-levels-and-the-anomalies-they-prevent)
    - [Window functions vs GROUP BY](#m2-window-functions-vs-group-by)
    - [CTE vs subquery](#m3-cte-vs-subquery)
    - [Deadlocks](#m4-what-is-a-deadlock-and-how-do-you-handle-it)
    - [Composite indexes](#m5-how-do-you-design-a-composite-index)
    - [Reading EXPLAIN ANALYZE](#m6-how-do-you-read-explain-analyze)
    - [INSERT ON CONFLICT upsert](#m7-how-does-insert-on-conflict-upsert-work)
    - [MVCC in PostgreSQL](#m8-what-is-mvcc-in-postgresql)
    - [Soft delete vs hard delete](#m9-soft-delete-vs-hard-delete)
    - [OFFSET vs keyset pagination](#m10-offset-pagination-vs-keyset-pagination)
11. [Senior (5+ Years)](#senior-5-years)
    - [Repeatable Read vs Serializable](#s1-repeatable-read-vs-serializable-in-postgresql)
    - [Inventory reservation under contention](#s2-how-would-you-implement-inventory-reservation-under-contention)
    - [Designing for hot rows](#s3-how-do-you-design-for-hot-rows)
    - [Index/write trade-offs at scale](#s4-indexwrite-trade-offs-at-scale)
    - [When to partition](#s5-when-do-you-partition--and-when-not)
    - [When not to use JSONB](#s6-when-should-you-not-use-jsonb)
    - [Pooling and transaction boundaries](#s7-connection-pooling-and-transaction-boundaries)
    - [Diagnosing slow queries](#s8-how-do-you-diagnose-a-slow-query-in-production)
    - [Safe online migrations](#s9-how-do-you-keep-migrations-safe-online)
    - [Idempotent consumers](#s10-how-do-you-ensure-idempotent-consumers-with-a-database)
12. [Quick Interview Checklist](#quick-interview-checklist)
13. [Glossary](#glossary)

---

## How to Use This Guide

[↑ Content](#content)

- **Junior:** Vocabulary and set thinking — keys, joins, `NULL`, `GROUP BY`, what a transaction is, why indexes exist.
- **Mid:** Isolation anomalies, window functions, composite indexes, `EXPLAIN`, upserts, MVCC (multi-version concurrency control), pagination strategies.
- **Senior:** Lock design under contention, isolation choice in Postgres, hot-row patterns, write amplification from indexes, when *not* to use `JSONB` or partitioning, production diagnosis.

Answer live questions in this shape:

1. **Definition** in one sentence.
2. **Mechanism** — how the engine actually behaves (MVCC, lock, planner).
3. **Trade-off or failure mode** — anomaly, write cost, deadlock, bloat.
4. **When you would choose it** — and when you would not.

The weakest SQL answer is a keyword dump. The strongest one distinguishes *"the standard says X"* from *"PostgreSQL does Y,"* because that is how production bugs appear.

---

## Abbreviations and Acronyms

[↑ Content](#content)

Database conversations are dense with initialisms, and interviewers use them without warning. Every abbreviation in this guide is expanded the first time it appears in the text, but this table is the single place to look them all up. Skim it once before reading the rest; come back whenever a set of capital letters appears that you cannot decode.

**Language and standards**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **SQL** | Structured Query Language | The declarative language you use to define and query relational data. Pronounced "sequel" or "ess-cue-el"; both are accepted |
| **ANSI** | American National Standards Institute | The body behind the SQL standard. "ANSI SQL" means portable syntax that most engines implement the same way |
| **DDL** | Data Definition Language | The subset of SQL that defines structure: `CREATE`, `ALTER`, `DROP` |
| **DML** | Data Manipulation Language | The subset that reads and changes data: `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | Data Control Language | The subset that grants and revokes permissions: `GRANT`, `REVOKE` |
| **TCL** | Transaction Control Language | The subset that bounds transactions: `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` |
| **ER** | Entity-Relationship | A diagramming style for sketching entities (things) and the relationships between them before you write any `CREATE TABLE` |
| **RDBMS** | Relational Database Management System | The software itself: PostgreSQL, MySQL, SQL Server, Oracle |
| **ORM** | Object-Relational Mapper | A library that maps database rows to objects in your application language, such as Entity Framework Core or Hibernate |
| **CRUD** | Create, Read, Update, Delete | The four basic data operations, mapping to `INSERT`, `SELECT`, `UPDATE`, `DELETE` |

**Keys and normalization**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **PK** | Primary key | The column or columns chosen to uniquely identify each row of a table |
| **FK** | Foreign key | A column that points at the primary key of another row, usually in another table |
| **NF** | Normal form | A rule set describing how free of redundancy a table design is |
| **1NF / 2NF / 3NF** | First / Second / Third Normal Form | Progressively stricter normalization rules; 3NF is the usual design target |
| **BCNF** | Boyce-Codd Normal Form | A stricter refinement of 3NF, named after E. F. Codd and Raymond Boyce |
| **1:1 / 1:N / N:M** | One-to-one / one-to-many / many-to-many | Relationship cardinalities. Read `N` and `M` as "some number of." One customer to many orders is 1:N |

**Transactions and concurrency**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **ACID** | Atomicity, Consistency, Isolation, Durability | The four guarantees a transactional database promises |
| **MVCC** | Multi-Version Concurrency Control | PostgreSQL's approach to concurrency: keep several versions of each row so readers never block writers |
| **RC** | Read Committed | The default PostgreSQL isolation level |
| **RR** | Repeatable Read | An isolation level one step stricter than Read Committed. Written out in full in most places, but interviewers often abbreviate it |
| **SSI** | Serializable Snapshot Isolation | The algorithm behind PostgreSQL's Serializable level; it detects conflicts rather than locking preemptively |
| **WAL** | Write-Ahead Log | The append-only log PostgreSQL writes before changing data files. It is the basis of both crash recovery and replication |
| **txn** | Transaction | Common written shorthand in logs and documentation |
| **`40001`** | SQLSTATE `serialization_failure` | The error code PostgreSQL returns when it aborts a transaction to protect isolation. Your application is expected to retry it |
| **2PC** | Two-Phase Commit | A protocol for committing across multiple databases atomically; slow and rarely the right answer |

**Indexing and performance**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **B-tree** | Balanced tree | The default index structure: a sorted, shallow tree giving fast equality, range, and ordered access |
| **GIN** | Generalized Inverted Index | An index that maps each contained value back to the rows holding it. Used for `JSONB`, arrays, and full-text search |
| **GiST** | Generalized Search Tree | A pluggable tree framework used for geometry, ranges, and similarity searches |
| **BRIN** | Block Range Index | A tiny index storing min/max summaries per block range. Only useful when data is physically ordered, such as append-only time series |
| **FTS** | Full-Text Search | Searching natural-language text by word rather than by exact string match |
| **I/O** | Input/Output | Reading from and writing to disk or network; usually the slowest part of a query |
| **N+1** | "N plus one" queries | An anti-pattern where fetching N parent rows triggers one extra query per parent, so N+1 round trips happen instead of one |
| **TPS / QPS** | Transactions / Queries Per Second | Throughput measures |

**Operations and infrastructure**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **HA** | High Availability | Design that keeps the database serving traffic through failures, usually via replicas and automatic failover |
| **DBA** | Database Administrator | The role that owns database operations, tuning, and backups |
| **SRE** | Site Reliability Engineer | The role that owns production reliability, often overlapping with DBA duties |
| **PID** | Process Identifier | The operating-system process number. Each PostgreSQL connection is a backend process with its own PID, visible in `pg_stat_activity` |
| **DNS** | Domain Name System | Hostname-to-address lookup; often how clients rediscover a promoted primary after failover |
| **UTC** | Coordinated Universal Time | The timezone-neutral reference clock. PostgreSQL stores `timestamptz` values relative to UTC |
| **PgBouncer** | (product name) | A lightweight connection pooler that sits between your application and PostgreSQL |
| **DDoS / OLTP / OLAP** | Denial of service / Online Transaction Processing / Online Analytical Processing | OLTP is many small reads and writes (a web app); OLAP is few large analytical scans (a reporting warehouse) |

**Data types and domain terms**

| Abbreviation | Stands for | What it means here |
|--------------|------------|--------------------|
| **JSON** | JavaScript Object Notation | A text format for nested key/value data |
| **JSONB** | JSON Binary | PostgreSQL's parsed, binary JSON storage type. Faster to query and indexable, unlike the plain `json` type which stores raw text |
| **UUID** | Universally Unique Identifier | A 128-bit identifier that can be generated anywhere without coordinating with the database |
| **IEEE 754** | (floating-point standard) | The binary floating-point format behind `real` and `double precision`. It cannot represent `0.1` exactly, which is why money uses `numeric` |
| **SKU** | Stock Keeping Unit | A retail product code; used in this guide as a realistic natural key example |
| **ISBN** | International Standard Book Number | A book identifier; another natural key example |
| **API / UI** | Application Programming Interface / User Interface | The programmatic and human-facing surfaces of an application |

---

## Relational Database Fundamentals

### R1. The Relational Model

[↑ Content](#content)

A **relational database** stores data as **relations** (tables): sets of **tuples** (rows) over a fixed set of **attributes** (columns), each with a domain (type).

The word "relational" comes from mathematics, not from "tables having relationships." A relation is just a set of records that all share the same shape. That single idea is why the model is powerful: because every table has a predictable shape, one small set of operations (filter, project, join, aggregate) works on all of them, and the database is free to decide *how* to execute your request. You describe the result you want; the engine picks the strategy.

The formal vocabulary below shows up in interview questions and textbooks. In day-to-day work almost everyone says table, row, and column instead.

| Term | Meaning |
|------|---------|
| **Relation** | Table — a set of rows with the same columns |
| **Tuple** | One row |
| **Attribute** | One column |
| **Domain** | Allowed values for an attribute (type + constraints) |
| **Degree** | Number of attributes |
| **Cardinality** | Number of tuples (rows) in the relation. Careful: in indexing and query-planning contexts the same word means the number of *distinct* values in a column, which is a different measurement. Judge by context |

Key properties interviewers expect:

- Rows are **unordered** unless you `ORDER BY`
- Columns are identified by **name**, not position (position matters only in some `INSERT` forms and `UNION` column alignment)
- Duplicate rows are possible in SQL tables unless you enforce uniqueness (true mathematical relations are sets; SQL is bag/multiset oriented)

**Deeper understanding**

SQL is not pure relational algebra. It adds bags (`UNION ALL`), `NULL`, ordered results, and procedural extensions. When someone says “think in sets,” they mean: prefer declarative joins/filters over row-by-row application loops.

Concretely: an application developer's instinct is to loop — fetch a list, then for each item fetch its details. In SQL that instinct produces the [N+1 problem](#i4-common-query-anti-patterns) and is often a hundred times slower than one query that expresses the same intent as a join. Set thinking means asking "what shape is the answer?" rather than "what steps produce the answer?"

**Interview line:** A relational DB models data as tables with typed columns and keys; queries are set-oriented, not pointer-chasing like an object graph.

---

### R2. Keys

[↑ Content](#content)

A **key** answers one of two questions: "which row is this?" or "which other row does this point to?" Because rows in a relational table have no built-in address or pointer the way objects in memory do, keys are the *only* way to identify a row and the only way to connect one table to another. Everything else in relational design is built on that foundation.

The terminology below looks like seven separate concepts, but it is really two ideas viewed from different angles. A **primary key** identifies a row within its own table. A **foreign key** references a row somewhere else. The remaining terms describe *which* columns you chose and *why*.

| Key type | Definition | Interview use |
|----------|------------|---------------|
| **Candidate key** | Minimal set of columns that uniquely identifies a row | Several candidates may exist |
| **Primary key (PK)** | Chosen candidate key; one per table | Clustered-like mental model; identity of the row |
| **Alternate key** | Candidate key not chosen as PK | Usually enforced with `UNIQUE` |
| **Foreign key (FK)** | Column(s) referencing a PK/unique key in another table | Referential integrity |
| **Composite key** | Key made of multiple columns | Order-line: `(order_id, line_no)` |
| **Natural key** | Meaningful business key (email, ISBN — the International Standard Book Number) | Stable only if business is stable |
| **Surrogate key** | Synthetic id (`bigint`, `uuid` — a universally unique identifier) | Preferred for mutable business attributes |

In the schema below, `customers.id` is a surrogate primary key, `customers.email` is a natural alternate key enforced with `UNIQUE`, and `orders.customer_id` is a foreign key tying each order back to exactly one customer.

```sql
CREATE TABLE customers (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       text NOT NULL UNIQUE,          -- alternate / natural key
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  bigint NOT NULL REFERENCES customers (id),
  status       text NOT NULL
);
```

**Deeper understanding**

- Surrogate PKs survive renames and merges; natural keys still often need `UNIQUE` for business rules.
- FKs point at a **unique** target (PK or unique constraint), not “any column.” The reason is logical, not arbitrary: a reference that could match several rows would not identify anything.
- Composite FKs must match column count and types of the referenced unique key.

The natural-versus-surrogate debate is the one interviewers actually probe. Use a surrogate key by default, because business identifiers change: people change email addresses, products get re-coded, and countries merge. When a natural key changes and other tables reference it, you have to update every referencing row. A surrogate key never changes, so the reference never breaks — and you still add `UNIQUE` on the natural key to enforce the business rule.

**Related concepts:** [Integrity Constraints](#r3-integrity-constraints), [Sequences, Identity, and Gaps](#p3-sequences-identity-and-gaps)

---

### R3. Integrity Constraints

[↑ Content](#content)

A **constraint** is a rule the database refuses to break. Declare it once in the schema and it applies to every writer forever: your API, an admin script, a colleague typing `UPDATE` at 2am, and two requests racing each other at the same millisecond. That last case is the important one, and it is why constraints beat application-level validation. Application code checks a rule and then writes, and something else can slip in between those two steps; a constraint is checked by the engine as part of the write itself.

Integrity is traditionally split into four kinds, which is just a taxonomy for "what kind of wrongness are we preventing."

| Integrity | Guarantees | Enforced by |
|-----------|------------|-------------|
| **Entity** | Every row is uniquely identifiable | `PRIMARY KEY` / `UNIQUE` + `NOT NULL` on key |
| **Referential** | FK values exist in parent (or are NULL if allowed) | `FOREIGN KEY` |
| **Domain** | Values fit the type and allowed set | Types, `CHECK`, enums |
| **User-defined** | Business rules | `CHECK`, exclusion constraints, triggers, app logic |

Referential actions decide what happens to child rows when the parent they point at is deleted or its key is updated. If you delete a customer who has orders, the database must do *something* with those orders — leaving them pointing at a customer that no longer exists is exactly what referential integrity forbids. You choose the behavior when you declare the foreign key; `NO ACTION` is the default.

| Action | On `DELETE` / `UPDATE` of parent |
|--------|-------------------------------------|
| `NO ACTION` / `RESTRICT` | Reject if children exist |
| `CASCADE` | Propagate delete/update to children |
| `SET NULL` | Null out FK (nullable FK required) |
| `SET DEFAULT` | Set FK to default |

**Deeper understanding**

Constraints are the cheapest correctness tool: they hold under every client, race, and bug. Application-only validation is not a substitute for uniqueness and FKs when correctness matters.

`CASCADE` deserves a warning. `ON DELETE CASCADE` is convenient for genuinely owned children (order line items belong to their order and are meaningless without it), and dangerous for anything else, because one `DELETE` can silently remove a large subtree of data. Reach for `RESTRICT` when deletion should be a deliberate, explicit act.

**Interview line:** Prefer declaring integrity in the schema; the database is the last line of defense under concurrent writers.

---

### R4. Normalization and Denormalization

[↑ Content](#content)

**Normalization** reduces redundancy and update anomalies by designing tables around functional dependencies.

Plain version: store every fact exactly once, in the table where it belongs. If a customer's address appears in every one of their order rows, you have stored one fact a thousand times, and the day they move you must find and change all thousand copies. Miss one and your data now disagrees with itself. Normalization is the discipline of splitting tables until each fact has exactly one home.

A **functional dependency** is the underlying idea: column B is functionally dependent on column A if knowing A always tells you B. Knowing an order's `id` tells you its `total`, so `total` belongs in the orders table. Knowing an order's `id` also tells you the customer's name, but only indirectly, through `customer_id` — so the name belongs in the customers table instead.

The **normal forms** (NF) are progressively stricter checkpoints on that journey. You rarely recite them at your desk, but interviewers ask, and the shorthand below is what they want to hear.

| Form | Rule (interview shorthand) |
|------|----------------------------|
| **1NF** (First Normal Form) | Atomic cells; no repeating groups in a column. No `tags` column holding `"red,green,blue"` |
| **2NF** (Second Normal Form) | 1NF + no partial dependency of non-key attributes on part of a composite key. Only relevant when the primary key spans multiple columns |
| **3NF** (Third Normal Form) | 2NF + no transitive dependency of non-key attributes on other non-key attributes. If you store `zip_code` and also `city`, and the zip determines the city, the city does not belong here |
| **BCNF** (Boyce-Codd Normal Form) | Every determinant is a candidate key (stricter than 3NF). Named after E. F. Codd, who invented the relational model, and Raymond Boyce |

A practical shortcut most engineers use: if every non-key column describes *the whole key and nothing but the key*, you are effectively in 3NF.

**Update anomalies without normalization**

- **Insert:** cannot store a supplier without a product if they share one table badly
- **Update:** change an address in one row, miss copies in others
- **Delete:** delete last order and accidentally lose customer data stored only there

**Intentional denormalization**

Denormalization is deliberately storing a fact more than once — keeping a cached `order_count` on the customer row instead of counting orders every time, for example. It is a trade: you buy read speed and pay with the ongoing obligation to keep every copy in sync. That obligation is real work, so it needs a real reason.

Duplicate or pre-aggregate data when:

- Read path dominates and joins are proven hot
- You accept **eventual consistency** between copies (or update both in one transaction)
- Materialized views / summary tables / cached counters are monitored

**Deeper understanding**

3NF/BCNF is the default design target. Denormalize with a measured reason and a write path that keeps copies consistent — not because “joins are slow” in the abstract.

---

### R5. ER Modeling to Tables

[↑ Content](#content)

**ER** stands for **Entity-Relationship**. ER modeling is the sketching step that happens before any `CREATE TABLE`: you list the **entities** (the things your system knows about — customers, orders, products) and the **relationships** between them (a customer *places* orders; an order *contains* products). It is deliberately technology-free, usually done on a whiteboard, and its output is a diagram of boxes and lines.

Turning that diagram into tables is mostly mechanical, and the rule depends on the relationship's **cardinality** — how many rows on one side can pair with how many on the other. Read the notation as: `1:1` is one-to-one, `1:N` is one-to-many, and `N:M` is many-to-many. The letters `N` and `M` just mean "some number, possibly different on each side."

| Cardinality | Typical mapping |
|-------------|-----------------|
| **1:1** (one-to-one) | FK on either side (often on the optional side) + `UNIQUE` on FK. Example: a user and their optional profile settings row |
| **1:N** (one-to-many) | FK on the **many** side. Example: one customer, many orders — so `orders` holds `customer_id` |
| **N:M** (many-to-many) | Junction (link) table with FKs to both sides; composite PK or surrogate + unique pair. Example: students and courses |

The N:M case is the one beginners get stuck on. A student takes many courses and a course has many students, so neither table can hold a single foreign key to the other. The solution is a third table where each row records one pairing.

```sql
-- N:M: students <-> courses
CREATE TABLE enrollments (
  student_id  bigint NOT NULL REFERENCES students (id),
  course_id   bigint NOT NULL REFERENCES courses (id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, course_id)
);
```

**Deeper understanding**

Junction tables often grow attributes (`role`, `enrolled_at`, `grade`). That is a sign the relationship is itself an entity — model it as a first-class table, not only two FKs.

---

### R6. DDL, DML, DCL, TCL

[↑ Content](#content)

SQL is usually described as four sub-languages rather than one. The split is a teaching and permissions convention, not four different syntaxes — you type all of them into the same connection. It matters in practice for two reasons: job descriptions and interview questions use these labels as shorthand, and database permissions are typically granted along exactly these lines (an application account gets DML but not DDL, so a bug cannot drop a table).

| Category | Stands for | Purpose | Examples |
|----------|-----------|---------|----------|
| **DDL** | Data **D**efinition **L**anguage | Define schema — the shape of your data | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` (schema-ish) |
| **DML** | Data **M**anipulation **L**anguage | Manipulate data — the rows themselves | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | Data **C**ontrol **L**anguage | Permissions — who may do what | `GRANT`, `REVOKE` |
| **TCL** | **T**ransaction **C**ontrol **L**anguage | Transactions — grouping statements into all-or-nothing units | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

A useful PostgreSQL detail: unlike some engines, DDL here is **transactional**. You can `BEGIN`, run `CREATE TABLE` and `ALTER TABLE`, then `ROLLBACK`, and the schema changes vanish. This is why PostgreSQL migration tools can offer genuinely atomic migrations.

**Interview nuance:** `TRUNCATE` is DDL-like in PostgreSQL (faster bulk empty, resets identity optionally, cannot easily `WHERE`) — contrast with `DELETE` (row-wise DML, can `WHERE`, fires `ON DELETE` triggers differently). Know the difference for interviews.

---

### R7. ACID Overview

[↑ Content](#content)

**ACID** is an acronym for the four promises a transactional database makes: **A**tomicity, **C**onsistency, **I**solation, and **D**urability. Together they let you write application code as though your transaction were the only thing happening on the machine, and as though the power could never fail mid-write. Neither is true, and ACID is the set of guarantees that makes pretending safe.

The classic illustration is a bank transfer: subtract 100 from one account, add 100 to another. Atomicity ensures you never do only half of it. Consistency ensures the result respects your rules (no negative balance if you declared that constraint). Isolation ensures nobody observes the money existing in neither account. Durability ensures that once you are told it succeeded, a crash one second later cannot undo it.

| Property | Meaning |
|----------|---------|
| **Atomicity** | All statements in a transaction commit, or none do |
| **Consistency** | Transaction takes DB from one valid state to another (constraints hold) |
| **Isolation** | Concurrent transactions do not see each other’s intermediate states beyond the isolation level |
| **Durability** | After commit, data survives crash (WAL — the write-ahead log — flushed per settings) |

The **write-ahead log (WAL)** is how durability is actually achieved. Before PostgreSQL modifies a data file, it appends a description of the change to a sequential log and flushes that log to disk. Sequential appends are far faster than scattered random writes, so this is both safer and quicker: after a crash, the engine replays the log to reconstruct any work that had not yet reached the data files. The same log stream is what replicas consume, which is why durability and replication are two uses of one mechanism.

**Deeper understanding**

ACID is a contract. Isolation is the dial you turn for performance vs anomalies — see [Transactions and Concurrency](#transactions-and-concurrency). Durability depends on `synchronous_commit` and hardware; “committed” usually means WAL durable, not “visible on every replica yet.”

Of the four, Consistency is the odd one out. Atomicity, Isolation, and Durability are things the engine does for you; Consistency largely depends on the constraints *you* declared. A database will happily maintain a perfectly atomic, isolated, durable record of nonsense if you never told it what valid means.

---

## Core SQL

### Q1. SELECT Execution Mental Model

[↑ Content](#content)

A `SELECT` statement is not evaluated in the order you type it. You write `SELECT` first, but the database resolves it near the end — it cannot decide which columns to output before it knows which rows survive filtering and grouping. Learning the real order removes most of the confusing error messages beginners hit, because nearly all of them come from referencing something that does not exist yet at that stage.

Logical processing order (interview classic):

```text
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET
```

Implications:

- You **cannot** reference a `SELECT` alias in `WHERE` (alias does not exist yet)
- `HAVING` filters **groups**; `WHERE` filters **rows** before grouping
- `ORDER BY` may use select-list aliases
- `LIMIT`/`OFFSET` apply last — deep `OFFSET` is expensive (see pagination in Mid Q&A)

Reading the query below in execution order: start from `customers`, attach matching `orders`, throw away rows that are not `'paid'`, collapse what remains into one row per customer, discard customers with fewer than three orders, produce the two output columns, sort them, and finally keep the top ten.

```sql
SELECT c.name, count(*) AS order_count
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.name
HAVING count(*) >= 3
ORDER BY order_count DESC
LIMIT 10;
```

**Deeper understanding**

The planner may physically execute in a different order (pushdowns, hash joins). The logical model still predicts *what* the result means; `EXPLAIN` predicts *how* it is built.

The **planner** (also called the optimizer) is the component that rewrites your request into an efficient execution strategy. It may filter before joining, join tables in a different order than you wrote them, or read an index instead of the table — all legal, because it only has to produce the same *result*, not follow the same *steps*. This freedom is the core benefit of a declarative language, and the reason SQL performance tuning is mostly about giving the planner good information rather than giving it instructions.

---

### Q2. Joins

[↑ Content](#content)

A **join** combines rows from two tables by matching them on a condition, usually a foreign key meeting the primary key it points at. Because normalization deliberately scatters related facts across tables, joins are how you put them back together for a given question. Every join starts conceptually from the same place — pair every left row with every right row — and then differs in which pairings survive and whether unmatched rows are kept anyway.

| Join | Result |
|------|--------|
| **INNER** | Rows with matches on both sides |
| **LEFT OUTER** | All left rows; right columns NULL if no match |
| **RIGHT OUTER** | All right rows; left NULL if no match |
| **FULL OUTER** | All rows from both; NULLs where no match |
| **CROSS** | Cartesian product — every left row paired with every right row, no condition. 1,000 × 1,000 rows produces a million |
| **Self join** | Table joined to itself (hierarchies, pairwise compare) |

Two further patterns have names that get asked about but no dedicated keyword. A **semi-join** asks "does a match exist?" and returns only left-side columns. An **anti-join** is its opposite: "is there no match?" Both are about existence, so you express them with `EXISTS` / `NOT EXISTS` or with a `LEFT JOIN` that tests for `NULL`.

```sql
-- Anti-join: customers with no orders
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- Semi-join: customers who have at least one paid order
SELECT c.*
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
);
```

| Pattern | Prefer |
|---------|--------|
| “Has matching rows?” | `EXISTS` (semi-join) |
| “Has no matching rows?” | `NOT EXISTS` or `LEFT JOIN … WHERE right.key IS NULL` |
| “Match optional parent” | `LEFT JOIN` |

**Deeper understanding**

`NOT IN (subquery)` is dangerous with `NULL` in the subquery list (whole predicate becomes unknown). Prefer `NOT EXISTS`.

One more trap worth internalizing early: joining to a child table **multiplies rows**. If a customer has three orders, an inner join to `orders` returns that customer three times, and any `sum()` over customer-level columns is now inflated threefold. This is the most common source of "my totals are wrong" bugs. When you only need to test existence or aggregate the child side, use `EXISTS` or aggregate in a subquery rather than joining and hoping.

**Interview line:** Inner join filters; left join preserves the driving table; anti/semi-joins are about existence, not about projecting the other table’s columns.

---

### Q3. Aggregates, GROUP BY, HAVING

[↑ Content](#content)

An **aggregate function** takes many rows and returns one value: a count, a total, an average. `GROUP BY` decides *how many* such answers you get — without it you get one row for the entire result set, and with it you get one row per distinct group key. "Total revenue" needs no `GROUP BY`; "revenue per customer" needs `GROUP BY customer_id`.

Common aggregates: `count`, `sum`, `avg`, `min`, `max`, `bool_and` / `bool_or`, `array_agg`, `string_agg`.

Rules:

- Non-aggregated select columns must appear in `GROUP BY` (or be functionally dependent on the group key — Postgres allows PK dependency)
- `count(*)` counts rows; `count(col)` ignores NULL in `col`
- `HAVING` uses aggregates; `WHERE` does not

The first rule is the one that produces the beginner error *"column must appear in the GROUP BY clause or be used in an aggregate function."* The reasoning is simple once stated: if you collapse fifty orders into one row, and each order had a different `status`, which single status should the output row show? There is no defensible answer, so the engine refuses rather than guessing. Either group by the column or aggregate it (`max(status)`, `array_agg(status)`).

The `count(*)` versus `count(col)` distinction is a favorite interview question. `count(*)` counts rows; `count(col)` counts rows where `col` is not `NULL`. On a table of 100 customers where 30 have no phone number, `count(*)` returns 100 and `count(phone)` returns 70.

**PostgreSQL:** `DISTINCT ON (expr)` returns the first row per distinct expression after `ORDER BY` — powerful and non-portable.

`DISTINCT ON` solves the common "latest row per group" problem in one step. Below, PostgreSQL sorts orders by customer and then by newest first, and keeps only the first row it encounters for each `customer_id` — giving each customer's most recent order. Note that the `ORDER BY` must begin with the same expression as the `DISTINCT ON`.

```sql
SELECT DISTINCT ON (customer_id)
  customer_id, id AS latest_order_id, created_at
FROM orders
ORDER BY customer_id, created_at DESC;
```

---

### Q4. Subqueries and CTEs

[↑ Content](#content)

A **subquery** is a query nested inside another query. It lets you build an answer in stages instead of forcing everything into a single flat statement. A **CTE**, or **Common Table Expression**, is the same idea given a name and moved to the front using the `WITH` keyword, so the query reads top to bottom like a short script rather than inside-out.

| Form | Use |
|------|-----|
| Scalar subquery | Single value in `SELECT`/`WHERE` |
| Correlated subquery | References outer row; runs per outer row logically |
| Derived table | Subquery in `FROM` |
| **CTE** (`WITH`) | Named subquery; readability; can be referenced multiple times |
| Recursive CTE | Hierarchies, graphs, number generation |

A **correlated** subquery is worth singling out, because the name sounds harder than the concept: it simply means the inner query mentions a column from the outer query, so it cannot be evaluated once up front — logically it re-runs for each outer row. The `EXISTS` example in [Joins](#q2-joins) is correlated, since it references `c.id` from the outer query.

A **recursive CTE** walks a chain of rows: hierarchies like manager-to-employee, or tree structures like categories and sub-categories. It has two halves separated by `UNION ALL`. The first half is the *anchor* — where to start. The second half references the CTE by its own name and describes how to get from the rows you have to the next layer down. PostgreSQL repeats the second half until it produces no new rows, then stops. Below, the anchor selects employee 42 and each iteration finds everyone reporting to someone already in the result, tracking how many levels down they are.

```sql
WITH RECURSIVE subordinates AS (
  SELECT id, manager_id, name, 1 AS depth
  FROM employees
  WHERE id = 42
  UNION ALL
  SELECT e.id, e.manager_id, e.name, s.depth + 1
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
```

**Deeper understanding**

In modern PostgreSQL, CTEs are often **inlined** (optimizer may merge them). Do not assume a CTE is an optimization fence unless you use `MATERIALIZED` / `NOT MATERIALIZED` hints intentionally. Prefer CTEs for clarity; prove performance with `EXPLAIN`.

---

### Q5. Set Operations

[↑ Content](#content)

Where a join combines tables **side by side** (adding columns), a **set operation** stacks two result sets **on top of each other** (adding rows). You use them when two queries produce the same shape of answer from different places: current orders plus archived orders, or the customers in one list compared against another.

| Operator | Meaning |
|----------|---------|
| `UNION` | Combine; **deduplicate** |
| `UNION ALL` | Combine; keep duplicates (cheaper) |
| `INTERSECT` | Rows in both |
| `EXCEPT` | Rows in first minus second |

Column count and types must align. Prefer `UNION ALL` when duplicates are impossible or acceptable.

The alignment requirement follows from what stacking means: the two result sets must have the same number of columns, in the same order, with compatible types, because the output has to be one coherent table. Unlike the rest of SQL, matching here is **by position, not by name**. If the first query selects `(id, name)` and the second selects `(name, id)`, you will not get an error — you will get names in your id column.

The `UNION` versus `UNION ALL` choice is a real performance decision, not a style preference. Plain `UNION` must compare every output row against every other to remove duplicates, typically by sorting or hashing the whole result. `UNION ALL` just concatenates. When you know duplicates are impossible, or you do not mind them, `UNION ALL` is strictly cheaper — and it is the more common correct answer.

---

### Q6. Window Functions

[↑ Content](#content)

Window functions compute across related rows **without collapsing** the result set (unlike `GROUP BY`).

This is the feature that separates people who have used SQL from people who have only learned it. The problem it solves: you want each order listed *and* each order's share of that customer's total. `GROUP BY` cannot do it, because grouping destroys the individual rows you wanted to keep. A window function computes the group-level answer and pastes it onto every row as an extra column.

Read `OVER (PARTITION BY customer_id ORDER BY created_at)` as an instruction for how to look around from the current row: `PARTITION BY` chooses which rows count as related (the same idea as `GROUP BY`, but nothing gets collapsed), and `ORDER BY` sequences them within that group, which matters for anything positional such as ranking or "the previous row." Omit `PARTITION BY` and the window is the entire result set.

```sql
SELECT
  customer_id,
  id AS order_id,
  amount,
  row_number() OVER (PARTITION BY customer_id ORDER BY created_at) AS rn,
  sum(amount) OVER (PARTITION BY customer_id) AS customer_total,
  lag(amount) OVER (PARTITION BY customer_id ORDER BY created_at) AS prev_amount
FROM orders;
```

| Function | Typical use |
|----------|-------------|
| `row_number()` | Unique sequence per partition; pagination / “latest N” |
| `rank()` / `dense_rank()` | Competition ranking (gaps vs no gaps) |
| `ntile(k)` | Buckets |
| `lag` / `lead` | Previous/next row |
| `sum`/`avg`/`count` as window | Running totals, moving averages |

Frame clause (when needed): `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

The **frame** narrows the window further, to a moving span of rows around the current one. The clause above reads "from the first row of the partition through the row I am on," which is exactly what makes `sum()` produce a running total rather than a repeated grand total. Change it to `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` and the same `avg()` becomes a seven-row moving average.

**Interview line:** `GROUP BY` reduces rows; window functions add columns while keeping row grain.

---

### Q7. NULL Semantics

[↑ Content](#content)

`NULL` is not zero, and not an empty string. It means **"no value recorded here"** — unknown or not applicable. That distinction drives behavior that surprises nearly everyone at first, and it is one of the most reliable interview questions at every level.

Because `NULL` represents an unknown, any comparison involving it produces an unknown answer rather than true or false. Is an unrecorded age greater than 18? Nobody can say. So SQL uses **three-valued logic**: `TRUE`, `FALSE`, `UNKNOWN`.

| Expression | Result when `x` is NULL |
|------------|-------------------------|
| `x = 1` | UNKNOWN |
| `x <> 1` | UNKNOWN |
| `x IS NULL` | TRUE |
| `x IS NOT NULL` | FALSE |
| `NOT (x = 1)` | UNKNOWN |

`WHERE` keeps only rows where the predicate is **TRUE** (UNKNOWN is filtered out).

That last sentence explains the classic bug. If `status` is `NULL` for some rows, then `WHERE status <> 'active'` will **not** return them — the comparison is UNKNOWN, not TRUE, so those rows are dropped even though they are obviously not active. You have to ask explicitly: `WHERE status IS DISTINCT FROM 'active'`.

Helpers:

- `COALESCE(a, b, …)` — first non-NULL. `COALESCE(nickname, first_name, 'Anonymous')` gives you a display name with fallbacks
- `NULLIF(a, b)` — NULL if equal. `NULLIF(divisor, 0)` is the standard trick to turn a division-by-zero error into a NULL result
- `IS DISTINCT FROM` — NULL-safe inequality; treats two NULLs as equal to each other and returns a real TRUE/FALSE instead of UNKNOWN

**Deeper understanding**

Aggregates ignore NULL inputs (except `count(*)`). This means `avg(score)` averages only the rows that have a score rather than treating missing scores as zero — usually what you want, but worth being deliberate about.

`UNIQUE` constraints in PostgreSQL treat NULL as distinct from NULL, so a unique column can hold many NULL rows. This is consistent with the "unknown" reading: two unknown values cannot be proven equal, so the constraint has nothing to object to. When you need the opposite, use a partial unique index or `UNIQUE NULLS NOT DISTINCT`, which requires **PostgreSQL 15 or later**.

---

### Q8. INSERT, UPDATE, DELETE, Upsert

[↑ Content](#content)

These are the three write statements plus one combination of them. The habit to build early is that `UPDATE` and `DELETE` **always** need a `WHERE` clause unless you genuinely mean every row, and that a good `WHERE` clause encodes the state you expect. Notice the `AND status = 'pending'` below: it does more than filter, it makes the update safe to run concurrently, because a second request cannot mark an already-paid order as paid again.

```sql
INSERT INTO orders (customer_id, status, amount)
VALUES (1, 'pending', 19.99)
RETURNING id;

UPDATE orders
SET status = 'paid', paid_at = now()
WHERE id = 10 AND status = 'pending'
RETURNING *;

DELETE FROM orders WHERE id = 10;
```

**PostgreSQL upsert:**

An **upsert** is "insert, or update if it already exists" as a single atomic statement. Doing it in two steps — check whether the row exists, then insert or update — is a race waiting to happen, because another connection can insert between your check and your write. `ON CONFLICT` hands the whole decision to the engine, which resolves it while holding the appropriate lock. `EXCLUDED` is a special table name meaning "the row you tried to insert," so `EXCLUDED.name` is the incoming value rather than the stored one.

```sql
INSERT INTO customers (email, name)
VALUES ('a@example.com', 'Ada')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name
RETURNING *;
```

`RETURNING` is a Postgres favorite in interviews — fetch generated ids without a second round-trip. It attaches to `INSERT`, `UPDATE`, and `DELETE` alike, handing back the affected rows as if you had run a `SELECT`. Without it, inserting a row and then learning its generated `id` takes two queries and two network round trips.

---

### Q9. Views and Materialized Views

[↑ Content](#content)

A **view** is a saved query that you can select from as though it were a table. It holds no data. Every time you query the view, the database runs the underlying query, so the results are always current. Think of it as a named shortcut, or a lens onto existing tables.

A **materialized view** is the opposite trade: it runs the query once and physically stores the result. Reads are then fast because there is no work left to do, but the stored data is a snapshot that grows stale until you refresh it.

| Object | Behavior |
|--------|----------|
| **View** | Stored query; runs on read; no data of its own |
| **Materialized view** | Stored result; refresh explicitly (`REFRESH MATERIALIZED VIEW`) |

Use views for stable abstractions and security (column hiding). Use materialized views for expensive aggregations with acceptable staleness.

Two practical notes. A plain view costs nothing to read beyond the query it wraps, so it is not a performance tool — it is a readability and permissions tool, letting you grant access to a view that omits salary or password columns without granting access to the table. A materialized view *is* a performance tool, and the question it always raises is "how stale may this be, and who refreshes it?" A nightly dashboard aggregate is a good fit; an account balance is not. Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` to avoid blocking readers during the refresh, which requires a unique index on the view.

---

## Transactions and Concurrency

### T1. Transaction Lifecycle

[↑ Content](#content)

A **transaction** is a bracket you put around several statements so that the database treats them as one indivisible act. Everything inside either takes effect together at `COMMIT`, or is thrown away entirely at `ROLLBACK`. Nothing halfway.

The money-transfer example below shows why that matters. Two `UPDATE` statements move 100 from one account to another. If the connection dies between them, without a transaction the money has left account 1 and never arrived at account 2 — it is simply gone. Inside a transaction, the uncommitted first update is discarded automatically and the accounts stay balanced.

```sql
BEGIN;                          -- or START TRANSACTION
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  SAVEPOINT after_debit;
  -- optional work...
  -- ROLLBACK TO SAVEPOINT after_debit;
COMMIT;                         -- or ROLLBACK
```

| Command | Effect |
|---------|--------|
| `BEGIN` | Start transaction |
| `COMMIT` | Make changes durable and visible per isolation rules |
| `ROLLBACK` | Abort all changes in the transaction |
| `SAVEPOINT` | Nested rollback point inside the same transaction |

A **savepoint** is a bookmark inside an open transaction. Rolling back to it undoes the work done since the bookmark while keeping everything before it and leaving the transaction open. It is useful when one optional step may fail and you would rather skip that step than abandon the whole unit of work.

Autocommit: each statement is its own transaction unless you open an explicit one (typical client default).

Autocommit is why beginners can use a database for months without typing `BEGIN` and never notice. Every individual statement is already wrapped in its own invisible transaction, so a single `UPDATE` touching a thousand rows is still all-or-nothing. You only need explicit transactions when **two or more** statements must succeed or fail together.

One PostgreSQL behavior catches newcomers: if any statement inside an explicit transaction raises an error, the entire transaction enters a failed state. Every subsequent statement returns *"current transaction is aborted, commands ignored until end of transaction block"* until you issue `ROLLBACK` (or roll back to a savepoint taken before the failure). There is no continuing past an error.

---

### T2. Isolation Levels and Anomalies

[↑ Content](#content)

Transactions would be simple if only one ran at a time. Real databases run thousands at once, and the **isolation level** is the dial controlling how much of that concurrency each transaction is allowed to notice. Turn it up and you get behavior closer to "my transaction is the only one running," at the cost of throughput and aborted transactions. Turn it down and you go faster but accept certain misbehaviors.

Those misbehaviors have standard names, called **anomalies**. You need them in this order, because each level is defined by which ones it rules out.

Classic anomalies:

| Anomaly | Meaning |
|---------|---------|
| **Dirty read** | Read another transaction’s uncommitted write |
| **Non-repeatable read** | Re-read a row; it changed (updated/deleted) by a committed peer |
| **Phantom read** | Re-run a range query; new matching rows appear |
| **Serialization anomaly** | Result could not have occurred in any serial order of transactions (write skew, etc.) |

Made concrete, with two sessions running side by side:

- **Dirty read.** Session A subtracts 500 from an account but has not committed. Session B reads the reduced balance and approves something based on it. Session A then rolls back. Session B acted on a number that never officially existed. PostgreSQL never permits this at any isolation level.
- **Non-repeatable read.** Session A reads a product's price as 10. Session B updates it to 12 and commits. Session A reads the same row again, still inside the same transaction, and now sees 12. One row, two answers, one transaction.
- **Phantom read.** Session A counts orders placed today and gets 50. Session B inserts a new order and commits. Session A re-runs the same count and gets 51. No row it previously read changed; a new row appeared inside the range it had queried.
- **Serialization anomaly (write skew).** The classic version: a hospital rule requires at least one doctor on call. Two doctors, Alice and Bob, both on call, each open a transaction to sign out. Each transaction checks "is anyone else on call?", each sees the other still on call, and each proceeds. Both commit. Neither transaction read stale data and neither broke a constraint, yet nobody is on call — an outcome impossible if the two had run one after the other.

SQL-standard isolation levels (what they are *defined* to prevent):

| Level | Dirty | Non-repeatable | Phantom |
|-------|-------|----------------|---------|
| Read Uncommitted | allowed* | allowed | allowed |
| Read Committed | no | allowed | allowed |
| Repeatable Read | no | no | allowed* |
| Serializable | no | no | no |

\*Engine-specific footnotes matter — especially PostgreSQL below.

---

### T3. PostgreSQL Isolation Reality

[↑ Content](#content)

PostgreSQL uses **MVCC** (multi-version concurrency control): readers do not block writers; writers do not block readers (for normal row versions). Each row version has visibility based on transaction ids / snapshots.

The mechanism, in plain terms: instead of overwriting a row, PostgreSQL writes a **new version** of it and leaves the old one in place until nobody can still need it. Every transaction gets a **snapshot** — effectively a note saying which versions were committed at the moment it started — and reads whichever version matches. So a reader never has to wait for a writer to finish, because the reader is looking at a version the writer is not touching. This one design choice explains most of PostgreSQL's concurrency behavior, and also its main maintenance chore: those old versions accumulate and must be cleaned up (see [MVCC and Vacuum](#p1-mvcc-and-vacuum)).

The four levels are named in full below. Note that interviewers and documentation often abbreviate **Repeatable Read** to **RR**.

| Level in Postgres | Practical behavior |
|-------------------|--------------------|
| **Read Committed** (default) | Each statement sees a new snapshot; non-repeatable reads and phantoms possible across statements |
| **Repeatable Read** | Transaction-wide snapshot; no non-repeatable reads / phantoms of the classic kind; can throw **serialization failure** on conflicting writes |
| **Serializable** | SSI (serializable snapshot isolation); detects more anomalies (e.g. write skew); may abort with serialization failure |
| **Read Uncommitted** | Treated like Read Committed — **no dirty reads** |

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ...
COMMIT;
```

**Deeper understanding**

- Under Repeatable Read and Serializable, expect to **retry** on `40001` serialization failures. `40001` is the SQLSTATE error code PostgreSQL returns when it aborts your transaction to protect isolation. It is not a bug and not something you can configure away — it is the engine telling you "this transaction cannot be made to look like it ran alone, run it again." Any application using these levels needs a retry loop, typically two or three attempts with a short backoff.
- “We use Serializable everywhere” has a throughput cost under contention; “Read Committed everywhere” pushes anomaly prevention into application locking or constraints.
- Unique constraints and FKs still enforce integrity regardless of isolation level.

**Interview line:** Postgres default is Read Committed + MVCC; dirty reads do not happen; raise isolation or add locks/constraints when business rules need stronger guarantees.

---

### T4. Locks and Row-Level Locking

[↑ Content](#content)

A **lock** is a claim on a row or table that makes other transactions wait. MVCC removes the need for locks between readers and writers, but two transactions that both want to *write* the same row still have to be ordered somehow, and locking is how. PostgreSQL takes most locks automatically: an `UPDATE` locks the rows it touches until the transaction ends. You take locks explicitly when you need to reserve a row *before* deciding what to write to it.

That is exactly what the query below does. A plain `SELECT` of a free seat tells you the seat was free a moment ago; by the time you `UPDATE` it, someone else may have taken it. `FOR UPDATE` locks the row as it is read, so no other transaction can claim it until you commit. `SKIP LOCKED` adds the finishing touch for queue-like workloads: rather than queueing behind a seat someone else is already processing, skip it and take the next available one. Ten workers running this query in parallel will each get a different seat.

```sql
SELECT * FROM seats
WHERE concert_id = 1 AND status = 'free'
ORDER BY id
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

| Clause | Meaning |
|--------|---------|
| `FOR UPDATE` | Exclusive row lock; blocks conflicting locks |
| `FOR SHARE` | Shared lock; blocks updaters |
| `NOWAIT` | Error immediately if lock unavailable |
| `SKIP LOCKED` | Skip locked rows; great for work queues |

Table-level locks exist (`ACCESS SHARE` … `ACCESS EXCLUSIVE`) — `ALTER TABLE`, `VACUUM FULL`, etc. take strong locks. Prefer online-friendly migrations.

Table locks range from weak to strong. `ACCESS SHARE`, taken by every ordinary `SELECT`, conflicts with almost nothing. `ACCESS EXCLUSIVE`, taken by many `ALTER TABLE` forms, conflicts with *everything* including reads. That is why a careless schema change can freeze a production application: the migration waits for current queries to finish, and every new query queues behind the migration. See [Safe Schema Migrations](#d4-safe-schema-migrations).

**Deadlocks:** two transactions wait on each other’s locks → Postgres aborts one. Prevention: consistent lock ordering; keep transactions short; use `SKIP LOCKED` for queues.

A deadlock is easiest to picture with two rows. Transaction A locks row 1 and then asks for row 2; transaction B has already locked row 2 and now asks for row 1. Neither can proceed and neither will ever give up, so PostgreSQL detects the cycle after a short delay and kills one of them with an error. The victim's application should simply retry. The reason "consistent lock ordering" prevents this is mechanical: if every transaction always locks rows in ascending id order, the cycle cannot form.

---

### T5. Optimistic vs Pessimistic Concurrency

[↑ Content](#content)

Both strategies solve the **lost update** problem: two users load the same record, both edit it, and the second save silently erases the first one's changes. They differ in when they deal with it.

**Pessimistic** concurrency assumes a collision is likely, so it takes a lock up front and makes everyone else wait. **Optimistic** concurrency assumes collisions are rare, takes no lock, and instead checks at write time whether the row changed since you read it — if it did, the write fails and you retry. The names describe the assumption, not the quality of the approach.

| Strategy | Mechanism | Best when |
|----------|-----------|-----------|
| **Pessimistic** | Lock row before edit (`FOR UPDATE`) | High contention, short critical sections (inventory seat) |
| **Optimistic** | Version/timestamp column; update only if version matches | Low contention, longer user think-time |

The optimistic version below reads naturally once you see the trick: the `WHERE` clause carries the version number that was current when the user loaded the page. If someone else saved first, they incremented `version` to 8, the `WHERE` matches nothing, and zero rows are updated. Your application checks the affected-row count, and zero means "someone beat you to it."

```sql
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 10 AND version = 7;
-- 0 rows updated ⇒ conflict; reload and retry
```

**Interview line:** Optimistic detects conflicts at commit/update time; pessimistic prevents conflicts by waiting. Wrong choice either wastes retries or creates lock contention.

---

### T6. Long Transactions and Connection Pools

[↑ Content](#content)

A **connection pool** is a fixed set of already-open database connections that your application borrows and returns, because opening a new PostgreSQL connection is expensive (each one is a separate operating-system process with its own memory). The pool is small on purpose — often 10 to 50 connections serving thousands of users — which works only because each request holds a connection for milliseconds.

That is the link to transactions: an open transaction occupies a connection for its entire life. A transaction that stays open for thirty seconds removes one connection from a pool of twenty for thirty seconds, and a handful of those will stall the whole application.

Long transactions hurt because they:

- Hold locks longer → blocking / deadlocks
- Hold MVCC snapshots → prevent vacuum from reclaiming dead tuples → **bloat**
- Tie up pooled connections → pool exhaustion under load

Anti-patterns:

- Begin transaction → call HTTP / sleep / wait for user → commit
- Idle in transaction (client open txn, no queries) — PostgreSQL reports this state as `idle in transaction` in `pg_stat_activity`, and it is the single most useful thing to look for when an application mysteriously runs out of connections
- One connection per concurrent request with unbounded pool size

The bloat consequence is the least obvious and the most damaging at scale. Because MVCC keeps old row versions until no transaction could still need them, one transaction left open for an hour prevents cleanup of *every* row changed anywhere in the database during that hour. Tables that are otherwise healthy grow, and queries against them slow down, for a reason that has nothing to do with the queries themselves.

**Rule:** Transactions should be **short, single-purpose, and local to the database work**. Do I/O and business think-time **outside** the transaction.

---

### T7. Idempotency and Exactly-Once Illusions

[↑ Content](#content)

**Idempotent** means an operation can run many times and leave the system in the same state as running it once. "Set status to paid" is idempotent; "add 100 to the balance" is not.

This matters because message queues, webhooks, and HTTP retries all deliver duplicates. A network timeout does not tell you whether the work happened — only that you did not hear back — so the sender retries, and the receiver may now process the same payment twice. Distributed systems usually have **at-least-once** delivery, meaning "we guarantee it arrives, we do not guarantee it arrives once."

Everyone wants **exactly-once**, and across a network it is essentially unachievable. The practical answer is at-least-once delivery plus an idempotent receiver, which produces exactly-once *effects*. The database helps you make handlers idempotent:

- Unique constraint on idempotency key / event id
- Upsert state transitions
- Outbox table in the **same** transaction as business writes

The pattern below is the whole idea in three lines. Recording the event id under a unique constraint makes the *first* processing attempt win and every duplicate attempt a harmless no-op. Because the claim and the side effects share one transaction, there is no window in which the event is marked processed but the work did not happen, or vice versa.

```sql
INSERT INTO processed_events (event_id, processed_at)
VALUES ('evt_123', now())
ON CONFLICT (event_id) DO NOTHING;
-- if insert happened, perform side effects / mark done in same txn
```

**Interview line:** Exactly-once end-to-end is rare; aim for at-least-once + idempotent writes enforced by uniqueness.

---

## Indexing and Query Performance

### I1. Index Types in PostgreSQL

[↑ Content](#content)

An **index** is a separate, sorted data structure that lets the engine find rows without reading the whole table. The book analogy is exact: to find every mention of "vacuum" in a 900-page manual you can read all 900 pages, or you can turn to the index at the back, find the word in its alphabetical list, and jump straight to the listed pages. The index is extra paper that must be reprinted whenever the book changes — which is precisely the trade a database index makes.

Without an index, finding one customer among ten million means reading all ten million rows (a **sequential scan**). With one, the engine descends a few levels of a tree and goes directly to the row. The cost is that the index is a second copy of that column which must be updated on every `INSERT`, `UPDATE`, and `DELETE`, and it consumes disk space.

PostgreSQL offers several index structures because different data shapes need different lookup strategies. In practice you will use B-tree for almost everything and GIN when you store `JSONB`.

| Type | Stands for | Good for | Notes |
|------|-----------|----------|-------|
| **B-tree** (default) | Balanced tree | Equality, range, `ORDER BY`, unique | Default choice; kept sorted, which is why it serves ranges and ordering as well as exact matches |
| **Hash** | (hashing function) | Equality only | Narrow use; B-tree usually enough. Cannot help with ranges or sorting |
| **GIN** | Generalized Inverted Index | Arrays, `JSONB`, full-text | Inverted index; write-heavier. "Inverted" means it maps each contained value back to the rows holding it, like a book index mapping words to pages |
| **GiST** | Generalized Search Tree | Geometry, ranges, similarity | Extensible tree; a framework other index types are built on, used for "near" and "overlaps" rather than "equals" |
| **BRIN** | Block Range Index | Very large naturally ordered tables | Tiny index; approximate. Stores only min/max per block range, so it only helps when rows are physically stored in roughly the order you query them, such as append-only time-series data |

```sql
CREATE INDEX ON orders (customer_id, created_at DESC);
CREATE INDEX ON products USING gin (attributes jsonb_path_ops);
```

Indexes speed lookups and can enforce uniqueness, but every write maintains them.

Two things happen automatically and are worth knowing so you do not duplicate them: PostgreSQL creates an index behind every `PRIMARY KEY` and every `UNIQUE` constraint, because enforcing uniqueness requires fast lookups. It does **not** create one for foreign key columns, which is a frequent oversight — joins and cascading deletes on an unindexed foreign key fall back to scanning the child table.

---

### I2. Composite Indexes and Selectivity

[↑ Content](#content)

A **composite index** covers several columns at once, and its behavior is governed by one rule that trips up nearly everyone: it can only be used **from the left**.

The phone book makes this concrete. A phone book is sorted by last name, then first name. Looking up "Smith" is fast. Looking up "Smith, John" is fast. Looking up everyone named "John", regardless of last name, is useless — the Johns are scattered across the entire book, because first name only sorts entries that already share a last name. A composite index on `(last_name, first_name)` behaves exactly the same way. This is called the **leftmost prefix rule**.

Composite B-tree `(a, b, c)` supports:

- `a = ?`
- `a = ? AND b = ?`
- `a = ? AND b = ? AND c = ?`
- A range condition (`>`, `<`, `BETWEEN`) on the column immediately after the equality-matched prefix — for example `a = ? AND b > ?`. Columns after a range condition can no longer be used for filtering, only for retrieving values

It does **not** efficiently support `b = ?` alone (no leading column).

**Selectivity** is the fraction of rows a condition matches, and it decides whether an index is worth using at all. `WHERE email = ?` on a million-row table matches one row — highly selective, and an index turns a million-row scan into a single lookup. `WHERE is_active = true` might match 900,000 rows; the engine would spend more effort bouncing between the index and the table than simply reading the table, so it correctly ignores the index. Highly selective predicates (few matching rows) benefit most from indexes. Indexing a boolean with 50/50 distribution rarely helps alone.

**Covering / index-only scan:** if all needed columns are in the index (and visibility map allows), Postgres can avoid heap fetches. Normally an index lookup is two steps — find the entry in the index, then fetch the full row from the table (the **heap**). If every column the query needs already exists in the index, the second step is skipped entirely. The `INCLUDE` clause adds columns for this purpose without making them part of the sort key: `CREATE INDEX ON orders (customer_id) INCLUDE (status)`.

**Column order rule of thumb:** equality columns first (most selective first among equals), then range/sort columns.

---

### I3. EXPLAIN and EXPLAIN ANALYZE

[↑ Content](#content)

`EXPLAIN` shows you the **execution plan**: the step-by-step strategy the planner chose for your query. It is the primary tool for answering "why is this slow?", because a query's text tells you what you asked for while the plan tells you what the database is actually going to do about it.

The difference between the two forms matters and is a common interview question. Plain `EXPLAIN` only *predicts* — it plans the query without running it, and returns estimates. `EXPLAIN ANALYZE` genuinely **executes** the query and reports what really happened alongside the estimates. Be careful: because it executes, running `EXPLAIN ANALYZE` on an `UPDATE` or `DELETE` will change your data. Wrap it in a transaction you roll back.

Read a plan **bottom-up and inside-out**: the most indented nodes run first and feed their rows to the node above them.

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = 42;
```

| Concept | Meaning |
|---------|---------|
| **Seq Scan** | Read whole table — fine for small/hot tables or unselective filters |
| **Index Scan** / **Index Only Scan** | Use index; only-scan avoids heap if possible |
| **Bitmap Index/Heap Scan** | Combine indexes; then fetch heap pages |
| **Nested Loop / Hash / Merge Join** | Join strategies: loop over one side probing the other (good for few rows), build a hash table of one side (good for large unsorted joins), or walk two sorted inputs together |
| **cost** | Planner estimate (startup .. total) in arbitrary units, not milliseconds. Only useful for comparing plans against each other |
| **actual time / rows** | Reality (`ANALYZE`) — compare to estimates. Times are cumulative per node and reported per loop |
| **Buffers** | Shared hits/reads — the input/output (I/O) story. A *hit* was served from PostgreSQL's memory cache; a *read* went to the operating system or disk |

A **sequential scan is not automatically a problem**, which surprises people who have learned to fear it. Reading a small table straight through is faster than bouncing between an index and the table, and the planner knows this. Judge a plan by its actual time and by whether the row estimates were close, not by the presence of the words "Seq Scan."

**Interview line:** When estimate rows ≪ actual rows, statistics or correlation are wrong — `ANALYZE`, better indexes, or rewrite the query.

The reason that mismatch matters so much: every decision the planner made downstream was based on the wrong number. If it expected 10 rows and got 100,000, it may have chosen a nested loop that is now running 100,000 times. Fixing the estimate often fixes the plan without changing the query at all.

---

### I4. Common Query Anti-Patterns

[↑ Content](#content)

Most of these share one root cause: something in the query prevents the index from being usable. An index is a **sorted** structure, so anything that destroys the connection between the stored value and the value you are searching for forces a full scan.

- **N+1 from the app:** one query per parent row — fix with a join/`IN`/window, or batch. Fetching 100 orders and then looping to fetch each order's customer issues 101 queries. Each is individually fast, but 101 network round trips at 1ms each costs more than one join that returns everything at once. Usually introduced accidentally by an object-relational mapper (ORM) lazily loading a related property inside a loop
- **`SELECT *`:** over-fetches; breaks covering indexes. You transfer columns nobody reads, and you give up index-only scans, since the index cannot possibly contain every column
- **Function on indexed column:** `WHERE lower(email) = …` without expression index. The index stores `'Ada@example.com'`, but you are searching for `'ada@example.com'` — the engine would have to compute `lower()` on every row to compare, so the index is unusable. Fix by indexing the expression itself: `CREATE INDEX ON users (lower(email))`
- **Leading wildcard:** `LIKE '%foo'` cannot use normal B-tree well. Same phone-book logic as the leftmost prefix rule: a sorted structure can find everything *starting with* "foo", but "ending with foo" is scattered throughout. `LIKE 'foo%'` is fine; `LIKE '%foo'` needs a trigram index
- **OR across columns:** often prevents efficient index use — consider `UNION ALL`. `WHERE a = 1 OR b = 2` cannot be satisfied by walking a single index in order, because the two conditions live in different indexes
- **Deep `OFFSET`:** `OFFSET 100000` still walks prior rows — use keyset pagination. The engine has no way to jump to row 100,001; it must produce and discard the first 100,000 rows first, so each page is slower than the last
- **Implicit casts:** type mismatch can disable index use. Comparing a `bigint` column to a text parameter forces a conversion on every row, which has the same effect as wrapping the column in a function

---

### I5. Statistics, ANALYZE, Vacuum Basics

[↑ Content](#content)

Two housekeeping jobs keep a PostgreSQL database healthy, and they are easy to confuse because one command does both.

**Statistics** are the planner's knowledge about your data: roughly how many rows a table has, how values are distributed, which values are most common. The planner uses them to estimate how many rows each step will produce, and every plan decision follows from those estimates. Stale statistics produce bad plans on perfectly good schemas. `ANALYZE` refreshes them.

**Vacuum** is the cleanup crew for MVCC. Because an `UPDATE` writes a new row version and leaves the old one behind, and a `DELETE` merely marks a row invisible, the space of superseded rows is not immediately reusable. Those leftovers are **dead tuples**, and `VACUUM` reclaims them.

| Command / process | Role |
|-------------------|------|
| **ANALYZE** | Refresh planner statistics |
| **VACUUM** | Reclaim dead tuple space for reuse; update visibility map |
| **autovacuum** | Background vacuum/analyze |
| **VACUUM FULL** | Rewrite table; takes strong lock — avoid casually |

Dead tuples come from `UPDATE`/`DELETE` under MVCC. If vacuum cannot catch up (long txns, under-configured autovacuum), tables **bloat** and indexes grow — queries slow down without “bad SQL.”

**Bloat** is the word for a table occupying far more disk than its live data justifies — a table with a million real rows physically sized like five million. Every sequential scan then reads five times more pages than necessary, and the extra pages crowd out useful data in the cache. Nothing about your queries changed; the table underneath them did.

Note the distinction between the two vacuum forms. Ordinary `VACUUM` marks dead space reusable *within* the existing file and runs alongside normal traffic, which is what autovacuum does continuously. `VACUUM FULL` rewrites the entire table into a fresh compact file and returns space to the operating system, but holds an `ACCESS EXCLUSIVE` lock for the duration — nothing can read or write the table while it runs. On a large production table that is an outage, which is why it belongs in a maintenance window and not in a routine script.

---

## Schema Design and Constraints

### D1. PostgreSQL Types Interviewers Probe

[↑ Content](#content)

Column types are not just storage decisions — they are your first and cheapest constraint. A `date` column cannot hold "next Tuesday-ish", and a `numeric` column cannot silently lose a cent. Interviewers probe types because a handful of specific choices separate people who have shipped production databases from people who have only followed tutorials.

| Type | Guidance |
|------|----------|
| `bigint` + `GENERATED … AS IDENTITY` | Default numeric PK. `bigint` rather than `int` because the 2.1 billion ceiling on `int` is reachable, and widening the column later is painful |
| `uuid` | Distributed id generation; larger/slower than `bigint`. A universally unique identifier can be created by any client without asking the database first, which is its whole appeal. Costs 16 bytes instead of 8, and random UUIDs scatter index writes across the whole B-tree |
| `text` | Preferred over `varchar(n)` unless length is a real constraint. In PostgreSQL they perform identically; `varchar(n)` only adds a length check, and changing that limit later requires a schema migration |
| `numeric` | Exact money/decimals; not IEEE 754 binary floating point. `float` cannot represent `0.1` exactly, so summing prices accumulates error. Never store money in `float` or `double precision` |
| `timestamptz` | Store instants in UTC (Coordinated Universal Time) internally; prefer over `timestamp`. Despite the name it does not store a timezone — it stores an unambiguous instant, converting to and from your session's timezone. Plain `timestamp` stores a wall-clock reading with no indication of where in the world it was read |
| `boolean` | Three-valued with NULL — decide NULL policy. A nullable boolean has three states, and "unknown" is rarely what you meant. Add `NOT NULL DEFAULT false` unless you have a reason |
| `jsonb` | Semi-structured; index with GIN when queried. Use the binary `jsonb` rather than `json`, which stores raw text and cannot be indexed usefully |
| `bytea` | Binary; often better in object storage for large blobs. Large files inflate your table, your backups, and your replication stream; store a URL instead |
| Arrays | Convenient; normalize if independently queried/constrained. An array cannot have a foreign key on its elements |

---

### D2. Constraints in Practice

[↑ Content](#content)

This is what the theory from [Integrity Constraints](#r3-integrity-constraints) looks like in a real `CREATE TABLE`. Read the products table as a list of rules the data can never violate: every product needs a SKU (stock keeping unit, a retail product code), no two products may share one, the price can never go negative, the status must be one of three known values, and `attrs` always holds a JSON object even when empty — so queries never have to handle `NULL` there.

The `order_items` table shows the two remaining ideas together: `ON DELETE CASCADE` means line items are owned by their order and disappear with it, while the plain reference to `products` means you cannot delete a product that appears in an order. The composite primary key `(order_id, product_id)` additionally guarantees a product appears at most once per order.

```sql
CREATE TABLE products (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku         text NOT NULL UNIQUE,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  status      text NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  attrs       jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE order_items (
  order_id    bigint NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id  bigint NOT NULL REFERENCES products (id),
  qty         int NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, product_id)
);
```

**Exclusion constraints** (Postgres): prevent overlapping ranges (calendar bookings) — mention if scheduling domains appear. A `UNIQUE` constraint says "no two rows may be equal here"; an exclusion constraint generalizes that to "no two rows may *overlap* here," which is exactly the rule you need to stop two bookings claiming the same room at overlapping times. Enforcing that in application code is a race condition waiting to happen.

Partial unique indexes encode conditional rules:

A **partial index** covers only the rows matching a condition. The example below solves a genuinely common problem: with soft deletes, a plain `UNIQUE` on `email` would prevent a user from ever re-registering with an address that a deleted account once used. Restricting uniqueness to rows where `deleted_at IS NULL` enforces "unique among active users" while allowing any number of deleted rows with that address. The index is also smaller and cheaper, since it indexes only part of the table.

```sql
CREATE UNIQUE INDEX ON users (email) WHERE deleted_at IS NULL;
```

---

### D3. Partitioning Overview

[↑ Content](#content)

**Partitioning** splits one logical table into several physical child tables while your queries continue to address it as a single table. A `logs` table partitioned by month is stored as twelve smaller tables; `SELECT ... WHERE created_at = '2026-03-04'` is automatically routed to the March partition alone and never touches the other eleven. That routing is called **partition pruning**, and it is where the benefit comes from.

The three strategies differ in how a row is assigned to a partition: **range** (dates or numeric spans, by far the most common), **list** (an explicit set of values, such as region codes), and **hash** (spread evenly across N partitions when you only want to divide the volume).

Declarative partitioning (range / list / hash) splits a logical table into child partitions.

**Consider when:**

- Table is huge and queries always filter on the partition key (time, tenant)
- Retention drops old partitions cheaply (`DROP` partition vs massive `DELETE`)

**Avoid when:**

- Table is moderate size
- Queries do not constrain the partition key (plans scan many partitions)
- You need it “for performance” without evidence

The retention argument is the strongest one and the easiest to underrate. Deleting a year of old logs with `DELETE` writes a dead tuple for every row, generates enormous WAL traffic, and leaves the table bloated until vacuum catches up. Dropping the equivalent partition is a near-instant metadata operation. If your data has a natural expiry, that alone can justify partitioning.

---

### D4. Safe Schema Migrations

[↑ Content](#content)

A **migration** is a scripted schema change. The difficulty is that in production the change must happen while the application is running and while the previous version of your code may still be serving traffic during a rolling deployment. So a migration must be safe in two directions: it must not lock the table long enough to stall requests, and it must leave the schema compatible with both the old and the new application code at the same time.

**Expand/contract** is the pattern that satisfies both, by never making a breaking change in a single step. Renaming a column directly breaks every running instance of the old code the instant it executes. Instead you add the new column, write to both for a while, migrate the readers, and only then remove the old one — with each step individually safe to deploy and roll back.

Expand/contract pattern for zero/low downtime:

1. **Expand:** add nullable column / new table / dual-write
2. **Migrate** data / backfill in batches
3. **Contract:** switch reads; drop old column later

Dangerous under load: rewrite table as `ACCESS EXCLUSIVE` (`ALTER` that rewrites, `VACUUM FULL`, add FK without `NOT VALID` strategy). Prefer:

- Add index with `CONCURRENTLY` — `CREATE INDEX` normally blocks all writes to the table for as long as the build takes; `CREATE INDEX CONCURRENTLY` builds it in the background at the cost of two table passes and the possibility of leaving an invalid index if it fails. It cannot run inside a transaction block
- Add FK as `NOT VALID` then `VALIDATE CONSTRAINT` — adding a foreign key normally scans the entire child table under a strong lock to prove existing rows comply. `NOT VALID` skips that check so the constraint takes effect for *new* writes immediately, and `VALIDATE CONSTRAINT` verifies the existing rows afterwards under a much weaker lock
- Avoid long transactions during DDL — a schema change waits for existing queries to finish, and every query arriving in the meantime queues behind it. One slow report can therefore turn a one-second `ALTER` into a multi-minute outage

(Migration tooling for object-relational mappers such as Entity Framework Core is covered in the EF Core sheet; here the point is **lock safety** and expand/contract.)

---

## PostgreSQL-Specific Interview Hits

### P1. MVCC and Vacuum

[↑ Content](#content)

On update, Postgres writes a **new row version** and marks the old one dead. Readers see the version matching their snapshot. Vacuum later reclaims dead versions.

The consequence worth internalizing: in PostgreSQL an `UPDATE` is physically an insert plus a delete. Updating one column of a row rewrites the entire row, and every index on that table may need a new entry pointing at the new location. This is why a table under constant updates generates far more disk activity than its row count suggests, and why "we only update a small flag column" is not the cheap operation it sounds like.

What you must say correctly in interviews:

- Readers do not take exclusive locks on rows they read (normal `SELECT`)
- Dead rows remain until no transaction can still see them
- Autovacuum is mandatory for health on write-heavy tables
- Transaction id wraparound protection is why vacuum is not optional at scale

That last point needs unpacking, because interviewers use it to separate the memorized answer from the understood one. PostgreSQL decides which row versions you can see by comparing transaction IDs, and that counter is 32 bits — roughly four billion values, after which it wraps around to the beginning. If old rows were never processed, transactions that are actually ancient would suddenly appear to be in the future, and data would vanish. Vacuum prevents this by marking sufficiently old rows as visible-to-everyone (**freezing** them). A database that stops vacuuming does not merely get slow; PostgreSQL will eventually refuse new writes to protect itself.

---

### P2. JSONB

[↑ Content](#content)

`JSONB` (JSON Binary) lets one column hold a nested document instead of a single scalar value, which is useful when different rows genuinely need different fields. PostgreSQL has two JSON types and the choice is not a toss-up: `json` keeps the original text and must re-parse it on every access, while `jsonb` stores a parsed binary form that is faster to query and, crucially, can be indexed. Use `jsonb` unless you must preserve the exact original formatting.

`jsonb` stores parsed binary JSON — operators like `->`, `->>`, `@>`, `?`.

The operators are worth memorizing because they are terse and appear constantly: `->` extracts a field **as JSON**, `->>` extracts it **as text** (the one you usually want for comparisons), `@>` tests **containment** ("does this document contain this fragment?"), and `?` tests whether a **key exists**.

| Prefer `jsonb` when | Prefer columns when |
|---------------------|---------------------|
| Schema varies per row | Field is filtered/sorted often |
| Document payloads / sparse attrs | Need tight constraints & FKs |
| Occasional keys | High-cardinality relational reporting |

Index common patterns with GIN — the Generalized Inverted Index — using `jsonb_path_ops` when you only need containment queries, since that operator class produces a smaller, faster index than the default. Do not use `jsonb` as a substitute for modeling core entities.

The trade you are making is worth stating plainly, because it is the heart of the senior-level version of this question: `jsonb` buys schema flexibility and pays with everything the schema was giving you. Inside a JSON document there are no foreign keys, no `CHECK` constraints, no `NOT NULL`, and no type enforcement. A typo in a key name is not an error, just a field that is silently never read again.

---

### P3. Sequences, Identity, and Gaps

[↑ Content](#content)

A **sequence** is a small counter object the database uses to hand out ever-increasing numbers, and it is what sits behind an auto-incrementing primary key. `GENERATED AS IDENTITY` is the modern standard syntax; `serial` is the older PostgreSQL-specific spelling of the same idea. Prefer `IDENTITY` in new schemas.

`IDENTITY` / `serial` use sequences. Sequence values are **not transactional**: a rolled-back insert still consumes a value → **gaps are normal**. Never use sequences for gapless invoice numbers without a separate strategy (and expect contention).

The non-transactional behavior is deliberate rather than an oversight. If sequence values were rolled back with their transactions, every concurrent inserter would have to wait for every other one to commit or abort before learning its own id — the counter would become a global bottleneck. By stepping outside transaction rules, a sequence can serve thousands of concurrent inserts without any of them blocking. The price is gaps, which are harmless for surrogate keys.

They are not harmless for anything a human or an auditor counts. If a regulator requires invoice numbers with no gaps, a sequence cannot provide it: you need a separate counter row updated inside the transaction, which serializes invoice creation by design. Recognizing that the gapless requirement inherently costs concurrency is the answer interviewers are listening for.

---

### P4. Connections, Prepared Statements, Observability

[↑ Content](#content)

This section is the operational vocabulary: how your application talks to PostgreSQL, and where you look when it misbehaves.

- Each connection is expensive (memory); use a **pooler** (app pool, PgBouncer). PostgreSQL forks a separate operating-system process per connection, each with its own memory, so connections are counted in the dozens rather than the thousands. A **pooler** keeps a small set of real connections and multiplexes many application clients over them; PgBouncer is the standard external one
- Prefer parameterized queries / prepared statements — security + plan reuse. A **parameterized query** sends the SQL and the values separately, so a value can never be interpreted as SQL. This is the actual fix for SQL injection, not escaping. The secondary benefit is that the engine can recognize and reuse the plan for a query it has seen before
- `pg_stat_statements` — extension for aggregated query timing (name-drop for senior diagnosis). It aggregates every executed query by shape, so you can rank by total time. Its central insight is that the query wrecking your database is often not the slow one, but the fast one running a hundred thousand times a minute
- `pg_locks`, `pg_stat_activity` — who blocks whom; idle-in-transaction. `pg_stat_activity` lists every current connection with its state, its query, and its process identifier (PID); `pg_locks` shows what each one holds and waits for. Together they answer "what is blocking this?" and expose the `idle in transaction` sessions described in [Long Transactions and Connection Pools](#t6-long-transactions-and-connection-pools)

---

### P5. Replication and HA One-Liners

[↑ Content](#content)

**HA** stands for **High Availability**: keeping the database serving traffic even when a machine fails. **Replication** is the mechanism, and in PostgreSQL it reuses the write-ahead log you already met in [ACID Overview](#r7-acid-overview) — the same stream that makes crash recovery possible is shipped to other servers, which replay it to stay in step with the original.

- **Primary** accepts writes; **standbys** replay WAL. Only one server accepts writes at a time. Standbys (also called replicas) apply the incoming log and can serve read-only queries
- Streaming replication → read replicas; watch **replication lag**. Because replay takes time, a replica is always slightly behind. That delay is **replication lag**, and it causes a specific class of bug: a user saves a change, the next request reads from a replica that has not caught up, and their change appears to have vanished. Route read-after-write traffic to the primary
- Failover promotes a standby; clients need rediscovery (Domain Name System records, or a proxy). Promotion is the easy part; the hard part is making every application instance notice that the address of the primary has changed
- Synchronous replication trades latency for stronger durability across nodes. By default a commit succeeds once the primary's own log is durable, so a total loss of the primary can lose the last few transactions. Synchronous replication makes the primary wait for a standby to confirm, which removes that window and adds a network round trip to every single commit

Enough for interviews unless the role is heavy on database administration (DBA) or site reliability engineering (SRE).

---

## Junior (0–2 Years)

These ten questions come up in almost every junior screening, often in these exact words. Each answer below opens with what the interviewer is really checking, then gives the answer itself. Keep your spoken version to two or three sentences and stop — a confident short answer invites a follow-up you can build on, while a rambling one invites doubt.

### J1. What is a relational database?

[↑ Content](#content)

*What is being checked: that you can define the thing you claim to work with, without reciting a textbook.*

A **relational database** stores data in **tables** (relations) with typed **columns**, relates rows using **keys**, and queries them with **SQL** (Structured Query Language) in a set-oriented way. Engines enforce **constraints** and usually provide **ACID** transactions. The software itself is called a relational database management system (RDBMS): PostgreSQL, MySQL, SQL Server, Oracle.

| | |
|---|---|
| **Idea** | Structured tables + declarative queries |
| **Contrast** | Document/key-value stores optimize different access patterns |
| **Why used** | Integrity, ad-hoc query power, mature tooling |

**Deeper understanding**

“Relational” refers to the relational model, not “tables that have relationships” in the ER sense — though FKs implement relationships.

**Related concepts:** [The Relational Model](#r1-the-relational-model), [ACID Overview](#r7-acid-overview)

---

### J2. What is the difference between a primary key and a foreign key?

[↑ Content](#content)

*What is being checked: whether you understand how tables connect to each other, which is the foundation of every schema question that follows.*

A **primary key (PK)** is the column that identifies a row inside its own table. A **foreign key (FK)** is a column holding the primary key value of a row in another table, which is how one row points at another. In an orders table, `id` is the primary key and `customer_id` is a foreign key into customers.

| | **Primary key** | **Foreign key** |
|---|---|---|
| Role | Uniquely identifies a row in **its** table | References a unique key in **another** (or same) table |
| Uniqueness | Unique + not null | May repeat (many children → one parent) |
| Purpose | Entity identity | Referential integrity |

**Interview line:** PK answers “which row is this?”; FK answers “which parent does this belong to?”

**Related concepts:** [Keys](#r2-keys)

---

### J3. What is the difference between INNER JOIN and LEFT JOIN?

[↑ Content](#content)

*What is being checked: whether you know that the join type decides which rows survive, not merely which columns appear.*

- **INNER JOIN:** only rows with a match on both sides
- **LEFT JOIN:** all rows from the left; if no match, right-hand columns are NULL

The practical difference: with an inner join, a customer who has never ordered disappears from the results entirely. With a left join that customer still appears, with `NULL` in every order column. So "list all customers and their order count" needs a left join — an inner join would quietly answer a different question.

```sql
-- Inner: only customers who have orders
SELECT c.id, o.id AS order_id
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;

-- Left: all customers, orders if any
SELECT c.id, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

**Related concepts:** [Joins](#q2-joins)

---

### J4. WHERE vs HAVING?

[↑ Content](#content)

*What is being checked: whether you understand the logical order of `SELECT` processing, which this question is really a proxy for.*

Both filter, but at different stages. `WHERE` runs before rows are grouped, so it can only see individual rows. `HAVING` runs after grouping, so it can see aggregate results such as `count(*)`. That is why `WHERE count(*) > 5` is an error — at the time `WHERE` runs, no group exists yet and nothing has been counted.

| | **WHERE** | **HAVING** |
|---|---|---|
| Filters | Rows **before** grouping | Groups **after** aggregation |
| Aggregates | Not allowed (normally) | Allowed (`count(*) > 5`) |

Worth adding unprompted: when a condition *can* go in `WHERE`, put it there. Filtering rows before grouping means fewer rows to group, which is faster than grouping everything and discarding groups afterwards.

**Interview line:** Filter rows with `WHERE`; filter groups with `HAVING`.

---

### J5. How does NULL work in SQL?

[↑ Content](#content)

*What is being checked: whether you have been bitten by NULL yet. Interviewers ask because everyone who has written real SQL has a story here.*

`NULL` means **unknown / missing** — not zero, and not an empty string. Comparisons with `=` yield UNKNOWN, not TRUE, because you cannot say whether an unknown value equals anything. Use `IS NULL` / `IS NOT NULL`. `WHERE` keeps only TRUE rows, so it drops UNKNOWN.

The consequence to mention: `WHERE status <> 'active'` silently excludes rows where `status` is `NULL`, even though those rows are clearly not active. Use `IS DISTINCT FROM` when you want NULL treated as a normal value.

**Gotcha:** `NOT IN (1, NULL)` never returns TRUE — prefer `NOT EXISTS`.

**Related concepts:** [NULL Semantics](#q7-null-semantics)

---

### J6. What is a transaction?

[↑ Content](#content)

*What is being checked: whether you can name a concrete case where a transaction is required. Anyone can recite "all or nothing"; the follow-up is always "give me an example."*

A **transaction** is a unit of work that commits or rolls back **as a whole** (atomicity). Concurrent transactions interact according to the **isolation** level. After commit, changes are **durable** (per engine settings).

The transfer below is the example to reach for. Both updates must happen or neither must: if the process crashes between them without a transaction, 50 has left one account and never arrived at the other.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;
```

**Related concepts:** [Transaction Lifecycle](#t1-transaction-lifecycle), [ACID Overview](#r7-acid-overview)

---

### J7. Why do we use indexes?

[↑ Content](#content)

*What is being checked: whether you mention the cost unprompted. Saying "indexes make queries fast" is the answer they expect from someone who has never maintained a database.*

An **index** is a secondary structure that helps the engine **find rows faster** (and enforce uniqueness) without scanning the whole table — the same role as the index at the back of a book, which spares you reading every page. The trade-off: **extra storage** and **slower writes**, because every `INSERT`, `UPDATE`, and `DELETE` must update each index too.

**Interview line:** Indexes speed selective reads; too many indexes tax every insert/update/delete.

**Related concepts:** [Index Types in PostgreSQL](#i1-index-types-in-postgresql)

---

### J8. DELETE vs TRUNCATE?

[↑ Content](#content)

*What is being checked: whether you know that "empty this table" has two very different implementations.*

`DELETE` removes rows one at a time, respecting `WHERE`, triggers, and MVCC. `TRUNCATE` discards the table's contents wholesale without examining individual rows, which makes it dramatically faster but far blunter.

| | **DELETE** | **TRUNCATE** |
|---|---|---|
| Filter | Can use `WHERE` | Whole table (or partition) |
| Speed | Row-wise; can be slow on large sets | Fast bulk empty |
| MVCC / WAL | Per-row versions | Often cheaper metadata operation |
| Permissions / FKs | Standard DML | Requires stronger privileges and takes an `ACCESS EXCLUSIVE` lock. It **fails** on a table referenced by a foreign key unless you add `CASCADE`, which also truncates the referencing tables |

Two more details that earn credit. `DELETE` leaves dead tuples behind, so deleting a million rows does not shrink the table on disk until vacuum runs — whereas `TRUNCATE` reclaims the space immediately. And in PostgreSQL both are transactional: you can `TRUNCATE` inside a transaction and roll it back, which is not true in every engine.

Prefer `DELETE` for selective removal; `TRUNCATE` for wiping a table quickly in maintenance/dev (know production FK caveats).

---

### J9. What is normalization?

[↑ Content](#content)

*What is being checked: whether you can explain the point of it, not recite the normal forms. If you can give the one-sentence purpose plus one concrete anomaly, you are ahead of most candidates.*

**Normalization** organizes tables to minimize redundant data and avoid update anomalies — typically aiming for **3NF** (Third Normal Form) or **BCNF** (Boyce-Codd Normal Form). Store each fact once, in one place. The anomaly to cite: if a customer's address is copied onto every order row, changing it means updating every copy, and any row you miss now contradicts the others.

You **denormalize** deliberately when measured read performance requires it and you can keep copies consistent.

**Related concepts:** [Normalization and Denormalization](#r4-normalization-and-denormalization)

---

### J10. How does GROUP BY work?

[↑ Content](#content)

*What is being checked: whether you can explain the "column must appear in the GROUP BY clause" error, which is the follow-up question roughly every time.*

`GROUP BY` collapses rows that share the same group key into one output row per group, usually with aggregates (`count`, `sum`, …). Every selected non-aggregated column must be grouped (or depend on the group key) — because when fifty rows become one, the engine has no way to choose which of fifty different values to display, so it refuses instead of guessing.

```sql
SELECT customer_id, sum(amount) AS total
FROM orders
GROUP BY customer_id;
```

**Related concepts:** [Aggregates, GROUP BY, HAVING](#q3-aggregates-group-by-having)

---

## Mid (2–5 Years)

At this level the question shifts from "do you know the term?" to "have you dealt with the consequences?" Answers should name a trade-off and, where possible, cite how you verified something rather than what you assumed. Each entry below states the trap the question is set to catch.

### M1. Explain isolation levels and the anomalies they prevent

[↑ Content](#content)

*The trap: reciting the four levels from the SQL standard without knowing what PostgreSQL actually does, which differs in two visible ways.*

Walk dirty read → non-repeatable read → phantom → serialization anomaly, then map to levels. For PostgreSQL, add: default **Read Committed**, **no dirty reads** at any level (Read Uncommitted behaves as Read Committed), Repeatable Read uses a transaction-wide snapshot, and Serializable uses SSI (serializable snapshot isolation) and may abort transactions with a `40001` serialization failure that your application must retry.

**Strong answer includes:** when you would bump isolation vs use `SELECT FOR UPDATE` vs unique constraints.

**Related concepts:** [Isolation Levels and Anomalies](#t2-isolation-levels-and-anomalies), [PostgreSQL Isolation Reality](#t3-postgresql-isolation-reality)

---

### M2. Window functions vs GROUP BY?

[↑ Content](#content)

*The trap: describing window functions as "another way to aggregate." The distinguishing feature is that they keep your rows.*

Both compute across sets of related rows. `GROUP BY` consumes the rows and returns one per group; a window function computes the same kind of answer and attaches it to every original row as an extra column. Ask "do I still need the individual rows in my output?" — if yes, you need a window function.

| | **GROUP BY** | **Window** |
|---|---|---|
| Row count | Reduces to one row per group | Keeps detail rows |
| Use | Totals, reports | Rankings, running sums, “latest per group” |

Often combine: aggregate in a subquery/CTE, or use `row_number()` then filter `rn = 1`.

The `row_number()` idiom deserves a mention because it comes up constantly: window functions are computed after `WHERE`, so you cannot filter on `rn` in the same query level. You wrap the query in a subquery or CTE and filter outside it. That is the standard portable way to get "the latest row per group," and PostgreSQL's `DISTINCT ON` is the shorter non-portable alternative.

**Related concepts:** [Window Functions](#q6-window-functions)

---

### M3. CTE vs subquery?

[↑ Content](#content)

*The trap: repeating outdated advice. "CTEs are an optimization fence in PostgreSQL" was true before version 12 and is now wrong, which is exactly why the question gets asked.*

Both name intermediate results. CTEs (Common Table Expressions) improve readability and allow reuse and recursion. Performance: do not assume CTEs are always slower or faster — since PostgreSQL 12 a CTE referenced once and free of side effects is normally **inlined** into the surrounding query, so the planner can optimize across the boundary. You can force either behavior explicitly with `MATERIALIZED` or `NOT MATERIALIZED`. Verify with `EXPLAIN ANALYZE` rather than reasoning from folklore. Use recursive CTEs for hierarchies.

**Related concepts:** [Subqueries and CTEs](#q4-subqueries-and-ctes)

---

### M4. What is a deadlock and how do you handle it?

[↑ Content](#content)

*The trap: treating a deadlock as a bug to be eliminated rather than a condition to be handled. Interviewers want both prevention and a retry strategy.*

A **deadlock** is a cycle in the lock-wait graph: transaction A holds row 1 and wants row 2 while transaction B holds row 2 and wants row 1, so neither can ever proceed. PostgreSQL detects the cycle and aborts one transaction with an error. The application should **retry** the aborted transaction, since by then the other one has finished and the retry usually succeeds. Prevention: consistent lock order (always acquire rows in ascending id order, which makes a cycle impossible), shorter transactions, avoid user interaction in transactions, consider `SKIP LOCKED` for queues.

Distinguish a deadlock from ordinary lock contention: contention means transactions are waiting and will eventually get through, while a deadlock means they never will. Both look like "the application is stuck," but only one resolves itself.

**Related concepts:** [Locks and Row-Level Locking](#t4-locks-and-row-level-locking)

---

### M5. How do you design a composite index?

[↑ Content](#content)

*The trap: answering "put the most selective column first" as a universal rule. Column order is driven by how the columns are used — equality versus range — before selectivity enters the picture.*

Match the **leftmost prefix** to query predicates and sort order: a composite index can only be used starting from its first column, the way a phone book sorted by last name then first name cannot help you find every "John." Put equality columns first (most selective first among those), then range and sort columns, because a range condition ends the index's usefulness for filtering anything after it. Consider covering columns via `INCLUDE` for index-only scans. Measure with `EXPLAIN ANALYZE`; avoid redundant indexes that duplicate leading prefixes — an index on `(a)` is unnecessary if you already have `(a, b)`, and dropping it removes write overhead for free.

**Related concepts:** [Composite Indexes and Selectivity](#i2-composite-indexes-and-selectivity)

---

### M6. How do you read EXPLAIN ANALYZE?

[↑ Content](#content)

*The trap: hunting for "Seq Scan" and declaring victory. A sequential scan on a small table is correct, and the real signal is elsewhere.*

Read the plan bottom-up and inside-out, since the most indented nodes execute first. Compare **planned rows vs actual rows** at each node: that ratio is the single most informative number in the output, because every choice the planner made downstream rests on its estimate. Note node types (sequential versus index), join algorithms, and buffer hits versus reads to separate a cache-served query from a disk-bound one. Large misestimates point to stale statistics or correlated columns the planner assumes are independent. Slow nodes with high actual time are where to focus (missing index, bad join, huge sort spilling to disk).

Remember that `EXPLAIN` estimates while `EXPLAIN ANALYZE` actually executes the statement — so on writes, run it inside a transaction you intend to roll back.

**Related concepts:** [EXPLAIN and EXPLAIN ANALYZE](#i3-explain-and-explain-analyze)

---

### M7. How does INSERT ON CONFLICT (upsert) work?

[↑ Content](#content)

*The trap: not knowing that `ON CONFLICT` requires an actual unique constraint or index to target. It cannot detect "already exists" against an unindexed column.*

Postgres upserts on a unique constraint/index inference target. `DO UPDATE` / `DO NOTHING` define conflict behavior. Use `EXCLUDED.col` to refer to the values you proposed to insert, as distinct from the values already stored. Essential for idempotent ingestion, because the insert-or-update decision happens atomically inside the engine rather than in a check-then-write sequence another connection can interleave with.

The example below accumulates rather than overwrites — `inventory.qty + EXCLUDED.qty` adds the incoming quantity to the stored one. Note that this makes the statement non-idempotent on purpose; if you need replay safety, add a `WHERE` clause or a unique event key.

```sql
INSERT INTO inventory (sku, qty)
VALUES ('ABC', 5)
ON CONFLICT (sku) DO UPDATE
SET qty = inventory.qty + EXCLUDED.qty;
```

**Related concepts:** [INSERT, UPDATE, DELETE, Upsert](#q8-insert-update-delete-upsert)

---

### M8. What is MVCC in PostgreSQL?

[↑ Content](#content)

*The trap: stopping at "readers don't block writers." That is the benefit; the interviewer wants the cost that comes with it.*

**MVCC** (multi-version concurrency control) keeps multiple row versions so readers see a consistent snapshot without blocking writers. Updates create new versions rather than overwriting; vacuum removes the dead ones once no transaction can still see them. Give both halves: it explains why `SELECT` does not block `UPDATE`, and equally why long transactions cause bloat — an old transaction holding a snapshot prevents cleanup of every row changed anywhere since it began, so tables grow and scans slow down with no change to your queries.

**Related concepts:** [MVCC and Vacuum](#p1-mvcc-and-vacuum)

---

### M9. Soft delete vs hard delete?

[↑ Content](#content)

*The trap: presenting soft delete as strictly safer. It is a trade that pushes an obligation onto every future query.*

A **soft delete** marks a row as deleted (typically `deleted_at timestamptz`) instead of removing it, so the data remains recoverable and auditable. The cost is that the row is still physically there, and every query, join, and unique constraint from that day forward must account for it.

| | **Hard delete** | **Soft delete** |
|---|---|---|
| Mechanism | `DELETE` row | Set `deleted_at` / flag |
| Pros | Simple, smaller tables | Auditable; easy undo |
| Cons | Loss of row | Every query must filter; unique indexes need care (`WHERE deleted_at IS NULL`) |

Soft delete is a product decision; enforce filters consistently (and in unique constraints via partial indexes). Mention the two failure modes and you have answered well: forgetting the filter in one query leaks deleted records into a report, and a plain `UNIQUE` constraint blocks a user from re-registering an email that a deleted account once held. Both are solved mechanically — a view or query filter for the first, a partial unique index for the second. Also note that data-retention rules such as the right to erasure may make soft delete legally insufficient on its own.

---

### M10. OFFSET pagination vs keyset pagination?

[↑ Content](#content)

*The trap: knowing that deep `OFFSET` is slow without being able to say why, or proposing keyset pagination without acknowledging that it cannot jump to page 50.*

`OFFSET 100000 LIMIT 20` does not skip ahead; the engine must generate and discard 100,000 rows before returning 20, so every page costs more than the one before it. **Keyset pagination** (also called seek pagination) instead remembers the sort values of the last row you saw and asks for rows after that point, which an index can satisfy directly. Page 5,000 costs exactly what page 1 costs.

| | **OFFSET/LIMIT** | **Keyset (seek)** |
|---|---|---|
| API | Page number | “After this (created_at, id)” |
| Cost | Degrades on deep pages | Stable with index on sort keys |
| Consistency | Rows shift under concurrent inserts | More stable for infinite scroll |

The consistency row matters as much as the speed. With `OFFSET`, a row inserted while the user reads page 1 pushes everything down, so an item they already saw reappears on page 2. Keyset pagination is anchored to a position in the data rather than a count, so it cannot skip or duplicate rows that way.

Two requirements make it work. The sort keys must be **unique as a set** — hence `(created_at, id)` rather than `created_at` alone, since a tie would make the cursor ambiguous — and an index must exist on exactly those columns in that order. The row-value comparison `(created_at, id) < ($1, $2)` compares the pair lexicographically, which is both more concise and more index-friendly than expanding it into `OR` conditions by hand.

```sql
-- Keyset: next page after (ts, id)
SELECT *
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

**Interview line:** Prefer keyset for large datasets and feeds; OFFSET is fine for small admin UIs.

---

## Senior (5+ Years)

Senior questions are design questions wearing a technical costume. The interviewer is checking whether you reason about trade-offs, operational consequences, and how you would know you were right — not whether you can recall syntax. Say what you would measure and what you would give up.

### S1. Repeatable Read vs Serializable in PostgreSQL?

[↑ Content](#content)

Both use snapshots, so the honest framing is: what does Serializable catch that Repeatable Read does not, and what does that cost?

**Repeatable Read (RR)** gives each transaction a single snapshot for its whole duration, which prevents dirty reads, non-repeatable reads, and phantom reads. What it still permits is **write skew**: two transactions that each read an overlapping set of rows, each make a decision that is valid given what it read, and each write to *different* rows. Neither conflicts with the other in any way the snapshot mechanism can see, but the combined outcome violates an invariant spanning both — the two-doctors-on-call example from [Isolation Levels and Anomalies](#t2-isolation-levels-and-anomalies).

**Serializable** uses SSI (serializable snapshot isolation), which tracks read/write dependencies between concurrent transactions and aborts one when it finds a pattern that could not have arisen from any serial ordering. It detects a broader class of anomalies at the price of false positives and bookkeeping. Under contention, Serializable increases retries; under low contention, overhead is modest.

**Choose RR** when the anomalies you care about are already prevented by constraints or explicit locks. **Choose Serializable** when the invariant spans multiple rows or tables in a way that is awkward to lock explicitly, and correctness outweighs raw throughput. Either way the application needs a retry loop for `40001`, and mentioning that unprompted signals you have actually run this in production.

**Related concepts:** [PostgreSQL Isolation Reality](#t3-postgresql-isolation-reality)

---

### S2. How would you implement inventory reservation under contention?

[↑ Content](#content)

This is the canonical concurrency design question, and it is really asking whether you can spot a read-modify-write race. The naive implementation reads the stock level, checks it in application code, and then writes the decremented value. Two checkouts running that sequence simultaneously both read 1, both conclude a unit is available, and both sell it.

Typical approaches:

1. `SELECT … FOR UPDATE` on the stock/seat row, then update if quantity allows
2. Single atomic `UPDATE … WHERE stock >= :qty RETURNING` (optimistic check)
3. Queue workers with `FOR UPDATE SKIP LOCKED` on reservation jobs
4. Constraint: `CHECK (stock >= 0)` as backstop

Option 2 is usually the best default and worth arguing for: the condition and the write are one statement, so the engine evaluates `stock >= :qty` while holding the row lock it needs anyway, and zero returned rows means "sold out" with no race window at all. Option 1 is clearer when several rows or extra logic are involved. Option 3 applies when reservations are queued jobs rather than synchronous requests. Option 4 is not an alternative but a safety net — a `CHECK` constraint converts a logic bug into a failed transaction rather than negative inventory.

Avoid chatty read-modify-write without locks/conditions — two concurrent checkouts oversell.

Two points that separate a senior answer: name the reservation's expiry (held stock that is never released is its own outage), and note that under heavy contention on one popular item, every approach degrades to serialized access on that row — which leads directly to the hot-row question below.

**Related concepts:** [Locks and Row-Level Locking](#t4-locks-and-row-level-locking), [Optimistic vs Pessimistic Concurrency](#t5-optimistic-vs-pessimistic-concurrency)

---

### S3. How do you design for hot rows?

[↑ Content](#content)

A **hot row** is a single row that a large share of your traffic wants to write: a global counter, a popular product's stock, a platform-wide balance. Hot rows (single counter, single wallet) serialize updates and limit throughput.

The key insight to state early is that this is not an indexing problem, and no index will help. Writers to the same row must be ordered by definition, so that row's maximum update rate is roughly one divided by the lock hold time — a hard ceiling that adding hardware does not raise. Every fix therefore works by making the writes stop landing on one row.

Mitigations:

- Shard counters / account partitions — replace one counter with N counter rows, write to a random one, and sum them on read. Turns one contended row into N uncontended ones, trading read cost for write throughput
- Append-only ledger + periodic aggregation — insert a row per event instead of updating a total, since inserts do not contend with each other. The current balance becomes a sum, materialized periodically if reads need it
- Reduce transaction scope; avoid holding locks while calling out — shortening the lock hold time raises the ceiling directly, and an external call inside the lock can raise it by orders of magnitude in the wrong direction
- Sometimes move extreme hotspots out of the relational database management system (RDBMS) — a rate limiter or a view counter may belong in Redis, where approximate counting is acceptable

**Interview line:** Fix the contention shape, not only “add an index.”

---

### S4. Index/write trade-offs at scale?

[↑ Content](#content)

The junior answer is "indexes cost storage." The senior answer is that indexes are a **write tax** you pay on every row modification forever, in exchange for read speed on specific query shapes — and that the tax is easy to accumulate accidentally, because nobody notices an index that is never used.

Each secondary index is another structure to maintain per write, increases WAL (write-ahead log) volume, and can slow bulk loads. Under MVCC the effect compounds: an update writes a new row version, and unless the change qualifies for a heap-only-tuple optimization, every index on that table needs a new entry pointing at the new location. Strategy:

- Index for **proven** query shapes, from `pg_stat_statements` rather than from imagination
- Drop unused indexes (track via `pg_stat_user_indexes`, where a near-zero `idx_scan` after a full business cycle means the index is pure cost). Check replicas too before dropping
- Prefer composite indexes over many overlapping singles — one index on `(a, b)` serves queries on `a` as well, so a separate index on `(a)` is redundant write overhead
- Build with `CONCURRENTLY` in production, and be aware it can leave an invalid index behind if interrupted
- For bulk loads, dropping indexes and rebuilding afterwards is often faster than maintaining them row by row

---

### S5. When do you partition — and when not?

[↑ Content](#content)

Partitioning is an operational tool that happens to have performance side effects, and treating it as a performance tool is the mistake this question is designed to surface.

Partition when retention and query patterns align on a key (time-series, tenant). The strongest single justification is retention: dropping a partition is instant metadata work, while the equivalent `DELETE` writes millions of dead tuples, floods the WAL, and leaves bloat behind. Secondary benefits are smaller per-partition indexes and the ability to vacuum partitions independently.

Do not partition a medium table hoping for magic speedup — a correctly indexed table of tens of millions of rows is usually fine, and partitioning adds nothing an index was not already doing. A wrong partition key is actively harmful: if queries do not filter on it, **partition pruning** fails and every query touches every partition, which is slower than the unpartitioned table was. Operational complexity is part of the cost too: unique constraints must include the partition key, and someone has to create next month's partition before next month arrives.

**Related concepts:** [Partitioning Overview](#d3-partitioning-overview)

---

### S6. When should you not use JSONB?

[↑ Content](#content)

The framing that answers this well: `JSONB` buys you freedom from schema migrations and pays for it with everything the schema was enforcing on your behalf. Inside a document there are no foreign keys, no `CHECK` constraints, no `NOT NULL`, and no type checking, so a misspelled key is not an error — it is a field that is silently never read again. You have not removed the schema, only moved it into application code where nothing validates it.

Avoid `jsonb` for core relational facts you join, constrain, and report on heavily. Prefer columns + FKs. Two further costs worth naming: the planner has poor statistics for values inside a document, so row estimates for `JSONB` predicates are often wrong and produce bad plans; and updating one key rewrites the entire document, since MVCC has no notion of a partial row update.

Use `jsonb` for flexible attributes that genuinely vary per row, opaque third-party payloads you store but do not interpret, and evolving optional metadata — with GIN only where containment or path queries justify the write cost. A good compromise for a field that becomes important later is to promote it to a real column, or add a generated column plus a B-tree index over the extracted value.

**Related concepts:** [JSONB](#p2-jsonb)

---

### S7. Connection pooling and transaction boundaries?

[↑ Content](#content)

The counterintuitive claim to lead with: a **smaller pool is often faster**. Beyond the point where the database can actually execute queries in parallel — bounded by CPU cores and disk throughput — extra connections do not add capacity, they add context switching, lock contention, and memory pressure. A pool of 200 against an 8-core server produces worse latency than a pool of 20, plus queueing hidden inside the database where your metrics cannot see it.

Pool size ≈ active queries the DB can run, not concurrent HTTP users. Ten thousand concurrent users do not need ten thousand connections; they need a queue in front of a small pool, where waiting is visible and boundable.

Transaction boundaries must end before returning a connection to the pool (no idle-in-transaction), otherwise a connection is occupied by a transaction doing nothing — the fastest way to exhaust a pool. The classic cause is an external HTTP call inside a transaction.

With PgBouncer transaction pooling, session features need care: because a physical connection is reassigned between transactions, anything that lives at session scope (temporary tables, session-level `SET`, server-side prepared statements, advisory locks) can leak across clients or vanish unexpectedly. Session pooling avoids this but gives up most of the multiplexing benefit.

**Related concepts:** [Long Transactions and Connection Pools](#t6-long-transactions-and-connection-pools)

---

### S8. How do you diagnose a slow query in production?

[↑ Content](#content)

This question rewards a method, not a trick. State the ordering principle first: "slow" has several distinct causes that present identically as a timeout, so the first job is classification, not optimization. Then walk the steps.

1. Capture SQL + params; run `EXPLAIN (ANALYZE, BUFFERS)` on a replica if possible  
2. Check `pg_stat_statements` for total time vs calls  
3. Look for lock waits (`pg_stat_activity`, blocking PIDs)  
4. Check bloat / autovacuum lag / age  
5. Validate indexes and stats (`ANALYZE`)  
6. Fix: rewrite, index, batch, cache, or change isolation/locking  

Add one detail that shows production experience: the query users complain about is often not the one damaging the database. `pg_stat_statements` ranks by **total** time, which surfaces the 5ms query executed 200,000 times a minute — invisible in any single trace, and frequently the actual cause.

**Interview line:** Separate “bad plan,” “bad I/O” (input/output — the query is reading far more data than it should, or reading it from disk instead of cache), “lock wait,” and “application N+1” — they look the same in a timeout.

**Related concepts:** [EXPLAIN and EXPLAIN ANALYZE](#i3-explain-and-explain-analyze), [Connections, Prepared Statements, Observability](#p4-connections-prepared-statements-observability)

---

### S9. How do you keep migrations safe online?

[↑ Content](#content)

Two independent constraints have to be satisfied at once, and naming both is the answer. First, **lock safety**: the change must not hold a strong lock long enough to stall traffic. Second, **code compatibility**: during a rolling deploy the old and new application versions run simultaneously, so the schema must work for both — which means no single step may be a breaking change.

Use expand/contract; add indexes `CONCURRENTLY`; validate FKs in phases (`NOT VALID`, then `VALIDATE CONSTRAINT`); batch backfills so each transaction is short and vacuum can keep up; avoid rewriting large tables in one transaction; schedule exclusive locks into maintenance windows only when unavoidable.

Always know the lock mode an `ALTER` takes, and note that modern PostgreSQL has made several formerly-rewriting operations cheap — adding a column with a non-volatile default no longer rewrites the table, for instance. Two operational safeguards are worth volunteering: set `lock_timeout` so a migration that cannot get its lock fails fast instead of building a queue of blocked queries behind it, and make every migration reversible or additive so a bad deploy can roll back without a data-recovery exercise.

**Related concepts:** [Safe Schema Migrations](#d4-safe-schema-migrations)

---

### S10. How do you ensure idempotent consumers with a database?

[↑ Content](#content)

Start from why the problem exists: message delivery is **at-least-once**, because a sender that times out cannot tell whether the work happened and must retry. Exactly-once delivery is not available, so you build exactly-once *effects* by making the consumer idempotent — able to process the same message repeatedly with the same result.

Persist a unique **idempotency key** / event id in the same transaction as side effects (or as a claim row with `ON CONFLICT DO NOTHING`). The atomicity is the whole point: if the claim and the effects committed separately, a crash between them leaves the event marked processed with the work undone, or the work done with the event free to be reprocessed. Design state transitions to be safe if replayed, which usually means writing absolute values ("set status to paid") rather than relative ones ("add 100").

**Outbox pattern:** write business row + outbox message atomically; publisher drains outbox. This solves the sibling problem — you cannot atomically update a database and publish to a message broker, since they are separate systems. Writing the message to a table in the same transaction makes it durable exactly when the business change is, and a separate publisher then delivers it (at least once, which is why the consumer needs the idempotency key above).

The remaining detail worth mentioning is expiry: a table of idempotency keys grows forever unless you prune it, and the retention window must exceed the longest plausible retry delay.

**Related concepts:** [Idempotency and Exactly-Once Illusions](#t7-idempotency-and-exactly-once-illusions)

---

## Quick Interview Checklist

[↑ Content](#content)

**Relational fundamentals**

- [ ] Tables, keys, FK actions, normalization vs intentional denormalization
- [ ] DDL / DML / TCL vocabulary
- [ ] ACID in plain language

**SQL**

- [ ] Logical `SELECT` order; `WHERE` vs `HAVING`
- [ ] Inner / left / anti / semi joins; `EXISTS` vs `IN`/`NOT IN`
- [ ] Aggregates, CTEs (incl. recursive), set ops
- [ ] Window functions vs `GROUP BY`
- [ ] `NULL` three-valued logic
- [ ] Postgres upsert + `RETURNING`

**Transactions**

- [ ] Anomalies and isolation levels
- [ ] Postgres defaults + MVCC (no dirty reads)
- [ ] `FOR UPDATE` / `SKIP LOCKED`, deadlocks, retries
- [ ] Optimistic vs pessimistic concurrency
- [ ] Short transactions; pool-friendly boundaries
- [ ] Idempotency via unique keys

**Performance**

- [ ] B-tree vs GIN (and when)
- [ ] Composite index leftmost prefix
- [ ] Read `EXPLAIN ANALYZE` (estimate vs actual)
- [ ] Keyset vs offset pagination
- [ ] Vacuum / bloat awareness

**PostgreSQL**

- [ ] `timestamptz`, identity gaps, `jsonb` trade-offs
- [ ] Partial unique indexes for soft delete
- [ ] Basic replication/lag vocabulary

**Vocabulary**

- [ ] Can expand every acronym you use out loud — DDL/DML, MVCC, WAL, ACID, SSI, GIN, HA
- [ ] Know which terms are PostgreSQL-specific (`JSONB`, `DISTINCT ON`, `SKIP LOCKED`) versus portable ANSI SQL

---

## Glossary

[↑ Content](#content)

This table defines **concepts**. For the expansion of an initialism (what the letters stand for), see [Abbreviations and Acronyms](#abbreviations-and-acronyms).

| Term | Short definition |
|------|------------------|
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **Aggregate function** | Function collapsing many rows into one value (`count`, `sum`, `avg`) |
| **Anomaly** | Concurrent behavior that violates intuition/serial expectations |
| **Anti-join** | Query returning left rows that have **no** match on the right (`NOT EXISTS`) |
| **Autovacuum** | Background process that vacuums and analyzes |
| **Bloat** | Table or index occupying far more space than its live rows justify |
| **B-tree index** | Default Postgres index for equality/range/order |
| **Cardinality** | Number of rows in a relation, or number of distinct values in a column — context decides which |
| **Composite index** | Index over several columns, usable only from its leftmost column onward |
| **Constraint** | Schema-declared rule the engine refuses to violate |
| **Correlated subquery** | Subquery referencing a column from the enclosing query |
| **Covering index** | Index containing every column a query needs, enabling an index-only scan |
| **CTE** | Common table expression (`WITH` query) |
| **Dead tuple** | Row version no longer visible; awaiting vacuum |
| **Deadlock** | Circular lock wait; one txn aborted |
| **Denormalization** | Deliberately storing a fact more than once to speed reads |
| **Execution plan** | The strategy the planner chose, shown by `EXPLAIN` |
| **FK** | Foreign key — referential integrity pointer |
| **Foreign key action** | What happens to children when a parent is deleted or updated (`CASCADE`, `RESTRICT`, `SET NULL`) |
| **Frame** | The span of rows a window function looks at relative to the current row |
| **Freezing** | Marking old rows as visible to all, protecting against transaction id wraparound |
| **Functional dependency** | Knowing column A always determines the value of column B |
| **GIN** | Generalized inverted index (JSONB, arrays, FTS) |
| **Heap** | The main table storage where full rows live, as distinct from an index |
| **Hot row** | Frequently updated single row that serializes writers |
| **Idempotency key** | Unique token ensuring a side effect runs once logically |
| **Idempotent** | Safe to run repeatedly with the same end state |
| **Idle in transaction** | Connection holding an open transaction while issuing no queries; a common cause of pool exhaustion and bloat |
| **Index-only scan** | Answering a query entirely from an index without touching the heap |
| **Isolation level** | Rules for what concurrent transactions may observe |
| **Keyset pagination** | Seek next page by last seen sort keys |
| **Leftmost prefix** | The rule that a composite index is usable only starting from its first column |
| **Lock** | A claim on a row or table that makes conflicting transactions wait |
| **Lost update** | Two writers load the same row and the second save erases the first |
| **Materialized view** | Stored query *result*, refreshed explicitly; contrast with a plain view |
| **MVCC** | Multi-version concurrency control |
| **Normalization** | Structuring tables so each fact is stored exactly once |
| **Optimistic concurrency** | Detect conflicts at write time via a version check, then retry |
| **Outbox pattern** | Writing an outgoing message to a table in the same transaction as the business change |
| **Partial index** | Index covering only rows matching a `WHERE` condition |
| **Partition pruning** | Planner skipping partitions that cannot contain matching rows |
| **Pessimistic concurrency** | Lock the row before editing so conflicts cannot occur |
| **Phantom read** | New rows appear in a re-evaluated range |
| **Planner / optimizer** | Chooses join order and access methods |
| **Pooler** | Component multiplexing many clients over few real connections (PgBouncer) |
| **Primary key** | Chosen unique row identifier |
| **Replication lag** | How far behind a replica is in applying the primary's WAL |
| **Savepoint** | Named rollback point inside an open transaction |
| **Selectivity** | Fraction of rows matching a predicate |
| **Semi-join** | Query returning left rows that **have** a match on the right (`EXISTS`) |
| **Sequence** | Counter object that hands out increasing numbers; gaps are normal |
| **Serialization failure** | Postgres aborts txn to preserve Repeatable Read / Serializable guarantees; SQLSTATE `40001` |
| **Snapshot** | A transaction's view of which row versions were committed when it began |
| **Soft delete** | Marking a row deleted (`deleted_at`) instead of removing it |
| **SSI** | Serializable snapshot isolation (Postgres Serializable) |
| **Seq scan** | Full table read |
| **Statistics** | Planner's sampled knowledge of table size and value distribution, refreshed by `ANALYZE` |
| **Surrogate key** | Synthetic identifier unrelated to business meaning |
| **Three-valued logic** | SQL predicates evaluate to TRUE, FALSE, or UNKNOWN |
| **Upsert** | Insert, or update if the row already exists (`ON CONFLICT`) |
| **VACUUM** | Reclaim dead tuple space; maintain visibility map |
| **View** | Stored query that runs on every read and holds no data of its own |
| **WAL** | Write-ahead log — durability and replication stream |
| **Window function** | Calculation over a related row frame without collapsing rows |
| **Wraparound** | Transaction id counter exhaustion that vacuum exists to prevent |
| **Write skew** | Anomaly where concurrent reads/writes break a multi-row invariant |

---

*Lector-style study sheet for SQL / PostgreSQL interviews. Study path: relational fundamentals → core SQL → transactions/MVCC → indexes/`EXPLAIN` → junior Q&A → mid scenarios → senior design. Practice by writing queries on a sample schema, forcing bad plans, and deliberately reproducing isolation anomalies and deadlocks in two sessions.*
