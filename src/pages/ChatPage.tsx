import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { PagePlaceholder } from './PagePlaceholder';

export default function ChatPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  return (
    <PagePlaceholder
      title={t('pageTitle.chat')}
      note={
        conversationId
          ? t('chat.conversation', { id: conversationId })
          : t('chat.empty')
      }
    />
  );
}
