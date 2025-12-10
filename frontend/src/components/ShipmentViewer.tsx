import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Placement {
    boxName: string;
    placementId?: number | string;
    boxId?: number | string;
    x: number;
    y: number;
    z: number;
    dx: number;
    dy: number;
    dz: number;
}

interface Container {
    name: string;
    length: number;
    width: number;
    height: number;
    placements: Placement[];
}

interface VisualizationData {
    containers: Container[];
}

interface MeshUserData {
    boxName: string;
    boxId?: number | string;
    placementId?: number | string;
    dims: { dx: number; dy: number; dz: number };
    pos: { x: number; y: number; z: number };
}

class SimpleOrbitControls {
    camera: THREE.Camera;
    domElement: HTMLElement;
    target = new THREE.Vector3();
    enableDamping = true;
    dampingFactor = 0.1;

    private spherical = new THREE.Spherical();
    private sphericalDelta = new THREE.Spherical();
    private scale = 1;
    private rotateStart = new THREE.Vector2();
    private rotateEnd = new THREE.Vector2();
    private rotateDelta = new THREE.Vector2();
    private isRotating = false;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);

        domElement.addEventListener("mousedown", this.onMouseDown);
        domElement.addEventListener("wheel", this.onWheel, { passive: false });
    }

    private onMouseDown(event: MouseEvent) {
        this.isRotating = true;
        this.rotateStart.set(event.clientX, event.clientY);
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isRotating) return;
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(0.005);
        this.sphericalDelta.theta -= this.rotateDelta.x;
        this.sphericalDelta.phi -= this.rotateDelta.y;
        this.rotateStart.copy(this.rotateEnd);
    }

    private onMouseUp() {
        this.isRotating = false;
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
    }

    private onWheel(event: WheelEvent) {
        event.preventDefault();
        const zoomFactor = 0.95;
        this.scale *= event.deltaY > 0 ? zoomFactor : 1 / zoomFactor;
    }

    update() {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        this.spherical.setFromVector3(offset);
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(1, Math.min(10000, this.spherical.radius));
        offset.setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);

        if (this.enableDamping) {
            this.sphericalDelta.theta *= 1 - this.dampingFactor;
            this.sphericalDelta.phi *= 1 - this.dampingFactor;
            this.scale = 1 + (this.scale - 1) * (1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.scale = 1;
        }
    }

    dispose() {
        this.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.domElement.removeEventListener("wheel", this.onWheel);
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
    }
}

function randomColor(seed: number): THREE.Color {
    const h = (seed * 137.508) % 360;
    return new THREE.Color(`hsl(${h},70%,60%)`);
}

interface ShipmentViewerProps {
    shipmentId: number | string;
    width?: string | number;
    height?: string | number;
}

export default function ShipmentViewer({ shipmentId, width = "100%", height = 600 }: ShipmentViewerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const sceneRef = useRef<THREE.Scene | null>(null);
    const threeRef = useRef<{ renderer: THREE.WebGLRenderer | null; camera: THREE.PerspectiveCamera | null; controls: SimpleOrbitControls | null }>({ renderer: null, camera: null, controls: null });
    const rafRef = useRef<number | null>(null);

    const scaleFactor = 10;

    useEffect(() => {
        if (!shipmentId) return;
        setLoading(true);
        setError("");

        fetch(`/api/shipments/${shipmentId}/visualization`)
            .then(res => {
                if (!res.ok) return Promise.reject(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: VisualizationData) => {
                console.log("Fetched visualization data:", data);

                data.containers.forEach((c, ci) => {
                    console.log(`Container ${ci} (${c.name}): L=${c.length}, W=${c.width}, H=${c.height}`);
                    c.placements.forEach((p, pi) => {
                        console.log(`  Box ${pi} (${p.boxName}): pos(${p.x},${p.y},${p.z}) size(${p.dx},${p.dy},${p.dz})`);
                    });
                });

                initThree(data);
            })
            .catch(err => {
                console.error("Error fetching visualization data:", err);
                setError(String(err));
            })
            .finally(() => setLoading(false));

        return () => cleanupThree();

    }, [shipmentId]);

    function cleanupThree() {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (threeRef.current.controls) threeRef.current.controls.dispose();
        if (threeRef.current.renderer) {
            threeRef.current.renderer.dispose();
            threeRef.current.renderer.domElement?.parentNode?.removeChild(threeRef.current.renderer.domElement);
        }
        sceneRef.current = null;
        threeRef.current = { renderer: null, camera: null, controls: null };
    }

    function initThree(data: VisualizationData) {
        cleanupThree();
        const mount = mountRef.current;
        if (!mount) return;

        const widthPx = mount.clientWidth || 800;
        const heightPx = mount.clientHeight || 600;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(widthPx, heightPx);
        mount.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(60, widthPx / heightPx, 1, 20000);
        threeRef.current.camera = camera;

        const controls = new SimpleOrbitControls(camera, renderer.domElement);
        threeRef.current.controls = controls;

        // Lights
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(100 * scaleFactor, 200 * scaleFactor, 100 * scaleFactor);
        scene.add(dir);
        scene.add(new THREE.AxesHelper(50 * scaleFactor));

        let bbox = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };

        data.containers.forEach((c, ci) => {
            const group = new THREE.Group();
            group.name = `container-${ci}`;

            const containerOffsetX = ci * (c.length + 30) * scaleFactor;
            group.position.set(containerOffsetX, 0, 0);

            // Container wireframe
            // Packing library: X=length, Y=width, Z=height
            // Three.js: X=length, Y=height(up), Z=width(depth)
            // So we swap: library's Y↔Z to match Three.js convention
            const containerGeo = new THREE.BoxGeometry(
                c.length * scaleFactor,  // X: length (same)
                c.height * scaleFactor,  // Y: height (was Z in library)
                c.width * scaleFactor    // Z: width (was Y in library)
            );
            const wire = new THREE.LineSegments(
                new THREE.EdgesGeometry(containerGeo),
                new THREE.LineBasicMaterial({ color: 0x000000 })
            );
            // Position so bottom sits at Y=0
            wire.position.set(
                (c.length / 2) * scaleFactor,   // Center on X
                (c.height / 2) * scaleFactor,   // Lift by half height
                (c.width / 2) * scaleFactor     // Center on Z
            );
            group.add(wire);

            // Boxes - apply same Y↔Z swap
            c.placements.forEach((p, pi) => {
                const boxGeo = new THREE.BoxGeometry(
                    p.dx * scaleFactor,  // X: length (same)
                    p.dz * scaleFactor,  // Y: height (swap! was Z)
                    p.dy * scaleFactor   // Z: width (swap! was Y)
                );
                const mat = new THREE.MeshStandardMaterial({
                    color: randomColor(Number(p.boxId || pi) + ci),
                    transparent: true,
                    opacity: 0.8
                });
                const mesh = new THREE.Mesh(boxGeo, mat);

                // Position: apply same Y↔Z swap
                mesh.position.set(
                    (p.x + p.dx / 2) * scaleFactor,  // X position + half dx
                    (p.z + p.dz / 2) * scaleFactor,  // Y position (swap! using z)
                    (p.y + p.dy / 2) * scaleFactor   // Z position (swap! using y)
                );
                group.add(mesh);

                // Outline
                const edges = new THREE.EdgesGeometry(boxGeo);
                const line = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
                );
                line.position.copy(mesh.position);
                group.add(line);

                mesh.userData = {
                    boxName: p.boxName,
                    boxId: p.boxId,
                    placementId: p.placementId,
                    dims: { dx: p.dx, dy: p.dy, dz: p.dz },
                    pos: { x: p.x, y: p.y, z: p.z }
                };

                // Update bounding box
                bbox.minX = Math.min(bbox.minX, p.x);
                bbox.minY = Math.min(bbox.minY, p.y);
                bbox.minZ = Math.min(bbox.minZ, p.z);
                bbox.maxX = Math.max(bbox.maxX, p.x + p.dx);
                bbox.maxY = Math.max(bbox.maxY, p.y + p.dy);
                bbox.maxZ = Math.max(bbox.maxZ, p.z + p.dz);
            });

            scene.add(group);
        });

        if (!isFinite(bbox.minX)) bbox = { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 100, maxZ: 100 };

        const centerX = (bbox.minX + bbox.maxX) / 2 * scaleFactor;
        const centerY = (bbox.minY + bbox.maxY) / 2 * scaleFactor;
        const centerZ = (bbox.minZ + bbox.maxZ) / 2 * scaleFactor;
        const sizeX = (bbox.maxX - bbox.minX) * scaleFactor;
        const sizeY = (bbox.maxY - bbox.minY) * scaleFactor;
        const sizeZ = (bbox.maxZ - bbox.minZ) * scaleFactor;
        const maxSize = Math.max(sizeX, sizeY, sizeZ);

        camera.position.set(centerX + maxSize * 1.5, centerY + maxSize * 1.2, centerZ + maxSize * 1.5);
        camera.lookAt(centerX, centerY, centerZ);
        controls.target.set(centerX, centerY, centerZ);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onClick(event: MouseEvent) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const meshes: THREE.Mesh[] = [];
            scene.traverse(obj => {
                if ((obj as THREE.Mesh).isMesh && (obj.userData as MeshUserData)?.boxName) meshes.push(obj as THREE.Mesh);
            });

            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                const info = intersects[0].object.userData as MeshUserData;
                alert(`Box: ${info.boxName}\nBoxId: ${info.boxId}\nPlacementId: ${info.placementId}\nPos: (${info.pos.x}, ${info.pos.y}, ${info.pos.z})\nSize: ${info.dims.dx}×${info.dims.dy}×${info.dims.dz}`);
            }
        }

        renderer.domElement.addEventListener("click", onClick);

        window.addEventListener("resize", () => {
            const w = mount.clientWidth || widthPx;
            const h = mount.clientHeight || heightPx;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });

        function animate() {
            rafRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        threeRef.current.renderer = renderer;
        threeRef.current.controls = controls;
    }

    return (
        <div style={{ width, height, position: "relative" }}>
            {loading && <div style={{ padding: 16, textAlign: "center", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>Loading...</div>}
            {error && <div style={{ color: "red", padding: 16, textAlign: "center", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#ffebee", borderRadius: 4 }}>{error}</div>}
            <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}