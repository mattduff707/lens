import { ReviewList } from "../components/ReviewList";
import { musicConfig } from "../lib/media";

const Music = () => {
  return (
    <div className="space-y-4">
      <ReviewList config={musicConfig} />
    </div>
  );
};

export default Music;
