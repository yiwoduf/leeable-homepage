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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Amet
          mauris commodo quis imperdiet massa. Consectetur libero id faucibus
          nisl. Duis tristique sollicitudin nibh sit amet. Mus mauris vitae
          ultricies leo integer malesuada nunc vel. Morbi quis commodo odio
          aenean sed adipiscing diam donec adipiscing. Neque gravida in
          fermentum et sollicitudin ac orci phasellus egestas. Vitae aliquet nec
          ullamcorper sit amet risus nullam eget felis. Mi bibendum neque
          egestas congue quisque egestas diam. Est ullamcorper eget nulla
          facilisi etiam dignissim diam quis. Mi proin sed libero enim sed.
          Egestas maecenas pharetra convallis posuere morbi leo urna molestie.
          In eu mi bibendum neque egestas congue quisque.
        </p>
        <div className="flex justify-center">
          <Link href="/projects">
            <a className="btn-project">프로젝트 보러가기</a>
          </Link>
        </div>
      </div>
      <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
        <Animation />
      </div>
    </>
  );
}
