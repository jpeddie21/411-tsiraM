import {Memory} from "./Memory";
import {Cpu} from "./Cpu";
import {Hardware} from "./Hardware";

export class MMU extends Hardware {

    private _Mem: Memory;
    private _Cpu: Cpu;

    constructor(systemCPU: Cpu, systemMem: Memory) {

        super(0, "MMU");

        this._Mem = systemMem;
        this._Cpu = systemCPU;

    } // constructor

    // Getters and Setters for the MAR and MDR
    public getMAR() {

        return this._Mem.getMAR();

    } // getMAR

    public setMAR(byte0: string, byte1?: string) {
        
        let toSet = byte0;
        if (byte1 != null) toSet = this.binaryToHex(byte1) + this.binaryToHex(byte0);
        this._Mem.setMAR(toSet);

    } // setMAr

    public getMDR() {

        if(this._Mem.getMDR() == undefined)
            return 0x00;
        return this._Mem.getMDR();

    } // getMDR

    public setMDR(theMDR: number) {

        this._Mem.setMDR(theMDR);

    } // setMDR

    // Loads a “static” program into memory
    public writeImmediate(address: number, data: number) {
        
        this.setMAR(address.toString(16));
        this.setMDR(data);
        this.memoryWrite();

    } // writeImmediate

    public readImmediate(address: number) {

        this.setMAR(address.toString(16));
        this.memoryRead();

    } // readImmediate

    public memoryRead() {

        this._Mem.memoryRead();

    } // memoryRead

    public memoryWrite() {

        this._Mem.memoryWrite();
 
    } // memoryWrite

    public memoryDump(fromAddress: number, toAddress: number) {

        this.log(": Initialized Memory");
        this.log(": Memory Dump: Debug");
        this.log(": --------------------------------------");
        let currentAdd = fromAddress;
        while(currentAdd <= toAddress) {
            this.setMAR(currentAdd.toString(16));
            this._Mem.memoryRead();
            this.log(": Addr " + this.hexLog(currentAdd, 4) + ": | " + this.hexLog(this.getMDR(), 2));
            currentAdd++;
        }
        this.log(": --------------------------------------");
        this.log(": Memory Dump Complete");

    } // memoryDump
    
    private binaryToHex(binary: string) {

        return parseInt(binary, 2).toString(16)
        
    } // binaryToHex

} // MMU


/* 
NOTES/TODO:
- Try to figure out little Endian
- Figure out how to make memoryDump work on a clock pulse

NOTES
Read Immediate: everytime CPU advances, do a fetch
Look for MAR - look for instruction
Call MMU
1. Read a specific address
2. CPU requests read
3. Read mem address 1
- Read in MMU to pass mem address
- MMU calls memory to call MAR setter
- Seperate method in memory to do a read
- Get data from
Memory has MAR, MDR, and array. 
- Ability to put stuff in MDR and MAR, read and write

MMU can be subclass, but structured in such a way that MMU calls them and does them in the correct order
Put low order and high order bytes in the right order in MMU to put in MAR

How would you go about calling the MMU.setLowerByte and MMU.setHigherByte for Little Endian? (I NEED THIS DONE SOMEHOW)
*/