using Algorithms.Sorting;

namespace SandBox.Tests;

public class MergeSortTests
{
    [Fact]
    public void Sort_Should_Sort_Integers()
    {
        int[] values = [5, 2, 8, 1, 9, 3];

        MergeSort.Sort(values);

        Assert.Equal([1, 2, 3, 5, 8, 9], values);
    }

    [Fact]
    public void Sort_Should_Sort_Strings()
    {
        string[] values = ["delta", "alpha", "charlie", "bravo"];

        MergeSort.Sort(values);

        Assert.Equal(["alpha", "bravo", "charlie", "delta"], values);
    }

    [Theory]
    [InlineData(new int[0])]
    [InlineData(new[] { 42 })]
    public void Sort_Should_Handle_Empty_And_Single_Element(int[] values)
    {
        var original = values.ToArray();

        MergeSort.Sort(values);

        Assert.Equal(original, values);
    }

    [Fact]
    public void Sort_Should_Handle_Duplicates()
    {
        int[] values = [3, 1, 3, 2, 1, 2];

        MergeSort.Sort(values);

        Assert.Equal([1, 1, 2, 2, 3, 3], values);
    }

    [Fact]
    public void Sort_Should_Handle_Already_Sorted()
    {
        int[] values = [1, 2, 3, 4, 5];

        MergeSort.Sort(values);

        Assert.Equal([1, 2, 3, 4, 5], values);
    }

    [Fact]
    public void Sort_Should_Handle_Reverse_Sorted()
    {
        int[] values = [5, 4, 3, 2, 1];

        MergeSort.Sort(values);

        Assert.Equal([1, 2, 3, 4, 5], values);
    }

    [Fact]
    public void SortWithResult_Should_Sort_And_Return_Timing_Metadata()
    {
        int[] values = [5, 2, 8, 1];
        var before = DateTimeOffset.UtcNow;

        var result = MergeSort.SortWithResult(values);

        var after = DateTimeOffset.UtcNow;

        Assert.Equal([1, 2, 5, 8], values);
        Assert.Equal(4, result.InputSize);
        Assert.True(result.ComparisonCount > 0);
        Assert.True(result.SwapCount > 0);
        Assert.True(result.Elapsed >= TimeSpan.Zero);
        Assert.True(result.StartedAt >= before.AddSeconds(-1));
        Assert.True(result.EndedAt <= after.AddSeconds(1));
        Assert.True(result.EndedAt >= result.StartedAt);
        Assert.Equal("O(n log n)", result.TheoreticalBestCaseBigO);
        Assert.Equal("O(n log n)", result.TheoreticalAverageCaseBigO);
        Assert.Equal("O(n log n)", result.TheoreticalWorstCaseBigO);
        Assert.False(string.IsNullOrWhiteSpace(result.ObservedBigO));
    }

    [Fact]
    public void SortWithResult_Should_Report_O1_For_Empty_Or_Single()
    {
        var empty = MergeSort.SortWithResult(Array.Empty<int>());
        var single = MergeSort.SortWithResult([7]);

        Assert.Equal("O(1)", empty.ObservedBigO);
        Assert.Equal(0, empty.ComparisonCount);
        Assert.Equal("O(1)", single.ObservedBigO);
        Assert.Equal(0, single.ComparisonCount);
    }

    [Fact]
    public void SortWithResult_Should_Observe_Linear_On_Already_Sorted_Large_Input()
    {
        var values = Enumerable.Range(1, 512).ToArray();

        var result = MergeSort.SortWithResult(values);

        Assert.Equal(Enumerable.Range(1, 512), values);
        Assert.Equal("O(n log n)", result.ObservedBigO);
        Assert.True(result.ComparisonCount <= 4.0 * 512 * Math.Log2(512));
    }

    [Fact]
    public void SortWithResult_Should_Observe_Linear_On_Random_Large_Input()
    {
        var values = CreateShuffledRange(2_048, seed: 42);

        var result = MergeSort.SortWithResult(values);

        Assert.Equal(Enumerable.Range(0, 2_048), values);
        Assert.Equal("O(n log n)", result.ObservedBigO);
        Assert.True(result.ComparisonCount <= 4.0 * 2_048 * Math.Log2(2_048));
    }

    [Fact]
    public void SortWithResult_Should_Work_With_Strings()
    {
        string[] values = ["zeta", "alpha", "mu"];

        var result = MergeSort.SortWithResult(values);

        Assert.Equal(["alpha", "mu", "zeta"], values);
        Assert.Equal(3, result.InputSize);
        Assert.True(result.Elapsed >= TimeSpan.Zero);
    }

    private static int[] CreateShuffledRange(int count, int seed)
    {
        var values = Enumerable.Range(0, count).ToArray();
        var random = new Random(seed);

        for (var i = values.Length - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (values[i], values[j]) = (values[j], values[i]);
        }

        return values;
    }
}
