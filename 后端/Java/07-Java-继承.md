# Java 继承

## 访问权限

访问权限控制指的是本类及本类内部的成员（成员变量、成员方法、内部类）对其他类的可见性，即这些内容是否允许其他类访问。

- 类可见表示其它类可以用这个类创建实例对象；
- 成员可见表示其它类可以用这个类的实例对象访问到该成员。

### 四种访问权限

Java 中一共有四种访问权限控制，其权限控制的大小情况：**public > protected > default > private**。

- public：表明该成员变量或者方法是对所有类或者对象都是可见的，所有类或者对象都可以直接访问。
- protected：表明该成员变量或者方法只有自己和其位于同一个包的其他类可见，其他包下的类不可访问，除非是他的子类。
- default：表明该成员变量或者方法只有自己和其位于同一个包的其他类可见，其他包内的类不能访问，即便是它的子类。
- private：表明该成员变量或者方法是私有的，只有当前类对其具有访问权限，除此之外其他类或者对象都没有访问权限，子类也没有访问权限。

**protected 用于修饰成员，表示在继承体系中成员对于子类可见，但是这个访问修饰符对于类没有意义。**

如果子类的方法重写了父类的方法，那么子类中该方法的访问级别不允许低于父类的访问级别。这是为了确保可以使用父类实例的地方都可以使用子类实例去代替，也就是确保满足里氏替换原则。

具体的权限控制看下面表格：

| 访问权限  | 本类 | 本包的类 | 子类 | 非子类的外包类 |
| --------- | ---- | -------- | ---- | -------------- |
| public    | 是   | 是       | 是   | 是             |
| protected | 是   | 是       | 是   | 否             |
| default   | 是   | 是       | 否   | 否             |
| private   | 是   | 否       | 否   | 否             |

### 接口成员的访问权限

接口由于其的特殊性，所有成员的访问权限都被规定，下面是接口成员的访问权限：

- 变量：`public static final`
- 抽象方法：`public abstract`
- 静态方法：`public static`
- 内部类、内部接口：`public static`

## 抽象类与接口

### 抽象类

抽象类和抽象方法都使用 `abstract` 关键字进行声明。如果一个类中包含抽象方法，那么这个类必须声明为抽象类。

抽象类和普通类最大的区别是，抽象类不能被实例化，需要继承抽象类才能实例化其子类。

```java
public abstract class AbstractClassExample {
    protected int x;
    private int y;

    public abstract void func1();

    public void func2() {
        System.out.println("func2");
    }
}
```

```java
public class AbstractExtendClassExample extends AbstractClassExample {
    @Override
    public void func1() {
        System.out.println("func1");
    }
}
```

### 接口

接口是抽象类的延伸，在 Java 8 之前，它可以看成是一个完全抽象的类，也就是说它不能有任何的方法实现。

从 Java 8 开始，接口也可以拥有默认的方法实现，这是因为不支持默认方法的接口的维护成本太高了。在 Java 8 之前，如果一个接口想要添加新的方法，那么要修改所有实现了该接口的类。

**接口的成员（字段 + 方法）默认都是 public 的，并且不允许定义为 private 或者 protected。**

**接口的字段默认都是 static 和 final 的。**

```java
public interface InterfaceExample {

    void func1();

    default void func2(){
        System.out.println("func2");
    }

    int x = 123;
    public int z = 0;       // Modifier 'public' is redundant for interface fields

    // int y;               // Variable 'y' might not have been initialized
    // private int k = 0;   // Modifier 'private' not allowed here
    // protected int l = 0; // Modifier 'protected' not allowed here
    // private void fun3(); // Modifier 'private' not allowed here
}
```

```java
public class InterfaceImplementExample implements InterfaceExample {
    @Override
    public void func1() {
        System.out.println("func1");
    }
}
```

### 比较

- 从设计层面上看，抽象类提供了一种 IS-A 关系，那么就必须满足里式替换原则，即子类对象必须能够替换掉所有父类对象。而接口更像是一种 LIKE-A 关系，它只是提供一种方法实现契约，并不要求接口和实现接口的类具有 IS-A 关系。
- 从使用上来看，一个类可以实现多个接口，但是不能继承多个抽象类。
- 接口的字段只能是 static 和 final 类型的，而抽象类的字段没有这种限制。
- 接口的成员只能是 public 的，而抽象类的成员可以有多种访问权限。

### 使用选择

使用接口：

- 需要让不相关的类都实现一个方法，例如不相关的类都可以实现 Compareable 接口中的 compareTo() 方法；
- 需要使用多重继承。

使用抽象类：

- 需要在几个相关的类中共享代码。
- 需要能控制继承来的成员的访问权限，而不是都为 public。
- 需要继承非静态和非常量字段。

在很多情况下，接口优先于抽象类。因为接口没有抽象类严格的类层次结构要求，可以灵活地为一个类添加行为。并且从 Java 8 开始，接口也可以有默认的方法实现，使得修改接口的成本也变的很低。

## super

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

## 重写与重载

重写（Overriding）和重载（Overloading）是 Java 中两个比较重要的概念。

- 方法重写是在子类存在方法与父类的方法的名字相同，而且参数的个数与类型一样，返回值也一样的方法，就称为重写（Overriding）。
- 方法重载是一个类中定义了多个方法名相同，而他们的参数的数量不同或数量相同而类型和次序不同，则称为方法的重载（Overloading）。

> 重写就是当子类继承自父类的相同方法，输入数据一样，但要做出有别于父类的响应时，你就要覆盖父类方法。
> 重载就是同样的一个方法能够根据输入数据的不同，做出不同的处理。

### 重写

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

### 重载

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

### 总结

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

![重写与重载](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Java-继承/overloading-vs-overriding.png)

### 多态

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
