import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIdeaInput } from '../src/idea-rules.js';

const valid = {
  title: '地域のアイデア',
  summary: '余った食材を必要な人につなぐ。',
  body: '',
  category: '地域',
  visibility: 'community'
};

test('accepts a valid idea', () => {
  assert.equal(validateIdeaInput(valid), null);
});

test('requires title and summary', () => {
  assert.match(validateIdeaInput({ ...valid, title: '  ' }), /タイトルと概要/);
  assert.match(validateIdeaInput({ ...valid, summary: '' }), /タイトルと概要/);
});

test('enforces title, summary and body length limits', () => {
  assert.match(validateIdeaInput({ ...valid, title: 'a'.repeat(121) }), /120文字/);
  assert.match(validateIdeaInput({ ...valid, summary: 'a'.repeat(501) }), /500文字/);
  assert.match(validateIdeaInput({ ...valid, body: 'a'.repeat(20001) }), /20,000文字/);
});

test('rejects unknown categories and visibility values', () => {
  assert.match(validateIdeaInput({ ...valid, category: 'not-a-category' }), /カテゴリ/);
  assert.match(validateIdeaInput({ ...valid, visibility: 'public-to-everyone' }), /公開範囲/);
});

test('trims values before validating required fields', () => {
  assert.equal(validateIdeaInput({ ...valid, title: '  title  ', summary: ' summary ' }), null);
});
