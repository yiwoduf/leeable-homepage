// pages/api/projectCounts.js
import {
  DATABASE_ID_PROJECT,
  DATABASE_ID_DESIGN,
  DATABASE_ID_EXP,
  TOKEN,
} from "../../config";
export default async function handler(req, res) {
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

  // Do it all at once
  const [projectResponse, designResponse, expResponse] = await Promise.all([
    fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID_PROJECT}/query`,
      options
    ),
    fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID_DESIGN}/query`,
      options
    ),
    fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID_EXP}/query`,
      options
    ),
  ]);

  // JSON convert
  const [projects, designs, experiences] = await Promise.all([
    projectResponse.json(),
    designResponse.json(),
    expResponse.json(),
  ]);

  const projectCount = projects.results.length;
  const designCount = designs.results.length;
  const experienceCount = experiences.results.length;

  res.status(200).json({ projectCount, designCount, experienceCount });
}
