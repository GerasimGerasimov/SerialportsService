export abstract class NetPorts  {
    constructor(settings: any) {};
    abstract getCOMAnswer(cmd: Object): Promise<any>;
}

export interface iCmd {
    cmd: Array<number>;
    timeOut?:number;
    ChunksEndTime?:number;
    NotRespond?: boolean;
}