import {NetPorts, iCmd} from "../netports/netports";

import express = require("express");
import bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json()

export class App {

    private port: number;
    private com: NetPorts;

    constructor (port: number, com: NetPorts) {
        this.port = port;
        this.com = com;
        this.init()
    }

    private init () {
        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    private isComPortOpen (com: NetPorts): void{
        if (!com.isOpen) throw new Error(`ComPort ${com.PortName} is not open`)
    }

    private getValidCmd (cmd: any): iCmd {
        let result: iCmd = {cmd: [], timeOut: 1000, NotRespond: false};
        if (!cmd.cmd)
            throw new Error ('cmd field is missing');
        if (cmd.cmd.length == 0 )
            throw new Error ('cmd field is empty');
        result.cmd = cmd.cmd;
        result.timeOut = cmd.timeOut || 1000;
        //валидация boolean с присвоением false а по умолчанию true
        //без этой конструкции всегда присваивался true
        result.NotRespond = (typeof cmd.wait !== 'undefined') ? cmd.wait : false ;
        return result;
    }

    private put (request: any, response: any) {
        console.log(`/v1/data/PUT> ${request.body.cmd || ''}`);
        (async ()=>{
            try {
                this.isComPortOpen(this.com);
                const command: iCmd = this.getValidCmd(request.body);
                const start = new Date().getTime();
                const msg = await this.com.write(command);
                const stop = new Date().getTime(); 
                response.json( {'status':'OK',
                                'duration':(stop-start),
                                'time': new Date().toISOString(),
                                'msg':msg})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            };
        })();
    }

    public serve (): void {
        app.put('/v1/data/', jsonParser, (request, response)=>{this.put(request, response)});
        app.listen(this.port);
    } 
}