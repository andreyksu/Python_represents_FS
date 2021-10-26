'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { URL_FOR_APP_SERVER } from '../const_provider';

class TreeWorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'items': [],
            'isLoaded': false,
            'error': null
        };
    }

    //Согласно офф. сайту, этот метод выполняется после render(). Но при этом этот метод меняет состояние компонента, что вызывает перерисовку, т.е. снова вызывает render().
    componentDidMount() {
        fetch(URL_FOR_APP_SERVER + "/getBaseStructure/")
            .then(
                (res) => {
                    if (!res.ok) {
                        this.setState({
                            'isLoaded': false,
                        });
                        return res.text().then((text) => {
                            throw new Error("Response for GET the tree isn`t OK! See error ======= " + text);
                        });
                    }
                    return res.json();
                })
            .then(
                (result) => {
                    //console.debug("---------------componentDidMount()-----It Is OK set the items-------------- " + JSON.stringify(result));
                    //console.debug("---------------componentDidMount()-----It Is OK set the items-------------- " + this.state.isLoaded);
                    this.setState({
                        'isLoaded': true,
                        'items': result
                    });
                    //console.debug("---------------componentDidMount()-----It Is OK set the items-------------- " + this.state.isLoaded);
                },
                (error) => {
                    this.setState({
                        'isLoaded': false, //Вот здесь не понятно, что должно быть, в случае ошибки видимо нужно переводить в False, хотя где брал пример, там true. Но ведь по логике мы итак меняем поле error.
                        'error': error
                    });
                }
            )
    }

    /*
        shouldComponentUpdate() {
            console.debug("---------------shouldComponentUpdate()---------------");//Внимание, переопределяет метод, и тем самым не отрабатывала отрисовка. Т.к. не было return true - соответственно ничего не РЕрендерилось.
        }
    
        shouldDidUpdate() {
            console.debug("---------------shouldDidUpdate()---------------");
        }
    
        componentWillUnmount() {
            console.debug("---------------componentWillUnmount()---------------");
        }
    */

    render() {
        const { items, isLoaded, error } = this.state;
        console.debug("---------------render()-----isLoaded ===== " + isLoaded);
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>The tree is loading ...</div>;
        } else {
            return (
                <ul id='myUL'>
                    <TreeBuilder JSONTree={items} />
                </ul>

            );
        }
    }
}

function TreeBuilder(props) {

    function forHandelClickOnFile(e) {// Слушатель для файла
        let theCurrentElement = e.target;// Из event - получаем текущий элемент, на котором поймали event (т.е. на котором кликнули).        
        let pathFromElement = theCurrentElement.getAttribute("data-path");// У элемента получаем путь из атрибута.
        let pathForQuery = URL_FOR_APP_SERVER + "/getFile/" + pathFromElement;
        console.debug('pathFromElement ===== ' + pathFromElement);
        console.debug('pathForQuery ===== ' + pathForQuery);
        let ViewElement = document.getElementById('view-container');// Удаляем все из формы представления, перед отображениме нового содержимого.
        while (ViewElement.firstChild) {
            console.debug('Удаляем дочерние элементы из контейнера = view-containe!!!!');
            ViewElement.removeChild(ViewElement.firstChild);// Удаляем каждый раз первый элемент (когда-то их не останется)!
        }
        let objectElement = document.createElement('object');// Добавляем объект как объект. Он отображает содержимое из атрибута "data".
        let textForShow = document.createTextNode("There will be present content of selected File!");
        objectElement.setAttribute('data', pathForQuery);// Сетим путь до файла (если тип знает, то отобразит содержимое файла в ином слвчае отобразит текст см. "content").
        objectElement.appendChild(textForShow);
        ViewElement.appendChild(objectElement);
    }

    function forHandelClickOnFolder(e) {// Слушатель для каталога
        e.preventDefault();
        console.log('You click on FOLDER - will work ---> forHandelClickOnFolder');
        let theTarget = e.target;
        //console.log(theTarget);
        theTarget.parentElement.querySelector(".nested").classList.toggle("active");
        theTarget.classList.toggle("caret-down");
    }

    let listForRender = props.JSONTree.map((element) => {//Здесь формируется List (который возвращается как Element. По сути это набор элементов как список).
        if (element.type == 'd') { //Если директория, то добавляем один вид слушателя/эвента.
            return (
                <li key={element.key}>
                    <span className='caret' onClick={forHandelClickOnFolder}>
                        {element.name}
                    </span>
                    <ul className='nested'>
                        <TreeBuilder JSONTree={element.children} />
                    </ul>
                </li>
            );
        } else if (element.type == 'f') {//Если файо, то добавляем другой вид слушателя/эвента.
            return (
                <li key={element.key} data-path={element.path} className='terminalElement' onClick={forHandelClickOnFile}>
                    {element.name}
                </li>
            )
        } else {
            return (//Сейчас пустой каталог отображается как то криво ((стрелка и имя каталога на разных строчках). Эта часть не помогает т.к. мы сюда и не заходим.... Нужно добавлять в Python какой-то информационный элемент в пустой каталог.
                <li>The current dir is empty</li>
            );
        }
    });
    return listForRender;
}


function WorkerWithViwer() {
    //Планирую использовать как построитель представления.
    return;
}

export default TreeWorkerCl;