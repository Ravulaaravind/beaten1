// Test script to verify frontend-backend integration
// This can be run in the browser console

const testBackendConnection = async () => {
  console.log("🧪 Testing Backend Connection...");

  try {
    // Test health check
    const healthResponse = await fetch("http://localhost:8000/api/health");
    const healthData = await healthResponse.json();
    console.log("✅ Health Check:", healthData);

    // Test admin login
    const loginResponse = await fetch("http://localhost:8000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@beaten.com",
        password: "Admin123!",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("✅ Admin Login:", loginData);

    if (loginData.success && loginData.data.token) {
      // Test protected route
      const profileResponse = await fetch(
        "http://localhost:8000/api/admin/profile",
        {
          headers: {
            Authorization: `Bearer ${loginData.data.token}`,
          },
        }
      );

      const profileData = await profileResponse.json();
      console.log("✅ Admin Profile:", profileData);
    }

    console.log(
      "🎉 All tests passed! Frontend-Backend integration is working."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testBackendConnection();
