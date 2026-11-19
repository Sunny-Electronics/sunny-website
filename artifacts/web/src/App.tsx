import { lazy, Suspense } from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SunnyChatButton from "@/components/SunnyChatButton";

const Documents = lazy(() => import("@/pages/documents"));
const Industries = lazy(() => import("@/pages/industries"));
const Legal = lazy(() => import("@/pages/legal"));
const Products = lazy(() => import("@/pages/products"));
const Quality = lazy(() => import("@/pages/quality"));
const PartNumberGenerator = lazy(() => import("@/pages/part-number-generator"));
const Quote = lazy(() => import("@/pages/quote"));
const QuoteType = lazy(() => import("@/pages/quote-type"));
const Stock = lazy(() => import("@/pages/stock"));

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
          <Suspense fallback={<p className="p-6" role="status">Loading page...</p>}>
            <Router />
          </Suspense>
        </WouterRouter>
        <Toaster />
        <SunnyChatButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
