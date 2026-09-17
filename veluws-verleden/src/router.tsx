import { createBrowserRouter } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RomanCampPage from "./pages/RomanCampPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/romeinen",
    element: <RomanCampPage />
  }
]);