function expect(tok, type, value=null){
  if (tok.type !== type) throw new Error(`Expected ${type} got ${tok.type}`);
  if (value !== null && tok.value !== value) throw new Error(`Expected ${value} got ${tok.value}`);
}

function parseProgram(tokens){
  let pos = 0;
  function peek(){ return tokens[pos]; }
  function next(){ return tokens[pos++]; }

  function consume(type, value=null){
    const t = peek();
    if (t.type !== type || (value !== null && t.value !== value)) {
      throw new Error(`Parse error: expected ${type}${value?(' '+value):''} but got ${t.type}${t.value?(' '+t.value):''}`);
    }
    return next();
  }

  // parse functions: only "int IDENT ( params ) { body }"
  function parseFunction(){
    const t1 = peek();
    if (t1.type === 'KEYWORD' && t1.value === 'int') {
      next(); // int
      const id = consume('IDENT').value;
      consume('LPAREN');
      const params = [];
      if (peek().type !== 'RPAREN') {
        while (true) {
          consume('KEYWORD', 'int');
          const pname = consume('IDENT').value;
          params.push({ name: pname, type: 'int' });
          if (peek().type === 'COMMA') { next(); continue; }
          break;
        }
      }
      consume('RPAREN');
      const body = parseBlock();
      return { type: 'Function', name: id, params, body };
    }
    throw new Error('Expected function declaration at ' + JSON.stringify(t1));
  }

  function parseBlock(){
    consume('LBRACE');
    const stmts = [];
    while (peek().type !== 'RBRACE') {
      stmts.push(parseStatement());
    }
    consume('RBRACE');
    return { type: 'Block', body: stmts };
  }

  function parseStatement(){
    const t = peek();
    if (t.type === 'KEYWORD' && t.value === 'int') return parseVarDecl();
    if (t.type === 'KEYWORD' && t.value === 'return') { next(); const expr = parseExpression(); consume('SEMICOLON'); return { type:'Return', expr }; }
    if (t.type === 'KEYWORD' && t.value === 'if') return parseIf();
    if (t.type === 'KEYWORD' && t.value === 'while') return parseWhile();
    if (t.type === 'KEYWORD' && t.value === 'for') return parseFor();
    if (t.type === 'LBRACE') return parseBlock();
    // assignment or expression statement
    const expr = parseExpression();
    if (peek().type === 'OP' && peek().value === '=') {
      // assignment should have left identifier
      if (expr.type !== 'Identifier') throw new Error('Left side of assignment must be identifier');
      next(); // =
      const right = parseExpression();
      consume('SEMICOLON');
      return { type:'Assign', name: expr.name, expr: right };
    } else {
      consume('SEMICOLON');
      return { type:'ExprStmt', expr };
    }
  }

  function parseVarDecl(){
    consume('KEYWORD','int');
    const name = consume('IDENT').value;
    let init = null;
    if (peek().type === 'OP' && peek().value === '=') {
      next();
      init = parseExpression();
    }
    consume('SEMICOLON');
    return { type:'VarDecl', name, init };
  }

  function parseIf(){
    consume('KEYWORD','if');
    consume('LPAREN');
    const cond = parseExpression();
    consume('RPAREN');
    const thenStmt = parseStatement();
    let elseStmt = null;
    if (peek().type === 'KEYWORD' && peek().value === 'else') {
      next();
      elseStmt = parseStatement();
    }
    return { type:'If', cond, thenStmt, elseStmt };
  }

  function parseWhile(){
    consume('KEYWORD','while');
    consume('LPAREN');
    const cond = parseExpression();
    consume('RPAREN');
    const body = parseStatement();
    return { type:'While', cond, body };
  }

  function parseFor(){
    consume('KEYWORD','for');
    consume('LPAREN');
   
    
    let init = null;
    if (peek().type === 'KEYWORD' && peek().value === 'int') init = parseVarDecl(); // consumes semicolon
    else if (peek().type === 'SEMICOLON') { consume('SEMICOLON'); init = null; }
    else { init = parseExpression(); consume('SEMICOLON'); }
    const cond = (peek().type === 'SEMICOLON') ? null : parseExpression();
    consume('SEMICOLON');
    const update = (peek().type === 'RPAREN') ? null : parseExpression();
    consume('RPAREN');
    const body = parseStatement();
    return { type:'For', init, cond, update, body };
  }


  function parseExpression(){ return parseEquality(); }
  function parseEquality(){
    let left = parseRelational();
    while (peek().type === 'OP' && (peek().value === '==' || peek().value === '!=')) {
      const op = next().value;
      const right = parseRelational();
      left = { type:'Binary', op, left, right };
    }
    return left;
  }
  function parseRelational(){
    let left = parseAddSub();
    while (peek().type === 'OP' && ['<','>','<=','>='].includes(peek().value)) {
      const op = next().value;
      const right = parseAddSub();
      left = { type:'Binary', op, left, right };
    }
    return left;
  }
  function parseAddSub(){
    let left = parseMulDiv();
    while (peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseMulDiv();
      left = { type:'Binary', op, left, right };
    }
    return left;
  }
  function parseMulDiv(){
    let left = parseUnary();
    while (peek().type === 'OP' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = next().value;
      const right = parseUnary();
      left = { type:'Binary', op, left, right };
    }
    return left;
  }
  function parseUnary(){
    if (peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const expr = parseUnary();
      return { type:'Unary', op, expr };
    }
    return parsePrimary();
  }
  function parsePrimary(){
    const t = peek();
    if (t.type === 'NUMBER') { next(); return { type:'NumberLiteral', value: t.value }; }
    if (t.type === 'STRING') { next(); return { type:'StringLiteral', value: t.value }; }
    if (t.type === 'IDENT') {
      const id = next().value;
      if (peek().type === 'LPAREN') {
        // function call
        next();
        const args = [];
        if (peek().type !== 'RPAREN') {
          while (true) {
            args.push(parseExpression());
            if (peek().type === 'COMMA') { next(); continue; }
            break;
          }
        }
        consume('RPAREN');
        return { type:'Call', name: id, args };
      }
      return { type:'Identifier', name: id };
    }
    if (t.type === 'LPAREN') {
      next(); const expr = parseExpression(); consume('RPAREN'); return expr;
    }
    throw new Error('Unexpected token in primary: ' + JSON.stringify(t));
  }


  const functions = [];
  while (peek().type !== 'EOF') {
    functions.push(parseFunction());
  }
  return { type:'Program', functions };
}

module.exports = { parseProgram };

