import Animation from "./animation";
import Link from "next/link";

export default function Hero() {
  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
          Welcome! I'm Peter!
          <br className="hidden lg:inline-block" />음 여기다가 뭘 쓸까
        </h1>
        <p className="mb-8 leading-relaxed">
          Welcome to my portfolio! I am Peter (Jaeyol) Lee, a Computer Science
          major from the University of Kansas, with a deep-rooted passion for
          front-end development, web development, and software engineering. I
          take great interest in UI/UX design and have a wealth of experience in
          Web development, honed from various projects and experiences. Born in
          South Korea and raised in the United States, I am a proud 1.5
          generation Korean American. This unique background has instilled in me
          a global perspective and the adaptability to navigate various cultural
          and professional landscapes. I am driven by an ambitious dream: to
          establish a revolutionary business that will change the world. This
          dream fuels my self-motivation and has shaped me into an excellent
          time keeper, always seeking to maximize efficiency and productivity.
          As you navigate through my portfolio, you will discover the projects
          I've worked on, the skills I've acquired, and the passion I bring to
          my work. I look forward to sharing my journey with you!
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
