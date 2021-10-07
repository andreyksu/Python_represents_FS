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
# -----------------------------------------
PATH_TO_CONF = 'conf/ConfigFile.properties'
PATH_TO_STATIC = '/static'
PARAM_OF_MAIN_PATH = 'start.path'
SUB_PATH=''
# -----------------------------------------
#app = Flask(__name__, static_url_path=PATH_TO_STATIC, static_folder='static')
app = Flask(__name__, static_url_path=PATH_TO_STATIC)


@app.route("/getBaseStructure/", methods=['GET'])
def getBaseStructure():
    mapOfDir = list()
    # Проверить/уточнить что возвращает для разных случае. Если есть в файле параметр но не указан. Если нет в файле такой переменной.
    target_prop = readProp(PARAM_OF_MAIN_PATH)
    if not target_prop:
        return "Isn`t correct path to target folder or the config file doesn`t contain relates property!"
    print_content_of_dir(target_prop, mapOfDir)
    return json.dumps(mapOfDir)


@app.route("/", methods=['GET'])
def getStart():
    # return send_from_directory('static', 'index.html', cache_timeout=0)
    return app.send_static_file('index.html')


@app.route("/<path:path>", methods=['GET'])
def getStatic(path):
    # return send_from_directory('static', path, cache_timeout=0)
    return app.send_static_file(path)


@app.route("/getFile/<path:name>", methods=['GET'])
def getFile(name):
    target_prop = readProp(PARAM_OF_MAIN_PATH)
    #resultPath = os.path.join(target_prop, SUB_PATH)
    resultPath = target_prop
    relativePath = os.path.relpath(resultPath, start=target_prop)
    pathForMimeType = os.path.join(resultPath, name)#Получаем полный путь от корня. Т.е. заданный путь + полученныф путь для файла.
    fileName = os.path.basename(pathForMimeType)

    print("\t\tresultPath ===== {0}".format(str(resultPath)))
    print("\t\trelativePath ===== {0}".format(str(relativePath)))
    print("\t\tpathForMimeType ===== {0}".format(str(pathForMimeType)))
    print("\t\tfileName ===== {0}".format(str(fileName)))
    print("\t\tFrom Request name ===== {0}".format(str(name)))

    mimeType = mimetypes.guess_type(pathForMimeType)
    onlyMimeType = mimeType[0]
    print("\t\tmimeType ===== {0}".format(str(mimeType)))
    print("\t\tonlyMimeType ===== {0}".format(str(onlyMimeType)))

    listOfExtension = ['log', 'java', 'txt', 'sh', 'list', 'conf', 'functions', 'py', 'rb', 'sql', 'properties']
    list_of_file_name = str(fileName).split('.')
    extensionOfFile=list_of_file_name[len(list_of_file_name)-1]

    if (onlyMimeType):
        return send_from_directory(directory=resultPath, path=name, max_age=0, mimetype=onlyMimeType)#В Flask 2.1 были заменены filename > path и cache_timeout > max_age
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

    # Сортируем, сначала будут идти файлы, потом будут идти каталоги (сортировка исключительно по типу файл/каталог, без алфавита)
    list_of_dir.sort(key=lambda x: 1 if os.path.isfile(
        os.path.join(path, x)) else 2)
    for element in list_of_dir:
        absPath = os.path.join(path, element)
        relativePath = os.path.relpath(
            absPath, start=readProp(PARAM_OF_MAIN_PATH))

        if (os.path.isdir(absPath)):
            # В том случае, если только дирректория, то мы это переменную объявляем, а так она не известна.
            tmpMapOfDIr = list()
            #parentMap[str(element)] = {'path':relativePath, 'dict':tmpMapOfDIr}
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
            #parentMap[str(element)] = relativePath
            #parentMap[str(element)] = mimetypes.guess_type(str(element))


def readProp(propName, propSection='Path'):
    config = configparser.RawConfigParser()
    config.read(PATH_TO_CONF)
    target_prop = config.get(propSection, propName)
    return target_prop


if __name__ == '__main__':
    app.run()
