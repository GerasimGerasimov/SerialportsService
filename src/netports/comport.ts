import NetPorts from "./netports";
import SerialPort = require('serialport');

export default class ComPort extends NetPorts {
    private isopen: boolean = false; // индикатор открытия для работы
    private Port: any = undefined;   // ссылка на объек порта
    public  onReadEvent:  Function = null;
    public  onErrorEvent: Function = null;

    constructor(settings: any){
        super(settings);
        this.configure(settings);
        console.log('SerialPorts created')
    }
    configure(settings: any): void {
        this.Port = new SerialPort(settings.port, settings.settings);
            let self = this;
            //установить обработчики событий
            this.Port.on('open',  this.onOpen.bind(self));
            this.Port.on('close', this.onClose.bind(self));
            this.Port.on('error', this.onError.bind(self));
            this.Port.on('data',  this.onRead.bind(self));
    }

    public setOnRead (onRead: Function, owner: any): void {
        this.Port.on('data',  onRead.bind(owner));
    }

    public onRead(data: any, err: any):void {
        console.log(`onDataRead:> ${data} error:> ${err}`);
        if (this.onReadEvent) this.onReadEvent(data); 
    }

    public onOpen():void {
        console.log('TSerialPort.Serial port is opened');
        this.isopen = true;//порт открыт можно работать
    }

    public write (msg: any): boolean {
        const data = Buffer.from(msg);
        const result = this.Port.write(data);
        this.Port.drain();
        return result;
    }

    public onClose():void {
        console.log('TSerialPort.Serial port is closed');
        this.isopen = false;//порт закрыт, низя песать внего и четать из нево
    }

    //обработчики событий
    public onError (err: any){
        console.log('TSerialPort.Error: ', err.message);
        if (this.onErrorEvent) this.onErrorEvent(err.message); 
    }

    public get isOpen():boolean {
        let result: boolean = this.isopen;
        return result;
    }
}
