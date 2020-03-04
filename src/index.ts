import {NetPorts} from "./netports/netports";
import ComPort from "./netports/comport";
import {getConfigFile} from "./utils/utils";
import {HttpServer} from "./servers/httpserver";
import {WSServer} from "./servers/wsserver";
import fs = require('fs');

console.log('serial port service start')
//читаю переданный JSON-файл и делаю из него settings 
const settings = JSON.parse(fs.readFileSync(getConfigFile(), 'utf8'));
const COMx: NetPorts = new ComPort(settings.COM);
const Server: HttpServer = new HttpServer(settings.HOST.port, COMx);
const WSS: WSServer = new WSServer(Server.https, COMx);
