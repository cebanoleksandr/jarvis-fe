import { useParams } from 'react-router-dom';

import { PagePlaceholder } from './PagePlaceholder';

export default function ChatPage() {
  const { conversationId } = useParams();
  return (
    <PagePlaceholder
      title="Chat"
      note={
        conversationId
          ? `Conversation ${conversationId}`
          : 'Start a new chat from the sidebar.'
      }
    />
  );
}
