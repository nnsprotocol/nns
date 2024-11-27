const ToggleDefault: React.FC<{
  isOn: boolean;
  setIsOn: React.Dispatch<React.SetStateAction<boolean>> | ((value: boolean) => void);
}> = ({ isOn, setIsOn }) => {
  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  return (
    <div
      className={`w-[48px] h-[24px] flex items-center rounded-full cursor-pointer ${
        isOn ? "bg-surfaceBrandLavender" : "bg-gray-300"
      }`}
      onClick={toggleSwitch}
    >
      <div
        className={`bg-surfaceInverse w-[24px] h-[24px] border rounded-full shadow-md transform duration-300 ease-in-out ${
          isOn ? "translate-x-6 border-borderBrandLavender" : "border-gray-300"
        }`}
      ></div>
    </div>
  );
};

export default ToggleDefault;
