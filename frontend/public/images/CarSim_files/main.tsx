import.meta.env = {"BASE_URL":"/","MODE":"development","DEV":true,"PROD":false,"SSR":false};import { jsxDEV } from "/@id/__x00__react/jsx-dev-runtime";
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=34c18d84"; const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];
import { useGLTF } from "/node_modules/.vite/deps/@react-three_drei.js?v=5ee563a3";
import "/node_modules/inter-ui/inter.css";
import "/src/style.css";
import { App } from "/src/App.tsx";
useGLTF.preload("/models/cars/ae86Rotated.glb");
useGLTF.preload("/models/cars/tank.glb");
useGLTF.preload("/models/cars/camaro2017.glb");
useGLTF.preload("/models/city_rtx.glb");
useGLTF.preload("/models/city_time_square.glb");
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "/Users/uri/Documents/Projects/CarHacking/frontend/src/main.tsx",
  lineNumber: 15,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBY29EO0FBZHBELFNBQVNBLGtCQUFrQjtBQUMzQixTQUFTQyxlQUFlO0FBQ3hCLE9BQU87QUFDUCxPQUFPO0FBQ1AsU0FBU0MsV0FBVztBQUdwQkQsUUFBUUUsUUFBUSw4QkFBOEI7QUFDOUNGLFFBQVFFLFFBQVEsdUJBQXVCO0FBQ3ZDRixRQUFRRSxRQUFRLDZCQUE2QjtBQUM3Q0YsUUFBUUUsUUFBUSxzQkFBc0I7QUFDdENGLFFBQVFFLFFBQVEsOEJBQThCO0FBRzlDSCxXQUFXSSxTQUFTQyxlQUFlLE1BQU0sQ0FBRSxFQUFFQyxPQUFPLHVCQUFDLFNBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFJLENBQUc7QUFHM0QsSUFBSSxtQkFBbUJDLFdBQVc7QUFDaENDLFNBQU9DLGlCQUFpQixRQUFRLE1BQU07QUFFcEMsUUFBSSxtQkFBbUJGLGFBQWFHLFlBQVlDLElBQUlDLE1BQU07QUFDeERMLGdCQUFVTSxjQUFjQyxTQUFTLG9CQUFvQixFQUNsREMsS0FBTUMsa0JBQWlCO0FBQ3RCQyxnQkFBUUMsSUFBSSwrQkFBK0JGLFlBQVk7QUFBQSxNQUN6RCxDQUFDLEVBQ0FHLE1BQU9DLHVCQUFzQjtBQUM1QkgsZ0JBQVFJLE1BQU0sd0NBQXdDRCxpQkFBaUI7QUFBQSxNQUN6RSxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBRUYsQ0FBQztBQUNIIiwibmFtZXMiOlsiY3JlYXRlUm9vdCIsInVzZUdMVEYiLCJBcHAiLCJwcmVsb2FkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJlbmRlciIsIm5hdmlnYXRvciIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbXBvcnQiLCJlbnYiLCJQUk9EIiwic2VydmljZVdvcmtlciIsInJlZ2lzdGVyIiwidGhlbiIsInJlZ2lzdHJhdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJjYXRjaCIsInJlZ2lzdHJhdGlvbkVycm9yIiwiZXJyb3IiXSwic291cmNlcyI6WyJtYWluLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgeyB1c2VHTFRGIH0gZnJvbSAnQHJlYWN0LXRocmVlL2RyZWknO1xuaW1wb3J0ICdpbnRlci11aSc7XG5pbXBvcnQgJy4vc3R5bGUuY3NzJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vQXBwJztcblxuLy8gUHJlbG9hZCAzRCBtb2RlbHNcbnVzZUdMVEYucHJlbG9hZCgnL21vZGVscy9jYXJzL2FlODZSb3RhdGVkLmdsYicpO1xudXNlR0xURi5wcmVsb2FkKCcvbW9kZWxzL2NhcnMvdGFuay5nbGInKTtcbnVzZUdMVEYucHJlbG9hZCgnL21vZGVscy9jYXJzL2NhbWFybzIwMTcuZ2xiJyk7XG51c2VHTFRGLnByZWxvYWQoJy9tb2RlbHMvY2l0eV9ydHguZ2xiJyk7XG51c2VHTFRGLnByZWxvYWQoJy9tb2RlbHMvY2l0eV90aW1lX3NxdWFyZS5nbGInKTtcblxuLy8gUmVuZGVyIHRoZSBSZWFjdCBhcHBcbmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSEpLnJlbmRlcig8QXBwIC8+KTtcblxuLy8gUmVnaXN0ZXIgdGhlIHNlcnZpY2Ugd29ya2VyXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblxuICAgIGlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yICYmIGltcG9ydC5tZXRhLmVudi5QUk9EKSB7XG4gICAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2Utd29ya2VyLmpzJylcbiAgICAgICAgLnRoZW4oKHJlZ2lzdHJhdGlvbikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciByZWdpc3RlcmVkOiAnLCByZWdpc3RyYXRpb24pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKHJlZ2lzdHJhdGlvbkVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignU2VydmljZSBXb3JrZXIgcmVnaXN0cmF0aW9uIGZhaWxlZDogJywgcmVnaXN0cmF0aW9uRXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG59Il0sImZpbGUiOiIvVXNlcnMvdXJpL0RvY3VtZW50cy9Qcm9qZWN0cy9DYXJIYWNraW5nL2Zyb250ZW5kL3NyYy9tYWluLnRzeCJ9