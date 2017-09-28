export function escapeText(text: string) {
  // http://www.javascriptkit.com/jsref/escapesequence.shtml
  // \b	Backspace.
  // \f	Form feed.
  // \n	Newline.
  // \O	Nul character.
  // \r	Carriage return.
  // \t	Horizontal tab.
  // \v	Vertical tab.
  // \'	Single quote or apostrophe.
  // \"	Double quote.
  // \\	Backslash.
  // \ddd	The Latin-1 character specified by the three octal digits between 0 and 377.
  //   ie, copyright symbol is \251.
  // \xdd	The Latin-1 character specified by the two hexadecimal digits dd between 00 and FF.
  //   ie, copyright symbol is \xA9.
  // \udddd	The Unicode character specified by the four hexadecimal digits dddd.
  //   ie, copyright symbol is \u00A9.
  let _backspace = '\b'.charCodeAt(0);
  let _formFeed = '\f'.charCodeAt(0);
  let _newLine = '\n'.charCodeAt(0);
  let _nullChar = 0;
  let _carriageReturn = '\r'.charCodeAt(0);
  let _tab = '\t'.charCodeAt(0);
  let _verticalTab = '\v'.charCodeAt(0);
  let _backslash = '\\'.charCodeAt(0);
  let _doubleQuote = '"'.charCodeAt(0);

  let startPos = 0, chrCode, replaceWith = null, resultPieces = [];
  let len: number = text.length;

  for (let i = 0; i < len; i++) {
    chrCode = text.charCodeAt(i);
    switch (chrCode) {
      case _backspace:
        replaceWith = '\\b';
        break;
      case _formFeed:
        replaceWith = '\\f';
        break;
      case _newLine:
        replaceWith = '\\n';
        break;
      case _nullChar:
        replaceWith = '\\0';
        break;
      case _carriageReturn:
        replaceWith = '\\r';
        break;
      case _tab:
        replaceWith = '\\t';
        break;
      case _verticalTab:
        replaceWith = '\\v';
        break;
      case _backslash:
        replaceWith = '\\\\';
        break;
      case _doubleQuote:
        replaceWith = '\\"';
        break;
    }
    if (replaceWith !== null) {
      resultPieces.push(text.substring(startPos, i));
      resultPieces.push(replaceWith);
      startPos = i + 1;
      replaceWith = null;
    }
  }
  resultPieces.push(text.substring(startPos, len));
  return resultPieces.join('');
}
