// import statements
import { textSpanIntersectsWithPosition } from "typescript";
import {System} from "../System";
import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";
import {MMU} from "./MMU";

export class Cpu extends Hardware implements ClockListener{

    // Number vars
    private stepCount: number = 0x00;    // count in cycle
    private iReg: number = 0x00;    // Instruction Register
    private acc: number = 0x00;     // Accumulator
    private xReg: number = 0x00;    // X register
    private yReg: number = 0x00;    // Y register
    private zFlag: number = 0x00;   // Z flag
    private pCount: number = 0x0000;     // Program counter

    // String vars
    private nextInstruction: String = null;     // next intstruction to execute
    
    // Other vars
    private _MMU: MMU;
    private _System: System

    // Bool vars
    private run: Boolean = true;
    private moreData: Boolean;  // checks for more data to decode
    private incFlag: Boolean;   // increment flag
    private addressExists: Boolean; 

    // constructor
    constructor(system: System) {

        super(0, "CPU");    
        this._System = system;

    } // Constructor
    
    // pulse method from ClockListener.ts
    public pulse() {
            
        this.cpuClockCount++;
        if(this.printLog) this.log(": received clock pulse - CPU Clock Count: " + this.cpuClockCount);  
        this.nextStep(this.run);
        this.cpuLogging(this.run);  // output is from beginning of the cycle???

    } // pulse

    public nextStep(run) {
        if(run) {
            // console.log("Debug " + this.nextInstruction);
            if(this.nextInstruction == null || this.nextInstruction == undefined) this.nextInstruction = "fetch";
            switch(this.nextInstruction) {
                case "fetch":
                    this.fetch();
                    break;
                case "decode":
                    this.decode();
                    break;
                case "execute":
                    this.execute();
                    break;
                case "writeBack":
                    this.writeBack();
                    break;
                case "interruptCheck":
                    this.interruptCheck();
                    break;
                default:
                    this.log(": No next step.");
            } // switch
        } else this.log(": No next step. Press Ctrl + C.");

        this.stepCount++;

    } // nextStep

    public fetch() {

        this._MMU.setMAR(this.pCount.toString(16));
        this._MMU.memoryRead();
        this.iReg = this._MMU.getMDR()
        this.pCount++;
        this.stepCount++;
        this.nextInstruction = "decode";

    } // fetch

    public decode() { 
        if(this.moreData) {                              
            this._MMU.setMAR(this.pCount.toString(16));     // sets MAR to program count
            this._MMU.memoryRead();                         // sets MDR to address from the MAR

            if(this.addressExists) {
                this._MMU.setMAR(this._MMU.getMDR().toString(16));
                this._MMU.memoryRead();
            }

            this.pCount++;
            this.nextInstruction = "execute";

            this.moreData = false;
            this.addressExists = false;
        } else {
            switch (this.iReg) {
                // Loads from a constant
                case 0xA9:
                case 0xA2:
                case 0xA0:
                case 0xD0:
                    this.moreData = true;
                    this.nextInstruction = "decode";
                    break;

                // Loads from a position in memory
                case 0xAD:
                case 0x6D:
                case 0xAE:
                case 0xAC:
                case 0xEC:
                case 0xEE:
                    this.moreData = true;
                    this.addressExists = true;
                    this.nextInstruction = "decode";
                    break;

                // Stores at a position in memory
                case 0x8D:
                    this.moreData = true;
                    this.nextInstruction = "decode";
                    break;

                // Loads from Accumulator/register
                case 0x8A:
                case 0x98:
                case 0xAA:
                case 0xA8:
                    this.nextInstruction = "execute";
                    break;

                // Stops the program
                case 0x00:
                    this.nextInstruction = "execute";
                    break;

                // System Call
                case 0xFF:
                    if (this.xReg == 0x02) {
                        this.moreData = true;
                        this.nextInstruction = "decode";
                    } else if (this.xReg == 0x01) this.nextInstruction = "execute";
                    else this.nextInstruction = "interruptCheck";
                    break;

                default: 
                    this.nextInstruction = "execute";
                    break;
            } // switch
        }

        this.stepCount++;

    } // decode

    public execute() {

        this.nextInstruction = "interruptCheck";

        switch(this.iReg) {
            // Loads the accumulator with a value
            case 0xA9:
            case 0xAD:
                this.acc = this._MMU.getMDR();
                break;

            // Stores the value from the accumulator at a given address
            case 0x8D:                
                this._MMU.setMAR(this._MMU.getMDR().toString(16));
                this._MMU.setMDR(this.acc);
                this.nextInstruction = "writeBack";
                break;

            // Loads the accumulator with the value from the xReg
            case 0x8A:
                this.acc = this.xReg;
                break;

            // Loads the accumulator with the value from the yReg
            case 0x98: 
                this.acc = this.yReg;
                break;

            // Adds the value at a given address to the accumulator and leaves it in the accumulator
            case 0x6D:
                this.acc += this._MMU.getMDR();
                break;

            // Loads the xReg with a value
            case 0xA2:
            case 0xAE:
                this.xReg = this._MMU.getMDR();
                break;

            // Loads the xReg with the value in the Accumulator
            case 0xAA:
                this.xReg = this.acc;
                break;

            // Loads the yReg with a value
            case 0xA0:
            case 0xAC:
                this.yReg = this._MMU.getMDR();
                break;

            // Loads the yReg with the value in the Accumulator
            case 0xA8:
                this.yReg = this.acc;
                break;

            // Kills the program 
            case 0x00:
                let endCheckAddress = this.pCount + 1;
                this._MMU.readImmediate(endCheckAddress);
                this._MMU.memoryRead();
                if(this._MMU.getMDR() != 0x00) this.nextInstruction = "interruptCheck";
                else this.run = this._System.stopSystem();
                break;
            
            // Compares a byte in memory to the x register
            case 0xEC:
                if(this._MMU.getMDR() == this.xReg) this.zFlag = 1;
                break;

            // Adds a value to the program counter, wraparound enabled
            case 0xD0:
                if(this.zFlag != 0) {
                    let temp = this._MMU.getMDR();
                    if(temp > 0x7F) temp = 0x7F - temp;
                    this.pCount += temp;
                }
                break;

            // Increments the value of a byte at a given position
            case 0xEE:
                if(!this.incFlag) {
                    this.acc = this._MMU.getMDR();
                    this.incFlag = true;
                    this.nextInstruction = "execute";
                } else if(this.incFlag) {
                    this.acc++;
                    this.incFlag = false;
                    this.nextInstruction = "writeBack";
                }
                break;

            // System out
            case 0xFF:
                let address = this._MMU.getMAR();
                if(address != null && address != undefined) {
                    let temp = address;
                    let out = this._MMU.getMDR();
                    while(this._MMU.getMDR() != 0x00) {
                        this._MMU.setMAR(temp + 1);
                        this._MMU.memoryRead()
                        out = this._MMU.getMDR();
                    } 
                    process.stdout.write(this.hexLog(out, 2));
                } else process.stdout.write(this.hexLog(this.yReg, 2));
                break;

        } // switch

        this.stepCount++;

    } // execute

    public writeBack() {

        this._MMU.memoryWrite();
        this.nextInstruction = "interruptCheck";

    } // writeBack

    public interruptCheck() {

        this.nextInstruction = "fetch";

    } // interruptCheck

    public cpuLogging(run) {

        if(run) this.log(": CPU State | Mode: 0 PC: " + this.hexLog(this.pCount, 4) + " IR: " + this.hexLog(this.iReg, 2) + " Acc: " + this.hexLog(this.acc, 2) 
            + " xReg: " + this.xReg + " yReg: " + this.yReg + " zFlag: " + this.zFlag + " Step: " + this.stepCount);

    } // cpuLogging

    public addMMU(systemMMU: MMU) {

        this._MMU = systemMMU;

    } // addMMU

} // Cpu

/*
NOTES/TODO: 
- any time a pulse would go off, check program counter then check instruction register (ir) at beginning of every step unless it is a fetch()
- cycle/count incremented when going to memory
fetch()
- put instruction into instruction register based off program counter
- count++
decode() 
- what is the instruction in the ir
- count++
execute()
- does the instruction MDR to acc
writeBack()
- send value of acc back to Memory (MDR)
interrupt()
- burns a cpu cycle

- have to build branching and stuff
*/