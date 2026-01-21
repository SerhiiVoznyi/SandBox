using System.Runtime.CompilerServices;

namespace SandBox.Unit.Tests.Algorithms;

public class ArraySearchUnitTests
{
    /*
     * Given an array of integers nums and an integer target,
     *  return true if there are two distinct indices such that
     * nums[i] + nums[j] == target.
     */
    private bool HasSum(int[] array, int sum)
    {
        var seen = new HashSet<int>();

        foreach (var x in array)
        {
            if (seen.Contains(sum - x))
                return true;

            seen.Add(x);
        }

        return false;
    }

    private bool HasSumTwoPointers(int[] array, int sum)
    {
        Array.Sort(array); // O(n log n)

        int left = 0;
        int right = array.Length - 1;

        while (left < right)
        {
            int current = array[left] + array[right];

            if (current == sum)
                return true;

            if (current < sum)
                left++;
            else
                right--;
        }

        return false;
    }


    [Theory]
    [InlineData(1, false)]
    [InlineData(7, false)]
    [InlineData(10, true)]
    [InlineData(100, false)]
    public void Test_Search(int target, bool expected)
    {
        // Arrange
        var nums = new[] { 1, 3, 5, 7, 9, 11, 13, 15, 17, 19 }; 
        // Act
        var resilts = new[] { HasSum(nums, target), HasSumTwoPointers(nums, target) };
        // Assert
        Assert.All(resilts, result => Assert.Equal(expected, result));
    }
}
