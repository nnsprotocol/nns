function BadgeEarned() {
  return (
    <div className="bg-badgeLavenderGradient border border-borderBrandLavender relative rounded-128 overflow-hidden p-xs pe-md">
      <div className="absolute inset-0 backdrop-blur-1xl bg-surfaceBrandLavender/10 z-0"></div>
      <div className="relative z-10 flex gap-xxs">
        <div>
          <img src="/brand/coin-earn.svg" alt="Coin hand" className="w-12 h-12" />
        </div>
        <div className="grid grid-cols-1 gap-xxs">
          <p className="text-xs font-medium uppercase text-[#4D3768]">Earned</p>
          <div>
            <span className="text-textInverse text-2xl font-medium me-1">2.14</span>
            <sub className="text-textInverse text-sm font-medium">ETH</sub>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BadgeEarned;
