export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full h-14 px-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1d293d] text-sm
        placeholder:text-[#90a1b9]
        focus:outline-none focus:bg-white focus:border-[#7ccf00]
        ${className}`}
      {...props}
    />
  )
}
