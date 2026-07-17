# Standard Algorithms — Study Guide

A consolidated reference from our conversation: developer role requirements explained, plus a full study plan for **Standard Algorithms**.

All code examples use **C# 12 / .NET 8** with implicit global usings enabled.

---

## Content

1. [Developer Role Requirements Explained](#developer-role-requirements-explained)
2. [How to Use This Guide](#how-to-use-this-guide)
3. [Part 1: Searching Algorithms](#part-1-searching-algorithms)
   - [Linear Search](#11-linear-search)
   - [Binary Search](#12-binary-search)
   - [Binary Search Variants](#13-binary-search-variants)
4. [Part 2: Sorting Algorithms](#part-2-sorting-algorithms)
   - [Bubble Sort](#bubble-sort)
   - [Selection Sort](#selection-sort)
   - [Merge Sort](#21-merge-sort-must-know)
   - [Quick Sort](#22-quick-sort-must-know)
   - [Built-in Sort](#23-built-in-sort-in-interviews)
   - [Insertion Sort](#24-insertion-sort)
   - [Heap Sort](#25-heap-sort)
   - [Dutch National Flag](#26-dutch-national-flag)
   - [Quickselect](#27-quickselect)
   - [Counting Sort](#counting-sort)
   - [Radix Sort](#radix-sort)
5. [Part 3: Two Pointers & Sliding Window](#part-3-two-pointers--sliding-window)
   - [Two Pointers](#31-two-pointers)
   - [Sliding Window](#32-sliding-window)
   - [Same-Direction Two Pointers](#33-same-direction-two-pointers)
6. [Part 4: Hash-Based Algorithms](#part-4-hash-based-algorithms)
   - [Hash Map Fundamentals](#41-hash-map-fundamentals)
   - [Unsorted Two Sum](#42-unsorted-two-sum)
   - [Frequency Counting and Deduplication](#43-frequency-counting-and-deduplication)
   - [Subarray Sum Equals K](#44-subarray-sum-equals-k)
7. [Part 5: Stack & Queue Algorithms](#part-5-stack--queue-algorithms)
   - [Stack and Parentheses Validation](#51-stack-lifo)
   - [Queue and Deque](#52-queue--deque-fifo)
   - [Monotonic Stack](#53-monotonic-stack)
   - [Sliding Window Maximum](#54-sliding-window-maximum-with-a-deque)
8. [Part 6: Tree Algorithms](#part-6-tree-algorithms)
   - [Tree Traversals](#61-traversals-must-know)
   - [Binary Search Tree Operations](#62-bst-operations)
9. [Part 7: Graph Algorithms](#part-7-graph-algorithms)
   - [Breadth-First Search (BFS)](#71-bfs-breadth-first-search)
   - [Depth-First Search (DFS)](#72-dfs-depth-first-search)
   - [Topological Sort](#73-topological-sort)
   - [Shortest Paths: BFS, Dijkstra, Bellman-Ford, Floyd-Warshall](#74-shortest-path)
   - [Union-Find / Disjoint Set Union](#75-union-find-disjoint-set-union)
10. [Part 8: Heap / Priority Queue](#part-8-heap--priority-queue)
    - [Top K Frequent Elements](#81-top-k-frequent-elements)
    - [K-th Largest with a Bounded Heap](#82-k-th-largest-with-a-bounded-heap)
11. [Part 9: String Algorithms](#part-9-string-algorithms)
    - [Basic String Techniques](#91-basic-techniques)
    - [Anagram with Frequency Counting](#92-anagram-with-frequency-counting)
    - [Palindrome with Two Pointers](#93-palindrome-with-two-pointers)
    - [Common String Problems](#94-common-problems)
    - [Trie](#95-trie-prefix-tree)
    - [Rolling Hash / Rabin-Karp](#rolling-hash--rabin-karp)
    - [Prefix Function / KMP](#prefix-function--kmp)
12. [Part 10: Classic Misc Algorithms](#part-10-classic-misc-algorithms)
    - [Kadane's Algorithm](#101-kadanes-algorithm)
    - [Floyd's Cycle Detection](#102-floyds-cycle-detection)
    - [Fast Exponentiation](#103-fast-exponentiation)
    - [Euclidean GCD and LCM](#104-euclidean-gcd-and-lcm)
    - [Sieve of Eratosthenes](#105-sieve-of-eratosthenes)
    - [Prefix Sums](#106-prefix-sums)
13. [Part 11: Linked List Algorithms](#part-11-linked-list-algorithms)
    - [Reverse a Singly Linked List](#111-reverse-a-singly-linked-list)
    - [Find the Middle Node](#112-find-the-middle-node)
    - [Floyd's Cycle Detection](#113-floyds-cycle-detection)
    - [Merge Two Sorted Linked Lists](#114-merge-two-sorted-linked-lists)
14. [Part 12: Dynamic Programming](#part-12-dynamic-programming)
    - [Climbing Stairs](#121-climbing-stairs)
    - [Coin Change](#122-coin-change)
    - [Longest Common Subsequence](#123-longest-common-subsequence)
    - [Edit Distance](#124-edit-distance)
15. [Part 13: Greedy Algorithms](#part-13-greedy-algorithms)
    - [Merge Intervals](#131-merge-intervals)
    - [Activity Selection](#132-activity-selection)
16. [Part 14: Backtracking](#part-14-backtracking)
    - [Subsets](#141-subsets)
    - [Permutations](#142-permutations)
17. [Pattern Recognition Cheat Sheet](#pattern-recognition-cheat-sheet)
18. [12-Week Study Plan](#12-week-study-plan)
19. [Practice Platforms](#practice-platforms)
20. [Starter Problem List](#starter-problem-list)
21. [Self-Check Checklist](#self-check-checklist)

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

| Paradigm | Why it exists / problem it solves | Example use |
|----------|------------------------------------|-------------|
| **Brute force** | Tries every possibility; provides a simple correctness baseline and works when the search space is small | Small inputs, baseline solution |
| **Greedy** | Makes the locally best choice when that choice can be proven to produce a global optimum | Interval scheduling, Huffman coding |
| **Divide and conquer** | Splits a large problem into independent smaller problems that can be solved and combined efficiently | Merge sort, fast exponentiation |
| **Dynamic programming** | Avoids recomputing overlapping subproblems by storing their results | Knapsack, longest common subsequence |
| **Backtracking** | Explores a choice tree and abandons partial solutions as soon as they cannot succeed | Sudoku, permutations/combinations |
| **Two pointers / sliding window** | Reuses positions or range state to avoid repeatedly scanning the same elements | Subarray problems, string windows |
| **Recursion** | Expresses naturally hierarchical problems as smaller instances of the same problem | Tree traversal, divide-and-conquer |

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

**For each algorithm, learn five things:**

1. **What it does** (one sentence)
2. **Why it exists and what problem it solves** (motivation)
3. **Time/space complexity** (Big O)
4. **When to use it** (pattern recognition)
5. **How to implement it** (simple version in C#)

**Suggested pace:** 2–3 algorithms per week + 5–10 practice problems per week.

---

## Part 1: Searching Algorithms

### 1.1 Linear Search

[↑ Content](#content)

**Why it exists / problem it solves:** Linear search provides the simplest way to locate a value when the data has no useful ordering or index. It examines elements one at a time, so it works on almost any collection without preprocessing.

| | |
|---|---|
| **Idea** | Check every element until you find the target or reach the end |
| **Time** | O(n) |
| **Space** | O(1) |
| **Use when** | List is unsorted, small data, or you only search once |

```csharp
public static class LinearSearchAlgorithm
{
    public static int FindIndex(int[] numbers, int target)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        for (int index = 0; index < numbers.Length; index++)
        {
            if (numbers[index] == target)
                return index;
        }

        return -1;
    }
}
```

**Example:** `int index = LinearSearchAlgorithm.FindIndex([4, 7, 2], target: 7); // 1`

**Practice:** Find first/last occurrence, count occurrences, search in 2D matrix (row-wise).

---

### 1.2 Binary Search

[↑ Content](#content)

**Why it exists / problem it solves:** Linear search becomes expensive on large collections. Binary search takes advantage of sorted data—or any monotonic condition—to discard half of the remaining possibilities after every comparison.

| | |
|---|---|
| **Idea** | Repeatedly halve a **sorted** range by comparing with the middle |
| **Time** | O(log n) |
| **Space** | O(1) iterative, O(log n) recursive |
| **Use when** | Data is sorted, or you can define a monotonic "yes/no" predicate |

```csharp
public static class BinarySearchAlgorithm
{
    public static int FindIndex(int[] sortedNumbers, int target)
    {
        ArgumentNullException.ThrowIfNull(sortedNumbers);

        int leftIndex = 0;
        int rightIndex = sortedNumbers.Length - 1;

        while (leftIndex <= rightIndex)
        {
            int middleIndex = leftIndex + (rightIndex - leftIndex) / 2;
            int middleValue = sortedNumbers[middleIndex];

            if (middleValue == target)
                return middleIndex;

            if (middleValue < target)
                leftIndex = middleIndex + 1;
            else
                rightIndex = middleIndex - 1;
        }

        return -1;
    }
}
```

**Example:** `int index = BinarySearchAlgorithm.FindIndex([1, 3, 5, 8], target: 5); // 2`

**Variants to learn:**

- **Lower bound:** Finds the first index where `arr[i] >= target`. It solves insertion-point and range-start questions without a linear scan.
- **Upper bound:** Finds the boundary after the target range (or, by a related implementation, the last index where `arr[i] <= target`). It helps count occurrences and locate range ends in sorted data.
- **Search on answer space:** Finds the smallest or largest value satisfying a monotonic condition. It solves optimization questions such as the minimum capacity, speed, or number of days needed.

**Practice:** Search in rotated sorted array, find peak element, sqrt via binary search, "Koko eating bananas" style problems.

### 1.3 Binary Search Variants

[↑ Content](#content)

**Why they exist / problem they solve:** Many sorted-data problems need a boundary or the smallest feasible answer rather than an exact match. These variants preserve O(log n) search by discarding half of the remaining candidates each step.

| Method | Result |
|--------|--------|
| Lower bound | First index whose value is at least the target |
| Upper bound | First index whose value is greater than the target |
| First true | Smallest integer satisfying a monotonic predicate |

**Time:** O(log n). **Space:** O(1).

`FirstTrue` returns `null` when no value in the requested range satisfies the predicate.

```csharp
public static class BinarySearchVariants
{
    public static int LowerBound(int[] sortedNumbers, int target)
    {
        ArgumentNullException.ThrowIfNull(sortedNumbers);

        int left = 0;
        int right = sortedNumbers.Length;

        while (left < right)
        {
            int middle = left + (right - left) / 2;
            if (sortedNumbers[middle] < target)
                left = middle + 1;
            else
                right = middle;
        }

        return left;
    }

    public static int UpperBound(int[] sortedNumbers, int target)
    {
        ArgumentNullException.ThrowIfNull(sortedNumbers);

        int left = 0;
        int right = sortedNumbers.Length;

        while (left < right)
        {
            int middle = left + (right - left) / 2;
            if (sortedNumbers[middle] <= target)
                left = middle + 1;
            else
                right = middle;
        }

        return left;
    }

    public static int? FirstTrue(
        int minimum,
        int maximum,
        Func<int, bool> condition)
    {
        ArgumentNullException.ThrowIfNull(condition);

        if (minimum > maximum)
            throw new ArgumentException("Minimum must not exceed maximum.");

        int left = minimum;
        int right = maximum;
        int? answer = null;

        while (left <= right)
        {
            int middle = (int)(
                (long)left + ((long)right - left) / 2);

            if (condition(middle))
            {
                answer = middle;
                right = middle - 1;
            }
            else
            {
                left = middle + 1;
            }
        }

        return answer;
    }
}
```

**Example:**

```csharp
int[] numbers = [1, 2, 2, 2, 5];
int firstTwo = BinarySearchVariants.LowerBound(numbers, 2); // 1
int afterTwos = BinarySearchVariants.UpperBound(numbers, 2); // 4
int? firstSquareAtLeast30 =
    BinarySearchVariants.FirstTrue(0, 30, value => value * value >= 30); // 6
```

---

## Part 2: Sorting Algorithms

Know **what each does**, **complexity**, and **stability** (stable = equal elements keep original order).

Sorting algorithms exist to put data into a predictable order so that later operations—such as searching, grouping, comparing, and detecting duplicates—become easier or faster. No single sorting algorithm is best for every situation:

- <a id="bubble-sort"></a>**Bubble Sort:** Repeatedly swaps adjacent out-of-order values. It mainly exists as a teaching tool and can be acceptable for tiny inputs.
- <a id="selection-sort"></a>**Selection Sort:** Repeatedly selects the smallest remaining value. It is useful when minimizing the number of writes or swaps matters more than comparisons.
- **Insertion Sort:** Inserts each value into an already-sorted prefix. It solves small or nearly sorted inputs efficiently and is often used inside hybrid sorting algorithms.
- **Merge Sort:** Splits data, sorts each half, and merges the results. It provides predictable O(n log n) performance and stable ordering.
- **Quick Sort:** Partitions values around a pivot. It is designed for fast, in-place, general-purpose sorting with good average performance.
- **Heap Sort:** Uses a heap to repeatedly select the next largest or smallest value. It provides O(n log n) worst-case time while sorting in place.
- <a id="counting-sort"></a>**Counting Sort:** Counts occurrences of each value instead of comparing values. It solves sorting efficiently when integers come from a small, known range.
- <a id="radix-sort"></a>**Radix Sort:** Sorts values one digit or character position at a time. It avoids direct comparisons for fixed-width numbers or strings.

| Algorithm | Best | Average | Worst | Space | Stable? | Notes |
|-----------|------|---------|-------|-------|---------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Teaching only |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No | Few swaps |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Good for small/nearly sorted |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | Divide & conquer, linked lists |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) average; O(n) worst | No | Fast in practice, in-place |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Priority queue connection |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes | Small integer range |
| Radix Sort | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k) | Yes | Fixed-width digits |

### 2.1 Merge Sort (must know)

[↑ Content](#content)

**Why it exists / problem it solves:** Merge Sort is used when predictable performance and stability matter. By dividing the input into small pieces and merging them in order, it guarantees O(n log n) time even when the original data is already sorted or arranged unfavorably.

```csharp
public static class MergeSortAlgorithm
{
    public static int[] Sort(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        int[] sortedNumbers = (int[])numbers.Clone();
        int[] temporary = new int[sortedNumbers.Length];
        SortRange(sortedNumbers, temporary, 0, sortedNumbers.Length - 1);
        return sortedNumbers;
    }

    private static void SortRange(
        int[] numbers,
        int[] temporary,
        int leftIndex,
        int rightIndex)
    {
        if (leftIndex >= rightIndex)
            return;

        int middleIndex = leftIndex + (rightIndex - leftIndex) / 2;
        SortRange(numbers, temporary, leftIndex, middleIndex);
        SortRange(numbers, temporary, middleIndex + 1, rightIndex);
        Merge(numbers, temporary, leftIndex, middleIndex, rightIndex);
    }

    private static void Merge(
        int[] numbers,
        int[] temporary,
        int leftIndex,
        int middleIndex,
        int rightIndex)
    {
        int leftCursor = leftIndex;
        int rightCursor = middleIndex + 1;
        int destination = leftIndex;

        while (leftCursor <= middleIndex && rightCursor <= rightIndex)
        {
            temporary[destination++] =
                numbers[leftCursor] <= numbers[rightCursor]
                    ? numbers[leftCursor++]
                    : numbers[rightCursor++];
        }

        while (leftCursor <= middleIndex)
            temporary[destination++] = numbers[leftCursor++];

        while (rightCursor <= rightIndex)
            temporary[destination++] = numbers[rightCursor++];

        for (int index = leftIndex; index <= rightIndex; index++)
            numbers[index] = temporary[index];
    }
}
```

**Example:** `int[] sorted = MergeSortAlgorithm.Sort([5, 2, 8, 1]); // [1, 2, 5, 8]`

**Use when:** Guaranteed O(n log n), external sorting, inversion count problems.

---

### 2.2 Quick Sort (must know)

[↑ Content](#content)

**Why it exists / problem it solves:** Quick Sort provides a fast general-purpose sort that usually needs little extra memory. Partitioning places one pivot in its final position and separates smaller values from larger ones, turning one large sorting problem into two smaller ones.

```csharp
public static class QuickSortAlgorithm
{
    public static void Sort(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);
        SortRange(numbers, 0, numbers.Length - 1);
    }

    private static void SortRange(int[] numbers, int leftIndex, int rightIndex)
    {
        if (leftIndex >= rightIndex)
            return;

        int pivotFinalIndex = Partition(numbers, leftIndex, rightIndex);
        SortRange(numbers, leftIndex, pivotFinalIndex - 1);
        SortRange(numbers, pivotFinalIndex + 1, rightIndex);
    }

    private static int Partition(int[] numbers, int leftIndex, int rightIndex)
    {
        int pivotValue = numbers[rightIndex];
        int nextSmallerValueIndex = leftIndex;

        for (int currentIndex = leftIndex; currentIndex < rightIndex; currentIndex++)
        {
            if (numbers[currentIndex] <= pivotValue)
            {
                Swap(numbers, nextSmallerValueIndex, currentIndex);
                nextSmallerValueIndex++;
            }
        }

        Swap(numbers, nextSmallerValueIndex, rightIndex);
        return nextSmallerValueIndex;
    }

    private static void Swap(int[] numbers, int firstIndex, int secondIndex)
    {
        (numbers[firstIndex], numbers[secondIndex]) =
            (numbers[secondIndex], numbers[firstIndex]);
    }
}
```

**Example:**

```csharp
int[] numbers = [5, 2, 8, 1];
QuickSortAlgorithm.Sort(numbers); // numbers is now [1, 2, 5, 8]
```

**Use when:** In-memory general sorting; know pivot choice affects worst case.

---

### 2.3 Built-in Sort in Interviews

[↑ Content](#content)

In real coding interviews, use built-in sorting (`Array.Sort()`, `List<T>.Sort()`, or LINQ `OrderBy()`) unless asked to implement. Still know **why** it is roughly O(n log n) and when stability matters.

**Dutch National Flag:** This three-pointer partitioning algorithm exists to group three categories in one O(n) pass and O(1) extra space instead of performing a full sort. It solves problems such as Sort Colors and is also the basis of three-way Quick Sort partitioning.

**Practice:** Sort colors (Dutch flag), merge intervals, largest number from array, k-th largest element.

### 2.4 Insertion Sort

[↑ Content](#content)

**Why it exists / problem it solves:** Insertion Sort has very low overhead and adapts to data that is already almost sorted. It grows a sorted prefix by inserting each new value into its correct position.

**Time:** O(n) best case, O(n²) average/worst case. **Space:** O(1). **Stable:** Yes.

```csharp
public static class InsertionSortAlgorithm
{
    public static void Sort(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        for (int index = 1; index < numbers.Length; index++)
        {
            int valueToInsert = numbers[index];
            int position = index - 1;

            while (position >= 0 && numbers[position] > valueToInsert)
            {
                numbers[position + 1] = numbers[position];
                position--;
            }

            numbers[position + 1] = valueToInsert;
        }
    }
}
```

**Example:** `int[] values = [5, 2, 4, 3]; InsertionSortAlgorithm.Sort(values); // [2, 3, 4, 5]`

### 2.5 Heap Sort

[↑ Content](#content)

**Why it exists / problem it solves:** Heap Sort guarantees O(n log n) time while sorting in place. A max-heap keeps the largest remaining value at the root so it can be moved to the end repeatedly.

**Time:** O(n log n). **Space:** O(1). **Stable:** No.

```csharp
public static class HeapSortAlgorithm
{
    public static void Sort(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        for (int root = numbers.Length / 2 - 1; root >= 0; root--)
            SiftDown(numbers, root, numbers.Length);

        for (int end = numbers.Length - 1; end > 0; end--)
        {
            (numbers[0], numbers[end]) = (numbers[end], numbers[0]);
            SiftDown(numbers, 0, end);
        }
    }

    private static void SiftDown(int[] numbers, int root, int length)
    {
        while (true)
        {
            int largest = root;
            int leftChild = root * 2 + 1;
            int rightChild = leftChild + 1;

            if (leftChild < length && numbers[leftChild] > numbers[largest])
                largest = leftChild;

            if (rightChild < length && numbers[rightChild] > numbers[largest])
                largest = rightChild;

            if (largest == root)
                return;

            (numbers[root], numbers[largest]) = (numbers[largest], numbers[root]);
            root = largest;
        }
    }
}
```

**Example:** `int[] values = [7, 2, 9, 1]; HeapSortAlgorithm.Sort(values); // [1, 2, 7, 9]`

### 2.6 Dutch National Flag

[↑ Content](#content)

**Why it exists / problem it solves:** When values belong to exactly three groups, a full comparison sort performs unnecessary work. Three boundaries partition the array into low, middle, and high groups in one pass.

**Time:** O(n). **Space:** O(1). **Use when:** Three-way classification or Quick Sort partitioning with many duplicates.

```csharp
public static class DutchNationalFlagAlgorithm
{
    public static void SortZeroOneTwo(int[] values)
    {
        ArgumentNullException.ThrowIfNull(values);

        int nextZero = 0;
        int current = 0;
        int nextTwo = values.Length - 1;

        while (current <= nextTwo)
        {
            switch (values[current])
            {
                case 0:
                    (values[nextZero], values[current]) =
                        (values[current], values[nextZero]);
                    nextZero++;
                    current++;
                    break;
                case 1:
                    current++;
                    break;
                case 2:
                    (values[current], values[nextTwo]) =
                        (values[nextTwo], values[current]);
                    nextTwo--;
                    break;
                default:
                    throw new ArgumentException("Values must be 0, 1, or 2.");
            }
        }
    }
}
```

**Example:** `int[] colors = [2, 0, 1, 2, 0]; DutchNationalFlagAlgorithm.SortZeroOneTwo(colors); // [0, 0, 1, 2, 2]`

### 2.7 Quickselect

[↑ Content](#content)

**Why it exists / problem it solves:** Quickselect finds an order statistic, such as the k-th largest value, without fully sorting the collection. Like Quick Sort, it partitions around a pivot but continues into only one side.

**Time:** O(n) average, O(n²) worst case. **Space:** O(n) here because the input is copied.

```csharp
public static class QuickselectAlgorithm
{
    public static int FindKthLargest(int[] numbers, int k)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        if (k < 1 || k > numbers.Length)
            throw new ArgumentOutOfRangeException(nameof(k));

        int[] working = (int[])numbers.Clone();
        int targetIndex = working.Length - k;
        int left = 0;
        int right = working.Length - 1;

        while (left <= right)
        {
            int pivotIndex = Partition(working, left, right);

            if (pivotIndex == targetIndex)
                return working[pivotIndex];

            if (pivotIndex < targetIndex)
                left = pivotIndex + 1;
            else
                right = pivotIndex - 1;
        }

        throw new InvalidOperationException("The target index was not found.");
    }

    private static int Partition(int[] values, int left, int right)
    {
        int pivot = values[right];
        int destination = left;

        for (int current = left; current < right; current++)
        {
            if (values[current] <= pivot)
            {
                (values[destination], values[current]) =
                    (values[current], values[destination]);
                destination++;
            }
        }

        (values[destination], values[right]) =
            (values[right], values[destination]);
        return destination;
    }
}
```

**Example:** `int thirdLargest = QuickselectAlgorithm.FindKthLargest([3, 2, 1, 5, 6, 4], 3); // 4`

---

## Part 3: Two Pointers & Sliding Window

These are very common in interviews and production code.

### 3.1 Two Pointers

[↑ Content](#content)

**Why it exists / problem it solves:** Two pointers avoid repeatedly scanning the same collection when two positions can move according to a useful relationship. The technique commonly reduces pair, range, or in-place array problems from O(n²) to O(n).

| Pattern | Problem it solves | Example |
|---------|-------------------|---------|
| Opposite ends | Narrows a sorted range using information from both boundaries | Two sum in sorted array |
| Same direction | Reads and writes in one pass without allocating another collection | Remove duplicates in-place |
| Fast/slow | Detects cycles or finds a midpoint with O(1) extra space | Cycle detection in linked list |

```csharp
public static class SortedTwoSumAlgorithm
{
    public static (int LeftIndex, int RightIndex)? FindPair(
        int[] sortedNumbers,
        int target)
    {
        ArgumentNullException.ThrowIfNull(sortedNumbers);

        int leftIndex = 0;
        int rightIndex = sortedNumbers.Length - 1;

        while (leftIndex < rightIndex)
        {
            long sum = (long)sortedNumbers[leftIndex] + sortedNumbers[rightIndex];

            if (sum == target)
                return (leftIndex, rightIndex);

            if (sum < target)
                leftIndex++;
            else
                rightIndex--;
        }

        return null;
    }
}
```

**Example:** `var pair = SortedTwoSumAlgorithm.FindPair([1, 2, 4, 7], target: 6); // (1, 2)`

---

### 3.2 Sliding Window

[↑ Content](#content)

**Why it exists / problem it solves:** Recalculating every possible contiguous subarray or substring is often O(n²) or worse. A sliding window reuses information from the previous range while expanding or shrinking its boundaries, which often reduces the work to O(n).

| | |
|---|---|
| **Idea** | Maintain a window `[left, right]` and expand/shrink |
| **Time** | Usually O(n) |
| **Use when** | Contiguous subarray/substring with a constraint |

```csharp
public static class LongestUniqueSubstringAlgorithm
{
    public static int FindLength(string text)
    {
        ArgumentNullException.ThrowIfNull(text);

        var lastSeenIndex = new Dictionary<char, int>();
        int windowStart = 0;
        int longestLength = 0;

        for (int windowEnd = 0; windowEnd < text.Length; windowEnd++)
        {
            char currentCharacter = text[windowEnd];

            if (lastSeenIndex.TryGetValue(currentCharacter, out int previousIndex)
                && previousIndex >= windowStart)
            {
                windowStart = previousIndex + 1;
            }

            lastSeenIndex[currentCharacter] = windowEnd;
            longestLength = Math.Max(
                longestLength,
                windowEnd - windowStart + 1);
        }

        return longestLength;
    }
}
```

**Example:** `int length = LongestUniqueSubstringAlgorithm.FindLength("abcabcbb"); // 3`

**Practice:** Max sum subarray of size k, minimum window substring, longest repeating character replacement.

### 3.3 Same-Direction Two Pointers

[↑ Content](#content)

**Why it exists / problem it solves:** A read pointer examines each value while a write pointer tracks where the next retained value belongs. This compacts arrays in place without allocating another collection.

**Time:** O(n). **Space:** O(1).

```csharp
public static class RemoveDuplicatesFromSortedArray
{
    public static int Compact(int[] sortedNumbers)
    {
        ArgumentNullException.ThrowIfNull(sortedNumbers);

        if (sortedNumbers.Length == 0)
            return 0;

        int uniqueCount = 1;

        for (int readIndex = 1; readIndex < sortedNumbers.Length; readIndex++)
        {
            if (sortedNumbers[readIndex] == sortedNumbers[uniqueCount - 1])
                continue;

            sortedNumbers[uniqueCount] = sortedNumbers[readIndex];
            uniqueCount++;
        }

        return uniqueCount;
    }
}
```

**Example:** `int[] values = [1, 1, 2, 3, 3]; int count = RemoveDuplicatesFromSortedArray.Compact(values); // first 3 values: [1, 2, 3]`

---

## Part 4: Hash-Based Algorithms

### 4.1 Hash Map Fundamentals

[↑ Content](#content)

**Why they exist / problem they solve:** Hash-based algorithms provide fast lookup by key, avoiding a repeated scan through the collection. They trade additional memory for efficient membership tests, frequency counts, deduplication, and matching values such as complements in Two Sum.

| | |
|---|---|
| **Idea** | Trade memory for O(1) average lookup |
| **Use when** | Frequency counting, deduplication, "have we seen this?" |

### 4.2 Unsorted Two Sum

[↑ Content](#content)

The hash-map version of **Two Sum** stores previously seen values so it can find each value's complement in O(1) average time. This reduces the pair search from O(n²) brute force to O(n) average time.

**Time:** O(n) average. **Space:** O(n).

```csharp
public static class UnsortedTwoSumAlgorithm
{
    public static (int FirstIndex, int SecondIndex)? FindPair(
        int[] numbers,
        int target)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        var indexByValue = new Dictionary<int, int>();

        for (int currentIndex = 0; currentIndex < numbers.Length; currentIndex++)
        {
            long requiredValue = (long)target - numbers[currentIndex];

            if (requiredValue is >= int.MinValue and <= int.MaxValue
                && indexByValue.TryGetValue((int)requiredValue, out int matchingIndex))
            {
                return (matchingIndex, currentIndex);
            }

            indexByValue[numbers[currentIndex]] = currentIndex;
        }

        return null;
    }
}
```

**Example:** `var pair = UnsortedTwoSumAlgorithm.FindPair([2, 7, 11, 15], target: 9); // (0, 1)`

### 4.3 Frequency Counting and Deduplication

[↑ Content](#content)

**Why it exists / problem it solves:** Frequency maps answer “how many?” while hash sets answer “have we seen this?” Both replace repeated scans with O(1) average lookup.

**Time:** O(n) average. **Space:** O(k) distinct values.

```csharp
public static class HashCollectionPatterns
{
    public static IReadOnlyDictionary<T, int> CountFrequencies<T>(
        IEnumerable<T> values)
        where T : notnull
    {
        ArgumentNullException.ThrowIfNull(values);

        var counts = new Dictionary<T, int>();
        foreach (T value in values)
            counts[value] = counts.GetValueOrDefault(value) + 1;

        return counts;
    }

    public static bool ContainsDuplicate<T>(IEnumerable<T> values)
        where T : notnull
    {
        ArgumentNullException.ThrowIfNull(values);

        var seen = new HashSet<T>();
        foreach (T value in values)
        {
            if (!seen.Add(value))
                return true;
        }

        return false;
    }
}
```

**Example:** `bool duplicate = HashCollectionPatterns.ContainsDuplicate([4, 2, 4]); // true`

### 4.4 Subarray Sum Equals K

[↑ Content](#content)

**Why it exists / problem it solves:** If two prefix sums differ by `k`, the values between them sum to `k`. A frequency map counts matching earlier prefixes in one pass, including arrays with negative values.

**Time:** O(n) average. **Space:** O(n).

```csharp
public static class SubarraySumAlgorithm
{
    public static long CountWithSum(int[] numbers, long target)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        var prefixFrequency = new Dictionary<long, long> { [0] = 1 };
        long prefixSum = 0;
        long matchingSubarrays = 0;

        foreach (int number in numbers)
        {
            prefixSum += number;
            matchingSubarrays +=
                prefixFrequency.GetValueOrDefault(prefixSum - target);
            prefixFrequency[prefixSum] =
                prefixFrequency.GetValueOrDefault(prefixSum) + 1;
        }

        return matchingSubarrays;
    }
}
```

**Example:** `long count = SubarraySumAlgorithm.CountWithSum([1, 1, 1], 2); // 2`

**Practice:** Group anagrams, subarray sum equals k, first unique character, longest consecutive sequence.

---

## Part 5: Stack & Queue Algorithms

### 5.1 Stack (LIFO)

[↑ Content](#content)

**Why it exists / problem it solves:** A stack remembers items in reverse order of arrival, which matches problems where the most recent unfinished operation must be handled first. This makes it natural for nested structures, undo operations, expression evaluation, DFS, and monotonic-stack problems.

**Use for:** Matching parentheses, undo, DFS, monotonic stack.

The parentheses validator runs in **O(n) time** and uses **O(n) stack space** in the worst case.

```csharp
public static class ParenthesesValidator
{
    private static readonly IReadOnlyDictionary<char, char> OpeningByClosing =
        new Dictionary<char, char>
        {
            [')'] = '(',
            ['}'] = '{',
            [']'] = '['
        };

    public static bool IsValid(string text)
    {
        ArgumentNullException.ThrowIfNull(text);

        var openingCharacters = new Stack<char>();

        foreach (char character in text)
        {
            if (character is '(' or '{' or '[')
            {
                openingCharacters.Push(character);
                continue;
            }

            if (!OpeningByClosing.TryGetValue(character, out char expectedOpening)
                || openingCharacters.Count == 0
                || openingCharacters.Pop() != expectedOpening)
            {
                return false;
            }
        }

        return openingCharacters.Count == 0;
    }
}
```

**Example:** `bool isValid = ParenthesesValidator.IsValid("({[]})"); // true`

**Monotonic stack:** Keeps pending values in increasing or decreasing order and removes values that can no longer be an answer. It solves next-greater/smaller and span problems in O(n), including daily temperatures and the largest rectangle in a histogram.

---

### 5.2 Queue / Deque (FIFO)

[↑ Content](#content)

**Why it exists / problem it solves:** A queue processes items in arrival order, which is needed for fair scheduling and level-by-level exploration. A deque extends this idea by allowing efficient insertion and removal at both ends, which helps maintain candidates for sliding-window problems.

**Use for:** BFS, task scheduling, sliding window max.

The deque-based Sliding Window Maximum implementation later in this section demonstrates why access to both ends matters.

### 5.3 Monotonic Stack

[↑ Content](#content)

**Why it exists / problem it solves:** A decreasing stack keeps only values that can still be the next greater answer for a future element. Each index is pushed and popped at most once.

**Time:** O(n). **Space:** O(n).

```csharp
public static class NextGreaterElementAlgorithm
{
    public static int[] FindNextGreaterValues(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        int[] result = Enumerable.Repeat(-1, numbers.Length).ToArray();
        var unresolvedIndices = new Stack<int>();

        for (int index = 0; index < numbers.Length; index++)
        {
            while (unresolvedIndices.Count > 0
                && numbers[index] > numbers[unresolvedIndices.Peek()])
            {
                result[unresolvedIndices.Pop()] = numbers[index];
            }

            unresolvedIndices.Push(index);
        }

        return result;
    }
}
```

**Example:** `int[] next = NextGreaterElementAlgorithm.FindNextGreaterValues([2, 1, 4, 3]); // [4, 4, -1, -1]`

### 5.4 Sliding Window Maximum with a Deque

[↑ Content](#content)

**Why it exists / problem it solves:** A decreasing deque stores only indices that can still become the maximum. It avoids rescanning each window or maintaining a fully sorted structure.

**Time:** O(n). **Space:** O(k).

```csharp
public static class SlidingWindowMaximumAlgorithm
{
    public static int[] Find(int[] numbers, int windowSize)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        if (windowSize < 1 || windowSize > numbers.Length)
            throw new ArgumentOutOfRangeException(nameof(windowSize));

        var candidateIndices = new LinkedList<int>();
        var maximums = new int[numbers.Length - windowSize + 1];

        for (int index = 0; index < numbers.Length; index++)
        {
            while (candidateIndices.First is not null
                && candidateIndices.First.Value <= index - windowSize)
            {
                candidateIndices.RemoveFirst();
            }

            while (candidateIndices.Last is not null
                && numbers[candidateIndices.Last.Value] <= numbers[index])
            {
                candidateIndices.RemoveLast();
            }

            candidateIndices.AddLast(index);

            if (index >= windowSize - 1)
                maximums[index - windowSize + 1] =
                    numbers[candidateIndices.First!.Value];
        }

        return maximums;
    }
}
```

**Example:** `int[] maximums = SlidingWindowMaximumAlgorithm.Find([1, 3, -1, -3, 5, 3, 6, 7], 3); // [3, 3, 5, 5, 6, 7]`

---

## Part 6: Tree Algorithms

**Shared tree node used by all examples:**

```csharp
public sealed class TreeNode
{
    public TreeNode(
        int value,
        TreeNode? left = null,
        TreeNode? right = null)
    {
        Value = value;
        Left = left;
        Right = right;
    }

    public int Value { get; set; }
    public TreeNode? Left { get; set; }
    public TreeNode? Right { get; set; }
}
```

### 6.1 Traversals (must know)

[↑ Content](#content)

**Why they exist / problem they solve:** Trees are hierarchical rather than sequential, so traversal algorithms define a systematic order in which every node is visited. Different orders expose different properties: inorder sorts a BST, preorder handles a parent before its children, postorder handles children before their parent, and level order explores by depth.

| Order | Visit order | Typical use |
|-------|-------------|-------------|
| Inorder (LNR) | Left, Node, Right | BST → sorted order |
| Preorder (NLR) | Node, Left, Right | Serialization, copy tree |
| Postorder (LRN) | Left, Right, Node | Delete tree, evaluate expression |
| Level order | By depth | Shortest path on unweighted tree |

```csharp
public static class InorderTreeTraversal
{
    public static IReadOnlyList<int> Traverse(TreeNode? root)
    {
        var values = new List<int>();
        TraverseNode(root, values);
        return values;
    }

    private static void TraverseNode(TreeNode? node, List<int> values)
    {
        if (node is null)
            return;

        TraverseNode(node.Left, values);
        values.Add(node.Value);
        TraverseNode(node.Right, values);
    }
}
```

**Example:**

```csharp
var root = new TreeNode(
    2,
    left: new TreeNode(1),
    right: new TreeNode(3));

var values = InorderTreeTraversal.Traverse(root); // [1, 2, 3]
```

Each traversal visits every node once: **O(n) time** and **O(h) recursion space**, where `h` is tree height. Level order uses O(w) queue space, where `w` is maximum width.

```csharp
public static class AdditionalTreeTraversals
{
    public static IReadOnlyList<int> Preorder(TreeNode? root)
    {
        var values = new List<int>();
        VisitPreorder(root, values);
        return values;
    }

    public static IReadOnlyList<int> Postorder(TreeNode? root)
    {
        var values = new List<int>();
        VisitPostorder(root, values);
        return values;
    }

    public static IReadOnlyList<IReadOnlyList<int>> LevelOrder(TreeNode? root)
    {
        if (root is null)
            return [];

        var levels = new List<IReadOnlyList<int>>();
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);

        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            var level = new List<int>(levelSize);

            for (int count = 0; count < levelSize; count++)
            {
                TreeNode node = queue.Dequeue();
                level.Add(node.Value);
                if (node.Left is not null) queue.Enqueue(node.Left);
                if (node.Right is not null) queue.Enqueue(node.Right);
            }

            levels.Add(level);
        }

        return levels;
    }

    private static void VisitPreorder(TreeNode? node, List<int> values)
    {
        if (node is null) return;
        values.Add(node.Value);
        VisitPreorder(node.Left, values);
        VisitPreorder(node.Right, values);
    }

    private static void VisitPostorder(TreeNode? node, List<int> values)
    {
        if (node is null) return;
        VisitPostorder(node.Left, values);
        VisitPostorder(node.Right, values);
        values.Add(node.Value);
    }
}
```

**Example:** `var levels = AdditionalTreeTraversals.LevelOrder(root);`

---

### 6.2 BST Operations

[↑ Content](#content)

**Why they exist / problem they solve:** A Binary Search Tree maintains the rule `left < node < right`, allowing search, insertion, and deletion to ignore an entire subtree at each step. It solves the problem of maintaining a dynamic ordered collection, although a balanced BST is needed to guarantee logarithmic performance.

| Operation | Average | Worst (unbalanced) |
|-----------|---------|---------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |

Recursive operations use O(h) call-stack space, where `h` is tree height.

The implementation ignores duplicate insertions, and `LowestCommonAncestor` assumes both requested values exist in the tree.

```csharp
public static class BinarySearchTreeAlgorithms
{
    public static TreeNode? Search(TreeNode? root, int target)
    {
        while (root is not null)
        {
            if (root.Value == target)
                return root;

            root = target < root.Value ? root.Left : root.Right;
        }

        return null;
    }

    public static TreeNode Insert(TreeNode? root, int value)
    {
        if (root is null)
            return new TreeNode(value);

        if (value < root.Value)
            root.Left = Insert(root.Left, value);
        else if (value > root.Value)
            root.Right = Insert(root.Right, value);

        return root;
    }

    public static TreeNode? Delete(TreeNode? root, int value)
    {
        if (root is null)
            return null;

        if (value < root.Value)
            root.Left = Delete(root.Left, value);
        else if (value > root.Value)
            root.Right = Delete(root.Right, value);
        else
        {
            if (root.Left is null) return root.Right;
            if (root.Right is null) return root.Left;

            TreeNode successor = FindMinimum(root.Right);
            root.Value = successor.Value;
            root.Right = Delete(root.Right, successor.Value);
        }

        return root;
    }

    public static bool IsValid(TreeNode? root)
        => IsWithinBounds(root, long.MinValue, long.MaxValue);

    public static TreeNode? LowestCommonAncestor(
        TreeNode? root,
        int firstValue,
        int secondValue)
    {
        while (root is not null)
        {
            if (firstValue < root.Value && secondValue < root.Value)
                root = root.Left;
            else if (firstValue > root.Value && secondValue > root.Value)
                root = root.Right;
            else
                return root;
        }

        return null;
    }

    private static TreeNode FindMinimum(TreeNode node)
    {
        while (node.Left is not null)
            node = node.Left;

        return node;
    }

    private static bool IsWithinBounds(TreeNode? node, long lower, long upper)
    {
        if (node is null)
            return true;

        return node.Value > lower
            && node.Value < upper
            && IsWithinBounds(node.Left, lower, node.Value)
            && IsWithinBounds(node.Right, node.Value, upper);
    }
}
```

**Example:**

```csharp
TreeNode? root = null;
foreach (int value in new[] { 8, 3, 10, 1, 6 })
    root = BinarySearchTreeAlgorithms.Insert(root, value);

bool containsSix = BinarySearchTreeAlgorithms.Search(root, 6) is not null;
bool isValid = BinarySearchTreeAlgorithms.IsValid(root);
```

**Practice:** Validate BST, lowest common ancestor, k-th smallest in BST, convert sorted array to BST.

---

## Part 7: Graph Algorithms

Represent graphs as:

- **Adjacency list** (most common): `graph[u] = new List<int> { v1, v2, ... }`
- **Adjacency matrix** for dense graphs or quick edge lookup

These representations exist because graph performance depends heavily on how edges are stored. An adjacency list uses O(V + E) space and efficiently iterates a vertex's neighbors, while an adjacency matrix uses O(V²) space in exchange for O(1) edge-existence checks.

### 7.1 BFS (Breadth-First Search)

[↑ Content](#content)

**Why it exists / problem it solves:** BFS explores a graph one distance level at a time. This ordering makes it the standard solution for reachability and shortest paths when every edge has equal cost.

| | |
|---|---|
| **Time** | O(V + E) |
| **Space** | O(V) |
| **Use when** | Shortest path in unweighted graph, level-by-level exploration |

```csharp
public static class BreadthFirstSearch
{
    public static IReadOnlyList<int> Traverse(
        IReadOnlyDictionary<int, List<int>> graph,
        int startVertex)
    {
        ArgumentNullException.ThrowIfNull(graph);

        if (!graph.ContainsKey(startVertex))
            throw new ArgumentException("The start vertex is not in the graph.");

        var traversalOrder = new List<int>();
        var visited = new HashSet<int> { startVertex };
        var verticesToVisit = new Queue<int>();
        verticesToVisit.Enqueue(startVertex);

        while (verticesToVisit.Count > 0)
        {
            int currentVertex = verticesToVisit.Dequeue();
            traversalOrder.Add(currentVertex);

            if (!graph.TryGetValue(currentVertex, out List<int>? neighbors))
                continue;

            foreach (int neighbor in neighbors)
            {
                if (visited.Add(neighbor))
                    verticesToVisit.Enqueue(neighbor);
            }
        }

        return traversalOrder;
    }
}
```

**Example:**

```csharp
var graph = new Dictionary<int, List<int>>
{
    [0] = [1, 2],
    [1] = [2],
    [2] = []
};

var order = BreadthFirstSearch.Traverse(graph, startVertex: 0); // [0, 1, 2]
```

**Unweighted shortest-path distances:** BFS records the level at which each vertex is first reached, producing shortest edge counts in O(V + E) time and O(V) space.

```csharp
public static class UnweightedShortestPath
{
    public static IReadOnlyDictionary<int, int> FindDistances(
        IReadOnlyDictionary<int, List<int>> graph,
        int source)
    {
        ArgumentNullException.ThrowIfNull(graph);

        var distances = new Dictionary<int, int> { [source] = 0 };
        var queue = new Queue<int>();
        queue.Enqueue(source);

        while (queue.Count > 0)
        {
            int vertex = queue.Dequeue();
            if (!graph.TryGetValue(vertex, out List<int>? neighbors))
                continue;

            foreach (int neighbor in neighbors)
            {
                if (distances.ContainsKey(neighbor))
                    continue;

                distances[neighbor] = distances[vertex] + 1;
                queue.Enqueue(neighbor);
            }
        }

        return distances;
    }
}
```

**Example:** `var distances = UnweightedShortestPath.FindDistances(graph, 0);`

---

### 7.2 DFS (Depth-First Search)

[↑ Content](#content)

**Why it exists / problem it solves:** DFS follows one path as deeply as possible before backtracking. It is useful when a problem requires complete exploration, structural analysis, cycle detection, connected components, or trying choices recursively.

| | |
|---|---|
| **Time** | O(V + E) |
| **Space** | O(V) |
| **Use when** | Connectivity, cycles, topological sort, backtracking on graphs |

```csharp
public static class DepthFirstSearch
{
    public static IReadOnlyList<int> Traverse(
        IReadOnlyDictionary<int, List<int>> graph,
        int startVertex)
    {
        ArgumentNullException.ThrowIfNull(graph);

        if (!graph.ContainsKey(startVertex))
            throw new ArgumentException("The start vertex is not in the graph.");

        var traversalOrder = new List<int>();
        var visited = new HashSet<int>();
        Visit(graph, startVertex, visited, traversalOrder);
        return traversalOrder;
    }

    private static void Visit(
        IReadOnlyDictionary<int, List<int>> graph,
        int currentVertex,
        HashSet<int> visited,
        List<int> traversalOrder)
    {
        if (!visited.Add(currentVertex))
            return;

        traversalOrder.Add(currentVertex);

        if (!graph.TryGetValue(currentVertex, out List<int>? neighbors))
            return;

        foreach (int neighbor in neighbors)
            Visit(graph, neighbor, visited, traversalOrder);
    }
}
```

**Example:**

```csharp
var graph = new Dictionary<int, List<int>>
{
    [0] = [1, 2],
    [1] = [2],
    [2] = []
};

var order = DepthFirstSearch.Traverse(graph, startVertex: 0); // [0, 1, 2]
```

**Iterative DFS** uses an explicit `Stack<T>` to solve the same exploration problems without relying on the program's call stack. It is safer than recursive DFS for very deep graphs, where recursion could cause a stack overflow.

```csharp
public static class IterativeDepthFirstSearch
{
    public static IReadOnlyList<int> Traverse(
        IReadOnlyDictionary<int, List<int>> graph,
        int start)
    {
        ArgumentNullException.ThrowIfNull(graph);

        var order = new List<int>();
        var visited = new HashSet<int>();
        var stack = new Stack<int>();
        stack.Push(start);

        while (stack.Count > 0)
        {
            int vertex = stack.Pop();
            if (!visited.Add(vertex))
                continue;

            order.Add(vertex);

            if (!graph.TryGetValue(vertex, out List<int>? neighbors))
                continue;

            for (int index = neighbors.Count - 1; index >= 0; index--)
            {
                if (!visited.Contains(neighbors[index]))
                    stack.Push(neighbors[index]);
            }
        }

        return order;
    }
}
```

**Connected components:** Repeating DFS from every unvisited vertex groups an undirected graph in O(V + E) time and O(V) space.

The adjacency list must represent undirected edges in both directions.

```csharp
public static class ConnectedComponentsAlgorithm
{
    public static IReadOnlyList<IReadOnlyList<int>> Find(
        IReadOnlyDictionary<int, List<int>> graph)
    {
        ArgumentNullException.ThrowIfNull(graph);

        var visited = new HashSet<int>();
        var components = new List<IReadOnlyList<int>>();

        foreach (int start in graph.Keys)
        {
            if (visited.Contains(start))
                continue;

            var component = new List<int>();
            var stack = new Stack<int>();
            stack.Push(start);

            while (stack.Count > 0)
            {
                int vertex = stack.Pop();
                if (!visited.Add(vertex))
                    continue;

                component.Add(vertex);
                if (!graph.TryGetValue(vertex, out List<int>? neighbors))
                    continue;

                foreach (int neighbor in neighbors)
                    stack.Push(neighbor);
            }

            components.Add(component);
        }

        return components;
    }
}
```

---

### 7.3 Topological Sort

[↑ Content](#content)

**Why it exists / problem it solves:** Topological Sort creates a valid linear order from dependencies in a directed acyclic graph (DAG). It solves questions such as which course, task, or build target must be completed before another and also detects when cyclic dependencies make an order impossible.

**Use when:** Dependencies, build order, course schedule.

- **Kahn's algorithm (BFS + in-degree):** Repeatedly processes vertices with no remaining prerequisites. If it cannot process every vertex, the graph contains a cycle.
- **DFS post-order reverse:** Adds each vertex after all of its dependencies have been explored, then reverses the result. It provides a natural topological order when DFS is already being used.

**Time:** O(V + E). **Space:** O(V).

```csharp
public static class TopologicalSortAlgorithm
{
    public static IReadOnlyList<int> Sort(
        IReadOnlyDictionary<int, List<int>> graph)
    {
        ArgumentNullException.ThrowIfNull(graph);

        var inDegree = new Dictionary<int, int>();

        foreach (var (vertex, neighbors) in graph)
        {
            inDegree.TryAdd(vertex, 0);
            foreach (int neighbor in neighbors)
                inDegree[neighbor] = inDegree.GetValueOrDefault(neighbor) + 1;
        }

        var ready = new Queue<int>(
            inDegree.Where(pair => pair.Value == 0).Select(pair => pair.Key));
        var order = new List<int>(inDegree.Count);

        while (ready.Count > 0)
        {
            int vertex = ready.Dequeue();
            order.Add(vertex);

            if (!graph.TryGetValue(vertex, out List<int>? neighbors))
                continue;

            foreach (int neighbor in neighbors)
            {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0)
                    ready.Enqueue(neighbor);
            }
        }

        if (order.Count != inDegree.Count)
            throw new InvalidOperationException("The graph contains a cycle.");

        return order;
    }
}
```

**Example:** `var buildOrder = TopologicalSortAlgorithm.Sort(dependencyGraph);`

**Practice:** Course schedule I/II, alien dictionary.

---

### 7.4 Shortest Path

[↑ Content](#content)

**Why these algorithms exist / problem they solve:** Shortest-path algorithms find the minimum-cost route between vertices, but different edge rules require different methods. Choosing the correct algorithm prevents incorrect results and avoids unnecessary work.

| Algorithm | When |
|-----------|------|
| BFS | Unweighted edges |
| Dijkstra | Non-negative weights |
| Bellman-Ford | Negative weights allowed |
| Floyd-Warshall | All pairs (small V) |

- **BFS:** Finds the path with the fewest edges in an unweighted graph by exploring vertices level by level.
- **Dijkstra:** Finds shortest paths from one source when all edge weights are non-negative by always expanding the currently cheapest known route.
- **Bellman-Ford:** Supports negative edge weights by repeatedly relaxing every edge and can detect a reachable negative cycle.
- **Floyd-Warshall:** Computes shortest paths between every pair of vertices using dynamic programming, trading O(V³) time for a simple all-pairs solution.

**Dijkstra template (`PriorityQueue<TElement, TPriority>`):**

With a binary heap, **time is O((V + E) log V)** and **space is O(V + E)** including the graph.

```csharp
public static class DijkstraShortestPath
{
    public static IReadOnlyDictionary<int, long> FindDistances(
        IReadOnlyDictionary<int, List<(int Neighbor, int Weight)>> graph,
        int sourceVertex)
    {
        ArgumentNullException.ThrowIfNull(graph);

        if (!graph.ContainsKey(sourceVertex))
            throw new ArgumentException("The source vertex is not in the graph.");

        var distanceByVertex = new Dictionary<int, long>
        {
            [sourceVertex] = 0
        };
        var verticesByDistance = new PriorityQueue<int, long>();
        verticesByDistance.Enqueue(sourceVertex, 0);

        while (verticesByDistance.TryDequeue(
            out int currentVertex,
            out long queuedDistance))
        {
            if (queuedDistance > distanceByVertex[currentVertex])
                continue;

            if (!graph.TryGetValue(
                currentVertex,
                out List<(int Neighbor, int Weight)>? neighbors))
            {
                continue;
            }

            foreach (var (neighbor, weight) in neighbors)
            {
                if (weight < 0)
                    throw new ArgumentException(
                        "Dijkstra's algorithm requires non-negative weights.");

                long candidateDistance = queuedDistance + weight;

                if (!distanceByVertex.TryGetValue(neighbor, out long knownDistance)
                    || candidateDistance < knownDistance)
                {
                    distanceByVertex[neighbor] = candidateDistance;
                    verticesByDistance.Enqueue(neighbor, candidateDistance);
                }
            }
        }

        return distanceByVertex;
    }
}
```

**Example:**

```csharp
var weightedGraph = new Dictionary<int, List<(int Neighbor, int Weight)>>
{
    [0] = [(1, 4), (2, 1)],
    [1] = [(3, 1)],
    [2] = [(1, 2), (3, 5)],
    [3] = []
};

var distances =
    DijkstraShortestPath.FindDistances(weightedGraph, sourceVertex: 0);
// 0 → 0, 1 → 3, 2 → 1, 3 → 4
```

---

### 7.5 Union-Find (Disjoint Set Union)

[↑ Content](#content)

**Why it exists / problem it solves:** Union-Find efficiently tracks which items belong to the same connected group while groups are being merged. It avoids rerunning a complete graph traversal after every new connection, making it useful for dynamic connectivity and Kruskal's minimum spanning tree algorithm.

**Use when:** Connected components, Kruskal's MST, "are u and v in same group?"

**Kruskal's minimum spanning tree:** Sorts edges by weight and adds the cheapest edge that does not create a cycle. It solves the problem of connecting every vertex with minimum total edge cost, while Union-Find performs the cycle checks efficiently.

Union-Find operations are effectively O(1) amortized (`O(α(n))`) with path compression and union by rank; storage is O(n).

```csharp
public sealed class UnionFind
{
    private readonly int[] parent;
    private readonly int[] rank;

    public UnionFind(int size)
    {
        if (size < 0)
            throw new ArgumentOutOfRangeException(nameof(size));

        parent = Enumerable.Range(0, size).ToArray();
        rank = new int[size];
    }

    public int Find(int item)
    {
        ValidateItem(item);

        if (parent[item] != item)
            parent[item] = Find(parent[item]); // Path compression

        return parent[item];
    }

    public bool Union(int firstItem, int secondItem)
    {
        int firstRoot = Find(firstItem);
        int secondRoot = Find(secondItem);

        if (firstRoot == secondRoot)
            return false;

        if (rank[firstRoot] < rank[secondRoot])
            (firstRoot, secondRoot) = (secondRoot, firstRoot);

        parent[secondRoot] = firstRoot; // Union by rank

        if (rank[firstRoot] == rank[secondRoot])
            rank[firstRoot]++;

        return true;
    }

    public bool AreConnected(int firstItem, int secondItem)
        => Find(firstItem) == Find(secondItem);

    private void ValidateItem(int item)
    {
        if ((uint)item >= (uint)parent.Length)
            throw new ArgumentOutOfRangeException(nameof(item));
    }
}
```

**Example:**

```csharp
var groups = new UnionFind(size: 5);
groups.Union(0, 1);
bool connected = groups.AreConnected(0, 1); // true
```

**Kruskal's minimum spanning tree:** Sort edges by weight and accept an edge only when it joins two previously separate components.

**Time:** O(E log E). **Space:** O(V + E).

```csharp
public readonly record struct WeightedEdge(int From, int To, int Weight);

public static class KruskalMinimumSpanningTree
{
    public static IReadOnlyList<WeightedEdge> Find(
        int vertexCount,
        IEnumerable<WeightedEdge> edges)
    {
        if (vertexCount < 0)
            throw new ArgumentOutOfRangeException(nameof(vertexCount));
        ArgumentNullException.ThrowIfNull(edges);

        var groups = new UnionFind(vertexCount);
        var tree = new List<WeightedEdge>();

        foreach (WeightedEdge edge in edges.OrderBy(edge => edge.Weight))
        {
            if (edge.From < 0 || edge.From >= vertexCount
                || edge.To < 0 || edge.To >= vertexCount)
            {
                throw new ArgumentException("An edge contains an invalid vertex.");
            }

            if (groups.Union(edge.From, edge.To))
                tree.Add(edge);
        }

        if (vertexCount > 0 && tree.Count != vertexCount - 1)
            throw new InvalidOperationException("The graph is disconnected.");

        return tree;
    }
}
```

**Example:** `var tree = KruskalMinimumSpanningTree.Find(3, [new(0, 1, 4), new(1, 2, 2), new(0, 2, 5)]);`

**Practice:** Number of islands, redundant connection, accounts merge.

---

## Part 8: Heap / Priority Queue

**Why it exists / problem it solves:** A heap keeps the highest- or lowest-priority item available without fully sorting all items after every update. It solves problems that repeatedly need the current minimum or maximum, such as scheduling, Top K queries, streaming data, and Dijkstra's algorithm.

| | |
|---|---|
| **Operations** | insert O(log n), extract-min/max O(log n), peek O(1) |
| **Use when** | Top K elements, merge K sorted lists, scheduling, Dijkstra |

### 8.1 Top K Frequent Elements

[↑ Content](#content)

**Why it exists / problem it solves:** A bounded min-heap keeps only the most frequent candidates instead of sorting every distinct value.

**Time:** O(n + u log k), where `u` is the distinct-value count. **Space:** O(u + k).

```csharp
public static class TopKFrequentAlgorithm
{
    public static int[] Find(int[] numbers, int count)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        var frequencyByNumber = new Dictionary<int, int>();

        foreach (int number in numbers)
        {
            frequencyByNumber[number] =
                frequencyByNumber.GetValueOrDefault(number) + 1;
        }

        if (count < 0 || count > frequencyByNumber.Count)
            throw new ArgumentOutOfRangeException(nameof(count));

        var mostFrequent = new PriorityQueue<int, int>();

        foreach (var (number, frequency) in frequencyByNumber)
        {
            mostFrequent.Enqueue(number, frequency);

            if (mostFrequent.Count > count)
                mostFrequent.Dequeue();
        }

        var result = new int[count];

        for (int index = count - 1; index >= 0; index--)
            result[index] = mostFrequent.Dequeue();

        return result;
    }
}
```

**Example:** `int[] topTwo = TopKFrequentAlgorithm.Find([1, 1, 1, 2, 2, 3], count: 2);`

### 8.2 K-th Largest with a Bounded Heap

[↑ Content](#content)

**Why it exists / problem it solves:** A min-heap of size `k` keeps only the `k` largest values seen so far. Its root is therefore the k-th largest value, avoiding a full sort.

**Time:** O(n log k). **Space:** O(k).

```csharp
public static class KthLargestHeapAlgorithm
{
    public static int Find(int[] numbers, int k)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        if (k < 1 || k > numbers.Length)
            throw new ArgumentOutOfRangeException(nameof(k));

        var largestValues = new PriorityQueue<int, int>();

        foreach (int number in numbers)
        {
            largestValues.Enqueue(number, number);
            if (largestValues.Count > k)
                largestValues.Dequeue();
        }

        return largestValues.Peek();
    }
}
```

**Example:** `int secondLargest = KthLargestHeapAlgorithm.Find([3, 2, 1, 5, 6, 4], 2); // 5`

**Practice:** Kth largest in stream, find median from data stream, meeting rooms II.

---

## Part 9: String Algorithms

### 9.1 Basic Techniques

[↑ Content](#content)

String algorithms exist because repeatedly comparing characters can become expensive, especially for long text or many queries. Each technique exploits a different property of the problem:

- **Frequency arrays / hash maps:** Count characters so anagrams, duplicates, and character requirements can be checked without repeatedly scanning both strings.
- **Two pointers on strings:** Compare or transform characters from two positions, which solves palindrome checks, subsequence matching, and in-place-style scans efficiently.
- <a id="rolling-hash--rabin-karp"></a>**Rolling hash (Rabin-Karp idea):** Updates a substring's hash as the window moves, allowing candidate pattern matches to be found without comparing every character at every position.
- <a id="prefix-function--kmp"></a>**Prefix function / KMP:** Reuses information from earlier partial matches so substring search does not restart from the next text character after a mismatch.

### 9.2 Anagram with Frequency Counting

[↑ Content](#content)

**Why it exists / problem it solves:** Two strings are anagrams when every character occurs the same number of times. Counting avoids sorting and makes the comparison linear.

**Time:** O(n + m). **Space:** O(k), where `k` is the number of distinct characters.

```csharp
public static class AnagramAlgorithm
{
    public static bool AreAnagrams(string first, string second)
    {
        ArgumentNullException.ThrowIfNull(first);
        ArgumentNullException.ThrowIfNull(second);

        if (first.Length != second.Length)
            return false;

        var counts = new Dictionary<char, int>();

        foreach (char character in first)
            counts[character] = counts.GetValueOrDefault(character) + 1;

        foreach (char character in second)
        {
            if (!counts.TryGetValue(character, out int count))
                return false;

            if (count == 1)
                counts.Remove(character);
            else
                counts[character] = count - 1;
        }

        return counts.Count == 0;
    }
}
```

**Example:** `bool result = AnagramAlgorithm.AreAnagrams("listen", "silent"); // true`

### 9.3 Palindrome with Two Pointers

[↑ Content](#content)

**Why it exists / problem it solves:** Comparing characters from both ends verifies symmetry without creating a reversed copy. This version ignores punctuation and letter case.

**Time:** O(n). **Space:** O(1).

```csharp
public static class PalindromeAlgorithm
{
    public static bool IsPalindrome(string text)
    {
        ArgumentNullException.ThrowIfNull(text);

        int left = 0;
        int right = text.Length - 1;

        while (left < right)
        {
            while (left < right && !char.IsLetterOrDigit(text[left]))
                left++;
            while (left < right && !char.IsLetterOrDigit(text[right]))
                right--;

            if (char.ToUpperInvariant(text[left])
                != char.ToUpperInvariant(text[right]))
            {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
}
```

**Example:** `bool result = PalindromeAlgorithm.IsPalindrome("A man, a plan, a canal: Panama"); // true`

### 9.4 Common Problems

[↑ Content](#content)

| Problem type | Approach |
|--------------|----------|
| Anagram | Sort or frequency count |
| Palindrome | Two pointers |
| Substring search | Sliding window, KMP for heavy cases |
| Prefix matching | Trie |

### 9.5 Trie (Prefix Tree)

[↑ Content](#content)

**Why it exists / problem it solves:** A Trie stores strings by shared prefixes, so lookup time depends on the word length rather than the number of stored words. It is designed for prefix queries such as autocomplete, dictionaries, and spell-checking.

Insert, exact search, and prefix search take **O(m) time**, where `m` is the input length. Storage is proportional to the total number of stored characters.

```csharp
public sealed class Trie
{
    private readonly TrieNode root = new();

    public void Insert(string word)
    {
        ArgumentNullException.ThrowIfNull(word);

        TrieNode currentNode = root;

        foreach (char character in word)
        {
            if (!currentNode.Children.TryGetValue(
                character,
                out TrieNode? childNode))
            {
                childNode = new TrieNode();
                currentNode.Children[character] = childNode;
            }

            currentNode = childNode;
        }

        currentNode.IsCompleteWord = true;
    }

    public bool Contains(string word)
    {
        TrieNode? node = FindNode(word);
        return node?.IsCompleteWord == true;
    }

    public bool StartsWith(string prefix) => FindNode(prefix) is not null;

    private TrieNode? FindNode(string text)
    {
        ArgumentNullException.ThrowIfNull(text);

        TrieNode currentNode = root;

        foreach (char character in text)
        {
            if (!currentNode.Children.TryGetValue(
                character,
                out TrieNode? childNode))
            {
                return null;
            }

            currentNode = childNode;
        }

        return currentNode;
    }

    private sealed class TrieNode
    {
        public Dictionary<char, TrieNode> Children { get; } = [];
        public bool IsCompleteWord { get; set; }
    }
}
```

**Example:**

```csharp
var words = new Trie();
words.Insert("apple");
bool hasWord = words.Contains("apple");      // true
bool hasPrefix = words.StartsWith("app");    // true
```

**Practice:** Implement autocomplete, word search II, longest common prefix.

---

## Part 10: Classic Misc Algorithms

These algorithms solve recurring problems substantially faster or with less memory than straightforward brute-force approaches.

| Algorithm | Why it exists / problem it solves |
|-----------|------------------------------------|
| **Kadane's** | Finds the maximum sum of a contiguous subarray in O(n), avoiding enumeration of every possible subarray. |
| **Floyd's cycle detection** | Detects a cycle in a linked structure using two moving pointers and O(1) extra space, avoiding a visited set. |
| **Fast exponentiation** | Computes `aⁿ` in O(log n) multiplications by repeatedly squaring, instead of multiplying `a` exactly `n` times. |
| **GCD (Euclidean)** | Finds the greatest common divisor by repeatedly replacing a pair with the divisor and remainder, supporting fraction reduction and divisibility problems efficiently. |
| **Sieve of Eratosthenes** | Finds all primes up to `n` together by marking composite multiples, avoiding a separate primality test for every number. |

### 10.1 Kadane's Algorithm

[↑ Content](#content)

**Time:** O(n). **Space:** O(1).

```csharp
public static class KadanesAlgorithm
{
    public static long FindMaximumSubarraySum(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        if (numbers.Length == 0)
            throw new ArgumentException("The array must not be empty.");

        long bestSumEndingHere = numbers[0];
        long bestSumOverall = numbers[0];

        for (int index = 1; index < numbers.Length; index++)
        {
            bestSumEndingHere = Math.Max(
                numbers[index],
                bestSumEndingHere + numbers[index]);

            bestSumOverall = Math.Max(bestSumOverall, bestSumEndingHere);
        }

        return bestSumOverall;
    }
}
```

**Example:** `long maximumSum = KadanesAlgorithm.FindMaximumSubarraySum([-2, 1, -3, 4, -1, 2, 1]); // 6`

### 10.2 Floyd's Cycle Detection

[↑ Content](#content)

Floyd's fast/slow-pointer algorithm detects a cycle in O(n) time and O(1) space. The canonical, copy-ready implementation is in [Part 11.3: Floyd's Cycle Detection](#113-floyds-cycle-detection), where the linked-list node model is defined.

### 10.3 Fast Exponentiation

[↑ Content](#content)

**Why it exists / problem it solves:** Repeated squaring reduces exponentiation from O(exponent) multiplications to O(log exponent). It is useful for large powers and modular arithmetic.

**Time:** O(log exponent). **Space:** O(1).

```csharp
public static class FastExponentiationAlgorithm
{
    public static long Power(long value, int exponent)
    {
        if (exponent < 0)
            throw new ArgumentOutOfRangeException(nameof(exponent));

        long result = 1;
        long factor = value;

        while (exponent > 0)
        {
            if ((exponent & 1) == 1)
                result = checked(result * factor);

            exponent >>= 1;
            if (exponent > 0)
                factor = checked(factor * factor);
        }

        return result;
    }
}
```

**Example:** `long value = FastExponentiationAlgorithm.Power(3, 5); // 243`

### 10.4 Euclidean GCD and LCM

[↑ Content](#content)

**Why it exists / problem it solves:** The Euclidean algorithm finds a greatest common divisor without factoring either number. GCD and LCM support ratios, fractions, periodic schedules, and divisibility checks.

**Time:** O(log(min(a, b))). **Space:** O(1).

```csharp
public static class GreatestCommonDivisorAlgorithm
{
    public static ulong Gcd(long first, long second)
    {
        ulong left = Magnitude(first);
        ulong right = Magnitude(second);

        while (right != 0)
        {
            (left, right) = (right, left % right);
        }

        return left;
    }

    public static ulong Lcm(long first, long second)
    {
        ulong left = Magnitude(first);
        ulong right = Magnitude(second);

        if (left == 0 || right == 0)
            return 0;

        return checked(left / Gcd(first, second) * right);
    }

    private static ulong Magnitude(long value)
        => value >= 0
            ? (ulong)value
            : (ulong)(-(value + 1)) + 1;
}
```

**Example:** `ulong gcd = GreatestCommonDivisorAlgorithm.Gcd(54, 24); // 6`

### 10.5 Sieve of Eratosthenes

[↑ Content](#content)

**Why it exists / problem it solves:** Testing every number independently repeats divisibility work. The sieve marks multiples in one shared pass to generate all primes up to a limit.

**Time:** O(n log log n). **Space:** O(n).

```csharp
public static class SieveOfEratosthenesAlgorithm
{
    public static int[] FindPrimes(int maximum)
    {
        if (maximum < 0)
            throw new ArgumentOutOfRangeException(nameof(maximum));
        if (maximum < 2)
            return [];

        var isPrime = Enumerable.Repeat(true, maximum + 1).ToArray();
        isPrime[0] = false;
        isPrime[1] = false;

        for (int candidate = 2; candidate <= maximum / candidate; candidate++)
        {
            if (!isPrime[candidate])
                continue;

            for (int multiple = candidate * candidate;
                 multiple <= maximum;
                 multiple += candidate)
            {
                isPrime[multiple] = false;
            }
        }

        return Enumerable.Range(2, maximum - 1)
            .Where(number => isPrime[number])
            .ToArray();
    }
}
```

**Example:** `int[] primes = SieveOfEratosthenesAlgorithm.FindPrimes(10); // [2, 3, 5, 7]`

### 10.6 Prefix Sums

[↑ Content](#content)

**Why it exists / problem it solves:** A prefix-sum array performs one preprocessing pass so repeated range-sum queries can be answered without rescanning each range.

**Build time:** O(n). **Query time:** O(1). **Space:** O(n).

```csharp
public sealed class PrefixSum
{
    private readonly long[] prefix;

    public PrefixSum(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        prefix = new long[numbers.Length + 1];
        for (int index = 0; index < numbers.Length; index++)
            prefix[index + 1] = prefix[index] + numbers[index];
    }

    public long RangeSum(int startInclusive, int endExclusive)
    {
        if (startInclusive < 0
            || endExclusive < startInclusive
            || endExclusive >= prefix.Length)
        {
            throw new ArgumentOutOfRangeException();
        }

        return prefix[endExclusive] - prefix[startInclusive];
    }
}
```

**Example:** `var sums = new PrefixSum([2, 4, 6, 8]); long range = sums.RangeSum(1, 3); // 10`

---

## Part 11: Linked List Algorithms

Linked-list algorithms build pointer-manipulation skills for data that is connected by references rather than stored contiguously.

**Shared node type:**

```csharp
public sealed class ListNode
{
    public ListNode(int value, ListNode? next = null)
    {
        Value = value;
        Next = next;
    }

    public int Value { get; set; }
    public ListNode? Next { get; set; }
}
```

### 11.1 Reverse a Singly Linked List

[↑ Content](#content)

**Why it exists / problem it solves:** Reversal changes link direction without allocating another list. The same pointer-rewiring technique appears in list transformations and in-place data processing.

**Time:** O(n). **Space:** O(1).

```csharp
public static class ReverseLinkedListAlgorithm
{
    public static ListNode? Reverse(ListNode? head)
    {
        ListNode? previous = null;
        ListNode? current = head;

        while (current is not null)
        {
            ListNode? next = current.Next;
            current.Next = previous;
            previous = current;
            current = next;
        }

        return previous;
    }
}
```

**Example:** `ListNode? reversed = ReverseLinkedListAlgorithm.Reverse(new ListNode(1, new ListNode(2, new ListNode(3))));`

### 11.2 Find the Middle Node

[↑ Content](#content)

**Why it exists / problem it solves:** A fast pointer moving twice as quickly as a slow pointer locates the middle in one pass without first counting nodes.

**Time:** O(n). **Space:** O(1).

```csharp
public static class MiddleLinkedListNodeAlgorithm
{
    public static ListNode? Find(ListNode? head)
    {
        ListNode? slow = head;
        ListNode? fast = head;

        while (fast?.Next is not null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;
        }

        return slow;
    }
}
```

**Example:** `ListNode? middle = MiddleLinkedListNodeAlgorithm.Find(head);`

### 11.3 Floyd's Cycle Detection

[↑ Content](#content)

**Why it exists / problem it solves:** A slow and fast pointer must eventually meet if a linked list contains a cycle. This detects cycles without the O(n) memory required by a visited set.

**Time:** O(n). **Space:** O(1).

```csharp
public static class LinkedListCycleAlgorithm
{
    public static bool HasCycle(ListNode? head)
    {
        ListNode? slow = head;
        ListNode? fast = head;

        while (fast?.Next is not null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;

            if (ReferenceEquals(slow, fast))
                return true;
        }

        return false;
    }
}
```

**Example:**

```csharp
var first = new ListNode(1);
var second = new ListNode(2);
first.Next = second;
second.Next = first;
bool hasCycle = LinkedListCycleAlgorithm.HasCycle(first); // true
```

### 11.4 Merge Two Sorted Linked Lists

[↑ Content](#content)

**Why it exists / problem it solves:** Merging combines two ordered streams without sorting them again. It is the central combine step of Merge Sort for linked lists.

**Time:** O(n + m). **Space:** O(1) auxiliary.

```csharp
public static class MergeSortedLinkedListsAlgorithm
{
    public static ListNode? Merge(ListNode? first, ListNode? second)
    {
        var sentinel = new ListNode(0);
        ListNode tail = sentinel;

        while (first is not null && second is not null)
        {
            if (first.Value <= second.Value)
            {
                tail.Next = first;
                first = first.Next;
            }
            else
            {
                tail.Next = second;
                second = second.Next;
            }

            tail = tail.Next;
        }

        tail.Next = first ?? second;
        return sentinel.Next;
    }
}
```

**Example:** `ListNode? merged = MergeSortedLinkedListsAlgorithm.Merge(firstSortedList, secondSortedList);`

---

## Part 12: Dynamic Programming

Dynamic programming solves problems with overlapping subproblems by storing earlier results instead of recomputing them.

### 12.1 Climbing Stairs

[↑ Content](#content)

**Why it exists / problem it solves:** This is the smallest useful DP model: the number of ways to reach a step depends on the two preceding steps. It teaches state transitions and space optimization.

**Time:** O(n). **Space:** O(1).

```csharp
public static class ClimbingStairsAlgorithm
{
    public static long CountWays(int stepCount)
    {
        if (stepCount < 0)
            throw new ArgumentOutOfRangeException(nameof(stepCount));

        if (stepCount <= 1)
            return 1;

        long twoStepsBack = 1;
        long oneStepBack = 1;

        for (int step = 2; step <= stepCount; step++)
        {
            long current = checked(oneStepBack + twoStepsBack);
            twoStepsBack = oneStepBack;
            oneStepBack = current;
        }

        return oneStepBack;
    }
}
```

**Example:** `long ways = ClimbingStairsAlgorithm.CountWays(5); // 8`

### 12.2 Coin Change

[↑ Content](#content)

**Why it exists / problem it solves:** Coin Change finds the fewest reusable choices needed to reach a target. It models resource allocation, denomination, and minimum-step problems.

**Time:** O(amount × number of coins). **Space:** O(amount).

```csharp
public static class CoinChangeAlgorithm
{
    public static int MinimumCoins(int[] coins, int amount)
    {
        ArgumentNullException.ThrowIfNull(coins);

        if (amount < 0)
            throw new ArgumentOutOfRangeException(nameof(amount));
        if (coins.Any(coin => coin <= 0))
            throw new ArgumentException("Coin values must be positive.");

        int unreachable = amount + 1;
        int[] minimum = Enumerable.Repeat(unreachable, amount + 1).ToArray();
        minimum[0] = 0;

        for (int currentAmount = 1; currentAmount <= amount; currentAmount++)
        {
            foreach (int coin in coins)
            {
                if (coin <= currentAmount)
                {
                    minimum[currentAmount] = Math.Min(
                        minimum[currentAmount],
                        minimum[currentAmount - coin] + 1);
                }
            }
        }

        return minimum[amount] == unreachable ? -1 : minimum[amount];
    }
}
```

**Example:** `int minimum = CoinChangeAlgorithm.MinimumCoins([1, 2, 5], 11); // 3`

### 12.3 Longest Common Subsequence

[↑ Content](#content)

**Why it exists / problem it solves:** LCS finds the longest ordered sequence shared by two inputs even when characters are skipped. It underpins diff tools, sequence comparison, and version analysis.

**Time:** O(n × m). **Space:** O(n × m).

```csharp
public static class LongestCommonSubsequenceAlgorithm
{
    public static int FindLength(string first, string second)
    {
        ArgumentNullException.ThrowIfNull(first);
        ArgumentNullException.ThrowIfNull(second);

        var lengths = new int[first.Length + 1, second.Length + 1];

        for (int firstIndex = 1; firstIndex <= first.Length; firstIndex++)
        {
            for (int secondIndex = 1; secondIndex <= second.Length; secondIndex++)
            {
                lengths[firstIndex, secondIndex] =
                    first[firstIndex - 1] == second[secondIndex - 1]
                        ? lengths[firstIndex - 1, secondIndex - 1] + 1
                        : Math.Max(
                            lengths[firstIndex - 1, secondIndex],
                            lengths[firstIndex, secondIndex - 1]);
            }
        }

        return lengths[first.Length, second.Length];
    }
}
```

**Example:** `int length = LongestCommonSubsequenceAlgorithm.FindLength("abcde", "ace"); // 3`

### 12.4 Edit Distance

[↑ Content](#content)

**Why it exists / problem it solves:** Edit Distance measures how many insertions, deletions, and replacements transform one string into another. It supports fuzzy matching, spell checking, and similarity scoring.

**Time:** O(n × m). **Space:** O(n × m).

```csharp
public static class EditDistanceAlgorithm
{
    public static int Calculate(string source, string target)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(target);

        var distance = new int[source.Length + 1, target.Length + 1];

        for (int sourceLength = 0; sourceLength <= source.Length; sourceLength++)
            distance[sourceLength, 0] = sourceLength;

        for (int targetLength = 0; targetLength <= target.Length; targetLength++)
            distance[0, targetLength] = targetLength;

        for (int sourceIndex = 1; sourceIndex <= source.Length; sourceIndex++)
        {
            for (int targetIndex = 1; targetIndex <= target.Length; targetIndex++)
            {
                if (source[sourceIndex - 1] == target[targetIndex - 1])
                {
                    distance[sourceIndex, targetIndex] =
                        distance[sourceIndex - 1, targetIndex - 1];
                }
                else
                {
                    int insert = distance[sourceIndex, targetIndex - 1];
                    int delete = distance[sourceIndex - 1, targetIndex];
                    int replace = distance[sourceIndex - 1, targetIndex - 1];
                    distance[sourceIndex, targetIndex] =
                        1 + Math.Min(insert, Math.Min(delete, replace));
                }
            }
        }

        return distance[source.Length, target.Length];
    }
}
```

**Example:** `int edits = EditDistanceAlgorithm.Calculate("kitten", "sitting"); // 3`

---

## Part 13: Greedy Algorithms

Greedy algorithms commit to the best local choice when the problem structure guarantees that this produces a globally optimal result.

### 13.1 Merge Intervals

[↑ Content](#content)

**Why it exists / problem it solves:** Overlapping ranges often represent the same continuous reservation, event, or coverage period. Sorting by start time makes every possible overlap adjacent.

**Time:** O(n log n). **Space:** O(n).

```csharp
public static class MergeIntervalsAlgorithm
{
    public static int[][] Merge(int[][] intervals)
    {
        ArgumentNullException.ThrowIfNull(intervals);

        if (intervals.Any(interval => interval is null || interval.Length != 2))
            throw new ArgumentException("Every interval must contain start and end.");
        if (intervals.Any(interval => interval[0] > interval[1]))
            throw new ArgumentException("An interval start must not exceed its end.");
        if (intervals.Length == 0)
            return [];

        int[][] sorted = intervals
            .Select(interval => new[] { interval[0], interval[1] })
            .OrderBy(interval => interval[0])
            .ToArray();

        var merged = new List<int[]> { sorted[0] };

        for (int index = 1; index < sorted.Length; index++)
        {
            int[] previous = merged[^1];
            int[] current = sorted[index];

            if (current[0] <= previous[1])
                previous[1] = Math.Max(previous[1], current[1]);
            else
                merged.Add(current);
        }

        return [.. merged];
    }
}
```

**Example:** `int[][] merged = MergeIntervalsAlgorithm.Merge([[1, 3], [2, 6], [8, 10]]); // [1,6], [8,10]`

### 13.2 Activity Selection

[↑ Content](#content)

**Why it exists / problem it solves:** Selecting the activity that finishes earliest leaves the most room for future activities. This maximizes the number of non-overlapping intervals.

**Time:** O(n log n). **Space:** O(n).

```csharp
public static class ActivitySelectionAlgorithm
{
    public static IReadOnlyList<(int Start, int End)> SelectMaximum(
        IEnumerable<(int Start, int End)> activities)
    {
        ArgumentNullException.ThrowIfNull(activities);

        var ordered = activities.ToArray();
        if (ordered.Any(activity => activity.Start > activity.End))
            throw new ArgumentException("An activity start must not exceed its end.");

        ordered = ordered.OrderBy(activity => activity.End).ToArray();
        var selected = new List<(int Start, int End)>();
        int lastEnd = int.MinValue;

        foreach (var activity in ordered)
        {
            if (activity.Start < lastEnd)
                continue;

            selected.Add(activity);
            lastEnd = activity.End;
        }

        return selected;
    }
}
```

**Example:** `var selected = ActivitySelectionAlgorithm.SelectMaximum([(1, 3), (2, 5), (4, 7)]);`

---

## Part 14: Backtracking

Backtracking explores a decision tree with a reusable cycle: choose, explore, then undo the choice before trying the next option.

### 14.1 Subsets

[↑ Content](#content)

**Why it exists / problem it solves:** Subset generation must represent every include/exclude choice. Backtracking builds each result incrementally without manually writing nested loops.

**Time:** O(n × 2ⁿ), including copied output. **Space:** O(n) recursion depth, excluding results.

The example assumes the input values are distinct.

```csharp
public static class SubsetsAlgorithm
{
    public static IReadOnlyList<IReadOnlyList<int>> Generate(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        var results = new List<IReadOnlyList<int>>();
        var current = new List<int>();
        Explore(0);
        return results;

        void Explore(int startIndex)
        {
            results.Add(current.ToArray());

            for (int index = startIndex; index < numbers.Length; index++)
            {
                current.Add(numbers[index]); // Choose
                Explore(index + 1);          // Explore
                current.RemoveAt(current.Count - 1); // Undo
            }
        }
    }
}
```

**Example:** `var subsets = SubsetsAlgorithm.Generate([1, 2]); // [], [1], [1,2], [2]`

### 14.2 Permutations

[↑ Content](#content)

**Why it exists / problem it solves:** Permutation generation explores every possible ordering while tracking which values are already used in the current ordering.

**Time:** O(n × n!). **Space:** O(n) recursion state, excluding results.

The example assumes the input values are distinct.

```csharp
public static class PermutationsAlgorithm
{
    public static IReadOnlyList<IReadOnlyList<int>> Generate(int[] numbers)
    {
        ArgumentNullException.ThrowIfNull(numbers);

        var results = new List<IReadOnlyList<int>>();
        var current = new List<int>(numbers.Length);
        var used = new bool[numbers.Length];
        Explore();
        return results;

        void Explore()
        {
            if (current.Count == numbers.Length)
            {
                results.Add(current.ToArray());
                return;
            }

            for (int index = 0; index < numbers.Length; index++)
            {
                if (used[index])
                    continue;

                used[index] = true;
                current.Add(numbers[index]);
                Explore();
                current.RemoveAt(current.Count - 1);
                used[index] = false;
            }
        }
    }
}
```

**Example:** `var permutations = PermutationsAlgorithm.Generate([1, 2, 3]); // 6 results`

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
| Many range-sum queries | Prefix sums |
| Next greater/smaller value | Monotonic stack |
| First-in/first-out or window maximum | Queue / deque |
| Pointer rewiring or cycle in a list | Linked-list pointers / Floyd |
| Repeated overlapping subproblems | Dynamic programming |
| Locally best choice can be proven optimal | Greedy |
| Generate all valid choices | Backtracking |
| Overlapping intervals | Sort + merge intervals |

---

## 12-Week Study Plan

| Week | Focus | Problems |
|------|-------|----------|
| 1 | Searching and core sorting | 12 easy |
| 2 | Two pointers, sliding windows, prefix sums | 12 easy/medium |
| 3 | Hash maps, stacks, queues, deques | 12 medium |
| 4 | Linked lists | 10 easy/medium |
| 5 | Trees: traversals and BST operations | 12 medium |
| 6 | Graphs: BFS, DFS, components | 12 medium |
| 7 | Graphs: topological sort, Union-Find, shortest paths | 10 medium |
| 8 | Heaps and string algorithms | 10 medium |
| 9 | Dynamic programming: one-dimensional states | 10 medium |
| 10 | Dynamic programming: strings and two-dimensional states | 8 medium |
| 11 | Greedy and backtracking | 10 medium |
| 12 | Mixed review and timed practice | 10 medium + 5 timed |

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

**Sorting and selection:** Sort Colors, Kth Largest Element, Merge Intervals

**Two pointers:** Two Sum II, 3Sum, Container With Most Water

**Sliding window:** Longest Substring Without Repeating Characters, Minimum Size Subarray Sum

**Prefix sums and hashing:** Subarray Sum Equals K, Range Sum Query, Contains Duplicate

**Stack:** Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram

**Trees:** Invert Binary Tree, Max Depth, Validate BST, Lowest Common Ancestor

**Graphs:** Number of Islands, Clone Graph, Course Schedule, Word Ladder

**Heap:** Kth Largest Element, Top K Frequent Elements

**Union-Find:** Redundant Connection, Accounts Merge

**Linked lists:** Reverse Linked List, Linked List Cycle, Merge Two Sorted Lists

**Dynamic programming:** Climbing Stairs, Coin Change, Longest Common Subsequence, Edit Distance

**Greedy:** Merge Intervals, Non-overlapping Intervals

**Backtracking:** Subsets, Permutations, Combination Sum

---

## Self-Check Checklist

Before moving on from an algorithm, you should be able to:

- [ ] Explain it in 30 seconds without looking at code
- [ ] State time and space complexity
- [ ] Implement it from scratch in C#
- [ ] Name 2 real problems where it applies
- [ ] Identify one common mistake (e.g. binary search off-by-one, DFS without visited set)
- [ ] Explain why this paradigm fits better than brute force
- [ ] Test empty, single-item, duplicate, and boundary inputs
