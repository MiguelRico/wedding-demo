const text = (value) => String(value || "").trim();
const createId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const MusicBlock = {
  create(input = {}) { const id = text(input.id || input.musicBlockId) || createId(); return { id, musicBlockId: id, momentId: text(input.momentId), name: text(input.name), style: text(input.style), duration: text(input.duration) }; },
  normalize: (item) => MusicBlock.create(item),
  normalizeList: (items = []) => Array.isArray(items) ? items.map(MusicBlock.create) : [],
  validate: (item) => { const value = MusicBlock.create(item); return { ...(value.name ? {} : { name: "El nombre es obligatorio" }), ...(value.style ? {} : { style: "El estilo musical es obligatorio" }), ...(value.duration ? {} : { duration: "La duración es obligatoria" }) }; },
};
