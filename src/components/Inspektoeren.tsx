type Pose = "waving" | "searching" | "pointing" | "thumbsup";

interface Props {
  pose: Pose;
  size?: number;
  className?: string;
  speechBubble?: string;
}

export default function Inspektoeren({
  pose,
  size = 120,
  className = "",
  speechBubble,
}: Props) {
  return (
    <div className={`relative inline-block ${className}`}>
      {speechBubble && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45" />
        </div>
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Inspektøren maskot - ${pose}`}
      >
        {pose === "waving" && <WavingPose />}
        {pose === "searching" && <SearchingPose />}
        {pose === "pointing" && <PointingPose />}
        {pose === "thumbsup" && <ThumbsUpPose />}
      </svg>
    </div>
  );
}

function WavingPose() {
  return (
    <g>
      {/* Body - round and friendly */}
      <circle cx="100" cy="120" r="52" fill="#1B7A6E" />
      {/* Belly highlight */}
      <ellipse cx="100" cy="125" rx="35" ry="30" fill="#229386" opacity="0.5" />
      {/* Belt */}
      <rect x="55" y="115" width="90" height="8" rx="4" fill="#155F56" />
      <rect x="93" y="113" width="14" height="12" rx="2" fill="#F5D84E" />

      {/* Head */}
      <circle cx="100" cy="62" r="32" fill="#FDDCB5" />
      {/* Cap */}
      <path
        d="M65 55 Q100 20 135 55"
        fill="#1B7A6E"
        stroke="#155F56"
        strokeWidth="2"
      />
      <rect x="62" y="52" width="76" height="10" rx="5" fill="#1B7A6E" />
      <rect x="58" y="57" width="84" height="5" rx="2.5" fill="#155F56" />
      {/* Cap badge */}
      <circle cx="100" cy="48" r="6" fill="#F5D84E" />
      <text x="100" y="51" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#155F56">A</text>

      {/* Face */}
      {/* Eyes */}
      <ellipse cx="88" cy="62" rx="4" ry="5" fill="#2D3748" />
      <ellipse cx="112" cy="62" rx="4" ry="5" fill="#2D3748" />
      <circle cx="90" cy="60" r="1.5" fill="white" />
      <circle cx="114" cy="60" r="1.5" fill="white" />
      {/* Happy mouth */}
      <path d="M88 75 Q100 86 112 75" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="80" cy="72" r="5" fill="#F5A0A0" opacity="0.4" />
      <circle cx="120" cy="72" r="5" fill="#F5A0A0" opacity="0.4" />

      {/* Left arm - waving */}
      <g>
        <path
          d="M55 110 Q30 80 45 50"
          stroke="#1B7A6E"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand */}
        <circle cx="45" cy="48" r="10" fill="#FDDCB5" />
        {/* Fingers spread for wave */}
        <path d="M38 42 L34 36" stroke="#FDDCB5" strokeWidth="4" strokeLinecap="round" />
        <path d="M42 40 L40 33" stroke="#FDDCB5" strokeWidth="4" strokeLinecap="round" />
        <path d="M48 40 L48 33" stroke="#FDDCB5" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 42 L55 36" stroke="#FDDCB5" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Right arm - down */}
      <path
        d="M145 110 Q160 130 155 150"
        stroke="#1B7A6E"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="155" cy="152" r="9" fill="#FDDCB5" />

      {/* Feet */}
      <ellipse cx="82" cy="172" rx="16" ry="8" fill="#155F56" />
      <ellipse cx="118" cy="172" rx="16" ry="8" fill="#155F56" />
    </g>
  );
}

function SearchingPose() {
  return (
    <g>
      {/* Body */}
      <circle cx="100" cy="120" r="48" fill="#1B7A6E" />
      <ellipse cx="100" cy="125" rx="32" ry="28" fill="#229386" opacity="0.5" />
      {/* Belt */}
      <rect x="58" y="115" width="84" height="7" rx="3.5" fill="#155F56" />
      <rect x="93" y="113" width="14" height="11" rx="2" fill="#F5D84E" />

      {/* Head - slightly tilted/leaning forward */}
      <g transform="rotate(-5, 100, 62)">
        <circle cx="100" cy="62" r="30" fill="#FDDCB5" />
        {/* Cap */}
        <path d="M68 55 Q100 24 132 55" fill="#1B7A6E" stroke="#155F56" strokeWidth="2" />
        <rect x="65" y="52" width="70" height="9" rx="4.5" fill="#1B7A6E" />
        <rect x="61" y="57" width="78" height="4" rx="2" fill="#155F56" />
        <circle cx="100" cy="48" r="5.5" fill="#F5D84E" />
        <text x="100" y="51" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#155F56">A</text>

        {/* Eyes - focused/squinting */}
        <ellipse cx="88" cy="62" rx="4" ry="4" fill="#2D3748" />
        <ellipse cx="110" cy="62" rx="4" ry="4" fill="#2D3748" />
        <circle cx="89.5" cy="60.5" r="1.5" fill="white" />
        <circle cx="111.5" cy="60.5" r="1.5" fill="white" />
        {/* Concentrated mouth */}
        <path d="M92 74 Q100 78 108 74" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* One eyebrow raised */}
        <path d="M82 54 Q88 50 94 53" stroke="#8B6E4E" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="80" cy="70" r="4.5" fill="#F5A0A0" opacity="0.4" />
        <circle cx="120" cy="70" r="4.5" fill="#F5A0A0" opacity="0.4" />
      </g>

      {/* Right arm - holding magnifying glass */}
      <path
        d="M145 105 Q165 85 160 60"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="160" cy="58" r="8" fill="#FDDCB5" />

      {/* Magnifying glass */}
      <circle cx="175" cy="40" r="18" stroke="#8B6E4E" strokeWidth="4" fill="none" />
      <circle cx="175" cy="40" r="14" fill="#E0F2F1" opacity="0.5" />
      <ellipse cx="170" cy="35" rx="5" ry="3" fill="white" opacity="0.6" transform="rotate(-20, 170, 35)" />
      <path d="M162 53 L155 62" stroke="#8B6E4E" strokeWidth="5" strokeLinecap="round" />

      {/* Left arm - down */}
      <path
        d="M55 110 Q40 130 45 150"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="45" cy="152" r="8" fill="#FDDCB5" />

      {/* Feet */}
      <ellipse cx="82" cy="168" rx="15" ry="7" fill="#155F56" />
      <ellipse cx="118" cy="168" rx="15" ry="7" fill="#155F56" />
    </g>
  );
}

function PointingPose() {
  return (
    <g>
      {/* Body */}
      <circle cx="100" cy="120" r="48" fill="#1B7A6E" />
      <ellipse cx="100" cy="125" rx="32" ry="28" fill="#229386" opacity="0.5" />
      {/* Belt */}
      <rect x="58" y="115" width="84" height="7" rx="3.5" fill="#155F56" />
      <rect x="93" y="113" width="14" height="11" rx="2" fill="#F5D84E" />

      {/* Head */}
      <circle cx="100" cy="62" r="30" fill="#FDDCB5" />
      {/* Cap */}
      <path d="M68 55 Q100 24 132 55" fill="#1B7A6E" stroke="#155F56" strokeWidth="2" />
      <rect x="65" y="52" width="70" height="9" rx="4.5" fill="#1B7A6E" />
      <rect x="61" y="57" width="78" height="4" rx="2" fill="#155F56" />
      <circle cx="100" cy="48" r="5.5" fill="#F5D84E" />
      <text x="100" y="51" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#155F56">A</text>

      {/* Eyes - friendly wink */}
      <ellipse cx="88" cy="62" rx="4" ry="5" fill="#2D3748" />
      {/* Winking eye */}
      <path d="M106 62 Q112 58 118 62" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="89.5" cy="60" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M88 75 Q100 85 112 75" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="80" cy="72" r="5" fill="#F5A0A0" opacity="0.4" />
      <circle cx="120" cy="72" r="5" fill="#F5A0A0" opacity="0.4" />

      {/* Right arm - pointing right */}
      <path
        d="M148 108 Q170 95 185 90"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="185" cy="88" r="8" fill="#FDDCB5" />
      {/* Pointing finger */}
      <path d="M192 86 L205 82" stroke="#FDDCB5" strokeWidth="5" strokeLinecap="round" />
      {/* Arrow effect */}
      <path d="M200 78 L210 82 L200 86" stroke="#F5D84E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Left arm - on hip */}
      <path
        d="M55 108 Q35 120 42 140"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="43" cy="142" r="8" fill="#FDDCB5" />

      {/* Feet */}
      <ellipse cx="82" cy="168" rx="15" ry="7" fill="#155F56" />
      <ellipse cx="118" cy="168" rx="15" ry="7" fill="#155F56" />
    </g>
  );
}

function ThumbsUpPose() {
  return (
    <g>
      {/* Body */}
      <circle cx="100" cy="120" r="48" fill="#1B7A6E" />
      <ellipse cx="100" cy="125" rx="32" ry="28" fill="#229386" opacity="0.5" />
      {/* Belt */}
      <rect x="58" y="115" width="84" height="7" rx="3.5" fill="#155F56" />
      <rect x="93" y="113" width="14" height="11" rx="2" fill="#F5D84E" />

      {/* Head */}
      <circle cx="100" cy="62" r="30" fill="#FDDCB5" />
      {/* Cap */}
      <path d="M68 55 Q100 24 132 55" fill="#1B7A6E" stroke="#155F56" strokeWidth="2" />
      <rect x="65" y="52" width="70" height="9" rx="4.5" fill="#1B7A6E" />
      <rect x="61" y="57" width="78" height="4" rx="2" fill="#155F56" />
      <circle cx="100" cy="48" r="5.5" fill="#F5D84E" />
      <text x="100" y="51" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#155F56">A</text>

      {/* Eyes - happy closed */}
      <path d="M82 62 Q88 57 94 62" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M106 62 Q112 57 118 62" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Big smile */}
      <path d="M86 74 Q100 88 114 74" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="80" cy="70" r="5" fill="#F5A0A0" opacity="0.5" />
      <circle cx="120" cy="70" r="5" fill="#F5A0A0" opacity="0.5" />

      {/* Right arm - thumbs up */}
      <path
        d="M145 105 Q160 80 155 60"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Fist */}
      <rect x="147" y="50" width="16" height="14" rx="5" fill="#FDDCB5" />
      {/* Thumb up */}
      <path d="M155 52 L155 38" stroke="#FDDCB5" strokeWidth="6" strokeLinecap="round" />

      {/* Left arm - down */}
      <path
        d="M55 110 Q40 130 45 150"
        stroke="#1B7A6E"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="45" cy="152" r="8" fill="#FDDCB5" />

      {/* Feet */}
      <ellipse cx="82" cy="168" rx="15" ry="7" fill="#155F56" />
      <ellipse cx="118" cy="168" rx="15" ry="7" fill="#155F56" />
    </g>
  );
}
