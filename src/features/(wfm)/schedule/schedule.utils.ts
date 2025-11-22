import { RRule } from 'rrule'

/**
 * Combina uma data com um horário (HH:mm) e retorna um Date
 */
export function combineDateAndTime(dateStr: string, timeStr: string, _timezone?: string): Date {
  // Validar formato de data (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD')
  }

  // Validar formato de horário (HH:mm)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(timeStr)) {
    throw new Error('Invalid time format. Expected HH:mm (e.g., "10:30")')
  }

  const [hours, minutes] = timeStr.split(':').map(Number)
  const [year, month, day] = dateStr.split('-').map(Number)

  // Criar data no timezone especificado ou UTC
  const date = new Date()
  date.setFullYear(year, month - 1, day)
  date.setHours(hours, minutes, 0, 0)

  return date
}

/**
 * Valida e processa os dados de entrada para criar um agendamento
 * startTime e endTime sempre são no formato HH:mm
 * date é obrigatório e define a data base do agendamento
 */
export function processScheduleTimes(
  date: string,
  startTime: string,
  endTime: string,
  _rrule?: string
): { start: Date; end: Date } {
  // Sempre usar date + startTime/endTime (horários no formato HH:mm)
  if (!date) {
    throw new Error('date is required')
  }

  const start = combineDateAndTime(date, startTime)
  const end = combineDateAndTime(date, endTime)

  if (start >= end) {
    throw new Error('Start time must be before end time')
  }

  return { start, end }
}

/**
 * Gera ocorrências de agendamento a partir de um rrule
 */
export async function generateOccurrences(
  _scheduleId: string,
  startTime: Date,
  endTime: Date,
  rrule?: string,
  _timezone?: string,
  maxOccurrences = 365 // Limite padrão de 1 ano
): Promise<{ startTime: Date; endTime: Date }[]> {
  if (!rrule) {
    // Se não há rrule, retorna apenas a ocorrência inicial
    return [{ startTime, endTime }]
  }

  try {
    // Parse do rrule
    const rule = RRule.fromString(rrule)

    // Calcular o intervalo de tempo do evento
    const duration = endTime.getTime() - startTime.getTime()

    // Gerar ocorrências futuras (até 1 ano ou limite definido)
    const limitDate = new Date()
    limitDate.setFullYear(limitDate.getFullYear() + 1)

    // Obter todas as ocorrências e limitar manualmente
    const allOccurrences = rule.between(startTime, limitDate, true)
    const occurrenceDates = allOccurrences.slice(0, maxOccurrences)

    // Gerar ocorrências com os horários corretos
    return occurrenceDates.map((date) => {
      const occurrenceStart = new Date(date)
      const occurrenceEnd = new Date(date.getTime() + duration)
      return {
        startTime: occurrenceStart,
        endTime: occurrenceEnd,
      }
    })
  } catch (error) {
    throw new Error(
      `Invalid rrule format: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Verifica se há conflito entre dois intervalos de tempo
 */
function hasTimeConflict(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  // Conflito se: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1
}

/**
 * Verifica conflitos com agendamentos existentes no mesmo espaço
 */
export async function checkScheduleConflicts(
  spaceId: string,
  startTime: Date,
  endTime: Date,
  rrule?: string,
  timezone?: string,
  excludeScheduleId?: string, // Para atualizações, excluir o próprio agendamento
  maxOccurrences = 365
): Promise<{ hasConflict: boolean; conflictingSchedules: any[] }> {
  const { db } = await import('@/plugins/prisma')

  // Gerar todas as ocorrências do novo agendamento
  const newOccurrences = await generateOccurrences(
    '', // Não precisa do scheduleId para apenas gerar ocorrências
    startTime,
    endTime,
    rrule,
    timezone,
    maxOccurrences
  )

  // Buscar todos os agendamentos ativos no mesmo espaço
  const existingSchedules = await db.schedule.findMany({
    where: {
      spaceId,
      status: {
        in: ['PENDING', 'CONFIRMED'], // Apenas agendamentos ativos
      },
      ...(excludeScheduleId ? { id: { not: excludeScheduleId } } : {}),
    },
    include: {
      occurrences: {
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      },
    },
  })

  const conflicts: any[] = []

  // Gerar ocorrências de todos os agendamentos existentes com rrule
  const existingOccurrencesMap = new Map<string, { startTime: Date; endTime: Date }[]>()

  for (const existingSchedule of existingSchedules) {
    if (existingSchedule.rrule) {
      // Gerar ocorrências do agendamento existente com rrule
      const existingOccurrences = await generateOccurrences(
        existingSchedule.id,
        existingSchedule.startTime,
        existingSchedule.endTime,
        existingSchedule.rrule,
        existingSchedule.timezone || undefined,
        maxOccurrences
      )
      existingOccurrencesMap.set(existingSchedule.id, existingOccurrences)
    }
  }

  // Verificar conflitos para cada ocorrência do novo agendamento
  for (const newOccurrence of newOccurrences) {
    for (const existingSchedule of existingSchedules) {
      if (!existingSchedule.rrule) {
        // Agendamento único - verificar conflito direto
        if (
          hasTimeConflict(
            newOccurrence.startTime,
            newOccurrence.endTime,
            existingSchedule.startTime,
            existingSchedule.endTime
          )
        ) {
          conflicts.push({
            scheduleId: existingSchedule.id,
            scheduleTitle: existingSchedule.title,
            conflictingStartTime: existingSchedule.startTime,
            conflictingEndTime: existingSchedule.endTime,
            newOccurrenceStartTime: newOccurrence.startTime,
            newOccurrenceEndTime: newOccurrence.endTime,
          })
        }
      } else {
        // Agendamento com rrule - verificar conflitos com todas as ocorrências geradas
        const existingOccurrences = existingOccurrencesMap.get(existingSchedule.id) || []
        for (const existingOccurrence of existingOccurrences) {
          if (
            hasTimeConflict(
              newOccurrence.startTime,
              newOccurrence.endTime,
              existingOccurrence.startTime,
              existingOccurrence.endTime
            )
          ) {
            conflicts.push({
              scheduleId: existingSchedule.id,
              scheduleTitle: existingSchedule.title,
              conflictingStartTime: existingOccurrence.startTime,
              conflictingEndTime: existingOccurrence.endTime,
              newOccurrenceStartTime: newOccurrence.startTime,
              newOccurrenceEndTime: newOccurrence.endTime,
            })
          }
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictingSchedules: conflicts,
  }
}

/**
 * Valida se o horário do agendamento está dentro do range permitido do Space
 */
export async function validateSpaceTimeRange(
  spaceId: string,
  startTime: Date,
  endTime: Date,
  rrule?: string
): Promise<{ isValid: boolean; error?: string }> {
  const { db } = await import('@/plugins/prisma')

  // Buscar o Space com os horários mínimos
  const space = await db.space.findUnique({
    where: { id: spaceId },
    select: {
      id: true,
      name: true,
      minStartTime: true,
      minEndTime: true,
    },
  })

  if (!space) {
    return {
      isValid: false,
      error: 'Space not found',
    }
  }

  // Se não há horários mínimos configurados, permitir qualquer horário
  if (!space.minStartTime || !space.minEndTime) {
    return { isValid: true }
  }

  // Converter horários mínimos para minutos do dia (0-1439)
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minStartMinutes = parseTimeToMinutes(space.minStartTime)
  const minEndMinutes = parseTimeToMinutes(space.minEndTime)

  // Se há rrule, validar todas as ocorrências geradas
  if (rrule) {
    const occurrences = await generateOccurrences('', startTime, endTime, rrule, undefined, 365)

    for (const occurrence of occurrences) {
      const occurrenceStartMinutes =
        occurrence.startTime.getHours() * 60 + occurrence.startTime.getMinutes()
      const occurrenceEndMinutes =
        occurrence.endTime.getHours() * 60 + occurrence.endTime.getMinutes()

      // Verificar se o início está antes do horário mínimo de abertura
      if (occurrenceStartMinutes < minStartMinutes) {
        return {
          isValid: false,
          error: `O horário de início (${occurrence.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}) está antes do horário mínimo de abertura do espaço (${space.minStartTime})`,
        }
      }

      // Verificar se o fim está depois do horário mínimo de fechamento
      if (occurrenceEndMinutes > minEndMinutes) {
        return {
          isValid: false,
          error: `O horário de fim (${occurrence.endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}) está depois do horário mínimo de fechamento do espaço (${space.minEndTime})`,
        }
      }
    }
  } else {
    // Agendamento único - validar apenas o horário fornecido
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()

    // Verificar se o início está antes do horário mínimo de abertura
    if (startMinutes < minStartMinutes) {
      return {
        isValid: false,
        error: `O horário de início (${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}) está antes do horário mínimo de abertura do espaço (${space.minStartTime})`,
      }
    }

    // Verificar se o fim está depois do horário mínimo de fechamento
    if (endMinutes > minEndMinutes) {
      return {
        isValid: false,
        error: `O horário de fim (${endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}) está depois do horário mínimo de fechamento do espaço (${space.minEndTime})`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Cria ocorrências de agendamento no banco de dados
 */
export async function createScheduleOccurrences(
  scheduleId: string,
  occurrences: { startTime: Date; endTime: Date }[],
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING'
): Promise<void> {
  const { db } = await import('@/plugins/prisma')

  await db.scheduleOccurrence.createMany({
    data: occurrences.map((occ) => ({
      scheduleId,
      startTime: occ.startTime,
      endTime: occ.endTime,
      status,
    })),
  })
}
