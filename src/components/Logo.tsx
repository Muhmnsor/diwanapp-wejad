export const Logo = () => {
  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 ml-2"
    >
      <g transform="translate(150, 150) rotate(-22.5)">
        {/* Blue strip top-left */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#2B4498"
          transform="rotate(315)"
        />
        {/* Yellow strip top */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#FFB81C"
          transform="rotate(0)"
        />
        {/* Purple strip top-right */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#B5A4D0"
          transform="rotate(45)"
        />
        {/* Pink strip right */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#FF6B8B"
          transform="rotate(90)"
        />
        {/* Blue strip bottom-right */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#2B4498"
          transform="rotate(135)"
        />
        {/* Yellow strip bottom */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#FFB81C"
          transform="rotate(180)"
        />
        {/* Purple strip bottom-left */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#B5A4D0"
          transform="rotate(225)"
        />
        {/* Gray strip left */}
        <path
          d="M -10,-120 L 10,-120 L 10,-35 A 10 10 0 0 1 -10,-35 Z"
          fill="#939598"
          transform="rotate(270)"
        />
      </g>
    </svg>
  );
};