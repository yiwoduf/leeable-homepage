import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Animation = dynamic(() => import("./animation"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Hero() {
  const titleTextOne = encodeURI("Welcome To My Portfolio!");
  const titleTextTwo = encodeURI("I'm Jaeyol Lee :)");
  const titleTextThree = encodeURI("I'm a Software Engineer");
  const titleTextFour = encodeURI("I'm a Web Developer");
  const { theme } = useTheme();
  const [titleURL, setTitleOne] = useState("");

  useEffect(() => {
    const color = theme === "dark" ? "FFFFFF" : "111827";
    setTitleOne(
      `https://readme-typing-svg.demolab.com?font=Fira+Code&size=30&duration=2500&pause=900&color=${color}&vCenter=true&random=false&width=435&lines=${titleTextOne};${titleTextTwo};${titleTextThree};${titleTextFour}`
    );
  }, [theme, titleTextOne, titleTextTwo, titleTextThree, titleTextFour]);
  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        {/* <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
          Welcome! I&apos;m Peter!
          <br className="hidden lg:inline-block" />음 여기다가 뭘 쓸까
        </h1> */}
        <img className="w-full" src={titleURL} alt="Typing SVG" />

        <p className="mb-8 leading-relaxed">
          Welcome to my portfolio! I&apos;m Peter (Jaeyol) Lee, a Computer
          Science major from the University of Kansas, with a strong passion for
          front-end and web development. I&apos;m intrigued by UI/UX design and
          have gained extensive experience from numerous projects. As a proud
          1.5 generation Korean American, I bring a unique global perspective
          and adaptability. My strengths are voracious self-learning and
          versatile mindset, which drive my efficiency and productivity. Explore
          my portfolio to see the projects I&apos;ve tackled, the skills
          I&apos;ve honed, and the passion I pour into my work. Excited to share
          my journey with you!
        </p>
        <div className="flex justify-start space-x-5 w-full">
          <div className="flex justify-center transition duration-300 transform shadow-lg hover:scale-105 hover:shadow-lg">
            <Link className="btn-project" href="/projects">
              VIEW MY WORK
            </Link>
          </div>
          <div className="flex justify-center transition duration-300 transform shadow-lg hover:scale-105 hover:shadow-lg">
            <a
              href="/Lee-CV.pdf"
              download
              className="btn-cv flex items-center justify-center"
            >
              <svg
                className="mr-2"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="0.8em"
                width="0.8em"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              RESUME/CV
            </a>
          </div>
        </div>
      </div>
      <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
        <Animation />
      </div>
    </>
  );
}
