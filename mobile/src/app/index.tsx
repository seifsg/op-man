import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { hasProximity, watchProximity } from '../../modules/op-proximity/index.ts';
import { EXERCISES } from '../core/exercises.ts';

/** Home (spike shell): proves the `.ts` import path and live proximity events. Replaced by the real home in T7. */
export default function Home() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [near, setNear] = useState<boolean | null>(null);
  const [edges, setEdges] = useState(0);

  useEffect(() => {
    hasProximity().then(setAvailable, (e: unknown) => console.error('proximity check failed', e));
    const sub = watchProximity((n) => {
      setNear(n);
      if (n) setEdges((c) => c + 1);
    });
    return () => sub?.remove();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0F' }}>
      {EXERCISES.map((e) => (
        <Text key={e.id} style={{ color: e.color, fontSize: 32, fontWeight: '900' }}>
          {e.name}
        </Text>
      ))}
      <Text style={{ color: '#F5F5F7', fontSize: 20, marginTop: 24 }}>
        proximity: {available === null ? 'checking' : available ? 'available' : 'none'} · {near === null ? '-' : near ? 'NEAR' : 'FAR'} · near events: {edges}
      </Text>
    </View>
  );
}
