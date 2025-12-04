import React from 'react';
import { AppState, GestureMetrics, ParticleTemplate } from '../types';
import { COLOR_PALETTES } from '../constants';
import { TensionChart } from './TensionChart';

interface Props {
  appState: AppState;
  metrics: GestureMetrics;
  onStateChange: (updates: Partial<AppState>) => void;
}

export const UIOverlay: React.FC<Props> = ({ appState, metrics, onStateChange }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 pointer-events-none">
      {/* Header / Info */}
      <div className="pointer-events-auto flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-lg">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MindParticle
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
            Interactive Biofeedback System.
            <br />
            Camera processes gestures locally.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${metrics.hasHands ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-xs font-mono">
              {metrics.hasHands ? 'SYSTEM LINKED' : 'SEARCHING HANDS...'}
            </span>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 flex flex-col gap-2">
          {Object.values(ParticleTemplate).map((t) => (
            <button
              key={t}
              onClick={() => onStateChange({ template: t })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                appState.template === t 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pointer-events-auto flex items-end justify-between gap-4">
        {/* Tension Monitor */}
        <div className="hidden md:block w-64 h-32 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden relative">
          <div className="absolute top-2 left-2 text-xs text-gray-500 font-mono">NEURAL TENSION</div>
          <TensionChart left={metrics.leftTension} right={metrics.rightTension} />
        </div>

        {/* Center Controls */}
        <div className="flex-1 max-w-md bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-4">
          <div className="flex justify-between items-center text-white text-sm">
             <span>Spectrum</span>
             <span className="font-mono text-xs opacity-50">{appState.colorHue}°</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={appState.colorHue}
            onChange={(e) => onStateChange({ colorHue: parseInt(e.target.value) })}
            className="w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex gap-2 mt-2">
             {COLOR_PALETTES.map(p => (
               <button 
                key={p.name}
                onClick={() => onStateChange({ colorHue: p.hue })}
                className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: `hsl(${p.hue}, 80%, 60%)`}}
                title={p.name}
               />
             ))}
          </div>
        </div>
        
        {/* Mode Toggle */}
         <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
            <button
              onClick={() => onStateChange({ calmMode: !appState.calmMode })}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                appState.calmMode ? 'bg-teal-500/20 text-teal-400' : 'bg-purple-500/20 text-purple-400'
              }`}
            >
              <span className="text-xl">{appState.calmMode ? 'Zen' : 'Act'}</span>
            </button>
         </div>
      </div>
    </div>
  );
};
