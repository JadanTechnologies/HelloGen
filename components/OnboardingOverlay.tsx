import React from 'react';

interface Props {
  onDismiss: () => void;
}

export const OnboardingOverlay: React.FC<Props> = ({ onDismiss }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in transition-all duration-500">
      <div className="max-w-3xl w-full mx-4 bg-neutral-900/60 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(66,153,225,0.1)] relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3 drop-shadow-sm">
            MindParticle
          </h2>
          <p className="text-lg text-gray-300 font-light">
            Control the hologram with your energy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10 relative z-10">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start space-x-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✋
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Expansion</h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Open your hands and move them apart to <span className="text-blue-300">expand</span> the universe. The particles breathe with you.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start space-x-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✊
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Energy Pulse</h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Clench your fists to increase <span className="text-red-300">tension</span>. The core will heat up and vibrate with intensity.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start space-x-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👌
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Magnetic Pinch</h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Pinch your thumb and index finger to create a <span className="text-purple-300">black hole</span> that attracts particles.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start space-x-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🔒
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Local & Private</h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                All processing happens on your device. Your camera feed never leaves this tab.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center relative z-10">
          <button
            onClick={onDismiss}
            className="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-cyan-50 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0"
          >
            Enter Simulation
          </button>
        </div>
      </div>
    </div>
  );
};