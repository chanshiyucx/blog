# Java super

- 访问父类的构造函数：可以使用 `super()` 函数访问父类的构造函数，从而委托父类完成一些初始化的工作。应该注意到，**子类一定会调用父类的构造函数来完成初始化工作**，一般是调用父类的默认构造函数，如果子类需要调用父类其它构造函数，那么就可以使用 super 函数。
- 访问父类的成员：如果子类重写了父类的某个方法，可以通过使用 super 关键字来引用父类的方法实现。

```java
public class SuperExample {

    protected int x;
    protected int y;

    public SuperExample(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public void func() {
        System.out.println("SuperExample.func()");
    }
}
```

```java
public class SuperExtendExample extends SuperExample {

    private int z;

    public SuperExtendExample(int x, int y, int z) {
        super(x, y);
        this.z = z;
    }

    @Override
    public void func() {
        super.func();
        System.out.println("SuperExtendExample.func()");
    }
}
```

```java
SuperExample e = new SuperExtendExample(1, 2, 3);
e.func();

// SuperExample.func()
// SuperExtendExample.func()
```
