# Note

## 001 解除 chrome 浏览器的跨域限制

```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

## 002 Cmder

添加到右键，管理员运行：

```sh
Cmder.exe /REGISTER ALL
```

修改 bash 启动：

```
<!-- bash::bash -->
cmd /c ""C:\Program Files\Git\bin\sh.exe" --login -i"

<!-- bash::bash as Admin -->
*cmd /c ""C:\Program Files\Git\bin\sh.exe" --login -i"
```
