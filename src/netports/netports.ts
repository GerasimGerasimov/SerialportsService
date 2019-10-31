export default abstract class NetPorts  {
    onReadEvent: Function;
    onErrorEvent: Function;
    constructor(settings: any) {};
    abstract configure(settings: any): void;
    abstract onError(err: any):void;
    abstract onRead(data: any, err: any):void;
    abstract write (msg: any): boolean;
    abstract get isOpen():boolean;
}