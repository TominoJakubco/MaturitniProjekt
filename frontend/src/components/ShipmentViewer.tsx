import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import axiosInstance from "../app/axiosInstance";

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
    stepIndex?: number;
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
    stepIndex?: number;
    containerIndex: number;
}

interface LoadingStep {
    index: number;
    containerIndex: number;
    placement: Placement;
    description: string;
    containerName: string;
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
    private panStart = new THREE.Vector2();
    private panEnd = new THREE.Vector2();
    private panDelta = new THREE.Vector2();
    private panOffset = new THREE.Vector3();
    private isRotating = false;
    private isPanning = false;
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;
    private moveSpeed = 500;
    private keys: Set<string> = new Set();

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        domElement.addEventListener("mousedown", this.onMouseDown);
        domElement.addEventListener("wheel", this.onWheel, { passive: false });
        domElement.addEventListener("contextmenu", this.onContextMenu);
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    private onContextMenu(event: MouseEvent) { event.preventDefault(); }

    private onMouseDown(event: MouseEvent) {
        if (event.button === 0) { this.isRotating = true; this.rotateStart.set(event.clientX, event.clientY); }
        else if (event.button === 2) { this.isPanning = true; this.panStart.set(event.clientX, event.clientY); }
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
    }

    private onMouseMove(event: MouseEvent) {
        if (this.isRotating) {
            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(0.005);
            this.sphericalDelta.theta -= this.rotateDelta.x;
            this.sphericalDelta.phi -= this.rotateDelta.y;
            this.rotateStart.copy(this.rotateEnd);
        } else if (this.isPanning) {
            this.panEnd.set(event.clientX, event.clientY);
            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(0.5);
            this.pan(this.panDelta.x, this.panDelta.y);
            this.panStart.copy(this.panEnd);
        }
    }

    private onMouseUp() {
        this.isRotating = false;
        this.isPanning = false;
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
    }

    private onWheel(event: WheelEvent) {
        event.preventDefault();
        const zoomFactor = 0.98;
        this.scale *= event.deltaY > 0 ? zoomFactor : 1 / zoomFactor;
    }

    private onKeyDown(event: KeyboardEvent) { this.keys.add(event.key.toLowerCase()); this.updateMovementState(); }
    private onKeyUp(event: KeyboardEvent) { this.keys.delete(event.key.toLowerCase()); this.updateMovementState(); }

    private updateMovementState() {
        this.moveForward = this.keys.has('w') || this.keys.has('arrowup');
        this.moveBackward = this.keys.has('s') || this.keys.has('arrowdown');
        this.moveLeft = this.keys.has('a') || this.keys.has('arrowleft');
        this.moveRight = this.keys.has('d') || this.keys.has('arrowright');
        this.moveUp = this.keys.has('q') || this.keys.has('pageup');
        this.moveDown = this.keys.has('e') || this.keys.has('pagedown');
    }

    private pan(deltaX: number, deltaY: number) {
        const offset = new THREE.Vector3();
        const position = this.camera.position;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan(((this.camera as THREE.PerspectiveCamera).fov / 2) * Math.PI / 180.0);
        const panLeft = new THREE.Vector3();
        const panUp = new THREE.Vector3();
        const matrix = new THREE.Matrix4();
        matrix.extractRotation((this.camera as any).matrix);
        panLeft.set(-1, 0, 0);
        panLeft.applyMatrix4(matrix);
        panLeft.multiplyScalar(-2 * deltaX * targetDistance / this.domElement.clientHeight);
        panUp.set(0, 1, 0);
        panUp.applyMatrix4(matrix);
        panUp.multiplyScalar(2 * deltaY * targetDistance / this.domElement.clientHeight);
        this.panOffset.add(panLeft).add(panUp);
    }

    update(deltaTime: number) {
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight || this.moveUp || this.moveDown) {
            const cameraDirection = new THREE.Vector3();
            const cameraUp = new THREE.Vector3(0, 1, 0);
            const cameraRight = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.normalize();
            cameraRight.crossVectors(cameraDirection, cameraUp).normalize();
            const moveDistance = this.moveSpeed * deltaTime;
            const moveVector = new THREE.Vector3(0, 0, 0);
            if (this.moveForward) moveVector.add(cameraDirection);
            if (this.moveBackward) moveVector.sub(cameraDirection);
            if (this.moveLeft) moveVector.sub(cameraRight);
            if (this.moveRight) moveVector.add(cameraRight);
            if (this.moveUp) moveVector.add(cameraUp);
            if (this.moveDown) moveVector.sub(cameraUp);
            if (moveVector.lengthSq() > 0) {
                moveVector.normalize().multiplyScalar(moveDistance);
                this.camera.position.add(moveVector);
                this.target.add(moveVector);
            }
        }
        const offset = new THREE.Vector3();
        this.target.add(this.panOffset);
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
            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.scale = 1;
            this.panOffset.set(0, 0, 0);
        }
    }

    dispose() {
        this.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.domElement.removeEventListener("wheel", this.onWheel);
        this.domElement.removeEventListener("contextmenu", this.onContextMenu);
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
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

// ─── Shared dark-theme tokens ────────────────────────────────────────────────
const dark = {
    glass: "rgba(255,255,255,0.03)",
    glassBorder: "1px solid rgba(255,255,255,0.08)",
    glassShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    panelBg: "rgba(15,23,42,0.95)",
    text: "rgba(255,255,255,0.9)",
    textMuted: "rgba(255,255,255,0.5)",
    textDim: "rgba(255,255,255,0.35)",
    blue: "#3b82f6",
    blueGlass: "rgba(59,130,246,0.15)",
    blueBorder: "rgba(59,130,246,0.3)",
    green: "#10b981",
    greenGlass: "rgba(16,185,129,0.12)",
    greenBorder: "rgba(16,185,129,0.3)",
    divider: "rgba(255,255,255,0.08)",
    stepDone: "rgba(16,185,129,0.15)",
    stepDoneBorder: "rgba(16,185,129,0.4)",
    stepActive: "rgba(59,130,246,0.15)",
    stepActiveBorder: "rgba(59,130,246,0.5)",
    stepFuture: "rgba(255,255,255,0.02)",
    stepFutureBorder: "rgba(255,255,255,0.06)",
    backdrop: "blur(20px)",
};

function darkBtn(active = false, color: "blue" | "gray" = "blue") {
    if (color === "gray") {
        return {
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
            color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            transition: "all 0.2s",
            backdropFilter: "blur(10px)",
        } as React.CSSProperties;
    }
    return {
        padding: "6px 14px",
        borderRadius: "8px",
        border: active ? `1px solid ${dark.blueBorder}` : "1px solid rgba(255,255,255,0.08)",
        background: active ? dark.blueGlass : "rgba(255,255,255,0.04)",
        color: active ? "#93c5fd" : "rgba(255,255,255,0.6)",
        cursor: "pointer",
        fontSize: "0.8125rem",
        fontWeight: 600,
        transition: "all 0.2s",
        backdropFilter: "blur(10px)",
    } as React.CSSProperties;
}

export default function ShipmentViewer({ shipmentId, width = "100%", height = 700 }: ShipmentViewerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const sceneRef = useRef<THREE.Scene | null>(null);
    const threeRef = useRef<{ renderer: THREE.WebGLRenderer | null; camera: THREE.PerspectiveCamera | null; controls: SimpleOrbitControls | null }>({ renderer: null, camera: null, controls: null });
    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showFutureBoxes, setShowFutureBoxes] = useState(false);
    const [showAllContainers, setShowAllContainers] = useState(true);
    const [activeContainerIndex, setActiveContainerIndex] = useState(0);
    const [cameraView, setCameraView] = useState<'3d' | 'top' | 'front' | 'side'>('3d');

    const scaleFactor = 10;
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleStepNavigation = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key >= '1' && e.key <= '9') {
                const stepNumber = parseInt(e.key) - 1;
                if (stepNumber < loadingSteps.length) { e.preventDefault(); handleStepChange(stepNumber); }
            } else if (e.key === '0' && loadingSteps.length >= 10) {
                e.preventDefault(); handleStepChange(9);
            } else if (e.key === 'Enter') {
                e.preventDefault(); handlePlayPause();
            }
        };
        window.addEventListener('keydown', handleStepNavigation);
        return () => window.removeEventListener('keydown', handleStepNavigation);
    }, [loadingSteps.length]);

    useEffect(() => {
        if (!shipmentId) return;
        setLoading(true);
        setError("");
        axiosInstance.get<VisualizationData>(`/api/shipments/${shipmentId}/visualization`)
            .then(res => {
                const steps: LoadingStep[] = [];
                let stepCounter = 0;
                res.data.containers.forEach((container, containerIndex) => {
                    const sortedPlacements = [...container.placements].sort((a, b) => {
                        const xDiff = b.x - a.x;
                        if (Math.abs(xDiff) > 0.1) return xDiff;
                        const yDiff = b.y - a.y;
                        if (Math.abs(yDiff) > 0.1) return yDiff;
                        return b.z - a.z;
                    });
                    sortedPlacements.forEach((placement) => {
                        steps.push({ index: stepCounter++, containerIndex, placement: { ...placement, stepIndex: stepCounter }, description: `Load ${placement.boxName} at position (${placement.x}, ${placement.y}, ${placement.z})`, containerName: container.name });
                    });
                });
                setLoadingSteps(steps);
                initThree(res.data, steps);
            })
            .catch((err: any) => {
                setError(String(err.message || err));
                if (err.response?.status === 401) alert("Nejste přihlášeni");
                else if (err.response?.status === 403) alert("Nemáte dostatečná oprávnění");
            })
            .finally(() => setLoading(false));
        return () => { cleanupThree(); if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
    }, [shipmentId]);

    useEffect(() => {
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        if (isPlaying && loadingSteps.length > 0) {
            playIntervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= loadingSteps.length - 1) { setIsPlaying(false); return prev; }
                    return prev + 1;
                });
            }, 2000 / playbackSpeed);
        }
        return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
    }, [isPlaying, playbackSpeed, loadingSteps.length]);

    useEffect(() => { updateSceneForStep(currentStep); }, [currentStep, showFutureBoxes, showAllContainers, activeContainerIndex]);

    useEffect(() => {
        const camera = threeRef.current.camera;
        const controls = threeRef.current.controls;
        if (!camera || !controls || !sceneRef.current) return;
        const bbox = new THREE.Box3().setFromObject(sceneRef.current);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        switch (cameraView) {
            case 'top': camera.position.set(center.x, center.y + maxDim * 1.5, center.z); break;
            case 'front': camera.position.set(center.x, center.y, center.z - maxDim * 1.5); break;
            case 'side': camera.position.set(center.x - maxDim * 1.5, center.y, center.z); break;
            default: camera.position.set(center.x + maxDim * 1.5, center.y + maxDim * 1.2, center.z + maxDim * 1.5); break;
        }
        camera.lookAt(center);
        controls.target.copy(center);
        camera.updateProjectionMatrix();
    }, [cameraView]);

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

    function initThree(data: VisualizationData, steps: LoadingStep[]) {
        cleanupThree();
        const mount = mountRef.current;
        if (!mount) return;
        const widthPx = mount.clientWidth || 800;
        const heightPx = mount.clientHeight || 600;
        const scene = new THREE.Scene();
        // Dark background matching the app theme
        scene.background = new THREE.Color(0x0f172a);
        sceneRef.current = scene;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(widthPx, heightPx);
        mount.appendChild(renderer.domElement);
        const camera = new THREE.PerspectiveCamera(60, widthPx / heightPx, 1, 20000);
        threeRef.current.camera = camera;
        const controls = new SimpleOrbitControls(camera, renderer.domElement);
        threeRef.current.controls = controls;
        scene.add(new THREE.HemisphereLight(0x8888ff, 0x334155, 0.8));
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(100 * scaleFactor, 200 * scaleFactor, 100 * scaleFactor);
        scene.add(dir);
        scene.add(new THREE.AxesHelper(50 * scaleFactor));

        const meshDataRef: Array<{ mesh: THREE.Mesh; line: THREE.LineSegments; containerIndex: number; stepIndex: number; originalMaterial: THREE.Material; originalLineMaterial: THREE.Material; }> = [];
        let bbox = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };

        data.containers.forEach((c, ci) => {
            const group = new THREE.Group();
            group.name = `container-${ci}`;
            const containerOffsetX = ci * (c.length + 30) * scaleFactor;
            group.position.set(containerOffsetX, 0, 0);
            const containerGeo = new THREE.BoxGeometry(c.length * scaleFactor, c.height * scaleFactor, c.width * scaleFactor);
            const wire = new THREE.LineSegments(new THREE.EdgesGeometry(containerGeo), new THREE.LineBasicMaterial({ color: 0x3b82f6 }));
            wire.position.set((c.length / 2) * scaleFactor, (c.height / 2) * scaleFactor, (c.width / 2) * scaleFactor);
            group.add(wire);
            const containerSteps = steps.filter(s => s.containerIndex === ci);
            c.placements.forEach((p, pi) => {
                const stepInfo = containerSteps.find(s => s.placement.x === p.x && s.placement.y === p.y && s.placement.z === p.z);
                const boxGeo = new THREE.BoxGeometry(p.dx * scaleFactor, p.dz * scaleFactor, p.dy * scaleFactor);
                const mat = new THREE.MeshStandardMaterial({ color: randomColor(Number(p.boxId || pi) + ci), transparent: true, opacity: 0.3 });
                const mesh = new THREE.Mesh(boxGeo, mat);
                mesh.position.set((p.x + p.dx / 2) * scaleFactor, (p.z + p.dz / 2) * scaleFactor, (p.y + p.dy / 2) * scaleFactor);
                const edges = new THREE.EdgesGeometry(boxGeo);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1, transparent: true, opacity: 0.3 }));
                line.position.copy(mesh.position);
                group.add(mesh);
                group.add(line);
                const stepIndex = stepInfo?.index ?? Infinity;
                mesh.userData = { boxName: p.boxName, boxId: p.boxId, placementId: p.placementId, dims: { dx: p.dx, dy: p.dy, dz: p.dz }, pos: { x: p.x, y: p.y, z: p.z }, stepIndex, containerIndex: ci };
                line.userData = mesh.userData;
                meshDataRef.push({ mesh, line, containerIndex: ci, stepIndex, originalMaterial: mat.clone(), originalLineMaterial: line.material.clone() });
                bbox.minX = Math.min(bbox.minX, p.x); bbox.minY = Math.min(bbox.minY, p.y); bbox.minZ = Math.min(bbox.minZ, p.z);
                bbox.maxX = Math.max(bbox.maxX, p.x + p.dx); bbox.maxY = Math.max(bbox.maxY, p.y + p.dy); bbox.maxZ = Math.max(bbox.maxZ, p.z + p.dz);
            });
            scene.add(group);
        });

        if (!isFinite(bbox.minX)) bbox = { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 100, maxZ: 100 };
        const centerX = (bbox.minX + bbox.maxX) / 2 * scaleFactor;
        const centerY = (bbox.minY + bbox.maxY) / 2 * scaleFactor;
        const centerZ = (bbox.minZ + bbox.maxZ) / 2 * scaleFactor;
        const maxSize = Math.max((bbox.maxX - bbox.minX), (bbox.maxY - bbox.minY), (bbox.maxZ - bbox.minZ)) * scaleFactor;
        camera.position.set(centerX + maxSize * 1.5, centerY + maxSize * 1.2, centerZ + maxSize * 1.5);
        camera.lookAt(centerX, centerY, centerZ);
        controls.target.set(centerX, centerY, centerZ);
        (scene as any).meshDataRef = meshDataRef;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        function onClick(event: MouseEvent) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const meshes: THREE.Mesh[] = [];
            scene.traverse(obj => { if ((obj as THREE.Mesh).isMesh && (obj.userData as MeshUserData)?.boxName) meshes.push(obj as THREE.Mesh); });
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                const info = intersects[0].object.userData as MeshUserData;
                const stepNumber = steps.findIndex(s => s.containerIndex === info.containerIndex && s.placement.x === info.pos.x && s.placement.y === info.pos.y && s.placement.z === info.pos.z) + 1;
                alert(`Box: ${info.boxName}\nBoxId: ${info.boxId}\nPlacementId: ${info.placementId}\nPos: (${info.pos.x}, ${info.pos.y}, ${info.pos.z})\nSize: ${info.dims.dx}×${info.dims.dy}×${info.dims.dz}\nStep: ${stepNumber || 'N/A'}`);
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
        function animate(time: number) {
            rafRef.current = requestAnimationFrame(animate);
            const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
            lastTimeRef.current = time;
            controls.update(deltaTime);
            renderer.render(scene, camera);
        }
        animate(0);
        threeRef.current.renderer = renderer;
        threeRef.current.controls = controls;
        updateSceneForStep(0);
    }

    function updateSceneForStep(step: number) {
        const scene = sceneRef.current;
        if (!scene) return;
        const meshDataRef = (scene as any).meshDataRef;
        if (!meshDataRef) return;
        meshDataRef.forEach((data: any) => {
            const isCurrentContainer = showAllContainers || data.containerIndex === activeContainerIndex;
            if (data.stepIndex <= step) {
                data.mesh.visible = isCurrentContainer;
                data.line.visible = isCurrentContainer;
                if (data.mesh.material instanceof THREE.MeshStandardMaterial) { data.mesh.material.transparent = true; data.mesh.material.opacity = 0.9; data.mesh.material.needsUpdate = true; }
                if (data.line.material instanceof THREE.LineBasicMaterial) { data.line.material.transparent = true; data.line.material.opacity = 1; data.line.material.needsUpdate = true; }
            } else if (showFutureBoxes && isCurrentContainer) {
                data.mesh.visible = true; data.line.visible = true;
                if (data.mesh.material instanceof THREE.MeshStandardMaterial) { data.mesh.material.transparent = true; data.mesh.material.opacity = 0.15; data.mesh.material.needsUpdate = true; }
                if (data.line.material instanceof THREE.LineBasicMaterial) { data.line.material.transparent = true; data.line.material.opacity = 0.2; data.line.material.needsUpdate = true; }
            } else {
                data.mesh.visible = false; data.line.visible = false;
            }
        });
    }

    function handleStepChange(step: number) { setCurrentStep(step); setIsPlaying(false); }
    function handlePlayPause() { setIsPlaying(!isPlaying); }
    function handleNext() { setCurrentStep(prev => Math.min(prev + 1, loadingSteps.length - 1)); setIsPlaying(false); }
    function handlePrev() { setCurrentStep(prev => Math.max(prev - 1, 0)); setIsPlaying(false); }
    function handleReset() { setCurrentStep(0); setIsPlaying(false); }
    function handleJumpToEnd() { setCurrentStep(loadingSteps.length - 1); setIsPlaying(false); }

    const currentStepData = loadingSteps[currentStep];
    const containers = loadingSteps.reduce((acc: { index: number; name: string }[], step) => {
        if (!acc.some(c => c.index === step.containerIndex)) acc.push({ index: step.containerIndex, name: step.containerName });
        return acc;
    }, []);

    return (
        <div style={{ width, height: "100%", display: "flex", flexDirection: "column", fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .sv-step-item:hover { background: rgba(255,255,255,0.05) !important; }
                .sv-ctrl-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                .sv-range::-webkit-slider-thumb { background: #3b82f6; }
                .sv-range::-webkit-slider-runnable-track { background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; }
                .sv-checkbox { accent-color: #3b82f6; }
            `}</style>

            {loading && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, backgroundColor: dark.panelBg, backdropFilter: dark.backdrop, border: dark.glassBorder, borderRadius: "12px", padding: "32px 48px", textAlign: "center", boxShadow: dark.glassShadow }}>
                    <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTop: `3px solid ${dark.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "16px" }} />
                    <p style={{ color: dark.textMuted, margin: 0, fontWeight: 500 }}>Načítám data...</p>
                </div>
            )}

            {error && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "24px 32px", color: "#fca5a5", fontWeight: 500 }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", height: "100%", gap: "16px" }}>
                {/* ─── 3D Viewer ─── */}
                <div style={{ flex: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, backgroundColor: dark.glass, backdropFilter: dark.backdrop, border: dark.glassBorder, borderRadius: "16px", boxShadow: dark.glassShadow, position: "relative", overflow: "hidden" }}>
                        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

                        {/* Camera view buttons – top left */}
                        <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "6px", backgroundColor: "rgba(15,23,42,0.8)", backdropFilter: dark.backdrop, borderRadius: "10px", padding: "8px", border: dark.glassBorder, boxShadow: dark.glassShadow }}>
                            {(['3d', 'top', 'front', 'side'] as const).map(view => (
                                <button key={view} onClick={() => setCameraView(view)} style={darkBtn(cameraView === view, "blue")}>
                                    {view === '3d' ? '3D' : view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Stats overlay – top right */}
                        {currentStepData && (
                            <div style={{ position: "absolute", top: "16px", right: "16px", padding: "16px 20px", backgroundColor: "rgba(15,23,42,0.88)", backdropFilter: dark.backdrop, borderRadius: "12px", border: dark.glassBorder, boxShadow: dark.glassShadow, maxWidth: "280px", animation: "fadeIn 0.2s" }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: "10px" }}>
                                    Step {currentStep + 1} / {loadingSteps.length}
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: dark.text, marginBottom: "6px" }}>{currentStepData.placement.boxName}</div>
                                <div style={{ fontSize: "0.8rem", color: dark.textMuted, marginBottom: "3px" }}>Container: {currentStepData.containerName}</div>
                                <div style={{ fontSize: "0.8rem", color: dark.textDim }}>
                                    ({currentStepData.placement.x}, {currentStepData.placement.y}, {currentStepData.placement.z})
                                </div>
                            </div>
                        )}

                        {/* Playback controls – bottom */}
                        <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(15,23,42,0.88)", backdropFilter: dark.backdrop, borderRadius: "12px", border: dark.glassBorder, boxShadow: dark.glassShadow }}>
                            <button className="sv-ctrl-btn" onClick={handleReset} title="Reset" style={{ ...darkBtn(false, "gray"), padding: "7px 11px" }}>↺</button>
                            <button className="sv-ctrl-btn" onClick={handlePrev} disabled={currentStep === 0} style={{ ...darkBtn(false, "gray"), opacity: currentStep === 0 ? 0.35 : 1, padding: "7px 14px" }}>‹</button>

                            <button className="sv-ctrl-btn" onClick={handlePlayPause} style={{
                                padding: "7px 18px", borderRadius: "8px", border: isPlaying ? "1px solid rgba(239,68,68,0.35)" : `1px solid ${dark.blueBorder}`,
                                background: isPlaying ? "rgba(239,68,68,0.15)" : dark.blueGlass,
                                color: isPlaying ? "#fca5a5" : "#93c5fd",
                                cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700, transition: "all 0.2s",
                            }}>
                                {isPlaying ? "⏸ Pause" : "▶ Play"}
                            </button>

                            <button className="sv-ctrl-btn" onClick={handleNext} disabled={currentStep >= loadingSteps.length - 1} style={{ ...darkBtn(false, "gray"), opacity: currentStep >= loadingSteps.length - 1 ? 0.35 : 1, padding: "7px 14px" }}>›</button>
                            <button className="sv-ctrl-btn" onClick={handleJumpToEnd} title="Jump to end" style={{ ...darkBtn(false, "gray"), padding: "7px 11px" }}>⏭</button>

                            <input
                                className="sv-range"
                                type="range"
                                value={currentStep}
                                onChange={(e) => handleStepChange(parseInt(e.target.value))}
                                min={0}
                                max={Math.max(0, loadingSteps.length - 1)}
                                style={{ flex: 1, margin: "0 8px", accentColor: dark.blue, height: "4px" }}
                            />

                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: dark.textMuted, whiteSpace: "nowrap", minWidth: "72px", textAlign: "right" }}>
                                {currentStep + 1} / {loadingSteps.length}
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px", borderLeft: `1px solid ${dark.divider}`, paddingLeft: "12px" }}>
                                <span style={{ fontSize: "0.75rem", color: dark.textDim, whiteSpace: "nowrap" }}>Speed</span>
                                <input
                                    className="sv-range"
                                    type="range"
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                    min={0.5} max={5} step={0.5}
                                    style={{ width: "70px", accentColor: dark.blue }}
                                />
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#93c5fd", minWidth: "28px" }}>{playbackSpeed}x</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Side Panel ─── */}
                <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", minWidth: "280px" }}>
                    <div style={{ flex: 1, backgroundColor: dark.glass, backdropFilter: dark.backdrop, border: dark.glassBorder, borderRadius: "16px", boxShadow: dark.glassShadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                        {/* Controls section */}
                        <div style={{ padding: "20px", borderBottom: `1px solid ${dark.divider}` }}>
                            <p style={{ margin: "0 0 16px 0", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dark.textMuted }}>Visualization Controls</p>

                            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "12px" }}>
                                <input className="sv-checkbox" type="checkbox" checked={showFutureBoxes} onChange={(e) => setShowFutureBoxes(e.target.checked)} />
                                <span style={{ fontSize: "0.875rem", color: dark.textMuted, fontWeight: 500 }}>Show Future Boxes</span>
                            </label>

                            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: showAllContainers ? 0 : "16px" }}>
                                <input className="sv-checkbox" type="checkbox" checked={showAllContainers} onChange={(e) => setShowAllContainers(e.target.checked)} />
                                <span style={{ fontSize: "0.875rem", color: dark.textMuted, fontWeight: 500 }}>Show All Containers</span>
                            </label>

                            {!showAllContainers && containers.length > 0 && (
                                <div style={{ marginTop: "12px" }}>
                                    <p style={{ margin: "0 0 8px 0", fontSize: "0.75rem", color: dark.textDim, fontWeight: 600 }}>Select Container:</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {containers.map(container => (
                                            <button key={container.index} onClick={() => setActiveContainerIndex(container.index)} style={darkBtn(activeContainerIndex === container.index, "blue")}>
                                                {container.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Steps list */}
                        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dark.textMuted }}>Loading Steps</p>
                                <span style={{ fontSize: "0.7rem", color: dark.textDim, backgroundColor: "rgba(255,255,255,0.04)", border: dark.glassBorder, padding: "3px 8px", borderRadius: "6px" }}>X-axis order</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {loadingSteps.map((step, index) => {
                                    const isDone = index < currentStep;
                                    const isActive = index === currentStep;
                                    return (
                                        <div
                                            key={step.index}
                                            className="sv-step-item"
                                            onClick={() => handleStepChange(index)}
                                            style={{
                                                padding: "12px",
                                                backgroundColor: isActive ? dark.stepActive : isDone ? dark.stepDone : dark.stepFuture,
                                                borderLeft: `3px solid ${isActive ? dark.blue : isDone ? dark.green : "rgba(255,255,255,0.1)"}`,
                                                border: `1px solid ${isActive ? dark.stepActiveBorder : isDone ? dark.stepDoneBorder : dark.stepFutureBorder}`,
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                position: "relative",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                                <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: isActive ? dark.blue : isDone ? dark.green : "rgba(255,255,255,0.1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                                                    {isDone ? "✓" : index + 1}
                                                </div>
                                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: isActive ? "#93c5fd" : dark.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {step.placement.boxName}
                                                </span>
                                                <span style={{ fontSize: "0.7rem", padding: "2px 6px", backgroundColor: "rgba(255,255,255,0.05)", border: dark.glassBorder, borderRadius: "6px", color: dark.textDim, whiteSpace: "nowrap", flexShrink: 0 }}>
                                                    {step.containerName}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: dark.textDim, display: "flex", justifyContent: "space-between" }}>
                                                <span>({step.placement.x}, {step.placement.y}, {step.placement.z})</span>
                                                <span>{step.placement.dx}×{step.placement.dy}×{step.placement.dz}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}