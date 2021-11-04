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
LIST_OF_EXTENSIONS = ['log', 'java', 'txt', 'sh', 'list', 'conf', 'functions', 'py', 'rb', 'sql', 'properties', 'txt_tmp', 'info', 'js', 'json']
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
    startPathFromProp = readProp(PARAM_OF_MAIN_PATH)
    fullPathOfFile = os.path.join(startPathFromProp, name)
    inferedMime = inferMimeType(fullPathOfFile)

    print("\t\tstartPathFromProp ===== {0}".format(str(startPathFromProp)))
    print("\t\tpathForMimeType ===== {0}".format(str(fullPathOfFile)))
    print("\t\tName of file from request ===== {0}".format(str(name)))
    print("\t\tmimeType ===== {0}".format(str(inferedMime)))

    if (inferedMime):
        return send_from_directory(directory=startPathFromProp, path=name, max_age=0, mimetype=inferedMime)
    else:
        return send_from_directory(directory=startPathFromProp, path=name, max_age=0)

def inferMimeType(pathOfFileForGetMimeType):
    fileName = os.path.basename(pathOfFileForGetMimeType)	
    list_of_file_name = str(fileName).split('.')
    extensionOfFile=list_of_file_name[len(list_of_file_name)-1]
    if(extensionOfFile in LIST_OF_EXTENSIONS):
        return 'text/plain'
    guestedMimeType = mimetypes.guess_type(pathOfFileForGetMimeType)    
    pieceContainsMimeType = guestedMimeType[0]
    return pieceContainsMimeType

def print_content_of_dir(path, listOfElementsForFill):
    try:
        list_of_dir = os.listdir(path)
    except FileNotFoundError as e:
        flask.abort(flask.Response('Указанный файл не найден. Либо неверно задан путь для корневого каталога.<br> Перехватили исключение = {0}'.format(e), status=404))

    list_of_dir.sort(key=lambda x: 1 if os.path.isfile(os.path.join(path, x)) else 2)

    for element in list_of_dir:
        absPath = os.path.join(path, element)
        relativePath = os.path.relpath(absPath, start=readProp(PARAM_OF_MAIN_PATH))

        if (os.path.isdir(absPath)):
            tmpListOfElements = list()
            mapForInsert = {
                'type': 'd',
                'key': time.time(),
                'name': str(element),
                'path': relativePath,
                'children': tmpListOfElements
            }
            listOfElementsForFill.append(mapForInsert)
            print_content_of_dir(absPath, tmpListOfElements)
        else:
            mapForInsert = {
                'type': 'f',
                'key': time.time(),
                'name': str(element),
                'path': relativePath,
                'mime': inferMimeType(absPath)
            }
            listOfElementsForFill.append(mapForInsert)

def readProp(propName, propSection='Path'):
    config = configparser.RawConfigParser()
    config.read(PATH_TO_CONF)
    target_prop = config.get(propSection, propName)
    return target_prop


if __name__ == '__main__':
    app.run(host="0.0.0.0", port="8088")
