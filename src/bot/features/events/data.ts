import type { VEvent } from 'node-ical'
import axios from 'axios'
import iCal from 'node-ical'

export async function fetchEvents(url: string): Promise<VEvent[]> {
  try {
    const { data } = await axios.get(url)
    const events = iCal.parseICS(data)
    return Object.values(events).filter(e => e.type === 'VEVENT') as VEvent[]
  }
  catch (error) {
    console.error('Error fetching ICS:', error)
    return []
  }
}

export function formatDate(date: Date): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return `${dayNames[date.getDay()]}, ${date.toISOString().split('T')[0].split('-').reverse().join('.')}`
}

export function filterToday(events?: VEvent[]): VEvent[] {
  const today = formatDate(new Date())
  return events?.filter(event => formatDate(event.start) === today) || []
}

export function filterEventsByWeek(events?: VEvent[], offset: number = 0): VEvent[] {
  if (!(events && offset)) { /* empty */ }
  const now = new Date()
  now.setDate(now.getDate() + offset * 7)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7))

  return events?.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate >= startOfWeek && eventDate <= endOfWeek
  }).sort((a, b) => a.start.getTime() - b.start.getTime()) || []
}

function formatTime(date: Date, short: boolean = false) {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: undefined,
    hour12: true,
  }
  const time = date.toLocaleTimeString('en-US', options)
  return short ? time.replace(/ (AM|PM)$/, '') : time
}

export function formatEvents(events: VEvent[]): string {
  if (events.length === 0)
    return 'No events scheduled.'

  const groupedEvents = events.reduce<Record<string, string[]>>((acc, event) => {
    const date = formatDate(event.start)
    const startTime = formatTime(event.start, true)
    const endTime = formatTime(event.end)
    const timeRange = `${startTime}–${endTime}`
    const eventDetails = `${timeRange} *${event.summary}*`

    if (!acc[date]) {
      acc[date] = []
    }

    acc[date].push(eventDetails)

    return acc
  }, {})

  return Object.entries(groupedEvents)
    .map(([date, events]) => `*${date}*\n${events.join('\n')}`)
    .join('\n\n')
}
