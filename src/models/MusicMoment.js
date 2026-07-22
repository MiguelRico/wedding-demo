const text = (value) => String(value || "").trim();
const id = () => `moment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const MusicMoment = {
  create(input = {}) { const value = text(input.id || input.momentId) || id(); return { id: value, momentId: value, label: text(input.label), description: text(input.description) }; },
  normalize: (item) => MusicMoment.create(item),
  normalizeList: (items = []) => Array.isArray(items) ? items.map(MusicMoment.create) : [],
  validate: (item) => { const value = MusicMoment.create(item); return { ...(value.label ? {} : { label: "El nombre es obligatorio" }) }; },
};
