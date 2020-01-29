import os

import yaml

import config

project_root_path = os.getcwd()  # 项目根目录

app_conf = {}


def init():
    with open(os.path.join(project_root_path, "configs", "application.yml")) as f:
        config.app_conf = yaml.safe_load(f.read())
    print("app_conf: ", app_conf)


endpoint_list_data = None
access_control__group_struct_has_auth_term = {}
access_control__group_struct_has_static_page = {}
