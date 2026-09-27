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
