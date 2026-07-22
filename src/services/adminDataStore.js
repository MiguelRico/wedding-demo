import { ADMIN_PASSWORD } from "../constants/admin";
import { adminContent } from "../constants/adminContent";
import { AdminNotification, MusicMoment, MusicSong, Table, Task } from "../models";
import { mapAdminConfirmations } from "../mappers/confirmationMapper";
import { mapAdminProviders } from "../mappers/providerMapper";
import { mapAdminTables } from "../mappers/tableMapper";
import { confirmationRepository } from "../repositories/confirmationRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import { providerRepository } from "../repositories/providerRepository";
import { tableRepository } from "../repositories/tableRepository";
import { taskRepository } from "../repositories/taskRepository";
import { musicRepository } from "../repositories/musicRepository";
import {
  cloneJson,
  hasJsonChanged,
} from "../utils/objectSnapshot";

const emptySnapshot = {
  confirmations: [],
  loaded: false,
  loadingPromise: null,
  notifications: [],
  music: [],
  musicMoments: [],
  providers: [],
  savedConfirmations: [],
  savedNotifications: [],
  savedMusic: [],
  savedMusicMoments: [],
  savedProviders: [],
  savedTables: [],
  savedTasks: [],
  tables: [],
  tasks: [],
};

const store = { ...emptySnapshot };
const subscribers = new Set();
let snapshotCache = null;

const notifyAdminDataChange = () => {
  snapshotCache = createAdminDataSnapshot();
  const snapshot = snapshotCache;

  subscribers.forEach((subscriber) => {
    try {
      subscriber(snapshot);
    } catch (error) {
      console.error("Error al sincronizar un suscriptor administrativo:", error);
    }
  });
};

const getConfirmationKey = (group = {}) =>
  group.confirmationId ||
  group.id ||
  `draft:${group.email || ""}:${group.phone || ""}`;
const getUnnamedFallback = () => adminContent.common.fallbacks.unnamed;
const changesContent = adminContent.common.changes;

export const clearAdminDataStore = () => {
  store.confirmations = [];
  store.loaded = false;
  store.loadingPromise = null;
  store.notifications = [];
  store.music = [];
  store.musicMoments = [];
  store.providers = [];
  store.savedConfirmations = [];
  store.savedNotifications = [];
  store.savedMusic = [];
  store.savedMusicMoments = [];
  store.savedProviders = [];
  store.savedTables = [];
  store.savedTasks = [];
  store.tables = [];
  store.tasks = [];
  notifyAdminDataChange();
};

export const subscribeAdminData = (subscriber) => {
  subscribers.add(subscriber);

  return () => subscribers.delete(subscriber);
};

export const invalidateAdminData = () => {
  store.loaded = false;
};

export const refreshAdminData = async ({
  discardPendingChanges = false,
  password = ADMIN_PASSWORD,
} = {}) => {
  if (hasAdminPendingChanges() && !discardPendingChanges) {
    throw new Error(
      "No se puede actualizar mientras existan cambios pendientes sin guardar.",
    );
  }

  if (discardPendingChanges) {
    discardAdminPendingChanges();
  }

  invalidateAdminData();

  return loadAdminDataOnce({ password });
};

export const loadAdminDataOnce = async ({ password = ADMIN_PASSWORD } = {}) => {
  if (store.loaded) return getAdminDataSnapshot();
  if (store.loadingPromise) return store.loadingPromise;

  store.loadingPromise = Promise.all([
    confirmationRepository.findAll({ password }),
    tableRepository.findAll({ password }).catch((error) => {
      console.error("Error al cargar mesas guardadas:", error);
      return { tables: [] };
    }),
    providerRepository.findAll({ password }).catch((error) => {
      console.error("Error al cargar proveedores:", error);
      return { providers: [] };
    }),
    notificationRepository.findAll({ password }).catch((error) => {
      console.error("Error al cargar notificaciones:", error);
      return { notifications: [] };
    }),
    taskRepository.findAll({ password }).catch((error) => {
      console.error("Error al cargar tareas:", error);
      return { tasks: [] };
    }),
    musicRepository.findAll({ password }).catch((error) => {
      console.error("Error al cargar escalera musical:", error);
      return { music: [] };
    }),
  ])
    .then(
      ([
        confirmationsResponse,
        tablesResponse,
        providersResponse,
        notificationsResponse,
        tasksResponse, musicResponse,
      ]) => {
        store.confirmations = mapAdminConfirmations(confirmationsResponse);
        store.tables = Table.normalizeList(
          mapAdminTables(tablesResponse?.tables || []),
        );
        store.providers = mapAdminProviders(providersResponse?.providers || []);
        store.notifications = AdminNotification.normalizeList(
          notificationsResponse?.notifications || notificationsResponse || [],
        );
        store.tasks = Task.normalizeList(tasksResponse?.tasks || []);
        store.music = MusicSong.normalizeList(musicResponse?.music || []);
        store.musicMoments = MusicMoment.normalizeList(musicResponse?.moments || []);
        markAdminDataSaved();
        store.loaded = true;

        return getAdminDataSnapshot();
      },
    )
    .finally(() => {
      store.loadingPromise = null;
    });

  return store.loadingPromise;
};

const createAdminDataSnapshot = () => ({
  confirmations: cloneJson(store.confirmations),
  notifications: cloneJson(store.notifications),
  music: cloneJson(store.music),
  musicMoments: cloneJson(store.musicMoments),
  providers: cloneJson(store.providers),
  savedConfirmations: cloneJson(store.savedConfirmations),
  savedNotifications: cloneJson(store.savedNotifications),
  savedMusic: cloneJson(store.savedMusic),
  savedMusicMoments: cloneJson(store.savedMusicMoments),
  savedProviders: cloneJson(store.savedProviders),
  savedTables: cloneJson(store.savedTables),
  savedTasks: cloneJson(store.savedTasks),
  tables: cloneJson(store.tables),
  tasks: cloneJson(store.tasks),
});

export const getAdminDataSnapshot = () => {
  if (!snapshotCache) {
    snapshotCache = createAdminDataSnapshot();
  }

  return snapshotCache;
};

export const hasAdminPendingChanges = () =>
  hasJsonChanged(store.confirmations, store.savedConfirmations) ||
  hasJsonChanged(store.tables, store.savedTables) ||
  hasJsonChanged(store.providers, store.savedProviders) ||
  hasJsonChanged(store.notifications, store.savedNotifications) ||
  hasJsonChanged(store.tasks, store.savedTasks) ||
  hasJsonChanged(store.music, store.savedMusic) ||
  hasJsonChanged(store.musicMoments, store.savedMusicMoments);

export const getAdminPendingChangesSummary = () =>
  dedupeChanges([
    ...buildEntityChanges({
      createdLabel: (item) =>
        changesContent.confirmationCreated(getConfirmationLabel(item)),
      currentItems: store.confirmations,
      deletedLabel: (item) =>
        changesContent.confirmationDeleted(getConfirmationLabel(item)),
      getKey: getConfirmationKey,
      modifiedLabel: (item) =>
        changesContent.confirmationModified(getConfirmationLabel(item)),
      savedItems: store.savedConfirmations,
    }),
    ...buildEntityChanges({
      createdLabel: (item) =>
        changesContent.tableCreated(item.name || getUnnamedFallback()),
      currentItems: store.tables,
      deletedLabel: (item) =>
        changesContent.tableDeleted(item.name || getUnnamedFallback()),
      getKey: (item) => item.id || item.name,
      modifiedLabel: (item) =>
        changesContent.tableModified(item.name || getUnnamedFallback()),
      savedItems: store.savedTables,
    }),
    ...buildEntityChanges({
      createdLabel: (item) =>
        changesContent.providerCreated(item.name || getUnnamedFallback()),
      currentItems: store.providers,
      deletedLabel: (item) =>
        changesContent.providerDeleted(item.name || getUnnamedFallback()),
      getKey: (item) => item.id,
      modifiedLabel: (item) =>
        changesContent.providerModified(item.name || getUnnamedFallback()),
      savedItems: store.savedProviders,
    }),
    ...buildEntityChanges({
      createdLabel: (item) =>
        changesContent.notificationCreated(item.title || getUnnamedFallback()),
      currentItems: store.notifications,
      deletedLabel: (item) =>
        changesContent.notificationDeleted(item.title || getUnnamedFallback()),
      getKey: (item) => item.id,
      modifiedLabel: (item) =>
        changesContent.notificationModified(item.title || getUnnamedFallback()),
      savedItems: store.savedNotifications,
    }),
    ...getAdminTaskChangesSummary(),
    ...getAdminMusicChangesSummary(),
  ]);

export const getAdminNotificationChangesSummary = () =>
  buildEntityChanges({
    createdLabel: (item) =>
      changesContent.notificationCreated(item.title || getUnnamedFallback()),
    currentItems: store.notifications,
    deletedLabel: (item) =>
      changesContent.notificationDeleted(item.title || getUnnamedFallback()),
    getKey: (item) => item.id,
    modifiedLabel: (item) =>
      changesContent.notificationModified(item.title || getUnnamedFallback()),
    savedItems: store.savedNotifications,
  });

export const getAdminTaskChangesSummary = () =>
  buildEntityChanges({
    createdLabel: (item) =>
      changesContent.taskCreated(item.title || getUnnamedFallback()),
    currentItems: store.tasks,
    deletedLabel: (item) =>
      changesContent.taskDeleted(item.title || getUnnamedFallback()),
    getKey: (item) => item.id,
    modifiedLabel: (item) =>
      changesContent.taskModified(item.title || getUnnamedFallback()),
    savedItems: store.savedTasks,
  });

export const getAdminMusicChangesSummary = () =>
  [...buildEntityChanges({
    createdLabel: (item) => `Canción añadida: ${item.title || getUnnamedFallback()}`,
    currentItems: store.music,
    deletedLabel: (item) => `Canción eliminada: ${item.title || getUnnamedFallback()}`,
    getKey: (item) => item.id,
    modifiedLabel: (item) => `Canción modificada: ${item.title || getUnnamedFallback()}`,
    savedItems: store.savedMusic,
  }), ...buildEntityChanges({ createdLabel: (item) => `Momento creado: ${item.label || getUnnamedFallback()}`, currentItems: store.musicMoments, deletedLabel: (item) => `Momento eliminado: ${item.label || getUnnamedFallback()}`, getKey: (item) => item.id, modifiedLabel: (item) => `Momento modificado: ${item.label || getUnnamedFallback()}`, savedItems: store.savedMusicMoments })];

export const markAdminDataSaved = ({
  confirmations = store.confirmations,
  notifications = store.notifications,
  music = store.music,
  musicMoments = store.musicMoments,
  providers = store.providers,
  tables = store.tables,
  tasks = store.tasks,
} = {}) => {
  store.savedConfirmations = mapAdminConfirmations(confirmations);
  store.savedNotifications = AdminNotification.normalizeList(notifications);
  store.savedMusic = MusicSong.normalizeList(music);
  store.savedMusicMoments = MusicMoment.normalizeList(musicMoments);
  store.savedProviders = mapAdminProviders(providers);
  store.savedTables = Table.normalizeList(tables);
  store.savedTasks = Task.normalizeList(tasks);

  notifyAdminDataChange();
  return getAdminDataSnapshot();
};

export const discardAdminPendingChanges = () => {
  store.confirmations = mapAdminConfirmations(store.savedConfirmations);
  store.notifications = AdminNotification.normalizeList(
    store.savedNotifications,
  );
  store.providers = mapAdminProviders(store.savedProviders);
  store.tables = Table.normalizeList(store.savedTables);
  store.tasks = Task.normalizeList(store.savedTasks);
  store.music = MusicSong.normalizeList(store.savedMusic);
  store.musicMoments = MusicMoment.normalizeList(store.savedMusicMoments);

  notifyAdminDataChange();
  return getAdminDataSnapshot();
};

export const discardAdminNotificationChanges = () => {
  store.notifications = AdminNotification.normalizeList(
    store.savedNotifications,
  );
  notifyAdminDataChange();
  return store.notifications;
};

export const discardAdminTaskChanges = () => {
  store.tasks = Task.normalizeList(store.savedTasks);

  notifyAdminDataChange();
  return store.tasks;
};

export const saveAdminPendingChanges = async ({
  password = ADMIN_PASSWORD,
} = {}) => {
  const savedById = new Map(
    store.savedConfirmations.map((confirmation) => [
      getConfirmationKey(confirmation),
      confirmation,
    ]),
  );
  const currentById = new Map(
    store.confirmations.map((confirmation) => [
      getConfirmationKey(confirmation),
      confirmation,
    ]),
  );
  const confirmationRequests = [];

  store.confirmations.forEach((confirmation) => {
    const key = getConfirmationKey(confirmation);

    if (!hasJsonChanged(savedById.get(key), confirmation)) {
      return;
    }

    confirmationRequests.push(
      confirmationRepository.saveAdmin({
        confirmation,
        method: savedById.has(key) ? "PUT" : "POST",
        password,
      }),
    );
  });

  store.savedConfirmations.forEach((confirmation) => {
    const key = getConfirmationKey(confirmation);

    if (currentById.has(key) || !confirmation.confirmationId) return;

    confirmationRequests.push(
      confirmationRepository.deleteAdmin({
        confirmationId: confirmation.confirmationId,
        password,
      }),
    );
  });

  const persistenceRequests = [...confirmationRequests];

  if (hasJsonChanged(store.notifications, store.savedNotifications)) {
    persistenceRequests.push(
      notificationRepository.saveAdmin({
        password,
        notifications: store.notifications,
      }),
    );
  }

  if (hasJsonChanged(store.tables, store.savedTables)) {
    persistenceRequests.push(
      tableRepository.saveAdmin({ password, tables: store.tables }),
    );
  }

  if (hasJsonChanged(store.providers, store.savedProviders)) {
    persistenceRequests.push(
      providerRepository.saveAdmin({ password, providers: store.providers }),
    );
  }

  if (hasJsonChanged(store.tasks, store.savedTasks)) {
    persistenceRequests.push(
      taskRepository.saveAdmin({ password, tasks: store.tasks }),
    );
  }
  if (hasJsonChanged(store.music, store.savedMusic) || hasJsonChanged(store.musicMoments, store.savedMusicMoments)) {
    persistenceRequests.push(musicRepository.saveAdmin({ password, music: store.music, moments: store.musicMoments }));
  }

  await Promise.all(persistenceRequests);

  return markAdminDataSaved();
};

export const setAdminConfirmations = (confirmations) => {
  store.confirmations = mapAdminConfirmations(confirmations);

  notifyAdminDataChange();
  return store.confirmations;
};

export const upsertAdminConfirmation = (confirmation) => {
  const normalizedConfirmation = mapAdminConfirmations([confirmation])[0];
  const normalizedKey = getConfirmationKey(normalizedConfirmation);
  const existingIndex = store.confirmations.findIndex(
    (item) => getConfirmationKey(item) === normalizedKey,
  );

  if (existingIndex === -1) {
    store.confirmations = [...store.confirmations, normalizedConfirmation];
  } else {
    store.confirmations = store.confirmations.map((item, index) =>
      index === existingIndex ? normalizedConfirmation : item,
    );
  }

  notifyAdminDataChange();
  return store.confirmations;
};

export const removeAdminConfirmation = (confirmationId) => {
  store.confirmations = store.confirmations.filter(
    (confirmation) => getConfirmationKey(confirmation) !== confirmationId,
  );

  notifyAdminDataChange();
  return store.confirmations;
};

export const setAdminTables = (tables) => {
  store.tables = Table.normalizeList(tables);

  notifyAdminDataChange();
  return store.tables;
};

export const setAdminProviders = (providers) => {
  store.providers = mapAdminProviders(providers);

  notifyAdminDataChange();
  return store.providers;
};

export const setAdminNotifications = (notifications) => {
  store.notifications = AdminNotification.normalizeList(notifications);

  notifyAdminDataChange();
  return store.notifications;
};

export const setAdminTasks = (tasks) => {
  store.tasks = Task.normalizeList(tasks);

  notifyAdminDataChange();
  return store.tasks;
};

export const setAdminMusic = (music) => {
  store.music = MusicSong.normalizeList(music);
  notifyAdminDataChange();
  return store.music;
};

export const setAdminMusicMoments = (moments) => {
  store.musicMoments = MusicMoment.normalizeList(moments);
  notifyAdminDataChange();
  return store.musicMoments;
};

export const upsertAdminNotification = (notification) => {
  const normalizedNotification = AdminNotification.normalize(notification);
  const existingIndex = store.notifications.findIndex(
    (item) => item.id === normalizedNotification.id,
  );

  if (existingIndex === -1) {
    store.notifications = AdminNotification.normalizeList([
      ...store.notifications,
      normalizedNotification,
    ]);
  } else {
    store.notifications = AdminNotification.normalizeList(
      store.notifications.map((item, index) =>
        index === existingIndex ? normalizedNotification : item,
      ),
    );
  }

  notifyAdminDataChange();
  return store.notifications;
};

export const markAdminNotificationRead = (notificationId, options = {}) => {
  return setAdminNotificationRead(notificationId, true, options);
};

export const setAdminNotificationRead = (
  notificationId,
  read,
  { markSaved = false } = {},
) => {
  const updateNotification = (notification) =>
    notification.id === notificationId
      ? { ...notification, read: Boolean(read) }
      : notification;

  store.notifications = AdminNotification.normalizeList(
    store.notifications.map(updateNotification),
  );

  if (markSaved) {
    store.savedNotifications = AdminNotification.normalizeList(
      store.savedNotifications.map(updateNotification),
    );
  }

  notifyAdminDataChange();
  return store.notifications;
};

export const removeAdminNotification = (notificationId) => {
  store.notifications = AdminNotification.normalizeList(
    store.notifications.filter((notification) => notification.id !== notificationId),
  );

  notifyAdminDataChange();
  return store.notifications;
};

export const upsertAdminTask = (task) => {
  const normalizedTask = Task.normalize(task);
  const existingIndex = store.tasks.findIndex(
    (item) => item.id === normalizedTask.id,
  );

  if (existingIndex === -1) {
    store.tasks = Task.normalizeList([...store.tasks, normalizedTask]);
  } else {
    store.tasks = Task.normalizeList(
      store.tasks.map((item, index) =>
        index === existingIndex ? normalizedTask : item,
      ),
    );
  }

  notifyAdminDataChange();
  return store.tasks;
};

export const removeAdminTask = (taskId) => {
  store.tasks = Task.normalizeList(
    store.tasks.filter((task) => task.id !== taskId),
  );

  notifyAdminDataChange();
  return store.tasks;
};

export const upsertAdminMusicSong = (song) => {
  const normalized = MusicSong.normalize(song);
  store.music = MusicSong.normalizeList([
    ...store.music.filter((item) => item.id !== normalized.id), normalized,
  ]);
  notifyAdminDataChange();
  return store.music;
};

export const removeAdminMusicSong = (songId) => {
  store.music = MusicSong.normalizeList(store.music.filter((song) => song.id !== songId));
  notifyAdminDataChange();
  return store.music;
};

export const discardAdminMusicChanges = () => {
  store.music = MusicSong.normalizeList(store.savedMusic);
  store.musicMoments = MusicMoment.normalizeList(store.savedMusicMoments);
  notifyAdminDataChange();
  return store.music;
};

function buildEntityChanges({
  createdLabel,
  currentItems,
  deletedLabel,
  getKey,
  modifiedLabel,
  savedItems,
}) {
  const savedByKey = new Map(savedItems.map((item) => [getKey(item), item]));
  const currentByKey = new Map(currentItems.map((item) => [getKey(item), item]));
  const changes = [];

  currentByKey.forEach((item, key) => {
    if (!savedByKey.has(key)) {
      changes.push(createdLabel(item));
      return;
    }

    if (hasJsonChanged(savedByKey.get(key), item)) {
      changes.push(modifiedLabel(item));
    }
  });

  savedByKey.forEach((item, key) => {
    if (!currentByKey.has(key)) {
      changes.push(deletedLabel(item));
    }
  });

  return dedupeChanges(changes);
}

function dedupeChanges(changes = []) {
  return Array.from(new Set(changes));
}

function getConfirmationLabel(confirmation = {}) {
  return (
    confirmation.confirmationName ||
    confirmation.email ||
    confirmation.phone ||
    getUnnamedFallback()
  );
}

