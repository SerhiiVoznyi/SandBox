namespace SandBox.Unit.Tests.Algorithms
{
    public class ClosureTests
    {
        [Fact]
        public async void ShouldPrintToConsole()
        {
            var actions = new List<Action>();
            for (var i = 0; i < 3; i++)
            {
                actions.Add(() =>
                    {
                        Console.Write(i);
                    });
            }
            foreach (var action in actions)
            {
                action();
            }
        }
    }
}
