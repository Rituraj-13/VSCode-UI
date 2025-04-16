import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/Editor";
import { EditorProvider } from "./context/EditorContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Editor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <EditorProvider>
      <Router />
      <Toaster />
    </EditorProvider>
  );
}

export default App;
