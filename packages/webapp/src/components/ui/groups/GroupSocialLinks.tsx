const GroupSocialLinks: React.FC<{
  customLinkClassName?: string;
  iconSize?: number;
}> = ({ customLinkClassName, iconSize }) => {
  const socialLinks = [
    { iconSrc: "/icons/social/x.svg", url: "https://x.com/" },
    { iconSrc: "/icons/social/farcaster.svg", url: "https://www.farcaster.xyz/" },
    { iconSrc: "/icons/social/discord.svg", url: "https://discord.com/" },
  ];

  return (
    <div className="flex gap-xs">
      {socialLinks.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            customLinkClassName ||
            "button-secondary button-md h-[38px] w-[38px] flex items-center justify-center"
          }
        >
          <img
            src={link.iconSrc}
            width={iconSize || 14}
            height={iconSize || 14}
            alt={link.url}
          />
        </a>
      ))}
    </div>
  );
};

export default GroupSocialLinks;
