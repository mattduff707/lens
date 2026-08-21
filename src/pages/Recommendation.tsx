import { useNavigate, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { CursiveUnderline } from "../components/CursiveUnderline";
import { ArrowLeftIcon } from "../components/icons";
import { useUiStore } from "../store/ui";
import { cn } from "../util/style";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const labelClassName =
  "block text-[0.625rem] uppercase tracking-[0.2em] text-main/55 mb-1";

const controlClassName =
  "w-full bg-transparent py-2 text-base text-main placeholder-main/40 focus:outline-none";

type UnderlineFieldProps = {
  id: string;
  label: string;
  emphasized: boolean;
  children: ReactNode;
};

const UnderlineField = ({
  id,
  label,
  emphasized,
  children,
}: UnderlineFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        {children}
        <CursiveUnderline
          animate={false}
          stroke="search"
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-[6px] h-3 w-full transition-colors",
            emphasized ? "text-main" : "text-main/45"
          )}
        />
      </div>
    </div>
  );
};

const Recommendation = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatYouLike, setWhatYouLike] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const goBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({ to: "/" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-md px-4 pb-16 pt-8"
      variants={fadeUp}
      initial={enableAnimations ? "hidden" : false}
      animate="visible"
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={goBack}
        className="mb-10 inline-flex items-center gap-2 rounded-sm border border-main/30 bg-secondary px-3 py-2 text-main/55 shadow-subtle transition-colors hover:border-main/60 hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-[0.625rem] uppercase tracking-[0.2em]">Back</span>
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <UnderlineField
          id="recommendation-name"
          label="Name"
          emphasized={focusedField === "name" || name.length > 0}
        >
          <input
            id="recommendation-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            autoComplete="name"
            className={controlClassName}
          />
        </UnderlineField>

        <UnderlineField
          id="recommendation-email"
          label="Email"
          emphasized={focusedField === "email" || email.length > 0}
        >
          <input
            id="recommendation-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            autoComplete="email"
            className={controlClassName}
          />
        </UnderlineField>

        <UnderlineField
          id="recommendation-what-you-like"
          label="What you like"
          emphasized={focusedField === "whatYouLike" || whatYouLike.length > 0}
        >
          <textarea
            id="recommendation-what-you-like"
            value={whatYouLike}
            onChange={(e) => setWhatYouLike(e.target.value)}
            onFocus={() => setFocusedField("whatYouLike")}
            onBlur={() => setFocusedField(null)}
            rows={5}
            className={cn(controlClassName, "resize-none")}
          />
        </UnderlineField>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
            onFocus={() => setIsSubmitHovered(true)}
            onBlur={() => setIsSubmitHovered(false)}
            className="group rounded-sm border border-main/30 bg-secondary px-6 min-[600px]:px-7 pt-2.5 pb-3 text-main shadow-subtle transition-colors hover:border-main/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
          >
            <span className="relative inline-block font-corinthia text-4xl min-[600px]:text-5xl leading-[0.8] text-main">
              Submit
              {isSubmitHovered && (
                <CursiveUnderline className="absolute inset-x-0 -bottom-1.5 h-3 w-full" />
              )}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Recommendation;
