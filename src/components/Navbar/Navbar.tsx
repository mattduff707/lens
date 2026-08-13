import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useUiStore } from "../../store/ui";
import { CursiveUnderline } from "../CursiveUnderline";

const linkClassName = "font-corinthia text-5xl text-main";
const activeLinkClassName = "";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const Navbar = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);

  return (
    <nav className="px-0 min-[800px]:px-6 w-full max-w-[208px] min-[800px]:mx-auto sticky top-2 z-20">
      <motion.ul
        className="flex items-center justify-center"
        variants={fadeIn}
        initial={enableAnimations ? "hidden" : false}
        animate="visible"
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <li className="border-r-1 border-main/20 flex justify-end pr-4">
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
        <li className="flex justify-start pl-4">
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
  );
};
