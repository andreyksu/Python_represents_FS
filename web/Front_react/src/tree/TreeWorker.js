/* -----Import React----- */
import * as React from 'react';
/* -----Import Mui----- */
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
/* -----Import Own----- */
import { URL_FOR_APP_SERVER } from '../const_provider';

const markerStringForFile = "file___";
const markerStringForFolder = "dir___";

let functionFromOuter;

/**
 * Компонент с состоянием. Основной компонент, что вызывается в index.js построении дерева.
 */
class TreeWorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'items': [],
            'isLoaded': false,
            'error': null
        };
    }

    /**
     * Согласно офф. сайту, этот метод выполняется после render().
     * Но при этом этот метод меняет состояние компонента, что вызывает перерисовку, т.е. снова вызывает render().
     * В этом методе вызываем получение дерева. При успешном получении меняем состояние статутса/маркера.
    */
    componentDidMount() {
        fetch(URL_FOR_APP_SERVER + "/getBaseStructure/")
            .then(
                (res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {//В then мы должны вернуть Promise. По этому берем у res then.
                            throw new Error("Response for GET the tree isn`t OK! See error ======= " + text);
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
                        'isLoaded': true, //Вот здесь не понятно, что должно быть, в случае ошибки видимо нужно переводить в False, хотя где брал пример, там true. Но ведь по логике мы итак меняем поле error.
                        'error': error
                    });
                }
            )
    }

    render() {
        console.log("TreeWorkerCl ReRender");
        const { items, isLoaded, error } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>The tree is loading ...</div>;
        } else {
            /*
                TODO: Возможно это не самое хорошее решение. Но я пробовал передавать через props - и инфа теряется при ПОВТОРНОМ вызове BuildTheTree.
                При первом вызове все ок. Но видимо как-то внутри React вызывает при раскрытии дерева еще раз BuildTheTree и при этом не вызывается TreeWievComponent - через которы и передавалась информация.
            */
            functionFromOuter = this.props.functionForUpdateViewer;
            return (
                <TreeWievComponent JSONTree={items} />
            );
        }
    }
}

function TreeWievComponent(props) {
    return (
        <TreeView
            onNodeSelect={forHandelSelect}
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
        >
            <BuildTheTree JSONTree={props.JSONTree} />
        </TreeView>
    );
}

/**
 * Вспомогательная для рекурсивного выстраивания дерева!
 * @param {*} props 
 * @returns 
 */
function BuildTheTree(props) {
    /*
    Интересно, что на этам этапе теряется функция. Видимо повторный вызов идет уже без TreeWievComponent??? Так как в пером вызове все есть.
    const funtionForUpdateViever = props.funtionForUpdViever;    
    funtionForUpdateViever("BuildTheTree", "BuildTheTree"); 
    console.warn(typeof funtionForUpdateViever);
    */

    let lsitOfTreeItem = props.JSONTree.map((item) => {
        if (item.type === 'd') {
            return (
                <TreeItem nodeId={markerStringForFolder + item.path.toString()} label={item.name}>
                    <BuildTheTree JSONTree={item.children} />
                </TreeItem>
            );
        } else {
            return (
                <TreeItem nodeId={markerStringForFile + item.path.toString()} label={item.name} onClick={(e) => forHandelClick(item.path, item.mime, e)}>
                </TreeItem>
            );
        }
    });
    return lsitOfTreeItem;
}

/*---------------------------------------------------------------------------------*/

/**
 * Обработчик клика по элементу дерева. Сделал пока распозонвание через добавление маркера в nodeID. Да и вообще - не очень удачно.
 * Слушатель для файла. Здесь this не используется - по этой причине bind - не применяется.
 * Нужно обратить внимание, bind в офицальном примере исплоьзуется, для возможности менять состояние компонента/объекта, в котором этот метод объявлен.
 */

function forHandelSelect(event, nodeId) {
    let theCurrentElement = event.target;// Из event - получаем текущий элемент, на котором поймали event (т.е. на котором кликнули).
    const stringForRegexp = "^" + markerStringForFile;
    let regExpr = new RegExp(stringForRegexp);
    let indexOfRegexp = nodeId.search(regExpr);
    if (indexOfRegexp !== -1) {
        let resultStringForQuery = nodeId.replace(markerStringForFile, "");
        //console.debug("nodeId ===== " + nodeId);
        //console.debug("resultStringForQuery ===== " + resultStringForQuery);
    } else {
        //console.debug("-----It is Dir-----");
    }
}

function forHandelClick(path, mime, event) {
    functionFromOuter(path, mime);
}

/*---------------------------------------------------------------------------------*/
export default TreeWorkerCl;