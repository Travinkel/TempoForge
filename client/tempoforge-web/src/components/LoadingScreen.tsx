type Props = {
  slowing?: boolean
  fading?: boolean
}

export default function LoadingScreen({ slowing, fading }: Props) {
  return (
    <div className={`flex items-center justify-center h-screen bg-gradient-to-b from-black via-[#1a0000] to-[#2b0a0a] relative overflow-hidden transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Grainy texture overlay */}
      <div className="absolute inset-0 bg-[url('/assets/grain.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="relative w-48 h-48">
        {/* Base dragon clock */}
        <img
          src="/assets/loading-logo-no-arm-no-background.png"
          alt="Dragon clock base"
          className="absolute inset-0 w-full h-full"
        />

        {/* Rotating arm */}
        <img
          src="/assets/logo-primary-only-arm.png"
          alt="Clock arm"
          className={`absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 origin-[50%_90%] ${slowing ? 'spin-slow' : 'spin-fast'}`}
          style={{ transformOrigin: '50% 90%' }}
        />
      </div>
    </div>
  );
}
