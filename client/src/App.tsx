import "./App.css";
import { MantineProvider } from "@mantine/core";
import { Routes, Route, Outlet, Link, Navigate } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClientProvider, QueryClient } from "react-query";
import AppHeader from "./components/AppHeader";
import SignUp from "./pages/SignUp";
import DefaultPage from "./pages/DefaultPage";
import AuthenticatePage from "./pages/AuthenticatePage";
import AdminPage from "./pages/AdminPage";
import DocPage from "./pages/DocPage";

const queryClient = new QueryClient();

const defaultComponent = (): JSX.Element => <h1></h1>;

function App() {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colors: {
          "ocean-blue": [
            "#95dee8",
            "#7AD1DD",
            "#5FCCDB",
            "#44CADC",
            "#2AC9DE",
            "#1AC2D9",
            "#11B7CD",
            "#09ADC3",
            "#0E99AC",
            "#128797",
          ],
          "bright-pink": [
            "#F0BBDD",
            "#ED9BCF",
            "#EC7CC3",
            "#ED5DB8",
            "#F13EAF",
            "#F71FA7",
            "#FF00A1",
            "#E00890",
            "#C50E82",
            "#AD1374",
          ],
        },
        primaryColor: "ocean-blue",
        fontFamily: "'Courier New', monospace;",
        fontFamilyMonospace: "Monaco, Courier, monospace",
      }}
    >
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
          <AppHeader />
          <Routes>
            <Route index path="/auth" element={<AuthenticatePage />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </QueryClientProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
