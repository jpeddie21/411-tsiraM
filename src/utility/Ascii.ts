export class Ascii {

    public convertFromAscii(byte: number) {

        return String.fromCharCode(byte);

    } // convertFromAscii

    public convertToAscii(input: String) {

        return input.charCodeAt(0);

    } // convertToAscii

} // Ascii