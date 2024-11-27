const IconArrowRight: React.FC<{ size?: number }> = ({ size }) => {
  return (
    <svg
      width={size || 14}
      height={size || 14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.875 2.625L12.25 7M12.25 7L7.875 11.375M12.25 7H1.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconArrowRight;
