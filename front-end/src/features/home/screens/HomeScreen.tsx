import { SafeScreen } from '../../../shared/components';
import { useLanguage } from '../../../shared/i18n';

export function HomeScreen() {
  const { t } = useLanguage();

  return <SafeScreen title={t.home.title} subtitle={t.home.subtitle} />;
}
