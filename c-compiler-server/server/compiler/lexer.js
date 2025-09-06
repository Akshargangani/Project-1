const KEYWORDS = new Set(['int','return','if','else','while','for','printf']);

function isAlpha(ch){ return /[A-Za-z_]/.test(ch); }
function isAlnum(ch){ return /[A-Za-z0-9_]/.test(ch); }
function isDigit(ch){ return /[0-9]/.test(ch); }

function lex(input){
  let i=0, line=1, col=1;
  const tokens = [];
  function error(msg){ throw new Error(`Lex error (${line}:${col}): ${msg}`); }
  while (i < input.length) {
    const ch = input[i];
    if (ch === ' ' || ch === '\t' || ch === '\r') { i++; col++; continue; }
    if (ch === '\n') { i++; line++; col=1; continue; }
    if (ch === '/' && input[i+1] === '/') {
      while (i < input.length && input[i] !== '\n') { i++; }
      continue;
    }
    if (ch === '/' && input[i+1] === '*') {
      i+=2; col+=2;
      while (i < input.length && !(input[i]==='*' && input[i+1]==='/')) {
        if (input[i]==='\n') { line++; col=1; } else col++;
        i++;
      }
      i+=2; col+=2; continue;
    }
    // strings
    if (ch === '"') {
      let j = i+1;
      let s = '';
      while (j < input.length && input[j] !== '"') {
        if (input[j] === '\\' && j+1 < input.length) {
          const esc = input[j+1];
          if (esc === 'n') s += '\n';
          else s += esc;
          j += 2;
        } else {
          s += input[j];
          j++;
        }
      }
      if (j >= input.length) error('Unterminated string literal');
      tokens.push({ type: 'STRING', value: s });
      const adv = j - i + 1;
      i += adv; col += adv; continue;
    }
    // numbers
    if (isDigit(ch)) {
      let j=i; let num = '';
      while (j < input.length && isDigit(input[j])) { num += input[j]; j++; }
      tokens.push({ type: 'NUMBER', value: parseInt(num,10) });
      col += (j-i); i = j; continue;
    }
    // identifiers / keywords
    if (isAlpha(ch)) {
      let j=i; let id='';
      while (j < input.length && isAlnum(input[j])) { id += input[j]; j++; }
      if (KEYWORDS.has(id)) tokens.push({ type: 'KEYWORD', value: id });
      else tokens.push({ type: 'IDENT', value: id });
      col += (j-i); i = j; continue;
    }
    // multi-char ops
    const two = input.substr(i,2);
    if (['==','!=','<=','>=','&&','||'].includes(two)) {
      tokens.push({ type: 'OP', value: two }); i+=2; col+=2; continue;
    }
    // single char tokens
    const singleMap = {
      '+': 'OP', '-':'OP', '*':'OP', '/':'OP', '%':'OP',
      '<':'OP','>':'OP','=':'OP',
      ';':'SEMICOLON', ',':'COMMA', '(':'LPAREN', ')':'RPAREN',
      '{':'LBRACE', '}':'RBRACE'
    };
    if (singleMap[ch]) {
      tokens.push({ type: singleMap[ch], value: ch });
      i++; col++; continue;
    }
    error('Unknown char: ' + ch);
  }
  tokens.push({ type: 'EOF' });
  return tokens;
}

module.exports = { lex };
