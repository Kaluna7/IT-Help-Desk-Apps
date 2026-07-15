import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardList, Send } from 'lucide-react-native';
import { SafeScreen } from '../../../shared/components';
import { useLanguage } from '../../../shared/i18n';
import { HistoryTypeCard } from '../components';
import type { HistoryStackParamList } from '../HistoryNavigator';

type Nav = NativeStackNavigationProp<HistoryStackParamList, 'HistoryHome'>;

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();

  return (
    <SafeScreen title={t.history.title} subtitle={t.history.subtitle}>
      <View style={styles.list}>
        <HistoryTypeCard
          title={t.history.reportTitle}
          description={t.history.reportDesc}
          icon={ClipboardList}
          onPress={() => navigation.navigate('ReportHistory')}
        />
        <HistoryTypeCard
          title={t.history.requestTitle}
          description={t.history.requestDesc}
          icon={Send}
          onPress={() => navigation.navigate('RequestHistory')}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
