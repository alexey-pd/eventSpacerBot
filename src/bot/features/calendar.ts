import type { Context } from '#root/bot/context.js'
import { getChatCalendarUrl, setChatCalendarUrl } from '#root/bot/features/events/index.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { kv } from '@vercel/kv'
import { Composer } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType(['channel', 'group', 'supergroup'])

const replyConfig = { protect_content: true }

feature.command('calendar', logHandle('command-calendar-add'), async (ctx) => {
  const url = ctx.match?.trim()
  if (!url)
    return ctx.reply('/calendar ics public url', replyConfig)
  const chatId = ctx.chat?.id
  if (!chatId)
    return ctx.reply('chatId is empty', replyConfig)

  await setChatCalendarUrl(chatId, url)

  return ctx.reply('Calendar added!')
})

feature.command('check', logHandle('command-calendar-check'), async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId)
    return ctx.reply('chatId is empty')

  const url = await getChatCalendarUrl(chatId)

  if (!url)
    return ctx.reply('/calendar ics public url', replyConfig)

  return ctx.reply(url, replyConfig)
})

feature.command('remove', logHandle('command-calendar-remove'), async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId)
    return ctx.reply('chatId is empty')

  await kv.del(`${chatId}`)

  return ctx.reply('Calendar removed', replyConfig)
})

export { composer as calendarFeature }
