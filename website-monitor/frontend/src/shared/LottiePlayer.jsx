import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

const LottieAnimation = ({ animation, width = "300px", height = "300px" }) => {
  return (
    <DotLottiePlayer
      src={animation}
      loop
      autoplay
      style={{ width, height }}
    ></DotLottiePlayer>
  );
};

export default LottieAnimation;
