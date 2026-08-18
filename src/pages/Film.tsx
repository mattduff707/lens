import { ReviewList } from "../components/ReviewList";
import { filmConfig } from "../lib/media";

const Film = () => {
  return (
    <div className="space-y-4">
      <ReviewList config={filmConfig} />
    </div>
  );
};

export default Film;
