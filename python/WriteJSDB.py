# 本文档负责处理数据库与把数据写入JS
import os
import json

source = './database/display'
destination = './database/js_data'


def mkdir(path):
    try:
        os.makedirs(f'{path}')
    except:
        return


def write_ram_to_js(data, directory):  # 暂时只支持二级文件
    folder = directory.split('\\')[1]
    filename = directory.split('\\')[2].split('.')[0]
    result = [f'var {filename} =\n']
    mkdir(f'{destination}/{folder}')
    with open(f'{destination}/{folder}/{filename}.js', 'w') as f:
        f.writelines(result)
        json.dump(data, f, indent=2, sort_keys=True, ensure_ascii=False)


def write_json_to_js():
    for root, dirs, files in os.walk(f"{source}"):
        count = 0
        for file in files:
            file = os.path.join(root, file)
            with open(f"{file}", "r", encoding='utf-8') as f:
                resp = json.load(f)
                write_ram_to_js(resp, file)


if __name__ == "__main__":
    write_json_to_js()