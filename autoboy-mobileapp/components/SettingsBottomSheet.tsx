import { useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors } from '../styles/commonStyles';
import { BlurView } from 'expo-blur';

export default function SettingsBottomSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);
  const [notify, setNotify] = useState(true);
  const [dark, setDark] = useState(false);
  const [premium, setPremium] = useState(true); // mock verified badge state

  useEffect(() => {
    if (open) {
      ref.current?.expand();
    } else {
      ref.current?.close();
    }
  }, [open]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enablePanDownToClose
      onClose={onClose}
      snapPoints={snapPoints}
      backdropComponent={(props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
      backgroundStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: colors.border, borderWidth: 1 }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={{ padding: 12 }}>
        <BlurView intensity={30} tint="light" style={styles.glass}>
          <Text style={styles.title}>Settings</Text>
          <Row label="Notifications" value={notify} onChange={setNotify} />
          <Row label="Dark Mode (UI demo)" value={dark} onChange={setDark} />
          <Row label="Premium Verified Badge" value={premium} onChange={setPremium} />
          <Text style={styles.caption}>For real auth, KYC, and push notifications, enable backend later.</Text>
        </BlurView>
      </BottomSheetView>
    </BottomSheet>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.5)',
    gap: 12,
    boxShadow: '0 10px 30px rgba(34,197,94,0.10)',
  } as any,
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  row: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: colors.text, fontWeight: '600' },
  caption: { color: colors.muted, marginTop: 4, fontSize: 12 },
});
