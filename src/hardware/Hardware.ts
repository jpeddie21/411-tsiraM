// class Hardware declaration
export class Hardware {

    // Public variables
    public id: number = 0;
    public name: String = "";
    public myMemory: number = 0x10000;      // Memory size
    public memoryArray = [];                // Array for Memory.ts
    public cpuClockCount: number = 0;       // Count for Cpu
    public clockListeners = [];             // Array of clockListeners
    public printLog: Boolean = false;

    // constructor
    constructor(id: number, name: String) {

        this.id = id;
        this.name = name;

    } // Constructor

    // public method to log to the console
    public log(logging) {
    
        const time = Date.now();
        console.log("[HW - " + this.name + " id: " + this.id + " - " + time + "]" + logging);
        
    } // log

    // public method to convert into hexadecimal
    public hexLog(input, length) {

        const hexInt = parseInt(input);
        if(isNaN(hexInt)) 
            return null;                                                               // returns null if not a number
        const hexPadded = hexInt.toString(16).padStart(length, "0").toUpperCase();     // returns hexInt with padding and in upper case
        return hexPadded;
        
    } //hexLog

} // Hardware