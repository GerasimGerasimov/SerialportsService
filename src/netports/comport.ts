import NetPorts from "./netports";
// import SerialPort from 'serialport';
import SerialPort = require('serialport');
import * as crc from "../crc16";

export default class ComPort extends NetPorts {
    private isopen: boolean = false; // индикатор открытия для работы
    private Port: any = undefined;   // ссылка на объек порта
    private baMsg: Array<number> = [] = [0x01,0x11];//запрос строки идентификатора
    //    console.log (baMsg);//смотрю что получилось   
    constructor(settings: any){
        super(settings);
        this.configure(settings);
        this.baMsg = [0x01,0x11];//запрос строки идентификатора
        this.baMsg = crc.appendCRC16toArray([0x01,0x11]);//добавляю CRC в конец пакета
        console.log (this.baMsg);//смотрю что получилось 
        console.log('SerialPorts created')
    }
    configure(settings: any): void {
        this.Port = new SerialPort(settings.port, settings.settings);
            console.log(this.Port);
            let self = this;
            //установить обработчики событий
            this.Port.on('open',  this.onOpen.bind(self));
            this.Port.on('close', this.onClose.bind(self));
            this.Port.on('error', this.onError.bind(self));
            this.Port.on('data',  this.onDataRead.bind(self));
    }

    public setOnRead (onRead: Function, owner: any): void {
        this.Port.on('data',  onRead.bind(owner));
    }

    public onDataRead(data: any, err: any):void {
        console.log(`onDataRead:> ${data} error:> ${err}`);
    }

    public onOpen():void {
        console.log('TSerialPort.Serial port is opened');
        this.isopen = true;//порт открыт можно работать
        this.write (this.baMsg);
    }

    public write (msg: any): boolean {
        const result = this.Port.write(Buffer.from(msg));
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
    }

    public get isOpen():boolean {
        return this.isopen;
    }
    /*
    async read():Promise<string> {
        let s = () => "Hi!"
        return await s()
    }
    async write(msg:string):Promise<boolean> {
        let s = (msg: String) => true
        return await s(msg)
    }
    */
}

/*
var SerialPort = require('serialport');
//Класс сериал порт
//отдаю его в класс TLnkSlot в объект comm
function TSerialPort (settings) {
    console.log(SerialPort);
    this.isOpen = false;
    this.sp = new SerialPort(settings.port, settings.settings // portName is instatiated to be COM3, replace as necessary
      //settings.baudRate: 115200,
      //dataBits: 8,
      //parity: 'none',
      //stopBits: 1,
      //flowControl: false
    );
    console.log(this.sp);
    
    //var baMsg = [0x01,0x11];//запрос строки идентификатора
    //var baMsg = crc.addCRC16toFrame([0x01,0x11]);//добавляю CRC в конец пакета
    //    console.log (baMsg);//смотрю что получилось   
    //обработчики событий
    this.onError = function (err){
        console.log('TSerialPort.Error: ', err.message);
    }

    this.onClose = function (){
        console.log('TSerialPort.Serial port is closed');
        this.isOpen = false;//порт закрыт, низя песать внего и четать из нево
    }

    this.onOpen = function (){
        console.log('TSerialPort.Serial port is opened');
        //this.sp.write(Buffer.from(baMsg));
        this.isOpen = true;//порт открыт можно работать
    }

    var self = this;
    //установить обработчики событий
    this.sp.on('open',  this.onOpen.bind(self));
    this.sp.on('close', this.onClose.bind(self));
    this.sp.on('error', this.onError.bind(self));

}
*/