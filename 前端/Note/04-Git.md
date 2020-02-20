# Git

## 设置用户名／邮箱

```shell
git config --list
git config --global user.name [username]
git config --global user.email [email]
```

## 配置大小写敏感

```shell
git config core.ignorecase false
```

## 生成密钥

```shell
ssh-keygen -t rsa -C [email]
```

## 解决"修改文件名大小写"造成的 git 上传文件丢失

```shell
# 1. 让 git 区分大小写
git config core.ignorecase false

# 2. 删除缓存
git rm -r --cached

# 3. 添加当前目录的所有文件
git add .

# 4. 添加提交信息
git commit -m "fix: 修复 git 大小写不敏感造成文件未上传"

# 5. 提交
git push
```

## 分步克隆

克隆最新一次 commit：

```shell
git clone https://xxxxxx.git --depth 1
```

然后克隆剩余所有：

```shell
git remote set-branches origin '*'
git fetch -v
```

或者克隆某一分支：

```shell
git remote set-branches origin 'dev'
git fetch origin dev
git checkout dev
```

## 撤销 Git 操作

### 撤销提交

```shell
git revert HEAD
```

该命令的原理是，在当前提交后面，新增一次提交，抵消掉上一次提交导致的所有变化。它不会改变过去的历史，所以是首选方式，没有任何丢失代码的风险。

`git revert` 命令只能抵消上一个提交，如果想抵消多个提交，必须在命令行依次指定这些提交。比如，抵消前两个提交，要像下面这样写。

```shell
git revert [倒数第一个提交][倒数第二个提交]
```

`git revert` 命令还有两个参数：

- `--no-edit`：执行时不打开默认编辑器，直接使用 Git 自动生成的提交信息。
- `--no-commit`：只抵消暂存区和工作区的文件变化，不产生新的提交。

### 丢弃提交

```shell
git reset [last good SHA]
```

该命令的原理是，让最新提交的指针回到以前某个时点，该时点之后的提交都从历史中消失。

默认情况下，`git reset` 不改变工作区的文件（但会改变暂存区），`--hard` 参数可以让工作区里面的文件也回到以前的状态。

执行 `git reset` 命令之后，如果想找回那些丢弃掉的提交，可以使用 `git reflog` 命令，不过这种做法有时效性，时间长了可能找不回来。

### 替换上一次提交

```shell
git commit --amend -m "Fixes bug #42"
```

该命令的原理是原理是，产生一个新的提交对象，替换掉上一次提交产生的提交对象。

这时如果暂存区有发生变化的文件，会一起提交到仓库。所以，`--amend` 不仅可以修改提交信息，还可以整个把上一次提交替换掉。

### 撤销工作区的文件修改

```shell
git checkout -- [filename]
```

如果工作区的某个文件被改乱了，但还没有提交，可以用 `git checkout` 命令找回本次修改之前的文件。

该命令的原理是原理是，先找暂存区，如果该文件有暂存的版本，则恢复该版本，否则恢复上一次提交的版本。

**注意，工作区的文件变化一旦被撤销，就无法找回了。**

### 从暂存区撤销文件

```shell
git rm --cached [filename]
```

如果不小心把一个文件添加到暂存区，可以用该命令撤销，不影响已经提交的内容。

### 撤销当前分支的变化

如果当前分支上做了几次提交，突然发现放错了分支，这几个提交本应该放到另一个分支，那么可以执行以下操作，撤销当前分支的变化，将这些变化放到一个新建的分支。

```shell
# 新建一个 feature 分支，指向当前最新的提交
# 注意，这时依然停留在当前分支
git branch feature

# 切换到这几次提交之前的状态
git reset --hard [当前分支此前的最后一次提交]

# 切换到 feature 分支
git checkout feature
```
