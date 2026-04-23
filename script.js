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
            <div class="card-info">
                <h3>${series.name}</h3>
                <p>${series.current_episode} / ${series.total_episodes}</p>
            </div>

            <div class="card-actions">
                <button onclick="deleteSeries(${series.id})">Delete</button>
            </div>
        `

        container.appendChild(div)
    })
}