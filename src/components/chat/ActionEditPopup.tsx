import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import type { TFunction } from 'i18next';
import * as yup from 'yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import { colors } from '../../theme';
import BasePopup from '../popups/BasePopup';
import { type EventArgs, isAllDay, type TaskArgs } from './actionArgs';

// Limits mirror the backend schemas (create_event / create_task).
const makeEventSchema = (t: TFunction) =>
  yup.object({
    title: yup
      .string()
      .trim()
      .required(t('edit.required'))
      .max(300, t('edit.tooLong')),
    allDay: yup.boolean().required(),
    startDate: yup.string().required(t('edit.required')),
    startTime: yup
      .string()
      .defined()
      .when('allDay', {
        is: false,
        then: (s) => s.required(t('edit.required')),
      }),
    endDate: yup
      .string()
      .required(t('edit.required'))
      .test('after-start', t('edit.endAfterStart'), function (v) {
        const { startDate } = this.parent as { startDate: string };
        return !v || !startDate || v >= startDate;
      }),
    endTime: yup
      .string()
      .defined()
      .when('allDay', {
        is: false,
        then: (s) => s.required(t('edit.required')),
      })
      .test('after-start', t('edit.endAfterStart'), function (v) {
        const p = this.parent as {
          allDay: boolean;
          startDate: string;
          endDate: string;
          startTime: string;
        };
        if (p.allDay || p.startDate !== p.endDate) return true;
        return !v || !p.startTime || v > p.startTime;
      }),
    location: yup.string().defined().max(500, t('edit.tooLong')),
    description: yup.string().defined().max(4000, t('edit.tooLong')),
  });

const makeTaskSchema = (t: TFunction) =>
  yup.object({
    title: yup
      .string()
      .trim()
      .required(t('edit.required'))
      .max(300, t('edit.tooLong')),
    due: yup.string().defined(),
    notes: yup.string().defined().max(4000, t('edit.tooLong')),
  });

type EventForm = yup.InferType<ReturnType<typeof makeEventSchema>>;
type TaskForm = yup.InferType<ReturnType<typeof makeTaskSchema>>;

/** Native date/time pickers in the dark palette. */
const fieldSx = { '& input': { colorScheme: 'dark' } } as const;

interface ActionEditPopupProps {
  isVisible: boolean;
  onClose: () => void;
  /** Confirms the action with the edited arguments. */
  onSubmit: (args: Record<string, unknown>) => void;
  event?: EventArgs | null;
  task?: TaskArgs | null;
}

/**
 * "Edit" on a confirmation card: change what the assistant proposed, then
 * confirm in one step. The backend validates the edited arguments again.
 */
export function ActionEditPopup({
  isVisible,
  onClose,
  onSubmit,
  event,
  task,
}: ActionEditPopupProps) {
  const { t } = useTranslation();
  return (
    <BasePopup isVisible={isVisible} onClose={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-edit-title"
        sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <Box
          component="h2"
          id="action-edit-title"
          sx={{
            m: 0,
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '26px',
            letterSpacing: '-0.45px',
            color: colors.textStrong,
          }}
        >
          {t('edit.title')}
        </Box>
        {event && (
          <EventEditForm args={event} onCancel={onClose} onSubmit={onSubmit} />
        )}
        {task && (
          <TaskEditForm args={task} onCancel={onClose} onSubmit={onSubmit} />
        )}
      </Box>
    </BasePopup>
  );
}

function Actions({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
      <Button variant="outlined" onClick={onCancel}>
        {t('edit.cancel')}
      </Button>
      <Button variant="contained" type="submit">
        {t('edit.save')}
      </Button>
    </Box>
  );
}

function EventEditForm({
  args,
  onCancel,
  onSubmit,
}: {
  args: EventArgs;
  onCancel: () => void;
  onSubmit: (args: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => makeEventSchema(t), [t]);
  const [startDate, startTime = ''] = args.start.split('T');
  const [endDate, endTime = ''] = args.end.split('T');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: args.title,
      allDay: isAllDay(args),
      startDate,
      startTime,
      endDate,
      endTime,
      location: args.location ?? '',
      description: args.description ?? '',
    },
  });
  const allDay = useWatch({ control, name: 'allDay' });

  const submit = handleSubmit((v) =>
    onSubmit({
      title: v.title,
      start: v.allDay ? v.startDate : `${v.startDate}T${v.startTime}`,
      end: v.allDay ? v.endDate : `${v.endDate}T${v.endTime}`,
      // The backend schema is strict: leave out empty optional fields.
      ...(v.location.trim() ? { location: v.location.trim() } : {}),
      ...(v.description.trim() ? { description: v.description.trim() } : {}),
    }),
  );

  return (
    <Box
      component="form"
      noValidate
      onSubmit={submit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <TextField
        label={t('field.title')}
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
        autoFocus
        fullWidth
        size="small"
      />
      <Controller
        name="allDay"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            label={t('field.allDay')}
            control={
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
          />
        )}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: allDay ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          },
          gap: 2,
        }}
      >
        <TextField
          type="date"
          label={t('field.startDate')}
          {...register('startDate')}
          error={!!errors.startDate}
          helperText={errors.startDate?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={fieldSx}
        />
        {!allDay && (
          <TextField
            type="time"
            label={t('field.startTime')}
            {...register('startTime')}
            error={!!errors.startTime}
            helperText={errors.startTime?.message}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={fieldSx}
          />
        )}
        <TextField
          type="date"
          label={t('field.endDate')}
          {...register('endDate')}
          error={!!errors.endDate}
          helperText={errors.endDate?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={fieldSx}
        />
        {!allDay && (
          <TextField
            type="time"
            label={t('field.endTime')}
            {...register('endTime')}
            error={!!errors.endTime}
            helperText={errors.endTime?.message}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={fieldSx}
          />
        )}
      </Box>
      <TextField
        label={t('field.location')}
        {...register('location')}
        error={!!errors.location}
        helperText={errors.location?.message}
        fullWidth
        size="small"
      />
      <TextField
        label={t('field.description')}
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        size="small"
      />
      <Actions onCancel={onCancel} />
    </Box>
  );
}

function TaskEditForm({
  args,
  onCancel,
  onSubmit,
}: {
  args: TaskArgs;
  onCancel: () => void;
  onSubmit: (args: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => makeTaskSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: args.title,
      due: args.due ?? '',
      notes: args.notes ?? '',
    },
  });

  const submit = handleSubmit((v) =>
    onSubmit({
      title: v.title,
      ...(v.due ? { due: v.due } : {}),
      ...(v.notes.trim() ? { notes: v.notes.trim() } : {}),
    }),
  );

  return (
    <Box
      component="form"
      noValidate
      onSubmit={submit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <TextField
        label={t('field.title')}
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
        autoFocus
        fullWidth
        size="small"
      />
      <TextField
        type="date"
        label={t('field.due')}
        {...register('due')}
        slotProps={{ inputLabel: { shrink: true } }}
        size="small"
        sx={fieldSx}
      />
      <TextField
        label={t('field.notes')}
        {...register('notes')}
        error={!!errors.notes}
        helperText={errors.notes?.message}
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        size="small"
      />
      <Actions onCancel={onCancel} />
    </Box>
  );
}
