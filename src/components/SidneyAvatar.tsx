import React from "react";

interface SidneyAvatarProps {
  className?: string;
  size?: number;
}

export default function SidneyAvatar({ className = "w-10 h-10", size = 40 }: SidneyAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} overflow-hidden rounded-full shrink-0 shadow-sm border border-slate-200`}
      style={{ minWidth: size, minHeight: size }}
    >
      {/* Background with site palette: Navy/Indigo gradient */}
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Circle Background */}
      <circle cx="50" cy="50" r="50" fill="url(#avatarBg)" />

      {/* High-Tech Circuit/Georeferencing Lines (matching the reference image's background but in site colors) */}
      <g opacity="0.3" stroke="#38BDF8" strokeWidth="0.75" fill="none">
        {/* Horizontal & Vertical grid lines */}
        <path d="M10 30 H90 M10 70 H90 M30 10 V90 M70 10 V90" strokeDasharray="1,4" />
        
        {/* Circuit tracks & nodes */}
        <path d="M 12,45 L 25,45 L 30,50 L 30,60 L 20,70" />
        <circle cx="12" cy="45" r="1.5" fill="#38BDF8" />
        <circle cx="20" cy="70" r="1.5" fill="#38BDF8" />

        <path d="M 88,55 L 75,55 L 70,50 L 70,40 L 80,30" />
        <circle cx="88" cy="55" r="1.5" fill="#38BDF8" />
        <circle cx="80" cy="30" r="1.5" fill="#38BDF8" />
        
        {/* Radar/Georeferencing target rings */}
        <circle cx="50" cy="50" r="44" strokeDasharray="2,2" />
        <circle cx="50" cy="50" r="48" stroke="#2563EB" strokeWidth="1" />
      </g>

      {/* Person/Mascot illustration */}
      <g id="mascot">
        {/* Neck */}
        <path d="M 43,65 L 43,80 L 57,80 L 57,65 Z" fill="#A26B52" />
        {/* Neck Shadow */}
        <path d="M 43,65 C 47,72 53,72 57,65 L 57,68 C 53,73 47,73 43,68 Z" fill="#84513B" />

        {/* Ears */}
        <circle cx="31" cy="48" r="6" fill="#A26B52" />
        <circle cx="31" cy="48" r="3" fill="#84513B" opacity="0.4" />
        <circle cx="69" cy="48" r="6" fill="#A26B52" />
        <circle cx="69" cy="48" r="3" fill="#84513B" opacity="0.4" />

        {/* Face structure */}
        <path
          d="M 33,45 C 33,28 67,28 67,45 C 67,61 62,69 50,69 C 38,69 33,61 33,45 Z"
          fill="#B57C61"
        />

        {/* Hair - cropped dark style, identical to reference */}
        <path
          d="M 32,42 C 30,34 34,24 50,22 C 66,24 70,34 68,42 C 64,36 58,35 50,35 C 42,35 36,36 32,42 Z"
          fill="#27272A"
        />
        {/* Hair sideburns */}
        <path d="M 31,41 L 33,45 L 33,41 Z" fill="#27272A" />
        <path d="M 69,41 L 67,45 L 67,41 Z" fill="#27272A" />

        {/* Eyebrows - stylized and friendly */}
        <path d="M 36,39 Q 42,35 46,39" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 64,39 Q 58,35 54,39" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Eyes - dark eyes with white reflections */}
        <ellipse cx="42" cy="44" rx="3.5" ry="2.2" fill="#27272A" />
        <circle cx="43.5" cy="43" r="0.8" fill="#FFFFFF" />
        
        <ellipse cx="58" cy="44" rx="3.5" ry="2.2" fill="#27272A" />
        <circle cx="59.5" cy="43" r="0.8" fill="#FFFFFF" />

        {/* Nose */}
        <path d="M 47,48 Q 50,53 53,48" stroke="#84513B" strokeWidth="1.75" strokeLinecap="round" fill="none" />

        {/* Cheeks - friendly blush */}
        <ellipse cx="37" cy="51" rx="2.5" ry="1.2" fill="#A26B52" opacity="0.3" />
        <ellipse cx="63" cy="51" rx="2.5" ry="1.2" fill="#A26B52" opacity="0.3" />

        {/* Mouth/Smiling with teeth - replicating the happy Brazilian face expression */}
        {/* Mouth Background */}
        <path
          d="M 39,51.5 Q 50,63.5 61,51.5 Q 50,52.5 39,51.5 Z"
          fill="#4A1D1D"
        />
        {/* Teeth */}
        <path
          d="M 40.5,52 C 43,54.5 57,54.5 59.5,52 Q 50,52.5 40.5,52 Z"
          fill="#FFFFFF"
        />
        {/* Bottom lip accent */}
        <path d="M 44,58.5 Q 50,62 56,58.5" stroke="#84513B" strokeWidth="1.25" strokeLinecap="round" fill="none" />

        {/* Clothes: Light teal/sky blue polo shirt matching the reference, styled with a clean finish */}
        <path
          d="M 28,80 C 28,73 34,70 42,72 L 50,75 L 58,72 C 66,70 72,73 72,80 L 72,100 L 28,100 Z"
          fill="#0EA5E9"
        />
        {/* Collar lines in corporate dark blue */}
        <path d="M 42,72 L 50,85 L 58,72" fill="none" stroke="#1E40AF" strokeWidth="1.75" strokeLinecap="round" />
        {/* Neckline v-neck insert */}
        <path d="M 45,74 L 50,83 L 55,74 Z" fill="#A26B52" />
      </g>
    </svg>
  );
}
