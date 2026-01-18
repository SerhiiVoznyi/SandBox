# Project-Aligned Implementation Contract

Below is a clean, AI-friendly, language-agnostic prompt set.
They are structured, explicit, low-ambiguity, and designed to lock Cursor into the project’s existing DNA.

I’m using a template style so they work for any language, framework, or paradigm.

## PHASE 1 — PROJECT ANALYSIS

### 1. Project Understanding

```txt
Analyze the entire codebase and output:
- The purpose of the system
- Core domain concepts
- Overall architectural approach
- Implicit assumptions enforced by the code

Rules:
- Base conclusions only on existing code
- Do not speculate
- Keep explanations concise
```

### 2. Code Style Inference

```txt
Infer coding conventions from the existing project:

- Naming conventions
- File and folder naming
- Formatting and structure
- Function / method size
- State and mutability rules
- Async / concurrency patterns (if applicable)
- Error handling style

Rules:

- Existing code is the source of truth
- Do NOT introduce external standards or best practices
```

### 3. Architecture & Dependencies

```txt
Identify architectural layers, modules, or boundaries:

- List layers/modules
- Dependency direction rules
- Explicit constraints (what must not depend on what)

Rules:

- Describe current reality, not ideal architecture
- Do not propose refactors
- Flag violations only if clearly present
```

### 4. Component / Class Design Rules

```txt
Analyze how units of code are designed:

- Typical responsibility size
- Composition vs inheritance preferences
- Public vs private API expectations
- State ownership and lifecycle rules

Rules:

- Use examples from the project
- Generalize only consistent patterns
```

### 5. File & Folder Placement

```txt
Analyze project structure:

- Folder organization logic
- File naming conventions
- Placement rules for new code

Task:

- Determine exactly where code for <placeholder> belongs

Rules:

- Follow existing structure strictly
- Do not introduce new folders unless unavoidable
```

### 6. Existing Patterns

```txt
Detect patterns already in use:

- Patterns actively used
- Contexts where they are applied
- Patterns intentionally avoided

Rules:

- Reuse existing patterns only
- Do NOT introduce new patterns
```

### 7. Error Handling & Observability

```txt
Analyze how failures are handled:

- Error propagation strategy
- Logging / monitoring approach
- Recovery or fallback behavior

Task:

- Define how errors for <placeholder> must be handled

Rules:

- Match existing behavior exactly
- Avoid new abstractions
```

### 8. Testing Strategy

```txt
Infer the testing philosophy:

- Test types used
- Naming and structure
- Mocking vs real dependencies

Task:

- Define how <placeholder> should be tested

Rules:

- Align with existing strategy
- Do not increase test complexity
```

### 9. Constraints & Anti-Patterns

```txt
Identify what should NOT be done:

- Anti-patterns
- Discouraged abstractions
- Libraries or approaches avoided in the project

Rules:

- Base only on observed evidence
- Be explicit and concise
```

## PHASE 2 — IMPLEMENTATION CONTRACT

```txt
Summarize the agreed rules for implementing <placeholder>:

- Code style rules
- Architectural constraints
- File and folder placement
- Patterns to apply
- Patterns to avoid
- Error handling approach
- Testing approach
```

## PHASE 3 — CONFIRMATION

```txt
Ask for explicit confirmation before writing any code.

Do NOT generate implementation until confirmation is received.
```
