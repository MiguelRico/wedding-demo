import { MusicSong } from "../models";
import { musicRepository } from "../repositories/musicRepository";
export const createEmptyMusicSong = MusicSong.create;
export const normalizeMusicSongs = MusicSong.normalizeList;
export const validateMusicSong = MusicSong.validate;
export const persistMusicSongs = async ({ password, music }) => {
  const normalized = MusicSong.normalizeList(music);
  await musicRepository.saveAdmin({ password, music: normalized });
  return normalized;
};
