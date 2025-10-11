import './Loader.css';

const Loader = () => {
  const text = "Autoboy";

  return (
    <div className="loader-wrapper">
      {text.split('').map((letter, index) => (
        <span key={index} className="loader-letter" style={{ animationDelay: `${index * 0.1}s` }}>
          {letter}
        </span>
      ))}
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
