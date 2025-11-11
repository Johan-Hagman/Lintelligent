// App.tsx (förenklat)
import DarkVeil from "./components/darkveil";
import Post from "./components/Post";

function App() {
  return (
    <div
      className="App"
      style={{
        position: "relative",
        minHeight: "100vh", // gör att containern spänner över viewporten
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <DarkVeil />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Post />
      </div>
    </div>
  );
}

export default App;
