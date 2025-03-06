import process from 'node:process'
import { createBot } from '#root/bot/index.js'
import { convertKeysToCamelCase, createConfig } from '#root/config.js'
import { logger } from '#root/logger.js'
import { createServer } from '#root/server/index.js'
import { handle } from '@hono/node-server/vercel'

// @ts-expect-error create config from environment variables
const config = createConfig(convertKeysToCamelCase(process.env))

const bot = createBot(config.botToken, {
  config,
  logger,
})
const server = createServer({
  bot,
  config,
  logger,
})

export default handle(server)
