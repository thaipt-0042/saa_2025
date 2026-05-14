export function isPrelaunchMode(): boolean {
  const override = process.env.NEXT_PUBLIC_PRELAUNCH_MODE
  if (override === 'true') return true
  if (override === 'false') return false

  const eventDatetime = process.env.NEXT_PUBLIC_EVENT_DATETIME
  if (!eventDatetime) return false

  const target = new Date(eventDatetime)
  if (isNaN(target.getTime())) return false

  return new Date() < target
}
