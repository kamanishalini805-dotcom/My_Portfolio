// Ensure Three.js is loaded
window.addEventListener('load', initThreeJS);

function initThreeJS() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    
    // Add fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Particles ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles across a wide area
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create a custom circular texture for particles
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 16;
    canvasTexture.height = 16;
    const context = canvasTexture.getContext('2d');
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(0, 210, 255, 1)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const particleTexture = new THREE.CanvasTexture(canvasTexture);

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.5,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: 0x00d2ff
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Floating Geometric Shapes ---
    const shapes = [];
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.TorusGeometry(1, 0.3, 16, 32)
    ];

    const material = new THREE.MeshBasicMaterial({ 
        color: 0x7c4dff, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    for(let i = 0; i < 15; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geo, material);
        
        mesh.position.x = (Math.random() - 0.5) * 60;
        mesh.position.y = (Math.random() - 0.5) * 60;
        mesh.position.z = (Math.random() - 0.5) * 40 - 10;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        // Custom properties for animation
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        shapes.push(mesh);
        scene.add(mesh);
    }

    // --- Mouse Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse follow
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Rotate particles slowly
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Parallax effect on particles based on mouse
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // Animate shapes
        shapes.forEach(shape => {
            shape.rotation.x += shape.userData.rotSpeedX;
            shape.rotation.y += shape.userData.rotSpeedY;
            // Floating up and down
            shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.02;
        });

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
