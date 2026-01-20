import './style.css'
import './ui/menu.css'
import { renderStep } from './ui/menu.js'
import { initViewer } from './viewer.js'

// ===============================
// 🧭 ÉTAPES
// ===============================
const STEPS = [
  { key: 'drink', label: 'Boisson' },
  { key: 'starter', label: 'Starter' },
  { key: 'pizza', label: 'Plat' },
  { key: 'dessert', label: 'Dessert' },
  { key: 'recap', label: 'Récapitulatif' }
]



let stepIndex = 0
let previewItem = null
let currentQty = 1

const qtyValue = document.getElementById('qty-value')
const qtyPlus = document.getElementById('qty-plus')
const qtyMinus = document.getElementById('qty-minus')
const arBtn = document.getElementById('ar')

qtyPlus.addEventListener('click', () => {
  currentQty++
  qtyValue.textContent = currentQty
})

qtyMinus.addEventListener('click', () => {
  if (currentQty > 1) {
    currentQty--
    qtyValue.textContent = currentQty
  }
})



const selections = {
  drink: [],
  starter: [],
  pizza: [],
  dessert: []
}


window.getCurrentSelection = () => {
  const stepKey = STEPS[stepIndex].key
  return selections[stepKey]
}




// ===============================
// 🎯 ELEMENTS UI
// ===============================
const sheetBackBtn = document.getElementById('sheet-back')


const stepTitle = document.getElementById('step-title')


const nextBtn = document.getElementById('next')

const overlay = document.getElementById('overlay')
const sheet = document.getElementById('sheet')
const sheetTitle = document.getElementById('sheet-title')
const sheetDesc = document.getElementById('sheet-desc')
const sheetPrice = document.getElementById('sheet-price')
const viewerLoader = document.getElementById('viewer-loader')
const overlaySelectBtn = document.getElementById('overlay-select')

const stepCurrent = document.getElementById('step-current')
const stepTotal = document.getElementById('step-total')
const stepBackBtn = document.getElementById('step-back')

stepTotal.textContent = STEPS.length


// ===============================
// 🎬 INTRO
// ===============================
window.addEventListener('load', () => {
  const intro = document.getElementById('intro')
  const discover = document.getElementById('intro-discover')
  const menu = document.getElementById('intro-menu')

  setTimeout(() => discover.classList.add('visible'), 200)
  setTimeout(() => menu.classList.add('visible'), 800)

  setTimeout(() => {
    intro.classList.add('hidden')
    startStep()
  }, 2000)
})

// ===============================
// 🧠 STEP LOGIC
// ===============================
function startStep() {
  const step = STEPS[stepIndex]
  animateTitle(step.label)

  const stepFooter = document.querySelector('.step-footer')

  // Étape 1 → bouton Continuer plein width
  if (stepIndex === 0) {
    stepFooter.classList.add('single')
  } else {
    stepFooter.classList.remove('single')
  }

  stepCurrent.textContent = stepIndex + 1

  // Bouton retour visible à partir de l’étape 2
  if (stepIndex > 0) {
    stepBackBtn.classList.remove('hidden')
  } else {
    stepBackBtn.classList.add('hidden')
  }

  

  // ===============================
  // 🧾 ÉTAPE RÉCAP
  // ===============================
  if (step.key === 'recap') {
    renderRecap()

    // Footer spécial récap
    nextBtn.textContent = 'Valider'
    nextBtn.disabled = false

    return
  }

  // ===============================
  // 🧭 ÉTAPES NORMALES
  // ===============================


  updateFooter()
  renderStep(step.key)
  
}


sheetBackBtn.addEventListener('click', () => {
  previewItem = null
  closeOverlay()
})

stepBackBtn.addEventListener('click', () => {
  if (stepIndex === 0) return

  stepIndex--
  startStep()
})


// ===============================
// 🌐 OVERLAY API
// ===============================
window.openOverlay = (item) => {
  previewItem = item
  if (!item.model) {
    arBtn.style.display = 'none'
  } else {
    arBtn.style.display = 'flex'
  }

  const stepKey = item.category
  const list = selections[stepKey]
  

  const existing = list.find(e => e.item.id === item.id)

  // ✅ RESTAURATION DE LA QTÉ
  currentQty = existing ? existing.quantity : 1
  qtyValue.textContent = currentQty
  sheetTitle.textContent = item.title
  sheetDesc.textContent = item.description
  sheetPrice.textContent = `${Number(item.price).toFixed(2)}€`

  viewerLoader.classList.remove('hidden')

  overlay.classList.remove('hidden')
  sheet.classList.remove('hidden')
  sheetBackBtn.classList.remove('hidden')
  
  requestAnimationFrame(() => {
    overlay.classList.add('active')
    sheet.classList.add('active')
  })
  
  

  const loaderText = viewerLoader.querySelector('span')

  const canvas = document.getElementById('canvas')
  
  // Toujours montrer le loader au départ
  viewerLoader.classList.remove('hidden')
  
  if (!item.model) {
    // ❌ Pas de 3D
    loaderText.textContent = 'Aucune 3D disponible'
  
    // On masque le canvas
    if (canvas) canvas.style.display = 'none'
  
  } else {
    // ✅ 3D disponible
    loaderText.textContent = 'Chargement…'
  
    if (canvas) canvas.style.display = 'block'
  
    initViewer(item, () => {
      viewerLoader.classList.add('hidden')
    })
  }
  
}


  



overlay.addEventListener('click', (e) => {
  // si on clique directement sur le fond
  if (e.target === overlay) {
    closeOverlay()
  }
})


// ===============================
// ✅ VALIDATION DEPUIS OVERLAY
// ===============================
document.getElementById('overlay-confirm').addEventListener('click', () => {
  if (!previewItem) return

  const stepKey = previewItem.category
  const list = selections[stepKey]

  const existing = list.find(e => e.item.id === previewItem.id)

  if (existing) {
    existing.quantity = currentQty
  } else {
    list.push({
      item: previewItem,
      quantity: currentQty
    })
  }

  previewItem = null
  closeOverlay()

  // ✅ BON RENDER SELON L’ÉTAPE
  if (STEPS[stepIndex].key === 'recap') {
    renderRecap()
  } else {
    renderStep(STEPS[stepIndex].key)
  }

  updateFooter()
})




// ===============================
// ❌ FERMETURE OVERLAY
// ===============================
function closeOverlay() {
  overlay.classList.remove('active')
  sheet.classList.remove('active') 

  sheetBackBtn.classList.add('hidden')

  setTimeout(() => {
    overlay.classList.add('hidden')
    sheet.classList.add('hidden')
  }, 300)
}








// ===============================
// 🎬 TITRE ANIMÉ
// ===============================
function animateTitle(label) {
  stepTitle.classList.remove('visible')
  stepTitle.textContent = label

  requestAnimationFrame(() => {
    stepTitle.classList.add('visible')
  })
}


// ===============================
// 🦶 FOOTER
// ===============================
function updateFooter() {
  nextBtn.disabled = false
  nextBtn.textContent = 'Continuer'
}






// ===============================
// 👉 NAVIGATION
// ===============================
nextBtn.addEventListener('click', () => {
  goNext()
})






function goNext() {
  stepIndex++

  if (stepIndex >= STEPS.length) {
    console.log('Parcours terminé')
    return
  }

  startStep()
}

// ===============================
// 📱 AR BUTTON
// ===============================





function isAppleDevice() {
  const ua = navigator.userAgent
  return (
    /iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

arBtn.addEventListener('click', () => {
  if (!previewItem || !previewItem.model) return

  if (isAppleDevice()) {
    openQuickLook(previewItem.model)
  }
})


// ===============================
// 🍎 QUICK LOOK (USDZ)
// ===============================
function openQuickLook(modelName) {
  const usdz = modelName.replace('.glb', '.usdz')

  const link = document.createElement('a')
  link.setAttribute('rel', 'ar')
  link.setAttribute('href', `/models/${usdz}`)

  const img = document.createElement('img')
  img.src = '/images/ar.svg'
  img.style.display = 'none'

  link.appendChild(img)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


function renderRecap() {
  const grid = document.getElementById('menu-grid')
  grid.innerHTML = ''

  Object.entries(selections).forEach(([category, list]) => {
    if (list.length === 0) return

    list.forEach(({ item, quantity }) => {
      const card = document.createElement('div')
      card.className = 'card recap-card'

      // ✅ clic → réouverture overlay
      card.addEventListener('click', () => {
        window.openOverlay(item)
      })

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <div class="info-titre">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="price-row">
              <span class="price">${Number(item.price).toFixed(2)}€</span>
              <span class="separator">|</span>
              <span class="qty">Qté : ${quantity}</span>
            </div>
            <button class="btn-replace" data-category="${item.category}">
              Remplacer
            </button>


          </div>
        </div>
      `

      const wrapper = document.createElement('div')
      wrapper.className = 'card-row'
      wrapper.appendChild(card)

      grid.appendChild(wrapper)

      const replaceBtn = card.querySelector('.btn-replace')

      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation() // ⛔ empêche le clic carte
      
        const targetCategory = item.category
      
        const targetIndex = STEPS.findIndex(
          step => step.key === targetCategory
        )
      
        if (targetIndex !== -1) {
          stepIndex = targetIndex
          startStep()
        }
      })
      

    })
  })
}



function categoryLabel(key) {
  switch (key) {
    case 'drink': return 'Boisson'
    case 'starter': return 'Starter'
    case 'pizza': return 'Plat'
    case 'dessert': return 'Dessert'
    default: return ''
  }
}

