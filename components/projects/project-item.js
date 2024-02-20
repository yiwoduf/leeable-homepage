import Image from "next/image";

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
    default:
      return "bg-purple-600";
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

  return (
    <div className="project-card">
      <Image
        className="rounded-t-xl"
        src={imgSrc}
        alt="cover image"
        width="100%"
        height="70%"
        layout="responsive"
        objectFit="cover"
        quality={70}
      />

      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <h3 className="mt-4 text-xl">{description}</h3>
        <a href={github}>Visit Github</a>
        <div className="flex items-start mt-2 overflow-x-auto scrollbar-hide">
          {tags.map((aTag) => (
            <h1
              style={{ color: "#FFFFFF" }}
              className={`px-2 py-1 mr-2 rounded-md ${getBgColor(
                aTag.name
              )} w-30`}
              key={aTag.id}
            >
              {aTag.name}
            </h1>
          ))}
        </div>
      </div>
    </div>
  );
}
