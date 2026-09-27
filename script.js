/* ================= UI keys ================= */
const keys = [
  ['(','fn'],[')','fn'],['\u03c0','fn'],['e','fn'],
  ['sin','fn'],['cos','fn'],['tan','fn'],['\u221a','fn'],
  ['log','fn'],['ln','fn'],['^','fn'],['%','fn'],
  ['AC','ac'],['\u232b','ac'],['\u00f7','op'],['\u00d7','op'],
  ['7',''],['8',''],['9',''],['\u2212','op'],
  ['4',''],['5',''],['6',''],['+','op'],
  ['1',''],['2',''],['3',''],['=','eq'],
  ['0','wide'],['.',''],
];
const pad = document.getElementById('pad');
keys.forEach(([label, cls]) => {
  const b = document.createElement('button');
  b.textContent = label;
  if(cls) b.classList.add(cls);
  b.addEventListener('click', () => handleKey(label));
  pad.appendChild(b);
});
let expr = '';
function handleKey(label){
  if(label === 'AC'){ expr=''; render(); return; }
  if(label === '\u232b'){ expr = expr.slice(0,-1); render(); return; }
  if(label === '='){ evaluate(); return; }
  const map = {
    '\u00f7':'/', '\u00d7':'*', '\u2212':'-', '\u03c0':'pi', '\u221a':'sqrt(',
    'sin':'sin(', 'cos':'cos(', 'tan':'tan(', 'log':'log(', 'ln':'ln(',
  };
  expr += map[label] !== undefined ? map[label] : label;
  render();
}
function render(){
  document.getElementById('exprLine').innerHTML = expr ? escapeHtml(expr) : '&nbsp;';
  document.getElementById('resultLine').innerHTML = (expr ? escapeHtml(expr) : '0') + '<span class="cursor"></span>';
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if(/[0-9.+\-*/^()%]/.test(k)){ expr += k; render(); }
  else if(k === 'Enter'){ evaluate(); }
  else if(k === 'Backspace'){ expr = expr.slice(0,-1); render(); }
  else if(k === 'Escape'){ expr=''; render(); }
});
/* ================= tokenizer / parser / evaluator with trace ================= */
function tokenize(str){
  const tokens = [];
  const re = /\d+\.?\d*|\.\d+|sin|cos|tan|sqrt|log|ln|pi|[+\-*/^()%]/g;
  let m;
  while((m = re.exec(str)) !== null) tokens.push(m[0]);
  return tokens;
}
function parseExpr(tokens){
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseAdd(){
    let node = parseMul();
    while(peek() === '+' || peek() === '-'){
      const op = next();
      node = { kind:'bin', op, a: node, b: parseMul() };
    }
    return node;
  }
  function parseMul(){
    let node = parsePow();
    while(peek() === '*' || peek() === '/'){
      const op = next();
      node = { kind:'bin', op, a: node, b: parsePow() };
    }
    return node;
  }
  function parsePow(){
    let node = parsePostfix();
    if(peek() === '^'){
      next();
      const rhs = parsePow(); // right-assoc
      node = { kind:'bin', op:'^', a: node, b: rhs };
    }
    return node;
  }
  function parsePostfix(){
    let node = parseUnary();
    while(peek() === '%'){
      next();
      node = { kind:'un', op:'%', a: node };
    }
    return node;
  }
  function parseUnary(){
    if(peek() === '-'){ next(); return { kind:'un', op:'neg', a: parseUnary() }; }
    return parsePrimary();
  }
  function parsePrimary(){
    const t = peek();
    if(t === undefined) throw new Error('unexpected end of expression');
    if(/^\d/.test(t) || t.startsWith('.')){ next(); return { kind:'num', value: parseFloat(t) }; }
    if(t === 'pi'){ next(); return { kind:'num', value: Math.PI }; }
    if(['sin','cos','tan','sqrt','log','ln'].includes(t)){
      next();
      if(peek() !== '(') throw new Error(t + ' expects (');
      next();
      const arg = parseAdd();
      if(peek() !== ')') throw new Error('missing )');
      next();
      return { kind:'un', op:t, a: arg };
    }
    if(t === '('){
      next();
      const inner = parseAdd();
      if(peek() !== ')') throw new Error('missing )');
      next();
      return inner;
    }
    throw new Error('unexpected token "' + t + '"');
  }

  const tree = parseAdd();
  if(pos !== tokens.length) throw new Error('unexpected token "' + tokens[pos] + '"');
  return tree;
}
let trace = [];
function evalNode(node){
  if(node.kind === 'num') return node.value;
  if(node.kind === 'bin'){
    const a = evalNode(node.a);
    const b = evalNode(node.b);
    let result;
    switch(node.op){
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if(b === 0) throw new Error('division by zero');
        result = a / b; break;
      case '^': result = Math.pow(a, b); break;
    }
    trace.push({ type:'bin', op:node.op, a, b, result });
    return result;
  }
  if(node.kind === 'un'){
    const a = evalNode(node.a);
    let result;
    switch(node.op){
      case 'neg': result = -a; break;
      case '%': result = a / 100; break;
      case 'sin': result = Math.sin(a * Math.PI/180); break;
      case 'cos': result = Math.cos(a * Math.PI/180); break;
      case 'tan': result = Math.tan(a * Math.PI/180); break;
      case 'sqrt':
        if(a < 0) throw new Error('sqrt of negative');
        result = Math.sqrt(a); break;
      case 'log':
        if(a <= 0) throw new Error('log of non-positive');
        result = Math.log10(a); break;
      case 'ln':
        if(a <= 0) throw new Error('ln of non-positive');
        result = Math.log(a); break;
    }
    trace.push({ type:'un', op:node.op, a, result });
    return result;
  }
}
/* ================= binary representation ================= */
function toBinary(num, fracBits){
  fracBits = fracBits || 14;
  if(!isFinite(num)) return 'NaN';
  const neg = num < 0;
  num = Math.abs(num);
  let intPart = Math.floor(num);
  let fracPart = num - intPart;
  let intBin = intPart === 0 ? '0' : intPart.toString(2);
  let truncatedInt = false;
  if(intBin.length > 40){ intBin = intBin.slice(0,40); truncatedInt = true; }
  let fracBin = '';
  for(let i=0; i<fracBits && fracPart > 0; i++){
    fracPart *= 2;
    if(fracPart >= 1){ fracBin += '1'; fracPart -= 1; } else fracBin += '0';
  }
  let out = (neg ? '-' : '') + intBin + (truncatedInt ? '\u2026' : '') + (fracBin ? '.' + fracBin : '');
  return out;
}
function colorBits(s){
  return s.split('').map(ch => {
    if(ch === '1') return '<span class="b1">1<\/span>';
    if(ch === '0') return '<span class="b0">0<\/span>';
    return ch;
  }).join('');
}
