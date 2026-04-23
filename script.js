const API = "http://localhost:8080"
let editingId = null

async function loadSeries() {
    const res = await fetch(`${API}/series`)
    const data = await res.json()

    const container = document.getElementById("series-list")
    container.innerHTML = ""

    for (const series of data) {

        // 🔥 obtener rating
        const ratingRes = await fetch(`${API}/series/${series.id}/rating`)
        const ratingData = await ratingRes.json()

        const div = document.createElement("div")
        div.className = "card"

        div.innerHTML = `
            <div class="card-info">
                ${series.image_url ? `<img src="${series.image_url}" class="thumb" />` : ""}
                <h3>${series.name}</h3>
                <p>${series.current_episode} / ${series.total_episodes}</p>

                <p>⭐ ${ratingData.average.toFixed(1)} (${ratingData.count})</p>

                <div>
                    Rate:
                    <button onclick="rate(${series.id}, 1)">1</button>
                    <button onclick="rate(${series.id}, 2)">2</button>
                    <button onclick="rate(${series.id}, 3)">3</button>
                    <button onclick="rate(${series.id}, 4)">4</button>
                    <button onclick="rate(${series.id}, 5)">5</button>
                </div>
            </div>

            <div class="card-actions">
                <button onclick="editSeries(${series.id}, '${series.name}', ${series.current_episode}, ${series.total_episodes}, '${series.image_url || ""}')">Edit</button>
                <button onclick="deleteSeries(${series.id})">Delete</button>
            </div>
        `

        container.appendChild(div)
    }
}

async function createSeries() {
    const name = document.getElementById("name").value
    const current = document.getElementById("current").value
    const total = document.getElementById("total").value
    const file = document.getElementById("image").files[0]

    let imageURL = ""

    if (file) {
        const formData = new FormData()
        formData.append("image", file)

        const uploadRes = await fetch(`${API}/upload`, {
            method: "POST",
            body: formData
        })

        const uploadData = await uploadRes.json()
        imageURL = uploadData.url
    }

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
            image_url: imageURL
        })
    })

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

async function rate(id, value) {
    await fetch(`${API}/series/${id}/rating`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating: value })
    })

    loadSeries()
}

window.onload = loadSeries