import { useState, useEffect, useCallback } from "react";

const JokeTeller = () => {
  const [joke, setJoke] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Fetch available voices for the speech synthesis
    const synth = window.speechSynthesis;
    const fetchVoices = () => {
      setVoices(synth.getVoices());
    };
    fetchVoices();
    synth.onvoiceschanged = fetchVoices;
  }, []);

  const fetchAndSpeakJoke = useCallback(async () => {
    const response = await fetch(
      "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    const data = await response.json();
    const jokeData = data[0];
    setJoke(jokeData);

    const utterance = new SpeechSynthesisUtterance(
      `${jokeData.setup} ${jokeData.punchline} HA HA HA`
    );
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const handleChangeLanguage = (e) => {
    setLanguage(e.target.value);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "j" || event.key === "J") {
        fetchAndSpeakJoke(); // Fetch and speak joke on 'J' press
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
          fetchAndSpeakJoke();
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
  }, [fetchAndSpeakJoke, language]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Joke Telling Robot</h1>
      <button
        onClick={fetchAndSpeakJoke}
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
      <p className="mt-4 text-center">
        {joke && `${joke.setup} - ${joke.punchline}`}
      </p>
    </div>
  );
};

export default JokeTeller;
