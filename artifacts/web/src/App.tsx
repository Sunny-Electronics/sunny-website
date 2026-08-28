import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Documents from "@/pages/documents";
import Home from "@/pages/home";
import Industries from "@/pages/industries";
import Legal from "@/pages/legal";
import Products from "@/pages/products";
import Quality from "@/pages/quality";
import PartNumberGenerator from "@/pages/part-number-generator";
import Quote from "@/pages/quote";
import QuoteType from "@/pages/quote-type";
import Stock from "@/pages/stock";
import SunnyChatButton from "@/components/SunnyChatButton";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/documents" component={Documents} />
      <Route path="/industries" component={Industries} />
      <Route path="/legal" component={Legal} />
      <Route path="/products" component={Products} />
      <Route path="/part-number-generator" component={PartNumberGenerator} />
      <Route path="/quality" component={Quality} />
      <Route path="/quote" component={Quote} />
      <Route path="/quote/:typeId">
        {(params) => <QuoteType typeId={params.typeId} />}
      </Route>
      <Route path="/request-quote">
        <Redirect to="/quote" replace />
      </Route>
      <Route path="/stock" component={Stock} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SunnyChatButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
