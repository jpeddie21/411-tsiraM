import { Cpu } from "./Cpu";
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";

export class InterruptController extends Hardware implements ClockListener {

    private readonly interruptItemsList: Interrupt[];
    private readonly interruptList: Object[][];
    private _Cpu: Cpu;

    constructor(cpu: Cpu) {

        super(0, "INT");
        this._Cpu = cpu;
        this.interruptList = [];
        this.interruptItemsList =[];

    } // constructor

    public addInterruptObject(interruptObj: Interrupt) {
        
        this.interruptItemsList[this.interruptItemsList.length] = interruptObj;

    } // addInterruptObject

    public addInterrputRequest(IRQ: number, priority: number, name: String, output: number) {
        
        this.interruptList[this.interruptList.length] = [IRQ, priority, name, output];
    
    } // addInterruptRequest

    private getHigherPriority() {

        let higherPriorityReq = this.interruptList[0]
        let higherPriority = this.interruptItemsList[0][1];

        for(let x = 0; x <this.interruptList.length; x++) {
            if(this.interruptList[x][1] > higherPriority) {
                higherPriorityReq = this.interruptList[x];
                higherPriority = this.interruptList[x][1];
            }
        }
        
        return higherPriorityReq;
    } // getHigherPriority

    public pulse() {}
} // InterruptController