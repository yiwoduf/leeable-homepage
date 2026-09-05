import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const { outputFiles } = await build({
  stdin: {
    contents: `
      export { parseAssistantContent } from './src/components/chat/linkCards';
      export { ChatMessage } from './src/components/chat/ChatMessage';
      export { LanguageProvider } from './src/i18n';
      export { MEETING_URL } from './src/config/meeting';
    `,
    resolveDir: process.cwd(),
    loader: 'tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  write: false,
});
const require = createRequire(import.meta.url);
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(require, compiled, compiled.exports);
const { parseAssistantContent, ChatMessage, LanguageProvider, MEETING_URL } = compiled.exports;
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const openMeeting = () => {};

for (const key of ['email', 'github', 'linkedin', 'resume', 'meeting']) {
  const token = `[[card:${key}]]`;
  for (let i = 1; i < token.length; i++) {
    assert.deepEqual(parseAssistantContent(`Hello ${token.slice(0, i)}`, openMeeting), ['Hello ']);
  }
  const [card] = parseAssistantContent(token, openMeeting);
  assert.equal(card.props.cardKey, key);
  assert.equal(card.props.onOpenMeeting, openMeeting);
}
assert.deepEqual(parseAssistantContent('[[card:unknown]]', openMeeting), ['[[card:unknown]]']);
assert.deepEqual(parseAssistantContent('Hello [world]', openMeeting), ['Hello [world]']);
assert.equal(parseAssistantContent('[[card:meeting]] then [[card:resume]]', openMeeting).length, 3);
assert.equal(new URL(MEETING_URL).origin, 'https://calendly.com');
assert.equal(new URL(MEETING_URL).pathname.split('/').filter(Boolean).length, 2);

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
try {
  for (const [lang, label] of [['en', 'Schedule a meeting'], ['ko', '미팅 예약하기']]) {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => lang } });
    const render = (role) => renderToStaticMarkup(createElement(LanguageProvider, null,
      createElement(ChatMessage, {
        message: { id: 'test', role, content: '[[card:meeting]]' },
        isStreaming: false,
        onOpenMeeting: openMeeting,
      }),
    ));
    assert.match(render('assistant'), /<button[^>]*aria-haspopup="dialog"/);
    assert.ok(render('assistant').includes(label));
    assert.ok(!render('assistant').includes('[[card:meeting]]'));
    assert.ok(render('user').includes('[[card:meeting]]'));
    assert.ok(!render('user').includes('<button'));
  }
} finally {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}
console.log('Meeting cards: stream boundaries, callback routing, EN/KO rendering and user-text isolation passed.');
