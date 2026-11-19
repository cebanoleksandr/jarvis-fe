import { useTranslation } from 'react-i18next';

import { PagePlaceholder } from './PagePlaceholder';

export default function TodayPage() {
  const { t } = useTranslation();
  return <PagePlaceholder title={t('pageTitle.today')} />;
}
