const text = (value) => String(value || "").trim();
const createId = () => `music-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const MusicSong = {
  create(overrides = {}) {
    const id = text(overrides.id || overrides.musicSongId) || createId();
    return { id, musicSongId: id, momentId: text(overrides.momentId), name: text(overrides.name), title: text(overrides.title), link: text(overrides.link) };
  },
  normalize(song = {}) { return MusicSong.create(song); },
  normalizeList(songs = []) { return Array.isArray(songs) ? songs.map(MusicSong.normalize).sort((a, b) => a.momentId.localeCompare(b.momentId) || a.title.localeCompare(b.title)) : []; },
  validate(song = {}) {
    const value = MusicSong.normalize(song); const errors = {};
    if (!value.momentId) errors.momentId = "El momento es obligatorio";
    if (!value.name) errors.name = "El nombre es obligatorio";
    if (!value.title) errors.title = "El título es obligatorio";
    if (value.link && !/^https?:\/\//i.test(value.link)) errors.link = "Introduce un enlace válido";
    return errors;
  },
};
