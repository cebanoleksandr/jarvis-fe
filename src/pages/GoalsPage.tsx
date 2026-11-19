import { useTranslation } from 'react-i18next';

import { PagePlaceholder } from './PagePlaceholder';

export default function GoalsPage() {
  const { t } = useTranslation();
  return <PagePlaceholder title={t('pageTitle.goals')} />;
}
