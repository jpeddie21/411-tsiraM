// imports
import {Hardware} from "./Hardware";

// declaration of class clock
export class Clock extends Hardware {

    // constructor
    constructor() {

        super(0, "CLK");

    } // constructor

    // Add setter to get Memory and Cpu from System (somehow change????)
    public setter(method) {

        this.clockListeners.push(method);

    } // setter

    public clock(interval) {
            
        // has an interval passed from System.ts
        setInterval( () => {
            if(this.printLog) this.log(": Clock Pulse Initialized");
            for(let x = 0; x < this.clockListeners.length; x++)
                this.clockListeners[x].pulse();
        }, interval); // setInterval

    } // clock

} // Clock