import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin-login";
import Documents from "@/pages/documents";
import Home from "@/pages/home";
import Industries from "@/pages/industries";
import Legal from "@/pages/legal";
import Products from "@/pages/products";
import Quality from "@/pages/quality";
import PartNumberGenerator from "@/pages/part-number-generator";
import RequestAccess from "@/pages/request-access";
import RequestQuote from "@/pages/request-quote";
import Stock from "@/pages/stock";
import OrderList from "@/pages/order-list";
import SpaAdmin from "@/pages/spa-admin";
import SunnyChatButton from "@/components/SunnyChatButton";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/documents" component={Documents} />
      <Route path="/industries" component={Industries} />
      <Route path="/legal" component={Legal} />
      <Route path="/products" component={Products} />
      <Route path="/part-number-generator" component={PartNumberGenerator} />
      <Route path="/quality" component={Quality} />
      <Route path="/request-access" component={RequestAccess} />
      <Route path="/request-quote" component={RequestQuote} />
      <Route path="/stock" component={Stock} />
      <Route path="/order-list" component={OrderList} />
      <Route path="/admin.sunny.j0hn" component={SpaAdmin} />
      <Route path="/spa-admin" component={SpaAdmin} />
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
