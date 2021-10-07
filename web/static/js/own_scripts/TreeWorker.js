'use strict';

class TreeWorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'items': [],
            'isLoaded': false,
            'error': null
        };
    }

    //Согласно офф. сайту, этот метод выполняется после render(). Но при этом этот метод меняет состояние компонента, что вызывает перерисовку, т.е. вызывает render().
    componentDidMount() {
        fetch("/getBaseStructure/")
            .then(
                (res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {
                            throw new Error("Response for GET tree isn`t OK! See error ======= " + text);
                        });
                    }
                    return res.json();
                })
            .then(
                (result) => {
                    this.setState({
                        'isLoaded': true,
                        'items': result
                    });
                },
                (error) => {
                    this.setState({
                        'isLoaded': true,
                        'error': error
                    });
                }
            )
    }

    shouldComponentUpdate(){
        //Определяет будет обновляться компонент или нет. Если возвращает true - то компонент обновится.
    }

    shouldDidUpdate(){
        //Сразу после повторного рендеринга компонента.
    }

    componentWillUnmount() {
        //Вызывается перед удалением объекта.
    }

    render() {
        const { items, isLoaded, error } = this.state;
        console.log("---------------From_Render-----TreeWorkerCl--------------");
        //console.log(items);
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

    function forHandelClickOnFile(e) {
        let theCurrent = e.target;
        let path = theCurrent.getAttribute("data-path");
        let pathForQuery = '/getFile/' + path;
        console.log('path ===== ' + path);
        console.log('pathForQuery ===== ' + pathForQuery);
        let ViewElement = document.getElementById('view-container');
        while (ViewElement.firstChild) {
            console.log('Удаляем дочерние элементы!!!!');
            ViewElement.removeChild(ViewElement.firstChild);
        }
        let objectElement = document.createElement('object');
        let content = document.createTextNode("There will be present content of selected File!");
        objectElement.setAttribute('data', pathForQuery);
        objectElement.appendChild(content);
        ViewElement.appendChild(objectElement);
    }

    function forHandelClickOnFolder(e) {
        e.preventDefault();
        console.log('You click - will work ---> forHandelClickOnFolder');
        let theTarget = e.target;
        //console.log(theTarget);
        theTarget.parentElement.querySelector(".nested").classList.toggle("active");
        theTarget.classList.toggle("caret-down");
    }

    let listForRender = props.JSONTree.map((element) => {
        if (element.type == 'd') {
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
        } else if (element.type == 'f') {
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


function WorkerWithViwer() {//Планирую использовать как построитель представления.
    return;
}

export default TreeWorkerCl;