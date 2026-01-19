import { MENU } from '../data/menu-data.js'

const grid = document.getElementById('menu-grid')

export function renderStep(category) {
  grid.innerHTML = ''

  // ===============================
  // CARTE "PAS DE ..."
  // ===============================
  const noneCard = document.createElement('div')
  noneCard.className = 'card card-none'

  const label =
    category === 'drink'
      ? 'boisson'
      : category === 'starter'
      ? 'starter'
      : category === 'pizza'
      ? 'plat'
      : category

  noneCard.innerHTML = `
    <div class="none-content">
      <img src="/images/plat.svg" alt="" />
      <span class="none-text">
        Je ne souhaite pas de ${label}
      </span>
    </div>
  `

  noneCard.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c =>
      c.classList.remove('selected')
    )

    noneCard.classList.add('selected')

    window.setSelectedItem(null)
  })

  grid.appendChild(noneCard)

  // ===============================
  // CARTES PLATS
  // ===============================
  MENU
    .filter(item => item.category === category)
    .forEach(item => {
      const card = document.createElement('div')
      card.className = 'card'

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <div class="info-titre">
            <h3>${item.title}</h3>
            <span>${Number(item.price).toFixed(2)}€</span>
            <p>${item.description}</p>
          </div>
        </div>
      `

      // 👉 clic carte = ouvrir overlay uniquement
      card.addEventListener('click', () => {
        window.openOverlay(item)
      })

      grid.appendChild(card)
    })
}
