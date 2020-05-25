# IDEA 高效指南

## 必装工具

- [Free MyBatis plugin](https://plugins.jetbrains.com/plugin/8321-free-mybatis-plugin)
- [MyBatisCodeHelperPro](https://plugins.jetbrains.com/plugin/9837-mybatiscodehelperpro)
- [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok)
- [Material Theme UI](https://plugins.jetbrains.com/plugin/8006-material-theme-ui/)
- [RestfulToolkit](https://plugins.jetbrains.com/plugin/10292-restfultoolkit)
- [Maven Helper](https://plugins.jetbrains.com/plugin/7179-maven-helper)

## 常用快捷键

| 快捷键                 | 描述                                   |
| :--------------------- | :------------------------------------- |
| CTRL + Y               | 删除当前行                             |
| CTRL + P               | 提示方法参数                           |
| CTRL + I               | 实现接口方法                           |
| CTRL + H               | 查看当前类的子类                       |
| CTRL + -               | 折叠/展开代码，加 `SHIFT` 全局展开折叠 |
| CTRL + F12             | 弹出当前类所有属性和方法               |
| CTRL + O               | 重写或者实现接口或父类方法             |
| CTRL + ALT + O         | 移除未使用包                           |
| CTRL + ALT + U         | 类之间关系拓扑图                       |
| CTRL + ALT + T         | 语句快捷键                             |
| CTRL + SHIFT + ALT + N | 查找类名                               |
| CTRL + SHIFT + ENTER   | 换行                                   |
| CTRL + SHIFT + U       | 大小写转换                             |
| ALT + 左右箭头         | 切换窗口                               |

## 演出模式

使用【Presentation Mode】，将 IDEA 弄到最大，可以让你只关注一个类里面的代码，进行毫无干扰的 coding。

可以使用 `CTRL+ 反引号` 或 `ALT+V`快捷键，弹出 View 视图，然后选择`Enter Presentation Mode`，退出同理。

配合使用：`CTRL+E` 弹出最近使用的文件，又或者使用 `CTRL+N` 和 `CTRL+SHIFT+N` 定位文件。

## Inject language

如果你使用 IDEA 在编写 JSON 字符串的时候，需要一个一个 `\` 去转义双引号的话，又烦又容易出错。在 IDEA 可以使用 Inject language 帮我们自动转义双引号。

先将焦点定位到双引号里面，使用 `ALT+Enter` 快捷键弹出 inject language 视图，并选中 `Inject language or reference`。搜索选择需要编辑的语言，比如 JSON，再次使用 `ALT+Enter` 进入编辑模式。`CTRL+F4 快捷键退出`。

## 批量修改

使用 `CTRL+w` 选中文本，然后依次使用 `ALT+J` 快捷键，逐个选中，这样多个文本就都被选中并且高亮起来了，这个时候就可以直接批量修改了。

`CTRL+SHIFT+ALT+J` 一次全部选中。

## 收尾

直接输入 `CTRL+SHIFT+Enter`，IDEA 会自动帮你收尾，包括 if 语句的大括号或者行尾分号等。

## 定位文件位置

使用 `ALT+F1`，弹出 Select in 视图，然后选择 `Project View` 中的 Project，即可锁定文件位置。`ESC` 或 `F4` 退出 Project 视图。

## 调整侧栏分割线

使用 `ALT+F1`，弹出 Select in 视图，然后选择 `Project View` 中的 Project，`CTRL+SHIFT+左右箭头`。

## IDEA could not autowire

无法解决，只能降低提示等级：

![idea autowired error](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/note/idea-autowired-error.png)

## IDEA 启用 Run Dashboard

修改 `.idea/workspace.xml`，找到 `RunDashboard` 添加下面配置：

```xml
<component name="RunDashboard">
    <option name="configurationTypes">
      <set>
        <option value="SpringBootApplicationConfigurationType" />
      </set>
    </option>
   <!-- ... -->
  </component>
```
