const IconPlus: React.FC<{ size?: number }> = ({ size }) => {
  return (
    <svg
      width={size || 12}
      height={size || 12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Standard-Icons">
        <path
          id="Vector"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 1.875C6.09946 1.875 6.19484 1.91451 6.26516 1.98483C6.33549 2.05516 6.375 2.15054 6.375 2.25V5.625H9.75C9.84946 5.625 9.94484 5.66451 10.0152 5.73484C10.0855 5.80516 10.125 5.90054 10.125 6C10.125 6.09946 10.0855 6.19484 10.0152 6.26516C9.94484 6.33549 9.84946 6.375 9.75 6.375H6.375V9.75C6.375 9.84946 6.33549 9.94484 6.26516 10.0152C6.19484 10.0855 6.09946 10.125 6 10.125C5.90054 10.125 5.80516 10.0855 5.73484 10.0152C5.66451 9.94484 5.625 9.84946 5.625 9.75V6.375H2.25C2.15054 6.375 2.05516 6.33549 1.98483 6.26516C1.91451 6.19484 1.875 6.09946 1.875 6C1.875 5.90054 1.91451 5.80516 1.98483 5.73484C2.05516 5.66451 2.15054 5.625 2.25 5.625H5.625V2.25C5.625 2.15054 5.66451 2.05516 5.73484 1.98483C5.80516 1.91451 5.90054 1.875 6 1.875Z"
          fill="white"
        />
      </g>
    </svg>
  );
};

export default IconPlus;