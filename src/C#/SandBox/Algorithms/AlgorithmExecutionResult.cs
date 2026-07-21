namespace Algorithms;

public record AlgorithmExecutionResult(
    DateTimeOffset StartedAt,
    DateTimeOffset EndedAt,
    TimeSpan Elapsed,
    int InputSize,
    string ObservedBigO,
    string TheoreticalBestCaseBigO,
    string TheoreticalAverageCaseBigO,
    string TheoreticalWorstCaseBigO);


public static class BigOObservation
{
    internal static string ClassifyObservedBigO(int inputSize, long comparisonCount)
    {
        switch (inputSize)
        {
            case <= 1:
                return "O(1)";
            case 2:
                return "O(n)";
            default:
                var n = (double)inputSize;
                var linearithmicBound = 4.0 * n * Math.Log2(n);
                return comparisonCount <= linearithmicBound
                    ? "O(n log n)"
                    : "O(n²)";
        }
    }
}