import ICAL from "https://esm.sh/ical.js"

/**
 * Fetches and parses an ICS file, returning a list of VEVENTS.
 * @param {string} icsUrl - URL to the ICS file
 * @returns {Promise<object[]>} - Parsed event objects
 */
async function fetchICSEvents(icsUrl) {
  try {
    const response = await fetch(icsUrl)
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)

    const icsText = await response.text()

    const jcalData = ICAL.parse(icsText)
    const vcalendar = new ICAL.Component(jcalData)
    const vevents = vcalendar.getAllSubcomponents('vevent')

    return vevents.map(evt => {
      const event = new ICAL.Event(evt)
      return {
        summary: event.summary,
        location: event.location,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        description: event.description
      }
    })
  } catch (error) {
    console.error('Failed to fetch or parse ICS:', error)
    return []
  }



/**
 * Fetches an ICS calendar file and converts events to YAML-style objects.
 * @param {string} icsUrl - The URL to the ICS file
 * @returns {Promise<object[]>} - Events formatted as YAML-friendly objects
 */
async function getEventsAsYAML(icsUrl) {
  try {
    const response = await fetch(icsUrl)
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)

    const icsText = await response.text()
    const jcalData = ICAL.parse(icsText)
    const vcalendar = new ICAL.Component(jcalData)
    const vevents = vcalendar.getAllSubcomponents('vevent')

    return vevents.map(evt => {
      const event = new ICAL.Event(evt)
      const start = event.startDate.toJSDate()

      return {
        title: event.summary || 'Untitled Event',
        date: start.toISOString().split('T')[0],
        time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.endDate.toJSDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        location: event.location || 'TBA',
        description: event.description || '',
        image: '/api/placeholder/400/300',
        link: '#event-' + (event.summary?.toLowerCase().replace(/\s+/g, '-') || 'untitled')
      }
    })
  } catch (err) {
    console.error('Failed to load calendar:', err)
    return []
  }
}

// Usage example
getEventsAsYAML('https://example.com/events.ics').then(events => {
  console.log(events)
})  

// Example usage
const calendarUrl = 'https://corsproxy.io/?url=https://www.huroncounty.ca/venue/crediton-community-centre-38-victoria-ave-e-crediton-ontario-n0m-1m0-canada/?outlook-ical=1'
fetchICSEvents(calendarUrl).then(events => {
  console.log('Events:', events)
})
