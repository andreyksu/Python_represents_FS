/*-----Import React-----*/
import * as React from 'react';
/* -----Import Own----- */
import FileViewer from 'react-file-viewer';
/*-----Import Own-----*/
import { URL_FOR_APP_SERVER } from '../const_provider';


export default class ViewerVorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pathForFile: '',
            typeForFile: ''
        };
    }

    componentDidMount() {
        console.log("ViewerVorkerCl componentDidMount");
    }

    componentDidUpdate() {
        console.log("ViewerVorkerCl componentDidUpdate");
    }

    componentWillUnmount() {
        console.log("*****************ViewerVorkerCl componentWillUnmount*****************");
    }

    componentDidCatch(error, info) {
        console.log("*****************ViewerVorkerCl componentDidCatch*****************");
    }

    getAppopriateMimeType(targetMime) {
        if (targetMime !== null && targetMime !== 'null' && targetMime !== 'null' && targetMime !== '') {
            let listOfType = ['png', 'jpeg', 'gif', 'bmp', 'pdf', 'csv', 'xslx', 'docx', 'mp4', 'webm']
            let resultOfDevide = targetMime.split('/');
            let resultOfDevidedTargetMime = resultOfDevide[1];
            let isMaintainedType = listOfType.includes(resultOfDevidedTargetMime);
            if (isMaintainedType) {
                return [isMaintainedType, resultOfDevidedTargetMime];
            } else if (resultOfDevide[0] === 'text') {
                return [isMaintainedType, targetMime];
            }
        }
        return null;
    }

    /** 
     * Если у FileViewer не указать key, который будет меняться при смене файла, то обновление не будет происходить.
    */
    render() {
        console.log("ViewerVorkerCl ReRender");
        let pathForFile = this.props.pathForFile;
        let typeForFile = this.props.typeForFile;
        let arrayOfVerifyMimeType = this.getAppopriateMimeType(typeForFile);
        if (!pathForFile) {
            return (<div><p> Please Choose Doc of File!!! </p></div>);
        } else if (arrayOfVerifyMimeType === null) {
            return (<div><p> This extension of file does not maintenance for represents !!! </p></div>);
        } else if (arrayOfVerifyMimeType[0]) {
            let resultPathForGet = URL_FOR_APP_SERVER + "/getFile/" + pathForFile;
            console.log(resultPathForGet);
            return (
                <FileViewer filePath={resultPathForGet} fileType={arrayOfVerifyMimeType[1]} key={resultPathForGet} onError={this.onError} errorComponent={this.errorComponent} />
            );
        } else {
            let resultPathForGet = URL_FOR_APP_SERVER + "/getFile/" + pathForFile;
            return (
                <object type={arrayOfVerifyMimeType[1]} data={resultPathForGet} border="2" >
                </object>
            );
        }
    }

    onError = (e) => {
        console.log(e, "-------------onError--------------");
    };

    errorComponent = (e) => {
        console.log(e, "+++++++++++++errorComponent+++++++++++++++");
    };
}