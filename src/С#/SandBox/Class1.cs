namespace SandBox;

public class Class1
{
    private List<string> _items = new();

    public static void Add()
    {
        var o = new Class1();
        o._items.Add("");
    }
}
