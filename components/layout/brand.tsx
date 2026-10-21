export function Brand({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean
  compact?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <svg
        viewBox="0 0 44 44"
        className={compact ? "h-8 w-8" : "h-8 w-8 sm:h-10 sm:w-10"}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 11C11 9 16 12 22 17V37C16 32 11 30 4 32V11Z"
          fill={inverse ? "#A9D8CA" : "#21645E"}
        />
        <path
          d="M22 17C28 11 34 9 40 11V32C33 30 28 32 22 37V17Z"
          fill={inverse ? "#F2C886" : "#4B8B7E"}
        />
        <path
          d="M22 17V36M9 17C13 17 16 19 18 21M9 23C13 23 16 25 18 27"
          stroke={inverse ? "#153D39" : "#FFFDF7"}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="34" cy="5" r="4" fill="#DC987C" />
      </svg>
      <span
        className={`${compact ? "text-xl" : "text-xl sm:text-2xl"} tracking-[-0.045em] ${inverse ? "text-white" : "text-secondary"}`}
      >
        <span className="font-bold">Weight</span>
        <span className="font-medium">Literacy</span>
        <span className="text-[#BD6749]">.</span>
      </span>
    </span>
  )
}
