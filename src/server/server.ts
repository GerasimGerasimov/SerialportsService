import http = require('http')
import {NetPorts} from "../netports/netports";
import express = require("express");
import bodyParser = require('body-parser');
import WebSocket = require('ws');

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
                result = await self.com.getCOMAnswer(JSON.parse(message));
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

    private async put (request: any, response: any) {
        console.log(`/v1/data/PUT> ${request.body.cmd || ''}`);
            try {
                response.json(await this.com.getCOMAnswer(request.body));
            } catch (e) {
                response.status(400).json({status:'Error',
                                           msg: e.message || ''})
            }
    }
}