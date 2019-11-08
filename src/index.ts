import {NetPorts} from "./netports/netports";
import ComPort from "./netports/comport"
import {getConfigFile} from "./utils/utils"
import {App} from "./app/app"
import fs = require('fs');
//
console.log('serial port service start')

//читаю переданный JSON-файл и делаю из него settings 
const settings = JSON.parse(fs.readFileSync(getConfigFile(), 'utf8'));
const COMx: NetPorts = new ComPort(settings.COM);
const Server: App = new App(settings.HOST.port, COMx);
Server.serve();