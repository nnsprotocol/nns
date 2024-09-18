import { CollectionData } from "../../../services/collections";

interface Props {
  collection: CollectionData;
}

const GroupSocialLinks: React.FC<Props> = ({ collection }) => {
  return (
    <div className="flex gap-xs">
      {collection.twitterUrl && (
        <SocialLink
          url={collection.twitterUrl}
          iconSrc="/icons/social/twitter.svg"
        />
      )}
      {collection.discordUrl && (
        <SocialLink
          url={collection.discordUrl}
          iconSrc="/icons/social/discord.svg"
        />
      )}
      {collection.farcasterUrl && (
        <SocialLink
          url={collection.farcasterUrl}
          iconSrc="/icons/social/farcaster.svg"
        />
      )}
    </div>
  );
};

function SocialLink(props: { url: string; iconSrc: string }) {
  return (
    <a
      key={props.url}
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="button-secondary button-md h-[38px] w-[38px] flex items-center justify-center"
    >
      <img src={props.iconSrc} width={14} height={14} alt={props.url} />
    </a>
  );
}

export default GroupSocialLinks;
