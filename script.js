const API = "http://localhost:8080"
let editingId = null

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
                <button onclick="editSeries(${series.id}, '${series.name}', ${series.current_episode}, ${series.total_episodes}, '${series.image_url || ""}')">Edit</button>
                <button onclick="deleteSeries(${series.id})">Delete</button>
            </div>
        `
        container.appendChild(div)
    })
}

async function createSeries() {
    const name = document.getElementById("name").value
    const current = document.getElementById("current").value
    const total = document.getElementById("total").value
    const image = document.getElementById("image").value

    let url = `${API}/series`
    let method = "POST"

    if (editingId !== null) {
        url = `${API}/series/${editingId}`
        method = "PUT"
    }

    await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            current_episode: parseInt(current),
            total_episodes: parseInt(total),
            image_url: image
        })
    })

    // reset
    editingId = null
    document.querySelector(".form button").innerText = "Add"

    document.getElementById("name").value = ""
    document.getElementById("current").value = ""
    document.getElementById("total").value = ""
    document.getElementById("image").value = ""

    loadSeries()
}

function editSeries(id, name, current, total, image) {
    editingId = id

    document.getElementById("name").value = name
    document.getElementById("current").value = current
    document.getElementById("total").value = total
    document.getElementById("image").value = image

    document.querySelector(".form button").innerText = "Update"
}

window.onload = loadSeries