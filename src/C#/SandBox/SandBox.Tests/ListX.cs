using System.Collections;

namespace SandBox.Tests;

public class ListX<T>(int capacity = 4) : IEnumerable<T>
{
    private T[] _items = new T[capacity];
    private int _count = 0;

    public int Count => _count;

    public void Add(T item)
    {
        if (_count == _items.Length)
            Resize();

        _items[_count++] = item;
    }

    public T this[int index]
    {
        get
        {
            if (index < 0 || index >= _count)
                throw new ArgumentOutOfRangeException(nameof(index));

            return _items[index];
        }
    }

    private void Resize()
    {
        var newArray = new T[_items.Length * 2];
        Array.Copy(_items, newArray, _items.Length);
        _items = newArray;
    }

    public IEnumerator<T> GetEnumerator()
    {
        for (int i = 0; i < _count; i++)
            yield return _items[i];
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}

