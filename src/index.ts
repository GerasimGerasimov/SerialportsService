import express = require("express");
import bodyParser = require('body-parser');
import {NetPorts, iCmd} from "./netports/netports";
import ComPort from "./netports/comport"
//
console.log('serial port service start')
//в аргументе указал какой файл конфигурации требуется загрузить
let nodePath = process.argv[0];
let appPath = process.argv[1];
let filename = process.argv[2];
console.log(`nodePath: ${nodePath}`);
console.log(`appPath: ${appPath}`);
console.log(`filename: ${filename}`);//
//чтению переданный JSON-файл и делаю из него settings 
var fs = require('fs');
const settings = JSON.parse(fs.readFileSync(filename, 'utf8'));

let COMx: NetPorts = new ComPort(settings);

const app = express();
const jsonParser = bodyParser.json()

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

function isComPortOpen (com: NetPorts): void{
    if (!com.isOpen) throw new Error('com is not open')
}

function getValidCmd (cmd: any): iCmd {
    let result: iCmd = {cmd: [], timeOut: 1000, wait: true};
    if (!cmd.cmd)
        throw new Error ('cmd field is missing');
    if (cmd.cmd.length == 0 )
        throw new Error ('cmd field is empty');
    result.cmd = cmd.cmd;
    result.timeOut = cmd.timeOut || 1000;
    //валидация boolean с присвоением false а по умолчанию true
    //без этой конструкции всегда присваивался true
    result.wait = (typeof cmd.wait !== 'undefined') ? cmd.wait : true ;
    return result;
}

app.put('/v1/data/', jsonParser, (request, response) =>{
    console.log(`/v1/data/PUT> ${request.body.cmd || ''}`);
    (async ()=>{
        try {
            isComPortOpen(COMx);
            const command: iCmd = getValidCmd(request.body);
            const start = new Date().getTime();
            const msg = await COMx.write(command);
            const stop = new Date().getTime(); 
            response.json( {'status':'OK',
                            'duration':(stop-start),
                            'time': new Date().toISOString(),
                            'msg':msg})
        } catch (e) {
            response.status(400).json({'Status':'Error',
                                        'Msg': e.message || ''})
        };
    })();
})

app.listen(5000)