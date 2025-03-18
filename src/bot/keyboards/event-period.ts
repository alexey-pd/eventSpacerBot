import { InlineKeyboard } from 'grammy'

export function creatEventPeriodKeyboard() {
  return new InlineKeyboard()
    .text('Upcoming', 'week_0')
    .row()
    .text('Past', 'week_-1')
    .row()
    .text('Today', 'today')
}
