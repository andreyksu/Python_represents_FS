/**
    *This file for Common property. The URL can set by placeHolder as URL_FOR_APP_SERVER and after are replaced by find-and-relace via "find -exec" and "cat".
    *But this manner isn`t work when need work with ReactApp - as "npm start". In this case - was added this file. That get the url at runtime.
*/

const URL_FOR_APP_SERVER = "http://192.168.226.136:8088";

export { URL_FOR_APP_SERVER };