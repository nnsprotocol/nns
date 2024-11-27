const IconStar: React.FC<{ size?: number, fill?: string }> = ({ size, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 14}
      height={size || 14}
      viewBox="0 0 15 14"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.62621 1.87255C6.88755 1.2443 7.77888 1.2443 8.04021 1.87255L9.25471 4.79272L12.407 5.04589C13.086 5.10014 13.3614 5.94714 12.844 6.39047L10.4424 8.44789L11.1756 11.5238C11.3337 12.1865 10.6133 12.7097 10.0323 12.3551L7.33321 10.7066L4.63413 12.3551C4.05313 12.7097 3.33271 12.1859 3.4908 11.5238L4.22405 8.44789L1.82246 6.39047C1.30505 5.94714 1.58038 5.10014 2.25938 5.04589L5.41171 4.79272L6.62621 1.87255Z"
        fill={fill || '#FFFFFF'}
      />
    </svg>
  );
};

export default IconStar;
