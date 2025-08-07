document.addEventListener("DOMContentLoaded", function () {
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const toggleBtn = document.getElementById("toggleBtn");
  const testBtn = document.getElementById("testBtn");
  const responseArea = document.getElementById("responseArea");

  // Load initial status
  loadHealthStatus();

  // Event listeners
  toggleBtn.addEventListener("click", toggleHealthStatus);
  testBtn.addEventListener("click", testHealthEndpoint);

  async function loadHealthStatus() {
    try {
      const response = await fetch("/api/health-status");
      const data = await response.json();
      updateStatusDisplay(data.isHealthy);
    } catch (error) {
      console.error("Error loading health status:", error);
      updateStatusDisplay(false);
    }
  }

  async function toggleHealthStatus() {
    try {
      toggleBtn.disabled = true;
      toggleBtn.querySelector(".btn-text").textContent = "Toggling...";

      const response = await fetch("/api/toggle-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      updateStatusDisplay(data.status === "healthy");

      // Show success message
      showNotification(`Status changed to ${data.status}`, "success");
    } catch (error) {
      console.error("Error toggling health status:", error);
      showNotification("Failed to toggle status", "error");
    } finally {
      toggleBtn.disabled = false;
      toggleBtn.querySelector(".btn-text").textContent = "Toggle Status";
    }
  }

  async function testHealthEndpoint() {
    try {
      testBtn.disabled = true;
      testBtn.textContent = "Testing...";
      responseArea.innerHTML =
        '<p class="response-placeholder">Testing endpoint...</p>';

      const response = await fetch("/health");
      const data = await response.json();

      const statusClass = response.ok ? "response-success" : "response-error";
      const statusText = response.ok ? "✅ Success (200)" : "❌ Error (500)";

      responseArea.innerHTML = `
                <div class="${statusClass}">
                    <strong>${statusText}</strong><br>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
    } catch (error) {
      console.error("Error testing health endpoint:", error);
      responseArea.innerHTML = `
                <div class="response-error">
                    <strong>❌ Network Error</strong><br>
                    <pre>${error.message}</pre>
                </div>
            `;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = "Test Endpoint";
    }
  }

  function updateStatusDisplay(isHealthy) {
    if (isHealthy) {
      statusDot.className = "status-dot healthy";
      statusText.className = "status-text healthy";
      statusText.textContent = "Healthy (200)";
    } else {
      statusDot.className = "status-dot unhealthy";
      statusText.className = "status-text unhealthy";
      statusText.textContent = "Unhealthy (500)";
    }
  }

  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${
              type === "success"
                ? "background: #48bb78;"
                : "background: #f56565;"
            }
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Auto-refresh status every 5 seconds
  setInterval(loadHealthStatus, 5000);
});
