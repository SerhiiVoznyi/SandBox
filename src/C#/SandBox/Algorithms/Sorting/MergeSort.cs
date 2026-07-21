using System.Diagnostics;

namespace Algorithms.Sorting;

public static class MergeSort
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
        {
            var buffer = new T[inputSize];
            SortRange(values, buffer, 0, inputSize - 1, ref comparisons, ref swaps);
        }

        stopwatch.Stop();
        var endedAt = DateTimeOffset.UtcNow;

        const string theoreticalBestCaseBigO = "O(n log n)";

        return new SortExecutionResult(
            StartedAt: startedAt,
            EndedAt: endedAt,
            Elapsed: stopwatch.Elapsed,
            InputSize: inputSize,
            ObservedBigO: BigOObservation.ClassifyObservedBigO(inputSize, comparisons),
            TheoreticalBestCaseBigO: theoreticalBestCaseBigO,
            TheoreticalAverageCaseBigO: theoreticalBestCaseBigO,
            TheoreticalWorstCaseBigO: theoreticalBestCaseBigO,
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
        var buffer = new T[values.Length];
        SortRange(values, buffer, 0, values.Length - 1, ref comparisons, ref swaps);
    }

    private static void SortRange<T>(
        Span<T> values,
        T[] buffer,
        int leftIndex,
        int rightIndex,
        ref long comparisons,
        ref long swaps)
        where T : IComparable<T>
    {
        if (leftIndex >= rightIndex) return;

        var middleIndex = leftIndex + (rightIndex - leftIndex) / 2;
        SortRange(values, buffer, leftIndex, middleIndex, ref comparisons, ref swaps);
        SortRange(values, buffer, middleIndex + 1, rightIndex, ref comparisons, ref swaps);
        Merge(values, buffer, leftIndex, middleIndex, rightIndex, ref comparisons, ref swaps);
    }

    private static void Merge<T>(
        Span<T> values,
        T[] buffer,
        int leftIndex,
        int middleIndex,
        int rightIndex,
        ref long comparisons,
        ref long swaps)
        where T : IComparable<T>
    {
        var leftCursor = leftIndex;
        var rightCursor = middleIndex + 1;
        var destination = leftIndex;

        while (leftCursor <= middleIndex && rightCursor <= rightIndex)
        {
            comparisons++;
            buffer[destination++] = values[leftCursor].CompareTo(values[rightCursor]) <= 0
                ? values[leftCursor++]
                : values[rightCursor++];
            swaps++;
        }

        while (leftCursor <= middleIndex)
        {
            buffer[destination++] = values[leftCursor++];
            swaps++;
        }

        while (rightCursor <= rightIndex)
        {
            buffer[destination++] = values[rightCursor++];
            swaps++;
        }

        for (var index = leftIndex; index <= rightIndex; index++)
            values[index] = buffer[index];
    }
}
