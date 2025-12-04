import React from 'react';

interface Props {
  onDismiss: () => void;
}

export const OnboardingOverlay: React.FC<Props> = ({ onDismiss }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in transition-all duration-500 overflow-y-auto">
      <div className="max-w-4xl w-full mx-4 my-8 bg-neutral-900/60 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(66,153,225,0.1)] relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3 drop-shadow-sm">
            MindParticle
          </h2>
          <p className="text-lg text-gray-300 font-light max-w-2xl mx-auto">
            Experience real-time energy visualization. Control the hologram with your hands or keyboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
          {/* Hand Controls */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Camera Gestures</h3>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start space-x-4">
              <div className="text-2xl">✋</div>
              <div>
                <h4 className="text-white font-semibold">Expansion</h4>
                <p className="text-sm text-gray-400">Open hands & move apart to expand.</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start space-x-4">
              <div className="text-2xl">✊</div>
              <div>
                <h4 className="text-white font-semibold">Energy Pulse</h4>
                <p className="text-sm text-gray-400">Clench fists to increase tension & heat.</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start space-x-4">
              <div className="text-2xl">👌</div>
              <div>
                <h4 className="text-white font-semibold">Magnetic Pinch</h4>
                <p className="text-sm text-gray-400">Pinch to create a black hole attractor.</p>
              </div>
            </div>
          </div>

          {/* Keyboard Controls */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Keyboard & Mouse</h3>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start space-x-4">
              <div className="text-2xl min-w-[30px]">⌨️</div>
              <div>
                <h4 className="text-white font-semibold">Movement</h4>
                <p className="text-sm text-gray-400">
                  <span className="bg-white/20 px-1 rounded text-white">W</span>
                  <span className="bg-white/20 px-1 rounded text-white">A</span>
                  <span className="bg-white/20 px-1 rounded text-white">S</span>
                  <span className="bg-white/20 px-1 rounded text-white">D</span> for Left Hand<br/>
                  <span className="bg-white/20 px-1 rounded text-white">Arrows</span> for Right Hand
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start space-x-4">
              <div className="text-2xl min-w-[30px]">🖱️</div>
              <div>
                <h4 className="text-white font-semibold">Scale & Pinch</h4>
                <p className="text-sm text-gray-400">
                  <span className="bg-white/20 px-1 rounded text-white">Scroll</span> to expand/contract.<br/>
                  <span className="bg-white/20 px-1 rounded text-white">Space</span> to pulse/pinch.
                </p>
              </div>
            </div>

            <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 flex items-center space-x-3">
              <div className="text-green-400 text-xl">🔒</div>
              <p className="text-xs text-green-200">
                Privacy First: Camera data is processed locally and never leaves your device.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center relative z-10 pb-2">
          <button
            onClick={onDismiss}
            className="px-12 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-cyan-50 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0"
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
