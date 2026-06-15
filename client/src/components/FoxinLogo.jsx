export default function FoxinLogo({ size = 40, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/foxin-logo.svg"
        alt="Foxin"
        width={size}
        height={size}
        className="rounded-xl shadow-lg shadow-orange-500/30"
      />
      {showText && (
        <span className="font-bold text-lg tracking-tight text-white">Foxin</span>
      )}
    </div>
  );
}
