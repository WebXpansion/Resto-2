import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { PMREMGenerator } from 'three'

let renderer, scene, camera

export function initViewer(item, onLoaded) {

  if (scene) {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
    scene.clear()
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  const canvas = document.getElementById('canvas')

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.1, 3)

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // ❌ sécurité si pas de modèle
  if (!item.model) {
    if (onLoaded) onLoaded()
    return
  }

  // Draco
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
  draco.setDecoderConfig({ type: 'wasm' })

  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  loader.load(`/models/${item.model}`, (gltf) => {
    const model = gltf.scene
    const scale = item.scale ?? 10
    model.scale.set(scale, scale, scale)

    model.traverse(obj => {
      if (obj.isMesh && obj.material) {
        obj.material.envMapIntensity = 1.2
        obj.material.needsUpdate = true
      }
    })

    scene.add(model)
    if (onLoaded) onLoaded()
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.4

  const pmremGenerator = new PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  new RGBELoader()
    .load('/hdr/studio.hdr', (hdrTexture) => {
      const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture
      scene.environment = envMap
      scene.background = null
      hdrTexture.dispose()
      pmremGenerator.dispose()
    })

  renderer.setAnimationLoop(() => {
    controls.update()
    renderer.render(scene, camera)
  })
}
