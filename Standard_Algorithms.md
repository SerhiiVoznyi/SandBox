# Standard Algorithms — Study Guide

A consolidated reference from our conversation: developer role requirements explained, plus a full study plan for **Standard Algorithms**.

All code examples use **C# / .NET 10**.

---

## Table of Contents

1. [Developer Role Requirements Explained](#developer-role-requirements-explained)
2. [How to Use This Guide](#how-to-use-this-guide)
3. [Part 1: Searching Algorithms](#part-1-searching-algorithms)
4. [Part 2: Sorting Algorithms](#part-2-sorting-algorithms)
5. [Part 3: Two Pointers & Sliding Window](#part-3-two-pointers--sliding-window)
6. [Part 4: Hash-Based Algorithms](#part-4-hash-based-algorithms)
7. [Part 5: Stack & Queue Algorithms](#part-5-stack--queue-algorithms)
8. [Part 6: Tree Algorithms](#part-6-tree-algorithms)
9. [Part 7: Graph Algorithms](#part-7-graph-algorithms)
10. [Part 8: Heap / Priority Queue](#part-8-heap--priority-queue)
11. [Part 9: String Algorithms](#part-9-string-algorithms)
12. [Part 10: Classic Misc Algorithms](#part-10-classic-misc-algorithms)
13. [Pattern Recognition Cheat Sheet](#pattern-recognition-cheat-sheet)
14. [8-Week Study Plan](#8-week-study-plan)
15. [Practice Platforms](#practice-platforms)
16. [Starter Problem List](#starter-problem-list)
17. [Self-Check Checklist](#self-check-checklist)

---

## Developer Role Requirements Explained

These are common **computer science fundamentals** employers list when they want developers who can reason about code performance and solve structured problems — not just write features.

### Algorithmic Complexity Estimation

The ability to **predict how a piece of code will scale** as input size grows.

**Example:** If you loop through a list once, doubling the list size roughly doubles runtime. If you have nested loops over the same list, doubling the list can make runtime ~4× worse.

**Why employers care:** It helps you choose between approaches, spot bottlenecks early, and avoid solutions that work on small test data but fail in production.

---

### Big O Notation

A **standard shorthand** for describing that scaling behavior, focusing on the **worst-case growth rate** and ignoring constant factors.

| Notation | Meaning | Example |
|----------|---------|---------|
| **O(1)** | Constant time | Hash map lookup (average case) |
| **O(log n)** | Logarithmic | Binary search |
| **O(n)** | Linear | Single pass through an array |
| **O(n log n)** | Common for efficient sorting | Merge sort, quicksort (average) |
| **O(n²)** | Quadratic | Nested loops comparing all pairs |
| **O(2ⁿ)** | Exponential | Brute-force subsets/combinations |

When someone says "this is O(n²)," they mean runtime grows roughly with the square of input size.

**Why employers care:** It is the shared language for discussing performance in interviews and design reviews.

---

### Standard Algorithms

Knowledge of **well-known, proven techniques** that show up repeatedly in real software and interviews.

Typical categories:

- **Searching:** linear search, binary search
- **Sorting:** merge sort, quicksort, counting sort (when applicable)
- **Graph:** BFS, DFS, shortest path (Dijkstra), topological sort
- **String:** pattern matching basics
- **Data-structure operations:** stack/queue usage, heap operations, tree traversals

**Why employers care:** You do not need to reinvent solutions. Recognizing "this is a graph problem" or "binary search fits here" saves time and leads to better designs.

> The rest of this document is a detailed study guide for Standard Algorithms.

---

### Problem-Solving Paradigms

**Reusable strategies** for approaching unfamiliar problems — a mental toolkit, not a single algorithm.

| Paradigm | Idea | Example use |
|----------|------|-------------|
| **Brute force** | Try all possibilities | Small inputs, baseline solution |
| **Greedy** | Make the locally best choice each step | Interval scheduling, Huffman coding |
| **Divide and conquer** | Split problem, solve pieces, combine | Merge sort, fast exponentiation |
| **Dynamic programming** | Break into overlapping subproblems + cache results | Knapsack, longest common subsequence |
| **Backtracking** | Explore choices, undo when stuck | Sudoku, permutations/combinations |
| **Two pointers / sliding window** | Efficient scanning patterns | Subarray problems, string windows |
| **Recursion** | Solve via smaller instances of same problem | Tree traversal, divide-and-conquer |

**Why employers care:** Strong developers do not memorize every problem — they **recognize patterns** and pick the right approach.

---

### How the Concepts Fit Together

```
Problem arrives
    → Pick a Problem-Solving Paradigm (e.g. dynamic programming)
    → Apply Standard Algorithms (e.g. BFS, binary search)
    → Estimate Algorithmic Complexity
    → Express it with Big O Notation (e.g. O(n log n))
```

### What "Meets the Requirement" Usually Looks Like

For a **new developer** role, they often expect:

- You can explain why one approach is faster than another
- You recognize common patterns (sorting, searching, hashing, basic graphs)
- You can solve medium coding problems with a clear approach, not just trial and error
- You understand tradeoffs: time vs memory, simplicity vs performance

They usually **do not** expect expert-level competitive programming for entry-level roles — but they do want solid fundamentals and the ability to learn.

---

## How to Use This Guide

**For each algorithm, learn four things:**

1. **What it does** (one sentence)
2. **Time/space complexity** (Big O)
3. **When to use it** (pattern recognition)
4. **How to implement it** (simple version in C#)

**Suggested pace:** 2–3 algorithms per week + 5–10 practice problems per week.

---

## Part 1: Searching Algorithms

### 1.1 Linear Search

| | |
|---|---|
| **Idea** | Check every element until you find the target or reach the end |
| **Time** | O(n) |
| **Space** | O(1) |
| **Use when** | List is unsorted, small data, or you only search once |

```csharp
static int LinearSearch(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target)
            return i;
    }
    return -1;
}
```

**Practice:** Find first/last occurrence, count occurrences, search in 2D matrix (row-wise).

---

### 1.2 Binary Search

| | |
|---|---|
| **Idea** | Repeatedly halve a **sorted** range by comparing with the middle |
| **Time** | O(log n) |
| **Space** | O(1) iterative, O(log n) recursive |
| **Use when** | Data is sorted, or you can define a monotonic "yes/no" predicate |

```csharp
static int BinarySearch(int[] arr, int target)
{
    int lo = 0, hi = arr.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // avoids integer overflow
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    return -1;
}
```

**Variants to learn:**

- Find first index where `arr[i] >= target` (lower bound)
- Find last index where `arr[i] <= target` (upper bound)
- Search on answer space: "smallest x such that condition(x) is true"

**Practice:** Search in rotated sorted array, find peak element, sqrt via binary search, "Koko eating bananas" style problems.

---

## Part 2: Sorting Algorithms

Know **what each does**, **complexity**, and **stability** (stable = equal elements keep original order).

| Algorithm | Best | Average | Worst | Space | Stable? | Notes |
|-----------|------|---------|-------|-------|---------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Teaching only |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No | Few swaps |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Good for small/nearly sorted |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | Divide & conquer, linked lists |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No | Fast in practice, in-place |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Priority queue connection |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes | Small integer range |
| Radix Sort | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k) | Yes | Fixed-width digits |

### 2.1 Merge Sort (must know)

```csharp
static int[] MergeSort(int[] arr)
{
    if (arr.Length <= 1)
        return arr;

    int mid = arr.Length / 2;
    int[] left = MergeSort(arr[..mid]);
    int[] right = MergeSort(arr[mid..]);
    return Merge(left, right);
}

static int[] Merge(int[] left, int[] right)
{
    var result = new List<int>(left.Length + right.Length);
    int i = 0, j = 0;

    while (i < left.Length && j < right.Length)
    {
        if (left[i] <= right[j])
            result.Add(left[i++]);
        else
            result.Add(right[j++]);
    }

    while (i < left.Length) result.Add(left[i++]);
    while (j < right.Length) result.Add(right[j++]);
    return [.. result];
}
```

**Use when:** Guaranteed O(n log n), external sorting, inversion count problems.

---

### 2.2 Quick Sort (must know)

```csharp
static void QuickSort(int[] arr, int lo, int hi)
{
    if (lo >= hi) return;

    int p = Partition(arr, lo, hi);
    QuickSort(arr, lo, p - 1);
    QuickSort(arr, p + 1, hi);
}

static int Partition(int[] arr, int lo, int hi)
{
    int pivot = arr[hi];
    int i = lo;

    for (int j = lo; j < hi; j++)
    {
        if (arr[j] <= pivot)
        {
            (arr[i], arr[j]) = (arr[j], arr[i]);
            i++;
        }
    }

    (arr[i], arr[hi]) = (arr[hi], arr[i]);
    return i;
}
```

**Use when:** In-memory general sorting; know pivot choice affects worst case.

---

### 2.3 Built-in Sort in Interviews

In real coding interviews, use built-in sorting (`Array.Sort()`, `List<T>.Sort()`, or LINQ `OrderBy()`) unless asked to implement. Still know **why** it is roughly O(n log n) and when stability matters.

**Practice:** Sort colors (Dutch flag), merge intervals, largest number from array, k-th largest element.

---

## Part 3: Two Pointers & Sliding Window

These are very common in interviews and production code.

### 3.1 Two Pointers

| Pattern | Example |
|---------|---------|
| Opposite ends | Two sum in sorted array |
| Same direction | Remove duplicates in-place |
| Fast/slow | Cycle detection in linked list |

```csharp
// Two Sum II - sorted array
static int[] TwoSumSorted(int[] arr, int target)
{
    int lo = 0, hi = arr.Length - 1;
    while (lo < hi)
    {
        int sum = arr[lo] + arr[hi];
        if (sum == target)
            return [lo, hi];
        if (sum < target)
            lo++;
        else
            hi--;
    }
    return [];
}
```

---

### 3.2 Sliding Window

| | |
|---|---|
| **Idea** | Maintain a window `[left, right]` and expand/shrink |
| **Time** | Usually O(n) |
| **Use when** | Contiguous subarray/substring with a constraint |

```csharp
// Longest substring without repeating characters
static int LengthOfLongestSubstring(string s)
{
    var seen = new Dictionary<char, int>();
    int left = 0, best = 0;

    for (int right = 0; right < s.Length; right++)
    {
        char ch = s[right];
        if (seen.TryGetValue(ch, out int prev) && prev >= left)
            left = prev + 1;

        seen[ch] = right;
        best = Math.Max(best, right - left + 1);
    }
    return best;
}
```

**Practice:** Max sum subarray of size k, minimum window substring, longest repeating character replacement.

---

## Part 4: Hash-Based Algorithms

| | |
|---|---|
| **Idea** | Trade memory for O(1) average lookup |
| **Use when** | Frequency counting, deduplication, "have we seen this?" |

```csharp
// Two Sum - unsorted
static int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++)
    {
        int need = target - nums[i];
        if (seen.TryGetValue(need, out int idx))
            return [idx, i];
        seen[nums[i]] = i;
    }
    return [];
}
```

**Practice:** Group anagrams, subarray sum equals k, first unique character, longest consecutive sequence.

---

## Part 5: Stack & Queue Algorithms

### 5.1 Stack (LIFO)

**Use for:** Matching parentheses, undo, DFS, monotonic stack.

```csharp
// Valid parentheses
static bool IsValid(string s)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char>
    {
        [')'] = '(',
        ['}'] = '{',
        [']'] = '['
    };

    foreach (char ch in s)
    {
        if (ch is '(' or '{' or '[')
            stack.Push(ch);
        else if (stack.Count == 0 || stack.Pop() != pairs[ch])
            return false;
    }
    return stack.Count == 0;
}
```

**Monotonic stack:** Next greater element, daily temperatures, largest rectangle in histogram.

---

### 5.2 Queue / Deque (FIFO)

**Use for:** BFS, task scheduling, sliding window max.

```csharp
public sealed class TreeNode(int val = 0, TreeNode? left = null, TreeNode? right = null)
{
    public int Val { get; set; } = val;
    public TreeNode? Left { get; set; } = left;
    public TreeNode? Right { get; set; } = right;
}

static IList<IList<int>> BfsLevelOrder(TreeNode? root)
{
    if (root is null)
        return [];

    var result = new List<IList<int>>();
    var q = new Queue<TreeNode>();
    q.Enqueue(root);

    while (q.Count > 0)
    {
        var level = new List<int>();
        int count = q.Count;

        for (int i = 0; i < count; i++)
        {
            var node = q.Dequeue();
            level.Add(node.Val);
            if (node.Left is not null) q.Enqueue(node.Left);
            if (node.Right is not null) q.Enqueue(node.Right);
        }

        result.Add(level);
    }
    return result;
}
```

---

## Part 6: Tree Algorithms

### 6.1 Traversals (must know)

| Order | Visit order | Typical use |
|-------|-------------|-------------|
| Inorder (LNR) | Left, Node, Right | BST → sorted order |
| Preorder (NLR) | Node, Left, Right | Serialization, copy tree |
| Postorder (LRN) | Left, Right, Node | Delete tree, evaluate expression |
| Level order | By depth | Shortest path on unweighted tree |

```csharp
static void Inorder(TreeNode? root)
{
    if (root is null) return;
    Inorder(root.Left);
    Console.WriteLine(root.Val);
    Inorder(root.Right);
}
```

---

### 6.2 BST Operations

| Operation | Average | Worst (unbalanced) |
|-----------|---------|---------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |

**Practice:** Validate BST, lowest common ancestor, k-th smallest in BST, convert sorted array to BST.

---

## Part 7: Graph Algorithms

Represent graphs as:

- **Adjacency list** (most common): `graph[u] = new List<int> { v1, v2, ... }`
- **Adjacency matrix** for dense graphs or quick edge lookup

### 7.1 BFS (Breadth-First Search)

| | |
|---|---|
| **Time** | O(V + E) |
| **Use when** | Shortest path in unweighted graph, level-by-level exploration |

```csharp
static void Bfs(Dictionary<int, List<int>> graph, int start)
{
    var visited = new HashSet<int> { start };
    var q = new Queue<int>();
    q.Enqueue(start);

    while (q.Count > 0)
    {
        int node = q.Dequeue();
        foreach (int nei in graph[node])
        {
            if (visited.Add(nei))
                q.Enqueue(nei);
        }
    }
}
```

---

### 7.2 DFS (Depth-First Search)

| | |
|---|---|
| **Time** | O(V + E) |
| **Use when** | Connectivity, cycles, topological sort, backtracking on graphs |

```csharp
static void Dfs(Dictionary<int, List<int>> graph, int node, HashSet<int>? visited = null)
{
    visited ??= [];
    visited.Add(node);

    foreach (int nei in graph[node])
    {
        if (!visited.Contains(nei))
            Dfs(graph, nei, visited);
    }
}
```

**Iterative DFS** with a `Stack<T>` is also worth practicing.

---

### 7.3 Topological Sort

**Use when:** Dependencies, build order, course schedule.

- Kahn's algorithm (BFS + in-degree)
- DFS post-order reverse

**Practice:** Course schedule I/II, alien dictionary.

---

### 7.4 Shortest Path

| Algorithm | When |
|-----------|------|
| BFS | Unweighted edges |
| Dijkstra | Non-negative weights |
| Bellman-Ford | Negative weights allowed |
| Floyd-Warshall | All pairs (small V) |

**Dijkstra template (`PriorityQueue<TElement, TPriority>`):**

```csharp
static Dictionary<int, int> Dijkstra(
    Dictionary<int, List<(int Neighbor, int Weight)>> graph,
    int src)
{
    var dist = new Dictionary<int, int> { [src] = 0 };
    var pq = new PriorityQueue<int, int>();
    pq.Enqueue(src, 0);

    while (pq.Count > 0)
    {
        pq.TryDequeue(out int u, out int d);
        if (!dist.TryGetValue(u, out int best) || d > best)
            continue;

        if (!graph.TryGetValue(u, out var neighbors))
            continue;

        foreach (var (v, w) in neighbors)
        {
            int nd = d + w;
            if (!dist.TryGetValue(v, out int existing) || nd < existing)
            {
                dist[v] = nd;
                pq.Enqueue(v, nd);
            }
        }
    }
    return dist;
}
```

---

### 7.5 Union-Find (Disjoint Set Union)

**Use when:** Connected components, Kruskal's MST, "are u and v in same group?"

```csharp
sealed class UnionFind(int n)
{
    private readonly int[] parent = Enumerable.Range(0, n).ToArray();
    private readonly int[] rank = new int[n];

    public int Find(int x)
    {
        if (parent[x] != x)
            parent[x] = Find(parent[x]);
        return parent[x];
    }

    public bool Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;

        if (rank[ra] < rank[rb])
            (ra, rb) = (rb, ra);

        parent[rb] = ra;
        if (rank[ra] == rank[rb])
            rank[ra]++;
        return true;
    }
}
```

**Practice:** Number of islands, redundant connection, accounts merge.

---

## Part 8: Heap / Priority Queue

| | |
|---|---|
| **Operations** | insert O(log n), extract-min/max O(log n), peek O(1) |
| **Use when** | Top K elements, merge K sorted lists, scheduling, Dijkstra |

```csharp
// Top K frequent elements
static int[] TopKFrequent(int[] nums, int k)
{
    var counts = new Dictionary<int, int>();
    foreach (int n in nums)
        counts[n] = counts.GetValueOrDefault(n) + 1;

    return counts
        .OrderByDescending(kv => kv.Value)
        .Take(k)
        .Select(kv => kv.Key)
        .ToArray();
}
```

**Practice:** Kth largest in stream, find median from data stream, meeting rooms II.

---

## Part 9: String Algorithms

### 9.1 Basic Techniques

- Frequency arrays / hash maps
- Two pointers on strings
- Rolling hash (Rabin-Karp idea)
- Prefix function / KMP (advanced; know it exists)

### 9.2 Common Problems

| Problem type | Approach |
|--------------|----------|
| Anagram | Sort or frequency count |
| Palindrome | Two pointers |
| Substring search | Sliding window, KMP for heavy cases |
| Prefix matching | Trie |

**Trie (prefix tree):**

```csharp
sealed class TrieNode
{
    public Dictionary<char, TrieNode> Children { get; } = [];
    public bool IsEnd { get; set; }
}

sealed class Trie
{
    private readonly TrieNode root = new();

    public void Insert(string word)
    {
        TrieNode node = root;
        foreach (char ch in word)
        {
            if (!node.Children.TryGetValue(ch, out TrieNode? child))
                node.Children[ch] = child = new TrieNode();
            node = child;
        }
        node.IsEnd = true;
    }
}
```

**Practice:** Implement autocomplete, word search II, longest common prefix.

---

## Part 10: Classic Misc Algorithms

| Algorithm | Purpose |
|-----------|---------|
| **Kadane's** | Maximum subarray sum — O(n) |
| **Floyd's cycle detection** | Detect cycle in linked list |
| **Fast exponentiation** | Compute a^n in O(log n) |
| **GCD (Euclidean)** | Greatest common divisor |
| **Sieve of Eratosthenes** | All primes up to n |

```csharp
// Kadane's algorithm
static int MaxSubarray(int[] nums)
{
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        cur = Math.Max(nums[i], cur + nums[i]);
        best = Math.Max(best, cur);
    }
    return best;
}
```

---

## Pattern Recognition Cheat Sheet

When you see this → think this:

| Problem signal | Likely algorithm |
|----------------|------------------|
| Sorted array + find something | Binary search |
| Contiguous subarray/substring | Sliding window |
| Pair/triplet in sorted data | Two pointers |
| "Shortest" in unweighted graph | BFS |
| Dependencies / ordering | Topological sort |
| Connected groups | DFS / Union-Find |
| Top K / running best | Heap |
| Prefix lookups on strings | Trie |
| Many lookups by key | Hash map |
| All pairs too slow → need better | Sort + two pointers, or hash |

---

## 8-Week Study Plan

| Week | Focus | Problems |
|------|-------|----------|
| 1 | Linear & binary search | 15 easy |
| 2 | Two pointers, sliding window | 15 easy/medium |
| 3 | Hash maps, stacks, queues | 15 medium |
| 4 | Trees (traversals, BST) | 15 medium |
| 5 | Graphs: BFS, DFS | 15 medium |
| 6 | Graphs: topo sort, union-find, Dijkstra | 10 medium |
| 7 | Heaps, sorting applications | 10 medium |
| 8 | Strings, tries, mixed review | 10 medium + 5 timed |

**Daily routine (45–60 min):**

1. Review 1 algorithm (10 min)
2. Solve 1–2 problems (30 min)
3. Write complexity + pattern note (5 min)

---

## Practice Platforms

| Platform | Best for |
|----------|----------|
| [LeetCode](https://leetcode.com) | Interview-style problems |
| [NeetCode](https://neetcode.io) | Curated roadmap by topic |
| [Visualgo](https://visualgo.net) | Visualizing algorithms |
| [Big-O Cheat Sheet](https://www.bigocheatsheet.com) | Quick complexity reference |

---

## Starter Problem List

**Searching:** Binary Search, Search Insert Position, Find Minimum in Rotated Sorted Array

**Two pointers:** Two Sum II, 3Sum, Container With Most Water

**Sliding window:** Longest Substring Without Repeating Characters, Minimum Size Subarray Sum

**Stack:** Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram

**Trees:** Invert Binary Tree, Max Depth, Validate BST, Lowest Common Ancestor

**Graphs:** Number of Islands, Clone Graph, Course Schedule, Word Ladder

**Heap:** Kth Largest Element, Top K Frequent Elements

**Union-Find:** Redundant Connection, Accounts Merge

---

## Self-Check Checklist

Before moving on from an algorithm, you should be able to:

- [ ] Explain it in 30 seconds without looking at code
- [ ] State time and space complexity
- [ ] Implement it from scratch in C#
- [ ] Name 2 real problems where it applies
- [ ] Identify one common mistake (e.g. binary search off-by-one, DFS without visited set)
