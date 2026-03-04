import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, pivot;
let rimLight;
let spotLights  = [];
let spinGlow;

let isDragging    = false;
let prevX         = 0;
let currentSpeed  = 0;
let targetSpeed   = 0;
let glowIntensity = 0;

// DETECT MOBILE 
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  .test(navigator.userAgent) || window.innerWidth < 768;

init();
animate();

function init() {

  //  SCENE 
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08080f);

  // CAMERA 
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);

  // RENDERER 
  renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,   // antialias off on mobile = big perf gain
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  
  renderer.setPixelRatio(isMobile
    ? Math.min(window.devicePixelRatio, 1.5)
    : Math.min(window.devicePixelRatio, 2)
  );

  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;

  
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);


  // LIGHTING — 6 SPOTLIGHTS + KEY + FILL + RIM + AMBIENT

  scene.add(new THREE.AmbientLight(0x2a1a4a, 4.0));

  // Key — white
  const keyLight = new THREE.DirectionalLight(0xfff5e0, 5.0);
  keyLight.position.set(-5, 8, 4);
  keyLight.castShadow = !isMobile;
  scene.add(keyLight);

  // Fill — lavender
  const fillLight = new THREE.DirectionalLight(0x8866ff, 3.0);
  fillLight.position.set(6, 3, -3);
  scene.add(fillLight);

  // Rim — pink, pulsing
  rimLight = new THREE.DirectionalLight(0xff33bb, 5.0);
  rimLight.position.set(1, -8, -7);
  scene.add(rimLight);

  //  6 SPOTLIGHTS — full surround 
  const spotDefs = [
    { color: 0xff44ee, x:  0, y: 14, z:  0,  intensity: 8, angle: 0.30, penumbra: 0.5, os: 0.25, or: 4.0 },
    { color: 0x3322ff, x:  0, y:-14, z:  0,  intensity: 8, angle: 0.30, penumbra: 0.5, os: 0.25, or: 4.0 },
    { color: 0x00ddff, x:-12, y:  3, z:  0,  intensity: 6, angle: 0.28, penumbra: 0.6, os: 0.20, or: 3.0 },
    { color: 0xbb44ff, x: 12, y:  3, z:  0,  intensity: 6, angle: 0.28, penumbra: 0.6, os: 0.20, or: 3.0 },
    { color: 0xff99dd, x:  0, y:  4, z: 12,  intensity: 7, angle: 0.32, penumbra: 0.5, os: 0.15, or: 2.5 },
    { color: 0x2244ff, x:  0, y:  4, z:-12,  intensity: 6, angle: 0.32, penumbra: 0.5, os: 0.15, or: 2.5 },
  ];

  spotDefs.forEach((def) => {
    const spot = new THREE.SpotLight(def.color, def.intensity);
    spot.position.set(def.x, def.y, def.z);
    spot.target.position.set(0, 0, 0);
    spot.angle      = def.angle;
    spot.penumbra   = def.penumbra;
    spot.decay      = 1.0;
    spot.distance   = 30;
    spot.castShadow = false;

    spot.userData.orbitSpeed    = def.os;
    spot.userData.orbitRadius   = def.or;
    spot.userData.baseX         = def.x;
    spot.userData.baseY         = def.y;
    spot.userData.baseZ         = def.z;
    spot.userData.baseIntensity = def.intensity;
    spot.userData.phase         = Math.random() * Math.PI * 2;

    scene.add(spot);
    scene.add(spot.target);
    spotLights.push(spot);
  });

  // Spin glow — above model, not inside mesh
  spinGlow = new THREE.PointLight(0xff88ff, 0, 25);
  spinGlow.position.set(0, 9, 0);
  scene.add(spinGlow);

  // LOAD MODEL
  const loader = new GLTFLoader();

  loader.load('./logo_frontlook_model.glb', (gltf) => {

    const model = gltf.scene;

    model.traverse((child) => {
      if (!child.isMesh) return;
      const tex = child.material?.map;
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
      }
      child.material = new THREE.MeshStandardMaterial({
        map:             tex || null,
        color:           tex ? 0xffffff : 0x9933ff,
        roughness:       0.10,
        metalness:       0.35,
        side:            THREE.DoubleSide,
        envMapIntensity: 1.5,
      });
      child.castShadow    = !isMobile;
      child.receiveShadow = !isMobile;
    });

    // Scale
    model.updateMatrixWorld(true);
    const box1   = new THREE.Box3().setFromObject(model);
    const size1  = box1.getSize(new THREE.Vector3());
    const maxDim = Math.max(size1.x, size1.y, size1.z);
    model.scale.setScalar(4.0 / maxDim);

    // Centre
    model.updateMatrixWorld(true);
    const box2   = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.sub(center);

    pivot = new THREE.Group();
    pivot.add(model);
    scene.add(pivot);

    console.log('[Model] ✓ Ready —', isMobile ? 'mobile' : 'desktop', 'mode');

  }, undefined, (err) => console.error('[Loader] ', err));

  // INPUT: MOUSE + TOUCH 
  const canvas = renderer.domElement;
  canvas.style.cursor = 'grab';

  // Mouse 
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    targetSpeed = 0;
    currentSpeed = 0;
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !pivot) return;
    const delta = e.clientX - prevX;
    targetSpeed = delta * 0.006;
    prevX = e.clientX;
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // Touch 
  canvas.addEventListener('touchstart', (e) => {
    // Don't preventDefault here — allows tap events to fire normally
    isDragging   = true;
    prevX        = e.touches[0].clientX;
    targetSpeed  = 0;
    currentSpeed = 0;
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    //MOBILE FIX: preventDefault stops page scroll while dragging model
    // passive:false required for preventDefault to work
    e.preventDefault();
    if (!isDragging || !pivot) return;
    const delta = e.touches[0].clientX - prevX;
    targetSpeed = delta * 0.006;
    prevX = e.touches[0].clientX;
  }, { passive: false });   // ← must be false

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchcancel', () => {
    isDragging = false;
  });

  // ─ Resize — handles phone rotation (portrait and also landscape) 
  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);

  const t = Date.now() * 0.001;

  // Spin
  if (pivot) {
    currentSpeed += isDragging
      ? (targetSpeed - currentSpeed) * 0.18
      : (0 - currentSpeed) * 0.04;
    pivot.rotation.z += currentSpeed;
  }

  // Spin glow 
  const speedAbs   = Math.abs(currentSpeed);
  const targetGlow = Math.min(speedAbs * 80, 1.0);
  glowIntensity   += (targetGlow - glowIntensity) * 0.05;
  if (spinGlow) spinGlow.intensity = glowIntensity * 8.0;

  // Orbiting spotlights
  spotLights.forEach((spot, i) => {
    const { orbitSpeed, orbitRadius, baseY, phase, baseIntensity } = spot.userData;

    if (i === 0 || i === 1) {
      spot.position.x = Math.sin(t * orbitSpeed + phase) * orbitRadius;
      spot.position.z = Math.cos(t * orbitSpeed + phase) * orbitRadius;
    }
    if (i === 2 || i === 3) {
      spot.position.y = baseY + Math.sin(t * orbitSpeed + phase) * orbitRadius;
      spot.position.z = Math.cos(t * orbitSpeed + phase) * orbitRadius;
    }
    if (i === 4 || i === 5) {
      spot.position.x = Math.sin(t * orbitSpeed + phase) * orbitRadius;
      spot.position.y = baseY + Math.cos(t * orbitSpeed + phase) * 1.5;
    }

    spot.intensity = baseIntensity + Math.sin(t * 0.8 + phase) * 1.5;
  });

  // Rim pulse 
  if (rimLight) rimLight.intensity = 5.0 + Math.sin(t * 1.4) * 1.0;

  renderer.render(scene, camera);
}

function onWindowResize() {
  // Handles both browser resize AND phone orientation change
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}