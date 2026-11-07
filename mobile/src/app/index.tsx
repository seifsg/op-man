import { Text, View } from 'react-native';
import { EXERCISES } from '../core/exercises.ts';

/** Home (spike shell): proves the `.ts` import path bundles. Replaced by the real home in T7. */
export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0F' }}>
      {EXERCISES.map((e) => (
        <Text key={e.id} style={{ color: e.color, fontSize: 32, fontWeight: '900' }}>
          {e.name}
        </Text>
      ))}
    </View>
  );
}
