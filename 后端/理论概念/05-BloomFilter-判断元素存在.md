# BloomFilter 判断元素存在

> 本文为个人学习摘要笔记。  
> 原文地址：[到底是存在还是不存在之 BloomFilter](http://www.justdojava.com/2019/10/22/bloomfilter/)

## 什么是 BloomFilter

布隆过滤器（Bloom Filter）是 1970 年由布隆提出的。它实际上是一个很长的二进制向量和一系列随机映射函数。主要用于判断一个元素是否在一个集合中。通常我们会遇到很多要判断一个元素是否在某个集合中的业务场景，这个时候往往我们都是采用 Hashmap，Set 或者其他集合将数据保存起来，然后进行对比判断，但是如果元素很多的情况，我们如果采用这种方式就会非常浪费空间。这个时候我们就需要 BloomFilter 来帮助我们了。

### BloomFilter 原理

BloomFilter 是由一个固定大小的二进制向量或者位图（bitmap）和一系列（通常好几个）映射函数组成的。布隆过滤器的原理是，当一个变量被加入集合时，通过 K 个映射函数将这个变量映射成位图中的 K 个点，把它们置为 1。查询某个变量的时候我们只要看看这些点是不是都是 1，就可以大概率知道集合中有没有它了，如果这些点有任何一个 0，则被查询变量一定不在；如果都是 1，则被查询变量很**可能**在。注意，这里是可能存在，不一定一定存在！这就是布隆过滤器的基本思想。

简而言之，**如果检测结果都为 1，该元素不一定在集合中；但如果检测结果存在 0，该元素一定不在集合中**。每个检测请求返回有 “在集合内（可能错误）” 和 “不在集合内（绝对不在集合内）” 两种情况。

如下图所示，字符串 “ziyou” 在经过四个映射函数操作后在位图上有四个点被设置成了 1。当我们需要判断 “ziyou” 字符串是否存在的时候只要在一次对字符串进行映射函数的操作，得到四个 1 就说明 “ziyou” 是可能存在的。

![映射函数](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/BloomFilter-判断元素存在/bloomfilter01.png)

为什么说是可能存在，而不是一定存在呢？那是因为映射函数本身就是散列函数，散列函数是会有碰撞的，意思也就是说会存在一个字符串可能是 “ziyou01” 经过相同的四个映射函数运算得到的四个点跟 “ziyou” 是一样的，这种情况下我们就说出现了误算。另外还有可能这四个点位上的 1 是四个不同的变量经过运算后得到的，这也不能证明字符串 “ziyou” 是一定存在的，如下图框出来的 1 也可能是字符串“张三”计算得到，同理其他几个位置的 1 也可以是其他字符串计算得到。

![散列碰撞](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/BloomFilter-判断元素存在/bloomfilter02.png)

### 结论

所以通过上面的例子我们就可以明确：

- 一个元素如果判断结果为存在的时候元素不一定存在，但是判断结果为不存在的时候则一定不存在。
- 布隆过滤器可以添加元素，但是不能删除元素。因为删掉元素会导致误判率增加。

## 使用场景

### 网页 URL 去重

我们在使用网页爬虫的时候，往往需要记录哪些 URL 是已经爬取过的，哪些还是没有爬取过，这个时候我们就可以采用 BloomFilter 来对已经爬取过的 URL 进行存储，这样在进行下一次爬取的时候就可以判断出这个 URL 是否爬取过。

### 黑白名单存储

工作中经常会有一个特性针对不同的设备或者用户有不同的处理方式，这个时候可能会有白名单或者黑名单存在，所以根据 BloomFilter 过滤器的特性，我们也可以用它来存在这些数据，虽然有一定的误算率，但是在一定程度上还是可以很好的解决这个问题的。

其实还有很多场景，比如热点数据访问，垃圾邮件过滤等等，其实这些场景的统一特性就是要判断某个元素是否在某个集合中，原理都是一样的。

## 简单实现

```java
import java.util.BitSet;

public class BloomFilterTest {

    /**
     * 初始化布隆过滤器的 bitmap 大小
     */
    private static final int DEFAULT_SIZE = 2 << 24;
    /**
     * 为了降低错误率，这里选取一些数字作为基准数
     */
    private static final int[] seeds = {3, 5, 7, 11, 13, 31, 37, 61};
    /**
     * 设置 bitmap
     */
    private static BitSet bitset = new BitSet(DEFAULT_SIZE);
    /**
     * 设置 hash 函数数量
     */
    private static HashFunction[] functions = new HashFunction[seeds.length];


    /**
     * 添加数据
     *
     * @param value 需求加入的值
     */
    public static void put(String value) {
        if (value != null) {
            for (HashFunction f : functions) {
                //计算 hash 值并修改 bitmap 中相应位置为 true
                bitset.set(f.hash(value), true);
            }
        }
    }

    /**
     * 判断相应元素是否存在
     *
     * @param value 需要判断的元素
     * @return 结果
     */
    public static boolean check(String value) {
        if (value == null) {
            return false;
        }
        boolean ret = true;
        for (HashFunction f : functions) {
            ret = bitset.get(f.hash(value));
            //一个 hash 函数返回 false 则跳出循环
            if (!ret) {
                break;
            }
        }
        return ret;
    }

    public static void main(String[] args) {
        String value = "test";
        for (int i = 0; i < seeds.length; i++) {
            functions[i] = new HashFunction(DEFAULT_SIZE, seeds[i]);
        }
        put(value);
        System.out.println(check("value"));
    }
}

class HashFunction {

    private int size;
    private int seed;

    public HashFunction(int size, int seed) {
        this.size = size;
        this.seed = seed;
    }

    public int hash(String value) {
        int result = 0;
        int len = value.length();
        for (int i = 0; i < len; i++) {
            result = seed * result + value.charAt(i);
        }
        int r = (size - 1) & result;
        return (size - 1) & result;
    }

}
```

上面简单的 BloomFilter，通过 put 方法录入数据，通过 check 方法判断元素是否存在。

此外，常用工具库 Guava 和 Hutool 都提供了 BloomFilter 实现。
