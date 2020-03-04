import {NetPorts, iCmd} from "../netports/netports";
const http = require('http')
import express = require("express");
import bodyParser = require('body-parser');
import WebSocket = require('ws');
/*
const WebSocketServer = new WebSocket.Server({port: settings.HOST.port});

WebSocketServer.on ('connection', (ws) => {
    console.log(ws);
    ws.on
})

*/

const app = express();
const jsonParser = bodyParser.json()

export interface IServer {
}

export class AppServer implements IServer{

    private port: number;
    private com: NetPorts;
    private https: any;
    private wss: any;

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
        app.route('/v1/data/')
            .put(jsonParser, [this.put.bind(this)]);
        this.https = http.createServer(app).listen(this.port);
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        const self = this;
        ws.on('message', async (message:any)=>{
            var result: any;
            try {
                result = await self.getCOMAnswer(JSON.parse(message));
            } catch (e) {
                result = {status:'Error',
                          msg: e.message || ''}
            }
            const res = JSON.stringify(result);
            ws.send(res);
        });

        ws.on('close', ()=>{
            console.log('Connection close');
        })
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
        result.NotRespond = (typeof cmd.NotRespond !== 'undefined') ? cmd.NotRespond : false ;
        return result;
    }
    
    private async getCOMAnswer(cmd: Object): Promise<any> {
        try {
            this.isComPortOpen(this.com);
            const command: iCmd = this.getValidCmd(cmd);
            const start = new Date().getTime();
            const msg = await this.com.write(command);
            const stop = new Date().getTime(); 
            return {status:'OK',
                    duration:(stop-start),
                    time: new Date().toISOString(),
                    msg:msg}
        } catch (e) {
            throw new Error (e);
        };
    }

    private async put (request: any, response: any) {
        console.log(`/v1/data/PUT> ${request.body.cmd || ''}`);
            try {
                response.json(await this.getCOMAnswer(request.body));
            } catch (e) {
                response.status(400).json({status:'Error',
                                           msg: e.message || ''})
            }
    }
}