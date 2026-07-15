import { SafeScreen } from '../../../shared/components';
import { useLanguage } from '../../../shared/i18n';

export function RequestScreen() {
  const { t } = useLanguage();

  return <SafeScreen title={t.request.title} subtitle={t.request.subtitle} />;
}
