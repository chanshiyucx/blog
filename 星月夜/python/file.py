import os
import platform
import subprocess
import requests
import shutil


# 获取或创建文件夹
def get_or_create_folder():
    base_folder = os.path.abspath(os.path.dirname(__file__))
    folder = 'pictures'
    full_path = os.path.join(base_folder, folder)

    if not os.path.exists(full_path) or not os.path.isdir(full_path):
        print('Creating new directory at {}'.format(full_path))
        os.mkdir(full_path)

    return full_path


# 打开文件夹
def open_folder(folder):
    print('Displaying cats in OS window.')
    if platform.system() == 'Darwin':
        subprocess.call(['open', folder])
    elif platform.system() == 'Windows':
        subprocess.call(['explorer', folder])
    elif platform.system() == 'Linux':
        subprocess.call(['xdg-open', folder])
    else:
        print("We don't support your os: " + platform.system())


# 保存图片
def download_img(folder, name):
    url = 'https://i.loli.net/2018/12/17/5c17a8b6c43db.jpg'
    data = get_data_from_url(url)
    save_image(folder, name, data)


def get_data_from_url(url):
    response = requests.get(url, stream=True)
    return response.raw


def save_image(folder, name, data):
    file_name = os.path.join(folder, name + '.jpg')
    with open(file_name, 'wb') as fout:
        shutil.copyfileobj(data, fout)
