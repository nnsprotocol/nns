const DomainCheckoutContainer: React.FC<{
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ children }) => {
  return (
    <section className="w-full bg-surfaceInverse border border-borderLight py-md rounded-32 relative">
      <h3 className="text-center text-textSecondary text-sm uppercase font-medium mb-lg">
        Claim
      </h3>
      <div>{children}</div>
    </section>
  );
};

export default DomainCheckoutContainer;
