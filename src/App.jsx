import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import {
  CanvasTexture,
  ExtrudeGeometry,
  MathUtils,
  Plane,
  Quaternion,
  Raycaster,
  SRGBColorSpace,
  Shape,
  Spherical,
  Vector2,
  Vector3,
} from "three";
import gsap from "gsap";
import { portfolioContent } from "./portfolioContent";
import "./App.css";

const portfolioSections = ["intro", "about", "projects", "skills", "contact"];
const sectionLabels = {
  intro: "Home",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  contact: "Contact",
};
const faceButtonSections = {
  A: "about",
  S: "skills",
  P: "projects",
  C: "contact",
};
const faceButtonColors = {
  A: "#ffd84a",
  S: "#ff4664",
  P: "#57e879",
  C: "#4b9cff",
};

function PortfolioInterface({ activeSection, onNavigate, onClose }) {
  const content = portfolioContent;
  const scrollRef = useRef(null);
  const [typedWord, setTypedWord] = useState("experiences");
  const [visibleSection, setVisibleSection] = useState(activeSection);

  useEffect(() => {
    const words = ["experiences", "products", "interfaces", "solutions"];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      let wordIndex = 0;
      const intervalId = window.setInterval(() => {
        wordIndex = (wordIndex + 1) % words.length;
        setTypedWord(words[wordIndex]);
      }, 3000);
      return () => window.clearInterval(intervalId);
    }

    let wordIndex = 0;
    let characterIndex = words[0].length;
    let deleting = false;
    let timeoutId;

    function tick() {
      const word = words[wordIndex];
      if (deleting && characterIndex > 1) {
        characterIndex -= 1;
        setTypedWord(word.slice(0, characterIndex));
        timeoutId = window.setTimeout(tick, 42);
        return;
      }

      if (deleting) {
        wordIndex = (wordIndex + 1) % words.length;
        characterIndex = 1;
        deleting = false;
        setTypedWord(words[wordIndex].slice(0, characterIndex));
        timeoutId = window.setTimeout(tick, 82);
        return;
      }

      if (characterIndex < word.length) {
        characterIndex += 1;
        setTypedWord(words[wordIndex].slice(0, characterIndex));
        timeoutId = window.setTimeout(tick, 82);
        return;
      }

      deleting = true;
      timeoutId = window.setTimeout(tick, 2000);
    }

    timeoutId = window.setTimeout(tick, 2000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const targetId = activeSection === "intro" ? "home" : activeSection;
    const target = container.querySelector(`#${targetId}`);
    if (target) container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  }, [activeSection]);

  const updateActiveSection = (event) => {
    const container = event.currentTarget;
    const marker = container.scrollTop + container.clientHeight * 0.32;
    const sections = [...container.querySelectorAll("[data-portfolio-section]")];
    const active = sections.reduce(
      (current, section) => section.offsetTop <= marker ? section : current,
      sections[0],
    );
    const sectionName = active?.id === "home" ? "intro" : active?.id;
    if (sectionName) setVisibleSection(sectionName);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio enquiry from ${formData.get("name")}`);
    const body = encodeURIComponent(
      `${formData.get("message")}\n\nReply to: ${formData.get("email")}`,
    );
    window.location.href = `mailto:${content.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="monitor-portfolio portfolio-site">
      <header className="site-topbar">
        <a
          className="site-brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("intro");
          }}
        >
          {content.name}
        </a>
        <nav className="site-nav" aria-label="Portfolio sections">
          {portfolioSections.map((section) => (
            <button
              aria-current={visibleSection === section ? "page" : undefined}
              className={visibleSection === section ? "is-active" : ""}
              key={section}
              onClick={() => onNavigate(section)}
              type="button"
            >
              {sectionLabels[section]}
            </button>
          ))}
        </nav>
        <div className="site-window-actions">
          <a className="site-contact-link" href={`mailto:${content.email}`}>
            Let&apos;s talk <span aria-hidden="true">↗</span>
          </a>
          <button
            aria-label="Close portfolio"
            className="screen-close"
            onClick={onClose}
            title="Close portfolio"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>
      <main className="site-scroll" onScroll={updateActiveSection} ref={scrollRef} tabIndex="-1">
        <section
          aria-labelledby="portfolio-home-title"
          className="site-hero"
          data-portfolio-section
          id="home"
        >
          <div className="site-hero-copy">
            <div className="site-hero-tag"><span aria-hidden="true" />{content.role}</div>
            <h1 id="portfolio-home-title">
              I build thoughtful
              <span className="site-accent-line">
                {typedWord}<span className="site-typed-cursor" aria-hidden="true" />
              </span>
              for the web.
            </h1>
            <p className="site-hero-sub">{content.introduction}</p>
            <div className="site-hero-ctas">
              <button className="site-button site-button-primary" onClick={() => onNavigate("projects")} type="button">
                Explore my work <span aria-hidden="true">↗</span>
              </button>
              <button className="site-button site-button-ghost" onClick={() => onNavigate("contact")} type="button">
                Get in touch
              </button>
            </div>
            <span className="site-location">{content.location}</span>
          </div>
          <div className="site-hero-visual">
            <div className="site-orbit site-orbit-one" />
            <div className="site-orbit site-orbit-two" />
            <div className="site-portrait">
              <img src={content.profileImage} alt={`Portrait of ${content.name}`} />
              <span className="site-image-badge"><span aria-hidden="true" />Open to collaboration</span>
            </div>
          </div>
          <div className="site-scroll-hint" aria-hidden="true"><span />Scroll to explore</div>
        </section>

        <section aria-labelledby="portfolio-about-title" className="site-section site-about" data-portfolio-section id="about">
          <p className="site-section-label">01 — A LITTLE ABOUT ME</p>
          <div className="site-about-grid">
            <h2 className="site-section-title" id="portfolio-about-title">Make it useful.<br />Make it <em>memorable.</em></h2>
            <div className="site-about-copy">
              <p>{content.about}</p>
              <div className="site-stats">
                <div><strong>{String(content.projects.length).padStart(2, "0")}</strong><span>Selected projects</span></div>
                <div><strong>{String(content.skills.length).padStart(2, "0")}</strong><span>Tools in my toolkit</span></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="portfolio-projects-title" className="site-section" data-portfolio-section id="projects">
          <p className="site-section-label">02 — A FEW CONCEPTS & CASE STUDIES</p>
          <h2 className="site-section-title" id="portfolio-projects-title">Selected work</h2>
          <div className="site-project-list">
            {content.projects.map((project, index) => {
              const projectDetails = (
                <>
                  <span className="site-project-number">0{index + 1}</span>
                  <div className="site-project-info">
                    <p>{project.category}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <span className="site-project-tag">
                      {project.url ? "Open project" : "Link coming soon"}
                    </span>
                  </div>
                  <span className="site-project-arrow" aria-hidden="true">
                    {project.url ? "↗" : "…"}
                  </span>
                </>
              );

              return project.url ? (
                <a
                  aria-label={`Open ${project.name} in a new tab`}
                  className="site-project-card"
                  href={project.url}
                  key={project.name}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {projectDetails}
                </a>
              ) : (
                <article className="site-project-card" key={project.name}>
                  {projectDetails}
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="portfolio-skills-title" className="site-section" data-portfolio-section id="skills">
          <p className="site-section-label">03 — TOOLS I LIKE TO USE</p>
          <h2 className="site-section-title" id="portfolio-skills-title">Good ideas, carefully built.</h2>
          <div className="site-skills-grid">
            {content.skills.map((skill, index) => (
              <article className="site-skill-card" key={skill}>
                <span className="site-skill-index">0{index + 1}</span>
                <span className="site-skill-mark" aria-hidden="true">{skill.slice(0, 2).toUpperCase()}</span>
                <h3>{skill}</h3>
                <p>Part of my toolkit for thoughtful digital work.</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="portfolio-contact-title" className="site-section site-contact" data-portfolio-section id="contact">
          <p className="site-section-label">04 — HAVE A GOOD ONE IN MIND?</p>
          <div className="site-contact-grid">
            <div>
              <h2 className="site-section-title" id="portfolio-contact-title">Let&apos;s make something <em>matter.</em></h2>
              <p className="site-contact-copy">Have a project, a question, or just want to say hello? I&apos;d love to hear from you.</p>
              <a className="site-email-card" href={`mailto:${content.email}`}>
                <span>Email</span><strong>{content.email}</strong><span aria-hidden="true">↗</span>
              </a>
            </div>
            <form className="site-contact-form" onSubmit={sendMessage}>
              <label>Your name<input autoComplete="name" name="name" placeholder="Name" required /></label>
              <label>Your email<input autoComplete="email" name="email" placeholder="you@example.com" required type="email" /></label>
              <label>Message<textarea name="message" placeholder="Tell me a little about it..." required rows="3" /></label>
              <button className="site-button site-button-primary" type="submit">Send message <span aria-hidden="true">↗</span></button>
              <p className="site-form-note">This opens your email app with the message ready to send.</p>
            </form>
          </div>
        </section>
        <footer className="site-footer">
          <span>{content.name} · Designed with intention</span>
          <span>Built for the web <span aria-hidden="true">✦</span></span>
        </footer>
      </main>
    </div>
  );
}

function DesktopWallpaper({ onOpenPortfolio }) {
  return (
    <div className="desktop-wallpaper">
      <div className="desktop-wallpaper-backdrop" aria-hidden="true">
        <img alt="" draggable={false} src="/image.jpg" />
      </div>
      <img
        alt="Personal photo displayed as desktop wallpaper"
        className="desktop-wallpaper-photo"
        draggable={false}
        src="/image.jpg"
      />
      <button
        aria-label="Open My Portfolio"
        className="desktop-shortcut"
        onClick={onOpenPortfolio}
        type="button"
      >
        <span className="desktop-shortcut-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="presentation">
            <rect x="6" y="7" width="36" height="27" rx="4" />
            <path d="M18 41h12M24 34v7M11 27h26" />
            <path className="desktop-shortcut-initial" d="m18 22 5-12 5 12m-8-4h6" />
          </svg>
        </span>
        <span>My Portfolio</span>
      </button>
    </div>
  );
}

function ControllerButton({
  position,
  letter,
  buttonRefs,
  onActivate,
}) {
  const { press: pressRef, light: lightRef, material: materialRef } = buttonRefs;
  const buttonColor = faceButtonColors[letter];

  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onActivate?.(letter, buttonRefs);
      }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.205, 0.225, 0.095, 48]} />
        <meshStandardMaterial
          color="#25232d"
          metalness={0.68}
          roughness={0.31}
        />
      </mesh>
      <mesh position={[0, 0, 0.044]}>
        <torusGeometry args={[0.165, 0.012, 8, 48]} />
        <meshStandardMaterial
          color="#494651"
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>
      <group ref={pressRef} position={[0, 0, 0.055]}>
        <mesh>
          <circleGeometry args={[0.112, 40]} />
          <meshStandardMaterial
            color="#22212a"
            metalness={0.5}
            roughness={0.35}
          />
        </mesh>
        <FaceButtonGlyph
          letter={letter}
          materialRef={materialRef}
          color={buttonColor}
        />
      </group>
      <mesh position={[0, 0, 0.043]}>
        <torusGeometry args={[0.126, 0.006, 8, 40]} />
        <meshBasicMaterial
          color={buttonColor}
          toneMapped={false}
          transparent
          opacity={0.42}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={buttonColor}
        intensity={0.12}
        distance={0.58}
        decay={2}
        position={[0, 0, 0.15]}
      />
    </group>
  );
}

function FaceButtonGlyph({ letter, materialRef, color }) {
  const glyphTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create the controller button label.");
    }
    context.fillStyle = "#ffffff";
    context.font = "700 184px Arial, Helvetica, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(letter, 128, 133);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [letter]);

  useEffect(() => () => glyphTexture.dispose(), [glyphTexture]);

  return (
    <mesh position={[0, 0, 0.006]}>
      <circleGeometry args={[0.096, 48]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ffffff"
        map={glyphTexture}
        transparent
        alphaTest={0.05}
        emissive={color}
        emissiveMap={glyphTexture}
        emissiveIntensity={0.62}
        toneMapped={false}
        roughness={0.36}
      />
    </mesh>
  );
}

function AnalogStick({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.025]}>
        <torusGeometry args={[0.29, 0.018, 8, 48]} />
        <meshStandardMaterial
          color="#66616e"
          metalness={0.78}
          roughness={0.31}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.32, 0.12, 48]} />
        <meshStandardMaterial color="#17161e" roughness={0.43} />
      </mesh>
      <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.23, 0.13, 48]} />
        <meshStandardMaterial
          color="#484452"
          metalness={0.32}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 0, 0.155]}>
        <circleGeometry args={[0.13, 48]} />
        <meshStandardMaterial color="#35323e" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0, 0.158]}>
        <torusGeometry args={[0.105, 0.006, 6, 36]} />
        <meshStandardMaterial color="#5b5664" roughness={0.5} />
      </mesh>
    </group>
  );
}

function GripPanel({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <RoundedBox args={[0.34, 0.68, 0.035]} radius={0.16} smoothness={8}>
        <meshStandardMaterial color="#302e38" roughness={0.68} />
      </RoundedBox>
      {[-0.22, -0.11, 0, 0.11, 0.22].map((y) => (
        <RoundedBox
          key={y}
          args={[0.2, 0.018, 0.018]}
          radius={0.008}
          smoothness={3}
          position={[0, y, 0.022]}
        >
          <meshStandardMaterial color="#55515e" roughness={0.62} />
        </RoundedBox>
      ))}
    </group>
  );
}

function createControllerShell() {
  const shape = new Shape();
  shape.moveTo(-1.72, 0.58);
  shape.bezierCurveTo(-1.25, 0.82, -0.8, 0.81, -0.38, 0.72);
  shape.bezierCurveTo(-0.12, 0.65, 0.12, 0.65, 0.38, 0.72);
  shape.bezierCurveTo(0.8, 0.81, 1.25, 0.82, 1.72, 0.58);
  shape.bezierCurveTo(1.98, 0.48, 2.01, 0.21, 1.91, -0.11);
  shape.bezierCurveTo(1.78, -0.59, 1.58, -1.19, 1.34, -1.48);
  shape.bezierCurveTo(1.1, -1.78, 0.8, -1.68, 0.63, -1.33);
  shape.bezierCurveTo(0.43, -0.94, 0.28, -0.61, 0, -0.57);
  shape.bezierCurveTo(-0.28, -0.61, -0.43, -0.94, -0.63, -1.33);
  shape.bezierCurveTo(-0.8, -1.68, -1.1, -1.78, -1.34, -1.48);
  shape.bezierCurveTo(-1.58, -1.19, -1.78, -0.59, -1.91, -0.11);
  shape.bezierCurveTo(-2.01, 0.21, -1.98, 0.48, -1.72, 0.58);
  return shape;
}

function Controller({
  buttonRefs,
  onFaceButton,
}) {
  const shellShape = useMemo(() => createControllerShell(), []);
  const shellOptions = useMemo(
    () => ({
      depth: 0.48,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.075,
      bevelThickness: 0.085,
      steps: 1,
      curveSegments: 16,
    }),
    [],
  );
  const shellGeometry = useMemo(
    () => new ExtrudeGeometry(shellShape, shellOptions),
    [shellShape, shellOptions],
  );

  return (
    <group
      position={[-4.15, -0.42, -0.05]}
      rotation={[0.08, 0.35, -0.025]}
      scale={0.7}
    >
      <mesh
        position={[0, 0, -0.31]}
        castShadow
        receiveShadow
        geometry={shellGeometry}
      >
        <meshStandardMaterial
          color="#45434e"
          metalness={0.38}
          roughness={0.36}
        />
      </mesh>

      <RoundedBox
        args={[1.1, 0.105, 0.07]}
        radius={0.05}
        smoothness={6}
        position={[0, 0.57, 0.17]}
      >
        <meshStandardMaterial
          color="#17161e"
          metalness={0.65}
          roughness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.72, 0.17, 0.36]}
        radius={0.08}
        smoothness={8}
        position={[-1.12, 0.62, 0.16]}
        rotation={[0.08, 0, 0.025]}
        castShadow
      >
        <meshStandardMaterial color="#18171e" metalness={0.7} roughness={0.25} />
      </RoundedBox>
      <RoundedBox
        args={[0.62, 0.11, 0.26]}
        radius={0.05}
        smoothness={6}
        position={[-1.1, 0.72, -0.16]}
        rotation={[-0.12, 0, 0.025]}
        castShadow
      >
        <meshStandardMaterial color="#24232d" metalness={0.55} roughness={0.34} />
      </RoundedBox>
      <RoundedBox
        args={[0.62, 0.11, 0.26]}
        radius={0.05}
        smoothness={6}
        position={[1.1, 0.72, -0.16]}
        rotation={[-0.12, 0, -0.025]}
        castShadow
      >
        <meshStandardMaterial color="#24232d" metalness={0.55} roughness={0.34} />
      </RoundedBox>
      <RoundedBox
        args={[0.72, 0.17, 0.36]}
        radius={0.08}
        smoothness={8}
        position={[1.12, 0.62, 0.16]}
        rotation={[0.08, 0, -0.025]}
        castShadow
      >
        <meshStandardMaterial color="#18171e" metalness={0.7} roughness={0.25} />
      </RoundedBox>

      <GripPanel position={[-1.48, -0.94, 0.2]} rotation={0.18} />
      <GripPanel position={[1.48, -0.94, 0.2]} rotation={-0.18} />

      <AnalogStick position={[-0.76, 0.14, 0.235]} />
      <AnalogStick position={[0.48, -0.19, 0.235]} />

      <group position={[-1.28, 0.06, 0.22]}>
        <RoundedBox args={[0.19, 0.58, 0.12]} radius={0.055} smoothness={6}>
          <meshStandardMaterial color="#111016" metalness={0.36} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.58, 0.19, 0.12]} radius={0.055} smoothness={6}>
          <meshStandardMaterial color="#111016" metalness={0.36} roughness={0.4} />
        </RoundedBox>
      </group>

      <ControllerButton
        position={[1.13, 0.27, 0.23]}
        letter="A"
        buttonRefs={buttonRefs.A}
        onActivate={onFaceButton}
      />
      <ControllerButton
        position={[1.42, 0, 0.23]}
        letter="S"
        buttonRefs={buttonRefs.S}
        onActivate={onFaceButton}
      />
      <ControllerButton
        position={[1.13, -0.27, 0.23]}
        letter="P"
        buttonRefs={buttonRefs.P}
        onActivate={onFaceButton}
      />
      <ControllerButton
        position={[0.84, 0, 0.23]}
        letter="C"
        buttonRefs={buttonRefs.C}
        onActivate={onFaceButton}
      />

      <group position={[0, -0.025, 0.215]}>
        <RoundedBox args={[0.32, 0.09, 0.065]} radius={0.04} smoothness={5}>
          <meshStandardMaterial color="#16151b" metalness={0.52} roughness={0.32} />
        </RoundedBox>
        <RoundedBox
          args={[0.32, 0.09, 0.065]}
          radius={0.04}
          smoothness={5}
          position={[0.43, 0, 0]}
        >
          <meshStandardMaterial color="#16151b" metalness={0.52} roughness={0.32} />
        </RoundedBox>
        <mesh position={[0.215, 0, 0.04]}>
          <circleGeometry args={[0.027, 24]} />
          <meshBasicMaterial color="#6b51a1" />
        </mesh>
      </group>
    </group>
  );
}

function Monitor({
  portfolioVisible,
  portfolioOpen,
  activeSection,
  onNavigate,
  onMonitorScreenVisible,
  onOpenPortfolio,
  onClosePortfolio,
}) {
  const monitorRef = useRef(null);
  const worldPosition = useMemo(() => new Vector3(), []);
  const frontNormal = useMemo(() => new Vector3(), []);
  const cameraOffset = useMemo(() => new Vector3(), []);
  const worldQuaternion = useMemo(() => new Quaternion(), []);
  const { camera } = useThree();
  const [frontFacing, setFrontFacing] = useState(true);
  const frontFacingRef = useRef(true);

  useFrame(() => {
    const monitor = monitorRef.current;
    if (!monitor) return;

    monitor.getWorldPosition(worldPosition);
    monitor.getWorldQuaternion(worldQuaternion);
    frontNormal.set(0, 0, 1).applyQuaternion(worldQuaternion);
    cameraOffset.copy(camera.position).sub(worldPosition);
    const isFrontFacing = frontNormal.dot(cameraOffset) > 0;
    if (frontFacingRef.current !== isFrontFacing) {
      frontFacingRef.current = isFrontFacing;
      setFrontFacing(isFrontFacing);
      onMonitorScreenVisible(portfolioVisible && isFrontFacing);
    }
  });

  return (
    <group ref={monitorRef} position={[0, 0.45, -2.85]}>
      <RoundedBox args={[4.55, 2.65, 0.2]} radius={0.1} smoothness={8} castShadow>
        <meshStandardMaterial
          color="#13131a"
          metalness={0.55}
          roughness={0.32}
        />
      </RoundedBox>
      <RoundedBox
        args={[4.34, 2.44, 0.025]}
        radius={0.035}
        smoothness={6}
        position={[0, 0, 0.115]}
      >
        <meshBasicMaterial color="#11172f" />
      </RoundedBox>
      <RoundedBox
        args={[4.22, 2.32, 0.075]}
        radius={0.09}
        smoothness={7}
        position={[0, 0, -0.14]}
        castShadow
      >
        <meshStandardMaterial
          color="#343644"
          emissive="#11131b"
          emissiveIntensity={0.75}
          metalness={0.48}
          roughness={0.38}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.72, 1.12, 0.055]}
        radius={0.09}
        smoothness={6}
        position={[0, 0, -0.205]}
      >
        <meshStandardMaterial
          color="#252833"
          emissive="#111626"
          emissiveIntensity={0.7}
          metalness={0.58}
          roughness={0.42}
        />
      </RoundedBox>
      <mesh position={[0, 0, -0.236]}>
        <boxGeometry args={[0.92, 0.46, 0.018]} />
        <meshStandardMaterial color="#171a22" metalness={0.72} roughness={0.38} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={`rear-vent-${index}`} position={[0, 0.34 - index * 0.065, -0.239]}>
          <boxGeometry args={[1.3, 0.018, 0.012]} />
          <meshStandardMaterial color="#4b4e5d" metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.52, -0.24]}>
        <boxGeometry args={[2.9, 0.025, 0.012]} />
        <meshBasicMaterial color="#346b9b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.24]}>
        <boxGeometry args={[3.9, 0.018, 0.012]} />
        <meshStandardMaterial color="#363743" metalness={0.45} roughness={0.42} />
      </mesh>
      {[ -1.45, -1.1, -0.75, 0.75, 1.1, 1.45 ].map((x) => (
        <mesh key={x} position={[x, 0, -0.24]}>
          <boxGeometry args={[0.12, 0.014, 0.012]} />
          <meshStandardMaterial color="#353640" metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
      {portfolioVisible && frontFacing && (
        <Html
          center
          distanceFactor={1.6}
          position={[0, 0, 0.13]}
          transform
          zIndexRange={[20, 0]}
        >
          {portfolioOpen ? (
            <PortfolioInterface
              activeSection={activeSection}
              onNavigate={onNavigate}
              onClose={onClosePortfolio}
            />
          ) : (
            <DesktopWallpaper onOpenPortfolio={onOpenPortfolio} />
          )}
        </Html>
      )}
      <mesh position={[0, -1.62, -0.04]} castShadow>
        <boxGeometry args={[0.22, 0.9, 0.2]} />
        <meshStandardMaterial color="#17161d" metalness={0.58} roughness={0.35} />
      </mesh>
      <RoundedBox
        args={[1.4, 0.12, 0.65]}
        radius={0.055}
        smoothness={5}
        position={[0, -2.08, 0.02]}
        castShadow
      >
        <meshStandardMaterial color="#19181f" metalness={0.52} roughness={0.36} />
      </RoundedBox>
      <mesh position={[2.02, -1.27, 0.12]}>
        <circleGeometry args={[0.025, 24]} />
        <meshBasicMaterial color="#687dff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function DesktopTower() {
  return (
    <group position={[2.85, -0.55, -1.95]}>
      <RoundedBox
        args={[1.3, 2.35, 1.25]}
        radius={0.12}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#282731" metalness={0.4} roughness={0.34} />
      </RoundedBox>
      <RoundedBox
        args={[1.04, 2.08, 0.035]}
        radius={0.075}
        smoothness={6}
        position={[0, 0, 0.685]}
      >
        <meshPhysicalMaterial
          color="#34394c"
          metalness={0.18}
          roughness={0.19}
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.9, 1.83, 0.055]}
        radius={0.045}
        smoothness={5}
        position={[-0.025, 0, 0.53]}
      >
        <meshStandardMaterial
          color="#1b1e28"
          metalness={0.48}
          roughness={0.4}
        />
      </RoundedBox>

      {[-0.31, -0.02].map((x, index) => (
        <RoundedBox
          key={`memory-${x}`}
          args={[0.095, 0.7, 0.07]}
          radius={0.025}
          smoothness={4}
          position={[x, -0.02, 0.61]}
        >
          <meshStandardMaterial
            color="#242330"
            emissive={index === 0 ? "#6427bb" : "#164e9d"}
            emissiveIntensity={0.28}
            metalness={0.62}
            roughness={0.3}
          />
        </RoundedBox>
      ))}

      {[0, 1].map((index) => (
        <group
          key={`intake-fan-${index}`}
          position={[-0.27, 0.47 - index * 0.54, 0.64]}
        >
          <mesh>
            <ringGeometry args={[0.17, 0.205, 48]} />
            <meshBasicMaterial color={index === 0 ? "#9b54ff" : "#338dff"} toneMapped={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.135, 0.15, 40]} />
            <meshBasicMaterial color="#707183" />
          </mesh>
          <mesh>
            <circleGeometry args={[0.055, 32]} />
            <meshStandardMaterial color="#444651" metalness={0.65} roughness={0.28} />
          </mesh>
          {[0, 1, 2, 3].map((blade) => (
            <mesh
              key={blade}
              position={[0, 0, 0.006]}
              rotation={[0, 0, (Math.PI / 2) * blade + Math.PI / 4]}
            >
              <boxGeometry args={[0.018, 0.22, 0.008]} />
              <meshBasicMaterial color="#50515f" />
            </mesh>
          ))}
        </group>
      ))}

      <RoundedBox
        args={[0.88, 0.42, 0.18]}
        radius={0.045}
        smoothness={6}
        position={[0.12, -0.67, 0.6]}
        castShadow
      >
        <meshStandardMaterial color="#252631" metalness={0.72} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0.12, -0.67, 0.697]}>
        <boxGeometry args={[0.68, 0.026, 0.012]} />
        <meshBasicMaterial color="#31b7ff" toneMapped={false} />
      </mesh>
      {[-0.16, 0.12, 0.4].map((x, index) => (
        <group key={`gpu-fan-${x}`} position={[x, -0.67, 0.704]}>
          <mesh>
            <ringGeometry args={[0.092, 0.112, 40]} />
            <meshBasicMaterial
              color={["#8d45ff", "#318bff", "#df55d7"][index]}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <circleGeometry args={[0.078, 32]} />
            <meshBasicMaterial color="#171820" />
          </mesh>
          <mesh>
            <circleGeometry args={[0.023, 24]} />
            <meshStandardMaterial color="#686977" metalness={0.7} roughness={0.25} />
          </mesh>
          {[0, 1, 2].map((blade) => (
            <mesh
              key={blade}
              position={[0, 0, 0.003]}
              rotation={[0, 0, (Math.PI * 2 * blade) / 3]}
            >
              <boxGeometry args={[0.012, 0.12, 0.004]} />
              <meshBasicMaterial color="#535562" />
            </mesh>
          ))}
        </group>
      ))}
      <RoundedBox
        args={[0.14, 0.55, 0.07]}
        radius={0.025}
        smoothness={4}
        position={[0.38, 0.38, 0.6]}
      >
        <meshStandardMaterial
          color="#20232d"
          emissive="#25a9dc"
          emissiveIntensity={0.48}
          metalness={0.58}
          roughness={0.32}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.24, 0.24, 0.08]}
        radius={0.04}
        smoothness={5}
        position={[0.24, 0.45, 0.63]}
      >
        <meshStandardMaterial color="#363843" metalness={0.64} roughness={0.27} />
      </RoundedBox>
      <mesh position={[0.24, 0.45, 0.678]}>
        <ringGeometry args={[0.075, 0.09, 40]} />
        <meshBasicMaterial color="#9f51ff" toneMapped={false} />
      </mesh>
      <mesh position={[0.24, 0.45, 0.68]}>
        <circleGeometry args={[0.052, 32]} />
        <meshBasicMaterial color="#1b1c25" />
      </mesh>
      {[0, 1, 2].map((line) => (
        <mesh key={`board-trace-${line}`} position={[0.22 + line * 0.08, 0.06, 0.615]}>
          <boxGeometry args={[0.012, 0.17, 0.008]} />
          <meshBasicMaterial color={line === 1 ? "#3b83cd" : "#554b6a"} />
        </mesh>
      ))}
      <pointLight
        position={[0.1, -0.25, 0.45]}
        color="#8b45ff"
        intensity={2.8}
        distance={2.6}
      />
      <pointLight
        position={[-0.24, -0.7, 0.48]}
        color="#278dff"
        intensity={1.8}
        distance={2.1}
      />
    </group>
  );
}

function Desk() {
  return (
    <>
      <mesh position={[0, -1.76, -1.5]} receiveShadow>
        <boxGeometry args={[12, 0.18, 7]} />
        <meshStandardMaterial
          color="#201f28"
          metalness={0.2}
          roughness={0.52}
        />
      </mesh>
      <RoundedBox
        args={[11.7, 0.36, 0.2]}
        radius={0.05}
        smoothness={5}
        position={[0, -2.08, 1.86]}
        castShadow
      >
        <meshStandardMaterial color="#111117" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {[-5.25, 5.25].map((x) => (
        <group key={x} position={[x, -2.63, -1.45]}>
          <RoundedBox args={[0.2, 1.54, 0.22]} radius={0.06} smoothness={4} castShadow>
            <meshStandardMaterial color="#17171e" metalness={0.62} roughness={0.38} />
          </RoundedBox>
          <RoundedBox
            args={[0.48, 0.09, 0.54]}
            radius={0.035}
            smoothness={4}
            position={[0, -0.76, 0]}
          >
            <meshStandardMaterial color="#24232c" metalness={0.62} roughness={0.36} />
          </RoundedBox>
        </group>
      ))}
    </>
  );
}

const keyboardRows = [
  {
    y: 0.34,
    keys: [
      ["Esc", 1],
      ["F1", 1], ["F2", 1], ["F3", 1], ["F4", 1],
      ["F5", 1], ["F6", 1], ["F7", 1], ["F8", 1],
      ["F9", 1], ["F10", 1], ["F11", 1], ["F12", 1],
      ["PrtSc", 1], ["ScrLk", 1], ["Pause", 1],
    ],
  },
  {
    y: 0.2,
    keys: [
      ["~\n`", 1], ["!\n1", 1], ["@\n2", 1], ["#\n3", 1], ["$\n4", 1],
      ["%\n5", 1], ["^\n6", 1], ["&\n7", 1], ["*\n8", 1], ["(\n9", 1],
      [")\n0", 1], ["_\n-", 1], ["+\n=", 1], ["Backspace", 1.8],
    ],
  },
  {
    y: 0.06,
    keys: [
      ["Tab", 1.45], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1],
      ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["{\n[", 1],
      ["}\n]", 1], ["|\n\\", 1.45],
    ],
  },
  {
    y: -0.08,
    keys: [
      ["Caps", 1.7], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1],
      ["H", 1], ["J", 1], ["K", 1], ["L", 1], [":\n;", 1], ["\"\n'", 1],
      ["Enter", 1.7],
    ],
  },
  {
    y: -0.22,
    keys: [
      ["Shift", 2.2], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1],
      ["N", 1], ["M", 1], ["<\n,", 1], [">\n.", 1], ["?\n/", 1],
      ["Shift", 2.2],
    ],
  },
  {
    y: -0.36,
    keys: [
      ["Ctrl", 1.25], ["Win", 1.1], ["Alt", 1.1], ["Space", 5.8],
      ["Alt", 1.1], ["Fn", 1], ["Menu", 1], ["Ctrl", 1.25],
    ],
  },
];

function Keyboard() {
  const rgbColors = ["#9b54ff", "#388cff", "#34d8e8", "#e34ba9"];
  const keyUnit = 0.17;
  const keyGap = 0.014;
  const keyTextures = useMemo(() => {
    const labels = new Set(keyboardRows.flatMap((row) => row.keys.map(([label]) => label)));
    return new Map(
      [...labels].map((label) => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error(`Unable to create the ${label} keyboard key label.`);
        }
        context.fillStyle = "#f4f1ff";
        context.textAlign = "center";
        context.textBaseline = "middle";
        if (label.includes("\n")) {
          const [shifted, base] = label.split("\n");
          context.font = "600 34px Arial, Helvetica, sans-serif";
          context.fillText(shifted, 88, 38);
          context.font = "700 58px Arial, Helvetica, sans-serif";
          context.fillText(base, 42, 83);
        } else {
          const fontSize = label.length > 5 ? 22 : label.length > 3 ? 27 : 48;
          context.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
          context.fillText(label, 64, 67, 116);
        }
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        return [label, texture];
      }),
    );
  }, []);

  useEffect(
    () => () => keyTextures.forEach((texture) => texture.dispose()),
    [keyTextures],
  );

  return (
    <group position={[0, -1.61, -0.72]} rotation={[-Math.PI / 2, 0, 0]}>
      <RoundedBox args={[3.62, 0.92, 0.09]} radius={0.08} smoothness={6} castShadow>
        <meshStandardMaterial color="#111118" metalness={0.5} roughness={0.38} />
      </RoundedBox>
      {keyboardRows.map((row, rowIndex) => {
        const rowWidth =
          row.keys.reduce((sum, [, units]) => sum + units, 0) * keyUnit +
          (row.keys.length - 1) * keyGap;
        let x = -rowWidth / 2;

        return row.keys.map(([label, units], keyIndex) => {
          const width = units * keyUnit - keyGap;
          const positionX = x + width / 2;
          x += units * keyUnit + keyGap;
          const keyColor = rgbColors[keyIndex % rgbColors.length];

          return (
            <group
              key={`${rowIndex}-${keyIndex}-${label}`}
              position={[positionX, row.y, 0]}
            >
              <RoundedBox
                args={[width, 0.112, 0.055]}
                radius={0.018}
                smoothness={3}
                position={[0, 0, 0.066]}
                castShadow
              >
                <meshStandardMaterial
                  color="#25242d"
                  emissive={keyColor}
                  emissiveIntensity={0.09}
                  metalness={0.24}
                  roughness={0.42}
                />
              </RoundedBox>
              <mesh position={[0, 0, 0.095]}>
                <planeGeometry args={[Math.min(width * 0.78, 0.13), 0.078]} />
                <meshBasicMaterial
                  map={keyTextures.get(label)}
                  transparent
                  alphaTest={0.08}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        });
      })}
      <mesh position={[0, 0.43, 0.04]}>
        <boxGeometry args={[2.7, 0.012, 0.012]} />
        <meshBasicMaterial color="#388cff" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.43, 0.035]}>
        <boxGeometry args={[2.85, 0.018, 0.012]} />
        <meshBasicMaterial color="#9b54ff" toneMapped={false} />
      </mesh>
      {[-1.05, 1.05].map((x, index) => (
        <pointLight
          key={`keyboard-rgb-${x}`}
          position={[x, -0.3, 0.17]}
          color={rgbColors[index === 0 ? 0 : 2]}
          intensity={1.4}
          distance={1.8}
          decay={2}
        />
      ))}
    </group>
  );
}

function GamingMouse() {
  const rgbColor = "#37c9ff";

  return (
    <group position={[-2.08, -1.58, -0.75]} rotation={[-Math.PI / 2, 0, 0.12]}>
      <RoundedBox args={[0.5, 0.82, 0.16]} radius={0.22} smoothness={10} castShadow>
        <meshStandardMaterial
          color="#1a1921"
          metalness={0.4}
          roughness={0.34}
        />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={`mouse-button-${side}`}
          args={[0.228, 0.32, 0.025]}
          radius={0.06}
          smoothness={5}
          position={[side * 0.12, 0.225, 0.084]}
        >
          <meshStandardMaterial color="#24232c" metalness={0.35} roughness={0.36} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.17, 0.101]}>
        <boxGeometry args={[0.009, 0.3, 0.006]} />
        <meshBasicMaterial color="#08080d" />
      </mesh>
      <RoundedBox
        args={[0.075, 0.14, 0.04]}
        radius={0.025}
        smoothness={5}
        position={[0, 0.035, 0.105]}
      >
        <meshStandardMaterial
          color="#31313c"
          emissive={rgbColor}
          emissiveIntensity={0.35}
          roughness={0.38}
        />
      </RoundedBox>
      {[-0.018, 0, 0.018].map((offset) => (
        <mesh
          key={offset}
          position={[0, 0.035, 0.127]}
          rotation={[0, 0, offset]}
        >
          <boxGeometry args={[0.006, 0.09, 0.004]} />
          <meshBasicMaterial color="#72717e" />
        </mesh>
      ))}
      <mesh position={[0, -0.23, 0.065]}>
        <torusGeometry args={[0.19, 0.009, 8, 40]} />
        <meshBasicMaterial color={rgbColor} toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={`mouse-side-button-${side}`}
          args={[0.045, 0.12, 0.035]}
          radius={0.014}
          smoothness={4}
          position={[side * 0.245, -0.02, 0.025]}
        >
          <meshStandardMaterial color="#454450" metalness={0.35} roughness={0.4} />
        </RoundedBox>
      ))}
      <pointLight
        position={[0, -0.18, 0.16]}
        color={rgbColor}
        intensity={0.8}
        distance={1.25}
        decay={2}
      />
    </group>
  );
}

function RoomBackdrop() {
  const wallMaterial = (
    <meshStandardMaterial
      color="#1c2a43"
      emissive="#101c35"
      emissiveIntensity={0.24}
      roughness={0.88}
    />
  );

  return (
    <>
      <mesh position={[0, 0.8, -6.4]} receiveShadow>
        <boxGeometry args={[32, 18, 0.16]} />
        {wallMaterial}
      </mesh>
      <mesh position={[-16, 1.2, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 18]} />
        {wallMaterial}
      </mesh>
      <mesh position={[16, 1.2, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 18]} />
        {wallMaterial}
      </mesh>
      <mesh position={[0, -7.8, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 40]} />
        <meshStandardMaterial color="#111925" roughness={0.92} />
      </mesh>
      <mesh position={[0, 10.8, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 40]} />
        <meshStandardMaterial color="#172238" roughness={0.94} />
      </mesh>
      {[-4.75, 4.75].map((x, index) => (
        <group key={x} position={[x, 0.55, -6.28]}>
          <RoundedBox args={[0.09, 2.35, 0.06]} radius={0.04} smoothness={5}>
            <meshBasicMaterial
              color={index === 0 ? "#514078" : "#315078"}
              toneMapped={false}
            />
          </RoundedBox>
          <pointLight
            position={[0, 0, 0.25]}
            color={index === 0 ? "#753dce" : "#367bdb"}
            intensity={2.5}
            distance={4}
          />
        </group>
      ))}
    </>
  );
}

function Scene({
  introRef,
  cameraRef,
  rootRef,
  onMonitorScreenVisible,
  isPortrait,
  introReady,
  startOpeningJourney,
  onSceneReady,
  onIntroComplete,
}) {
  const [portfolioVisible, setPortfolioVisible] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("intro");
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const buttonRefs = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(faceButtonSections).map((letter) => [
          letter,
          { press: createRef(), light: createRef(), material: createRef() },
        ]),
      ),
    [],
  );
  const clickAudioRef = useRef(null);
  const startupAudioRef = useRef(null);
  const cameraTargetRef = useRef({ x: 0, y: -0.04, z: 0 });
  const timelineRef = useRef(null);
  const isTransitioning = useRef(false);
  const hasEntered = useRef(false);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const scrollProgressRef = useRef(0);
  const orbitRef = useRef({
    active: false,
    currentSpherical: new Spherical(),
    goalSpherical: new Spherical(),
    currentTarget: new Vector3(),
    goalTarget: new Vector3(),
  });
  const orbitOffsetRef = useRef(new Vector3());
  const sceneReadyRef = useRef(false);

  const beginMonitorJourney = useCallback((section, pressedButtonRefs = buttonRefs.A) => {
    if (!introReady || isTransitioning.current) return;

    const camera = cameraRef.current;
    const pressedButton = pressedButtonRefs?.press?.current;
    if (!camera || !pressedButton) return;

    const isReturnJourney = hasEntered.current;
    const glowLight = pressedButtonRefs.light.current;
    const buttonMaterial = pressedButtonRefs.material.current;
    const cameraTarget = cameraTargetRef.current;
    const introElement = introRef.current;

    orbitRef.current.active = false;
    timelineRef.current?.kill();
    timelineRef.current = null;
    isTransitioning.current = true;
    hasEntered.current = true;
    setActiveSection(section);

    const originalButtonHeight = pressedButton.position.z;
    const syncCameraAim = () =>
      camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    const playSound = (audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      const playback = audio.play();
      playback?.catch((error) => {
        console.error("Unable to play portfolio audio.", error);
      });
    };
    playSound(clickAudioRef.current);

    const journey = gsap.timeline({
      onComplete: () => {
        const orbit = orbitRef.current;
        orbit.currentTarget.set(0, 0.45, -2.85);
        orbit.goalTarget.copy(orbit.currentTarget);
        orbit.currentSpherical.setFromVector3(
          camera.position.clone().sub(orbit.currentTarget),
        );
        orbit.goalSpherical.copy(orbit.currentSpherical);
        scrollProgressRef.current = 0;
        isTransitioning.current = false;
        setPortfolioVisible(true);
        setPortfolioOpen(true);
        onMonitorScreenVisible(true);
      },
    });
    timelineRef.current = journey;

    journey
      .to(pressedButton.position, {
        z: originalButtonHeight - 0.026,
        duration: 0.1,
        ease: "power2.in",
      })
      .to(pressedButton.position, {
        z: originalButtonHeight,
        duration: 0.16,
        ease: "back.out(2)",
      });

    if (glowLight && buttonMaterial) {
      journey
        .to(
          glowLight,
          { intensity: 3.4, duration: 0.13, yoyo: true, repeat: 1 },
          0,
        )
        .to(
          buttonMaterial,
          {
            emissiveIntensity: 4.2,
            duration: 0.13,
            yoyo: true,
            repeat: 1,
          },
          0,
        );
    }

    if (isReturnJourney) {
      journey
        .to(
          camera.position,
          {
            x: isPortrait ? 0 : 0.1,
            y: isPortrait ? 0.45 : 1.2,
            z: isPortrait ? 6.8 : 0.8,
            duration: reducedMotion ? 0.7 : 2,
            ease: "power3.inOut",
            onUpdate: syncCameraAim,
          },
          0,
        )
        .to(
          cameraTarget,
          {
            x: 0,
            y: 0.45,
            z: -2.85,
            duration: reducedMotion ? 0.7 : 2,
            ease: "power3.inOut",
            onUpdate: syncCameraAim,
          },
          0,
        );
      return;
    }

    const pullbackDuration = reducedMotion ? 0.9 : 0.9;
    const monitorApproachDuration = reducedMotion ? 0.9 : 0.9;
    const monitorApproachStart = 0.24 + pullbackDuration;

    journey
      .to(
        camera.position,
        {
          x: 0.8,
          y: 2.5,
          z: 12,
          duration: pullbackDuration,
          ease: "power2.inOut",
          onUpdate: syncCameraAim,
        },
        0.24,
      )
      .to(
        cameraTarget,
        {
          x: 0,
          y: -0.55,
          z: -1.2,
          duration: pullbackDuration,
          ease: "power2.inOut",
          onUpdate: syncCameraAim,
        },
        0.24,
      )
      .to(
        introElement,
        {
          opacity: 0,
          duration: reducedMotion ? 0.25 : 0.45,
          ease: "power1.out",
        },
        pullbackDuration * 0.5,
      )
      .to(
        camera.position,
        {
          x: isPortrait ? 0 : 0.1,
          y: isPortrait ? 0.45 : 1.2,
          z: isPortrait ? 6.8 : 0.8,
          duration: monitorApproachDuration,
          ease: "power3.inOut",
          onUpdate: syncCameraAim,
        },
        monitorApproachStart,
      )
      .to(
        cameraTarget,
        {
          x: 0,
          y: 0.45,
          z: -2.85,
          duration: monitorApproachDuration,
          ease: "power3.inOut",
          onUpdate: syncCameraAim,
        },
        monitorApproachStart,
      )
      .call(
        () => playSound(startupAudioRef.current),
        null,
        monitorApproachStart,
      );
  }, [
    buttonRefs,
    cameraRef,
    introReady,
    introRef,
    isPortrait,
    onMonitorScreenVisible,
    reducedMotion,
    setActiveSection,
    setPortfolioOpen,
    setPortfolioVisible,
  ]);

  useFrame(() => {
    if (sceneReadyRef.current) return;
    sceneReadyRef.current = true;
    onSceneReady();
  });

  useEffect(() => {
    if (!startOpeningJourney) return undefined;

    const camera = cameraRef.current;
    const cameraTarget = cameraTargetRef.current;
    if (!camera) return undefined;

    const opening = gsap.timeline({
      onComplete: onIntroComplete,
    });
    timelineRef.current = opening;
    opening
      .to(
        camera.position,
        {
          x: isPortrait ? -2.1 : -1.65,
          y: isPortrait ? 0.9 : 1.1,
          z: isPortrait ? 9.5 : 8.2,
          duration: reducedMotion ? 0.7 : 3,
          ease: "power3.inOut",
          onUpdate: () => camera.lookAt(
            cameraTarget.x,
            cameraTarget.y,
            cameraTarget.z,
          ),
        },
        0,
      )
      .to(
        cameraTarget,
        {
          x: -3.55,
          y: -0.23,
          z: 0.2,
          duration: reducedMotion ? 0.7 : 3,
          ease: "power3.inOut",
          onUpdate: () => camera.lookAt(
            cameraTarget.x,
            cameraTarget.y,
            cameraTarget.z,
          ),
        },
        0,
      );

    return () => {
      opening.kill();
      if (timelineRef.current === opening) timelineRef.current = null;
    };
  }, [
    cameraRef,
    isPortrait,
    onIntroComplete,
    reducedMotion,
    startOpeningJourney,
  ]);

  useFrame((_, delta) => {
    const orbit = orbitRef.current;
    const camera = cameraRef.current;
    if (!orbit.active || !camera) return;

    const damping = 5.5;
    orbit.currentSpherical.theta = MathUtils.damp(
      orbit.currentSpherical.theta,
      orbit.goalSpherical.theta,
      damping,
      delta,
    );
    orbit.currentSpherical.phi = MathUtils.damp(
      orbit.currentSpherical.phi,
      orbit.goalSpherical.phi,
      damping,
      delta,
    );
    orbit.currentSpherical.radius = MathUtils.damp(
      orbit.currentSpherical.radius,
      orbit.goalSpherical.radius,
      damping,
      delta,
    );
    orbit.currentTarget.x = MathUtils.damp(
      orbit.currentTarget.x,
      orbit.goalTarget.x,
      damping,
      delta,
    );
    orbit.currentTarget.y = MathUtils.damp(
      orbit.currentTarget.y,
      orbit.goalTarget.y,
      damping,
      delta,
    );
    orbit.currentTarget.z = MathUtils.damp(
      orbit.currentTarget.z,
      orbit.goalTarget.z,
      damping,
      delta,
    );

    camera.position
      .copy(orbit.currentTarget)
      .add(orbitOffsetRef.current.setFromSpherical(orbit.currentSpherical));
    cameraTargetRef.current.x = orbit.currentTarget.x;
    cameraTargetRef.current.y = orbit.currentTarget.y;
    cameraTargetRef.current.z = orbit.currentTarget.z;
    camera.lookAt(orbit.currentTarget);
  });

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateMotionPreference = () =>
      setReducedMotion(motionPreference.matches);

    motionPreference.addEventListener("change", updateMotionPreference);
    return () =>
      motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const clickAudio = new Audio("/click.mp3");
    const startupAudio = new Audio("/startup_sound.ogv");
    clickAudio.preload = "auto";
    startupAudio.preload = "auto";
    clickAudioRef.current = clickAudio;
    startupAudioRef.current = startupAudio;

    return () => {
      clickAudio.pause();
      startupAudio.pause();
      clickAudioRef.current = null;
      startupAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const raycaster = new Raycaster();
    const pointerNdc = new Vector2();
    const monitorPlane = new Plane(new Vector3(0, 0, 1), 2.72);
    const monitorIntersection = new Vector3();
    const zoomRay = new Vector3();
    const cameraForward = new Vector3();
    const cameraRight = new Vector3();
    const cameraUp = new Vector3();

    function handlePointerDown(event) {
      if (
        (event.button !== 0 && event.button !== 2) ||
        dragRef.current ||
        event.target.closest("[data-ambient-toggle]") ||
        (!introReady && !hasEntered.current)
      ) {
        return;
      }
      if (event.button === 2) event.preventDefault();
      dragRef.current = {
        pointerId: event.pointerId,
        button: event.button,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        dragging: false,
      };
    }

    function handlePointerMove(event) {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      if (
        !drag.dragging &&
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5
      ) {
        return;
      }
      if (drag.button === 2) event.preventDefault();

      if (!drag.dragging) {
        drag.dragging = true;
        if (drag.button === 0) suppressClickRef.current = true;
        scrollProgressRef.current = 0;
        root.classList.add("is-dragging");

        const camera = cameraRef.current;
        if (!camera) return;
        const orbit = orbitRef.current;

        timelineRef.current?.kill();
        timelineRef.current = null;
        isTransitioning.current = false;

        const currentTarget = cameraTargetRef.current;
        orbit.currentTarget.set(
          currentTarget.x,
          currentTarget.y,
          currentTarget.z,
        );
        orbit.goalTarget.copy(orbit.currentTarget);
        orbitOffsetRef.current.copy(camera.position).sub(orbit.currentTarget);
        orbit.currentSpherical.setFromVector3(orbitOffsetRef.current);
        orbit.goalSpherical.copy(orbit.currentSpherical);
        orbit.active = true;

        if (hasEntered.current) {
          onMonitorScreenVisible(false);
          setPortfolioVisible(true);
          gsap.to(introRef.current, {
            opacity: 0,
            duration: 0.25,
            overwrite: true,
          });
        }
      }

      const orbit = orbitRef.current;
      if (drag.button === 2) {
        const camera = cameraRef.current;
        if (!camera) return;
        camera.updateMatrixWorld();
        cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        const worldPerPixel =
          (2 * orbit.currentSpherical.radius *
            Math.tan(MathUtils.degToRad(camera.fov) / 2)) /
          root.clientHeight;
        const horizontalShift = -deltaX * worldPerPixel;
        const verticalShift = deltaY * worldPerPixel;
        orbit.goalTarget.x = MathUtils.clamp(
          orbit.goalTarget.x + cameraRight.x * horizontalShift,
          -6.5,
          6.5,
        );
        orbit.goalTarget.z += cameraRight.z * horizontalShift;
        orbit.goalTarget.y = MathUtils.clamp(
          orbit.goalTarget.y + cameraUp.y * verticalShift,
          -3.5,
          4.5,
        );
      } else {
        orbit.goalSpherical.theta = MathUtils.clamp(
          orbit.goalSpherical.theta - deltaX * 0.0045,
          -2.15,
          2.15,
        );
        orbit.goalSpherical.phi = MathUtils.clamp(
          orbit.goalSpherical.phi - deltaY * 0.004,
          0.38,
          2.45,
        );
      }
      event.preventDefault();
    }

    function handlePointerUp(event) {
      if (dragRef.current?.pointerId === event.pointerId) {
        if (dragRef.current.dragging) {
          root.classList.remove("is-dragging");
        }
        dragRef.current = null;
      }
    }

    function handleClick(event) {
      if (event.button !== 0 || !suppressClickRef.current) return;
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }

    function handleContextMenu(event) {
      if (introReady) event.preventDefault();
    }

    function isPointerOverMonitorScreen(event, camera) {
      const bounds = root.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom ||
        camera.position.z <= -2.72
      ) {
        return false;
      }

      pointerNdc.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointerNdc, camera);
      const distance = raycaster.ray.intersectPlane(
        monitorPlane,
        monitorIntersection,
      );
      return (
        distance !== null &&
        Math.abs(monitorIntersection.x) <= 2.11 &&
        Math.abs(monitorIntersection.y - 0.45) <= 1.16
      );
    }

    function handleWheel(event) {
      const orbit = orbitRef.current;
      if (!introReady || isTransitioning.current) return;

      event.preventDefault();
      const camera = cameraRef.current;
      if (!camera) return;

      const delta = MathUtils.clamp(event.deltaY, -120, 120);
      if (delta === 0) return;
      const pointerOnMonitor = isPointerOverMonitorScreen(event, camera);

      const moveToController = () => {
        isTransitioning.current = true;
        orbit.active = false;
        timelineRef.current?.kill();
        timelineRef.current = null;
        scrollProgressRef.current = 0;

        const cameraTarget = cameraTargetRef.current;
        const controllerJourney = gsap.timeline({
          onComplete: () => {
            orbit.currentTarget.set(-3.55, -0.23, 0.2);
            orbit.goalTarget.copy(orbit.currentTarget);
            orbit.currentSpherical.setFromVector3(
              camera.position.clone().sub(orbit.currentTarget),
            );
            orbit.goalSpherical.copy(orbit.currentSpherical);
            isTransitioning.current = false;
            setActiveSection("intro");
            setPortfolioOpen(false);
            setPortfolioVisible(true);
            onMonitorScreenVisible(false);
          },
        });
        timelineRef.current = controllerJourney;

        controllerJourney
          .to(
            camera.position,
            {
              x: isPortrait ? -2.1 : -1.65,
              y: isPortrait ? 0.9 : 1.1,
              z: isPortrait ? 9.5 : 8.2,
              duration: reducedMotion ? 0.7 : 2.4,
              ease: "power3.inOut",
              onUpdate: () =>
                camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
            },
            0,
          )
          .to(
            cameraTarget,
            {
              x: -3.55,
              y: -0.23,
              z: 0.2,
              duration: reducedMotion ? 0.7 : 2.4,
              ease: "power3.inOut",
              onUpdate: () =>
                camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
            },
            0,
          );
      };

      if (portfolioVisible && delta > 0 && pointerOnMonitor) {
        scrollProgressRef.current += delta;
        if (scrollProgressRef.current < 300) return;
        moveToController();
        return;
      }

      if (!orbit.active) {
        const target = cameraTargetRef.current;
        orbit.currentTarget.set(target.x, target.y, target.z);
        orbit.goalTarget.copy(orbit.currentTarget);
        orbitOffsetRef.current.copy(camera.position).sub(orbit.currentTarget);
        orbit.currentSpherical.setFromVector3(orbitOffsetRef.current);
        orbit.goalSpherical.copy(orbit.currentSpherical);
        orbit.active = true;
      }

      const step = Math.abs(delta);
      const previousRadius = orbit.goalSpherical.radius;
      orbit.goalSpherical.radius = MathUtils.clamp(
        orbit.goalSpherical.radius + delta * 0.006,
        2.5,
        24,
      );
      camera.updateMatrixWorld();
      camera.getWorldDirection(cameraForward).normalize();
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
      cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
      pointerNdc.set(
        ((event.clientX - root.getBoundingClientRect().left) /
          root.clientWidth) *
          2 -
          1,
        -((event.clientY - root.getBoundingClientRect().top) /
          root.clientHeight) *
          2 +
          1,
      );
      const cursorRadius = previousRadius - orbit.goalSpherical.radius;
      if (cursorRadius !== 0) {
        const tangent = Math.tan(MathUtils.degToRad(camera.fov) / 2);
        zoomRay
          .copy(cameraForward)
          .addScaledVector(
            cameraRight,
            pointerNdc.x * tangent * camera.aspect,
          )
          .addScaledVector(cameraUp, pointerNdc.y * tangent)
          .normalize();
        orbit.goalTarget.addScaledVector(zoomRay, cursorRadius * 0.55);
      }

      if (!hasEntered.current || delta > 0) {
        scrollProgressRef.current = 0;
        return;
      }
      if (!pointerOnMonitor) {
        scrollProgressRef.current = 0;
        return;
      }

      scrollProgressRef.current += step;
      if (scrollProgressRef.current < 300) return;

      isTransitioning.current = true;
      orbit.active = false;
      timelineRef.current?.kill();
      timelineRef.current = null;

      const cameraTarget = cameraTargetRef.current;
      const returnToMonitor = gsap.timeline({
        onComplete: () => {
          orbit.currentTarget.set(0, 0.45, -2.85);
          orbit.goalTarget.copy(orbit.currentTarget);
          orbit.currentSpherical.setFromVector3(
            camera.position.clone().sub(orbit.currentTarget),
          );
          orbit.goalSpherical.copy(orbit.currentSpherical);
          scrollProgressRef.current = 0;
          isTransitioning.current = false;
          setActiveSection("intro");
          setPortfolioOpen(true);
          setPortfolioVisible(true);
          onMonitorScreenVisible(true);
        },
      });
      timelineRef.current = returnToMonitor;

      returnToMonitor
        .to(
          camera.position,
          {
            x: 0.1,
            y: 1.05,
            z: 0.9,
            duration: reducedMotion ? 0.7 : 2.8,
            ease: "power3.inOut",
            onUpdate: () =>
              camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
          },
          0,
        )
        .to(
          cameraTarget,
          {
            x: 0,
            y: 0.45,
            z: -2.85,
            duration: reducedMotion ? 0.7 : 2.8,
            ease: "power3.inOut",
            onUpdate: () =>
              camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z),
          },
          0,
        );
    }

    root.addEventListener("pointerdown", handlePointerDown, true);
    root.addEventListener("click", handleClick, true);
    root.addEventListener("contextmenu", handleContextMenu);
    root.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      root.removeEventListener("pointerdown", handlePointerDown, true);
      root.removeEventListener("click", handleClick, true);
      root.removeEventListener("contextmenu", handleContextMenu);
      root.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      root.classList.remove("is-dragging");
      dragRef.current = null;
      suppressClickRef.current = false;
    };
  }, [
    cameraRef,
    introReady,
    introRef,
    isPortrait,
    onMonitorScreenVisible,
    orbitRef,
    orbitOffsetRef,
    portfolioVisible,
    reducedMotion,
    rootRef,
    setActiveSection,
    setPortfolioOpen,
    setPortfolioVisible,
  ]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || !introReady) return;

      if (event.key === "Enter") {
        if (hasEntered.current && (portfolioVisible || orbitRef.current.active)) return;
        event.preventDefault();
        beginMonitorJourney("intro", buttonRefs.A);
        return;
      }

      if (
        portfolioVisible &&
        portfolioOpen &&
        !orbitRef.current.active
      ) {
        return;
      }
      const keyboardSections = {
        a: "about",
        s: "skills",
        p: "projects",
        c: "contact",
      };
      const section = keyboardSections[event.key.toLowerCase()];
      if (!section) return;

      event.preventDefault();
      const letter = event.key.toUpperCase();
      beginMonitorJourney(section, buttonRefs[letter]);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [beginMonitorJourney, buttonRefs, introReady, portfolioOpen, portfolioVisible]);

  return (
    <>
      <color attach="background" args={["#08080d"]} />
      <fog attach="fog" args={["#08080d", 16, 30]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#d4d6ff", "#272331", 1.8]} />
      <directionalLight
        position={[-4.5, 6, 7]}
        color="#fff4e8"
        intensity={3.2}
      />
      <directionalLight
        position={[5, 3.5, 2]}
        color="#b7c9ff"
        intensity={2.1}
      />
      <pointLight
        position={[0, 3, -6]}
        color="#7188ff"
        intensity={18}
        distance={16}
        decay={2}
      />
      <spotLight
        position={[-4, 5, 5]}
        color="#a34dff"
        intensity={75}
        angle={0.58}
        penumbra={0.8}
        castShadow
      />
      <pointLight
        position={[0, 2, 3]}
        color="#d9d8ff"
        intensity={30}
      />
      <pointLight
        position={[4, 1, 3]}
        color="#258cff"
        intensity={12}
      />
      <pointLight
        position={[-3, 1, -1]}
        color="#6325ff"
        intensity={9}
      />
      <RoomBackdrop />
      <Monitor
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onMonitorScreenVisible={onMonitorScreenVisible}
        onClosePortfolio={() => setPortfolioOpen(false)}
        onOpenPortfolio={() => {
          setActiveSection("intro");
          setPortfolioOpen(true);
        }}
        portfolioOpen={portfolioOpen}
        portfolioVisible={portfolioVisible}
      />
      <DesktopTower />
      <Desk />
      <Keyboard />
      <GamingMouse />
      <Controller
        buttonRefs={buttonRefs}
        onFaceButton={(letter, refs) =>
          beginMonitorJourney(faceButtonSections[letter], refs)
        }
      />
    </>
  );
}

export default function App() {
  const introRef = useRef(null);
  const cameraRef = useRef(null);
  const rootRef = useRef(null);
  const ambientAudioRef = useRef(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(1);
  const [startOpeningJourney, setStartOpeningJourney] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [monitorScreenVisible, setMonitorScreenVisible] = useState(false);
  const [hasVisitedMonitor, setHasVisitedMonitor] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const ambientEnabledRef = useRef(true);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onIntroComplete = useCallback(() => setIntroReady(true), []);
  const handleMonitorScreenVisible = useCallback((visible) => {
    setMonitorScreenVisible(visible);
    if (visible) setHasVisitedMonitor(true);
  }, []);
  const controllerGuideVisible = hasVisitedMonitor && !monitorScreenVisible;
  const isPortrait =
    typeof window !== "undefined" && window.innerWidth / window.innerHeight < 1;

  useEffect(() => {
    const ambientAudio = new Audio("/calm_ambient.mp3");
    ambientAudio.preload = "auto";
    ambientAudio.loop = true;
    ambientAudio.volume = 0.12;
    ambientAudioRef.current = ambientAudio;

    let playbackPending = false;
    let disposed = false;
    const removeGestureListeners = () => {
      window.removeEventListener("pointerdown", startAmbient);
      window.removeEventListener("keydown", startAmbient);
    };
    const startAmbient = (event) => {
      if (
        !ambientEnabledRef.current ||
        playbackPending ||
        disposed ||
        event?.target?.closest?.("[data-ambient-toggle]")
      ) {
        return;
      }

      playbackPending = true;
      const playback = ambientAudio.play();
      if (!playback) {
        playbackPending = false;
        removeGestureListeners();
        return;
      }
      playback
        .then(removeGestureListeners)
        .catch((error) => {
          playbackPending = false;
          if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
            console.error("Unable to play ambient music.", error);
          }
        });
    };

    window.addEventListener("pointerdown", startAmbient);
    window.addEventListener("keydown", startAmbient);
    startAmbient();

    return () => {
      disposed = true;
      removeGestureListeners();
      ambientAudio.pause();
      ambientAudioRef.current = null;
    };
  }, []);

  const toggleAmbientMusic = () => {
    const audio = ambientAudioRef.current;
    const nextEnabled = !ambientEnabledRef.current;
    ambientEnabledRef.current = nextEnabled;
    setAmbientEnabled(nextEnabled);

    if (!audio) return;
    if (!nextEnabled) {
      audio.pause();
      return;
    }

    const playback = audio.play();
    playback?.catch((error) => {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
        console.error("Unable to play ambient music.", error);
      }
    });
  };

  useEffect(() => {
    if (!sceneReady) return undefined;

    const progress = { value: 1 };
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const loader = gsap.to(progress, {
      value: 100,
      duration: reducedMotion ? 0.45 : 2.6,
      ease: "power1.inOut",
      onUpdate: () => setLoadingProgress(Math.floor(progress.value)),
      onComplete: () => {
        setLoadingProgress(100);
      },
    });
    const beginOpening = gsap.delayedCall(reducedMotion ? 0.15 : 0.45, () => {
      setLoading(false);
      setStartOpeningJourney(true);
    });

    return () => {
      loader.kill();
      beginOpening.kill();
    };
  }, [sceneReady]);

  const loadingStatus =
    loadingProgress < 34
      ? "Preparing scene geometry"
      : loadingProgress < 68
        ? "Initializing lighting system"
        : "Calibrating camera";

  return (
    <main className="portfolio" ref={rootRef}>
      {loading && (
        <section
          aria-label="Loading 3D scene"
          aria-live="polite"
          className="boot-screen"
          role="status"
        >
          <div className="boot-content">
            <div className="boot-chip" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="presentation">
                <rect x="15" y="15" width="34" height="34" rx="5" />
                <path d="M23 25h18M23 32h18M23 39h11M22 7v8m10-8v8m10-8v8M22 49v8m10-8v8m10-8v8M7 22h8m-8 10h8m-8 10h8m34-20h8m-8 10h8m-8 10h8" />
              </svg>
            </div>
            <p className="boot-kicker">CPU · REALTIME EXPERIENCE</p>
            <h1 className="boot-title">Waking the room</h1>
            <p className="boot-status">{loadingStatus}</p>
            <div
              aria-label={`${loadingProgress}%`}
              className="boot-progress-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={loadingProgress}
            >
              <span
                className="boot-progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="boot-progress-meta">
              <span>SCENE INITIALIZATION</span>
              <span>{String(loadingProgress).padStart(2, "0")}%</span>
            </div>
          </div>
          <p className="boot-footer">A PERSONAL PORTFOLIO IN THREE DIMENSIONS</p>
        </section>
      )}
      {introReady && (
        <div className="intro" ref={introRef}>
          <h1 className="intro-prompt">PRESS ENTER</h1>
        </div>
      )}
      {introReady && (
        <aside
          aria-label="Controller portfolio shortcuts"
          aria-hidden={!controllerGuideVisible}
          className={`controller-guide${controllerGuideVisible ? " is-visible" : ""}`}
        >
          <p className="controller-guide-heading">CONTROLLER SHORTCUTS</p>
          <ul>
            <li><kbd>A</kbd><span>About me</span></li>
            <li><kbd>S</kbd><span>Skills</span></li>
            <li><kbd>P</kbd><span>Projects</span></li>
            <li><kbd>C</kbd><span>Contact</span></li>
          </ul>
        </aside>
      )}
      <button
        aria-label={`Turn ambient music ${ambientEnabled ? "off" : "on"}`}
        aria-pressed={ambientEnabled}
        className="ambient-toggle"
        data-ambient-toggle
        onClick={toggleAmbientMusic}
        type="button"
      >
        <span aria-hidden="true">{ambientEnabled ? "♫" : "♪"}</span>
        <span>Ambient {ambientEnabled ? "On" : "Off"}</span>
      </button>
      <Canvas
        fallback={
          <div className="webgl-fallback" role="status">
            This 3D scene needs WebGL support in your browser.
          </div>
        }
        shadows="basic"
        dpr={[1, 1.6]}
        camera={{
          position: isPortrait ? [0, 4.8, 18] : [0, 4.2, 15],
          fov: isPortrait ? 56 : 42,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -0.04, 0);
          cameraRef.current = camera;
        }}
      >
        <Scene
          introRef={introRef}
          cameraRef={cameraRef}
          rootRef={rootRef}
          onMonitorScreenVisible={handleMonitorScreenVisible}
          introReady={introReady}
          isPortrait={isPortrait}
          onIntroComplete={onIntroComplete}
          onSceneReady={onSceneReady}
          startOpeningJourney={startOpeningJourney}
        />
      </Canvas>
    </main>
  );
}
