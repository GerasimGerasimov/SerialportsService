export abstract class NetPorts  {
    abstract get PortName():string;
    constructor(settings: any) {};
    abstract get isOpen():boolean;
    abstract write (cmd: iCmd): Promise<String>;
}

export interface iCmd {
    cmd: Array<number>;
    timeOut?:number;
    NotRespond?: boolean;
}