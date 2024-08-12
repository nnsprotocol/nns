const IconMinus: React.FC<{ size?: number }> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 12}
      height={size || 12}
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.125 6C2.125 5.90054 2.16451 5.80516 2.23483 5.73484C2.30516 5.66451 2.40054 5.625 2.5 5.625H9.5C9.59946 5.625 9.69484 5.66451 9.76517 5.73484C9.83549 5.80516 9.875 5.90054 9.875 6C9.875 6.09946 9.83549 6.19484 9.76517 6.26516C9.69484 6.33549 9.59946 6.375 9.5 6.375H2.5C2.40054 6.375 2.30516 6.33549 2.23483 6.26516C2.16451 6.19484 2.125 6.09946 2.125 6Z"
        fill="white"
      />
    </svg>
  );
};

export default IconMinus;
