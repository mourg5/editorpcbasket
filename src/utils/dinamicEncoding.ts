/**
 * Dinamic Multimedia's proprietary character substitution cipher/encoding
 * ported directly from EpcbUtils/DinamicEncoding.cs
 */

const CONVERSION_CHARS: string[] = [
  'a', '\'', 'c', 'b', 'e', 'd', 'g', 'f', 'i', 'h', 'k', 'j', 'm', 'l', 'o', 'n', 'q', 'p', 's', 'r', 'u', 't', 'w', 'v', 'y', 'x', '{', 'z',
  '}', '|', ' ', '~', 'A', '@', 'C', 'B', 'E', 'D', 'G', 'F', 'I', 'H', 'K', 'J', 'M', 'L', 'O', 'N', 'Q', 'P', 'S', 'R', 'U', 'T', 'W', 'V',
  'Y', 'X', '[', 'Z', ']', '\\', '_', '^', '!', ' ', '#', '"', '%', '$', '\'', '&', ')', '(', '+', '*', '-', ',', '/', '.', '1', '0', '3',
  '2', '5', '4', '7', '6', '9', '8', '=', '=', '=', '<', '?', '>', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=',
  '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', 'á', 'à', 'ã', 'â', 'å', 'ä', 'ç', 'æ', 'é', 'è', 'ë', 'ê', 'í',
  'ì', 'ï', 'î', 'ñ', ' ', 'ó', 'ò', 'õ', 'ô', '÷', 'ö', 'ù', 'ø', 'û', 'ú', 'ý', 'ü', 'ÿ', 'B', 'Á', 'À', 'Ã', 'Â', 'Å', 'Ä', 'Ç', 'Æ', 'É', 'È',
  'Ë', 'Ê', 'Í', 'Ì', 'Ï', 'Î', 'Ñ', 'D', 'Ó', 'Ò', 'Õ', 'Ô', 'x', 'Ö', 'Ù', 'Ø', 'Û', 'Ú', 'Ý', 'Ü', 'ß', 'D', '¡', '.', '£', '¢', '¥', ' ', '§',
  '.', '©', '¨', '«', 'ª', '.', '¬', '.', '®', '±', '°', '.', '.', 'µ', '´', '•', '¶', '.', '.', '.', '.', '.', '.', '¿', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=',
  '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '='
];

export class DinamicEncoding {
  static getString(bytes: Uint8Array | number[]): string {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      const idx = bytes[i];
      if (idx < CONVERSION_CHARS.length) {
        result += CONVERSION_CHARS[idx];
      } else {
        result += ' ';
      }
    }
    return result;
  }

  static getBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = this.getByte(str[i]);
    }
    return bytes;
  }

  static getByte(char: string): number {
    for (let i = 0; i < CONVERSION_CHARS.length; i++) {
      if (CONVERSION_CHARS[i] === char) {
        return i;
      }
    }
    return 99; // Default fallback in DinamicEncoding.cs
  }
}
