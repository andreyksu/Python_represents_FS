/* -----Import React----- */
import * as React from 'react';
/* -----Import Material----- */
/* -----Import Mui----- */
/** 
 * См. здесь.
 * https://stackoverflow.com/questions/69506133/difference-between-mui-material-styles-and-mui-styles 
 * 
 * Material-UI V4: 
 *      - @material-ui/core/styles
 *      - @material-ui/styles
 * 
 *        @material-ui/lab/TreeView ----- Для такого импорта не работает sx. Но для них должно работать createTheme / ThemeProvider.
 *        @mui/lab ----- Для такого импорта не работает makeStyles, withStyles.
 *          
 *          For old style see: 
 *              https://blog.bitsrc.io/4-ways-to-override-material-ui-styles-43aee2348ded
 *              https://blog.bitsrc.io/a-better-way-to-style-material-ui-80c7707ad525 
 *              https://arth3rs0ng.medium.com/mui-styled-components-and-inspiration-cceab14bec96
 * 
 *  MUI component uses emotion, not JSS anymore in the new version. Рекамендуется перейти на новый вид.
 * 
 * Material-UI V5:
 *      - @mui/material/styles ----- Doesn't have makeStyles/withStyles, has styled instead.
 *              import { styled } from "@mui/material/styles"; - следует использовать именно такой вид стилизации.
 * 
 *      - @mui/styles ----- Legacy!!! В V5 пока есть но в V6 планируют выпилить). 
 *              - Doesn't come with a default theme, need createTheme/ThemeProvider. Has makeStyles/withStyles. 
 *              import { makeStyles } from '@mui/styles';
 * 
 *      Не стоит миксовать используемые либы. Нужно выбрать один вид либы и использовать его.
 */

import { createTheme, ThemeProvider, styled, responsiveFontSizes } from '@mui/material/styles';
//import { styled } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';//Got from official docs.
import TreeItem from '@mui/lab/TreeItem';//Got from official docs.
//import TreeView from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
/* -----Import Own----- */
import { URL_FOR_APP_SERVER } from '../const_provider';

/**
 * Метод, для обновления состояния у родителя.
 * Вообще не очень хорошо, что сейчас лежит в global. Нужно как-то перенести в классы/методы.
 * Но при передаче из компонента в компоент, почему-то теряется информация что это метод (потеря происходит при передаче из компонента функции в компонент функцию. Вроде как для классво все ок. Т.е. из класса в метод все ок.)
 */
let functionFromOuter;
/*
const styles = {
    backgroundColor: "grey",
    fontSize: "0.887rem !important" //Работает и без !important. Добавил для "попробовать"!
};

const CustomTreeItem = styled(TreeItem)({ ...styles });

And use CustomTreeItem insted TreeItem. Тоже рабочий вариант, нормально работает. Второй вариант использую для "попроовать".
*/

const themeForTree1 = createTheme({
    components: {
        MuiTreeItem: {
            styleOverrides: {
                root: {
                    fontSize: "0.821rem",
                },
                label: {
                    fontSize: "0.822rem",
                },
                content: {
                    fontSize: "0.823rem",
                },
            },
        },
    },
});

const themeForTree = responsiveFontSizes(themeForTree1);

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
    '& .MuiTreeItem-content > .MuiTreeItem-label': {
        fontSize: '0.824rem',
        color: "#00008B",
        minWidth: 0,
        whiteSpace: 'nowrap',
    },
}));

//------------------------------------------------------------

class TreeWorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'items': [],
            'isLoaded': false,
            'error': null
        };
    }

    componentDidMount() {
        fetch(URL_FOR_APP_SERVER + "/getBaseStructure/")
            .then(
                (res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {
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
                        'isLoaded': true,
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
            functionFromOuter = this.props.functionForUpdateViewer;
            return (
                <TreeWievComponent JSONTree={items} />
            );
        }
    }
}

class TreeWievComponent extends React.Component {
    static startPath = '/prepared/';

    constructor(props) {
        super(props);
        this.isFirstLoad = true;
    }

    funcForSetURL(event, nodeId) {
        let elementId = nodeId;
        let nextURL = TreeWievComponent.startPath + elementId;
        window.history.replaceState(null, '', nextURL);
    }

    getArrayForExpandTree() {
        let arrayForReturn = [];
        let positionOfSlash = -1;

        let pathFromURL = window.location.pathname;

        if (pathFromURL.indexOf(TreeWievComponent.startPath) !== 0) {
            console.debug("Перешли по URL, что не содержит в начале = " + TreeWievComponent.startPath);
        } else {
            let regExpr = new RegExp(TreeWievComponent.startPath);
            let relativePath = pathFromURL.replace(regExpr, '');
            positionOfSlash = relativePath.lastIndexOf('/');
            while (positionOfSlash !== -1) {
                arrayForReturn.push(relativePath);
                positionOfSlash = relativePath.lastIndexOf('/');
                relativePath = relativePath.substring(0, positionOfSlash);
            }
        }
        return arrayForReturn;
    }

    render() {
        console.log("TreeWievComponent ReRender");
        let forExpand = [];
        let forSelect = '';
        if (this.isFirstLoad) {
            forExpand = this.getArrayForExpandTree();
            forSelect = forExpand[0];//Нулевой элемент, так как складывать в методе getArrayForExpandTree() начинаем с конца.
            this.isFirstLoad = false;
        }
        return (
            <TreeView
                onNodeSelect={this.funcForSetURL}
                sx={{ fontSize: '0.825rem' }}
                defaultExpanded={forExpand}
                defaultSelected={forSelect}
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                <BuildTheTree JSONTree={this.props.JSONTree} />
            </TreeView>
        );
    }
}

function BuildTheTree(props) {

    let lsitOfTreeItem = props.JSONTree.map((item) => {

        if (item.type === 'd') {
            if (item.name.includes("_____error")) {
                let regExpr = new RegExp('_____error', 'g');
                let nameDir = item.name.replace(regExpr, '');
                return (
                    <ThemeProvider theme={themeForTree}>
                        <TreeItem
                            className="Error Folder"
                            sx={{ '&.MuiTreeItem-root > .MuiTreeItem-content > .MuiTreeItem-label': { fontSize: '0.8261rem', color: '#FF0000', }, }} //Если селектор без > - то будет подкрашена все иерархия.
                            key={item.key.toString()}
                            nodeId={item.path.toString()}
                            label={nameDir}>
                            <BuildTheTree JSONTree={item.children} />
                        </TreeItem>
                    </ThemeProvider>
                );
            }
            else {
                return (
                    <ThemeProvider theme={themeForTree}>
                        <TreeItem //Дефолтный элемент, на него просто распространяется ThemeProvider -> themeForTree. Ниже уже работа с кастомным компонентом.
                            className="Success Folder"
                            sx={{ '&.MuiTreeItem-root > .MuiTreeItem-content > .MuiTreeItem-label': { fontSize: '0.8262rem', color: '#000000', }, }}
                            key={item.key.toString()}
                            nodeId={item.path.toString()}
                            label={item.name}>
                            <BuildTheTree JSONTree={item.children} />
                        </TreeItem>
                    </ThemeProvider>
                );
            }

        } else {
            return (
                <ThemeProvider theme={themeForTree}>
                    <CustomTreeItem //Здесь же уже кастомный компонент. И настройки ThemeProvider -> themeForTree беребиваются кастомными настройками компонента.
                        className="CanSetClassesForGrowUpCpecificityCSSSelector FILE NORMAL" //Так можно добавить классы, и потом использовать их для повшения спеццифичности (см. ниже). Но добавляется эти классы к .MuiTreeItem-root
                        //sx={{ fontSize: '0.827rem' }} //Влияет, но сверху переопределяется деволтной темой, так как тема выше задана через два класса css-селектора.
                        sx={{ color: '#FF0000', '&.FILE.NORMAL .MuiTreeItem-label': { fontSize: '0.8271rem', }, }} //А здесь задали уточение к классу (увеличив специфичность css-selector). Вообще работает и так'& .MuiTreeItem-label' - но оставил классы для примера увеличения специфичности.
                        key={item.key.toString()}
                        nodeId={item.path.toString()}
                        onClick={(e) => forHandelClick(item.path, item.mime, e)}
                        label={item.name} >
                    </CustomTreeItem>
                </ThemeProvider>
            );
        }
    });
    return lsitOfTreeItem;
}

/**
 * Функция обработки клика по файлу в дереве элементов.
 * 
 * @param {*} path - путь до файла, для отображения в форме просмотра.
 * @param {*} mime - тип файла. Для отображения.
 * @param {*} event - тип события. 
 */
function forHandelClick(path, mime, event) {
    //console.log(event.target);
    functionFromOuter(path, mime);
}
export default TreeWorkerCl;