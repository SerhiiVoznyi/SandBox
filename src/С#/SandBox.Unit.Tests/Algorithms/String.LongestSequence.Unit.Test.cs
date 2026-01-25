namespace SandBox.Unit.Tests.Algorithms;

public class StringStringLongestSequenceUnitTest
{
    private int LongestSequence(string str)
    {
        if (string.IsNullOrEmpty(str)) return 0;
        var max = 1;
        var current = 1;
        for (var i = 1; i < str.Length; i++)
        {
            if (str[i] == str[i - 1])
            {
                current++;
                if (current > max)
                    max = current;
            }
            else
            {
                current = 1;
            }
        }

        return max;
    }

    [Theory]
    [InlineData("", 0)]
    [InlineData("       ", 7)]
    [InlineData("abcd", 1)]
    [InlineData("aabbccdd", 2)]
    [InlineData("aabbbbccdd", 4)]
    public void Test_FindLongestSequence(string str, int expected)
    {
        Assert.Equal(expected, LongestSequence(str));
    }
}
