
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NoisyNebulaShader: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const nebulaRenderer = new NoisyNebulaRenderer(mount);
    return () => {
      nebulaRenderer.cleanup();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

class NoisyNebulaRenderer {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private startTime: number;

  constructor(mount: HTMLDivElement) {
    this.container = mount;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'webgl';
    mount.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.startTime = Date.now();

    const { width, height } = this.getWindowSize();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform vec3 iResolution;
        uniform float iTime;

        #define scale 90.
        #define thickness 0.0
        #define lengt 0.13
        #define layers 15.
        #define time iTime*3.

        vec2 hash12(float p) {
          return fract(vec2(sin(p * 591.32), cos(p * 391.32)));
        }

        float hash21(in vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        vec2 hash22(in vec2 p) {
          p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
          return fract(sin(p)*43758.5453);
        }

        mat2 makem2(in float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c,-s,s,c);
        }

        float field1(in vec2 p) {
          vec2 n = floor(p)-0.5;
          vec2 f = fract(p)-0.5;
          vec2 o = hash22(n)*.35;
          vec2 r = - f - o;
          r *= makem2(time+hash21(n)*3.14);
          
          float d = 1.0-smoothstep(thickness,thickness+0.09,abs(r.x));
          d *= 1.-smoothstep(lengt,lengt+0.02,abs(r.y));
          
          float d2 = 1.0-smoothstep(thickness,thickness+0.09,abs(r.y));
          d2 *= 1.-smoothstep(lengt,lengt+0.02,abs(r.x));
          
          return max(d,d2);
        }

        void main() {
          vec2 fragCoord = vUv * iResolution.xy;
          vec2 p = fragCoord.xy / iResolution.xy-0.5;
          p.x *= iResolution.x/iResolution.y;
          
          float mul = (iResolution.x+iResolution.y)/scale;
          
          vec3 col = vec3(0);
          for (float i=0.;i <layers;i++) {
            vec2 ds = hash12(i*2.5)*.20;
            col = max(col,field1((p+ds)*mul)*(sin(ds.x*5100. + vec3(1.,2.,3.5))*.4+.6));
          }
          
          gl_FragColor = vec4(col,1.0);
        }
      `,
      uniforms: {
        iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
        iTime: { value: 0.0 }
      },
      transparent: true
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.mesh);
    this.initEventListeners();
    this.animate();
  }

  private getWindowSize() {
    const rect = this.container.getBoundingClientRect();
    return { width: window.innerWidth, height: rect.height || window.innerHeight };
  }

  private initEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize() {
    const { width, height } = this.getWindowSize();
    this.renderer.setSize(width, height);
    this.material.uniforms.iResolution.value.set(width, height, 1);
  }

  private animate() {
    const time = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.iTime.value = time;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  public cleanup() {
    window.removeEventListener('resize', () => this.handleResize());
    this.renderer.dispose();
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

export default NoisyNebulaShader;
