function SectionNamingSystem() {
  return (
    <section>
      <div className="bg-[url('/brand/nns-graffity.png')] min-h-[252px] md:min-h-[352px] w-auto bg-no-repeat bg-contain bg-center flex flex-col justify-end">
        <div id="target" className="flex flex-col items-center gap-md">
          <p className="text-2xl md:text-3xl text-textInverse font-semibold max-w-[657px] text-center">
            Your Naming System, Resolved Right from the Start
          </p>
          <p className="text-textSecondary text-md md:text-lg font-medium leading-6 max-w-[517px] text-center">
            Building a fully resolved web3 naming system takes years. Do it in
            minutes with NNS.
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-md">
        <button type="button" className="button-secondary button-md">
          <span className="w-full text-center">Get in touch</span>
        </button>
      </div>
    </section>
  );
}

export default SectionNamingSystem;
