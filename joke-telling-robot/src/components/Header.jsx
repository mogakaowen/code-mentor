const Header = () => {
  return (
    <div className="bg-indigo-600 text-white p-4 text-center mb-10">
      <h1 className="text-2xl font-bold mb-2">Joke Telling Bot</h1>
      <p className="text-lg">
        You can either click the button, press{" "}
        <span className="font-bold">&apos;J&apos;</span>, or say{" "}
        <span className="italic">&quot;Tell me a joke&quot;</span> to hear a
        random joke!
      </p>
    </div>
  );
};

export default Header;
