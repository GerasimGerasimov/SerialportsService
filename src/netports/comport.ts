import {NetPorts, iCmd} from "./netports";
import SerialPort = require('serialport');

export default class ComPort extends NetPorts {
    private portName:string;    
    private isopen: boolean = false; // индикатор открытия для работы
    private Port: any = undefined;   // ссылка на объект порта
    private onReadEvent:  Function = null;
    private onErrorEvent: Function = null;
    private ReConnectTimerID: any = null;
    private PortSettings: any;
    private ChunkEndTimer: any = null;
    private ChunkEndTime: number = 10;
    private Respond: Array<number> = [];

    constructor(settings: any){
        super(settings);
        this.PortSettings = settings;
        this.configure(settings);
        console.log('ComPort class created')
    }

    public configure(settings: any): void {
        this.portName = settings.port;
        this.Port = new SerialPort(settings.port, settings.settings);
        let self = this;
        //установить обработчики событий
        this.Port.on('open',  this.onOpen.bind(self));
        this.Port.on('close', this.onClose.bind(self));
        this.Port.on('error', this.onError.bind(self));
        this.Port.on('data',  this.onRead.bind(self));
    }

    public async getCOMAnswer(cmd: Object): Promise<any> {
        try {
            this.isComPortOpen();
            const command: iCmd = this.getValidCmd(cmd);
            const start = new Date().getTime();
            const msg = await this.write(command);
            const stop = new Date().getTime(); 
            return {status:'OK',
                    duration:(stop-start),
                    time: new Date().toISOString(),
                    msg:msg}
        } catch (e) {
            throw new Error (e);
        };
    }

    private onChunkEndTime():void {
        console.log(`respond: ${this.Respond}`);//String.fromCharCode(...this.Respond));
        if (this.onReadEvent) this.onReadEvent(this.Respond);
    }

    private restartChunkEndTimer(frameEndTime: number):void {
        if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
        this.ChunkEndTimer = setTimeout(() => {
            this.onChunkEndTime();
        }, frameEndTime);
    }

    private onRead(data: any):void {
        //console.log(`${this.PortName} chunk:> ${data}`);
        this.Respond.push(...data);
        this.restartChunkEndTimer(this.ChunkEndTime)
    }

    private onOpen():void {
        console.log(`ComPort ${this.PortName} is opened`);
        this.isopen = true;//порт открыт можно работать
        if (this.ReConnectTimerID) {
            clearInterval(this.ReConnectTimerID);
            this.ReConnectTimerID = null;
        }
    }

    private async write (cmd: iCmd): Promise<String> {
        return new Promise ((resolve, reject) =>{
            if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
            this.Respond = [];
            this.ChunkEndTime = cmd.ChunksEndTime;
            this.Port.write(Buffer.from(cmd.cmd));
            this.Port.drain();
            if (cmd.NotRespond) return resolve(''); //не надо ждать ответа
            
            const TimeOutTimer = setTimeout(()=>{
                clearTimeout(TimeOutTimer);
                reject(new Error ('time out'))
                }, cmd.timeOut)

            this.onReadEvent = (msg: any) => {
                clearTimeout(TimeOutTimer);
                return resolve(Array.prototype.slice.call(msg,0));
            }

            this.onErrorEvent = (msg: any) => {
                clearTimeout(TimeOutTimer);
                reject(new Error(msg));
            }
        });
    }

    private reConnect(): void {
        if (this.ReConnectTimerID) return;
        this.ReConnectTimerID = setInterval(()=>{
            console.log(`ComPort ${this.PortName} try to reconnect`)
            this.configure(this.PortSettings);
        }, 1000);
    }

    private onClose():void {
        console.log(`ComPort ${this.PortName} is closed`);
        this.reConnect();
        this.isopen = false;//порт закрыт, низя песать внего и четать из нево
    }

    //обработчики событий
    private onError (err: any){
        console.log(`ComPort ${this.PortName} error ${err.message}`);
        if (!this.ReConnectTimerID) this.reConnect();  
        if (this.onErrorEvent) this.onErrorEvent(err.message); 
    }

    private get isOpen():boolean {
        return this.isopen;
    }

    private get PortName():string {
        return this.portName;
    }

    private isComPortOpen (): void{
        if (!this.isOpen) throw new Error(`ComPort ${this.PortName} is not open`)
    }

    private getValidCmd (req: any): iCmd {
        let result: iCmd = {cmd: [], timeOut: 1000, ChunksEndTime:10 ,NotRespond: false};
        if (!req.cmd)
            throw new Error ('cmd field is missing');
        if (req.cmd.length == 0 )
            throw new Error ('cmd field is empty');
        result.cmd = req.cmd;
        result.timeOut = req.timeOut || 1000;
        result.ChunksEndTime = req.ChunksEndTime || 10;
        result.NotRespond = (typeof req.NotRespond !== 'undefined') ? req.NotRespond : false ;
        return result;
    }
    
}
