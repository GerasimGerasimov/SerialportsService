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
}