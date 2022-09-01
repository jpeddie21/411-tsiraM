// import statements
import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";

// declaration of class Memory.ts
export class Memory extends Hardware implements ClockListener {

    private MAR: string = "0x0000"; // memory address
    private MDR: number = 0x00; // data to be stored

    // constructor
    constructor() {

        super(0, "RAM");

    } // constructor

    // public method that creates the memory array
    public arrayCreated() {

        for(let i = 0x0000; i < this.myMemory; i++) 
            this.memoryArray[i] = 0x00;   

    } // arrayCreated

    // public method to display the output
    public displayMemory(begin, end) {

        for(let x = begin; x < end; x++) { 
            const hexValue = this.hexLog(this.memoryArray[x], 2);
            if(hexValue == null)
                this.log(": Address : " + this.hexLog(x, 4) + " Contains Value: ERR [hexValue conversion]: number " + this.memoryArray[x]);
            else this.log(": Address : " + this.hexLog(x, 4) + " Contains Value: " + hexValue);
        }
        this.log(": created - Addressable Space : " + this.memoryArray.length);

    } // displayMemory

    // pulse method from ClockListener.ts
    public pulse() {

        if(this.printLog) this.log(": received clock pulse");

    } // pulse

    // Getters and Setters for the MAR and MDR
    public getMAR() {

        return this.MAR;

    } // getMAR

    public setMAR(theMAR: string) {

        this.MAR = theMAR;

    } // setMar
    
    public getMDR() {

        return this.MDR;

    } // getMDR

    public setMDR(theMDR: number) {

        this.MDR = theMDR;

    } // setMDR

    // This method will read memory at the location in the MAR and update the MDR
    public memoryRead() {

        this.setMDR(this.memoryArray[this.getMAR()]);

    } // memoryRead

    // This method should write the contents of the MDR to memory at the location indicated by the MAR.
    public memoryWrite() {

        this.memoryArray[this.getMAR()] = this.getMDR();

    } // memoryWrite

    // All members overwritten with 0x0’s including entire memory array
    public memoryReset() {

        this.arrayCreated;
        this.setMAR("0x0000");
        this.setMDR(0x00);   

    } // memoryReset

} // Memory