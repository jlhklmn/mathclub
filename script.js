const upcoming_events = document.querySelector("#upcoming-events")

const data = fetch("data.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Fetch response failed")
        }

        return response.json()
    })
    .then((data) => {
        data["events"].forEach((event) => {
            const div = document.createElement("div")
            const span = document.createElement("span")
            const h1 = document.createElement("h1")
            const p = document.createElement("p")
            const h3 = document.createElement("h3")

            div.appendChild(span)
            span.appendChild(h1)
            span.appendChild(p)
            div.appendChild(span)
            div.appendChild(h3)
            
            h1.textContent = event["title"]
            p.textContent = event["description"]

            upcoming_events.appendChild(div)
            
            function updateTime() {
                var time_left = event["date"] - Date.now()

                if (time_left < -216000000) {
                    div.style.display = "none"
                } else if (time_left < 1) {
                    h3.textContent = "Event has started!"
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
            }

            updateTime()
            setInterval(updateTime, 1000)
        })
    })
    .catch((error) => {
        console.error("Fetch Error: ", error)
    })