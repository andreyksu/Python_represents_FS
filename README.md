# represent_FS

Represents content of File System via Python---Flask + JS---React.
The aim - show result of test (that placed at file system) via Web for convenience.

### Instruction for FrontEnd:

* Install NodeJS (install yarn. In this project will be used the yarn);
    * Create folder;
    * Put the content of folder "./Front_react" to the created folder;
    * At file "./Front_react/src/const_provider.js" set to variable 'URL_FOR_APP_SERVER' the real URL of Server;
        * NOTE: you can set to variable 'URL_FOR_APP_SERVER' the name of server (and after that, use the available DNS server or add row in the localDNS);
    * Run comand being in created folder (will be downloaded all dependency in local dir, that specified in the file package.json. This command equivalent the "npm install"):
        ```bash
        yarn #OR yarn install
        ```
* Build the React Project;
    ```bash
    npm run build
    ```
* Put the content of folder ./Build to the folder "./Server_app/static" that placed in directory for server;

### Instruction for BackEnd:

* Install python >=3.6
* Instatll Flask  and flask-cors usage pip. For example:
	```bash
	pip3.6 install -U Flask
    pip3.6 install -U flask-cors
	```

* Run app for example:
    ```bash
    # python3.6 dirList.py
    ```

NOTE:
    Was added the bash script, that renames the thread of directories (marks dirs that hase the failure tests).
    This marker is used for color the thir on front side.

TODO:
###### Клиент:

* Major - Сделать routing - для возможности переода по ссылкам (делиться ссылками);
    * Смотрел в сторону React Router (но он больше нацелен на построение UI исходя из URL. Но у меня UI уже построен - мне нужно лишь получить UR и раскрыть те узлы, что соответствуют пути). А это можно сделать через MUI - TreeView (передать массив узлов для раскрытия).
* Major - Уйти от глобальной переменной для метода изменения статуса корневого компонента;
* Minor - Сделать поиск/возможность поиска (раскрытие найденного элемента в дереве;
* Minor - Сделать возможность скачивать (по кнопке).

###### Сервер:

* Done - Сделать логгирование в файл.
* Ускорить работу сервака (по получению и формированию JSON - и отдаче на клиент). Пока занимает много времени.
