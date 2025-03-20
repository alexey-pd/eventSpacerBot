import type { Context } from '#root/bot/context.js'
import {
  fetchEvents,
  filterEventsByWeek,
  filterToday,
  formatEvents,
} from '#root/bot/features/events/data.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { creatEventPeriodKeyboard } from '#root/bot/keyboards/event-period.js'
import { kv } from '@vercel/kv'
import { Composer } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType(['channel', 'group', 'supergroup'])

export async function getChatCalendarUrl(chatId: number | string) {
  return kv.get<string>(`${chatId}`)
}

export async function setChatCalendarUrl(chatId: number | string, url: string) {
  return kv.set<string>(`${chatId}`, url)
}

export async function readEvents(chatId: number | string) {
  const url = await getChatCalendarUrl(chatId)
  if (!url)
    return []
  return fetchEvents(url)
}

feature.command('events', logHandle('command-events'), async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId)
    return ctx.reply('chatId is empty')

  const url = await getChatCalendarUrl(chatId)

  if (!url)
    return ctx.reply('/calendar ics public url')

  return ctx.reply('Choose an option:', { reply_markup: creatEventPeriodKeyboard() })
})

feature.callbackQuery('today', async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId)
    return ctx.reply('chatId is empty')

  const events = await readEvents(ctx.chat.id)
  await ctx.editMessageText(formatEvents(filterToday(events)), { parse_mode: 'Markdown' })
})

feature.callbackQuery(/^week_(-?\d+)$/, async (ctx) => {
  const offset = Number.parseInt(ctx.match[1], 10)
  const events = await readEvents(ctx.chat.id)
  await ctx.editMessageText(formatEvents(filterEventsByWeek(events, offset)), { parse_mode: 'Markdown' })
})

export { composer as eventsFeature }
