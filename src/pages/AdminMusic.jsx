import { useEffect, useMemo, useState } from "react";
import { Music2, Music4, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { ADMIN_PASSWORD } from "../constants/admin";
import { adminContent } from "../constants/adminContent";
import { tableContent } from "../constants/tableContent";
import { isAdminSessionAuthenticated } from "../utils/adminSession";
import {
  createEmptyMusicBlock,
  createEmptyMusicMoment,
  createEmptyMusicSong,
  normalizeMusicBlocks,
  normalizeMusicMoments,
  normalizeMusicSongs,
  persistMusicSongs,
  validateMusicBlock,
  validateMusicMoment,
  validateMusicSong,
} from "../services/musicService";
import {
  discardAdminMusicChanges,
  getAdminDataSnapshot,
  getAdminMusicChangesSummary,
  loadAdminDataOnce,
  markAdminDataSaved,
  setAdminMusic,
  setAdminMusicBlocks,
  setAdminMusicMoments,
} from "../services/adminDataStore";
import {
  AdminPage,
  AdminPendingChangesActions,
  AdminTableSection,
  Card,
  EditorDialog,
  UnsavedChangesDialog,
} from "../components/admin/common";
import IconButton from "../components/ui/IconButton";
import DeleteDialog from "../components/ui/DeleteDialog";
import Spinner from "../components/ui/Spinner";
import useSpinner from "../hooks/useSpinner";
import useIsMobileView from "../hooks/useIsMobileView";
import useAdminLocalChanges from "../hooks/useAdminLocalChanges";
import { FormCard } from "../components/rsvp/FormPrimitives";

const content = adminContent.music;
export default function AdminMusic() {
  const authenticated = isAdminSessionAuthenticated();
  const spinner = useSpinner();
  const mobile = useIsMobileView();
  const [loading, setLoading] = useState(true);
  const [music, setMusic] = useState([]);
  const [moments, setMoments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingType, setEditingType] = useState("");
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    if (!authenticated) return;
    loadAdminDataOnce({ password: ADMIN_PASSWORD })
      .then((snapshot) => {
        setMusic(normalizeMusicSongs(snapshot.music));
        setMoments(normalizeMusicMoments(snapshot.musicMoments));
        setBlocks(normalizeMusicBlocks(snapshot.musicBlocks));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authenticated]);
  const changes = getAdminMusicChangesSummary();
  const pending = changes.length > 0;
  const apply = (nextMusic, nextMoments, nextBlocks = blocks) => {
    const songs = normalizeMusicSongs(nextMusic);
    const normalizedMoments = normalizeMusicMoments(nextMoments);
    const normalizedBlocks = normalizeMusicBlocks(nextBlocks);
    setMusic(songs);
    setMoments(normalizedMoments);
    setBlocks(normalizedBlocks);
    setAdminMusic(songs);
    setAdminMusicMoments(normalizedMoments);
    setAdminMusicBlocks(normalizedBlocks);
  };
  const save = async () => {
    if (!pending) return true;
    try {
      spinner.show("Guardando escaleta musical...");
      const saved = await persistMusicSongs({
        password: ADMIN_PASSWORD,
        music,
        moments,
        blocks,
      });
      apply(saved.music, saved.moments, saved.blocks);
      markAdminDataSaved({
        music: saved.music,
        musicMoments: saved.moments,
        musicBlocks: saved.blocks,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      spinner.hide();
    }
  };
  const discard = () => {
    const restored = discardAdminMusicChanges();
    setMusic(restored);
    const snapshot = getAdminDataSnapshot();
    setMoments(normalizeMusicMoments(snapshot.musicMoments));
    setBlocks(normalizeMusicBlocks(snapshot.musicBlocks));
    setEditing(null);
    setDeleteTarget(null);
  };
  const submit = (event) => {
    event.preventDefault();
    const validation =
      editingType === "moment"
        ? validateMusicMoment(editing)
        : editingType === "block"
          ? validateMusicBlock(editing)
          : validateMusicSong(editing);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    if (editingType === "moment")
      apply(music, [
        ...moments.filter((item) => item.id !== editing.id),
        editing,
      ]);
    else if (editingType === "block")
      apply(music, moments, [
        ...blocks.filter((item) => item.id !== editing.id),
        editing,
      ]);
    else
      apply(
        [...music.filter((item) => item.id !== editing.id), editing],
        moments,
      );
    setEditing(null);
  };
  const confirmDelete = () => {
    if (deleteTarget.type === "moment")
      apply(
        music.filter((song) => song.momentId !== deleteTarget.item.id),
        moments.filter((moment) => moment.id !== deleteTarget.item.id),
        blocks.filter((block) => block.momentId !== deleteTarget.item.id),
      );
    else if (deleteTarget.type === "block")
      apply(
        music,
        moments,
        blocks.filter((block) => block.id !== deleteTarget.item.id),
      );
    else
      apply(
        music.filter((song) => song.id !== deleteTarget.item.id),
        moments,
      );
    setDeleteTarget(null);
  };
  const {
    blocker,
    cancelBlockedNavigation,
    discardAndContinueNavigation,
    saveAndContinueNavigation,
  } = useAdminLocalChanges({
    hasPendingChanges: pending,
    onDiscard: discard,
    onSave: save,
  });
  const grouped = useMemo(
    () =>
      moments.map((moment) => ({
        moment,
        songs: music.filter((song) => song.momentId === moment.id),
        blocks: blocks.filter((block) => block.momentId === moment.id),
      })),
    [music, moments, blocks],
  );
  if (!authenticated) return <Navigate to="/admin" replace />;
  return (
    <AdminPage header={content.header} innerClassName="max-w-7xl py-6">
      {() => (
        <>
          {spinner.loading && <Spinner text={spinner.text} />}
          <AdminPendingChangesActions
            changes={changes}
            hasPendingChanges={pending}
            loading={loading}
            onDiscard={discard}
            onSave={save}
            saving={spinner.loading}
            showText={!mobile}
          />
          <AdminTableSection
            className="mt-4"
            loading={loading}
            eyebrow={content.list.eyebrow}
            title={content.list.title}
            count={content.list.songsCount(music.length)}
            actions={
              <MusicActions
                onMoment={() => {
                  setEditingType("moment");
                  setEditing(createEmptyMusicMoment());
                  setErrors({});
                }}
              />
            }
            actionsFullWidth
            headerActions={
              <MusicActions
                compact
                onMoment={() => {
                  setEditingType("moment");
                  setEditing(createEmptyMusicMoment());
                  setErrors({});
                }}
              />
            }
            skeletonHeader
            skeletonConfig={{
              content: {
                columnsClassName: "md:grid-cols-2",
                count: 2,
                decorative: false,
                itemClassName: "min-h-64",
                lines: 3,
              },
              headerActionCount: 1,
              pagination: false,
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {grouped.map(({ moment, songs, blocks: momentBlocks }) => (
                <Card
                  key={moment.id}
                  actionsPlacement="overlay"
                  actions={
                    <MomentCardActions
                      onDelete={() =>
                        setDeleteTarget({ type: "moment", item: moment })
                      }
                      onEdit={() => {
                        setEditingType("moment");
                        setEditing(moment);
                        setErrors({});
                      }}
                    />
                  }
                  eyebrow={moment.description}
                  title={moment.label}
                >
                  <div className="mt-4 space-y-2">
                    {momentBlocks.map((block) => (
                      <div
                        key={block.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-white/70 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <b className="block truncate text-sm">{block.name}</b>
                          <span className="block truncate text-xs text-[var(--color-muted)]">
                            {block.style} · {block.duration}
                          </span>
                        </div>
                        <IconButton
                          icon={<Trash2 size={15} />}
                          label={content.actions.deleteBlock}
                          tone="danger"
                          onClick={() =>
                            setDeleteTarget({ type: "block", item: block })
                          }
                        />
                        <IconButton
                          icon={<Pencil size={15} />}
                          label={content.actions.editBlock}
                          tone="primary"
                          onClick={() => {
                            setEditingType("block");
                            setEditing(block);
                            setErrors({});
                          }}
                        />
                      </div>
                    ))}
                    {songs.map((song) => (
                      <div
                        key={song.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]/50 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <b className="block truncate text-sm">{song.title}</b>
                          <span className="block truncate text-xs text-[var(--color-muted)]">
                            {song.name}
                            {song.notes ? ` · ${song.notes}` : ""}
                          </span>
                        </div>
                        <IconButton
                          icon={<Trash2 size={15} />}
                          label={content.actions.deleteSong}
                          tone="danger"
                          onClick={() =>
                            setDeleteTarget({ type: "song", item: song })
                          }
                        />
                        <IconButton
                          icon={<Pencil size={15} />}
                          label={content.actions.editSong}
                          tone="primary"
                          onClick={() => {
                            setEditingType("song");
                            setEditing(song);
                            setErrors({});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <IconButton
                    icon={<Music2 size={16} />}
                      label={content.actions.addSong}
                      showText="always"
                      onClick={() => {
                        setEditingType("song");
                        setEditing(
                          createEmptyMusicSong({ momentId: moment.id }),
                        );
                        setErrors({});
                      }}
                    >
                      {content.actions.addSong}
                    </IconButton>
                    <IconButton
                    icon={<Music4 size={16} />}
                      label={content.actions.addBlock}
                      showText="always"
                      tone="terciary"
                      onClick={() => {
                        setEditingType("block");
                        setEditing(
                          createEmptyMusicBlock({ momentId: moment.id }),
                        );
                        setErrors({});
                      }}
                    >
                      {content.actions.addBlock}
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
          </AdminTableSection>
          {editing && (
            <EditorDialog
              title={
                editingType === "moment"
                  ? content.forms.momentTitle
                  : editingType === "block"
                    ? content.forms.blockTitle
                    : content.forms.songTitle
              }
              onClose={() => setEditing(null)}
            >
              {editingType === "moment" ? (
                <MomentForm
                  form={editing}
                  errors={errors}
                  onChange={(field, value) =>
                    setEditing({ ...editing, [field]: value })
                  }
                  onSubmit={submit}
                />
              ) : editingType === "block" ? (
                <BlockForm
                  form={editing}
                  errors={errors}
                  onChange={(field, value) =>
                    setEditing({ ...editing, [field]: value })
                  }
                  onSubmit={submit}
                />
              ) : (
                <SongForm
                  form={editing}
                  errors={errors}
                  onChange={(field, value) =>
                    setEditing({ ...editing, [field]: value })
                  }
                  onSubmit={submit}
                />
              )}
            </EditorDialog>
          )}
          {deleteTarget && (
            <DeleteDialog
              title={`Eliminar ${deleteTarget.type === "moment" ? "momento" : "canción"}`}
              message={
                deleteTarget.type === "moment"
                  ? "También se eliminarán sus canciones asociadas."
                  : "Esta canción se eliminará de la escaleta musical."
              }
              onCancel={() => setDeleteTarget(null)}
              onConfirm={confirmDelete}
            />
          )}{" "}
          {blocker.state === "blocked" && (
            <UnsavedChangesDialog
              changes={changes}
              labels={{
                eyebrow: "Cambios pendientes",
                exitWithoutSaving: "Salir sin guardar",
                keepEditing: "Seguir editando",
                saveAndExit: "Guardar y salir",
                text: "Hay cambios en la escaleta musical que todavía no se han guardado.",
                title: "¿Guardar cambios?",
              }}
              onCancel={cancelBlockedNavigation}
              onConfirm={discardAndContinueNavigation}
              onSaveAndExit={saveAndContinueNavigation}
            />
          )}
        </>
      )}
    </AdminPage>
  );
}
function MusicActions({ compact, onMoment }) {
  return (
    <div className={compact ? "flex gap-2" : "grid w-full gap-3"}>
      <IconButton
        className={compact ? "h-10 w-10 !px-0" : "w-full"}
        icon={<Plus size={16} />}
        label={content.actions.addMoment}
        onClick={onMoment}
        showText={compact ? false : "always"}
      >
        {content.actions.addMoment}
      </IconButton>
    </div>
  );
}
function MomentCardActions({ onDelete, onEdit }) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 self-start">
      <IconButton
        className="h-10 w-10 !px-0"
        icon={<Trash2 size={16} strokeWidth={1.8} />}
        label={content.actions.deleteMoment}
        onClick={onDelete}
        tone="danger"
      />
      <IconButton
        className="h-10 w-10 !px-0"
        icon={<Pencil size={16} strokeWidth={1.8} />}
        label={content.actions.editMoment}
        onClick={onEdit}
        tone="primary"
      />
    </div>
  );
}
function MomentForm({ form, errors, onChange, onSubmit }) {
  return (
    <form className="mt-4" onSubmit={onSubmit}>
      <FormActions />
      <FormCard>
        <div className="grid gap-5">
          <Field
            label={content.forms.momentName}
            value={form.label}
            error={errors.label}
            onChange={(value) => onChange("label", value)}
          />
          <Field
            label={content.forms.description}
            value={form.description}
            onChange={(value) => onChange("description", value)}
          />
        </div>
      </FormCard>
    </form>
  );
}
function SongForm({ form, errors, onChange, onSubmit }) {
  return (
    <form className="mt-4" onSubmit={onSubmit}>
      <FormActions />
      <FormCard>
        <div className="grid gap-5">
          <Field
            label={content.forms.performer}
            value={form.name}
            error={errors.name}
            onChange={(value) => onChange("name", value)}
          />
          <Field
            label={content.forms.songTitleLabel}
            value={form.title}
            error={errors.title}
            onChange={(value) => onChange("title", value)}
          />
          <Field
            label={content.forms.notes}
            value={form.notes}
            onChange={(value) => onChange("notes", value)}
          />
        </div>
      </FormCard>
    </form>
  );
}
function BlockForm({ form, errors, onChange, onSubmit }) {
  return (
    <form className="mt-4" onSubmit={onSubmit}>
      <FormActions />
      <FormCard>
        <div className="grid gap-5">
          <Field
            label={content.forms.name}
            value={form.name}
            error={errors.name}
            onChange={(value) => onChange("name", value)}
          />
          <Field
            label={content.forms.style}
            value={form.style}
            error={errors.style}
            onChange={(value) => onChange("style", value)}
          />
          <Field
            label={content.forms.duration}
            value={form.duration}
            error={errors.duration}
            onChange={(value) => onChange("duration", value)}
          />
        </div>
      </FormCard>
    </form>
  );
}
function Field({ label, value, error, onChange }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white p-3"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
function FormActions() {
  const submitText = tableContent.form.submitText;

  return (
    <div className="mb-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/35 p-4">
      <div className="grid w-full gap-3">
        <IconButton
          className="w-full"
          icon={<Save size={16} strokeWidth={1.8} />}
          keepTextOnAdminSubpages
          label={submitText}
          showText="always"
          tone="primary"
          type="submit"
        >
          {submitText}
        </IconButton>
      </div>
    </div>
  );
}
