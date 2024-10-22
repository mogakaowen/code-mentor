import { useState, useEffect, useCallback } from "react";

const JokeTeller = () => {
  const [joke, setJoke] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const fetchJoke = async () => {
      const response = await fetch("https://api.jokes.one/jod"); // You can change this API as needed
      const data = await response.json();
      setJoke(data.contents.jokes[0].joke.text);
    };

    fetchJoke();

    // Speech synthesis
    const synth = window.speechSynthesis;
    const fetchVoices = () => {
      setVoices(synth.getVoices());
    };
    fetchVoices();
    synth.onvoiceschanged = fetchVoices;
  }, []);

  const speakJoke = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(joke);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }, [joke, language]);

  const handleChangeLanguage = (e) => {
    setLanguage(e.target.value);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "j" || event.key === "J") {
        speakJoke();
      }
    };

    const handleSpeechRecognition = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.toLowerCase() === "tell me a joke") {
          speakJoke();
        }
      };

      recognition.start();
    };

    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    // Call the speech recognition function when the component mounts
    handleSpeechRecognition();

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [speakJoke, language]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Joke Telling Robot</h1>
      <button
        onClick={speakJoke}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        Tell Me A Joke
      </button>
      <select
        value={language}
        onChange={handleChangeLanguage}
        className="border p-2 rounded"
      >
        {voices.map((voice, index) => (
          <option key={index} value={voice.lang}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
      <p className="mt-4 text-lg">{joke}</p>
    </div>
  );
};

export default JokeTeller;
