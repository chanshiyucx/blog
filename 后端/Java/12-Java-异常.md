# Java 异常

![Java 异常](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Java-异常/Java-Throwable.png)

`Throwable` 可以用来表示任何可以作为异常抛出的类，分为两种：`Error` 和 `Exception`。

`Error` 和 `Exception` 的区别：`Error` 通常是灾难性的致命的错误，是程序无法控制和处理的，当出现这些异常时，Java 虚拟机（JVM）一般会选择终止线程；`Exception` 通常情况下是可以被程序处理的，并且在程序中应该尽可能的去处理这些异常。

## Error

`Error` 类对象由 Java 虚拟机生成并抛出，大多数错误与代码编写者所执行的操作无关。例如，Java 虚拟机运行错误（Virtual MachineError），当 JVM 不再有继续执行操作所需的内存资源时，将出现 `OutOfMemoryError`。这些异常发生时，Java 虚拟机（JVM）一般会选择线程终止；还有发生在虚拟机试图执行应用时，如类定义错误（`NoClassDefFoundError`）、链接错误（`LinkageError`）。这些错误是不可查的，因为它们在应用程序的控制和处理能力之外，而且绝大多数是程序运行时不允许出现的状况。对于设计合理的应用程序来说，即使确实发生了错误，本质上也不应该试图去处理它所引起的异常状况。在 Java 中，错误通常是使用 `Error` 的子类描述。

## Exception

`Exception` 分为两种：

- 受检异常：需要用 `try...catch...` 语句捕获并进行处理，并且可以从异常中恢复；
- 非受检异常：是程序运行时错误，包括 `RuntimeException` 及其子类和 `Error`。

**非受检异常为编译器不要求强制处理的异常，检查异常则是编译器要求必须处置的异常，否则编译无法通过。**

`RuntimeException`（运行时异常）包括如 `ArrayIndexOutOfBoundsException`（数组下标越界）、`NullPointerException`（空指针异常）、`ArithmeticException`（算术异常）、`MissingResourceException`（丢失资源）、`ClassNotFoundException`（找不到类）等异常，这些异常是非受检异常，程序中可以选择捕获处理，也可以不处理。这些异常一般是由程序逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生。

`RuntimeException` 之外的异常我们统称为受检异常，类型上属于 `Exception` 类及其子类，从程序语法角度讲是必须进行处理的异常，如果不处理，程序就不能编译通过。如 `IOException`、`SQLException` 等以及用户自定义的 `Exception` 异常。
