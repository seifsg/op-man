import { router } from 'expo-router';

/** Back to the previous screen, or home when the screen was opened directly (deep link, cold start). */
export const leave = (): void => (router.canGoBack() ? router.back() : router.replace('/'));
