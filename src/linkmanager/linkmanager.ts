import NetPorts from "../netports/netports";

interface ISlot {
    State: {
        ErrPort: boolean,   // ошибка последовательного порта (например, он закрыт)
        ErrTimeOut: boolean,// ответ устройства не получен
        ErrCRC: boolean     // ответ есть но неправильная контрольная сумма    
    },
    Settings: {
        TimeOut: Number,         // время ожидания ответа в милисекундах
        BeforeWriteTime: Number, // задержка перед отправкой следующего запроса
    },
    Flow: {
        Skip: boolean,      // true - пропустить слот (и перейти к следующему)
        NoRespond: boolean, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)
        Change: boolean     // true - перейти к следующему слоту
    },
    name: string;    // имя слота для идентификации
    out: Array<any>; // массив с данными (командой) для передачи в устройство
    in: Array<any>;  // массив с данными полученными от устройства
    onRead?: (...args: any[]) => void // callback функция которую требуется вызвать по получению даных от устройства (даже если есть ошибки)
}

class Slot implements ISlot {
    State = {
        ErrPort: false,   // ошибка последовательного порта (например, он закрыт)
        ErrTimeOut: false,// ответ устройства не получен
        ErrCRC: false     // ошибка контрольной суммы    
    };
    Settings = {
        TimeOut: 200,         // время ожидания ответа в милисекундах
        BeforeWriteTime: 2, // задержка перед отправкой следующего запроса
    };
    Flow = {
        Skip: false,      // true - пропустить слот (и перейти к следующему)
        NoRespond: false, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)
        Change: false,    // true - перейти к следующему слоту
    };
    name:string = '';    // имя слота для идентификации
    out = []; // массив с данными (командой) для передачи в устройство
    in = [];  // массив с данными полученными от устройства
    onRead = null// callback функция которую требуется вызвать по получению даных от устройства (даже если есть ошибки)
}

export default class LinkManager {
    private port: NetPorts;//коммуникационный порт привязанный к TLnkManager
    private slots: Array<ISlot> = []; // массив слотов 
    private index: number = 0; // номер активного слота
    private timerOutID = null;//ID таймера отсчёта TimeOut
    private timerOpenPortID = null;//ожидание открытия порта
    private self: LinkManager = this;

    constructor(port: NetPorts){
        this.port = port;
        let s = new Slot();
        this.slots.push(s);
        //установка обработчика события поступления данных в порт
        this.port.setOnRead (this.onRead, self);
    }

    //добавить слот
    public addSlot (data, callback){
        console.log('TLnkManager.addSlot');
        const slot = new Slot(data, callback);//создаю новый слот
        this.slots.push(slot);//добавляю его в массив слотов
    }

    public start (): void {
        console.log('TLnkManager.start');
        this.chekPortOpen();
    }

    //запускает Линк Манагер в автоматическую работу
    private chekPortOpen (): void {
        (this.port.isOpen)
        ? this.run('PortOpen')
        : this.timerOpenPortID= setTimeout (this.chekPortOpen.bind(self),1000);
    }


    private run(msg: string): void {

    }

    private onRead(){

    }
}

        /*
        let s = new Slot();
        s.name = '!';
        s.Settings.TimeOut = 100;
        s.Flow.Change = true;
        s.out[0]=100;
        s.in[0]=22;
        s.onRead = this.onReadMessage;
        this.slots.push(s);*/