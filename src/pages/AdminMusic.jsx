import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Save, Trash2, ExternalLink } from "lucide-react";
import { Navigate } from "react-router-dom";

import { ADMIN_PASSWORD } from "../constants/admin";
import { MUSIC_MOMENTS } from "../constants/music";
import { isAdminSessionAuthenticated } from "../utils/adminSession";
import { createEmptyMusicSong, normalizeMusicSongs, persistMusicSongs, validateMusicSong } from "../services/musicService";
import { loadAdminDataOnce, markAdminDataSaved, setAdminMusic } from "../services/adminDataStore";
import { AdminPage, AdminTableSection, EditorDialog } from "../components/admin/common";
import IconButton from "../components/ui/IconButton";
import Spinner from "../components/ui/Spinner";

const header = { eyebrow: "Organización", title: "Escalera musical", text: "Define la banda sonora de cada momento de vuestra boda." };

export default function AdminMusic() {
  const authenticated = isAdminSessionAuthenticated();
  const [loading, setLoading] = useState(true);
  const [music, setMusic] = useState([]);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    loadAdminDataOnce({ password: ADMIN_PASSWORD }).then((snapshot) => setMusic(normalizeMusicSongs(snapshot.music))).catch(console.error).finally(() => setLoading(false));
  }, [authenticated]);
  const songsByMoment = useMemo(() => new Map(MUSIC_MOMENTS.map((moment) => [moment.id, music.filter((song) => song.momentId === moment.id)])), [music]);
  if (!authenticated) return <Navigate to="/admin" replace />;
  const apply = (next) => { const normalized = normalizeMusicSongs(next); setMusic(normalized); setAdminMusic(normalized); };
  const save = async () => { setSaving(true); try { const saved = await persistMusicSongs({ password: ADMIN_PASSWORD, music }); apply(saved); markAdminDataSaved({ music: saved }); } finally { setSaving(false); } };
  const submit = (event) => { event.preventDefault(); const nextErrors = validateMusicSong(editing); setErrors(nextErrors); if (Object.keys(nextErrors).length) return; apply([...music.filter((song) => song.id !== editing.id), editing]); setEditing(null); };

  return <AdminPage header={header}>{() => <>
    <AdminTableSection loading={loading} title="Momentos de la boda" count={`${music.length} canciones`} headerActions={<IconButton icon={<Save size={17} />} label="Guardar cambios" onClick={save} showText="always" disabled={saving}>{saving ? "Guardando" : "Guardar"}</IconButton>}>
      {loading ? <Spinner /> : <div className="grid gap-4 md:grid-cols-2">
        {MUSIC_MOMENTS.map((moment) => {
          const MomentIcon = Icons[moment.icon] || Icons.Music;
          const songs = songsByMoment.get(moment.id) || [];
          return <article key={moment.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/55 p-5 shadow-sm">
            <div className="flex items-start gap-3"><span className="rounded-full bg-[var(--color-bg-soft)] p-3 text-[var(--color-accent-dark)]"><MomentIcon size={21} /></span><div className="min-w-0"><h2 className="font-serif text-2xl text-[var(--color-accent-dark)]">{moment.label}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{moment.description}</p></div></div>
            <div className="mt-4 space-y-2">{songs.map((song) => <div key={song.id} className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/70 px-3 py-2"><button className="min-w-0 flex-1 text-left" onClick={() => { setErrors({}); setEditing(song); }} type="button"><span className="block truncate text-sm font-semibold text-[var(--color-text)]">{song.title}</span><span className="block truncate text-xs text-[var(--color-muted)]">{song.name}</span></button>{song.link && <IconButton href={song.link} target="_blank" icon={<ExternalLink size={15} />} label="Abrir enlace" tone="terciary" />}{<IconButton icon={<Trash2 size={15} />} label="Eliminar canción" tone="danger" onClick={() => apply(music.filter((item) => item.id !== song.id))} />}</div>)}</div>
            <IconButton className="mt-4" icon={<Plus size={16} />} label={`Añadir canción a ${moment.label}`} showText="always" onClick={() => { setErrors({}); setEditing(createEmptyMusicSong({ momentId: moment.id })); }}>Añadir canción</IconButton>
          </article>;
        })}
      </div>}
    </AdminTableSection>
    {editing && <EditorDialog title={editing.id && music.some((song) => song.id === editing.id) ? "Editar canción" : "Añadir canción"} titleId="music-editor" onClose={() => setEditing(null)}><form className="space-y-4" onSubmit={submit}><label className="block text-sm">Nombre / intérprete<input className="mt-1 w-full rounded-xl border p-3" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />{errors.name && <span className="text-xs text-red-500">{errors.name}</span>}</label><label className="block text-sm">Título<input className="mt-1 w-full rounded-xl border p-3" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />{errors.title && <span className="text-xs text-red-500">{errors.title}</span>}</label><label className="block text-sm">Enlace<input className="mt-1 w-full rounded-xl border p-3" placeholder="https://…" value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} />{errors.link && <span className="text-xs text-red-500">{errors.link}</span>}</label><IconButton icon={<Save size={16} />} showText="always" type="submit" label="Guardar canción">Guardar canción</IconButton></form></EditorDialog>}
  </>}</AdminPage>;
}
