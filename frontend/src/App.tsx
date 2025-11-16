import DarkVeil from "./components/ui/darkveil";
import ReviewWorkspace from "./components/ReviewWorkspace";
import Footer from "./components/footer";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <div className="App relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <DarkVeil />
      </div>

      <AuthProvider>
        <main aria-label="AI code review workspace" className="relative z-10">
          <ReviewWorkspace />
        </main>
      </AuthProvider>
      <Footer />
    </div>
  );
}

export default App;
