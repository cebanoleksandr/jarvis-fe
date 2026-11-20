import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';

import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { ChatView, type ChatLocationState } from '../components/chat/ChatView';
import { useCreateConversation } from '../queries';
import { colors } from '../theme';

/**
 * `/chat/:conversationId` shows that conversation; `/chat` is a blank prompt
 * that creates the conversation on the first message.
 */
export default function ChatPage() {
  const { conversationId } = useParams();
  // A fresh view per conversation: scroll position, stream and composer reset.
  return conversationId ? (
    <ChatView key={conversationId} conversationId={conversationId} />
  ) : (
    <NewChat />
  );
}

function NewChat() {
  const navigate = useNavigate();
  const create = useCreateConversation();

  const start = async (text: string) => {
    const conversation = await create.mutateAsync();
    navigate(`/chat/${conversation.id}`, {
      state: { initialMessage: text } satisfies ChatLocationState,
    });
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.surface,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <ChatEmptyState />
      </Box>
      <ChatComposer
        onSend={(text) => void start(text)}
        disabled={create.isPending}
        autoFocus
      />
    </Box>
  );
}
