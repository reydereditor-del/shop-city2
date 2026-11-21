import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// This enhancement loads only on wide homepages with motion enabled.
// The normal DOM provides the complete gallery at every scroll position.
export default function EditorialMotion({ root }: { root: HTMLDivElement }) {
  useGSAP(
    () => {
      const page = root;

      const cover = page.querySelector(".cover")!;
      const coverTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: cover,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      coverTimeline
        .fromTo(
          cover.querySelector(".cover-portrait img"),
          { scale: 1.035, yPercent: -1.2 },
          { yPercent: 1.2 },
          0,
        )
        .fromTo(
          cover.querySelector(".cover-detail img"),
          { scale: 1.1, yPercent: 3.8 },
          { yPercent: -3.8 },
          0,
        );

      for (const frame of page.querySelectorAll(".lookbook-photo")) {
        const reveal = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: frame,
            start: "top 96%",
            end: "center 62%",
            scrub: true,
          },
        });
        reveal
          .fromTo(
            frame.querySelector(".photo-mask"),
            { scaleY: 1 },
            { scaleY: 0 },
            0,
          )
          .fromTo(
            frame.querySelector("img"),
            { scale: 1.05, yPercent: 1.7 },
            { scale: 1, yPercent: 0 },
            0,
          );
      }
    },
    { scope: root },
  );
  return null;
}
