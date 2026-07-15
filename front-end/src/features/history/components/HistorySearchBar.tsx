import { StyleSheet, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { AppTextInput } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { useResponsive } from '../../../shared/hooks';

type HistorySearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function HistorySearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
}: HistorySearchBarProps) {
  const { ms, isSmall } = useResponsive();

  return (
    <View style={[styles.wrap, { height: isSmall ? 44 : 48 }]}>
      <Search color={colors.secondary} size={ms(18)} />
      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        style={[styles.input, { fontSize: ms(15) }]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    width: '100%',
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    minWidth: 0,
  },
});
