import { Alert } from 'react-native';
import { restart } from '../data/progress';

/** Asks before wiping the challenge: the only destructive action in the app. */
export const confirmRestart = (): void =>
  Alert.alert('Start again?', 'This clears all 100 days of history on this phone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Start again', style: 'destructive', onPress: restart },
  ]);
