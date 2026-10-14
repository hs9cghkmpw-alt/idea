// 任意の補助テスト: jsdom による DOM 動作シミュレーション（実ブラウザではない）。
// リポジトリに依存関係は追加しない。実行例:
//   mkdir /tmp/pon-dom && cd /tmp/pon-dom && npm init -y && npm i jsdom
//   NODE_PATH=/tmp/pon-dom/node_modules node <repo>/tests/prototype-dom.test.cjs <repo>
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(process.argv[2]||'.','prototype/index.html'),'utf8');
let net = [];
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/prototype/index.html',
  beforeParse(w){
    w.fetch = (...a)=>{net.push(['fetch',a[0]]); return Promise.reject(new Error('blocked'));};
    const X = w.XMLHttpRequest; w.XMLHttpRequest = function(){ net.push(['xhr']); return new X(); };
    w.navigator.sendBeacon = (...a)=>{net.push(['beacon']); return false;};
    w.HTMLElement.prototype.scrollIntoView = function(){};
    w.__clip = null;
    Object.defineProperty(w.navigator,'clipboard',{value:{writeText: async t=>{w.__clip=t;}}, configurable:true});
    Object.defineProperty(w,'isSecureContext',{value:true});
  }});
const w = dom.window, d = w.document, $ = id=>d.getElementById(id);
const click = el => el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
let pass=0, fail=0;
const t=(n,c,extra='')=>{ (c?pass++:fail++); console.log((c?'PASS':'FAIL')+'  '+n+(extra?'  '+extra:'')); };

// 1 empty
click($('organize'));
t('1 empty input -> error shown', $('input-error').textContent.length>0 && $('result').hidden===true);
$('idea').value='   \n  ';
click($('organize'));
t('1b whitespace-only -> error, no result', $('input-error').textContent.length>0 && $('result').hidden===true);
// 2 examples
const ex=[...d.querySelectorAll('[data-example]')];
click(ex[0]);
t('2 example fills input, not submitted', $('idea').value===ex[0].dataset.example && $('result').hidden===true && ex.every(b=>b.type==='button'));
// 3 organize
click($('organize'));
t('3 organize shows result', $('result').hidden===false && $('summary').value===ex[0].dataset.example);
t('3b problem/audience/solution left empty (template only fills 3 of 6)', $('problem').value===''&&$('audience').value===''&&$('solution').value==='');
// 4 edit
$('problem').value='EDITED-PROBLEM';
t('4 fields editable', $('problem').value==='EDITED-PROBLEM' && !$('problem').readOnly && !$('problem').disabled);
// re-organize guard
let asked=0, answer=false; w.confirm=()=>{asked++; return answer;};
click($('organize'));
t('4b edited result + re-organize asks confirmation; cancel keeps edits', asked===1 && $('problem').value==='EDITED-PROBLEM');
answer=true; click($('organize'));
t('4c confirm OK -> template regenerated', asked===2 && $('problem').value==='');
asked=0; click($('organize'));
t('4d unedited result + re-organize does not nag', asked===0);
$('problem').value='EDITED-PROBLEM';
// 5 copy
(async()=>{
  click($('copy')); await new Promise(r=>setTimeout(r,20));
  t('5 copy uses edited content', w.__clip && w.__clip.includes('EDITED-PROBLEM') && $('copy-status').textContent.includes('コピー'));
  // 5b clipboard failure path
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText: async()=>{throw new Error('denied')}}, configurable:true});
  d.execCommand = ()=>false;
  click($('copy')); await new Promise(r=>setTimeout(r,20));
  t('5b clipboard failure -> visible message', $('copy-status').textContent.includes('自動コピーできませんでした'));
  t('5c fallback textarea removed', d.querySelectorAll('textarea[aria-label="コピー用の整理メモ"]').length===0);
  // XSS
  answer=true;
  $('idea').value='<img src=x onerror="window.__xss=1"><script>window.__xss=2<\/script>';
  click($('organize')); await new Promise(r=>setTimeout(r,20));
  t('9 XSS payload not executed / no injected elements', !w.__xss && d.querySelectorAll('#result img, #result script').length===0 && $('summary').value.includes('<img'));
  // 6 restart
  click($('restart'));
  t('6 restart clears input+result', $('idea').value===''&&$('result').hidden===true&&['summary','problem','audience','solution','known','unknown'].every(i=>$(i).value===''));
  // clear button
  $('idea').value='x'; click($('clear')); t('6b clear button clears input', $('idea').value==='');
  // 8 network
  t('8 no network calls during session', net.length===0, JSON.stringify(net));
  // 7 persistence APIs
  t('7 no persistence writes (storage empty)', w.localStorage.length===0 && w.sessionStorage.length===0 && d.cookie==='');
  // a11y structural
  const labelled = [...d.querySelectorAll('textarea')].every(x=>d.querySelector(`label[for="${x.id}"]`));
  t('10 every textarea has a label', labelled);
  const err=$('input-error');
  t('10b error region: role=alert without conflicting aria-live', err.getAttribute('role')==='alert' && !err.hasAttribute('aria-live'));
  const exg=d.querySelector('.examples');
  t('10c examples group has role (aria-label on bare div is ignored)', exg.getAttribute('role')!==null, 'role='+exg.getAttribute('role'));
  t('10d textareas have autocomplete=off (blocks browser form restore on reload)', [...d.querySelectorAll('textarea')].every(x=>x.getAttribute('autocomplete')==='off'));
  console.log(`\n${pass} passed, ${fail} failed`);
})();
