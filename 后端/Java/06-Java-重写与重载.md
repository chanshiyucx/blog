# Java 重写与重载

重写（Overriding）和重载（Overloading）是 Java 中两个比较重要的概念。

- 方法重写是在子类存在方法与父类的方法的名字相同，而且参数的个数与类型一样，返回值也一样的方法，就称为重写（Overriding）。
- 方法重载是一个类中定义了多个方法名相同，而他们的参数的数量不同或数量相同而类型和次序不同，则称为方法的重载（Overloading）。

> 重写就是当子类继承自父类的相同方法，输入数据一样，但要做出有别于父类的响应时，你就要覆盖父类方法。
> 重载就是同样的一个方法能够根据输入数据的不同，做出不同的处理。

## 重写

重写（Overriding）存在于继承体系中，指子类对父类允许访问的方法的实现过程进行重新编写，返回值和形参都不能改变。**即外壳不变，核心重写！**

重写的好处在于子类可以根据需要，定义特定于自己的行为。也就是说子类能够根据需要实现父类的方法。

为了满足里式替换原则，重写有以下三个限制：

- 子类方法的访问权限必须大于等于父类方法；
- 子类方法的返回类型必须是父类方法返回类型或为其子类型。
- 子类方法抛出的异常类型必须是父类抛出异常类型或为其子类型。

使用 `@Override` 注解，可以让编译器帮忙检查是否满足上面的三个限制条件。

下面的示例中，SubClass 为 SuperClass 的子类，SubClass 重写了 SuperClass 的 `func()` 方法。其中：

- 子类方法访问权限为 public，大于父类的 protected。
- 子类的返回类型为 `ArrayList<Integer>`，是父类返回类型 `List<Integer>` 的子类。
- 子类抛出的异常类型为 Exception，是父类抛出异常 Throwable 的子类。
- 子类重写方法使用 `@Override` 注解，从而让编译器自动检查是否满足限制条件。

```java
class SuperClass {
    protected List<Integer> func() throws Throwable {
        return new ArrayList<>();
    }
}

class SubClass extends SuperClass {
    @Override
    public ArrayList<Integer> func() throws Exception {
        return new ArrayList<>();
    }
}
```

在调用一个方法时，先从本类中查找看是否有对应的方法，如果没有查找到再到父类中查看，看是否有继承来的方法。否则就要对参数进行转型，转成父类之后看是否有对应的方法。总的来说，方法调用的优先级为：

- this.func(this)
- super.func(this)
- this.func(super)
- super.func(super)

```java
/*
    A
    |
    B
    |
    C
    |
    D
 */

class A {

    public void show(A obj) {
        System.out.println("A.show(A)");
    }

    public void show(C obj) {
        System.out.println("A.show(C)");
    }
}

class B extends A {

    @Override
    public void show(A obj) {
        System.out.println("B.show(A)");
    }
}

class C extends B {
}

class D extends C {
}
```

```java
public static void main(String[] args) {

    A a = new A();
    B b = new B();
    C c = new C();
    D d = new D();

    // 在 A 中存在 show(A obj)，直接调用
    a.show(a); // A.show(A)
    // 在 A 中不存在 show(B obj)，将 B 转型成其父类 A
    a.show(b); // A.show(A)
    // 在 B 中存在从 A 继承来的 show(C obj)，直接调用
    b.show(c); // A.show(C)
    // 在 B 中不存在 show(D obj)，但是存在从 A 继承来的 show(C obj)，将 D 转型成其父类 C
    b.show(d); // A.show(C)

    // 引用的还是 B 对象，所以 ba 和 b 的调用结果一样
    A ba = new B();
    ba.show(c); // A.show(C)
    ba.show(d); // A.show(C)
}
```

## 重载

重载（overloading）是在一个类里面，方法名字相同，而参数不同。返回类型可以相同也可以不同。

每个重载的方法（或者构造函数）都必须有一个独一无二的参数类型列表。

最常用的地方就是构造器的重载。

方法的重载规则：

- 被重载的方法必须改变参数列表（参数个数或类型不一样）。
- 被重载的方法可以改变返回类型。
- 被重载的方法可以改变访问修饰符。
- 被重载的方法可以声明新的或更广的检查异常。
- 方法能够在同一个类中或者在一个子类中被重载。
- 无法以返回值类型作为重载函数的区分标准。

举个栗子：

```java
public class Overloading {
    public int test(){
        System.out.println("test1");
        return 1;
    }

    public void test(int a){
        System.out.println("test2");
    }

    // 以下两个参数类型顺序不同
    public String test(int a,String s){
        System.out.println("test3");
        return "returntest3";
    }

    public String test(String s,int a){
        System.out.println("test4");
        return "returntest4";
    }
}
```

## 总结

重写与重载之间的区别：

| 区别点   | 重写方法                                       | 重载方法 |
| -------- | ---------------------------------------------- | -------- |
| 参数列表 | 一定不能修改                                   | 必须修改 |
| 返回类型 | 一定不能修改                                   | 可以修改 |
| 异常     | 可以减少或删除，一定不能抛出新的或者更广的异常 | 可以修改 |
| 访问     | 一定不能做更严格的限制（可以降低限制）         | 可以修改 |

关于重载和重写，有几点需要知道：

- 重写是一个运行期间概念，重载是一个编译期概念。
- 重写遵循所谓“运行期绑定”，即在运行的时候，根据引用变量所指向的实际对象的类型来调用方法
- 重载遵循所谓“编译期绑定”，即在编译时根据参数变量的类型判断应该调用哪个方法。

方法的重写（Overriding）和重载（Overloading）是 java 多态性的不同表现（有争议），重写是父类与子类之间多态性的一种表现，重载可以理解成多态的具体表现形式。

> 关于重载是不是多态有多种论调，有些人认为重载不属于多态的体现，可以参考：[Java 中多态的实现方式](https://github.com/hollischuang/toBeTopJavaer/blob/master/basics/java-basic/polymorphism.md)

![重写与重载](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Java-重写与重载/overloading-vs-overriding.png)

## 多态

上面总结了重写与重载的概念与他们之间的区别，这里再说一下多态，以及为什么说重载不属于多态。

多态，就是同一操作作用于不同的对象，可以有不同的解释，产生不同的执行结果。如果按照这个概念来定义的话，那么多态应该是一种**运行期**的状态。为了实现运行期的多态，或者说是动态绑定，需要满足三个条件：**即有类继承或者接口实现、子类要重写父类的方法、父类的引用指向子类的对象。**

一个多态的栗子：

```java
public class Parent{

    public void call(){
        sout("im Parent");
    }
}

public class Son extends Parent{// 1.有类继承或者接口实现
    public void call(){// 2.子类要重写父类的方法
        sout("im Son");
    }
}

public class Daughter extends Parent{// 1.有类继承或者接口实现
    public void call(){// 2.子类要重写父类的方法
        sout("im Daughter");
    }
}

public class Test{

    public static void main(String[] args){
        Parent p = new Son(); // 3.父类的引用指向子类的对象
        Parent p1 = new Daughter(); // 3.父类的引用指向子类的对象
    }
}
```

上面的栗子属于方法的重写，满足了多态的三个条件，于是实现了多态。

另外有一种说法：多态还分为动态多态和静态多态。

上面提到的那种动态绑定认为是动态多态，因为只有在运行期才能知道真正调用的是哪个类的方法。还有一种静态多态，一般认为 Java 中的函数重载是一种静态多态，因为他需要在编译期决定具体调用哪个方法。

一般认为，**多态应该是一种运行期特性，Java 中的重写是多态的体现，而重载和多态其实是无关的**。
