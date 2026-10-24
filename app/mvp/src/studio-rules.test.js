import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudioDraft } from './studio-rules.js';

test('buildStudioDraft creates a short title and readable structured body', () => {
  const result = buildStudioDraft({
    seed: '近所の余った食材を必要な人につなぐ',
    problem: '売れ残りが廃棄される',
    audience: '近隣住民',
    solution: '受け取り予約できる一覧を作る',
    value: '廃棄と食費を減らす',
    needs: '参加店舗と受け取り場所',
    next: '2店舗に聞き取りする'
  });
  assert.equal(result.title, '近所の余った食材を必要な人につなぐ');
  assert.match(result.summary, /課題：売れ残りが廃棄される/);
  assert.match(result.summary, /対象：近隣住民/);
  assert.match(result.body, /アイデアの種\n近所の余った食材を必要な人につなぐ/);
  assert.match(result.body, /次の一歩\n2店舗に聞き取りする/);
});

test('buildStudioDraft falls back to the seed for an empty summary and limits title length', () => {
  const seed = 'あ'.repeat(60);
  const result = buildStudioDraft({ seed });
  assert.equal(result.title.length, 48);
  assert.equal(result.summary, seed.slice(0, 500));
  assert.match(result.body, /解決したい課題\n未記入/);
});

test('buildStudioDraft trims fields and caps summary and body lengths', () => {
  const result = buildStudioDraft({
    seed: '  idea  ',
    problem: ' x '.repeat(300),
    audience: ' y '.repeat(300),
    solution: ' z '.repeat(300),
    value: ' v '.repeat(8000),
    needs: ' n '.repeat(8000),
    next: ' next '
  });
  assert.equal(result.title, 'idea');
  assert.ok(result.summary.length <= 500);
  assert.ok(result.body.length <= 20000);
});
