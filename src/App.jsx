import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";

import { router } from "@/routes/routes";
import { queryClient } from "@/helpers/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { SocketProvider } from "@/contexts/SocketContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
