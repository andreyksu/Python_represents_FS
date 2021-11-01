/* -----Import React----- */
import * as React from 'react';
/* -----Import Material----- */
import { makeStyles, withStyles, createTheme } from "@material-ui/core/styles";
import { ThemeProvider, useTheme, responsiveFontSizes } from '@mui/material/styles';
/* -----Import Mui----- */
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
/* -----Import Own----- */
import { URL_FOR_APP_SERVER } from '../const_provider';

/**
 * Метод, для обновления состояния у родителя.
 * Вообще не очень хорошо, что сейчас лежит в global. Нужно как-то перенести в классы/методы.
 */
let functionFromOuter;

const SomeContext = React.createContext({ val1: "_val1", val2: "_val2" });

/**
 * Вообще все проблемы с изменением шрифта и цвета были похоже из за использования:
 * import { TreeView, TreeItem } from '@mui/lab'; (хз от куда я из взял, но на офф. сайте указаны эти "@material-ui/lab/TreeView")
 *
 * Перешел на:
 * import TreeView from "@material-ui/lab/TreeView";
 * import TreeItem from "@material-ui/lab/TreeItem";
 * И стали применяться новые стили.
 *
 * При этом, когда использовал import { TreeView, TreeItem } from '@mui/lab'; не помогало даже задание style внутри элемента (хотя у него самый вскоий вес 1000).
 */

/**
 * Только это сработало. Удалось изменить размер шрифта. Цвет удалось поменять и через makeStyles но вот размер не удалвалось поменять (т.к. размер потом переопределяется).
 * 
 * По сути запись withStyles({...})(var1) - означает: метод withStyles принимает объект, и возвращает другую функцию, которая вызывается сразу же и в нее предеается var1.
 * Что-то аналогичное с вызовом ананимной функции.
 * 
 * Но нужно использовать этот импорт:
 * import MuiTreeItem from "@material-ui/lab/TreeItem";
 * Вместо:
 * import TreeItem from "@material-ui/lab/TreeItem";
 * 
 * Судя по коду далее (см. метод withStyles), мы просто переопределяем копонент, и этот переопределенный компонент уже будет использоваться, далее.
 *  
 */
/*
const TreeItem = withStyles({
    root: {
        fontSize: '0.85rem',
    },
    group: {
        fontSize: '0.85rem',
    },
    content: {
        fontSize: '0.85rem',
    },
    expanded: {
        fontSize: '0.85rem',
    },
    selected: {
        fontSize: '0.85rem',
    },
    focused: {
        fontSize: '0.85rem',
    },
    disabled: {
        fontSize: '0.85rem',
    },
    iconContainer: {
        fontSize: '0.85rem',
    },
    label: {
        fontSize: '0.85rem',
    }
})(MuiTreeItem);
*/

/**
 * Это по стуи jss. Используем - метод, который принимает объект стилей и возвращает метод, который будем использовать далее. Этот метод возвращает генератор jss - классов.
 * 
 * Для:
 * import { TreeView, TreeItem } from '@mui/lab';
 * Менял только цвет, шрифт тоже менялся, но при этом он выше переопределялся. Но через код, даже через style - изменить не удалось.
 */
const useStylesForErrorFolder = makeStyles({
    label: {
        fontSize: '0.9rem',
        fontWeight: 400,
        color: "#FF1A1A",
    },
});

const useStylesForRegularFolder = makeStyles({
    label: {
        fontSize: '0.9rem',
        fontWeight: 400,
    },
});

const useStylesForFile = makeStyles({
    label: {
        fontSize: '0.9rem',
        fontWeight: 350,
        color: "#260099",
        minWidth: 0,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
});
//------------------------------------------------------------
const theme = createTheme({
    components: {
        TreeItem: {
            defaultProps: {
                label: {
                    fontSize: '0.7rem',
                    color: "#FF1A1A",
                },
                root: {
                    fontSize: '0.71rem',
                    color: "#00FF00",
                },
                content: {
                    fontSize: '0.72rem',
                    color: "#ff00ff",
                }
            },
            styleOverrides: {
                label: {
                    fontSize: '0.8rem',
                    color: "#FF1A1A",
                },
                root: {
                    fontSize: '0.81rem',
                    color: "#00FF00",
                },
                content: {
                    fontSize: '0.82rem',
                    color: "#ff00ff",
                }
            },
        },
    },
    typography: {
        TreeItem: {
            fontSize: '0.9rem',
        },
    },
});


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
                <SomeContext.Provider value={{ val1: "_val11", val2: "_val22" }}>
                    <TreeWievComponent JSONTree={items} />
                </SomeContext.Provider>
            );
        }
    }
}

class TreeWievComponent extends React.Component {
    /*
        Это пока не очень ясно, как работает. Присвоили какому-то полю contextType объект ReactContext - и дальше что, как оно дальше влияет на this.context?
        Если эту строчку закомментировать, то console.log(this.context) - пустой объект а не переданное свойство;

        Хотя можно сделать так: TreeWievComponent.contextType = SomeContext;

        И это ведь не добавление слушителя, a просто присваивание, как это все работает?
        В Java - для static полей - полиморфизм не действует (для методов, нужно посмотреть как для полей, что с перектытием).
        В JS - для static поля и методы наследуются (Extends дает две ссылки):
        Rabbit extends Animal создаёт две ссылки на прототип:
            Функция Rabbit прототипно наследует от функции Animal.
            Rabbit.prototype прототипно наследует от Animal.prototype.
    */
    static contextType = SomeContext;//Это и есть подписка? Судя доки именно эта запись и делает значение доступное в поле this.context. При изменении значения 

    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.context);//Поле контекст видимо наследуется от React.Component. И это поле как-то автоматически проставляется.
        console.log(TreeWievComponent.contextType);
        console.log(typeof TreeWievComponent.contextType);
        return (
            <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ height: 240, flexGrow: 1, maxWidth: 300, border: "1px solid red" }}

            >
                <BuildTheTree JSONTree={this.props.JSONTree} />
            </TreeView>
        );
    }
}

function BuildTheTree(props) {
    const theme = useTheme();
    //const classesFolderErr = useStylesForErrorFolder();
    const classesRegFolder = useStylesForRegularFolder();
    const classesFile = useStylesForFile();


    let lsitOfTreeItem = props.JSONTree.map((item) => {
        if (item.type === 'd') {
            return (
                <ThemeProvider theme={theme}>
                    <TreeItem
                        classes={{ label: classesRegFolder.label }}
                        nodeId={item.key.toString()}
                        label={item.name}>
                        <BuildTheTree JSONTree={item.children} />
                    </TreeItem>
                </ThemeProvider>
            );
        } else {
            return (
                <ThemeProvider theme={theme}>
                    <TreeItem
                        classes={{ label: classesFile.label }}
                        nodeId={item.key.toString()}
                        onClick={(e) => forHandelClick(item.path, item.mime, e)}
                        label={item.name} >
                    </TreeItem>
                </ThemeProvider >
            );
        }
    });
    return lsitOfTreeItem;
}

function forHandelClick(path, mime, event) {
    console.log(event.target);
    functionFromOuter(path, mime);
}
export default TreeWorkerCl;