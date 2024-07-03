import Link from "next/link";
import { useRouter } from "next/router";
import DarkModeToggleButton from "./dark-mode-toggle-button";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import DesignItem from "./projects/design-item";

export default function Header() {
  const router = useRouter();

  /* DISPLAY COUNTS */
  const [projectCount, setProjectCount] = useState(0);
  const [designCount, setDesignCount] = useState(0); // 디자인 수를 관리하는 상태를 추가합니다.
  const [experienceCount, setExperienceCount] = useState(0); // 경험 수를 관리하는 상태를 추가합니다.

  useEffect(() => {
    fetch("/api/projectCounts")
      .then((response) => response.json())
      .then((data) => {
        setProjectCount(data.projectCount);
        setDesignCount(data.designCount); // 디자인 수를 설정합니다.
        setExperienceCount(data.experienceCount); // 경험 수를 설정합니다.
      });
  }, []);

  /* FOR RESPONSIVE NAV */
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fontSize = windowWidth < 560 ? "text-xs" : "text-base";

  /* ACTIVE TAB HANDLER */
  const isActive = (pathname) => router.pathname === pathname;
  return (
    <>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <Link href="/" legacyBehavior>
            <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-10 h-10 text-white p-2 bg-blue-300 rounded-full"
                viewBox="0 0 24 24"
              >
                <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z"></path>
              </svg>
              <span className="ml-3 text-xl">Leeable Homepage</span>
            </a>
          </Link>

          <nav
            className={`md:ml-auto flex flex-wrap items-center text-base justify-center ${fontSize}`}
          >
            <Link href="/" legacyBehavior>
              <a
                className={`mr-5 hover:text-gray-700 ${
                  isActive("/") ? "font-bold border-b-2 border-blue-500" : ""
                }`}
              >
                Home
              </a>
            </Link>

            <Link href="/projects" legacyBehavior>
              <a
                className={`mr-5 hover:text-gray-700 ${
                  isActive("/projects")
                    ? "font-bold border-b-2 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-blue-500 font-bold">
                  <CountUp start={0} end={projectCount} duration={3} />{" "}
                </span>
                Projects
              </a>
            </Link>

            <Link href="/design" legacyBehavior>
              <a
                className={`mr-5 hover:text-gray-700 ${
                  isActive("/design")
                    ? "font-bold border-b-2 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-blue-500 font-bold">
                  <CountUp start={0} end={designCount} duration={3} />
                </span>{" "}
                Design
              </a>
            </Link>

            <Link href="/experience" legacyBehavior>
              <a
                className={`mr-5 hover:text-gray-700 ${
                  isActive("/experience")
                    ? "font-bold border-b-2 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-blue-500 font-bold">
                  <CountUp start={0} end={experienceCount} duration={3} />
                </span>{" "}
                Experience
              </a>
            </Link>

            <a
              href="mailto:yiwoduf@gmail.com"
              className="mr-5 hover:text-gray-700"
            >
              Contact
            </a>
          </nav>
          {/* 다크모드 토글 버튼 작업해야함 */}
          <DarkModeToggleButton />
        </div>
      </header>
    </>
  );
}
