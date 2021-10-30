# 本文档编写了数据的访问手段、写入json数据库的手段、写入csv进行数据交换的手段
import requests
import json
import csv
import time
import os
import sys
import urllib


# 本脚本通用数据交换格式：JSON <--> list嵌套dict
def get_folder_path(folder):
    raw_data_folder = './database/raw'
    csv_data_folder = './database/csv'
    display_static_data_folder = './database/display/static'
    display_dynamic_data_folder = './database/display/dynamic'
    if folder == 'raw':
        result = raw_data_folder
    elif folder == 'csv':
        result = csv_data_folder
    elif folder == 'display_static':
        result = display_static_data_folder
    elif folder == 'display_dynamic':
        result = display_dynamic_data_folder
    return result


def get_raw_data(short_name):  # string -> list[dict] | 到网站读取原始数据
    if short_name == 'services':
        name = 'BusServices'
    elif short_name == 'routes':
        name = 'BusRoutes'
    elif short_name == 'stops':
        name = 'BusStops'

    headers = {'AccountKey': 'WJbz7bLWSnWizpfxHFKhHg==', 'accept': 'application/json'}
    response_number = 500
    skip = 0
    final_response = []
    while response_number == 500:
        url = f'http://datamall2.mytransport.sg/ltaodataservice/{name}?&$skip={skip}'
        resp = requests.get(url, headers=headers)
        value = resp.json().get("value")  # value是一个由多个dict元素组成的list

        final_response.extend(value)
        response_number = len(value)
        skip += 500
    return final_response  # 把所有的value都加进同一个list中进行返还


def get_raw_arrival_data():  # 读取目前的全部stop，获取每个stop的车辆到达数据
    headers = {'AccountKey': 'WJbz7bLWSnWizpfxHFKhHg==', 'accept': 'application/json'}
    stops = read_json_to_ram('stops')
    entire_list = []
    for stop in stops:
        stop_code = stop['BusStopCode']
        url = f'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?&BusStopCode={stop_code}'
        resp = requests.get(url, headers=headers)
        value = resp.json()["Services"]  # value是一个由多个dict元素组成的list
        entire_list.append(value)
    return entire_list


def write_list_to_csv(list_content, filename):  # list[dict], string -> .csv | 把通用格式写入csv
    folder = get_folder_path('csv')
    with open(f'{folder}/{filename}.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        keys_list = list_content[0].keys()
        writer.writerow(keys_list)  # 写表头

        for dict in list_content:  # 写数据
            dict_values = dict.values()
            writer.writerow(dict_values)


def write_ram_to_json(list_content, folder, filename):  # list[dict], string -> .csv | 把list套dict格式写入本地json文件
    folder_path = get_folder_path(folder)
    with open(f"{folder_path}/{filename}.json", "w", encoding='utf-8') as f:
        # json.dump(dict_var, f)  # 写为一行
        json.dump(list_content, f, indent=2, sort_keys=True, ensure_ascii=False)  # 写为多行


def read_json_to_ram(filename, folder='raw'):  # string -> list[dict] | 把json文件还原成刚读下来的list套dict格式
    # 可选参数：services, routes, stops
    folder_path = get_folder_path(f'{folder}')
    with open(f"{folder_path}/{filename}.json", "r", encoding='utf-8') as f:
        resp = json.load(f)
        return resp


def download_data(data_name):  # string -> .json| 在线获取实时数据
    # 可选参数：services, routes, stops, arrivals
    if data_name == 'arrivals':
        data = get_raw_arrival_data()
    else:
        data = get_raw_data(f'{data_name}')
    write_ram_to_json(data, 'raw', f'{data_name}')


def read_transport_node_bus_csv(filename):  # string -> 2 2d-list | 把csv读成 [row, row, row]的二维列表，索引先访问行再访问列，返回两个表：工作日、非工作日
    folder_path = get_folder_path('raw')
    weekday = []
    holiday = []
    with open(f'{folder_path}/{filename}.csv', 'r') as f:
        reader = csv.reader(f)
        for i in reader:
            if i[1] == 'WEEKDAY':
                weekday.append(i)
            elif i[1] == 'WEEKENDS/HOLIDAY':
                holiday.append(i)

    return weekday, holiday


if __name__ == "__main__":
    read_transport_node_bus_csv('transport_node_bus_202108')
