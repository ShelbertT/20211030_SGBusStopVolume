# 本脚本是进行数据提取与结构化的核心部分
from AccessData import read_json_to_ram, write_list_to_csv, write_ram_to_json, read_transport_node_bus_csv
import time


def calculate_routes_per_stop():  # NaN -> .json & dict{list} | 计算每个stop具体有哪些route，返回字典的键是stop code，值是该车站承载的服务list
    routes = read_json_to_ram('routes')
    stop_services = {}  # 用来存放每个stop承载量
    for i in routes:  # 这里的i已经是一个完整的service字典了
        key_list = stop_services.keys()  # 存储stop承载量字典的所有stop值
        this_bus_stop = i['BusStopCode']

        if this_bus_stop in key_list:
            stop_services[f'{this_bus_stop}'].append(i['ServiceNo'])
        elif this_bus_stop not in key_list:
            stop_services[f'{this_bus_stop}'] = [i['ServiceNo']]
    write_ram_to_json(stop_services, 'raw', 'stops_ServicesNo')
    return stop_services


def assign_stop_capacity(stop_services):  # dict{list} -> .json & .csv | 接下来把上面算出的每个站点对于线路数的承载量数据链接回stops
    stops = read_json_to_ram('stops')
    for i in stops:
        this_bus_stop = i['BusStopCode']  # 拿出当前访问到的dict的stop code
        i['Capacity'] = len(stop_services[f'{this_bus_stop}'])
    write_ram_to_json(stops, 'display_dynamic', 'stops_capacity')
    write_list_to_csv(stops, 'stops_capacity')


def get_single_service_volume(service_code):  # string -> float | 根据service code获取这个单一service在当前的每小时车数
    services = read_json_to_ram('services')
    time_now = time.strftime("%H, %M", time.localtime()).split(",")  # 计算现在是什么发车状态
    minute = int(time_now[0]) * 60 + int(time_now[1])
    if 390 <= minute <= 510:  # 0630 - 0830
        freq = 'AM_Peak_Freq'
    elif 510 < minute < 1020:  # 0831 - 1659
        freq = 'AM_Offpeak_Freq'
    elif 1020 <= minute <= 1140:  # 1700 = 1900
        freq = 'PM_Peak_Freq'
    else:  # else
        freq = 'PM_Offpeak_Freq'

    result = 0  # 如果没有这辆车的service信息，说明这期间它发车数是0
    for i in services:
        if i.get('ServiceNo') == service_code:
            freq_str = i.get(freq)
            if freq_str == '-' or freq_str == '00-00' or freq_str == '0-0':
                result = 0
            else:
                freq_str = freq_str.split('-')
                if len(freq_str) == 1:  # 如果这个间隔不是范围而是确定值
                    result = float(freq_str[0])
                else:
                    result = round(60/((int(freq_str[1]) + int(freq_str[0]))/2), 2)  # 先计算这一时期平均发车间隔，再计算1h内车数，然后取两位小数
            break
        else:
            continue
    # print(result)
    return result


def get_service_volume():  # NaN -> .json & dict  | 查询每个service的volume，输出一个字典，减少调用计算realtime volume的次数
    stop_services = read_json_to_ram('stops_ServicesNo')
    stop_services_keys = stop_services.keys()
    entire_service_list = []  # 从这里开始先用列表把不重复的站点取出来
    for key in stop_services_keys:
        this_stop = stop_services[f'{key}']
        for service_code in this_stop:
            if service_code in entire_service_list:
                continue
            else:
                entire_service_list.append(service_code)

    entire_service_volume = {}  # 用字典存储service code以及其对应的volume
    for service_code in entire_service_list:
        entire_service_volume[f'{service_code}'] = get_single_service_volume(service_code)

    write_ram_to_json(entire_service_volume, 'raw', 'all_service_volume')
    return entire_service_volume


def calculate_bus_volume_per_hour_per_stop():  # NaN -> list[dict] | 计算每个车站的车流量，返回被赋值后的车站表
    stop_ServicesNo = calculate_routes_per_stop()
    stops = read_json_to_ram('stops')
    service_volume = get_service_volume()
    # print(service_volume)
    for stop in stops:
        service_list = stop_ServicesNo.get(stop['BusStopCode'])  # 取出了servicesNo里面记录了该公交站承载线路的键值对
        bus_volume = 0
        for service_code in service_list:
            bus_volume += service_volume[f'{service_code}']
        stop['BusVolume'] = round(bus_volume, 2)

    write_ram_to_json(stops, 'display_dynamic', 'stops_bus_volume')
    return stops


def calculate_human_volume_alltime():  # NaN -> .json | 结构化人流量表，生成两个包含了全部时间情况的表
    weekday, holiday = read_transport_node_bus_csv('transport_node_bus_202108')
    for table in [weekday, holiday]:
        human_volume_by_stop = {}
        table_type = table[0][1]
        for row in table:  # 取出所有的站点编号，并且去重
            existing_stops = human_volume_by_stop.keys()
            hour = row[2]
            stop_code = row[4]
            volume = int(row[5]) + int(row[6])
            if stop_code not in existing_stops:
                human_volume_by_stop[f'{stop_code}'] = {f'{hour}': f'{volume}'}
            elif stop_code in existing_stops:
                human_volume_by_stop[f'{stop_code}'][f'{hour}'] = f'{volume}'

        if table_type == 'WEEKDAY':
            filename = 'human_volume_weekday'
        elif table_type == 'WEEKENDS/HOLIDAY':
            filename = 'human_volume_holiday'
        write_ram_to_json(human_volume_by_stop, 'raw', filename)


def get_current_human_volume():  # NaN -> .json | 直接从本地文件获取数据，读取当前车站人流量，赋值回车站
    calculate_human_volume_alltime()
    assign_coords_to_human_volume_alltime()

    time_now = time.strftime("%a,%H", time.localtime()).split(",")  # 先把time以及读哪张表给处理了
    hour = time_now[1]
    if time_now[0] == 'Sat' or time_now[0] == 'Sun':
        volume_alltime = read_json_to_ram('human_volume_holiday', 'raw')
    else:
        volume_alltime = read_json_to_ram('human_volume_weekday', 'raw')
    # print(volume_alltime)
    stops = read_json_to_ram('stops')
    item_id = -1
    for stop in stops:
        item_id += 1
        stop_code = stop['BusStopCode']
        try:
            stop['HumanVolume'] = int(volume_alltime[f'{stop_code}'][f'{hour}'])
        except:
            stop['HumanVolume'] = 0

    write_ram_to_json(stops, 'display_dynamic', 'stops_human_volume')


def calculate_bus_human_balance():  # NaN -> .json | 计算车-人平衡压力，这个balance值越高说明人类给出的压力越大
    bus_volume = read_json_to_ram('stops_bus_volume', 'display_dynamic')
    human_volume = read_json_to_ram('stops_human_volume', 'display_dynamic')
    stops = read_json_to_ram('stops')
    index = 0
    for stop in stops:
        try:
            balance = human_volume[index]['HumanVolume'] / bus_volume[index]['BusVolume']
        except:
            balance = 0
        stop['Balance'] = round(balance, 2)
        index += 1
    write_ram_to_json(stops, 'display_dynamic', 'stops_balance')


def assign_coords_to_human_volume_alltime():  # NaN -> .json | 把之前的人流量拿出来赋个坐标，之前忘记搞了
    empty_stop = {}  # 先创建一个空站台的字典，后面赋值给查不到的stopCode，这样后面js读取数据的时候所有站台的字典格式就是统一的，不存在空值
    for i in range(24):
        empty_stop[f'{i}'] = 0

    stops = read_json_to_ram('stops')
    for i in ['holiday', 'weekday']:
        volume = read_json_to_ram(f'human_volume_{i}')
        for stop in stops:
            stop_code = stop['BusStopCode']
            try:
                stop['VolumeAlltime'] = volume[f'{stop_code}']
            except:
                stop['VolumeAlltime'] = empty_stop
        write_ram_to_json(stops, 'display_static', f'human_volume_{i}_coords')


if __name__ == "__main__":
    assign_coords_to_human_volume_alltime()

