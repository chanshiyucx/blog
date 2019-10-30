# Java ClassLoader

> 本文为个人学习摘要笔记。  
> 原文地址：[关于 Java ClassLoader 你真的了解吗](http://www.justdojava.com/2019/04/20/java-classloader/)

Java ClassLoader，类加载机制作为一个高频的面试题，这里花点时间梳理一下。

## 什么是类加载机制

众所周知我们编写的 Java 文件都是以 .java 为后缀的文件，编译器会将我们编写的 .java 的文件编译成.class 文件，简单来说类加载机制就是从文件系统将一系列的 class 文件读入 JVM 内存中为后续程序运行提供资源的动作。

## 类加载的流程

![类加载的流程](https://cdn.jsdelivr.net/gh/chanshiyucx/poi/2019/classloader1.jpg)

通过上图，可以看到类加载的整个过程有五个阶段。

### 加载

通过一个类的完整路径查找此类字节码文件（class 文件即二进制文件）。将二进制文件的静态存储结构转化为方法区的运行时数据结构，并利用二进制流文件创建一个 Class 对象，存储在 Java 堆中用于对方法区的数据结构引用的入口；

class 文件的来源：有一点需要注意的是类加载机制不仅可以从文件系统读取 class 文件，也可以通过网络获取，其他 jar 包或者其他程序生成，如 JSP 应用。

讲到类加载不得不讲到类加载的顺序和类加载器。Java 中大概有四种类加载器，分别是：启动类加载器（Bootstrap ClassLoader），扩展类加载器（Extension ClassLoader），系统类加载器（System ClassLoader），自定义类加载器（Custom ClassLoader），依次属于继承关系（注意这里的继承不是 Java 类里面的 extends）。

![类加载器](https://cdn.jsdelivr.net/gh/chanshiyucx/poi/2019/classloader2.jpg)

- 启动类加载器（Bootstrap ClassLoader）：主要负责加载存放在 `Java_Home/jre/lib` 下，或被 `-Xbootclasspath` 参数指定的路径下的，并且能被虚拟机识别的类库（如 rt.jar，所有的 `java.*` 开头的类均被 Bootstrap ClassLoader 加载），启动类加载器是无法被 Java 程序直接引用的。

- 扩展类加载器（Extension ClassLoader）：主要负责加载器由 `sun.misc.Launcher$ExtClassLoader` 实现，它负责加载 `Java_Home/jre/lib/ext` 目录中，或者由 `java.ext.dirs` 系统变量指定的路径中的所有类库（如 `javax.*` 开头的类），开发者可以直接使用扩展类加载器。

- 系统类加载器（System ClassLoader）：主要负责加载器由 `sun.misc.Launcher$AppClassLoader` 来实现，它负责加载用户类路径（ClassPath）所指定的类，开发者可以直接使用该类加载器，如果应用程序中没有自定义过自己的类加载器，一般情况下这个就是程序中默认的类加载器。

- 自定义类加载器（Custom ClassLoader：自己开发的类加载器

双亲委派原则：类加载器在加载 class 文件的时候，遵从双亲委派原则，意思是加载依次由父加载器先执行加载动作，只有当父加载器没有加载到 class 文件时才由子类加载器进行加载。这种机制很好的保证了 Java API 的安全性，使得 JDK 的代码不会被篡改。

### 验证

验证的过程只要是保证 class 文件的安全性和正确性，确保加载了该 class 文件不会导致 JVM 出现任何异常，不会危害 JVM 的自身安全。验证包括对文件格式的验证，元数据和字节码的验证。

### 准备

准备阶段是为类变量进行内存分配和初始化零值的过程。注意这时候分配的是类变量的内存，这些内存会在方法区中分配。此时不会分配实例变量的内存，因为实例变量是在实例化对象时一起创建在 Java 堆中的。而且此时类变量是赋值为零值，即 int 类型的零值为 0，引用类型零值为 null，而不是代码中显示赋值的数值。

### 解析

解析阶段是虚拟机将常量池中的符号引用转化为直接引用的过程。在 class 文件中常量池里面存放了字面量和符号引用，符号引用包括类和接口的全限定名以及字段和方法的名称与描述符。在 JVM 动态链接的时候需要根据这些符号引用来转换为直接引用存放内存使用。

### 初始化

初始化的阶段是类加载的最后一步，这个阶段主要是执行 java 代码，进行相关初始化的动作。

## 总结

整个类加载机制是我们程序运行的开始，虽然这些动作都是 JVM 帮我们自动完成，开发人员在不需要定制类加载器的时候是不会涉及到底层细节的，但知道一些原理对我们也是大有帮助。
