import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import {
  useChatStream,
  useConversations,
  useCurrentUser,
  useMessages,
  usePendingActions,
} from '../../queries';
import { ApiError, type PendingAction } from '../../services';
import { colors } from '../../theme';
import { ActionCard } from './ActionCard';
import { ChatComposer } from './ChatComposer';
import { ChatEmptyState } from './ChatEmptyState';
import { AssistantTurn, LiveTurn, UserBubble } from './ChatTurns';
import { buildTurns } from './turns';

/** Router state used to hand the first message over from the "new chat" screen. */
export interface ChatLocationState {
  initialMessage?: string;
}

const STICK_THRESHOLD = 120;

/** One conversation: history, live reply, confirmation cards and the composer. */
export function ChatView({ conversationId }: { conversationId: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);
  // Briefings are generated in the background: poll until the reply lands.
  const isBriefing = conversation !== undefined && conversation.kind !== 'chat';

  const messages = useMessages(conversationId, { pollUntilReply: isBriefing });
  const { data: actions = [] } = usePendingActions(conversationId);
  const { state, send, confirm, cancel, abort } = useChatStream(conversationId);

  const turns = useMemo(() => buildTurns(messages.data ?? []), [messages.data]);

  // Cards hang under the assistant turn that proposed them; cards whose
  // message is not loaded yet (mid-stream) go under the live reply.
  const { byTurn, loose } = useMemo(() => {
    const byTurn = new Map<string, PendingAction[]>();
    const loose: PendingAction[] = [];
    for (const a of actions) {
      const turn = turns.find(
        (tr) => tr.kind === 'assistant' && tr.messageIds.includes(a.messageId),
      );
      if (turn) byTurn.set(turn.id, [...(byTurn.get(turn.id) ?? []), a]);
      else loose.push(a);
    }
    return { byTurn, loose };
  }, [actions, turns]);

  // First message typed on the "new chat" screen.
  const handedOver = useRef(false);
  useEffect(() => {
    const initial = (location.state as ChatLocationState | null)
      ?.initialMessage;
    if (!initial || handedOver.current) return;
    handedOver.current = true;
    navigate(location.pathname, { replace: true, state: null });
    void send(initial);
  }, [location.state, location.pathname, navigate, send]);

  // Follow the conversation while the user is at the bottom.
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [turns, actions, state.text, state.toolCalls.length, state.isStreaming]);

  const renderCards = (list: PendingAction[]) =>
    list.map((a) => (
      <ActionCard
        key={a.id}
        action={a}
        busy={state.isStreaming}
        onConfirm={() => void confirm(a.id)}
        onCancel={() => void cancel(a.id)}
      />
    ));

  const notFound =
    messages.error instanceof ApiError && messages.error.status === 404;
  const showLive =
    state.isStreaming || state.text || state.toolCalls.length > 0;
  const waitingForBriefing =
    isBriefing && !turns.some((tr) => tr.kind === 'assistant');

  let body;
  if (messages.isPending) {
    body = (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  } else if (notFound) {
    body = (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: colors.textSecondary,
        }}
      >
        {t('chat.notFound')}
        <Button component={RouterLink} to="/chat" variant="outlined">
          {t('chat.startNew')}
        </Button>
      </Box>
    );
  } else if (messages.isError) {
    body = (
      <Box sx={{ maxWidth: 760, mx: 'auto', p: 3 }}>
        <Alert
          severity="error"
          variant="outlined"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void messages.refetch()}
            >
              {t('chat.retry')}
            </Button>
          }
        >
          {t('chat.loadFailed')}
        </Alert>
      </Box>
    );
  } else if (
    !turns.length &&
    !showLive &&
    !loose.length &&
    !waitingForBriefing
  ) {
    body = <ChatEmptyState />;
  } else {
    body = (
      <Box
        sx={{
          maxWidth: 760,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {turns.map((turn) =>
          turn.kind === 'user' ? (
            <UserBubble key={turn.id} turn={turn} timeZone={user?.timezone} />
          ) : (
            <AssistantTurn key={turn.id} turn={turn}>
              {renderCards(byTurn.get(turn.id) ?? [])}
            </AssistantTurn>
          ),
        )}
        {(showLive || loose.length > 0 || waitingForBriefing) && (
          <LiveTurn
            text={state.text}
            toolCalls={state.toolCalls}
            streaming={state.isStreaming || waitingForBriefing}
          >
            {renderCards(loose)}
          </LiveTurn>
        )}
        {state.error && (
          <Alert severity="error" variant="outlined">
            {t('chat.failed', { message: state.error.message })}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.surface,
      }}
    >
      <Box
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
        }}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        {body}
      </Box>
      <ChatComposer
        onSend={(text) => {
          stick.current = true;
          void send(text);
        }}
        streaming={state.isStreaming}
        onStop={abort}
        disabled={notFound || messages.isPending}
        autoFocus
      />
    </Box>
  );
}
