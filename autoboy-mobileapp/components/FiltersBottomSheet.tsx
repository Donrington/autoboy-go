import { useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/commonStyles';

import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function FiltersBottomSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      ref.current?.expand();
    } else {
      ref.current?.close();
    }
  }, [open]);

  const toggle = (val: string) => {
    setSelected((prev) => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]));
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enablePanDownToClose
      onClose={onClose}
      snapPoints={snapPoints}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
      backgroundStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: colors.border, borderWidth: 1 }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={{ padding: 12 }}>
        <View style={styles.glass}>
          <Text style={styles.title}>Filters</Text>

          <Text style={styles.caption}>Condition</Text>
          <View style={styles.row}>
            {['New', 'Used', 'Refurbished', 'Grade A', 'Grade B'].map((t) => (
              <Chip key={t} text={t} active={selected.includes(t)} onPress={() => toggle(t)} />
            ))}
          </View>

          <Text style={[styles.caption, { marginTop: 10 }]}>Price</Text>
          <View style={styles.row}>
            {['Under ₦50', '₦50 - ₦200', '₦200+'].map((t) => (
              <Chip key={t} text={t} active={selected.includes(t)} onPress={() => toggle(t)} />
            ))}
          </View>

          <TouchableOpacity style={styles.apply} onPress={onClose}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

function Chip({ text, active, onPress }: { text: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glass: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.5)',
    boxShadow: '0 10px 30px rgba(34,197,94,0.10)',
  } as any,
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  caption: {
    color: colors.muted,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.muted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primaryDark,
  },
  apply: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  applyText: {
    color: colors.textOnPrimary,
    fontWeight: '800',
  },
});
