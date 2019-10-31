export default abstract class NetPorts  {
    constructor(settings: any) {};
    abstract configure(settings: any): void;
    abstract onOpen():void;
    abstract onClose():void;
    abstract onError(err: any):void;
    abstract onDataRead(data: any, err: any):void;
    abstract write (msg: any): boolean;
    abstract get isOpen():boolean;//открыт порт?
    abstract setOnRead (onRead: Function, owner: any): void;
    // abstract read():Promise<string>;
    // abstract write(msg:string):Promise<boolean>;
}