import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Industries from "@/pages/industries";
import Products from "@/pages/products";
import Quality from "@/pages/quality";
import RequestAccess from "@/pages/request-access";
import RequestQuote from "@/pages/request-quote";
import TelegramChatButton from "@/components/TelegramChatButton";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/industries" component={Industries} />
      <Route path="/products" component={Products} />
      <Route path="/quality" component={Quality} />
      <Route path="/request-access" component={RequestAccess} />
      <Route path="/request-quote" component={RequestQuote} />
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
        <TelegramChatButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
