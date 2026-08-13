import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useUiStore } from "../../store/ui";
import { LensLogo } from "../LensLogo";
import { RatingStars } from "../RatingStars";
import { VisuallyHidden } from "../VisuallyHidden";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const Header = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);

  return (
    <header className="pb-6">
      <h1>
        <VisuallyHidden>The Lens</VisuallyHidden>
      </h1>
      <div className="flex justify-center w-full pt-12 pb-8">
        <Link to="/" aria-label="The Lens home">
          <LensLogo className="w-[260px] sm:w-[380px] md:w-[500px]" />
        </Link>
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
    </header>
  );
};
