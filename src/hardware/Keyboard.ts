import { Hardware } from "./Hardware";
import { Interrupt } from "./imp/Interrupt";

export class Keyboard extends Hardware implements Interrupt {
    IRQ: number;
    output: number[];
    priority: number;

    constructor() {

        super(0, "KEY");

    } // constructor

    buffer(output: number) {}

} // Keyboard