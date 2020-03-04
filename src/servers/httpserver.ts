import http = require('http');
import express = require("express");
import bodyParser = require('body-parser');
import {NetPorts} from "../netports/netports";

const app = express();
const jsonParser = bodyParser.json()

export class HttpServer{
    public https: any;

    private port: number;
    private com: NetPorts;
    
    constructor (port: number, com: NetPorts) {
        this.port = port;
        this.com = com;
        this.init();
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