
import React from 'react';

interface Props {
  onDismiss: () => void;
}

export const OnboardingOverlay: React.FC<Props> = ({ onDismiss }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-neutral-900/90 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Welcome to MindParticle
          </h2>
          <p className="text-gray-400">
            A real-time biofeedback experience controlled by your hands.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 mb-3 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-2xl">
              ✋
            </div>
            <h3 className="text-white font-semibold mb-1">Open Hands</h3>
            <p className="text-sm text-gray-400">
              Hold palms open to expand the universe. Move hands apart to increase scale.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 mb-3 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-2xl">
              ✊
            </div>
            <h3 className="text-white font-semibold mb-1">Close Fists</h3>
            <p className="text-sm text-gray-400">
              Clench fists to increase tension, pulse particles, and generate energy.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 mb-3 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-2xl">
              👌
            </div>
            <h3 className="text-white font-semibold mb-1">Pinch</h3>
            <p className="text-sm text-gray-400">
              Pinch thumb and index finger to create magnetic bursts at that location.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 mb-3 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-2xl">
              👋
            </div>
            <h3 className="text-white font-semibold mb-1">Privacy First</h3>
            <p className="text-sm text-gray-400">
              Gestures are processed locally on your device. No images are recorded.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onDismiss}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Start Experience
          </button>
        </div>
      </div>
    </div>
  );
};
