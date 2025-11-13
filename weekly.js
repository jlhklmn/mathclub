// Variables
const datasheet1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wvFOZrr6GlwL0Oj2XFJMqcW6Etrv49zRahvD4WN5kI1ZQVTnUZp2lizrJHICoXOIknJNy48LMA5g/pub?gid=1765849236&single=true&output=csv"
const datasheet2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wvFOZrr6GlwL0Oj2XFJMqcW6Etrv49zRahvD4WN5kI1ZQVTnUZp2lizrJHICoXOIknJNy48LMA5g/pub?gid=2007875009&single=true&output=csv"

var display = 0
var max = 0
var qnum = 1
const ui = []

const dcolors = [
  "#365b27",
  "#565b27ff",
  "#5b4927ff",
  "#5b2727ff"
]

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

document.querySelector("#weekly").style.display = "none"

// Methods
function tv(value) {
  value = String(value).replace(/\s+/g, '')

  if (!Number(value)) {
    return String(value).toLowerCase()
  } else {
    String(Math.round(Number(value) * 1000) / 1000)
  }
}

function mm(epoch) {
  const d = new Date(Number(epoch))
  return `${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
}

function ww(epoch) {
  const d = new Date(Number(epoch))
  var s = d.getUTCDate() - d.getUTCDay()

  if (s < 0) {
    s = 1
  }

  return `${s}${s == 1 && "st" || s == 2 && "nd" || s == 3 && "rd" || "th"} of ${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
}

function cma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.querySelector("#datedisplayleaderboard").addEventListener("click", () => {
  display--
  if (display < 0) { display = max }

  upd()
  console.log("Display; " + String(display))
})

document.querySelector("#q1").addEventListener("click", () => {
  qnum = 1
  qupd()
})
document.querySelector("#q2").addEventListener("click", () => {
  qnum = 2
  qupd()
})
document.querySelector("#q3").addEventListener("click", () => {
  qnum = 3
  qupd()
})
document.querySelector("#q4").addEventListener("click", () => {
  qnum = 4
  qupd()
})
document.querySelector("#q5").addEventListener("click", () => {
  qnum = 5
  qupd()
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

    jlhklmn = jsonData

    qupd()

    const author = jsonData[jsonData.length - 1]["Author Name"]
    document.querySelector("#displayname").textContent = `Questions uploaded by ${author == "" && jsonData[jsonData.length - 1]["Email Address"].split("@")[0] || author}`

    document.querySelector("#qdate").textContent = "Last Updated: " + ww(jsonData[jsonData.length - 1]["timestamp_epoch"])

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

        _dd.sort((a, b) => { a, b })

        _dd.forEach((t) => {
          if (!datedata.includes(mm(t))) { datedata.push(mm(t)) }
        })

        qData.forEach((t) => {
          answ[ww(t["timestamp_epoch"])] = t
        })

        jsonData.forEach((v) => {
          if (!scoredata[mm(v["timestamp_epoch"])]) { scoredata[mm(v["timestamp_epoch"])] = {} }
          if (!scoredata[mm(v["timestamp_epoch"])][v["Email Address"]]) { scoredata[mm(v["timestamp_epoch"])][v["Email Address"]] = 0 }

          if (!userdata[v["Email Address"]]) {
            userdata[v["Email Address"]] = {
              "streak": 0,
              "total": 0,
              "display": v["Email Address"].split("@")[0],
              "submitted": []
            }
          }

          if (v["Display Name (Keep this appropriate)"] != "") {
            userdata[v["Email Address"]]["display"] = v["Display Name (Keep this appropriate)"]
          }

          if (!userdata[v["Email Address"]]["submitted"].includes(ww(v["timestamp_epoch"]))) {
            const i = datedata.findIndex(t => ww(v["timestamp_epoch"]) == t)

            if (i >= 0) {
              if (!scoredata[datedata[i - 1]]) {
                if (!scoredata[datedata[i - 1]][v["Email Address"]]) {
                  userdata[v["Email Address"]]["streak"] = 0
                  console.log(v["Email Address"] + " Streak Reset")
                }
              }
            }

            if (answ[ww(v["timestamp_epoch"])] && answ[ww(v["timestamp_epoch"])]["timestamp_epoch"] <= v["timestamp_epoch"]) {
              var t = false

              if (String(v["Manual"]).toLowerCase() == "true") {
                if (v["Grade"] != "" && Number(v["Grade"] > 0)) {
                  console.log("Manual grading")

                  scoredata[mm(v["timestamp_epoch"])][v["Email Address"]] += Number(v["Grade"])
                  userdata[v["Email Address"]]["total"] += Number(v["Grade"])

                  t = true
                }
              } else {
                for (j = 0; j < 5; j++) {
                  if (tv(v[`Question ${j + 1}`]) == tv(answ[ww(v["timestamp_epoch"])][`Q${j + 1} Answer`])) {
                    scoredata[mm(v["timestamp_epoch"])][v["Email Address"]] += (j + 1) * 10
                    userdata[v["Email Address"]]["total"] += (j + 1) * 10

                    t = true
                  }
                }
              }

              if (t) { userdata[v["Email Address"]]["streak"]++ } else { userdata[v["Email Address"]]["streak"] = 0 }

              userdata[v["Email Address"]]["submitted"].push(ww(v["timestamp_epoch"]))
            } else {
              console.log(ww(v["timestamp_epoch"]) + "; No answer provided")
            }
          }
        })

        scoredata["All Time Scores"] = {}

        for (const [key, data] of Object.entries(userdata)) {
          scoredata["All Time Scores"][key] = data["total"]
        }

        for (const [key, data] of Object.entries(scoredata)) {
          scoredata[key] = Object.fromEntries(Object.entries(data).sort(([, a], [, b]) => { a - b }))
        }

        console.log(answ)
        console.log(userdata)
        console.log(jsonData)
        console.log(scoredata)

        // ==================
        max = Object.keys(scoredata).length - 1

        const date = document.querySelector("#datedisplayleaderboard")
        const competitve = document.querySelector("#competitive")
        display = max

        const dd = new Date()
        const rn = months[dd.getUTCMonth()] + ", " + dd.getUTCFullYear()

        date.textContent = rn

        for (const [epoch, users] of Object.entries(scoredata)) {
          const base = document.createElement("div")
          competitve.appendChild(base)

          p = 0
          document.querySelector("#placeholderdiv").style.display = "none"

          for (const [email, score] of Object.entries(users)) {
            p++

            const span = document.createElement("div")
            const name = document.createElement("h3")
            const s = document.createElement("h3")
            const streak = document.createElement("h1")
            const place = document.createElement("h2")

            s.setAttribute("id", "score")

            name.textContent = userdata[email]["display"]
            s.textContent = cma(score) + " ✦"
            streak.textContent = cma(userdata[email]["streak"])
            place.textContent = p + ". "

            streak.style.display = (userdata[email]["streak"] <= 1 || (rn != epoch && epoch != "All Time Scores")) && "none" || "inline"

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
    if (i == display) { date.textContent = ui[i][0] }
    ui[i][1].style.display = i == display && "block" || "none"
  }
}

function qupd() {
  const d = jlhklmn[jlhklmn.length - 1]

  var tt = d[`Q${String(qnum)} Text`]
  const ii = d[`Q${String(qnum)} Image`]

  tt = tt.replace("/n", "\n")
  tt = tt.replace("/c", ",")

  document.querySelector("#qtxt").textContent = tt != "" && tt || "UNDEFINED"
  document.querySelector("#qtxt").style.display = tt != "" && "block" || "none"

  document.documentElement.style.setProperty("--hover-opacity", "100%")

  const diff = d[`Q${String(qnum)} Difficulty`]
  const dc = dcolors[diff - 1]

  document.querySelector("#q1").style.backgroundColor = qnum == 1 && dc || "var(--secondary-color)"
  document.querySelector("#q2").style.backgroundColor = qnum == 2 && dc || "var(--secondary-color)"
  document.querySelector("#q3").style.backgroundColor = qnum == 3 && dc || "var(--secondary-color)"
  document.querySelector("#q4").style.backgroundColor = qnum == 4 && dc || "var(--secondary-color)"
  document.querySelector("#q5").style.backgroundColor = qnum == 5 && dc || "var(--secondary-color)"

  if (ii != "") {
    const qimg = (ii).split("id=")
    document.querySelector("#qimg").style.backgroundImage = `url(https://lh3.googleusercontent.com/d/${qimg[1]})`
    document.querySelector("#qimg").style.backgroundColor = "var(--primary-color)"
    document.documentElement.style.setProperty("--hover-opacity", "0%")
  } else {
    document.querySelector("#qimg").style.backgroundImage = ""
    document.querySelector("#qimg").style.backgroundColor = "var(--text-color)"
  }
}

// Init
fetchCsvToJson(datasheet1)
