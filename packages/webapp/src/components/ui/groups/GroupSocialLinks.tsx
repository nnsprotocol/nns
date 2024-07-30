const GroupSocialLinks: React.FC = () => {
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
          className="button-secondary button-md h-[38px] w-[38px] flex items-center justify-center"
        >
          <img
            src={link.iconSrc}
            width={14}
            height={14}
            className="w-auto h-[14px]"
            alt={link.url}
          />
        </a>
      ))}
    </div>
  );
};

export default GroupSocialLinks;
