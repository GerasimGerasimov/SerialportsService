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

    constructor(settings: any){
        super(settings);
        this.PortSettings = settings;
        this.configure(settings);
        console.log('ComPort class created')
    }
    configure(settings: any): void {
        this.portName = settings.port;
        this.Port = new SerialPort(settings.port, settings.settings);
        let self = this;
        //установить обработчики событий
        this.Port.on('open',  this.onOpen.bind(self));
        this.Port.on('close', this.onClose.bind(self));
        this.Port.on('error', this.onError.bind(self));
        this.Port.on('data',  this.onRead.bind(self));
    }

    private onRead(data: any):void {
        console.log(`${this.PortName} onDataRead:> ${data}`);
        if (this.onReadEvent) this.onReadEvent(data); 
    }

    private onOpen():void {
        console.log(`ComPort ${this.PortName} is opened`);
        this.isopen = true;//порт открыт можно работать
        if (this.ReConnectTimerID) {
            clearInterval(this.ReConnectTimerID);
            this.ReConnectTimerID = null;
        }
    }

    public async write (cmd: iCmd): Promise<String> {
        return new Promise ((resolve, reject) =>{
            this.Port.write(Buffer.from(cmd.cmd));
            this.Port.drain();
            if (cmd.NotRespond) return resolve(''); //не надо ждать ответа
            const timerId = setTimeout(()=>{
                reject(new Error ('time out'))
                }, cmd.timeOut)
            this.onReadEvent = (msg: any) => {
                clearTimeout(timerId);
                return resolve(Array.prototype.slice.call(msg,0));
            }
            this.onErrorEvent = (msg: any) => {
                clearTimeout(timerId);
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

    public get isOpen():boolean {
        return this.isopen;
    }

    public get PortName():string {
        return this.portName;
    }
}
