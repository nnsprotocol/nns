import IconInfo from "../icons/IconInfo";

interface Props {
  text: string;
}

const Tooltip: React.FC<Props> = ({ text }) => {
  return (
    <>
      <div className="info-point">
        <span className="info-point-text">{text}</span>
        <IconInfo className="info-point-icon" />
      </div>
    </>
  );
};

export default Tooltip;
