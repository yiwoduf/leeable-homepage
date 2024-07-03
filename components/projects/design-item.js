import Image from "next/legacy/image";
import Loader from "./loader";
import { useState, useEffect } from "react";

function getBgColor(tag) {
  // key 값에 따라 색상 클래스를 결정
  switch (tag) {
    case "Logo":
      return "bg-sky-700";
    case "UI":
      return "bg-red-700";
    case "Poster":
      return "bg-yellow-400";
    default:
      return "bg-purple-600";
  }
}

export default function DesignItem({ data }) {
  const title = data.properties.Name.title[0].plain_text;
  //const github = data.properties.Github.url;
  // const youtube = data.properties.Youtube.url;
  const description = data.properties.Description.rich_text[0].plain_text;
  const imgSrc = data.cover.file?.url || data.cover.external.url;
  const tags = data.properties.Type.select;

  // const calculatedPeriod = (start, end) => {
  //   const startDateStringArray = start.split("-");
  //   const endDateStringArray = end.split("-");

  //   var startDate = new Date(
  //     startDateStringArray[0],
  //     startDateStringArray[1],
  //     startDateStringArray[2]
  //   );
  //   var endDate = new Date(
  //     endDateStringArray[0],
  //     endDateStringArray[1],
  //     endDateStringArray[2]
  //   );

  //   console.log(`startDate: ${startDate}`);
  //   console.log(`endDate: ${endDate}`);

  //   const diffInMs = Math.abs(endDate - startDate);
  //   const result = diffInMs / (1000 * 60 * 60 * 24);

  //   console.log(`Project Period : ${result}`);
  //   return result;
  // };

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
        <div className="flex items-start mt-2 overflow-x-auto scrollbar-hide">
          <h1
            style={{ color: "#FFFFFF", whiteSpace: "nowrap" }}
            className={`px-2 py-1 mr-2 rounded-md ${getBgColor(
              tags.name
            )} w-30`}
          >
            {tags.name}
          </h1>
        </div>
      </div>
    </div>
  );
}
