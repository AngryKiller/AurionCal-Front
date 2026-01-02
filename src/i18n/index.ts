import manifest from './manifest';

const messages = Object.fromEntries(manifest.map((l) => [l.code, l.messages] as const)) as Record<string, unknown>;

export default messages;

export { manifest };
