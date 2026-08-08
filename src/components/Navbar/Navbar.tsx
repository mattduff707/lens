import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { CursiveUnderline } from "../CursiveUnderline";
import { LensLogo } from "../LensLogo";
import { VisuallyHidden } from "../VisuallyHidden";

const linkClassName = "font-corinthia text-5xl text-main";

const activeLinkClassName = "";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const isDev = import.meta.env.DEV;

export const Navbar = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className=" ">
      <h1>
        <VisuallyHidden>The Lens</VisuallyHidden>
      </h1>
      <div className="flex justify-center w-full pt-12 pb-8">
        <LensLogo className="w-[500px]" />
      </div>
      <div className="flex justify-center">
        <motion.p
          className="text-center text-base text-main/70 max-w-[500px]"
          variants={fadeUp}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Everything you see here is a piece of work I feel positively about. A
          1 star review is not a negative, it is just means it met the minimum
          threshold of enjoyment for me. If something is not here, it simply
          means I have not experienced it or it wasn't to my taste.
        </motion.p>
      </div>
      <nav className="px-6 pt-6 w-[300px] mx-auto">
        <motion.ul
          className="flex items-center justify-center"
          variants={fadeUp}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
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
