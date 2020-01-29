# 加载config
import config

config.init()

import os

import urllib3
from flask_cors import CORS

urllib3.disable_warnings()
# 初始化服务器
from flask import Flask, redirect
import logging
from logging.handlers import TimedRotatingFileHandler

app = Flask(__name__)

app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = os.urandom(24)

CORS(app, supports_credentials=True)


@app.route('/<path:path>')
def static_path(path):
    return app.send_static_file(path)


@app.route('/')
def index():
    return redirect("/index.html")

# 初始化路由
# # 加载
from service import metadata_manage
from service import data_manage

# # 注册
app.register_blueprint(metadata_manage.app)
app.register_blueprint(data_manage.app)

# 初始化日志
if not os.path.exists("logs"):
    os.mkdir("logs")
formatter = logging.Formatter(
    "[%(asctime)s][%(filename)s:%(lineno)d][%(levelname)s][%(thread)d] - %(message)s")
handler = TimedRotatingFileHandler(
    "logs/flask.log", when="D", interval=1, backupCount=15,
    encoding="UTF-8", delay=False, utc=True)
app.logger.addHandler(handler)
handler.setFormatter(formatter)
