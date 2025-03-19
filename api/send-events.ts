import process from 'node:process'
import { filterToday, formatEvents } from '#root/bot/features/events/data.js'
import { readEvents } from '#root/bot/features/events/index.js'
import { createBot } from '#root/bot/index.js'
import { convertKeysToCamelCase, createConfig } from '#root/config.js'
import { logger } from '#root/logger.js'
import { kv } from '@vercel/kv'

// @ts-expect-error create config from environment variables
const config = createConfig(convertKeysToCamelCase(process.env))

const bot = createBot(config.botToken, {
  config,
  logger,
})

export default async function handler(req: Request) {
  if (req.method !== 'GET')
    return new Response('Method Not Allowed', { status: 405 })

  const keys = await kv.keys('*')
  if (!keys.length)
    return

  for (const chatId of keys) {
    const events = await readEvents(chatId)
    const todayEvents = formatEvents(filterToday(events))
    if (!todayEvents)
      continue

    await bot.api.sendMessage(chatId, todayEvents, { parse_mode: 'Markdown' })
  }

  return new Response('Events sent successfully.', { status: 200 })
}
