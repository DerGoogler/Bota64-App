class UTF8 {
  static encode(str: string) {
    return new UTF8().encode(str);
  }
  static decode(data: Uint8Array | any) {
    return new UTF8().decode(data);
  }

  private EOF_byte: number = -1;
  private EOF_code_point: number = -1;
  private encoderError(code_point: any) {
    console.error("UTF8 encoderError", code_point);
  }
  private decoderError(fatal: any, opt_code_point?: any): number {
    if (fatal) console.error("UTF8 decoderError", opt_code_point);
    return opt_code_point || 0xfffd;
  }
  private inRange(a: number, min: number, max: number) {
    return min <= a && a <= max;
  }
  private div(n: number, d: number) {
    return Math.floor(n / d);
  }
  private stringToCodePoints(string: string) {
    /** @type {Array.<number>} */
    let cps = [];
    // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
    let i = 0,
      n = string.length;
    while (i < string.length) {
      let c = string.charCodeAt(i);
      if (!this.inRange(c, 0xd800, 0xdfff)) {
        cps.push(c);
      } else if (this.inRange(c, 0xdc00, 0xdfff)) {
        cps.push(0xfffd);
      } else {
        // (inRange(c, 0xD800, 0xDBFF))
        if (i == n - 1) {
          cps.push(0xfffd);
        } else {
          let d = string.charCodeAt(i + 1);
          if (this.inRange(d, 0xdc00, 0xdfff)) {
            let a = c & 0x3ff;
            let b = d & 0x3ff;
            i += 1;
            cps.push(0x10000 + (a << 10) + b);
          } else {
            cps.push(0xfffd);
          }
        }
      }
      i += 1;
    }
    return cps;
  }

  private encode(str: string): Uint8Array {
    let pos: number = 0;
    let codePoints = this.stringToCodePoints(str);
    let outputBytes = [];

    while (codePoints.length > pos) {
      let code_point: number = codePoints[pos++];

      if (this.inRange(code_point, 0xd800, 0xdfff)) {
        this.encoderError(code_point);
      } else if (this.inRange(code_point, 0x0000, 0x007f)) {
        outputBytes.push(code_point);
      } else {
        let count = 0,
          offset = 0;
        if (this.inRange(code_point, 0x0080, 0x07ff)) {
          count = 1;
          offset = 0xc0;
        } else if (this.inRange(code_point, 0x0800, 0xffff)) {
          count = 2;
          offset = 0xe0;
        } else if (this.inRange(code_point, 0x10000, 0x10ffff)) {
          count = 3;
          offset = 0xf0;
        }

        outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);

        while (count > 0) {
          let temp = this.div(code_point, Math.pow(64, count - 1));
          outputBytes.push(0x80 + (temp % 64));
          count -= 1;
        }
      }
    }
    return new Uint8Array(outputBytes);
  }

  private decode(data: Uint8Array): string {
    let fatal: boolean = false;
    let pos: number = 0;
    let result: string = "";
    let code_point: number | null;
    let utf8_code_point = 0;
    let utf8_bytes_needed = 0;
    let utf8_bytes_seen = 0;
    let utf8_lower_boundary = 0;

    while (data.length > pos) {
      let _byte = data[pos++];

      if (_byte == this.EOF_byte) {
        if (utf8_bytes_needed != 0) {
          code_point = this.decoderError(fatal);
        } else {
          code_point = this.EOF_code_point;
        }
      } else {
        if (utf8_bytes_needed == 0) {
          if (this.inRange(_byte, 0x00, 0x7f)) {
            code_point = _byte;
          } else {
            if (this.inRange(_byte, 0xc2, 0xdf)) {
              utf8_bytes_needed = 1;
              utf8_lower_boundary = 0x80;
              utf8_code_point = _byte - 0xc0;
            } else if (this.inRange(_byte, 0xe0, 0xef)) {
              utf8_bytes_needed = 2;
              utf8_lower_boundary = 0x800;
              utf8_code_point = _byte - 0xe0;
            } else if (this.inRange(_byte, 0xf0, 0xf4)) {
              utf8_bytes_needed = 3;
              utf8_lower_boundary = 0x10000;
              utf8_code_point = _byte - 0xf0;
            } else {
              this.decoderError(fatal);
            }
            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
            code_point = null;
          }
        } else if (!this.inRange(_byte, 0x80, 0xbf)) {
          utf8_code_point = 0;
          utf8_bytes_needed = 0;
          utf8_bytes_seen = 0;
          utf8_lower_boundary = 0;
          pos--;
          code_point = this.decoderError(fatal, _byte);
        } else {
          utf8_bytes_seen += 1;
          utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

          if (utf8_bytes_seen !== utf8_bytes_needed) {
            code_point = null;
          } else {
            let cp = utf8_code_point;
            let lower_boundary = utf8_lower_boundary;
            utf8_code_point = 0;
            utf8_bytes_needed = 0;
            utf8_bytes_seen = 0;
            utf8_lower_boundary = 0;
            if (this.inRange(cp, lower_boundary, 0x10ffff) && !this.inRange(cp, 0xd800, 0xdfff)) {
              code_point = cp;
            } else {
              code_point = this.decoderError(fatal, _byte);
            }
          }
        }
      }
      //Decode string
      if (code_point !== null && code_point !== this.EOF_code_point) {
        if (code_point <= 0xffff) {
          if (code_point > 0) result += String.fromCharCode(code_point);
        } else {
          code_point -= 0x10000;
          result += String.fromCharCode(0xd800 + ((code_point >> 10) & 0x3ff));
          result += String.fromCharCode(0xdc00 + (code_point & 0x3ff));
        }
      }
    }
    return result;
  }
}

export default UTF8;
