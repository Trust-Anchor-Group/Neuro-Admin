function firstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

export function normalizeDataSources(value) {
  const candidates = Array.isArray(value) ? value : value ? [value] : [];
  return candidates.map((source) => {
    if (typeof source === 'string') return { id: source, name: source };
    const id = String(firstValue(source, ['id', 'Id', 'ID', 'sourceId', 'SourceId', 'name', 'Name', 'value']) || '').trim();
    const name = String(firstValue(source, ['name', 'Name', 'label', 'Label', 'id', 'Id', 'ID', 'sourceId', 'SourceId', 'value']) || id).trim();
    return { id, name };
  }).filter((source) => source.id || source.name);
}

export function hasReportsSource(dataSources) {
  return normalizeDataSources(dataSources).some((source) => source.id === 'Reports' || source.name === 'Reports');
}

export function deriveAgentBareJid(userName, agentHomeHost) {
  const user = String(userName || '').trim();
  const host = String(agentHomeHost || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!user) return '';
  return user.includes('@') ? user.split('/')[0] : host ? `${user}@${host}` : user;
}

export function isFullJid(value) {
  const jid = String(value || '').trim();
  const at = jid.indexOf('@');
  return at > 0 && jid.indexOf('/', at + 1) > at + 1;
}

export async function resolveFullJid(helper, configuredJid) {
  // XmppHelper methods call sibling methods through `this`; retain the
  // receiver instead of extracting GetFullJid into a standalone callback.
  const resolved = await helper.GetFullJid(configuredJid, false);
  return {
    jid: String(resolved || '').trim(),
    full: isFullJid(resolved),
  };
}
