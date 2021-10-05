#-*- coding:utf-8 -*-

#-------Internal_libs-------
import os
import json
import mimetypes
import configparser
#-------External_libs-------
import flask
from flask import Flask, request, send_from_directory
#-----------------------------------------
PATH_TO_CONF='conf/ConfigFile.properties'
PATH_TO_STATIC='/static'
PARAM_OF_MAIN_PATH='start.path'
SUB_PATH='js'
#-----------------------------------------
#app = Flask(__name__, static_url_path=PATH_TO_STATIC, static_folder='static')
app = Flask(__name__, static_url_path=PATH_TO_STATIC)

@app.route("/getBaseStructure/", methods=['GET'])
def getBaseStructure():
    mapOfDir = dict()
    target_prop = readProp(PARAM_OF_MAIN_PATH)#Проверить/уточнить что возвращает для разных случае. Если есть в файле параметр но не указан. Если нет в файле такой переменной.    
    if not target_prop:
        return "Isn`t correct path to target folder or the config file doesn`t contain relates property!"
    print_content_of_dir(target_prop, mapOfDir)
    return json.dumps(mapOfDir)

@app.route("/", methods=['GET'])
def getStart():
    return app.send_static_file('index.html')#return send_from_directory('static', 'index.html', cache_timeout=0)

@app.route("/<path:path>", methods=['GET'])
def getStatic(path):
    return app.send_static_file(path)#return send_from_directory('static', path, cache_timeout=0)

@app.route("/getFile/<path:name>", methods=['GET'])
def getFile(name):
    target_prop = readProp(PARAM_OF_MAIN_PATH)
    resultPath = os.path.join(target_prop, SUB_PATH)
    relativePath = os.path.relpath(resultPath, start=target_prop)
    print("\t\tresultPath ===== {0}".format(str(resultPath)))
    print("\t\trelativePath ===== {0}".format(str(relativePath)))
    return send_from_directory(directory=resultPath, filename=name, cache_timeout=0)

def print_content_of_dir(path, parentMap):
    try:
        list_of_dir = os.listdir(path)
    except FileNotFoundError as e:
        flask.abort(flask.Response('Указанный файл не найден. Либо неверно задан путь для корневого каталога.<br> Перехватили исключение = {0}'.format(e)))

    list_of_dir.sort(key=lambda x: 1 if os.path.isfile(os.path.join(path, x)) else 2)#Сортируем, сначала будут идти файлы, потом будут идти каталоги (сортировка исключительно по типу файл/каталог, без алфавита)
    for element in list_of_dir:
        absPath = os.path.join(path, element)
        relativePath = os.path.relpath(absPath, start=readProp(PARAM_OF_MAIN_PATH))

        if (os.path.isdir(absPath)):
            tmpMapOfDIr = dict()#Если только дирректория, то мы это переменную объявляем, а так она не известна.
            parentMap[str(element)] = {'path':relativePath, 'dict':tmpMapOfDIr}
            print_content_of_dir(absPath, tmpMapOfDIr)
        else:
            parentMap[str(element)] = relativePath#parentMap[str(element)] = mimetypes.guess_type(str(element))

def readProp(propName, propSection='Path'):
    config = configparser.RawConfigParser()
    config.read(PATH_TO_CONF)
    target_prop = config.get(propSection, propName)
    return target_prop

if __name__ == '__main__':
    app.run()
