import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authService } from "../../lib/supabase";
import { CursiveUnderline } from "../CursiveUnderline";
import { LensLogo } from "../LensLogo";
import { VisuallyHidden } from "../VisuallyHidden";

const linkClassName = "font-corinthia text-5xl text-main";

const activeLinkClassName = "";

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data } = await authService.getCurrentUser();
        setIsAuthenticated(!!data.user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event: string, session: unknown) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className=" ">
      <h1>
        <VisuallyHidden>The Lens</VisuallyHidden>
      </h1>
      <div className="flex justify-center w-full pt-12 pb-8">
        <LensLogo className="w-[500px]" />
      </div>
      <div className="flex justify-center">
        <p className="text-center text-base text-main/70 max-w-[500px]">
          Everything you see here is a piece of work I feel positively about. A
          1 star review is not a negative, it is just means it met the minimum
          threshold of enjoyment for me. If something is not here, it simply
          means I have not experienced it or it wasn't to my taste.
        </p>
      </div>
      <nav className="px-6 pt-6 w-[300px] mx-auto">
        <ul className="flex items-center justify-center">
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
          {/* {!loading && isAuthenticated && (
            <li>
              <Link
                to="/admin-panel"
                className={linkClassName}
                activeProps={{ className: activeLinkClassName }}
              >
                Admin Panel
              </Link>
            </li>
          )} */}
        </ul>
      </nav>
    </div>
  );
};
