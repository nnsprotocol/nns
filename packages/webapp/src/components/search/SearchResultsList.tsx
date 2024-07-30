import { Link } from "react-router-dom";
import BadgeAvailable from "../badges/BadgeAvailable";
import BadgeUnavailable from "../badges/BadgeUnavailable";
import IconArrowRight from "../icons/IconArrowRight";

const SearchResultsList: React.FC<{ showResults: boolean }> = ({ showResults }) => {
  const searchResults = [
    { id: "result-1", text: "bob.⌐◨-◨", isAvailable: true, url: "/" },
    { id: "result-2", text: "alice.⌐◨-◨", isAvailable: false, url: "/" },
  ];

  if(!showResults) {
    return <></>
  }

  return (
    <div className="absolute left-0 top-100 w-full py-2 z-20">
      <div className="border border-borderPrimary rounded-xl p-sm relative overflow-hidden">
        <div className="absolute inset-0 z-0 backdrop-blur-lg bg-surfacePrimary rounded-xl"></div>
        <div className="relative z-10">
          <p className="text-xs text-textSecondary font-medium mb-xs">
            Results
          </p>
          <ul className="grid grid-cols-1 gap-xs">
            {searchResults.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.url}
                  className="flex gap-xs items-center hover:bg-surfaceSecondary px-xs py-sm rounded-lg"
                >
                  <span className="text-sm text-textInverse font-normal">
                    {item.text}
                  </span>
                  {item.isAvailable ? <BadgeAvailable /> : <BadgeUnavailable />}
                  <span className="stroke-textSecondary ms-auto">
                    <IconArrowRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsList;
