// Variables
const datasheet1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wvFOZrr6GlwL0Oj2XFJMqcW6Etrv49zRahvD4WN5kI1ZQVTnUZp2lizrJHICoXOIknJNy48LMA5g/pub?gid=1765849236&single=true&output=csv"
const datasheet2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wvFOZrr6GlwL0Oj2XFJMqcW6Etrv49zRahvD4WN5kI1ZQVTnUZp2lizrJHICoXOIknJNy48LMA5g/pub?gid=2007875009&single=true&output=csv"

var display = 0
var max = 0
const ui = []

const months = [
    "January",
    "Febuary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

function mm(epoch) {
  const d = new Date(Number(epoch))
  return `${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
}

function ww(epoch) {
  const d = new Date(Number(epoch))
  const s = d.getUTCDate()-d.getUTCDay()
  
  return `${s}${s==1&&"st"||s==2&&"nd"||s==3&&"rd"||"th"} of ${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
}

// Methods
document.querySelector("#weekly").style.display = "none"

document.querySelector("#datedisplayleaderboard").addEventListener("click", () => {
  display ++
  if (display > max) {display = 0}

  upd()
  console.log("Display; " + String(display))
})

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

    jsonData.sort((a, b) => b["Timestamp"] - a["Timestamp"])
    console.log(jsonData)

    const qimg = (jsonData[jsonData.length-1]["Weekly Question"]).split("id=")
    document.querySelector("#qimg").style.backgroundImage = `url(https://lh3.googleusercontent.com/d/${qimg[1]})`

    const author = jsonData[jsonData.length-1]["Author Name"]
    document.querySelector("#displayname").textContent = `Question designed by ${author == "" && jsonData[jsonData.length-1]["Email Address"].split("@")[0] || author}`

    document.querySelector("#qdate").textContent = "Current Week: "+ww(jsonData[jsonData.length-1]["timestamp_epoch"])

    // ==================
    const qData = jsonData

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

        jsonData.sort((a, b) => a["timestamp_epoch"] - b["timestamp_epoch"])

        // ==================
        var _dd = []
        var datedata = []
        var userdata = {}
        var scoredata = {}
        var answ = {}

        qData.forEach((v) => {
          _dd.push(v["timestamp_epoch"])
        })

        _dd.sort((a, b) => {a, b})

        _dd.forEach((t) => {
          if (! datedata.includes(mm(t))) {datedata.push(mm(t))}
        })

        qData.forEach((t) => {
          answ[ww(t["timestamp_epoch"])] = t
        })

        jsonData.forEach((v) => {
          if (!scoredata[mm(v["timestamp_epoch"])]) {scoredata[mm(v["timestamp_epoch"])] = {}}
          if (!scoredata[mm(v["timestamp_epoch"])][v["Email Address"]]) {scoredata[mm(v["timestamp_epoch"])][v["Email Address"]] = 0}

          if (!userdata[v["Email Address"]]) {userdata[v["Email Address"]] = {
            "streak": 0,
            "display": v["Email Address"].split("@")[0],
            "submitted": []
          }}

          if (v["Display Name (Keep this appropriate)"] != "") {
            userdata[v["Email Address"]]["display"] = v["Display Name (Keep this appropriate)"]
          }
          
          if (! userdata[v["Email Address"]]["submitted"].includes(ww(v["timestamp_epoch"]))) {
            const i = datedata.findIndex(t => ww(v["timestamp_epoch"]) == t)
            
            if (i >= 0) {
              if (!scoredata[datedata[i-1]]) {
                if (!scoredata[datedata[i-1]][v["Email Address"]]) {
                  userdata[v["Email Address"]]["streak"] = 0
                  console.log(v["Email Address"]+" Streak Reset")
                }
              }
            }

            if (answ[ww(v["timestamp_epoch"])]) {
              if (Number(v["Final Answer"]) == Number(answ[ww(v["timestamp_epoch"])]["Correct Answer"])) {
                scoredata[mm(v["timestamp_epoch"])][v["Email Address"]] += 50
                userdata[v["Email Address"]]["streak"] ++
              } else {
                userdata[v["Email Address"]]["streak"] = 0
              }
            } else {
              console.log(ww(v["timestamp_epoch"])+"; No answer provided")
            }

            userdata[v["Email Address"]]["submitted"].push(ww(v["timestamp_epoch"]))
          }
        })

        for (const [key, data] of Object.entries(scoredata)) {
          scoredata[key] = Object.fromEntries(Object.entries(data).sort(([, a], [, b]) => {a - b}))
        }

        console.log(userdata)
        console.log(scoredata)

        // ==================
        max = Object.keys(scoredata).length - 1
        
        const date = document.querySelector("#datedisplayleaderboard")
        const competitve = document.querySelector("#competitive")
        display = max

        const dd = new Date()
        const rn = months[dd.getUTCMonth()]+", "+dd.getUTCFullYear()

        date.textContent = rn

        for (const [epoch, users] of Object.entries(scoredata)) {
          const base = document.createElement("div")
          competitve.appendChild(base)

          p = 0
          document.querySelector("#placeholderdiv").style.display = "none"

          for (const [email, score] of Object.entries(users)) {
            p ++

            const span = document.createElement("div")
            const name = document.createElement("h3")
            const s = document.createElement("h3")
            const streak = document.createElement("h1")
            const place = document.createElement("h2")

            s.setAttribute("id", "score")

            name.textContent = userdata[email]["display"]
            s.textContent = String(score) + " Points"
            streak.textContent = userdata[email]["streak"]
            place.textContent = p+". "

            mmmmmmm = false
            userdata[email]["display"].split("").forEach((char) => {
                if (("abcdefghijklmnopqrstuvwxyz 0123456789").indexOf(char.toLowerCase()) == -1 && (mmmmmmm == false)) {
                    name.style.transform = "translateY(-2px)"
                    mmmmmmm = true
                }
            })

            streak.style.display = (userdata[email]["streak"] == 1 || rn != epoch) && "none" || "inline"
            
            span.appendChild(place)
            span.appendChild(streak)
            span.appendChild(name)
            span.appendChild(s)
            base.appendChild(span)
          }

          ui.push([epoch, base])
        }

        upd()

        // ==================
        document.querySelector("#weekly").style.display = "flex"
        document.querySelector("#none").style.display = "none"
        console.log("Loaded visuals")

        return jsonData
      } catch (error) {
        console.error('Error processing data:', error)
      }
    }

    // ==================
    fetchCsvToJson(datasheet2)

    return jsonData
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

function upd() {
  const date = document.querySelector("#datedisplayleaderboard")
  
  for (i = 0; i < ui.length; i++) {
    if (i == display) {date.textContent = ui[i][0]}
    ui[i][1].style.display = i == display && "block" || "none"
  }
}

// Init
fetchCsvToJson(datasheet1)