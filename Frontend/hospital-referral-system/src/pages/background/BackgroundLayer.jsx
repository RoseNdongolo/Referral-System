import "./BackgroundLayer.css";
import bgVideo from "../../assets/BackgroundVideo3.mp4";

const BackgroundLayer = () => {
  return (
    <div className="background-layer" aria-hidden="true">
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={bgVideo} type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundLayer;