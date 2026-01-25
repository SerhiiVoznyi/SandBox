namespace SandBox.Unit.Tests.Algorithms;

public class TaskSynchronizationUnitTests
{
    [Fact]
    public void TestMethod1()
    {
        var odd = new SemaphoreSlim(1, 1);
        var even = new SemaphoreSlim(0, 1);
        var list = new List<int>();
        var task1 = Task.Factory.StartNew(() =>
        {
            for (var i = 1; i <= 10; i++)
            {
                even.Wait();
                if (i % 2 == 0) list.Add(i);
                odd.Release();
            }
        });

        var task2 = Task.Factory.StartNew(() =>
        {
            for (var i = 1; i <= 10; i++)
            {
                odd.Wait();
                if (i % 2 > 0) list.Add(i);
                even.Release();
            }
        });

        task1.Wait();
        task2.Wait();

        Assert.Equal(10, list.Count);
    }
}

