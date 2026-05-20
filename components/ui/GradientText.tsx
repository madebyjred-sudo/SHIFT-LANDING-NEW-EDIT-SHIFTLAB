type GradientTextProps = {
  text: string;
  className?: string;
};

export default function GradientText({ text, className = "" }: GradientTextProps) {
  return (
    <p
      className={`bg-[linear-gradient(101.31deg,_#1534DC_3.65%,_#F540FF_85.06%)] bg-clip-text text-transparent ${className}`}
    >
      {text}
    </p>
  );
}
