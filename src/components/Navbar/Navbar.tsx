import { Link } from "@tanstack/react-router";
import { CursiveUnderline } from "../CursiveUnderline";

const linkClassName = "font-corinthia text-5xl text-main";
const activeLinkClassName = "";

export const Navbar = () => {
  return (
    <nav className="px-0 min-[800px]:px-6 w-full max-w-[208px] min-[800px]:mx-auto sticky top-2 z-20">
      <ul className="flex items-center justify-center">
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
      </ul>
    </nav>
  );
};
