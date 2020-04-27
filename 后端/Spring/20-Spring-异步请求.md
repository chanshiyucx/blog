# Spring 异步请求

官方文档 [Asynchronous Request Processing](https://docs.spring.io/spring/docs/4.3.26.RELEASE/spring-framework-reference/htmlsingle/#mvc-ann-async)

## Servlet3.0

1. A `ServletRequest` can be put in asynchronous mode by calling `request.startAsync()`. The main effect of doing so is that the Servlet, as well as any Filters, can exit but the response will remain open to allow processing to complete later.
2. The call to `request.startAsync()` returns `AsyncContext` which can be used for further control over async processing. For example it provides the method dispatch, that is similar to a forward from the Servlet API except it allows an application to resume request processing on a Servlet container thread.
3. The `ServletRequest` provides access to the current `DispatcherType` that can be used to distinguish between processing the initial request, an async dispatch, a forward, and other dispatcher types.

```java
//1、支持异步处理asyncSupported=true
@WebServlet(value="/async",asyncSupported=true)
public class HelloAsyncServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //2、开启异步模式
        AsyncContext startAsync = req.startAsync();

        //3、业务逻辑进行异步处理，开始异步处理
        startAsync.start(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(3000);
                    startAsync.complete();
                    //4、获取到异步上下文
                    AsyncContext asyncContext = req.getAsyncContext();
                    //5、获取响应
                    ServletResponse response = asyncContext.getResponse();
                    response.getWriter().write("hello async...");
                } catch (Exception e) {
                }
            }
        });
    }
}
```

## Callable

With the above in mind, the following is the sequence of events for async request processing with a Callable:

1. Controller returns a `Callable`.
2. Spring MVC starts asynchronous processing and submits the `Callable` to a `TaskExecutor` for processing in a separate thread.
3. The `DispatcherServlet` and all Filter’s exit the Servlet container thread but the response remains open.
4. The `Callable` produces a result and Spring MVC dispatches the request back to the Servlet container to resume processing.
5. The `DispatcherServlet` is invoked again and processing resumes with the asynchronously produced result from the `Callable`.

```java
@PostMapping
public Callable<String> processUpload(final MultipartFile file) {

    return new Callable<String>() {
        public String call() throws Exception {
            // ...
            return "someView";
        }
    };

}
```

## DeferredResult

The sequence for `DeferredResult` is very similar except it’s up to the application to produce the asynchronous result from any thread:

1. Controller returns a `DeferredResult` and saves it in some in-memory queue or list where it can be accessed.
2. Spring MVC starts async processing.
3. The `DispatcherServlet` and all configured Filter’s exit the request processing thread but the response remains open.
4. The application sets the `DeferredResult` from some thread and Spring MVC dispatches the request back to the Servlet container.
5. The `DispatcherServlet` is invoked again and processing resumes with the asynchronously produced result.

```java
@RequestMapping("/quotes")
@ResponseBody
public DeferredResult<String> quotes() {
    DeferredResult<String> deferredResult = new DeferredResult<String>();
    // Save the deferredResult somewhere..
    return deferredResult;
}

// In some other thread...
deferredResult.setResult(data);
```
