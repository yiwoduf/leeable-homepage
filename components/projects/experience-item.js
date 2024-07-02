import Image from "next/legacy/image";

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
      return "bg-blue-300";
  }
}

export default function ExperienceITem({ data }) {
  const title = data.properties.Name.title[0].plain_text;
  const link = data.properties.Link.url;
  const description = data.properties.Description.rich_text[0].plain_text;
  const imgSrc = data.cover.file?.url || data.cover.external.url;
  const tags = data.properties.Tags.multi_select;
  const startDate = data.properties.WorkPeriod.date.start;
  const endDate = data.properties.WorkPeriod.date.end;

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
        quality={50}
      />

      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <h3 className="mt-2 text-lg text-gray-400">{description}</h3>
        <h4 className="text-md text-gray-300 font-bold italic">
          {startDate} ~ {endDate}
        </h4>
        <div className="flex items-start mt-2 overflow-x-auto scrollbar-hide">
          {tags.map((aTag) => (
            <h1
              style={{ color: "#FFFFFF", whiteSpace: "nowrap" }}
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
