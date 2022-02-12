import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as dat from 'dat.gui'

import getRandomShape from '../src';

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

let faceVertices;

const dataBaseBox = {
    width: 5,
    height: 5,
    depth: 5,
    showWireframe: false,
    name: "base_box"
}

const params = {
    material: new THREE.MeshPhysicalMaterial({
        color: 0xdbdbdb,
        roughness: 0.25,
        metalness: 0.06,
        reflectivity: 0.6,
        clearcoat: 0.7,
        clearcoatRoughness: 0.5,
        // wireframe: true,
        side: THREE.DoubleSide
    }),
    faceVertices,
    maxVertices: 40,
    buffer: [6, 1, 3],
    name: 'random_shape',
}

const updateRandomShapes = () => {
    const oldRandomShapes = scene.getObjectByName(params.name);
    if ( oldRandomShapes ) {
        oldRandomShapes.geometry.dispose();
        scene.remove(oldRandomShapes);
    }

    const shape = getRandomShape(params);
    shape.name = params.name;

    scene.add(shape);
}

const createBaseBoxMesh = () => {
    const box = new THREE.Mesh();
    box.name = dataBaseBox.name;

    const boxGeometry = new THREE.BoxBufferGeometry(dataBaseBox.width, dataBaseBox.height, dataBaseBox.depth);
    box.geometry = boxGeometry;

    return box;
}

const updateBaseBox = (shouldUpdate) => {

    const boxInScene = scene.getObjectByName(dataBaseBox.name);

    if (boxInScene) {
        boxInScene.geometry.dispose();
        boxInScene.material.dispose();
        scene.remove(boxInScene);
    }

    const box = createBaseBoxMesh();

    if (shouldUpdate) {
        params.faceVertices = box.geometry.attributes.position.array.slice(0,9);
        updateRandomShapes(box);
    }

    if (dataBaseBox.showWireframe) {
        console.log('showWireframe');
        box.material = new THREE.MeshStandardMaterial({
            wireframe: true,
        })
        scene.add(box);
    }
}

updateBaseBox(true);

/**
 * Dat gui
 */
// Debug
const gui = new dat.GUI()

// Base Box
const boxGui = gui.addFolder('Base Box');
boxGui.add(dataBaseBox, 'showWireframe').onChange(updateBaseBox.bind(this, false));
boxGui.add(dataBaseBox, 'width').min(1).max(10).step(1).onChange(updateBaseBox.bind(this, true));
boxGui.add(dataBaseBox, 'height').min(1).max(10).step(1).onChange(updateBaseBox.bind(this, true));
boxGui.add(dataBaseBox, 'depth').min(1).max(10).step(1).onChange(updateBaseBox.bind(this, true));

// Random Shape
const randomShapeGui = gui.addFolder('Random Shape');
const randomShapeMaterialGui = randomShapeGui.addFolder('Material');
randomShapeMaterialGui.addColor(params.material, 'color');
randomShapeMaterialGui.add(params.material, 'roughness', 0, 1, 0.001);
randomShapeMaterialGui.add(params.material, 'metalness', 0, 1, 0.001);
randomShapeMaterialGui.add(params.material, 'reflectivity', 0, 1, 0.001);
randomShapeMaterialGui.add(params.material, 'clearcoat', 0, 1, 0.001);
randomShapeMaterialGui.add(params.material, 'clearcoatRoughness', 0, 1, 0.001);
randomShapeMaterialGui.add(params.material, 'wireframe');

const randomShapeParametersGui = randomShapeGui.addFolder('Parameters');
randomShapeParametersGui.add(params, 'maxVertices', 4, 50, 1).onChange(() => {
    let box = scene.getObjectByName(dataBaseBox.name);

    if (!box) {
        box = createBaseBoxMesh();
    }
    updateRandomShapes(box);
});
randomShapeParametersGui.add({update: updateRandomShapes}, 'update');

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0x505050, 1)
scene.add(ambientLight)

// Directional light
const dirLight = new THREE.DirectionalLight('white', 1)
dirLight.castShadow = true;
dirLight.shadow.camera.top = 20
dirLight.shadow.camera.right = 20
dirLight.shadow.camera.bottom = - 20
dirLight.shadow.camera.left = - 20
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
dirLight.shadow.camera.near = 0.1
dirLight.shadow.camera.far = 100
dirLight.position.set(10, 15, 30)
dirLight.lookAt(10, 5, 0)
const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
helper.visible = true;
helper.color = 0xff0000;
scene.add(dirLight)

const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera)
scene.add( helper, cameraHelper );

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
// camera.position.x = 4
camera.position.y = 20
camera.position.z = 25

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#fcf7e8')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update( );

    helper.update();
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()