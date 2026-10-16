export function buildStudioDraft(input) {
  const clean = (value) => String(value ?? '').trim();
  const seed = clean(input.seed);
  const titleSeed = seed.replace(/\s+/g, ' ').trim();
  const title = titleSeed.length > 48 ? titleSeed.slice(0, 47) + '…' : titleSeed;
  const problem = clean(input.problem);
  const audience = clean(input.audience);
  const solution = clean(input.solution);
  const value = clean(input.value);
  const needs = clean(input.needs);
  const next = clean(input.next);
  const summaryParts = [];
  if (problem) summaryParts.push('課題：' + problem);
  if (audience) summaryParts.push('対象：' + audience);
  if (solution) summaryParts.push('解決案：' + solution);
  const summary = (summaryParts.length ? summaryParts.join('\n') : seed).slice(0, 500);
  const section = (label, text) => label + '\n' + (text || '未記入');
  const body = [
    section('アイデアの種', seed),
    section('解決したい課題', problem),
    section('届けたい相手', audience),
    section('解決の仕組み', solution),
    section('生まれる価値・変化', value),
    section('必要な協力・資源', needs),
    section('次の一歩', next)
  ].join('\n\n').slice(0, 20000);
  return { title, summary, body };
}
