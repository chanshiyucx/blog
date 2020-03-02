# HashMap 排序

HashMap 的值是没有顺序的，它是按照 key 的 HashCode 来实现的，对于这个无序的 HashMap 我们要怎么来实现排序呢？

## 根据 key 排序

TreeMap 基于红黑树实现，该映射根据其键的自然顺序进行排序，或者根据创建映射时提供的 Comparator 进行排序。Comparator 可以对集合对象或者数组进行排序的比较器接口。

```java
Map<String, String> map = new TreeMap<>(Comparator.naturalOrder());
map.put("b", "bbb");
map.put("d", "ddd");
map.put("c", "ccc");
map.put("a", "aaa");

Set<String> keySet = map.keySet();
for (String key : keySet) {
    System.out.println(key + ":" + map.get(key));
}
```

```
a:aaa
b:bbb
c:ccc
d:ddd
```

## 根据 value 排序

对 value 排序我们就需要借助于 Collections 的 `sort(List<T> list, Comparator<? super T> c)` 方法，该方法根据指定比较器产生的顺序对指定列表进行排序。但是有一个前提条件，那就是所有的元素都必须能够根据所提供的比较器来进行比较。

```java
HashMap<String, Integer> countMap = new HashMap<>();
// 升序比较器
Comparator<Map.Entry<String, Integer>> valueComparator = Comparator.comparingInt(Map.Entry::getValue);
// map 转换成 list
List<Map.Entry<String, Integer>> list = new ArrayList<>(countMap.entrySet());
// 排序
list.sort(valueComparator);
for (Map.Entry<String, Integer> entry : list) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```
