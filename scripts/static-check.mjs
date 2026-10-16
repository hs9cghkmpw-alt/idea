#!/usr/bin/env node
// PON 静的チェック（依存パッケージなし / Node 18+ 標準機能のみ）
// 使い方: node scripts/static-check.mjs
// これはソースの文字列検査です。実ブラウザでの動作確認の代わりにはなりません。
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', 'prototype/index.html'];
let failed = 0;
const report = (ok, msg) => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

for (const f of files) {
  const src = readFileSync(resolve(root, f), 'utf8');
  console.log(`\n== ${f}`);

  const forbidden = [
    ['fetch(', /fetch\s*\(/], ['XMLHttpRequest', /XMLHttpRequest/], ['sendBeacon', /sendBeacon/],
    ['WebSocket', /WebSocket/], ['EventSource', /EventSource/],
    ['localStorage', /localStorage/], ['sessionStorage', /sessionStorage/], ['indexedDB', /indexedDB/],
    ['document.cookie', /document\.cookie/],
    ['innerHTML/outerHTML/insertAdjacentHTML', /innerHTML|outerHTML|insertAdjacentHTML/],
    ['document.write', /document\.write/], ['eval/new Function', /\beval\s*\(|new Function/],
  ];
  for (const [name, re] of forbidden) report(!re.test(src), `使用していない: ${name}`);

  report(!/<script[^>]+\ssrc=/i.test(src), '外部スクリプト(<script src>)なし');
  report(!/<link\b/i.test(src), '<link>（外部CSS/フォント/preconnect）なし');
  report(!/<(img|iframe|embed|object|video|audio|source)\b/i.test(src), '外部リソースを読み込むタグなし');
  report(!/@import|url\(\s*['"]?(https?:)?\/\//i.test(src), 'CSSからの外部読み込みなし');

  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  report(dup.length === 0, `ID重複なし${dup.length ? ': ' + dup.join(',') : ''}`);

  const refs = [...src.matchAll(/(?:\sfor|\saria-labelledby|\shref)="#?([^"]+)"/g)]
    .map((m) => m[1]).filter((v) => v !== "#" && !/[/.:]/.test(v) && v.length > 0);
  const missing = refs.filter((r) => !ids.includes(r));
  report(missing.length === 0, `ページ内参照(for/aria-labelledby/#href)の宛先あり${missing.length ? ': ' + missing.join(',') : ''}`);

  report(/<html[^>]+lang="ja"/.test(src), 'html lang="ja"');
  report(/<meta[^>]+name="viewport"/.test(src), 'viewport meta あり');
}

const proto = readFileSync(resolve(root, 'prototype/index.html'), 'utf8');
console.log('\n== prototype/index.html 固有');
const tas = [...proto.matchAll(/<textarea\b[^>]*>/g)].map((m) => m[0]);
report(tas.length > 0 && tas.every((t) => /autocomplete="off"/.test(t)), 'すべての<textarea>が autocomplete="off"（ブラウザの入力復元を抑止）');
report(tas.every((t) => { const id = /id="([^"]+)"/.exec(t)?.[1]; return id && new RegExp(`<label[^>]+for="${id}"`).test(proto); }), 'すべての<textarea>に<label for>がある');
report(!/role="alert"[^>]*aria-live|aria-live[^>]*role="alert"/.test(proto), 'role="alert" と aria-live の競合なし');
report(/class="examples"[^>]*role="group"/.test(proto), '入力例ボタン群に role="group"');
report(/<button[^>]*data-example/.test(proto) && !/<button(?![^>]*type=)[^>]*>/.test(proto), 'すべての<button>に type 指定（意図しない送信を防止）');
report(!/<form\b/i.test(proto), '<form>なし（送信先がない）');
report(/試作|プロトタイプ/.test(proto) && /AI/.test(proto) && /送信・保存されず/.test(proto), '試作・非AI・非送信/非保存の明示文言あり');
const lp = readFileSync(resolve(root, 'index.html'), 'utf8');
console.log('\n== index.html 固有');
report(/prototype\/index\.html/.test(lp), 'LPからローカル試作へのリンクあり');
report(/開発初期|EARLY DEVELOPMENT/.test(lp) && /まだ利用できません/.test(lp), 'LPに開発初期・未提供の明示あり');
report(/<script\b/i.test(lp) === false, 'LPにスクリプトなし');

console.log(`\n${failed === 0 ? '全項目 PASS' : failed + ' 件 FAIL'}`);
process.exit(failed === 0 ? 0 : 1);
