# 本文档是网页发起更新的起点，统一规定：只有执行update的时候才会去执行download，其他功能的函数一律直接读取数据。
from AccessData import download_data
from CombineData import calculate_routes_per_stop, calculate_bus_volume_per_hour_per_stop, assign_stop_capacity, \
    get_current_human_volume, calculate_bus_human_balance
from WriteJSDB import write_json_to_js


def execute_capacity_update():  # 对站点实时线路数进行更新
    stop_services = calculate_routes_per_stop()
    assign_stop_capacity(stop_services)


def execute_bus_volume_update():  # 对站点每小时bus数量进行更新
    calculate_bus_volume_per_hour_per_stop()


def execute_human_volume_update():  # 对人流量与人-车平衡更新
    get_current_human_volume()
    calculate_bus_human_balance()


def main():
    download_data('routes')
    download_data('stops')
    download_data('services')
    execute_bus_volume_update()
    execute_capacity_update()
    execute_human_volume_update()


if __name__ == "__main__":
    download_data('routes')
    download_data('stops')
    download_data('services')
    execute_bus_volume_update()
    execute_capacity_update()
    execute_human_volume_update()

    write_json_to_js()
    # 结束后会遍历display下所有文件，写入js能够读取到的格式
