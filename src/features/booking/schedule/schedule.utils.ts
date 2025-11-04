import { RRule } from 'rrule'

/**
 * Gera ocorrências de agendamento a partir de um rrule
 */
export async function generateOccurrences(
  scheduleId: string,
  startTime: Date,
  endTime: Date,
  rrule?: string,
  timezone?: string,
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
    throw new Error(`Invalid rrule format: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verifica se há conflito entre dois intervalos de tempo
 */
function hasTimeConflict(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
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

