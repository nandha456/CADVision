import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut, Move3d as Move3D, RotateCw } from 'lucide-react';
import type { CADModel } from '../../types';

interface ThreeViewerProps {
  model: CADModel | null;
  className?: string;
  onParameterChange?: (parameters: any) => void;
}

export default function ThreeViewer({ model, className = '', onParameterChange }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsEnabledRef = useRef(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState({
    scale: 1,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    mountRef.current.appendChild(renderer.domElement);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      if (!controlsEnabledRef.current) return;
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging || !controlsEnabledRef.current || !cameraRef.current) return;
      
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      // Rotate camera around scene
      const sphericalCoords = new THREE.Spherical();
      sphericalCoords.setFromVector3(cameraRef.current.position);
      
      sphericalCoords.theta -= deltaMove.x * 0.01;
      sphericalCoords.phi += deltaMove.y * 0.01;
      sphericalCoords.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalCoords.phi));

      cameraRef.current.position.setFromSpherical(sphericalCoords);
      cameraRef.current.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      if (!controlsEnabledRef.current || !cameraRef.current) return;
      
      const zoomSpeed = 0.001;
      const distance = cameraRef.current.position.length();
      const newDistance = Math.max(2, Math.min(50, distance + event.deltaY * zoomSpeed * distance));
      
      cameraRef.current.position.normalize().multiplyScalar(newDistance);
      event.preventDefault();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!model || !sceneRef.current) return;

    loadModel();
  }, [model]);

  const loadModel = async () => {
    if (!model || !sceneRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Remove existing mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        meshRef.current = null;
      }

      // Create placeholder geometry based on file type
      let geometry: THREE.BufferGeometry;
      
      switch (model.file_type) {
        case 'step':
          // For STEP files, create a more complex placeholder
          geometry = new THREE.BoxGeometry(
            model.dimensions.length || 2,
            model.dimensions.height || 2,
            model.dimensions.width || 2
          );
          break;
        case 'stl':
          // For STL files, create a mesh-like placeholder
          geometry = new THREE.CylinderGeometry(1, 1, 2, 8);
          break;
        case 'obj':
          // For OBJ files, create a faceted placeholder
          geometry = new THREE.OctahedronGeometry(1.5);
          break;
        default:
          geometry = new THREE.BoxGeometry(2, 2, 2);
      }

      const material = new THREE.MeshPhongMaterial({
        color: 0x4f46e5,
        shininess: 100,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Apply current parameters
      mesh.scale.set(parameters.scale, parameters.scale, parameters.scale);
      mesh.rotation.set(parameters.rotation.x, parameters.rotation.y, parameters.rotation.z);
      mesh.position.set(parameters.position.x, parameters.position.y, parameters.position.z);

      sceneRef.current.add(mesh);
      meshRef.current = mesh;
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setIsLoading(false);
    }
  };

  const updateParameter = (param: string, value: any) => {
    const newParameters = { ...parameters };
    
    if (param.includes('.')) {
      const [parent, child] = param.split('.');
      newParameters[parent as keyof typeof parameters] = {
        ...newParameters[parent as keyof typeof parameters],
        [child]: value,
      };
    } else {
      (newParameters as any)[param] = value;
    }
    
    setParameters(newParameters);
    onParameterChange?.(newParameters);

    // Apply to mesh
    if (meshRef.current) {
      if (param === 'scale') {
        meshRef.current.scale.set(value, value, value);
      } else if (param.startsWith('rotation.')) {
        const axis = param.split('.')[1] as 'x' | 'y' | 'z';
        meshRef.current.rotation[axis] = value;
      } else if (param.startsWith('position.')) {
        const axis = param.split('.')[1] as 'x' | 'y' | 'z';
        meshRef.current.position[axis] = value;
      }
    }
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const resetParameters = () => {
    const defaultParams = {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
    };
    setParameters(defaultParams);
    onParameterChange?.(defaultParams);
    
    if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.position.set(0, 0, 0);
    }
  };

  return (
    <div className={`flex flex-col bg-gray-50 ${className}`}>
      {/* Viewer Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={resetView}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={resetParameters}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Reset Parameters"
          >
            <Move3D className="w-4 h-4" />
          </button>
        </div>
        
        {model && (
          <div className="text-sm text-gray-600">
            {model.name} ({model.file_type.toUpperCase()})
          </div>
        )}
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading model...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Error loading model</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {!model && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Move3D className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Select a model to view</p>
            </div>
          </div>
        )}
      </div>

      {/* Parameter Controls */}
      {model && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Parameters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Scale */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scale</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={parameters.scale}
                onChange={(e) => updateParameter('scale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 text-center">{parameters.scale.toFixed(1)}x</div>
            </div>

            {/* Rotation Y */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.1"
                value={parameters.rotation.y}
                onChange={(e) => updateParameter('rotation.y', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 text-center">
                {Math.round(parameters.rotation.y * 180 / Math.PI)}°
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}