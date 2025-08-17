import Threads from "../styles/threadsOGL";
import LightRays from "../styles/LightRays";

export default function TvaraPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-black text-white">
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <LightRays
          raysOrigin="right"
          raysColor="#00000"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.9}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <Threads amplitude={0.1} distance={10} enableMouseInteraction={true} />
      </div>
      <h1 className="mb-4 text-3xl font-bold">Welcome to Tvara</h1>
      <p className="mb-8 text-lg">
        This is a sample page with Threads background.
      </p>
      <Threads />
      <LightRays />
    </div>

  );
}
