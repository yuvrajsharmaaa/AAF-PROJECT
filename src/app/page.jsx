"use client";
import React, { useState, useRef, useEffect } from 'react';

function MainComponent() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef();
  const [building, setBuilding] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    const loadGalleryImages = async () => {
      setIsGalleryLoading(true);
      try {
        const prompts = [
          "luxury penthouse interior with panoramic city views, modern design",
          "high-end building lobby with marble floors and crystal chandelier",
          "rooftop infinity pool with city skyline view at sunset",
          "modern fitness center with state-of-the-art equipment",
          "elegant resident lounge with fireplace and bar area",
          "landscaped garden terrace with seating areas",
        ];

        const imagePromises = prompts.map((prompt) =>
          fetch(
            `/integrations/dall-e-3/?prompt=${encodeURIComponent(prompt)}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(imagePromises);
        setGalleryImages(results.map((result) => result.data[0]));
      } catch (error) {
        console.error("No results found");
      }
      setIsGalleryLoading(false);
    };

    loadGalleryImages();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        const scene = new window.THREE.Scene();
        const camera = new window.THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        const renderer = new window.THREE.WebGLRenderer({ alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        canvasRef.current?.appendChild(renderer.domElement);

        const geometry = new window.THREE.BoxGeometry(5, 15, 5, 32, 32, 32);
        const material = new window.THREE.MeshPhysicalMaterial({
          color: 0x4a90e2,
          transparent: true,
          opacity: 0.9,
          metalness: 0.5,
          roughness: 0.2,
          reflectivity: 0.8,
          clearcoat: 0.3,
          clearcoatRoughness: 0.2,
        });
        const buildingMesh = new window.THREE.Mesh(geometry, material);
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        scene.add(buildingMesh);
        setBuilding(buildingMesh);
        setIsLoading(false);

        const mainLight = new window.THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        scene.add(mainLight);

        const fillLight = new window.THREE.DirectionalLight(0xffffff, 0.7);
        fillLight.position.set(-5, 8, -7);
        scene.add(fillLight);

        const ambientLight = new window.THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        camera.position.z = 20;
        camera.position.y = 8;
        camera.lookAt(0, 0, 0);

        const raycaster = new window.THREE.Raycaster();
        const mouse = new window.THREE.Vector2();
        const onMouseMove = (event) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(buildingMesh);

          if (intersects.length > 0) {
            const y = intersects[0].point.y;
            const floor = Math.floor((y + 5) / (10 / 6)) + 1;
            setHoveredFloor(floor);
            buildingMesh.material.color.setHex(0x4a90e2);
          } else {
            setHoveredFloor(null);
            buildingMesh.material.color.setHex(0xffffff);
          }
        };
        const onClick = () => {
          if (hoveredFloor) {
            setSelectedFloor(hoveredFloor);
          }
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("click", onClick);

        const animate = () => {
          requestAnimationFrame(animate);
          buildingMesh.rotation.y += 0.002;
          const hoverScale = hoveredFloor ? 1.02 : 1;
          buildingMesh.scale.lerp(
            new window.THREE.Vector3(hoverScale, hoverScale, hoverScale),
            0.1
          );
          buildingMesh.position.y = Math.sin(Date.now() * 0.0008) * 0.3;
          renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("click", onClick);
          renderer.dispose();
          canvasRef.current?.removeChild(renderer.domElement);
        };
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [hoveredFloor]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      <div ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/30" />
      <nav className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="font-playfair text-3xl text-white">Skyline Tower</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <i
              className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} text-2xl`}
            ></i>
          </button>
          <div className={`${isMenuOpen ? "block" : "hidden"} md:block`}>
            <div className="flex flex-col md:flex-row gap-6 text-white/90">
              <button className="hover:text-[#4a90e2] transition-colors">
                Overview
              </button>
              <button className="hover:text-[#4a90e2] transition-colors">
                Amenities
              </button>
              <button className="hover:text-[#4a90e2] transition-colors">
                Gallery
              </button>
              <button className="hover:text-[#4a90e2] transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-20">
            <h2 className="font-playfair text-6xl mb-6 text-white">
              Redefining Urban Living
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
              Experience luxury at new heights in our architectural masterpiece,
              where every floor tells a story of sophistication and style.
            </p>
            <button className="bg-[#4a90e2] text-white px-8 py-4 rounded-lg hover:bg-[#357abd] transition-colors text-lg font-semibold">
              Explore Floors
            </button>
          </section>

          <section className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-black/50 p-8 rounded-xl backdrop-blur-md text-white">
              <h3 className="font-playfair text-3xl mb-6">
                Interactive Building Guide
              </h3>
              <p className="mb-6 text-white/80">
                Hover over the building to explore different floors. Click to
                view detailed information about each level.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`p-4 border ${
                      selectedFloor === floor
                        ? "border-[#4a90e2] bg-[#4a90e2]/20"
                        : "border-white/20"
                    } rounded-lg hover:border-[#4a90e2] transition-all`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/50 p-8 rounded-xl backdrop-blur-md text-white">
              <h3 className="font-playfair text-3xl mb-4">
                Floor {selectedFloor} Details
              </h3>
              <p className="text-white/80 mb-6">
                Discover the unique features and amenities available on this
                level.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <i className="fas fa-expand-arrows-alt mr-3 text-[#4a90e2]"></i>
                  <span>3,500 sq ft of luxury space</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-door-open mr-3 text-[#4a90e2]"></i>
                  <span>Private elevator access</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-mountain mr-3 text-[#4a90e2]"></i>
                  <span>Panoramic city views</span>
                </li>
              </ul>
              <button className="w-full bg-[#4a90e2] text-white py-4 rounded-lg hover:bg-[#357abd] transition-colors">
                Schedule a Tour
              </button>
            </div>
          </section>
        </div>
      </main>

      <section className="relative z-10 py-20 px-4 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair text-4xl text-white mb-12 text-center">
            Gallery
          </h2>
          {isGalleryLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-xl">Loading Gallery...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`Luxury building feature ${index + 1}`}
                    className="w-full h-[300px] object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-[#4a90e2] text-white px-6 py-2 rounded-lg hover:bg-[#357abd] transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 bg-black/70 text-white py-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-playfair text-xl mb-4">Contact</h4>
            <p className="text-white/80">123 Skyline Avenue</p>
            <p className="text-white/80">Metropolis, MP 12345</p>
            <p className="text-white/80">info@skylinetower.com</p>
          </div>
          <div>
            <h4 className="font-playfair text-xl mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button className="block text-white/80 hover:text-[#4a90e2] transition-colors">
                Virtual Tour
              </button>
              <button className="block text-white/80 hover:text-[#4a90e2] transition-colors">
                Availability
              </button>
              <button className="block text-white/80 hover:text-[#4a90e2] transition-colors">
                News
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-playfair text-xl mb-4">Connect</h4>
            <div className="flex gap-4">
              <button className="text-2xl text-white/80 hover:text-[#4a90e2] transition-colors">
                <i className="fab fa-instagram"></i>
              </button>
              <button className="text-2xl text-white/80 hover:text-[#4a90e2] transition-colors">
                <i className="fab fa-twitter"></i>
              </button>
              <button className="text-2xl text-white/80 hover:text-[#4a90e2] transition-colors">
                <i className="fab fa-linkedin"></i>
              </button>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-white text-xl">Loading 3D Model...</div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;