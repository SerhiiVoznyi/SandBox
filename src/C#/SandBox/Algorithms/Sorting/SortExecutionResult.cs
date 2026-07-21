namespace Algorithms.Sorting;

public sealed record SortExecutionResult(
    DateTimeOffset StartedAt,
    DateTimeOffset EndedAt,
    TimeSpan Elapsed,
    int InputSize,
    string ObservedBigO,
    string TheoreticalBestCaseBigO,
    string TheoreticalAverageCaseBigO,
    string TheoreticalWorstCaseBigO,
    long ComparisonCount,
    long SwapCount)
    : Algorithms.AlgorithmExecutionResult(
        StartedAt,
        EndedAt,
        Elapsed,
        InputSize,
        ObservedBigO,
        TheoreticalBestCaseBigO,
        TheoreticalAverageCaseBigO,
        TheoreticalWorstCaseBigO);
