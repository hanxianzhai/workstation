开发语言及版本:
python 3.x

安装环境依赖:
pip install -r requirements.txt

启动项目:
python setup.py

访问:
http://localhost:8080

项目截图:

![](https://raw.githubusercontent.com/ComingPass/AssetManager/master/docs/pics/asset_manager.jpg)

使用方式:

外部网络请求:

|  key   |                            value                             |
| :----: | :----------------------------------------------------------: |
|  url   | http://xxx.com/general_asset_manage_system/data_manage/select_data |
| method |                             POST                             |
|  body  |                {"asset_type_str":"资产名称"}                 |

响应:
{"data": [], "total": 0}