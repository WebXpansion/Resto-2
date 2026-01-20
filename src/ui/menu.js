import { MENU } from '../data/menu-data.js'

const grid = document.getElementById('menu-grid')

export function renderStep(category) {
  grid.innerHTML = ''

  const currentSelection = window.getCurrentSelection() || []

  MENU
    .filter(item => item.category === category)
    .forEach(item => {
      const entry = currentSelection.find(e => e.item.id === item.id)

      const card = document.createElement('div')
      card.className = 'card'

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <div class="info-titre">
            <h3>${item.title}</h3>
            <p>${item.description}</p>

            <div class="price-row">
              <span class="price">${Number(item.price).toFixed(2)}€</span>
              ${
                entry && entry.quantity > 0
                  ? `<span class="separator">|</span>
                     <span class="qty">Qté : ${entry.quantity}</span>`
                  : ''
              }
            </div>
          </div>
        </div>
      `

      // ✅ Icône check si quantité > 0
      if (entry && entry.quantity > 0) {
        const check = document.createElement('img')
        check.src = '/images/check.svg'
        check.alt = 'Sélectionné'
        check.className = 'card-check'
        card.querySelector('.info').appendChild(check)
      }

      card.addEventListener('click', () => {
        window.openOverlay(item)
      })

      const wrapper = document.createElement('div')
      wrapper.className = 'card-row'
      wrapper.appendChild(card)

      grid.appendChild(wrapper)
    })
}


