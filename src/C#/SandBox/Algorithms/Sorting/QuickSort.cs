using System.Diagnostics;

namespace Algorithms.Sorting;

public static class QuickSort
{
    public static SortExecutionResult SortWithResult<T>(T[] values)
        where T : IComparable<T>
    {
        var inputSize = values.Length;
        var startedAt = DateTimeOffset.UtcNow;
        var stopwatch = Stopwatch.StartNew();

        long comparisons = 0;
        long swaps = 0;

        if (inputSize > 1)
            SortRange(values, 0, inputSize - 1, ref comparisons, ref swaps);

        stopwatch.Stop();
        var endedAt = DateTimeOffset.UtcNow;

        return new SortExecutionResult(
            StartedAt: startedAt,
            EndedAt: endedAt,
            Elapsed: stopwatch.Elapsed,
            InputSize: inputSize,
            ObservedBigO: BigOObservation.ClassifyObservedBigO(inputSize, comparisons),
            TheoreticalBestCaseBigO: "O(n log n)",
            TheoreticalAverageCaseBigO: "O(n log n)",
            TheoreticalWorstCaseBigO: "O(n²)",
            ComparisonCount: comparisons,
            SwapCount: swaps);
    }

    public static void Sort<T>(T[]? values)
        where T : IComparable<T>
    {
        if (values is null || values.Length <= 1) return;

        long comparisons = 0;
        long swaps = 0;

        Sort(values.AsSpan(), ref comparisons, ref swaps);
    }

    public static void Sort<T>(Span<T> values, ref long comparisons, ref long swaps)
        where T : IComparable<T>
    {
        if (values.IsEmpty || values.Length <= 1) return;
        SortRange(values, 0, values.Length - 1, ref comparisons, ref swaps);
    }

    private static void SortRange<T>(
        Span<T> values,
        int leftIndex,
        int rightIndex,
        ref long comparisons,
        ref long swaps)
        where T : IComparable<T>
    {
        if (leftIndex >= rightIndex) return;
        var pivotFinalIndex = Partition(values, leftIndex, rightIndex, ref comparisons, ref swaps);
        SortRange(values, leftIndex, pivotFinalIndex - 1, ref comparisons, ref swaps);
        SortRange(values, pivotFinalIndex + 1, rightIndex, ref comparisons, ref swaps);
    }

    private static int Partition<T>(
        Span<T> values,
        int leftIndex,
        int rightIndex,
        ref long comparisons,
        ref long swaps)
        where T : IComparable<T>
    {
        var pivotValue = values[rightIndex];
        var nextSmallerValueIndex = leftIndex;

        for (var currentIndex = leftIndex; currentIndex < rightIndex; currentIndex++)
        {
            comparisons++;
            if (values[currentIndex].CompareTo(pivotValue) > 0) continue;
            Swap(values, nextSmallerValueIndex, currentIndex, ref swaps);
            nextSmallerValueIndex++;
        }

        Swap(values, nextSmallerValueIndex, rightIndex, ref swaps);
        return nextSmallerValueIndex;
    }

    private static void Swap<T>(Span<T> values, int firstIndex, int secondIndex, ref long swaps)
    {
        if (firstIndex == secondIndex) return;
        (values[firstIndex], values[secondIndex]) = (values[secondIndex], values[firstIndex]);
        swaps++;
    }
}
