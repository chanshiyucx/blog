# Java 反射

## 反射的概念

### 什么是反射

反射 (Reflection) 是 Java 的特征之一，它允许运行中的 Java 程序获取自身的信息，并且可以操作类或对象的内部属性。

> Reflection enables Java code to discover information about the fields, methods and constructors of loaded classes, and to use reflected fields, methods, and constructors to operate on their underlying counterparts, within security restrictions.

每个类都有一个 Class 对象，包含了与类有关的信息。当编译一个新类时，会产生一个同名的 .class 文件，该文件内容保存着 Class 对象。类加载相当于 Class 对象的加载，类在第一次使用时才动态加载到 JVM 中。

反射可以提供运行时的类信息，并且这个类可以在运行时才加载进来，甚至在编译时期该类的 .class 不存在也可以加载进来。

Class 和 `java.lang.reflect` 一起对反射提供了支持，`java.lang.reflect` 类库主要包含了以下三个类：

- **Field** ：可以使用 get() 和 set() 方法读取和修改 Field 对象关联的字段；
- **Method** ：可以使用 invoke() 方法调用与 Method 对象关联的方法；
- **Constructor** ：可以用 Constructor 创建新的对象。

Java 反射主要提供以下功能：

- 在运行时判断任意一个对象所属的类；
- 在运行时构造任意一个类的对象；
- 在运行时判断任意一个类所具有的成员变量和方法（通过反射甚至可以调用 private 方法）；
- 在运行时调用任意一个对象的方法

### 反射的优点

- **可扩展性**：应用程序可以利用全限定名创建可扩展对象的实例，来使用来自外部的用户自定义类。
- **类浏览器和可视化开发环境**：一个类浏览器需要可以枚举类的成员。可视化开发环境（如 IDE）可以从利用反射中可用的类型信息中受益，以帮助程序员编写正确的代码。
- **调试器和测试工具**：调试器需要能够检查一个类里的私有成员。测试工具可以利用反射来自动地调用类里定义的可被发现的 API 定义，以确保一组测试中有较高的代码覆盖率。

### 反射的缺点

- **性能开销**：反射涉及了动态类型的解析，所以 JVM 无法对这些代码进行优化。因此，反射操作的效率要比那些非反射操作低得多。应该避免在经常被执行的代码或对性能要求很高的程序中使用反射。
- **安全限制**：使用反射技术要求程序必须在一个没有安全限制的环境中运行。如果一个程序必须在有安全限制的环境中运行，如 Applet，那么这就是个问题了。
- **内部暴露**：由于反射允许代码执行一些在正常情况下不被允许的操作（比如访问私有的属性和方法），所以使用反射可能会导致意料之外的副作用，这可能导致代码功能失调并破坏可移植性。反射代码破坏了抽象性，因此当平台发生改变的时候，代码的行为就有可能也随着变化。

## 反射的基本作用

### 获取 Class 对象

首先理解 Java 对象的两个概念：

1. Java 语言中，万事万物皆对象，但**普通数据类型和静态的成员**不是对象。
2. 类是对象，类是 `java.lang.Class` 类的实例对象。There is a class named Class。

任何一个类都是 Class 的实例对象，这个实例对象有三种表示方式。

- 直接获取类对象的 class，`Foo.class`
- 调用类实例对象的 `foo.getClass()` 方法
- 使用 Class 类的 `Class.forName()` 静态方法

```java
package com.chanshiyu;

public class Hello {
  public static void main(String[] args) {
    // Foo 的实例对象
    Foo foo1 = new Foo();

    // Foo 这个类也是 Class 的实例对象，有三种表示方式
    // 1. 第一种表示方式：任何一个类都有一个隐含的静态成员变量 class
    Class c1 = Foo.class;

    // 2.第二种表示方式：已知该类的实例对象，使用 getClass 方法
    Class c2 = foo1.getClass();

    // 3.第三种表示方式
    Class c3 = null;
    try {
      c3 = Class.forName("com.chanshiyu.Foo");
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    }

    // c1、c2、c3 代表了 Foo 类的类类型（class type）
    // c1 == c2 == c3，一个类只能 Class 类的一个实例对象
    // 可以通过 c1、c2、c3 来创建实例对象
    try {
      Foo foo2 = (Foo)c1.newInstance();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

class Foo {}
```

### 动态加载类

编译时加载类是静态加载类，运行时加载类是动态加载类。`Class.forName("类的全称")` 不仅代表了类类型（class type），还代表了动态加载类。

new 创建对象是静态加载类，在编译时刻就需要加载所有可能用到的类。通过动态加载类可以实现按需加载类。

通过动态加载类有两种创建实例对象方式：

- 使用 Class 对象的 `newInstance()` 方法来创建 Class 对象对应类的实例
- 先通过 Class 对象获取指定的 `Constructor` 对象，再调用 `Constructor` 对象的 `newInstance()` 方法来创建实例。这种方法可以用指定的构造器构造类的实例。

```java
package com.chanshiyu;

public class Office {
  public static void main(String[] args) {
    try {
      // 动态加载类
      Class c = Class.forName(args[0]);
      // 通过类类型创建对象
      OfficeAble oa = (OfficeAble) c.newInstance();
      oa.start();

      //获取指定参数的构造器
      //Constructor constructor = c.getConstructor(String.class);
      //根据构造器创建实例
      //OfficeAble oa = (OfficeAble) constructor.newInstance("hello");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

class Word implements OfficeAble {
  @Override
  public void start() {
    System.out.println("wold start");
  }
}

interface OfficeAble {
  public void start();
}
```

### 获取类的信息

反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为 java 语言的反射机制。

获取类类型，再通过类类型获取类名称：

```java
Class c1 = int.class; // int 的类类型
Class c2 = String.class; // String 的类类型
Class c3 = void.class; // void 的类类型
System.out.println(c1.getName()); // int
System.out.println(c2.getName()); // java.lang.String
System.out.println(c2.getSimpleName()); // String
System.out.println(c3.getName()); // void
```

工具类获取类的信息：

```java
package com.chanshiyu;

import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.lang.reflect.Constructor;

public class ClassUtil {
  /**
   * 打印类的信息，包括成员变量与成员函数
   * @param obj 该对象所属类的信息
   */
  public static void printClassMessage(Object obj) {
    // 首先获取类类型
    Class c = obj.getClass();
    // 获取类的名称
    System.out.println("类的名称:" + c.getName());

    /**
     * Method 类，方法对象。一个成员方法就是一个 Method 对象
     * getMethods() 方法获取所有 public 方法，包括父类继承而来的
     * getDeclaredMethods() 方法获取该类自己申明的方法，不问访问权限
     */
    Method[] ms = c.getMethods();
    for (Method m: ms) {
      // 获取方法名
      System.out.print(m.getName());
      // 获取方法返回值类型
      Class returnType = m.getReturnType();
      System.out.print("方法返回值类型:" + returnType.getName());
      // 获取参数类型
      System.out.print("  参数类型：");
      Class[] paramTypes = m.getParameterTypes();
      for (Class c1: paramTypes) {
        System.out.print(c1.getName() + ",");
      }
      System.out.println();
    }

    /**
     * 获取成员变量：java.lang.reflect.Field
     * 成员变量也是对象，Field 类封装了成员变量的操作
     * getFileds() 方法获取所有 public 变量，包括父类继承而来的
     * getDeclaredFileds() 方法获取该类自己声明的变量，不问访问权限
     */
    Field[] fs = c.getDeclaredFields();
    for(Field field: fs) {
      // 获取成员变量的名称
      String fieldName = field.getName();
      // 获取成员变量类型
      Class fieldType = field.getType();
      String typeName = fieldType.getName();
      System.out.println(fieldName + " " + typeName);
    }

    /**
     * 获取构造函数：java.lang.reflect.Constructor
     * 构造函数也是对象
     * getConstructors() 方法获取所有 public 构造函数
     * getDecleardConstructors() 获取该类自己申明的构造函数
     */
    Constructor[] cs = c.getConstructors();
    for (Constructor constructor: cs) {
      // 获取构造函数名称
      System.out.print("构造函数：" + constructor.getName() + "(");
      // 获取构造函数参数列表
      Class[] paramTypes = constructor.getParameterTypes();
      for (Class c1: paramTypes) {
        System.out.print(c1.getName() + ",");
      }
      System.out.println(")");
    }
  }
}
```

### 方法的反射

通过反射操作可以获取类的方法然后调用。

```java
package com.chanshiyu;

import java.lang.reflect.Method;

public class Demo1 {
  public static void main(String[] args) {
    A a = new A();
    Class c = a.getClass();

    // 获取方法 通过名称和参数列表决定
    try {
      // 反射操作调用方法
      // Method m1 = c.getMethod("print", int.class, int.class);
      // m1.invoke(a, 10, 20);

      Method m1 = c.getMethod("print",new Class[]{int.class, int.class});
      m1.invoke(a, new Object[]{10, 20});
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

class A {
  public void print(int a, int b) {
    System.out.println(a + b);
  }

  public void print(String a, String b) {
    System.out.println(a.toUpperCase() + "," + b.toUpperCase());
  }
}
```

### 泛型的本质

泛型是参数化类型的应用，操作的数据类型不限定于特定类型，可以根据实际需要设置不同的数据类型，以实现代码复用。

Java 源代码里面类型提供实现泛型功能，而编译后 Class 文件类型就变成原生类型（即类型被擦除掉），而在引用处插入强制类型转换以实现 JVM 对泛型的支持。本质是 Java 泛型只是 Java 提供的一个语法糖。Java 中集合的泛型是防止错误输入的，只在编译阶段有效，可以通过方法的反射来绕过编辑阶段检测。

```java
package com.chanshiyu;

import java.lang.reflect.Method;
import java.util.ArrayList;

public class Demo2 {
  public static void main(String[] args) {
    ArrayList list1 = new ArrayList();
    ArrayList<String> list2 = new ArrayList<String>();
    list2.add("hello"); // ok
    // list2.add(20); 错误

    Class c1 = list1.getClass();
    Class c2 = list2.getClass();
    System.out.println(c1 == c2); // true

    /**
     * c1 == c2 返回 true 说明编译之后集合的泛型是去泛型话的
     * Java 中集合的泛型是防止错误输入的，只在编译阶段有效
     * 验证：可以通过方法的反射来绕过编辑阶段检测
     */
    try {
      Method m = c2.getMethod("add", Object.class);
      m.invoke(list2, 20); // 可以添加成功
      System.out.println("list2 length:" + list2.size());
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
```
