import RotatingArm from "./RotatingArm";

type Props = {
  slowing?: boolean;
  fading?: boolean;
};

export default function LoadingScreen({ slowing, fading }: Props) {
  return (
    <div className={`flex items-center justify-center h-screen bg-gradient-to-b from-black via-[#1a0000] to-[#2b0a0a] relative overflow-hidden transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-[url('/assets/grain.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="smoke"></div>
      <div className="absolute inset-0 embers"></div>

      <div className="relative w-48 h-48">
        <img
          src="/assets/loading-logo-no-arm-no-background.png"
          alt="Dragon clock base"
          className="absolute inset-0 w-full h-full"
        />
        <RotatingArm speed={slowing ? 'slow' : 'fast'} visible={!fading} />
      </div>
    </div>
  );
}

