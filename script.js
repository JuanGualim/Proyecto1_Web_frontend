const API = "http://localhost:8080"

async function loadSeries() {
    const res = await fetch(`${API}/series`)
    const data = await res.json()

    const container = document.getElementById("series-list")
    container.innerHTML = ""

    data.forEach(series => {
        const div = document.createElement("div")
        div.className = "card"

        div.innerHTML = `
            <h3>${series.name}</h3>
            <p>${series.current_episode} / ${series.total_episodes}</p>
            <button onclick="deleteSeries(${series.id})">Delete</button>
        `

        container.appendChild(div)
    })
}

async function deleteSeries(id) {
    await fetch(`${API}/series/${id}`, {
        method: "DELETE"
    })

    loadSeries()
}