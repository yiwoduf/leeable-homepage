import Image from "next/legacy/image";
import Loader from "./loader";
import { useState, useEffect } from "react";

function getBgColor(tag) {
  // key 값에 따라 색상 클래스를 결정
  switch (tag) {
    case "C++":
      return "bg-sky-700";
    case "HTML":
      return "bg-red-700";
    case "CSS":
      return "bg-sky-400";
    case "JavaScript":
      return "bg-yellow-400";
    case "React Native":
      return "bg-blue-500";
    case "TailwindCSS":
      return "bg-blue-400";
    case "ReactJS":
      return "bg-blue-500";
    case "NextJS":
      return "bg-black";
    case "SQL":
      return "bg-sky-700";
    case "C#":
      return "bg-violet-500";
    case "ElectronJS":
      return "bg-blue-600";
    case "Flask":
      return "bg-cyan-700";
    case "Express":
      return "bg-amber-400";
    case "MongoDB":
      return "bg-lime-400";
    case "Mongoose":
      return "bg-rose-700";
    case "Babel":
      return "bg-amber-500";
    case "NoSQL":
      return "bg-indigo-400";
    case "SCSS":
      return "bg-rose-400";
    case "Multi-Thread":
      return "bg-teal-500";
    case "MachineLearning":
      return "bg-rose-600";
    case "Docker":
      return "bg-sky-500";
    case "Python":
      return "bg-sky-700";
    case "API":
      return "bg-lime-500";
    case "Database":
      return "bg-indigo-400";
    case "MySQL":
      return "bg-cyan-500";
    case "MariaDB":
      return "bg-indigo-300";
    case "Java":
      return "bg-orange-600";
    case "Reverse Engineering":
      return "bg-pink-500";
    case "Server":
      return "bg-emerald-500";
    case "XML":
      return "bg-orange-500";
    default:
      return "bg-blue-600";
  }
}

export default function ProjectItem({ data }) {
  const title = data.properties.Name.title[0].plain_text;
  const github = data.properties.Github.url;
  // const youtube = data.properties.Youtube.url;
  const description = data.properties.Description.rich_text[0].plain_text;
  const imgSrc = data.cover.file?.url || data.cover.external.url;
  const tags = data.properties.Tags.multi_select;
  const start = data.properties.WorkPeriod.date.start;
  const end = data.properties.WorkPeriod.date.end;

  const calculatedPeriod = (start, end) => {
    const startDateStringArray = start.split("-");
    const endDateStringArray = end.split("-");

    var startDate = new Date(
      startDateStringArray[0],
      startDateStringArray[1],
      startDateStringArray[2]
    );
    var endDate = new Date(
      endDateStringArray[0],
      endDateStringArray[1],
      endDateStringArray[2]
    );

    console.log(`startDate: ${startDate}`);
    console.log(`endDate: ${endDate}`);

    const diffInMs = Math.abs(endDate - startDate);
    const result = diffInMs / (1000 * 60 * 60 * 24);

    console.log(`Project Period : ${result}`);
    return result;
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    return () => {
      setIsLoaded(false); // This will be executed when the component unmounts
    };
  }, []);

  return (
    <div className="project-card">
      <div style={{ maxWidth: "500px", position: "relative" }}>
        {!isLoaded && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Loader />
          </div>
        )}
        <Image
          className="rounded-t-xl"
          src={imgSrc}
          alt="cover image"
          width="100%"
          height="70%"
          layout="responsive"
          objectFit="cover"
          quality={70}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <h3 className="mt-2 text-m text-gray-400">{description}</h3>
        <a
          className="text-sm text-sky-600 hover:text-sky-800"
          href={github}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Project
        </a>
        <div className="flex flex-wrap items-start mt-2">
          {tags.map((aTag) => {
            const bgColorClass = getBgColor(aTag.name);
            return (
              <span
                className={`px-2 text-xs py-1 mt-2 mr-2 rounded-md bg-neutral-200 text-white transition-all duration-300 ease-in-out transform hover:scale-110`}
                key={aTag.id}
                onMouseEnter={(e) =>
                  e.target.classList.replace("bg-neutral-200", bgColorClass)
                }
                onMouseLeave={(e) =>
                  e.target.classList.replace(bgColorClass, "bg-neutral-200")
                }
              >
                {aTag.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
