import WebSocket = require('ws');
import {NetPorts} from "../netports/netports";

export class WSServer{

    private com: NetPorts;
    private https: any;
    private wss: any;

    constructor (https: any, com: NetPorts) {
        this.https = https;
        this.com = com;
        this.init()
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        ws.on('message', this.onMessage.bind(this, ws));
        ws.on('close', this.onClose.bind(this, ws))
    }

    private async onMessage(ws: WebSocket, message: any) {
        var result: any;
        try {
            result = await this.com.getCOMAnswer(JSON.parse(message));
        } catch (e) {
            result = {status:'Error',
                      msg: e.message || ''}
        }
        const res = JSON.stringify(result);
        ws.send(res);
    }

    private onClose(ws: WebSocket){
        console.log('Connection close');
    }
}