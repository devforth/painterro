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
def base64_page():
    files = reversed(
        sorted(
            [f for f in os.listdir(get_tmp_dir()) if f.endswith('png')]))
    return render_template('paste_as_base64.html', files=files)


@app.route("/bin/")
def bin_page():
    files = reversed(
        sorted(
            [f for f in os.listdir(get_tmp_dir()) if f.endswith('png')]))
    return render_template('paste_as_bin.html', files=files)


@app.route("/paste/")
def paste_page():
    return render_template('paste_to_tinymce.html')


@app.route("/save-as-base64/", methods=['POST'])
def base64_saver():
    filename = '{:10d}.png'.format(int(time()))  # generate some filename
    filepath = os.path.join(get_tmp_dir(), filename)
    with open(filepath, "wb") as fh:
        base64_data = request.json['image'].replace('data:image/png;base64,', '')
        fh.write(base64.b64decode(base64_data))

    return jsonify({})


@app.route("/save-as-binary/", methods=['POST'])
def binary_saver():
    filename = '{:10d}.png'.format(int(time()))  # generate some filename
    filepath = os.path.join(get_tmp_dir(), filename)
    request.files['image'].save(filepath)

    return jsonify({})


@app.route('/image/<path:filename>')
def get_file(filename):
    return send_from_directory(get_tmp_dir(), filename)

print("""
====================================================================
||                WELCOME TO  THE PAINTERRO DEMO                  ||
||  To make this work, please go to painterro root dir, and run"  ||
||                                                                ||
||    npm install                                                 ||
||    npm run dev                                                 ||
====================================================================
""")

app.run()

