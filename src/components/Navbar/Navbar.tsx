import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useUiStore } from "../../store/ui";
import { CursiveUnderline } from "../CursiveUnderline";
import { LensLogo } from "../LensLogo";
import { RatingStars } from "../RatingStars";
import { VisuallyHidden } from "../VisuallyHidden";

const linkClassName = "font-corinthia text-5xl text-main";

const activeLinkClassName = "";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const isDev = import.meta.env.DEV;

export const Navbar = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);

  return (
    <div className=" ">
      <h1>
        <VisuallyHidden>The Lens</VisuallyHidden>
      </h1>
      <div className="flex justify-center w-full pt-12 pb-8">
        <LensLogo className="w-[260px] sm:w-[380px] md:w-[500px]" />
      </div>
      <div className="flex justify-center">
        <motion.p
          className="text-center text-base text-main/70 max-w-[764px] px-4"
          variants={fadeIn}
          initial={enableAnimations ? "hidden" : false}
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Everything you see here is a piece of work I feel positively about. A{" "}
          <RatingStars
            rating={1}
            filledOnly
            className="align-text-bottom text-xs translate-y-[-2px]"
          />{" "}
          review is not a negative, it just means it met the minimum threshold
          of enjoyment for me. If something is not here, it simply means I have
          not experienced it or it wasn't to my taste. Reviews with{" "}
          <RatingStars rating={5} className="align-text-bottom text-xs" /> are
          works that I'm especially attached to.
        </motion.p>
      </div>
      <nav className="px-6 pt-6 w-[300px] mx-auto">
        <motion.ul
          className="flex items-center justify-center"
          variants={fadeIn}
          initial={enableAnimations ? "hidden" : false}
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <li className="border-r-1 border-main/20 w-[120px] flex justify-end pr-4">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={linkClassName}
              activeProps={{ className: activeLinkClassName }}
            >
              {({ isActive }) => (
                <span className="relative inline-block">
                  Music
                  {isActive && (
                    <CursiveUnderline className="absolute inset-x-0 -bottom-1 h-3 w-full" />
                  )}
                </span>
              )}
            </Link>
          </li>
          <li className="w-[120px] flex justify-start pl-4">
            <Link
              to="/film"
              className={linkClassName}
              activeProps={{ className: activeLinkClassName }}
            >
              {({ isActive }) => (
                <span className="relative inline-block">
                  Film
                  {isActive && (
                    <CursiveUnderline className="absolute inset-x-0 -bottom-1 h-3 w-full" />
                  )}
                </span>
              )}
            </Link>
          </li>
        </motion.ul>
      </nav>
      {isDev && (
        <div className="flex justify-center pt-4">
          <Link
            to="/admin-panel"
            className="text-xs tracking-wide text-main/40 transition-colors hover:text-main"
          >
            Admin
          </Link>
        </div>
      )}
    </div>
  );
};
