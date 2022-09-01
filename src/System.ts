// import statements 
import {Clock} from "./hardware/Clock";
import {Cpu} from "./hardware/Cpu";
import {Hardware} from "./hardware/Hardware";
import {InterruptController} from "./hardware/InterruptController";
import {Keyboard} from "./hardware/Keyboard";
import {Memory} from "./hardware/Memory";
import {MMU} from "./hardware/MMU";


// Constants
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL= 500;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.

// declaration of System class
export class System extends Hardware {

    // class creations/initializations
    private _CPU  = new Cpu(this);
    private _Memory = new Memory();
    private _Clock = new Clock();
    private _MMU = new MMU(this._CPU, this._Memory);
    private cpuDebug = true;
    private _Key = new Keyboard();
    private _IntCont = new InterruptController(this._CPU);

    public running: boolean = false;

    // Constructor
    constructor() {
        
        super(0, "SYS");

        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();

    } // constructor

    // Method that starts the system
    public startSystem(): boolean {

        // logging for system class
        this.log(": created");

        // creation of CPU
        this.startCPU(this.cpuDebug);

        // creation of Memory
        this.startMemory();

        // creation of Clock
        this.startClock();

        // creation of MMU
        this.startMMU();

        // InterruptController and keyboard
        this._Key.log(": created");
        this._IntCont.log(": created");
        
        this.programTest();

        return true;
        
    } // startSystem

    public stopSystem(): boolean {

        return false;
 
    } // stopSystem

    public startCPU(cpuDebug) {

        if (cpuDebug) this._CPU.log(": created");

    } // startCPU

    public startMemory() {

        this._Memory.log(": created");
        this._Memory.arrayCreated();

        // can change two arguements to see a range of specific addresses
        this._Memory.displayMemory(0x00, 0x00);

    } // startMemory

    public startClock() {
        
        this._Clock.setter(this._CPU);
        this._Clock.setter(this._Memory);
        this._Clock.log(": created");
        this._Clock.clock(CLOCK_INTERVAL);

    } // startClock

    public startMMU() {

        this._MMU.log(": created");
        this._CPU.addMMU(this._MMU);    // attaches the MMU to the CPU after it's creation

    } // startMMU

    private programTest() {

        this._MMU.writeImmediate(0x0000, 0xA9);
        this._MMU.writeImmediate(0x0001, 0x0D);
        this._MMU.writeImmediate(0x0002, 0xA9);
        this._MMU.writeImmediate(0x0003, 0x1D);
        this._MMU.writeImmediate(0x0004, 0xA9);
        this._MMU.writeImmediate(0x0005, 0x2D);
        this._MMU.writeImmediate(0x0006, 0xA9);
        this._MMU.writeImmediate(0x0007, 0x3F);
        this._MMU.writeImmediate(0x0008, 0xA2);
        this._MMU.writeImmediate(0x0009, 0x02);
        this._MMU.writeImmediate(0x000A, 0xFF);
        this._MMU.writeImmediate(0x000B, 0x00);
        if (true) this._MMU.memoryDump(0x0000, 0x000B);
        
    } // porgramTest

    private powersTest() {

        // load constant 0
        this._MMU.writeImmediate(0x0000, 0xA9);
        this._MMU.writeImmediate(0x0001, 0x00);
        // write acc (0) to 0040
        this._MMU.writeImmediate(0x0002, 0x8D);
        this._MMU.writeImmediate(0x0003, 0x40);
        this._MMU.writeImmediate(0x0004, 0x00);
        // load constant 1
        this._MMU.writeImmediate(0x0005, 0xA9);
        this._MMU.writeImmediate(0x0006, 0x01);
        // add acc (?) to mem 0040 (?)
        this._MMU.writeImmediate(0x0007, 0x6D);
        this._MMU.writeImmediate(0x0008, 0x40);
        this._MMU.writeImmediate(0x0009, 0x00);
        // write acc ? to 0040
        this._MMU.writeImmediate(0x000A, 0x8D);
        this._MMU.writeImmediate(0x000B, 0x40);
        this._MMU.writeImmediate(0x000C, 0x00);
        // Load y from memory 0040
        this._MMU.writeImmediate(0x000D, 0xAC);
        this._MMU.writeImmediate(0x000E, 0x40);
        this._MMU.writeImmediate(0x000F, 0x00);
        // Load x with constant (1) (to make the first system call)
        this._MMU.writeImmediate(0x0010, 0xA2);
        this._MMU.writeImmediate(0x0011, 0x01);
        // make the system call to print the value in the y register (3)
        this._MMU.writeImmediate(0x0012, 0xFF);
        // Load x with constant (2) (to make the second system call for the string)
        this._MMU.writeImmediate(0x0013, 0xA2);
        this._MMU.writeImmediate(0x0014, 0x02);
        // make the system call to print the value in the y register (3)
        this._MMU.writeImmediate(0x0015, 0xFF);
        this._MMU.writeImmediate(0x0016, 0x50);
        this._MMU.writeImmediate(0x0017, 0x00);
        // test DO (Branch Not Equal) will be NE and branch (0x0021 contains 0x20 and xReg contains B2)
        this._MMU.writeImmediate(0x0018, 0xD0);
        this._MMU.writeImmediate(0x0019, 0xED);
        // globals
        this._MMU.writeImmediate(0x0050, 0x2C);
        this._MMU.writeImmediate(0x0052, 0x00);
        this._MMU.memoryDump(0x0000, 0x001A);
        this._MMU.memoryDump(0x0050, 0x0053);

    } // powersTest

} // System

let system: System = new System();