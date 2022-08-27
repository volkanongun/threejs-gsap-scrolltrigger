import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui'

import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger"
ScrollTrigger.defaults({
    immediateRender: false,
    ease: "power1.inOut",
    scrub: true
});
gsap.registerPlugin(ScrollTrigger)

let spider
const spiderURL = new URL('../assets/spider.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xEFEFEF);

// const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(5, 5, 5);
// orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

const assetLoader = new GLTFLoader();

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const gui = new dat.GUI()
const guiOptions = {
    playAnimation : false
}

gui.add(guiOptions, 'playAnimation').onChange((e)=>{
    if(e)
        action.play()
    else
        action.stop()
})

let mixer, action
assetLoader.load(spiderURL.href, function(gltf) {
    spider = gltf.scene;
    scene.add(spider);

    // console.log(spider, " spider <<<")

    mixer = new THREE.AnimationMixer(spider)

    const clips = gltf.animations

    console.log(clips, " CLIPS <<<")
    const clip = THREE.AnimationClip.findByName(clips, "Spider_walk_cycle")
    action = mixer.clipAction(clip)

    // plays all actions at the same time
    // clips.forEach((clip) => {
    //     const action = mixer.clipAction(clip)
    //     action.play()
    // })

}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock()
function animate() {
    
    if(mixer)
        mixer.update(clock.getDelta())

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

const setUpScrollAnimation = () => {
    document.body.style.overflowY = "scroll"

    const startOrientation = camera.quaternion.clone();
    const quaternion = new THREE.Quaternion();

    const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".view-2",
          endTrigger: ".view-3",
          start: "top bottom",
          end: "top top",
          scrub: 1
        }
      })

    // view-2
    tl.to(camera.position, {x: 2, y: 2, z: 5, onUpdate(){
        camera.quaternion.copy(startOrientation).slerp(quaternion.setFromAxisAngle( new THREE.Vector3( -4, 1, 0 ), Math.PI / 50 ), this.progress());
    }})
      .to(spider.rotation, {y: Math.PI / 2, onUpdate(){}})
    
    // view-3
      .to(camera.position, {x: -1, y: 2, z: 5, onUpdate(){
        camera.quaternion.copy(camera.quaternion.clone()).slerp(quaternion.setFromAxisAngle( new THREE.Vector3( -4, 1, 0 ), Math.PI / 50 ), this.progress());
      }})
      .to(spider.rotation, {y: Math.PI * 1.5, onUpdate(){}})
    //   .to(target, {x: 0, y: -.51, z: -4, scrollTrigger: { trigger: ".view-3",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate})
}

const reset = () => {
    const gsapTL = new gsap.timeline()

    gsapTL
        .to(camera.position, {x: -3, y: 2, z: 5, duration: 4, onUpdate(){
            camera.lookAt(-2, 1, 0);
        },onComplete: setUpScrollAnimation})
        // .to(camera.target, {x: 0, y: -.51, z: -4, duration: 2, onComplete: setUpScrollAnimation}, '-=2')
    
    // console.log(camera.lookAt, " < lookat")
    // camera.target = new THREE.Vector3(0,0,0)
}

THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onLoad = function ( ) {
	console.log( 'Loading Complete!');
    reset()
};

THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});