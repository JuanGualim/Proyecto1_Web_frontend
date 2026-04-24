const API = "https://proyecto1webbackend-production-d655.up.railway.app"

let editingId = null
let currentImage = ""

// ============================
// Modal
// ============================

function openModal() {
    document.getElementById("modal-overlay").classList.add("active")
}

function closeModalDirect() {
    document.getElementById("modal-overlay").classList.remove("active")
    resetForm()
}

function closeModal(event) {
    // Solo cerrar si se hizo click en el overlay (fondo), no dentro del modal
    if (event.target === document.getElementById("modal-overlay")) {
        closeModalDirect()
    }
}

function resetForm() {
    editingId = null
    currentImage = ""

    document.getElementById("modal-title").innerText = "Agregar Serie"
    document.getElementById("submit-label").innerText = "Agregar"

    document.getElementById("name").value = ""
    document.getElementById("current").value = ""
    document.getElementById("total").value = ""
    document.getElementById("image").value = ""
    document.getElementById("file-label").innerText = "Seleccionar imagen..."
}

function handleFileChange(input) {
    const file = input.files[0]
    if (file) {
        document.getElementById("file-label").innerText = file.name
    } else {
        document.getElementById("file-label").innerText = "Seleccionar imagen..."
    }
}

// ============================
// Cargar series
// ============================

async function loadSeries() {
    const res = await fetch(`${API}/series`)
    const data = await res.json()

    const container = document.getElementById("series-list")
    const emptyState = document.getElementById("empty-state")
    const statsText = document.getElementById("stats-text")

    container.innerHTML = ""

    if (data.length === 0) {
        emptyState.style.display = "flex"
        statsText.innerText = "0 series"
        return
    }

    emptyState.style.display = "none"
    statsText.innerText = `${data.length} serie${data.length !== 1 ? "s" : ""} en tu biblioteca`

    for (const series of data) {

        // Obtener rating
        const ratingRes = await fetch(`${API}/series/${series.id}/rating`)
        const ratingData = await ratingRes.json()

        const progress = series.total_episodes > 0
            ? Math.min(100, Math.round((series.current_episode / series.total_episodes) * 100))
            : 0

        const card = document.createElement("div")
        card.className = "card"

        card.innerHTML = `
            <!-- Portada -->
            <div class="card-cover">
                ${series.image_url
                    ? `<img src="${series.image_url}" alt="${series.name}" />`
                    : `<div class="card-cover-placeholder">📺</div>`
                }
                <div class="card-overlay"></div>
            </div>

            <!-- Acciones (edit / delete) -->
            <div class="card-actions">
                <button class="action-btn edit edit-btn" title="Editar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete delete-btn" title="Eliminar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
            </div>

            <!-- Info inferior -->
            <div class="card-body">
                <div class="card-title">${series.name}</div>
                <div class="card-episode">Ep. ${series.current_episode} / ${series.total_episodes} &nbsp;·&nbsp; ${progress}%</div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>

                <div class="rating-row">
                    <div class="rating-score">
                        <span class="star">★</span>
                        ${ratingData.average.toFixed(1)} (${ratingData.count})
                    </div>
                    <div class="rate-buttons">
                        <button class="rate-btn" data-value="1">1</button>
                        <button class="rate-btn" data-value="2">2</button>
                        <button class="rate-btn" data-value="3">3</button>
                        <button class="rate-btn" data-value="4">4</button>
                        <button class="rate-btn" data-value="5">5</button>
                    </div>
                </div>
            </div>
        `

        container.appendChild(card)

        // Editar
        card.querySelector(".edit-btn").addEventListener("click", () => {
            editSeries(
                series.id,
                series.name,
                series.current_episode,
                series.total_episodes,
                series.image_url || ""
            )
        })

        // Eliminar
        card.querySelector(".delete-btn").addEventListener("click", () => {
            deleteSeries(series.id)
        })

        // Rating
        card.querySelectorAll(".rate-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                rate(series.id, parseInt(btn.dataset.value))
            })
        })
    }
}

// ============================
// Crear / Editar serie
// ============================

async function createSeries() {
    const name    = document.getElementById("name").value
    const current = document.getElementById("current").value
    const total   = document.getElementById("total").value
    const file    = document.getElementById("image").files[0]

    let imageURL = currentImage

    // Subir imagen si se seleccionó una nueva
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

    const url    = editingId !== null ? `${API}/series/${editingId}` : `${API}/series`
    const method = editingId !== null ? "PUT" : "POST"

    await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            current_episode: parseInt(current),
            total_episodes:  parseInt(total),
            image_url: imageURL
        })
    })

    closeModalDirect()
    loadSeries()
}

function editSeries(id, name, current, total, image) {
    editingId    = id
    currentImage = image

    document.getElementById("name").value    = name
    document.getElementById("current").value = current
    document.getElementById("total").value   = total

    document.getElementById("modal-title").innerText  = "Editar Serie"
    document.getElementById("submit-label").innerText = "Guardar cambios"

    if (image) {
        document.getElementById("file-label").innerText = "Imagen actual (subir nueva para cambiar)"
    }

    openModal()
}

// ============================
// Rating
// ============================

async function rate(id, value) {
    await fetch(`${API}/series/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value })
    })

    loadSeries()
}

// ============================
// Eliminar
// ============================

async function deleteSeries(id) {
    await fetch(`${API}/series/${id}`, { method: "DELETE" })
    loadSeries()
}

// ============================
// Exportar CSV
// ============================

async function exportCSV() {
    const res  = await fetch(`${API}/series`)
    const data = await res.json()

    let csv = "ID,Name,Current Episode,Total Episodes\n"

    data.forEach(series => {
        csv += `${series.id},${series.name},${series.current_episode},${series.total_episodes}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url  = window.URL.createObjectURL(blob)

    const a      = document.createElement("a")
    a.href       = url
    a.download   = "series.csv"
    a.click()

    window.URL.revokeObjectURL(url)
}

// ============================
// Init
// ============================

window.onload = loadSeries