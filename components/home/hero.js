import Animation from "./animation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  }, [theme]);
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
          and adaptability. My dream is to create a revolutionary business and
          this ambition fuels my efficiency and productivity. Explore my
          portfolio to see the projects I&apos;ve tackled, the skills I&apos;ve
          honed, and the passion I pour into my work. Excited to share my
          journey with you!
        </p>
        <div className="flex justify-center">
          <Link href="/projects">
            <a className="btn-project">View My Work</a>
          </Link>
        </div>
      </div>
      <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
        <Animation />
      </div>
    </>
  );
}
