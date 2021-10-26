# -*- coding:utf-8 -*-

# -------Internal_libs-------
import os
import json
import mimetypes
import configparser
import time
# -------External_libs-------
import flask
from flask import Flask, request, send_from_directory
from flask_cors import CORS
# -------Properies-----------
PATH_TO_CONF = 'conf/ConfigFile.properties'
PATH_TO_STATIC = 'front_content/'#Path espetially for react app.
PARAM_OF_MAIN_PATH = 'start.path'
SUB_PATH=''
# -----------------------------------------
app = Flask(__name__, static_url_path='', static_folder=PATH_TO_STATIC)#Was changed for React APP. When placed with Flask
CORS(app, origins=['http://localhost:3000', 'https://localhost'])#It is for test mode - when work with React app (at coding time)!

@app.route("/getBaseStructure/", methods=['GET'])
def getBaseStructure():
    listOfDir = list()
    target_prop = readProp(PARAM_OF_MAIN_PATH)
    if not target_prop:
        return "Isn`t correct path to target folder or the config file doesn`t contain relates property!"
    print_content_of_dir(target_prop, listOfDir)
    return json.dumps(listOfDir)


@app.route("/", methods=['GET'])
def getStart():
    return app.send_static_file('index.html')


@app.route("/<path:path>", methods=['GET'])
def getStatic(path):
    return app.send_static_file(path)


@app.route("/getFile/<path:name>", methods=['GET'])
def getFile(name):
    target_prop = readProp(PARAM_OF_MAIN_PATH)
    resultPath = target_prop
    relativePath = os.path.relpath(resultPath, start=target_prop)
    pathForMimeType = os.path.join(resultPath, name)
    fileName = os.path.basename(pathForMimeType)

    print("\t\tpathForMimeType ===== {0}".format(str(pathForMimeType)))
    print("\t\tFrom Request name ===== {0}".format(str(name)))

    mimeType = mimetypes.guess_type(pathForMimeType)
    onlyMimeType = mimeType[0]
    print("\t\tmimeType ===== {0}".format(str(mimeType)))

    listOfExtension = ['log', 'java', 'txt', 'sh', 'list', 'conf', 'functions', 'py', 'rb', 'sql', 'properties', 'txt_tmp', 'info']
    list_of_file_name = str(fileName).split('.')
    extensionOfFile=list_of_file_name[len(list_of_file_name)-1]

    if (onlyMimeType):
        return send_from_directory(directory=resultPath, path=name, max_age=0, mimetype=onlyMimeType)
    elif (extensionOfFile in listOfExtension):
        return send_from_directory(directory=resultPath, path=name, max_age=0, mimetype='text/plain')
    else:
        return send_from_directory(directory=resultPath, path=name, max_age=0)

def print_content_of_dir(path, parentMap):
    try:
        list_of_dir = os.listdir(path)
    except FileNotFoundError as e:
        flask.abort(flask.Response(
            'Указанный файл не найден. Либо неверно задан путь для корневого каталога.<br> Перехватили исключение = {0}'.format(e), status=404))

    list_of_dir.sort(key=lambda x: 1 if os.path.isfile(
        os.path.join(path, x)) else 2)
    for element in list_of_dir:
        absPath = os.path.join(path, element)
        relativePath = os.path.relpath(
            absPath, start=readProp(PARAM_OF_MAIN_PATH))

        if (os.path.isdir(absPath)):
            tmpMapOfDIr = list()
            mapForInsert = {
                'type': 'd',
                'key': time.time(),
                'name': str(element),
                'path': relativePath,
                'children': tmpMapOfDIr
            }
            parentMap.append(mapForInsert)
            print_content_of_dir(absPath, tmpMapOfDIr)
        else:
            mapForInsert = {
                'type': 'f',
                'key': time.time(),
                'name': str(element),
                'path': relativePath
            }
            parentMap.append(mapForInsert)

def readProp(propName, propSection='Path'):
    config = configparser.RawConfigParser()
    config.read(PATH_TO_CONF)
    target_prop = config.get(propSection, propName)
    return target_prop


if __name__ == '__main__':
    app.run(host="0.0.0.0", port="8088")
