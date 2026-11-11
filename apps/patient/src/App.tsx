import { RouterProvider } from "react-router-dom";

//import i18n from "@healthcare-platform/translator";
import { appRouter } from "./routes/appRoutes";

import "./App.css";
// i18n.use(initReactI18next).init({
//   resources: {
//     en: {
//       translation: {
//         welcome: "Welcome",
//       },
//     },
//   },
//   lng: "en",
//   fallbackLng: "en",
//   interpolation: {
//     escapeValue: false,
//   },
// });
export default function App() {
  return <RouterProvider router={appRouter} />;
}
