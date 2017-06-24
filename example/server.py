import base64
import os
import tempfile
from time import time
from flask import Flask, jsonify
from flask.globals import request
from flask.helpers import send_from_directory
from flask.templating import render_template

app = Flask(__name__)

TMP_DIR_NAME = 'painterro_server'


def get_tmp_dir():
    d = os.path.join(tempfile.gettempdir(), TMP_DIR_NAME)
    if not os.path.exists(d):
        os.makedirs(d)
    return d


@app.route("/")
def home():
    files = reversed(
        sorted(
            [f for f in os.listdir(get_tmp_dir()) if f.endswith('png')]))
    return render_template('main.html', files=files)


@app.route("/save-as-base64/", methods=['POST'])
def saver():
    filename = '{:010d}.png'.format(int(time()))
    filepath = os.path.join(get_tmp_dir(), filename)
    with open(filepath, "wb") as fh:
        base64_data = request.json['image'].replace('data:image/png;base64,', '')
        fh.write(base64.b64decode(base64_data))

    return jsonify({})


@app.route('/image/<path:filename>')
def get_file(filename):
    return send_from_directory(get_tmp_dir(), filename)

app.run()
