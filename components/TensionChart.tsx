import React, { useEffect, useState } from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';

interface Props {
  left: number;
  right: number;
}

// Keep last 30 frames
const HISTORY_LENGTH = 30;

export const TensionChart: React.FC<Props> = ({ left, right }) => {
  const [data, setData] = useState<Array<{l: number, r: number, i: number}>>([]);

  useEffect(() => {
    setData(prev => {
      const next = [...prev, { l: left, r: right, i: Date.now() }];
      if (next.length > HISTORY_LENGTH) return next.slice(next.length - HISTORY_LENGTH);
      return next;
    });
  }, [left, right]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <YAxis domain={[0, 1]} hide />
        <defs>
          <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="l" stroke="#8884d8" fillOpacity={1} fill="url(#colorL)" isAnimationActive={false} />
        <Area type="monotone" dataKey="r" stroke="#82ca9d" fillOpacity={1} fill="url(#colorR)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
