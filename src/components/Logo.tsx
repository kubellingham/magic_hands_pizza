export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const nameCls = size === 'lg' ? 'text-[34px]' : 'text-[26px]'
  const subCls = size === 'lg' ? 'text-[15px] tracking-[9px]' : 'text-xs tracking-[7px]'
  return (
    <div className="text-center">
      <div className={`font-cond leading-none font-bold italic ${nameCls}`}>Magic Hand&rsquo;s</div>
      <div className={`font-anton text-brand ${subCls}`}>PIZZA</div>
    </div>
  )
}
