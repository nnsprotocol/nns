import { Link } from "react-router-dom";

const links = [
  { id: "nns", imgSrc: "/temp/nns.svg", text: ".⌐◨-◨" },
  { id: "nouns", imgSrc: "/temp/noun-1.svg", text: ".nouns" },
];

function SectionCards() {
  return (
    <section className="flex flex-col items-center gap-lg">
      <p className="text-lg text-textSecondary font-semibold">
        Explore communities
      </p>
      <div className="w-full max-w-6xl">
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {links.map((item) => (
            <li key={item.id}>
              <Link
                to={`/collections/${item.id}`}
                className="button-secondary rounded-3xl border-borderPrimary p-lg min-h-[262px] relative overflow-hidden"
              >
                <div className="absolute inset-0 backdrop-blur-[30px] z-0"></div>
                <div className="relative z-10 flex justify-center w-full">
                  <div className="grid grid-cols-1 gap-lg">
                    <div>
                      <img
                        src={item.imgSrc}
                        className="w-[72px] h-[72px]"
                        alt={item.text}
                      />
                    </div>
                    <div className="text-lg font-medium text-textSecondary text-center">
                      {item.text}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default SectionCards;
