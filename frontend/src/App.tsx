import DarkVeil from "./components/darkveil";
import Post from "./components/Post";

function App() {
  return (
    <div className="App relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <DarkVeil />
      </div>

      <main aria-label="AI code review workspace" className="relative z-10">
        <Post />
      </main>
    </div>
  );
}

export default App;
