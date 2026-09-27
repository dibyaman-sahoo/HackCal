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
