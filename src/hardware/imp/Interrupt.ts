export interface Interrupt {
    IRQ: number;
    priority: number;
    name: String;
    input?: number[];
    output: number[];

    buffer(output: number, input?: number)

} // Interrupt