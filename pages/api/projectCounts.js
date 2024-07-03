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

  // Project #
  const projectResponse = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID_PROJECT}/query`,
    options
  );
  const projects = await projectResponse.json();
  const projectCount = projects.results.length;

  // Design #
  const designResponse = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID_DESIGN}/query`,
    options
  );
  const designs = await designResponse.json();
  const designCount = designs.results.length;

  // Experience #
  const expResponse = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID_EXP}/query`,
    options
  );
  const experiences = await expResponse.json();
  const experienceCount = experiences.results.length;

  res.status(200).json({ projectCount, designCount, experienceCount });
}
