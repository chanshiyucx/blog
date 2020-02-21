# volatile 关键字

**`volatile` 关键字使一个变量在多个线程间可见。**

A、B 线程都有用到一个变量，java 默认是 A 线程缓冲区保留一份 copy，这样如果 B 线程修改了变量，则 A 线程未必知道。使用 `volatile` 关键字，当 B 线程修改了变量的值，会告知 A 线程缓冲区的变量已过期，A 线程就会刷新缓冲区，从主内存中读到变量的修改值（修改 -> 通知 -> 刷新）。

```java
public class T {

    // 不加 volatile，程序永远不会停下
    /* volatile */ boolean running = true;

    public void m() {
        System.out.println("m start");
        while (running) {
            System.out.println("running");
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("m end");
    }

    public static void main(String[] args) {
        T t = new T();
        new Thread(t::m).start();

        /*
          需要注意，如果直接执行 t.m() 而不是另起线程，那么无论是否加 volatile，程序都不会停下，循环判断中的 running 一直为 true
        */

        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        t.running = false;
        System.out.println(t.running);
    }

}
```
