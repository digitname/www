// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful');
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(err => 
            console.log('ServiceWorker update check failed:', err)
          );
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Show offline status if needed
window.addEventListener('online', () => {
  // You could add a notification that the app is back online
  console.log('Application is online');
});

window.addEventListener('offline', () => {
  // You could add a notification that the app is offline
  console.log('Application is offline - using cached content');
});
