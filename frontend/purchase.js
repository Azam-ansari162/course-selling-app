async function loadPurchasedCourses() {
    const token = localStorage.getItem("userToken");
    const container = document.querySelector(".purchased-courses");

    if (!token) {
        alert("Please log in to view your purchases.");
        window.location.href = "loginPage.html?role=user";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/users/purchases", {
            method: "GET",
            headers: {
                token: token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.msg || "Failed to load purchases");
            return;
        }

        if (!data.courseData || data.courseData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No courses purchased yet</h3>
                    <p>Explore our catalog and enroll in your first course to start learning.</p>
                    <a href="index.html">
                        <button type="button">Browse Courses</button>
                    </a>
                </div>
            `;
            return;
        }

        let html = "";
        data.courseData.forEach((course) => {
            html += `
                <div class="course">
                    <div>
                        <span class="course-badge purchased-badge">Enrolled</span>
                        <h3>${course.course}</h3>
                        <p>${course.description}</p>
                    </div>
                    <div class="course-footer">
                        <span class="course-price">₹${course.price}</span>
                        <button class="enrolled-btn" disabled>✓ Purchased</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (err) {
        console.error("Purchases fetch error: ", err);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading your purchases</h3>
                <p>Please check your server connection and try refreshing the page.</p>
            </div>
        `;
    }
}

loadPurchasedCourses();