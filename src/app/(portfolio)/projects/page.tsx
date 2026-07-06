"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
// @ts-ignore
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

function Page() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, []);

  return (
    <div className="container mx-auto md:px-[50px] xl:px-[150px] text-zinc-300 h-full">
      <h1 className="text-4xl mt-[100px] mb-[50px]">Projects</h1>
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 place-content-around">
          {projects.map((project) => (
            <li
              key={project.id}
              className="w-[300px] h-[400px] border-[.5px] rounded-md border-zinc-600"
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div className="h-[200px]">
                <Splide
                  options={{
                    type: "loop",
                    interval: 3000,
                    autoplay: true,
                    speed: 2000,
                    perMove: 1,
                    rewind: true,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                    arrows: false,
                  }}
                  aria-label={project.title}
                >
                  <SplideSlide>
                    <Image
                      src={project.imageSrc || "/assets/me.jpg"}
                      alt={project.title}
                      className="w-[300px] h-[200px] rounded-md bg-zinc-900 object-cover"
                      width={300}
                      height={200}
                      style={{ height: "200px" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/me.jpg";
                      }}
                    />
                  </SplideSlide>
                </Splide>
              </div>
              <div className="p-4 text-zinc-300">
                <div className="text-xs text-indigo-400 mb-1">{project.category}</div>
                <h2 className="text-xl">{project.title}</h2>
                <p className="mt-2 text-xs text-zinc-500 line-clamp-3">
                  {project.description}
                </p>
                {project.live && (
                  <Link href={project.live} target="_blank" className="text-xs text-zinc-400 hover:text-white mt-2 inline-block underline">
                    Visit →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Page;
