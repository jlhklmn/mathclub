// Variables
const datasheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wvFOZrr6GlwL0Oj2XFJMqcW6Etrv49zRahvD4WN5kI1ZQVTnUZp2lizrJHICoXOIknJNy48LMA5g/pub?gid=217443822&single=true&output=csv"
const upcoming_events = document.querySelector("#upcoming-events")

const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
]

// Methods
async function fetchCsvToJson(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    
    const csvText = await response.text()
    
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',')

    const jsonData = lines.slice(1).map(line => {
      const values = line.split(',')
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header.trim()] = values[idx].trim()
      })
      return obj
    })

    jsonData.sort((a, b) => a["date_epoch"] - b["date_epoch"])
    console.log(jsonData)

    jsonData.forEach((event) => {
        const div = document.createElement("div")
        const span = document.createElement("span")
        const h1 = document.createElement("h1")
        const p = document.createElement("p")
        const h3 = document.createElement("h3")
        const date = document.createElement("span")
        const month = document.createElement("h1")
        const day = document.createElement("h1")

        date.setAttribute("id", "date")
        month.setAttribute("id", "month")

        span.appendChild(h1)
        span.appendChild(p)
        span.appendChild(h3)
        date.appendChild(month)
        date.appendChild(day)
        div.appendChild(date)
        div.appendChild(span)

        s = false
        event["Event Title"].split("").forEach((char) => {
            if (("abcdefghijklmnopqrstuvwxyz 0123456789").indexOf(char.toLowerCase()) == -1 && (s == false)) {
                h1.style.transform = "translateY(-3px)"
                s = true
            }
        })
        
        h1.textContent = event["Event Title"].toUpperCase()
        
        if (event["Event Description"] == "") {
            p.style.display = "none"
        } else {
            p.textContent = event["Event Description"]
        }
        
        
        const dateObject = new Date(Number(event["date_epoch"]))
        
        month.textContent = months[dateObject.getUTCMonth()]
        day.textContent = dateObject.getUTCDate()

        upcoming_events.appendChild(div)

        function updateTime() {
            var time_left = event["date_epoch"] - Date.now() + (((new Date()).getTimezoneOffset()/60) * 3600000)

            if (time_left < -3600000 * event["How long does the event last"] || (event["scheduled_epoch"] != -1 && event["scheduled_epoch"] - Date.now() <= 0)) {
                div.style.display = "none"
            } else if (time_left < 1) {
                h3.textContent = "Event currently ongoing"
                h3.style.color = "var(--text-color)"
                date.style.backgroundColor = "var(--subaccent-color)"
            } else {
                time_left /= 1000
                const d = Math.floor(time_left/60/60/24)
                time_left -= d*60*60*24
                const h = Math.floor(time_left/60/60)
                time_left -= h*60*60
                const m = Math.floor(time_left/60)
                time_left -= m*60
                const s = Math.floor(time_left)
                
                if (d > 0) {
                    h3.textContent = `Starting in ${d}d ${h}h ${m}m`
                } else if (h > 0) {
                    h3.textContent = `Starting in ${h}h ${m}m`
                } else if (m > 0) {
                    h3.textContent = `Starting in ${m}m ${s}s`
                } else {
                    h3.textContent = `Starting in ${s}s`
                }
            }

            if (document.querySelectorAll("#upcoming-events > div:not([style*=\"display: none\"])").length > 0) {
                document.querySelector("#none").style.display = "none"
            } else {
                document.querySelector("#none").style.display = "block"
            }
        }

        updateTime()
        setInterval(updateTime, 1000)
    })

    return jsonData
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

// Init
fetchCsvToJson(datasheet)