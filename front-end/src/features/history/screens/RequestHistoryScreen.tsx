import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../../../shared/components';
import { useLanguage } from '../../../shared/i18n';
import { HistoryListPanel } from '../components';
import { REQUEST_FILTERS, HistoryItem } from '../types';

const REQUEST_HISTORY: HistoryItem[] = [];

export function RequestHistoryScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <SafeScreen
      title={t.history.requestHistoryTitle}
      subtitle={t.history.requestHistorySubtitle}
      onBack={() => navigation.goBack()}>
      <HistoryListPanel
        items={REQUEST_HISTORY}
        filters={REQUEST_FILTERS}
        searchPlaceholder={t.history.searchRequest}
        emptyTitle={t.history.emptyRequestTitle}
        emptyMessage={t.history.emptyRequestMessage}
      />
    </SafeScreen>
  );
}
