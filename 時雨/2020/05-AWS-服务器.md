# AWS 服务器

## 登录

```shell
# ssh -i [pem.file] [user]@[ip]
ssh -i LightsailDefaultKey-ap-southeast-1.pem centos@18.141.12.215
```

## 文件传输

```shell
scp -rp -i yourfile.pem ~/local_directory username@instance_url:directory
```
