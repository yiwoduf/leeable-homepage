import Layout from "../components/layout";
import Head from "next/head";
import { TOKEN, DATABASE_ID_EXP } from "../config";
import ExperienceItem from "../components/projects/experience-item";

export default function Projects({ projects }) {
  //console.log(projects);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 mb-10">
        <Head>
          <title>Leeable | Experience</title>
          <meta name="description" content="Leeable Experience" />
          <link rel="icon" href="/leeable.ico" />
        </Head>
        <h1 className="text-4xl font-bold sm:text-6xl">
          Experience # :
          <span className="pl-4 text-blue-400">{projects.results.length}</span>
        </h1>

        <div className="grid grid-cols-1 gap-8 p-12 m-4 md:grid-cols-2 justify-items-center align-items-center">
          {projects.results.map((aProject) => (
            <ExperienceItem key={aProject.id} data={aProject} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

// 빌드 타임에 호출
// export async function getStaticProps() {

// 각 요청 때마다 호출
export async function getServerSideProps() {
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
      page_size: 100,
    }),
  };

  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID_EXP}/query`,
    options
  );

  const projects = await res.json();

  if (!projects || !projects.results) {
    console.error("API 응답에 문제가 있습니다.", projects);
    return {
      props: { projects: { results: [] } }, // 에러가 발생하면 빈 객체를 반환
    };
  }

  const projectNames = projects.results.map(
    (aProject) => aProject.properties.Name.title[0].plain_text
  );

  console.log(`projectNames : ${projectNames}`);

  return {
    props: { projects }, // will be passed to the page component as props
    // getStaticProps() 메소드를 사용한다면 revalidate 로 데이터 변경시 갱신가능!
    // revalidate: 1 // 데이터 변경이 있으면 갱신 1초 마다
  };
}
