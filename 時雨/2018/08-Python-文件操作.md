# Python 文件操作

趁工作闲暇将之前用 Nodejs 写的微博爬虫用 Python 重构了一遍，可以算是入门 Python 的第一个练手作，虽然磕磕碰碰踩了不少坑，基本功能还算完成，这里记录一些实用方法。

## 文件操作

爬虫的核心登录模块复用了 Github 开源的第三方库，然后自己添加了 html 解析和文件保存预览的功能，爬虫涉及到的文件操作技巧记一下小本本。

### 获取或创建文件夹

```python
import os

def get_or_create_folder():
    base_folder = os.path.abspath(os.path.dirname(__file__))
    folder = 'pictures' # 需要获取或打开的文件夹
    full_path = os.path.join(base_folder, folder)

    if not os.path.exists(full_path) or not os.path.isdir(full_path):
        print('Creating new directory at {}'.format(full_path))
        os.mkdir(full_path)

    return full_path
```

### 打开文件或文件夹

```python
import platform
import subprocess

def open_folder(folder):
    print('Displaying cats in OS window.')
    os_name = platform.system()
    if os_name == 'Darwin':
        subprocess.call(['open', folder])
    elif os_name == 'Windows':
        subprocess.call(['explorer', folder])
    elif os_name == 'Linux':
        subprocess.call(['xdg-open', folder])
    else:
        print("We don't support your os: " + os_name)
```

### 下载图片

```python
import os
import requests
import shutil

def download_img(folder, name, url):
    data = get_data_from_url(url)
    save_image(folder, name, data)


def get_data_from_url(url):
    response = requests.get(url, stream=True)
    return response.raw


def save_image(folder, name, data):
    file_name = os.path.join(folder, name + '.jpg')
    with open(file_name, 'wb') as fout:
        shutil.copyfileobj(data, fout)
```
