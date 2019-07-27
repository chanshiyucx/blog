# Git

## 001 设置用户名／邮箱

```bash
git config --list
git config --global user.name [username]
git config --global user.email [email]
```

## 002 配置大小写敏感

```bash
git config core.ignorecase false
```

## 003 生成密钥

```bash
ssh-keygen -t rsa -C [email]
```

## 004 解决"修改文件名大小写"造成的 git 上传文件丢失

```bash
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
