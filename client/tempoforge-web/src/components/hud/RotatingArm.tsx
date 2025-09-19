import React from "react";

export type RotatingArmProps = {
  speed?: "fast" | "slow";
  visible?: boolean;
  className?: string;
  armSrc?: string;
  alt?: string;
};

export default function RotatingArm({
  speed = "fast",
  visible = true,
  className = "",
  armSrc = "/assets/arm-large-centered.png",
  alt = "Clock arm",
}: RotatingArmProps) {
  const speedClass = speed === "fast" ? "animate-spin-fast" : "animate-spin-slow";
  return (
    <img
      src={armSrc}
      alt={alt}
      className={[
        "absolute inset-0 w-full h-full select-none pointer-events-none",
        "origin-center",
        speedClass,
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
      style={{ transformOrigin: "50% 50%" }}
    />
  );
}

