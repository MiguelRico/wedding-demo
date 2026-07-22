import { MusicMoment, MusicSong } from "../models";
import { musicRepository } from "../repositories/musicRepository";
export const createEmptyMusicSong = MusicSong.create;
export const normalizeMusicSongs = MusicSong.normalizeList;
export const validateMusicSong = MusicSong.validate;
export const createEmptyMusicMoment = MusicMoment.create;
export const normalizeMusicMoments = MusicMoment.normalizeList;
export const validateMusicMoment = MusicMoment.validate;
export const persistMusicSongs = async ({ password, music, moments }) => {
  const normalized = MusicSong.normalizeList(music);
  const normalizedMoments = MusicMoment.normalizeList(moments);
  await musicRepository.saveAdmin({ password, music: normalized, moments: normalizedMoments });
  return { music: normalized, moments: normalizedMoments };
};
