import { createClient } from '@supabase/supabase-js';
import './style.css';
import { validateIdeaInput } from './idea-rules.js';
import { buildStudioDraft } from './studio-rules.js';

const config = {
  url: import.meta.env.VITE_SUPABASE_URL?.trim(),
  key: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
};
const configured = Boolean(config.url && config.key && !config.url.includes('YOUR_PROJECT_REF') && !config.key.includes('YOUR_SUPABASE'));
const supabase = configured ? createClient(config.url, config.key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const $ = (id) => document.getElementById(id);
const authView = $('auth-view');
const appView = $('app-view');
const setupWarning = $('setup-warning');
const authForm = $('auth-form');
const authMessage = $('auth-message');
const ideaForm = $('idea-form');
const ideaMessage = $('idea-message');
const feedMessage = $('feed-message');
const ideaFeed = $('idea-feed');
let authMode = 'login';
let currentUser = null;
let ideas = [];
let busy = false;
let recoveryMode = false;

function message(element, text = '', type = '') {
  element.textContent = text;
  element.className = 'form-message' + (type ? ' ' + type : '');
}
function setBusy(value) {
  busy = value;
  document.querySelectorAll('button').forEach((button) => {
    if (button.id !== 'tab-login' && button.id !== 'tab-signup') button.disabled = value;
  });
}
function setAuthMode(mode) {
  authMode = mode;
  $('tab-login').classList.toggle('active', mode === 'login');
  $('tab-signup').classList.toggle('active', mode === 'signup');
  $('tab-login').setAttribute('aria-selected', String(mode === 'login'));
  $('tab-signup').setAttribute('aria-selected', String(mode === 'signup'));
  $('auth-submit').textContent = mode === 'login' ? 'ログイン' : 'アカウントを作成';
  $('auth-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('forgot-password').hidden = mode !== 'login';
  message(authMessage);
}
function showApp(user) {
  currentUser = user ?? null;
  authView.hidden = Boolean(user);
  appView.hidden = !user;
  $('recovery-view').hidden = true;
  $('sign-out').hidden = !user;
  $('session-label').textContent = user ? user.email : '未ログイン';
  if (!user) {
    ideas = [];
    ideaFeed.replaceChildren();
    $('idea-detail').hidden = true;
    $('detail-title').textContent = '';
    $('detail-summary').textContent = '';
    $('detail-body').textContent = '';
    closeEditor();
  }
}
function showRecovery(user = null) {
  recoveryMode = true;
  if (user) currentUser = user;
  authView.hidden = true;
  appView.hidden = true;
  $('recovery-view').hidden = false;
  $('sign-out').hidden = true;
  $('session-label').textContent = 'パスワード再設定';
  message($('recovery-message'));
  $('new-password').focus();
}
function safeText(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text ?? '';
  return node;
}
function renderIdeas() {
  const query = $('search-input').value.trim().toLocaleLowerCase();
  const filter = $('feed-filter').value;
  const visible = ideas.filter((idea) => {
    const isMine = idea.user_id === currentUser?.id;
    if (filter === 'community' && !(idea.status === 'published' && idea.visibility === 'community')) return false;
    if (filter === 'mine' && !isMine) return false;
    return !query || [idea.title, idea.summary, idea.category].some((v) => String(v ?? '').toLocaleLowerCase().includes(query));
  });
  $('idea-count').textContent = visible.length + ' 件';
  ideaFeed.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.append(safeText('strong', '', query ? '一致するアイデアがありません' : 'まだアイデアがありません'));
    empty.append(safeText('span', '', query ? '検索語を変えてみてください。' : '最初のアイデアを投稿してみましょう。'));
    ideaFeed.append(empty);
    return;
  }
  for (const idea of visible) {
    const card = document.createElement('article');
    card.className = 'idea-card';
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.append(safeText('span', 'tag', idea.category || 'その他'));
    const status = idea.status === 'draft' ? '下書き' : (idea.visibility === 'private' ? '非公開' : '公開中');
    meta.append(safeText('span', idea.visibility === 'private' ? 'tag private' : 'tag', status));
    const title = safeText('h3', '', idea.title);
    const summary = safeText('p', 'summary', idea.summary);
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const date = new Date(idea.updated_at || idea.created_at);
    footer.append(safeText('span', '', Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ja-JP')));
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const view = safeText('button', 'small-button', '詳細を見る');
    view.type = 'button';
    view.addEventListener('click', () => openDetail(idea));
    actions.append(view);
    if (idea.user_id === currentUser.id) {
      const edit = safeText('button', 'small-button', '編集');
      edit.type = 'button';
      edit.addEventListener('click', () => openEditor(idea));
      actions.append(edit);
      const remove = safeText('button', 'small-button danger', '削除');
      remove.type = 'button';
      remove.addEventListener('click', () => deleteIdea(idea));
      actions.append(remove);
    }
    footer.append(actions);
    card.append(meta, title, summary, footer);
    ideaFeed.append(card);
  }
}
async function loadIdeas() {
  if (!supabase || !currentUser) return;
  message(feedMessage, '読み込み中…');
  const { data, error } = await supabase.from('ideas')
    .select('id,user_id,title,summary,body,category,visibility,status,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) {
    message(feedMessage, '読み込みに失敗しました。DB マイグレーションと RLS 設定を確認してください。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
    return;
  }
  ideas = data ?? [];
  message(feedMessage);
  renderIdeas();
}
function openDetail(idea) {
  $('detail-title').textContent = idea.title;
  $('detail-meta').replaceChildren(
    safeText('span', 'tag', idea.category || 'その他'),
    safeText('span', idea.visibility === 'private' ? 'tag private' : 'tag', idea.visibility === 'private' ? '非公開' : '公開アイデア')
  );
  $('detail-summary').textContent = idea.summary;
  $('detail-body').textContent = idea.body || '詳細はまだありません。';
  $('idea-detail').hidden = false;
  $('idea-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function openEditor(idea = null) {
  $('editor-panel').hidden = false;
  $('editor-title').textContent = idea ? 'アイデアを編集' : 'アイデアを書く';
  $('idea-id').value = idea?.id ?? '';
  $('idea-title').value = idea?.title ?? '';
  $('idea-category').value = idea?.category ?? '暮らし';
  $('idea-visibility').value = idea?.visibility ?? 'community';
  $('idea-summary').value = idea?.summary ?? '';
  $('idea-body').value = idea?.body ?? '';
  $('publish-idea').textContent = idea?.status === 'published' ? '更新する' : '公開する';
  message(ideaMessage);
  $('editor-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('idea-title').focus({ preventScroll: true });
}
function closeEditor() {
  $('editor-panel').hidden = true;
  ideaForm.reset();
  $('idea-id').value = '';
  message(ideaMessage);
}
async function saveIdea(status) {
  if (!supabase || !currentUser || busy) return;
  const title = $('idea-title').value.trim();
  const summary = $('idea-summary').value.trim();
  const body = $('idea-body').value.trim();
  const validationError = validateIdeaInput({
    title, summary, body,
    category: $('idea-category').value,
    visibility: $('idea-visibility').value
  });
  if (validationError) {
    message(ideaMessage, validationError, 'error');
    return;
  }
  const id = $('idea-id').value;
  const record = {
    title,
    summary,
    body,
    category: $('idea-category').value,
    visibility: $('idea-visibility').value,
    status,
    user_id: currentUser.id
  };
  setBusy(true);
  message(ideaMessage, '保存中…');
  try {
    const result = id
      ? await supabase.from('ideas').update(record).eq('id', id).select('id').maybeSingle()
      : await supabase.from('ideas').insert(record).select('id').single();
    if (result.error) throw result.error;
    if (!result.data) throw new Error('権限がないか、対象のアイデアが存在しません。');
    closeEditor();
    await loadIdeas();
    message(feedMessage, status === 'published' ? 'アイデアを保存しました。' : '下書きを保存しました。', 'success');
  } catch (error) {
    message(ideaMessage, '保存できませんでした。入力内容と DB の設定を確認してください。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
}
async function deleteIdea(idea) {
  if (!supabase || !currentUser || busy) return;
  if (!window.confirm('「' + idea.title + '」を削除しますか？ この操作は取り消せません。')) return;
  setBusy(true);
  try {
    const { data, error } = await supabase.from('ideas').delete().eq('id', idea.id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('削除権限がないか、対象のアイデアが存在しません。');
    $('idea-detail').hidden = true;
    message(feedMessage, 'アイデアを削除しました。', 'success');
    await loadIdeas();
  } catch (error) {
    message(feedMessage, '削除できませんでした。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
}
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase || busy) return;
  const email = $('auth-email').value.trim();
  const password = $('auth-password').value;
  setBusy(true);
  message(authMessage, authMode === 'login' ? 'ログイン中…' : '登録中…');
  try {
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) throw result.error;
    if (authMode === 'signup' && !result.data.session) {
      message(authMessage, '確認メールを送信しました。メール内のリンクで確認してからログインしてください。', 'success');
    } else {
      message(authMessage, '認証しました。');
    }
  } catch (error) {
    message(authMessage, '認証に失敗しました。入力内容を確認してください。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
});
$('forgot-password').addEventListener('click', async () => {
  if (!supabase || busy) return;
  const email = $('auth-email').value.trim();
  if (!email || !$('auth-email').checkValidity()) {
    message(authMessage, '先に有効なメールアドレスを入力してください。', 'error');
    $('auth-email').focus();
    return;
  }
  setBusy(true);
  message(authMessage, '再設定メールを送信しています…');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;
    message(authMessage, '再設定メールを送信しました。受信箱を確認してください。登録の有無にかかわらず、案内が表示されます。', 'success');
  } catch (error) {
    message(authMessage, '再設定メールを送信できませんでした。時間をおいて再試行してください。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
});
$('recovery-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase || busy) return;
  const password = $('new-password').value;
  const confirmation = $('confirm-password').value;
  if (password.length < 8 || password.length > 128) {
    message($('recovery-message'), 'パスワードは8〜128文字で入力してください。', 'error');
    return;
  }
  if (password !== confirmation) {
    message($('recovery-message'), '確認用パスワードが一致しません。', 'error');
    return;
  }
  setBusy(true);
  message($('recovery-message'), 'パスワードを更新しています…');
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    recoveryMode = false;
    showApp(data.user);
    message(feedMessage, 'パスワードを更新しました。', 'success');
    await loadIdeas();
  } catch (error) {
    message($('recovery-message'), 'パスワードを更新できませんでした。メールのリンクが期限切れの場合は、再設定メールをもう一度送信してください。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
});
$('tab-login').addEventListener('click', () => setAuthMode('login'));
$('tab-signup').addEventListener('click', () => setAuthMode('signup'));
$('sign-out').addEventListener('click', async () => {
  if (!supabase || busy) return;
  setBusy(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showApp(null);
  } catch (error) {
    message(feedMessage, 'ログアウトに失敗しました。' + (import.meta.env.DEV ? ' (' + error.message + ')' : ''), 'error');
  } finally {
    setBusy(false);
  }
});
$('new-idea').addEventListener('click', () => openEditor());
$('close-detail').addEventListener('click', () => { $('idea-detail').hidden = true; });
$('cancel-edit').addEventListener('click', closeEditor);
$('idea-form').addEventListener('submit', (event) => { event.preventDefault(); saveIdea('published'); });
$('save-draft').addEventListener('click', () => saveIdea('draft'));
$('search-input').addEventListener('input', renderIdeas);
$('feed-filter').addEventListener('change', renderIdeas);
$('refresh-feed').addEventListener('click', loadIdeas);

function studioValue(id) {
  return $(id).value.trim();
}
function resetStudio() {
  $('studio-form').reset();
  message($('studio-message'));
}
$('toggle-studio').addEventListener('click', () => {
  $('studio-panel').hidden = false;
  $('studio-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('studio-seed').focus({ preventScroll: true });
});
$('close-studio').addEventListener('click', () => { $('studio-panel').hidden = true; });
$('studio-reset').addEventListener('click', () => {
  if (window.confirm('Free Studio の入力内容をすべて消去しますか？')) resetStudio();
});
$('studio-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const seed = studioValue('studio-seed');
  if (!seed) {
    message($('studio-message'), 'アイデアの種を入力してください。', 'error');
    $('studio-seed').focus();
    return;
  }
  const draft = buildStudioDraft({
    seed,
    problem: studioValue('studio-problem'),
    audience: studioValue('studio-audience'),
    solution: studioValue('studio-solution'),
    value: studioValue('studio-value'),
    needs: studioValue('studio-needs'),
    next: studioValue('studio-next')
  });
  $('idea-id').value = '';
  $('idea-title').value = draft.title;
  $('idea-category').value = 'その他';
  $('idea-visibility').value = 'community';
  $('idea-summary').value = draft.summary;
  $('idea-body').value = draft.body;
  $('editor-title').textContent = 'Free Studio から投稿';
  $('publish-idea').textContent = '公開する';
  $('editor-panel').hidden = false;
  $('studio-panel').hidden = true;
  message($('studio-message'), '整理しました。公開範囲と内容を確認してから投稿してください。', 'success');
  $('editor-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('idea-title').focus({ preventScroll: true });
});

if (!configured) {
  setupWarning.hidden = false;
  authForm.querySelectorAll('input,button').forEach((el) => { el.disabled = true; });
} else {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      showRecovery(session?.user ?? null);
      return;
    }
    if (recoveryMode && event !== 'USER_UPDATED') {
      showRecovery(session?.user ?? null);
      return;
    }
    if (event === 'USER_UPDATED') recoveryMode = false;
    showApp(session?.user ?? null);
    if (session?.user) queueMicrotask(() => loadIdeas());
  });
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) message(authMessage, 'セッションを確認できませんでした。再読み込みしてください。', 'error');
    showApp(data?.session?.user ?? null);
    if (data?.session?.user) loadIdeas();
  });
}
