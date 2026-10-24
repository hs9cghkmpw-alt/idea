const CATEGORIES = new Set(['暮らし', '仕事', '地域', 'テクノロジー', '教育', '環境', 'その他']);
const VISIBILITIES = new Set(['community', 'private']);

export function validateIdeaInput(input) {
  const title = String(input.title ?? '').trim();
  const summary = String(input.summary ?? '').trim();
  const body = String(input.body ?? '').trim();
  const category = String(input.category ?? '');
  const visibility = String(input.visibility ?? '');

  if (!title || !summary) return 'タイトルと概要を入力してください。';
  if (title.length > 120) return 'タイトルは120文字以内で入力してください。';
  if (summary.length > 500) return '概要は500文字以内で入力してください。';
  if (body.length > 20000) return '詳細は20,000文字以内で入力してください。';
  if (!CATEGORIES.has(category)) return 'カテゴリの値が不正です。';
  if (!VISIBILITIES.has(visibility)) return '公開範囲の値が不正です。';
  return null;
}
