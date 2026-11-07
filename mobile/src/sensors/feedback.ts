import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

const HAPTICS = Platform.OS !== 'web';
const warn = (what: string) => (e: unknown) => console.warn(`OP Man: ${what} failed`, e);

/** Speaks `text` now, cutting off whatever is still playing, so fast reps never pile up. */
export const say = (text: string): void => {
  void Speech.stop().catch(warn('speech stop'));
  Speech.speak(text, { rate: 1.1 });
};

/** One firm tap per rep: you feel the count with the phone on your chest or on the floor. */
export const buzz = (): void => {
  if (HAPTICS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(warn('haptic'));
};

/** Celebration pulse when the day's target is reached. */
export const cheer = (): void => {
  if (HAPTICS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(warn('haptic'));
};
