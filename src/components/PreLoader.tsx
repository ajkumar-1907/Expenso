import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Preloader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <DotLottieReact
        src="https://lottie.host/09507ea8-90e2-4a4a-a3ac-c4f1a250abc5/bfjYrGqxsR.lottie"
        loop
        autoplay
        style={{ width: 180, height: 180 }}
      />
    </div>
  );
};

export default Preloader;
