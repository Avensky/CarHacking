import.meta.env = {"BASE_URL":"/","MODE":"development","DEV":true,"PROD":false,"SSR":false};import { jsxDEV } from "/@id/__x00__react/jsx-dev-runtime";
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=cfce2cc9"; const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];
import { useGLTF } from "/node_modules/.vite/deps/@react-three_drei.js?v=cfce2cc9";
import "/node_modules/inter-ui/inter.css";
import "/src/styles.css";
import { App } from "/src/App.tsx";
useGLTF.preload("/models/ccity_building_set_1.glb");
useGLTF.preload("/models/track-draco.glb");
useGLTF.preload("/models/chassis-draco.glb");
useGLTF.preload("/models/wheel-draco.glb");
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "/Users/uri/Documents/Projects/CarHacking/frontend/src/main.tsx",
  lineNumber: 14,
  columnNumber: 53
}, this));
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log("Service Worker registered: ", registration);
      }).catch((registrationError) => {
        console.error("Service Worker registration failed: ", registrationError);
      });
    }
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBYW9EO0FBYnBELFNBQVNBLGtCQUFrQjtBQUMzQixTQUFTQyxlQUFlO0FBQ3hCLE9BQU87QUFDUCxPQUFPO0FBQ1AsU0FBU0MsV0FBVztBQUdwQkQsUUFBUUUsUUFBUSxrQ0FBa0M7QUFDbERGLFFBQVFFLFFBQVEseUJBQXlCO0FBQ3pDRixRQUFRRSxRQUFRLDJCQUEyQjtBQUMzQ0YsUUFBUUUsUUFBUSx5QkFBeUI7QUFHekNILFdBQVdJLFNBQVNDLGVBQWUsTUFBTSxDQUFFLEVBQUVDLE9BQU8sdUJBQUMsU0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQUksQ0FBRztBQUczRCxJQUFJLG1CQUFtQkMsV0FBVztBQUNoQ0MsU0FBT0MsaUJBQWlCLFFBQVEsTUFBTTtBQUVwQyxRQUFJLG1CQUFtQkYsYUFBYUcsWUFBWUMsSUFBSUMsTUFBTTtBQUN4REwsZ0JBQVVNLGNBQWNDLFNBQVMsb0JBQW9CLEVBQ2xEQyxLQUFNQyxrQkFBaUI7QUFDdEJDLGdCQUFRQyxJQUFJLCtCQUErQkYsWUFBWTtBQUFBLE1BQ3pELENBQUMsRUFDQUcsTUFBT0MsdUJBQXNCO0FBQzVCSCxnQkFBUUksTUFBTSx3Q0FBd0NELGlCQUFpQjtBQUFBLE1BQ3pFLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFFRixDQUFDO0FBQ0giLCJuYW1lcyI6WyJjcmVhdGVSb290IiwidXNlR0xURiIsIkFwcCIsInByZWxvYWQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIiwibmF2aWdhdG9yIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImltcG9ydCIsImVudiIsIlBST0QiLCJzZXJ2aWNlV29ya2VyIiwicmVnaXN0ZXIiLCJ0aGVuIiwicmVnaXN0cmF0aW9uIiwiY29uc29sZSIsImxvZyIsImNhdGNoIiwicmVnaXN0cmF0aW9uRXJyb3IiLCJlcnJvciJdLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tICdyZWFjdC1kb20vY2xpZW50JztcbmltcG9ydCB7IHVzZUdMVEYgfSBmcm9tICdAcmVhY3QtdGhyZWUvZHJlaSc7XG5pbXBvcnQgJ2ludGVyLXVpJztcbmltcG9ydCAnLi9zdHlsZXMuY3NzJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vQXBwJztcblxuLy8gUHJlbG9hZCAzRCBtb2RlbHNcbnVzZUdMVEYucHJlbG9hZCgnL21vZGVscy9jY2l0eV9idWlsZGluZ19zZXRfMS5nbGInKTtcbnVzZUdMVEYucHJlbG9hZCgnL21vZGVscy90cmFjay1kcmFjby5nbGInKTtcbnVzZUdMVEYucHJlbG9hZCgnL21vZGVscy9jaGFzc2lzLWRyYWNvLmdsYicpO1xudXNlR0xURi5wcmVsb2FkKCcvbW9kZWxzL3doZWVsLWRyYWNvLmdsYicpO1xuXG4vLyBSZW5kZXIgdGhlIFJlYWN0IGFwcFxuY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpISkucmVuZGVyKDxBcHAgLz4pO1xuXG4vLyBSZWdpc3RlciB0aGUgc2VydmljZSB3b3JrZXJcbmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuXG4gICAgaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IgJiYgaW1wb3J0Lm1ldGEuZW52LlBST0QpIHtcbiAgICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcvc2VydmljZS13b3JrZXIuanMnKVxuICAgICAgICAudGhlbigocmVnaXN0cmF0aW9uKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIHJlZ2lzdGVyZWQ6ICcsIHJlZ2lzdHJhdGlvbik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgocmVnaXN0cmF0aW9uRXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdTZXJ2aWNlIFdvcmtlciByZWdpc3RyYXRpb24gZmFpbGVkOiAnLCByZWdpc3RyYXRpb25FcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbn0iXSwiZmlsZSI6Ii9Vc2Vycy91cmkvRG9jdW1lbnRzL1Byb2plY3RzL0NhckhhY2tpbmcvZnJvbnRlbmQvc3JjL21haW4udHN4In0=