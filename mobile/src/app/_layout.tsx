import { Stack } from 'expo-router';

/** Root navigator: native stack, our own headers. */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
