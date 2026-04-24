const API = "http://localhost:8080"

let editingId = null
let currentImage = ""

async function loadSeries() {
    const res = await fetch(`${API}/series`)
    const data = await res.json()

    const container = document.getElementById("series-list")
    container.innerHTML = ""

    for (const series of data) {

        // ⭐ obtener rating
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
                    <button class="rate-btn" data-value="1">1</button>
                    <button class="rate-btn" data-value="2">2</button>
                    <button class="rate-btn" data-value="3">3</button>
                    <button class="rate-btn" data-value="4">4</button>
                    <button class="rate-btn" data-value="5">5</button>
                </div>
            </div>

            <div class="card-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `

        container.appendChild(div)

        // 🔥 EDIT
        div.querySelector(".edit-btn").addEventListener("click", () => {
            editSeries(
                series.id,
                series.name,
                series.current_episode,
                series.total_episodes,
                series.image_url || ""
            )
        })

        // 🔥 DELETE
        div.querySelector(".delete-btn").addEventListener("click", () => {
            deleteSeries(series.id)
        })

        // 🔥 RATE
        div.querySelectorAll(".rate-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                rate(series.id, parseInt(btn.dataset.value))
            })
        })
    }
}

async function createSeries() {
    const name = document.getElementById("name").value
    const current = document.getElementById("current").value
    const total = document.getElementById("total").value
    const file = document.getElementById("image").files[0]

    let imageURL = currentImage

    // 🔥 subir imagen si hay nueva
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

    // 🔄 reset
    editingId = null
    currentImage = ""

    document.querySelector(".form button").innerText = "Add"

    document.getElementById("name").value = ""
    document.getElementById("current").value = ""
    document.getElementById("total").value = ""
    document.getElementById("image").value = ""

    loadSeries()
}

function editSeries(id, name, current, total, image) {
    editingId = id
    currentImage = image

    document.getElementById("name").value = name
    document.getElementById("current").value = current
    document.getElementById("total").value = total

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

async function deleteSeries(id) {
    await fetch(`${API}/series/${id}`, {
        method: "DELETE"
    })

    loadSeries()
}

async function exportCSV() {
    const res = await fetch(`${API}/series`)
    const data = await res.json()

    let csv = "ID,Name,Current Episode,Total Episodes\n"

    data.forEach(series => {
        csv += `${series.id},${series.name},${series.current_episode},${series.total_episodes}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "series.csv"
    a.click()

    window.URL.revokeObjectURL(url)
}

window.onload = loadSeries